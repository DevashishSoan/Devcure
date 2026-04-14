import asyncio
import time
from unittest.mock import patch
from agents.test_gen import test_gen_agent

async def simulate_autonomous_run(scenario="success", max_iterations=3):
    """
    Simulates an autonomous run with different scenarios.
    scenarios: "success", "failure", "regression", "escalate_logic"
    """
    print(f"\n--- Simulating Run (Scenario: {scenario}) ---")
    
    # Mocking external dependencies
    with patch("agents.test_gen.sandbox_manager") as mock_sandbox, \
         patch("agents.test_gen.call_gemini") as mock_ai:
        
        async def mock_call_ai(prompt, system_instruction=None):
            if "PATCH" in prompt.upper() or "DIFF" in prompt.upper() or "unified diff" in prompt:
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
                     # In regression scenario, we fix test_a but break test_b (which was passing in baseline)
                     # Baseline had test_a failing, meaning test_b was passing.
                     return "FAILED tests/test_app.py::test_b\n1 failed, 1 passed in 0.1s"
                 
                 else: # failure / constant failing
                     return "FAILED tests/test_app.py::test_a\n1 failed, 1 passed in 0.1s"

            return "Command executed successfully"
        
        mock_sandbox.run_command.side_effect = mock_run_command
        mock_sandbox.read_file.return_value = "def app(): return True"
        
        # Initial State with Telemetry
        initial_state = {
            "run_id": f"test-{scenario}",
            "sandbox_id": "sb-test",
            "repo_path": "/tmp/test-repo",
            "files": ["app.py"],
            "failures": [], # Will be populated by baseline
            "baseline_failures": set(),
            "target_test_names": set(),
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
            "framework_detected": None
        }

        # Execute Graph
        final_state = await test_gen_agent.ainvoke(initial_state)
        
        print(f"\nFinal State:")
        print(f"  Status: {final_state['status']}")
        print(f"  Iterations: {final_state['iteration']}")
        print(f"  Diagnosis: {final_state.get('diagnosis', 'N/A')}")
        
        return final_state

async def main():
    # Test Case A: Successful fix after 2 iterations
    print("\n>>> TEST CASE A: SUCCESS")
    success_state = await simulate_autonomous_run(scenario="success", max_iterations=5)
    assert success_state["status"] == "completed"
    assert success_state["iteration"] == 2
    
    # Test Case C: Constant Failure -> Escalation
    print("\n>>> TEST CASE C: CONSTANT FAILURE")
    failure_state = await simulate_autonomous_run(scenario="failure", max_iterations=3)
    assert failure_state["status"] == "escalated"
    assert failure_state["iteration"] == 3

    # Test Case D: Regression -> Immediate Escalation
    print("\n>>> TEST CASE D: REGRESSION")
    regression_state = await simulate_autonomous_run(scenario="regression", max_iterations=5)
    assert regression_state["status"] == "escalated"
    assert "REGRESSION" in regression_state["diagnosis"]
    assert regression_state["iteration"] == 1

    print("\nDONE: All simulation test cases passed!")

if __name__ == "__main__":
    asyncio.run(main())
