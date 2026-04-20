import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from agents.test_gen import detect_test_framework, baseline_node, repair_node, verification_node, should_continue
import os
from pathlib import Path
from sandbox.manager import SandboxTimeoutError

@pytest.mark.asyncio
async def test_framework_detection_python(tmp_path):
    (tmp_path / "requirements.txt").write_text("pytest")
    assert detect_test_framework(str(tmp_path)) == "pytest"

@pytest.mark.asyncio
async def test_framework_detection_jest(tmp_path):
    (tmp_path / "package.json").write_text('{"devDependencies": {"jest": "29.0.0"}}')
    assert detect_test_framework(str(tmp_path)) == "jest"

@pytest.mark.asyncio
async def test_empty_diff_escalates():
    state = {
        "run_id": "test",
        "sandbox_id": "test",
        "target_file": "app.py",
        "diagnosis": "Fix needed",
        "iteration": 0,
        "max_iterations": 5,
        "trajectory": []
    }
    
    with patch("agents.test_gen.call_gemini", return_value="   "): # Empty output
        with patch("agents.test_gen.sandbox_manager") as mock_sandbox:
            mock_sandbox.read_file.return_value = "print(1)"
            result = await repair_node(state)
            assert result["status"] == "escalated"
            assert "empty string" in result["diagnosis"]

@pytest.mark.asyncio
async def test_escalate_signal_stops_loop():
    state = {
        "run_id": "test",
        "sandbox_id": "test",
        "target_file": "app.py",
        "diagnosis": "Fix needed",
        "iteration": 0,
        "max_iterations": 5,
        "trajectory": []
    }
    
    with patch("agents.test_gen.call_gemini", return_value="ESCALATE: This is too hard"):
        with patch("agents.test_gen.sandbox_manager") as mock_sandbox:
            mock_sandbox.read_file.return_value = "print(1)"
            result = await repair_node(state)
            assert result["status"] == "escalated"
            assert "Agent signaled ESCALATE" in result["diagnosis"]

@pytest.mark.asyncio
async def test_regression_triggers_escalation():
    state = {
        "run_id": "test",
        "sandbox_id": "test",
        "baseline_failures": ["test_a"],
        "target_test_names": ["test_a"],
        "framework_detected": "pytest",
        "run_start_time": 0,
        "agent_start_time": 0,
        "trajectory": []
    }
    
    # Mocking parser to return a new failure (test_b) that wasn't in baseline
    mock_result = MagicMock()
    mock_result.failed_test_names = ["test_a", "test_b"] 
    mock_result.output = "FAILED test_b"
    
    with patch("agents.test_gen.sandbox_manager") as mock_sandbox:
        with patch("agents.test_gen.TestOutputParser") as mock_parser:
            mock_parser.return_value.parse.return_value = mock_result
            result = await verification_node(state)
            assert result["status"] == "escalated"
            assert "REGRESSION" in result["diagnosis"]
            assert result["regressions_found"] == ["test_b"]

@pytest.mark.asyncio
async def test_gemini_retry_on_429():
    from core.ai import call_gemini
    
    mock_model = MagicMock()
    # Fail twice with 429, then succeed
    mock_model.generate_content_async = AsyncMock(side_effect=[
        Exception("429 Quota Exceeded"),
        Exception("429 Quota Exceeded"),
        MagicMock(text="Fixed logic")
    ])
    
    with patch("google.generativeai.GenerativeModel", return_value=mock_model):
        with patch("asyncio.sleep", return_value=None) as mock_sleep:
            result = await call_gemini("prompt")
            assert result == "Fixed logic"
            assert mock_model.generate_content_async.call_count == 3
            assert mock_sleep.call_count == 2

@pytest.mark.asyncio
async def test_pip_failure_escalates():
    state = {
        "run_id": "test",
        "sandbox_id": "test",
        "trajectory": []
    }
    
    with patch("agents.test_gen.sandbox_manager") as mock_sandbox:
        mock_sandbox.get_path.return_value = "/tmp"
        mock_sandbox.install_dependencies.return_value = False
        result = await baseline_node(state)
        assert result["status"] == "escalated"
        assert "Dependency installation failed" in result["diagnosis"]
