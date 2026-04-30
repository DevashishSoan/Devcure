from typing import TypedDict, List, Optional, Set, Dict, Any
from dataclasses import dataclass, field
from langgraph.graph import StateGraph, END
from sandbox.manager import sandbox_manager
from core.config import settings
from core.database import get_supabase
from core.ai import unified_ai_call
from core.safety import validate_patch_safety, parse_agent_response
from core.github_client import open_fix_pr
import httpx
import re
import json
import time
import os
from pathlib import Path

class AgentState(TypedDict):
    run_id: str
    user_id: str                  
    sandbox_id: str
    repo_path: str
    repo_full_name: str   
    branch: str           
    files: List[str]
    failures: List[str]
    baseline_failures: List[str]
    target_test_names: List[str]
    diagnosis: Optional[str]
    repair_diff: Optional[str]
    pr_url: Optional[str]
    iteration: int
    max_iterations: int
    status: str
    target_file: Optional[str]
    run_start_time: float
    setup_time_seconds: float
    agent_start_time: float
    trajectory: List[Dict[str, Any]]
    framework_detected: Optional[str]
    agent_personality: str
    auto_repair_threshold: float
    ai_provider: str

@dataclass
class VerificationResult:
    exit_code: int
    total_tests: int = 0
    passed: int = 0
    failed: int = 0
    failed_test_names: List[str] = field(default_factory=list)
    target_tests_fixed: bool = False
    regressions_introduced: List[str] = field(default_factory=list)
    output: str = ""

def detect_test_framework(sandbox_path: str) -> str:
    """Detects the test framework used in the repository."""
    root = Path(sandbox_path)
    
    # Node.js
    if (root / "package.json").exists():
        try:
            pkg = json.loads((root / "package.json").read_text())
            deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
            if "vitest" in deps: return "vitest"
            if "jest" in deps or "@jest/core" in deps: return "jest"
        except: pass
    
    # Python
    if (root / "requirements.txt").exists() or (root / "pyproject.toml").exists():
        return "pytest"
    
    return None

FRAMEWORK_COMMANDS = {
    "pytest": "pytest -v --tb=short --no-header",
    "jest":   "npx jest --no-coverage --verbose",
    "vitest": "npx vitest run --reporter=verbose",
}

class TestOutputParser:
    def parse(self, output: str, framework: str) -> VerificationResult:
        parser = self._get_parser(framework)
        return parser(output)
    
    def _get_parser(self, framework: str):
        parsers = {
            "pytest": self._parse_pytest,
            # "jest": self._parse_jest, # Placeholder for future
            # "vitest": self._parse_vitest,
        }
        return parsers.get(framework, self._parse_generic)
    
    def _parse_generic(self, output: str) -> VerificationResult:
        # Simple generic regex - include ':' for pytest/test names
        failed_tests = re.findall(r'FAILED\s+([\w\.\/:]+)', output)
        passed = len(re.findall(r'PASSED|PASS|\bOK\b', output, re.I))
        failed = len(failed_tests) or len(re.findall(r'FAIL|ERROR', output, re.I))
        
        return VerificationResult(
            exit_code=0 if failed == 0 else 1,
            passed=passed,
            failed=failed,
            failed_test_names=failed_tests,
            output=output
        )

    def _parse_pytest(self, output: str) -> VerificationResult:
        # Extract failed test names: e.g. "FAILED tests/test_app.py::test_fail"
        # Removed ^ to be more robust across different line ending/padding scenarios
        failed_tests = [t.strip() for t in re.findall(r'FAILED\s+([\w\.\/:]+)', output)]
        
        # Summary line: "1 failed, 2 passed in 0.12s"
        summary_match = re.search(r'(\d+)\s+failed', output)
        failed_count = int(summary_match.group(1)) if summary_match else len(failed_tests)
        
        passed_match = re.search(r'(\d+)\s+passed', output)
        passed_count = int(passed_match.group(1)) if passed_match else 0
        
        return VerificationResult(
            exit_code=0 if failed_count == 0 else 1,
            total_tests=passed_count + failed_count,
            passed=passed_count,
            failed=failed_count,
            failed_test_names=list(set(failed_tests)), # Deduplicate
            output=output
        )

