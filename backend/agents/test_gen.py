from typing import TypedDict, List, Optional, Set, Dict, Any
from dataclasses import dataclass, field
from langgraph.graph import StateGraph, END
from sandbox.manager import sandbox_manager
from core.config import settings
from core.database import get_supabase
from core.ai import call_gemini
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
    
    return "unknown"

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

def persist_event(state: AgentState, status: str, log: Optional[str] = None, data: Optional[Dict] = None):
    """Performs a surgical direct write to Supabase for real-time dashboard updates."""
    supabase = get_supabase()
    if not supabase: return
    
    event = {"event": status, "log": log}
    if data: event.update(data)
    
    new_trajectory = append_trajectory_event(state.get("trajectory", []), event)
    
    payload = {
        "status": status,
        "trajectory": new_trajectory,
        "updated_at": "now()"
    }
    
    # Promote top-level fields for easier querying as per user request
    if state.get("baseline_failures"):
        payload["baseline_failures"] = list(state["baseline_failures"])
    if state.get("framework_detected"):
        payload["framework_detected"] = state["framework_detected"]
    
    # Handle optional telemetry data that might be in 'data'
    if data:
        for field in ["regressions_found", "mttr_seconds", "agent_time_seconds", "iterations", "pr_url"]:
            if field in data:
                payload[field] = data[field]
    
    try:
        supabase.table("runs").update(payload).eq("id", state["run_id"]).execute()
    except Exception as e:
        print(f"Failed to persist event to Supabase: {e}")

async def baseline_node(state: AgentState):
    """
    Runs tests on unmodified code to capture pre-existing failures.
    """
    print(f"[{state['run_id']}] Capturing baseline failures...")

    sandbox_path = sandbox_manager.get_path(state['sandbox_id'])
    if not sandbox_path or not os.path.exists(sandbox_path):
        persist_event(state, "escalated", log="Failed to initialize sandbox (clone failure).")
        return {"status": "escalated", "diagnosis": "ESCALATE: Git clone failure (wrong token, private repo, or repo deleted)."}

    framework = detect_test_framework(sandbox_path)
    
    # --- Task 3.4: Dependency Guard ---
    deps_ok = sandbox_manager.install_dependencies(state['sandbox_id'])
    if not deps_ok:
        error_msg = "Dependency installation failed. Manual review required."
        persist_event(state, "escalated", log=error_msg)
        return {"status": "escalated", "diagnosis": f"ESCALATE: {error_msg}"}
    # --- End Guard ---

    command = FRAMEWORK_COMMANDS.get(framework, "pytest -v")
    
    output = sandbox_manager.run_command(state['sandbox_id'], command)
    parser = TestOutputParser()
    result = parser.parse(output, framework)
    truncated_output = truncate_output(result.output)
    
    new_state = {
        "baseline_failures": list(result.failed_test_names),
        "target_test_names": list(result.failed_test_names),
        "failures": [truncated_output],
        "framework_detected": framework,
        "status": "baseline_captured"
    }
    
    # Merge for persistence
    merged = {**state, **new_state}
    persist_event(merged, "baseline_captured", log=f"Detected {framework}. Found {len(result.failed_test_names)} baseline failures.")
    
    print(f"[{state['run_id']}] Baseline captured: {len(result.failed_test_names)} failures.")
    return new_state

async def diagnosis_node(state: AgentState):
    """
    Analyzes test failures using Gemini 1.5 Flash.
    """
    print(f"[{state['run_id']}] Diagnosing failures using Gemini Flash...")
    
    failures = "\n".join(state.get("failures", []))
    repo_info = f"Repository: {state['repo_path']}\nFiles: {', '.join(state['files'])}"
    
    prompt = f"Analyze the following test failures and repo context:\n\n{repo_info}\n\nFailures:\n{failures}\n\nProvide a concise diagnosis of the root cause."
    system_instruction = "You are a senior QA automation engineer. Your goal is to diagnose test failures based on logs and repository structure. Be precise and technical."
    
    diagnosis = await call_gemini(prompt, system_instruction=system_instruction)
    target_file = state["files"][0] if state["files"] else None
    
    new_state = {"diagnosis": diagnosis, "status": "diagnosed", "target_file": target_file}
    merged = {**state, **new_state}
    persist_event(merged, "diagnosed", log=diagnosis)
    
    return new_state

