# backend/tests/test_auth_hardening.py

import pytest
import time
from jose import jwt

# DUMMY VALUES FOR UNIT TESTING LOGIC
# These are never used in production and do not match any real project.
DUMMY_SECRET = "dummy_secret_for_unit_testing_only_123456"
DUMMY_ISSUER = "https://mock.supabase.co/auth/v1"
DUMMY_AUDIENCE = "authenticated"

def make_token(secret, issuer, audience, algorithm="HS256", expired=False):
    now = int(time.time())
    payload = {
        "sub": "test-user-id",
        "aud": audience,
        "iss": issuer,
        "role": "authenticated",
        "iat": now - 3600 if expired else now,
        "exp": now - 1 if expired else now + 3600,
    }
    return jwt.encode(payload, secret, algorithm=algorithm)

def test_valid_token_accepted():
    token = make_token(DUMMY_SECRET, DUMMY_ISSUER, DUMMY_AUDIENCE)
    payload = jwt.decode(token, DUMMY_SECRET,
        algorithms=["HS256"],
        audience=DUMMY_AUDIENCE,
        issuer=DUMMY_ISSUER)
    assert payload["sub"] == "test-user-id"

def test_wrong_issuer_rejected():
    token = make_token(DUMMY_SECRET, "https://evil.com/auth/v1", DUMMY_AUDIENCE)
    with pytest.raises(Exception):
        jwt.decode(token, DUMMY_SECRET,
            algorithms=["HS256"],
            audience=DUMMY_AUDIENCE,
            issuer=DUMMY_ISSUER)

def test_wrong_audience_rejected():
    token = make_token(DUMMY_SECRET, DUMMY_ISSUER, "invalid_audience")
    with pytest.raises(Exception):
        jwt.decode(token, DUMMY_SECRET,
            algorithms=["HS256"],
            audience=DUMMY_AUDIENCE,
            issuer=DUMMY_ISSUER)

def test_algorithm_none_rejected():
    import base64, json
    header = base64.urlsafe_b64encode(json.dumps({"alg":"none","typ":"JWT"}).encode()).rstrip(b"=").decode()
    payload_b64 = base64.urlsafe_b64encode(json.dumps({
        "sub":"attacker","aud":DUMMY_AUDIENCE,"iss":DUMMY_ISSUER,
        "role":"authenticated","exp": int(time.time()) + 3600
    }).encode()).rstrip(b"=").decode()
    none_token = f"{header}.{payload_b64}."
    with pytest.raises(Exception):
        jwt.decode(none_token, DUMMY_SECRET, algorithms=["HS256"])

def test_expired_token_rejected():
    token = make_token(DUMMY_SECRET, DUMMY_ISSUER, DUMMY_AUDIENCE, expired=True)
    with pytest.raises(Exception):
        jwt.decode(token, DUMMY_SECRET,
            algorithms=["HS256"],
            audience=DUMMY_AUDIENCE,
            issuer=DUMMY_ISSUER)

def test_wrong_secret_rejected():
    token = make_token("wrong_secret_string_here_12345", DUMMY_ISSUER, DUMMY_AUDIENCE)
    with pytest.raises(Exception):
        jwt.decode(token, DUMMY_SECRET,
            algorithms=["HS256"],
            audience=DUMMY_AUDIENCE,
            issuer=DUMMY_ISSUER)

def test_service_role_token_rejected():
    token = make_token(DUMMY_SECRET, DUMMY_ISSUER, "service_role")
    with pytest.raises(Exception):
        jwt.decode(token, DUMMY_SECRET,
            algorithms=["HS256"],
            audience=DUMMY_AUDIENCE,
            issuer=DUMMY_ISSUER)
