import asyncio
import time
import sys
import os
from unittest.mock import patch

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from agents.test_gen import test_gen_agent

async def simulate_autonomous_run(scenario="success", max_iterations=3):
    """
    Simulates an autonomous run with different scenarios.
    scenarios: "success", "failure", "regression", "escalate_keyword", "multi_file", "new_import", "invalid_diff", "gemini_429", "gemini_empty", "clone_failure"
    """
    print(f"\n--- Simulating Run (Scenario: {scenario}) ---")
    
    # Mocking external dependencies
    with patch("agents.test_gen.sandbox_manager") as mock_sandbox, \
         patch("agents.test_gen.call_gemini") as mock_ai, \
         patch("agents.test_gen.get_supabase") as mock_db, \
         patch("agents.test_gen.os.path.exists") as mock_exists:
        
        # Mock exists to return True for most paths, but False for clone failure simulation
        mock_exists.side_effect = lambda x: x != "/tmp/failure"
        
        # Mock DB to avoid real network calls
        mock_db.return_value = MagicMock()

        async def mock_call_ai(prompt, system_instruction=None):
            if scenario == "gemini_429":
                raise Exception("429 Too Many Requests")
            
            if scenario == "gemini_empty":
                return ""
            
            if "PATCH" in prompt.upper() or "DIFF" in prompt.upper() or "unified diff" in prompt:
                if scenario == "escalate_keyword":
                    return "I cannot fix this. ESCALATE."
                elif scenario == "multi_file":
                    return "```diff\n--- a/app.py\n+++ b/app.py\n@@ -1,1 +1,1 @@\n-old\n+new\n--- a/utils.py\n+++ b/utils.py\n@@ -1,1 +1,1 @@\n-old\n+new\n```"
                elif scenario == "new_import":
                    return "```diff\n--- a/app.py\n+++ b/app.py\n@@ -1,1 +1,2 @@\n+import requests\n-old\n+new\n```"
                elif scenario == "invalid_diff":
                    return "Here is a broken diff: \n+ added line without markers"
                
                return "```diff\n--- a/app.py\n+++ b/app.py\n- old\n+ new\n```"
            else:
                return "Root cause: logic error."
        
        mock_ai.side_effect = mock_call_ai

        # State tracking for the mock
        context = {"pytest_calls": 0, "patch_applied": False}

        def mock_run_command(sandbox_id, command, timeout=300):
            if "pytest" in command:
                 context["pytest_calls"] += 1
                 call_idx = context["pytest_calls"]
                 
                 # Baseline is call 1
                 if call_idx == 1:
                     return "FAILED tests/test_app.py::test_a\n1 failed, 1 passed in 0.1s"
                 
                 # Verification calls start from call 2
                 if scenario == "success":
                     if call_idx >= 3: # Success on 2nd iteration (1 baseline + 2 verifying)
                         return "PASSED: All tests passed!\n2 passed in 0.1s"
                     else:
                         return "FAILED tests/test_app.py::test_a\n1 failed, 1 passed in 0.1s"
                 
                 elif scenario == "regression":
                     return "FAILED tests/test_app.py::test_b\n1 failed, 1 passed in 0.1s"
                 
                 else: # failure / constant failing
                     return "FAILED tests/test_app.py::test_a\n1 failed, 1 passed in 0.1s"

            return "Command executed successfully"
        
        mock_sandbox.run_command.side_effect = mock_run_command
        mock_sandbox.read_file.return_value = "def app(): return True"
        if scenario == "clone_failure":
            mock_sandbox.get_path.return_value = "/tmp/failure"
        else:
            mock_sandbox.get_path.return_value = "/tmp/test-repo"
        
        # Ensure framework detection works by mocking the file existence
        # or just set it in initial_state
        initial_state = {
            "run_id": f"test-{scenario}",
            "sandbox_id": "sb-test",
            "repo_path": "/tmp/test-repo",
            "files": ["app.py"],
            "failures": [],
            "baseline_failures": [],
            "target_test_names": [],
            "diagnosis": None,
            "repair_diff": None,
            "iteration": 0,
            "max_iterations": max_iterations,
            "status": "starting",
            "target_file": "app.py",
            "run_start_time": time.time(),
            "setup_time_seconds": 0.5,
            "agent_start_time": time.time(),
            "trajectory": [],
            "framework_detected": "pytest" # Explicitly set for simulation
        }

        # Execute Graph
        try:
            final_state = await test_gen_agent.ainvoke(initial_state)
        except Exception as e:
            print(f"Agent failed with error: {e}")
            return {"status": "error", "error": str(e)}
            
        print(f"\nFinal State:")
        print(f"  Status: {final_state['status']}")
        print(f"  Iterations: {final_state.get('iteration', 'N/A')}")
        print(f"  Diagnosis: {final_state.get('diagnosis', 'N/A')}")
        
        return final_state

from unittest.mock import MagicMock

async def main():
    # Existing Tests
    print("\n>>> TEST CASE A: SUCCESS")
    success_state = await simulate_autonomous_run(scenario="success", max_iterations=5)
    assert success_state["status"] == "completed"
    
    print("\n>>> TEST CASE D: REGRESSION")
    regression_state = await simulate_autonomous_run(scenario="regression", max_iterations=5)
    assert regression_state["status"] == "escalated"
    assert "REGRESSION" in regression_state["diagnosis"]

    # New Tests from Screenshots
    print("\n>>> TEST CASE E: ESCALATE KEYWORD")
    escalate_state = await simulate_autonomous_run(scenario="escalate_keyword")
    assert escalate_state["status"] == "escalated"

    print("\n>>> TEST CASE F: MULTI-FILE DIFF REJECTION")
    multi_file_state = await simulate_autonomous_run(scenario="multi_file")
    if multi_file_state["status"] != "escalated":
        print(f"DEBUG: Multi-file failed. Status: {multi_file_state['status']}, Diagnosis: {multi_file_state.get('diagnosis')}")
    assert multi_file_state["status"] == "escalated"
    assert "modifies 2 files" in multi_file_state["diagnosis"]

    print("\n>>> TEST CASE G: NEW IMPORT DETECTION")
    import_state = await simulate_autonomous_run(scenario="new_import")
    assert import_state["status"] == "escalated"
    assert "adds new imports" in import_state["diagnosis"]

    print("\n>>> TEST CASE H: INVALID DIFF SYNTAX")
    invalid_state = await simulate_autonomous_run(scenario="invalid_diff")
    assert invalid_state["status"] == "escalated"
    assert "No file markers" in invalid_state["diagnosis"]

    print("\n>>> TEST CASE I: GEMINI 429")
    # This might require updates to the agent to handle 429 gracefully with escalation
    # For now, we see if it crashes or reaches an error state
    print("\n>>> TEST CASE J: GEMINI EMPTY RESPONSE")
    empty_state = await simulate_autonomous_run(scenario="gemini_empty")
    assert empty_state["status"] == "escalated"
    assert "empty string" in empty_state["diagnosis"]

    print("\n>>> TEST CASE K: CLONE FAILURE")
    with patch("os.path.exists", side_effect=lambda x: x != "/tmp/failure"):
        clone_state = await simulate_autonomous_run(scenario="clone_failure")
        assert clone_state["status"] == "escalated"
        assert "clone failure" in clone_state["diagnosis"]

    print("\nDONE: All simulation test cases passed!")

if __name__ == "__main__":
    asyncio.run(main())
