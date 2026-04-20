import pytest
import hmac
import hashlib
from fastapi.testclient import TestClient
from main import app
from core.config import settings
from sandbox.manager import sandbox_manager, SecurityError
import os

client = TestClient(app)

def sign_payload(payload: bytes, secret: str) -> str:
    return f"sha256={hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()}"

def test_webhook_rejects_missing_signature():
    response = client.post("/api/v1/webhooks/github", json={"foo": "bar"})
    assert response.status_code == 403

def test_webhook_rejects_invalid_signature():
    payload = b'{"foo": "bar"}'
    headers = {"X-Hub-Signature-256": "sha256=invalid"}
    response = client.post("/api/v1/webhooks/github", content=payload, headers=headers)
    assert response.status_code == 403

def test_webhook_rejects_tampered_payload():
    secret = settings.GITHUB_WEBHOOK_SECRET or "test_secret"
    payload = b'{"foo": "bar"}'
    signature = sign_payload(payload, secret)
    
    # Send tampered payload with original signature
    response = client.post("/api/v1/webhooks/github", content=b'{"foo": "tampered"}', headers={"X-Hub-Signature-256": signature})
    assert response.status_code == 403

def test_api_rejects_missing_jwt():
    # Attempt to list runs without token
    response = client.get("/api/v1/runs/")
    assert response.status_code in (401, 403)

def test_path_traversal_blocked():
    # We should use a mock or a safe call to get_path
    with pytest.raises(SecurityError):
        sandbox_manager.get_path("../../../etc/passwd")
    
    with pytest.raises(SecurityError):
        sandbox_manager.get_path("safe-id/../../../etc/passwd")

def test_shell_injection_blocked():
    # Search for shell=True in the whole backend directory
    import subprocess
    # This is a meta-test verifying the codebase
    backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    count = 0
    for root, dirs, files in os.walk(backend_path):
        if "tests" in root: continue # Skip tests directory
        for file in files:
            if file.endswith(".py"):
                with open(os.path.join(root, file), "r", encoding="utf-8") as f:
                    if "shell=True" in f.read():
                        count += 1
    assert count == 0, f"Found {count} instances of shell=True"

def test_env_stripping():
    env = sandbox_manager._get_safe_env()
    assert "GEMINI_API_KEY" not in env
    assert "SUPABASE_SERVICE_KEY" not in env
    assert "GITHUB_TOKEN" not in env
    assert "SUPABASE_JWT_SECRET" not in env
