import hmac
import hashlib
import sys
import os

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
    print("✅ Valid signature test passed")

def test_verify_signature_invalid_secret():
    payload = b'{"ref": "refs/heads/main"}'
    signature_header = "sha256=wrongsecret"
    
    assert verify_signature(payload, signature_header) is False
    print("✅ Invalid signature test passed")

def test_verify_signature_tampered_payload():
    secret = "test_secret"
    original_payload = b'{"ref": "refs/heads/main"}'
    tampered_payload = b'{"ref": "refs/heads/evil"}'
    
    # Sign the original
    sig = hmac.new(secret.encode(), original_payload, hashlib.sha256).hexdigest()
    signature_header = f"sha256={sig}"
    
    # Verify against tampered — must return False
    assert verify_signature(tampered_payload, signature_header) is False
    print("✅ Tampered payload test passed")

if __name__ == "__main__":
    try:
        test_verify_signature_valid()
        test_verify_signature_invalid_secret()
        test_verify_signature_tampered_payload()
        print("\nALL WEBHOOK SECURITY TESTS PASSED")
    except AssertionError as e:
        print(f"\n❌ SECURITY TEST FAILED")
        sys.exit(1)