async def repair_node(state: AgentState):
    """
    Proposes and applies a surgical fix using Gemini 2.0 Flash.
    """
    print(f"[{state['run_id']}] Proposing surgical repair for {state['target_file']}...")
    
    if not state["target_file"]:
        persist_event(state, "escalated", log="No target file identified.")
        return {"status": "escalated", "diagnosis": "ESCALATE: No target file identified for repair."}

    original_content = sandbox_manager.read_file(state["sandbox_id"], state["target_file"])
    
    system_instruction = (
        "You are a surgical code repair agent. Output valid unified diff and nothing else."
    )
    prompt = (
        f"FAILING TEST OUTPUT:\n{state.get('failures', [])}\n\n"
        f"ROOT CAUSE DIAGNOSIS:\n{state['diagnosis']}\n\n"
        f"FILE TO REPAIR ({state['target_file']}):\n{original_content}\n\n"
        "Output the unified diff now:"
    )

    response = await call_gemini(prompt, system_instruction=system_instruction)
    
    # --- Task 3.3: Empty Diff Guard ---
    if not response or not response.strip() or "ESCALATE" in response.upper():
        msg = "Agent returned an empty string." if not response or not response.strip() else "Agent signaled ESCALATE."
        persist_event(state, "escalated", log=msg)
        return {"status": "escalated", "diagnosis": f"ESCALATE: {msg}", "iteration": state["iteration"] + 1}
    # --- End Guard ---

    patch_diff = parse_agent_response(response)
    validation = validate_patch_safety(patch_diff)
    
    if not validation.passed:
        persist_event(state, "escalated", log=f"Safety Gate Block: {validation.reason}")
        return {"status": "escalated", "diagnosis": f"Safety Gate Block: {validation.reason}"}

    sandbox_manager.write_file(state["sandbox_id"], "repair.diff", patch_diff)
    sandbox_result = sandbox_manager.run_command(state["sandbox_id"], f"patch {state['target_file']} < repair.diff")
    
    if "error" in sandbox_result.lower() or "failed" in sandbox_result.lower():
        persist_event(state, "unresolved", log=f"Patch failed: {sandbox_result}")
        return {"status": "unresolved", "iteration": state["iteration"] + 1}

    new_state = {"repair_diff": patch_diff, "status": "repair_applied", "iteration": state["iteration"] + 1}
    merged = {**state, **new_state}
    persist_event(merged, "repair_applied", log=patch_diff)
    
    return new_state

async def verification_node(state: AgentState):
    """
    Verifies the fix by running tests and checking for regressions.
    """
    print(f"[{state['run_id']}] Verifying fix with full test suite...")
    sandbox_path = sandbox_manager.get_path(state['sandbox_id'])
    framework = state.get("framework_detected") or detect_test_framework(sandbox_path)
    command = FRAMEWORK_COMMANDS.get(framework, "pytest -v")
    
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
        persist_event(merged, "escalated", log=error_msg, data={"regressions_found": regressions})
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

        persist_event(merged, "completed", log="Verification SUCCESS: All target tests passed!", data={
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
        persist_event({**state, **new_state}, "escalated", log="Max iterations reached.")
        return new_state
    
    else:
        new_state = {"status": "unresolved", "failures": [truncated_output], "iteration": state["iteration"]}
        persist_event({**state, **new_state}, "unresolved", log=f"{len(still_failing_targets)} targets still failing.")
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
        lambda x: "diagnose" if x["status"] != "escalated" else END,
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