MAX_OUTPUT_CHARS = 8000
def truncate_output(output: str) -> str:
    if len(output) <= MAX_OUTPUT_CHARS:
        return output
    half = MAX_OUTPUT_CHARS // 2
    return (
        output[:half]
        + f"\n\n... [{len(output) - MAX_OUTPUT_CHARS} chars truncated] ...\n\n"
        + output[-half:]
    )

MAX_TRAJECTORY_EVENTS = 50
MAX_EVENT_LOG_CHARS = 2000

def append_trajectory_event(trajectory: List[Dict[str, Any]], event: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Appends an event to the trajectory, enforcing limits."""
    if "log" in event and event["log"]:
        event["log"] = event["log"][:MAX_EVENT_LOG_CHARS]
    trajectory.append({**event, "timestamp": time.time()})
    return trajectory[-MAX_TRAJECTORY_EVENTS:]

def persist_event(state: AgentState, status: str, log: Optional[str] = None, data: Optional[Dict] = None) -> List[Dict[str, Any]]:
    """Performs a surgical direct write to Supabase and returns the updated trajectory."""
    supabase = get_supabase()
    
    event = {"event": status, "log": log}
    if data: event.update(data)
    
    # Crucial: Use the latest trajectory from state to avoid history loss
    current_trajectory = list(state.get("trajectory", []))
    new_trajectory = append_trajectory_event(current_trajectory, event)
    
    if not supabase: 
        return new_trajectory
    
    payload = {
        "status": status,
        "trajectory": new_trajectory,
        "updated_at": "now()"
    }
    
    # Populate error_classes if we have failures to classify
    if state.get("failures") and not state.get("error_classes"):
        failures_text = "\n".join(state["failures"])
        detected_classes = []
        if "timeout" in failures_text.lower(): detected_classes.append("Network Timeout")
        if "connection" in failures_text.lower(): detected_classes.append("Connection Refused")
        if "assertionerror" in failures_text.lower(): detected_classes.append("Logic Regression")
        if "syntaxerror" in failures_text.lower(): detected_classes.append("Syntax Error")
        if "401" in failures_text or "unauthorized" in failures_text.lower(): detected_classes.append("Auth Failure")
        
        if detected_classes:
            payload["error_classes"] = list(set(detected_classes))
    
    # Promote top-level fields
    if state.get("baseline_failures"):
        payload["baseline_failures"] = list(state["baseline_failures"])
    if state.get("framework_detected"):
        payload["framework_detected"] = state["framework_detected"]
    
    if data:
        for field in ["regressions_found", "mttr_seconds", "agent_time_seconds", "iterations", "pr_url", "confidence_score"]:
            if field in data:
                payload[field] = data[field]
    
    try:
        supabase.table("runs").update(payload).eq("id", state["run_id"]).execute()
    except Exception as e:
        print(f"Failed to persist event to Supabase: {e}")
        
    return new_trajectory

async def baseline_node(state: AgentState):
    """
    Runs tests on unmodified code to capture pre-existing failures.
    """
    print(f"[{state['run_id']}] Capturing baseline failures...")

    sandbox_path = sandbox_manager.get_path(state['sandbox_id'])
    if not sandbox_path or not os.path.exists(sandbox_path):
        traj = persist_event(state, "escalated", log="Failed to initialize sandbox (clone failure).")
        return {"status": "escalated", "diagnosis": "ESCALATE: Git clone failure (wrong token, private repo, or repo deleted).", "trajectory": traj}

    framework = detect_test_framework(sandbox_path)
    
    # --- Persist framework immediately ---
    try:
        supabase = get_supabase()
        if supabase:
            supabase.table("runs").update({
                "framework_detected": framework,
                "updated_at": "now()"
            }).eq("id", state["run_id"]).execute()
    except Exception as e:
        print(f"[{state['run_id']}] Could not persist framework early: {e}")

    # --- Task: Repo Complexity Guard ---
    # Scan file count to prevent hanging on massive repos (e.g. facebook/react)
    file_count = 0
    for root, dirs, files in os.walk(sandbox_path):
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__', 'venv', '.venv']]
        file_count += len(files)
        if file_count > 5000:
            msg = f"Repository is too large ({file_count}+ files). Escalating to prevent infrastructure timeout."
            traj = persist_event({**state, "framework_detected": framework}, "escalated", log=msg)
            return {"status": "escalated", "diagnosis": f"ESCALATE: {msg}", "trajectory": traj, "framework_detected": framework}
    
    # --- Task 3.4: Dependency Guard ---
    deps_ok = sandbox_manager.install_dependencies(state['sandbox_id'])
    if not deps_ok:
        error_msg = "Dependency installation failed (Timeout or Conflict). Attempting Static Analysis Fallback..."
        # We don't escalate yet; we set status to 'degraded' to allow the agent to try without full environment
        traj = persist_event({**state, "framework_detected": framework}, "running", log=error_msg)
        return {
            "status": "degraded", 
            "diagnosis": f"ENV_FAILURE: {error_msg}", 
            "trajectory": traj, 
            "framework_detected": framework,
            "failures": ["CRITICAL: Could not run baseline tests due to environment failure. Proceeding with surgical static analysis."]
        }
    # --- End Guard ---

    command = FRAMEWORK_COMMANDS.get(framework, "pytest -v")
    
    # --- Task 4.1: Repository Context Discovery ---
    # We scan the repo to give the AI visibility into the codebase structure
    # Use a cross-platform approach: Python's os.walk
    repo_files = []
    try:
        for root, dirs, files in os.walk(sandbox_path):
            # Prune directories
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__', 'venv', '.venv']]
            
            # Calculate depth
            rel_root = os.path.relpath(root, sandbox_path)
            depth = 0 if rel_root == "." else len(rel_root.split(os.sep))
            if depth >= 3:
                dirs[:] = [] # stop recursing
            
            for f in files:
                if f.startswith('.'): continue
                rel_f = os.path.join(rel_root, f) if rel_root != "." else f
                repo_files.append(rel_f.replace(os.sep, "/"))
    except Exception as e:
        print(f"Error during file discovery: {e}")
    # --- End Discovery ---

    output = sandbox_manager.run_command(state['sandbox_id'], command)
    parser = TestOutputParser()
    result = parser.parse(output, framework)
    truncated_output = truncate_output(result.output)
    
    print(f"[{state['run_id']}] Indexed files: {repo_files}")
    
    if len(result.failed_test_names) == 0:
        msg = f"No baseline failures detected in {framework}. Codebase appears healthy."
        new_state = {
            "baseline_failures": [],
            "target_test_names": [],
            "failures": [truncated_output],
            "files": repo_files,
            "framework_detected": framework,
            "status": "completed"
        }
        new_state["trajectory"] = persist_event({**state, **new_state}, "completed", log=msg)
        print(f"[{state['run_id']}] {msg}")
        return new_state

    new_state = {
        "baseline_failures": list(result.failed_test_names),
        "target_test_names": list(result.failed_test_names),
        "failures": [truncated_output],
        "files": repo_files,
        "framework_detected": framework,
        "status": "baseline_captured"
    }
    
    # Merge for persistence and update trajectory in state
    merged = {**state, **new_state}
    new_state["trajectory"] = persist_event(merged, "baseline_captured", log=f"Detected {framework}. Found {len(result.failed_test_names)} baseline failures. Indexed {len(repo_files)} codebase files.")
    
    print(f"[{state['run_id']}] Baseline captured: {len(result.failed_test_names)} failures. Codebase indexed.")
    return new_state

async def diagnosis_node(state: AgentState):
    """
    Analyzes test failures and repository structure to identify root cause and target file.
    """
    print(f"[{state['run_id']}] Performing intelligent diagnosis and file targeting...")
    
    failures = "\n".join(state.get("failures", []))
    repo_structure = "\n".join(state.get("files", []))
    
    system_instruction = (
        f"You are a Principal AI Debugging Agent with a '{state.get('agent_personality', 'Surgical')}' persona. "
        "Your task is to analyze test failures and identify the root cause. "
        "You must output your response in the following format:\n"
        "DIAGNOSIS: <your technical analysis>\n"
        "TARGET_FILE: <path/to/file_to_fix.py>\n"
        "REQUIRED_FILES: <path/a.py, path/b.py> (Optional: list other files you need to read for context)\n"
    )
    
    prompt = (
        f"CODEBASE INDEX:\n{repo_structure}\n\n"
        f"TEST FAILURES:\n{failures}\n\n"
        "Analyze the failures and the codebase structure. Identify the root cause, the file that needs fixing, and any other files you need to see to understand the dependencies."
    )
    
    response = await unified_ai_call(state.get("ai_provider", "gemini"), prompt, system_instruction=system_instruction)
    
    # Parse structured response
    diagnosis_match = re.search(r"DIAGNOSIS:\s*(.*?)TARGET_FILE:", response, re.S | re.I)
    target_file_match = re.search(r"TARGET_FILE:\s*([\w\.\/\-_]+)", response, re.I)
    required_files_match = re.search(r"REQUIRED_FILES:\s*([\w\.\/\-_,\s]+)", response, re.I)
    
    diagnosis = diagnosis_match.group(1).strip() if diagnosis_match else response
    target_file = target_file_match.group(1).strip() if target_file_match else (state["files"][0] if state["files"] else None)
    
    required_files = []
    if required_files_match:
        required_files = [f.strip() for f in required_files_match.group(1).split(",") if f.strip()]

    # Verify file exists and clean up
    valid_files = []
    for f_target in ([target_file] + required_files):
        if not f_target: continue
        if f_target in state["files"]:
            valid_files.append(f_target)
        else:
            # Fuzzy match
            for f_repo in state["files"]:
                if f_target.split("/")[-1] == f_repo.split("/")[-1]:
                    valid_files.append(f_repo)
                    break
    
    final_target = valid_files[0] if valid_files else target_file
    final_context = valid_files[1:] if len(valid_files) > 1 else []

    new_state = {
        "diagnosis": diagnosis, 
        "status": "diagnosed", 
        "target_file": final_target,
        "context_files": final_context
    }
    merged = {**state, **new_state}
    new_state["trajectory"] = persist_event(merged, "diagnosed", log=f"Targeting {final_target} for repair. Requested context for: {', '.join(final_context)}\nDiagnosis: {diagnosis}")
    
    return new_state

async def repair_node(state: AgentState):
    """
    Proposes and applies a surgical fix using Gemini 2.0 Flash with multi-file context.
    Outputs a CONFIDENCE score (0-100). If below the configured threshold, escalates
    for human review instead of auto-applying.
    """
    print(f"[{state['run_id']}] Proposing surgical repair for {state['target_file']}...")
    
    if not state["target_file"]:
        traj = persist_event(state, "escalated", log="No target file identified.")
        return {"status": "escalated", "diagnosis": "ESCALATE: No target file identified for repair.", "trajectory": traj}

    # Gather Context
    target_content = sandbox_manager.read_file(state["sandbox_id"], state["target_file"])
    
    context_data = []
    for cf in state.get("context_files", []):
        content = sandbox_manager.read_file(state["sandbox_id"], cf)
        if content:
            context_data.append(f"FILE: {cf}\nCONTENT:\n{content}\n---\n")

    system_instruction = (
        f"You are a surgical code repair agent with a '{state.get('agent_personality', 'Surgical')}' persona. "
        "You MUST output your response in exactly this format and nothing else:\n"
        "CONFIDENCE: <integer 0-100>\n"
        "PATCH:\n<unified diff>\n"
        "\n"
        "CONFIDENCE must reflect how certain you are the patch fixes the issue without regressions. "
        "If confidence is below 50, set CONFIDENCE to 0 and output ESCALATE instead of a patch. "
        "Focus ONLY on fixing the target file. Use context files to understand dependencies but DO NOT include diffs for them."
    )
    
    prompt = (
        f"FAILING TEST OUTPUT:\n{state.get('failures', [])}\n\n"
        f"ROOT CAUSE DIAGNOSIS:\n{state['diagnosis']}\n\n"
        f"ADDITIONAL CONTEXT FILES:\n{''.join(context_data)}\n\n"
        f"TARGET FILE TO REPAIR ({state['target_file']}):\n{target_content}\n\n"
        "Output your CONFIDENCE score and unified diff PATCH now:"
    )

    response = await unified_ai_call(state.get("ai_provider", "gemini"), prompt, system_instruction=system_instruction)
    
    # --- Parse confidence score ---
    confidence_score = 100  # default: trust the patch
    confidence_match = re.search(r"CONFIDENCE:\s*(\d+)", response, re.I)
    if confidence_match:
        confidence_score = min(100, max(0, int(confidence_match.group(1))))
    
    # Extract patch section
    patch_section_match = re.search(r"PATCH:\s*(.+)", response, re.S | re.I)
    patch_response = patch_section_match.group(1).strip() if patch_section_match else response
    # --- End confidence parsing ---
    
    # --- Guard: Empty or ESCALATE response ---
    if not patch_response or not patch_response.strip() or "ESCALATE" in patch_response.upper():
        msg = "Agent returned an empty patch." if not patch_response or not patch_response.strip() else "Agent signaled ESCALATE."
        traj = persist_event(state, "escalated", log=msg, data={"confidence_score": 0})
        return {"status": "escalated", "diagnosis": f"ESCALATE: {msg}", "iteration": state["iteration"] + 1, "trajectory": traj}

    # --- Guard: Low confidence threshold ---
    threshold_pct = int(state.get("auto_repair_threshold", 0.7) * 100)
    if confidence_score < threshold_pct:
        msg = f"Confidence score {confidence_score}% is below the configured threshold of {threshold_pct}%. Escalating for human review."
        traj = persist_event(state, "escalated", log=msg, data={"confidence_score": confidence_score, "repair_diff": patch_response})
        return {
            "status": "escalated",
            "diagnosis": msg,
            "repair_diff": patch_response,  # surface the patch for human review
            "iteration": state["iteration"] + 1,
            "trajectory": traj
        }
    # --- End guards ---

    patch_diff = parse_agent_response(patch_response)
    validation = validate_patch_safety(patch_diff)
    
    if not validation.passed:
        persist_event(state, "escalated", log=f"Safety Gate Block: {validation.reason}", data={"confidence_score": confidence_score})
        return {"status": "escalated", "diagnosis": f"Safety Gate Block: {validation.reason}"}

    sandbox_manager.write_file(state["sandbox_id"], "repair.diff", patch_diff)
    sandbox_result, exit_code = sandbox_manager.run_command_ext(state["sandbox_id"], f"patch {state['target_file']} < repair.diff")
    
    if exit_code != 0:
        traj = persist_event(state, "unresolved", log=f"Patch failed to apply: {sandbox_result}", data={"confidence_score": confidence_score})
        return {"status": "unresolved", "iteration": state["iteration"] + 1, "trajectory": traj}

    new_state = {"repair_diff": patch_diff, "status": "repair_applied", "iteration": state["iteration"] + 1}
    merged = {**state, **new_state}
    new_state["trajectory"] = persist_event(merged, "repair_applied", log=f"[Confidence: {confidence_score}%] {patch_diff}", data={"confidence_score": confidence_score})
    
    return new_state

async def verification_node(state: AgentState):
    """
    Verifies the fix by running tests and checking for regressions.
    """
    print(f"[{state['run_id']}] Verifying fix with full test suite...")
    sandbox_path = sandbox_manager.get_path(state['sandbox_id'])
    framework = state.get("framework_detected") or detect_test_framework(sandbox_path)
    command = FRAMEWORK_COMMANDS.get(framework, "pytest -v")
    
    # --- Task: Handle Degraded Mode ---
    if state.get("status") == "degraded":
        # In degraded mode, we skip running tests because dependencies failed.
        # We escalate the patch for human review since we can't verify it automatically.
        msg = "DEGRADED_MODE: Patch applied but could not be verified due to environment failure. Escalating for manual audit."
        new_state = {
            "status": "escalated",
            "diagnosis": msg,
            "trajectory": persist_event(state, "escalated", log=msg)
        }
        return new_state
    # --- End Degraded Mode ---

    output = sandbox_manager.run_command(state['sandbox_id'], command)
    parser = TestOutputParser()
    result = parser.parse(output, framework)
    truncated_output = truncate_output(result.output)
    
    baseline_failures = [t.strip() for t in (state.get("baseline_failures") or [])]
    target_tests = [t.strip() for t in (state.get("target_test_names") or [])]
    current_failures = [t.strip() for t in result.failed_test_names]

    regressions = [
        t for t in current_failures
        if t not in baseline_failures and t not in target_tests
    ]
    
    if regressions:
        error_msg = f"REGRESSION: Fix introduced new failures in: {', '.join(regressions)}"
        new_state = {
            "status": "escalated", 
            "diagnosis": error_msg, 
            "failures": [truncated_output],
            "regressions_found": regressions
        }
        merged = {**state, **new_state}
        new_state["trajectory"] = persist_event(merged, "escalated", log=error_msg, data={"regressions_found": regressions})
        return new_state

    still_failing_targets = [t for t in result.failed_test_names if t in state["target_test_names"]]
    
    if not still_failing_targets:
        # Success! Calculate MTTR
        now = time.time()
        mttr = round(now - state["run_start_time"], 2)
        agent_time = round(now - state["agent_start_time"], 2)

        # --- PR Automation ---
        pr_url = None
        if state.get("target_file") and state.get("repair_diff"):
            try:
                fixed_content = sandbox_manager.read_file(state["sandbox_id"], state["target_file"])
                pr_url = await open_fix_pr(
                    repo=state.get("repo_full_name", ""),
                    base_branch=state.get("branch", "main"),
                    run_id=state["run_id"],
                    fixed_file_path=state["target_file"],
                    fixed_content=fixed_content,
                    diagnosis=state.get("diagnosis", "No diagnosis available."),
                    repair_diff=state["repair_diff"],
                )
                print(f"[{state['run_id']}] PR created: {pr_url}")
            except Exception as e:
                print(f"[{state['run_id']}] PR creation failed (non-fatal): {e}")
        # --- End PR Automation ---

        new_state = {
            "status": "completed", 
            "failures": [truncated_output], 
            "pr_url": pr_url
        }
        merged = {**state, **new_state}

        new_state["trajectory"] = persist_event(merged, "completed", log="Verification SUCCESS: All target tests passed!", data={
            "mttr_seconds": mttr,
            "agent_time_seconds": agent_time,
            "setup_time_seconds": state.get("setup_time_seconds"),
            "iterations": state["iteration"],
            "framework_detected": framework,
            "pr_url": pr_url,
        })

        return new_state
    
    elif state["iteration"] >= state["max_iterations"]:
        new_state = {"status": "escalated", "failures": [truncated_output]}
        new_state["trajectory"] = persist_event({**state, **new_state}, "escalated", log="Max iterations reached.")
        return new_state
    
    else:
        new_state = {"status": "unresolved", "failures": [truncated_output], "iteration": state["iteration"]}
        new_state["trajectory"] = persist_event({**state, **new_state}, "unresolved", log=f"{len(still_failing_targets)} targets still failing.")
        return new_state

def should_continue(state: AgentState):
    if state["status"] == "completed":
        return END
    if state["status"] == "escalated":
        return END
    if state.get("regressions_found") and len(state["regressions_found"]) > 0:
        return END # Hard terminal on regressions
    if state["iteration"] >= state["max_iterations"]:
        state["status"] = "escalated"
        return END
    return "diagnose"

def build_test_gen_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("baseline", baseline_node)
    workflow.add_node("diagnose", diagnosis_node)
    workflow.add_node("repair", repair_node)
    workflow.add_node("verify", verification_node)
    
    workflow.set_entry_point("baseline")
    
    workflow.add_conditional_edges(
        "baseline",
        lambda x: "diagnose" if x["status"] not in ["escalated", "completed"] else END,
        {"diagnose": "diagnose", END: END}
    )
    
    workflow.add_conditional_edges(
        "diagnose",
        lambda x: "repair" if x["status"] != "escalated" else END,
        {"repair": "repair", END: END}
    )
    workflow.add_conditional_edges(
        "repair",
        lambda x: "verify" if x["status"] not in ["escalated", "unresolved"] else ("diagnose" if x["status"] == "unresolved" else END),
        {"verify": "verify", "diagnose": "diagnose", END: END}
    )
    workflow.add_conditional_edges(
        "verify",
        should_continue,
        {
            "diagnose": "diagnose",
            END: END
        }
    )
    
    return workflow.compile()

test_gen_agent = build_test_gen_graph()
