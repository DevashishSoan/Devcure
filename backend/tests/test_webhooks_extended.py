import hmac
import hashlib
import json
import time
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from main import app
from core.config import settings

client = TestClient(app)

def get_signature(payload_bytes, secret):
    expected = hmac.new(
        secret.encode(),
        payload_bytes,
        hashlib.sha256
    ).hexdigest()
    return f"sha256={expected}"

@patch("routes.webhooks.get_repo_config")
def test_branch_filtering(mock_get_config):
    """Verify that push to non-configured branch is ignored."""
    mock_get_config.return_value = {
        "user_id": "00000000-0000-0000-0000-000000000000",
        "branch": "main",
        "max_iterations": 5
    }
    
    payload = {
        "ref": "refs/heads/feature/xyz",
        "after": "sha123",
        "repository": {"full_name": "owner/repo", "clone_url": "https://github.com/owner/repo.git"}
    }
    body = json.dumps(payload).encode()
    signature = get_signature(body, settings.GITHUB_WEBHOOK_SECRET or "test_secret")
    
    with patch.object(settings, "GITHUB_WEBHOOK_SECRET", "test_secret"):
        response = client.post(
            "/api/v1/webhooks/github",
            content=body,
            headers={"X-Hub-Signature-256": signature, "X-GitHub-Event": "push"}
        )
    
    assert response.status_code == 200
    assert response.json()["status"] == "ignored"
    assert "Push to feature/xyz ignored" in response.json()["message"]
    print("PASSED: Branch Filtering")

@patch("routes.webhooks.get_repo_config")
def test_unconfigured_repo_response(mock_get_config):
    """Verify specific error status for unconfigured repositories."""
    mock_get_config.return_value = None
    
    payload = {
        "ref": "refs/heads/main",
        "after": "sha456",
        "repository": {"full_name": "unknown/repo", "clone_url": "https://github.com/unknown/repo.git"}
    }
    body = json.dumps(payload).encode()
    signature = get_signature(body, settings.GITHUB_WEBHOOK_SECRET or "test_secret")
    
    with patch.object(settings, "GITHUB_WEBHOOK_SECRET", "test_secret"):
        response = client.post(
            "/api/v1/webhooks/github",
            content=body,
            headers={"X-Hub-Signature-256": signature, "X-GitHub-Event": "push"}
        )
    
    assert response.status_code == 200
    assert response.json()["status"] == "repo not configured"
    print("PASSED: Unconfigured Repo Response")

@patch("routes.webhooks.get_repo_config")
@patch("routes.webhooks.run_autonomous_qa_with_config")
def test_max_iterations_config(mock_run_task, mock_get_config):
    """Verify that max_iterations is correctly passed to the agent task."""
    mock_get_config.return_value = {
        "user_id": "00000000-0000-0000-0000-000000000000",
        "branch": "main",
        "max_iterations": 1
    }
    
    payload = {
        "ref": "refs/heads/main",
        "after": "sha789",
        "repository": {"full_name": "owner/repo", "clone_url": "https://github.com/owner/repo.git"}
    }
    body = json.dumps(payload).encode()
    signature = get_signature(body, settings.GITHUB_WEBHOOK_SECRET or "test_secret")
    
    with patch.object(settings, "GITHUB_WEBHOOK_SECRET", "test_secret"):
        with patch("routes.webhooks.get_supabase") as mock_supabase:
            # Mock the insert call to avoid the UUID error even with valid UUID (for safety)
            mock_supabase.return_value.table.return_value.insert.return_value.execute.return_value = MagicMock()
            
            response = client.post(
                "/api/v1/webhooks/github",
                content=body,
                headers={"X-Hub-Signature-256": signature, "X-GitHub-Event": "push"}
            )
    
    assert response.status_code == 200
    # Verify the background task was added
    assert mock_run_task.called
    # Check max_iterations (the 5th argument in run_autonomous_qa_with_config)
    # call_args is (args, kwargs). args[4] is the 5th arg.
    called_args = mock_run_task.call_args[0]
    assert called_args[4] == 1
    print("PASSED: Max Iterations Config")

if __name__ == "__main__":
    test_branch_filtering()
    test_unconfigured_repo_response()
    test_max_iterations_config()
