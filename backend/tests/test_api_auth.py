import jwt
import time
import pytest
from fastapi.testclient import TestClient
from main import app
from core.config import settings

client = TestClient(app)

def test_unauthenticated_runs_401():
    """Verify that accessing /runs without a token returns 401."""
    response = client.get("/api/v1/runs/")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]
    print("PASSED: Unauthenticated Runs -> 401")

def test_expired_jwt_401():
    """Verify that an expired Supabase JWT returns 401 (not 500)."""
    if not settings.SUPABASE_JWT_SECRET:
        pytest.skip("SUPABASE_JWT_SECRET not configured")

    # Extract project ref from URL to match expected issuer in auth.py
    supabase_url = settings.SUPABASE_URL or "https://placeholder.supabase.co"
    project_ref = supabase_url.replace("https://", "").split(".")[0]
    expected_issuer = f"https://{project_ref}.supabase.co/auth/v1"

    # Generate an expired token with REQUIRED claims
    payload = {
        "sub": "00000000-0000-0000-0000-000000000000",
        "aud": "authenticated",
        "iss": expected_issuer,
        "role": "authenticated",
        "iat": int(time.time()) - 7200,
        "exp": int(time.time()) - 3600
    }
    token = jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")
    
    response = client.get(
        "/api/v1/runs/",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 401
    assert "Token expired" in response.json()["detail"]
    print("PASSED: Expired JWT -> 401")

if __name__ == "__main__":
    test_unauthenticated_runs_401()
    test_expired_jwt_401()
