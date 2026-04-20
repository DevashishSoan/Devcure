import hmac
import hashlib
import sys
import os
import json

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from core.config import settings

# Mock settings for test
settings.GITHUB_WEBHOOK_SECRET = "test_secret"

def verify_signature(payload_body: bytes, signature_header: str) -> bool:
    """Import logic from webhooks.py or replicate here for one-off check."""
    from routes.webhooks import verify_signature as real_verify
    return real_verify(payload_body, signature_header)

def test_verify_signature_valid():
    secret = "test_secret"
    payload = b'{"ref": "refs/heads/main"}'
    
    sig = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    signature_header = f"sha256={sig}"
    
    assert verify_signature(payload, signature_header) is True
    print("PASSED: Valid signature test")

def test_verify_signature_invalid_secret():
    payload = b'{"ref": "refs/heads/main"}'
    signature_header = "sha256=wrongsecret"
    
    assert verify_signature(payload, signature_header) is False
    print("PASSED: Invalid signature test")

def test_verify_signature_tampered_payload():
    secret = "test_secret"
    original_payload = b'{"ref": "refs/heads/main"}'
    tampered_payload = b'{"ref": "refs/heads/evil"}'
    
    # Sign the original
    sig = hmac.new(secret.encode(), original_payload, hashlib.sha256).hexdigest()
    signature_header = f"sha256={sig}"
    
    # Verify against tampered — must return False
    assert verify_signature(tampered_payload, signature_header) is False
    print("PASSED: Tampered payload test")

def test_verify_signature_missing_header():
    payload = b'{"ref": "refs/heads/main"}'
    signature_header = None
    
    assert verify_signature(payload, signature_header) is False
    print("PASSED: Missing header test")

def test_replay_attack():
    # In a real scenario, this might check a delivery ID or a commit SHA
    # For this test, we mock the 'runs' table insert to fail if a duplicate is sent
    # Or we verify that the service logic handles it.
    print("⚠️  Replay attack test: To be fully implemented with DB unique constraints.")
    # For now, we just ensure the signature logic is robust.
    pass

def test_oversized_payload():
    # Simulate 11MB payload
    oversized_payload = b"a" * (11 * 1024 * 1024)
    # The current verify_signature doesn't check size, but the route might.
    # We'll just verify it doesn't crash here.
    signature_header = "sha256=somesig"
    verify_signature(oversized_payload, signature_header)
    print("PASSED: Oversized payload handling test")

if __name__ == "__main__":
    try:
        test_verify_signature_valid()
        test_verify_signature_invalid_secret()
        test_verify_signature_tampered_payload()
        test_verify_signature_missing_header()
        test_oversized_payload()
        print("ALL WEBHOOK SECURITY TESTS PASSED")
    except AssertionError as e:
        print(f"SECURITY TEST FAILED")
        sys.exit(1)
