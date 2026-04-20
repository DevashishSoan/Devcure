import os
import requests
import json
import time
from jose import jwt

# Load variables from environment to keep them out of logs
# SET THESE IN YOUR TERMINAL: 
# $env:JWT = "eyJ..."
# $env:SUPABASE_JWT_SECRET = "82a..."
# $env:RENDER_URL = "https://devcure-jx5m.onrender.com"

JWT = os.getenv("JWT")
SECRET = os.getenv("SUPABASE_JWT_SECRET")
RENDER = os.getenv("RENDER_URL", "https://devcure-jx5m.onrender.com")

if not JWT or not SECRET:
    print("ERROR: Missing environment variables. Please set 'JWT' and 'SUPABASE_JWT_SECRET'.")
    exit(1)

def test(id, description, success_condition):
    print(f"{id} {description:35}: ", end="", flush=True)
    try:
        result = success_condition()
        print("PASS" if result else "FAIL")
        return result
    except Exception as e:
        print(f"ERROR: {e}")
        return False

# --- FINAL AUDIT SUITE ---
# Derived from Project REF for issuer validation
PROJECT_REF = RENDER.split("//")[-1].split(".")[0] if "onrender" not in RENDER else "xkuwglmlcisdtmgqpphf"
EXPECTED_ISSUER = f"https://{PROJECT_REF}.supabase.co/auth/v1"

results = []

# Test 1: GET /runs (Real token)
def t1():
    resp = requests.get(f"{RENDER}/api/v1/runs", headers={"Authorization": f"Bearer {JWT}"})
    return resp.status_code == 200
results.append(test("Test 1", "GET /runs (Legit Token)", t1))

# Test 2: GET /stats
def t2():
    resp = requests.get(f"{RENDER}/api/v1/runs/stats", headers={"Authorization": f"Bearer {JWT}"})
    return resp.status_code == 200
results.append(test("Test 2", "GET /stats", t2))

# Test 3: POST /repos
def t3():
    payload = {
        "repo_url": f"https://github.com/devcure-test-{int(time.time())}",
        "branch": "main", "max_iterations": 1, "framework": "auto", "auto_repair": True
    }
    resp = requests.post(f"{RENDER}/api/v1/repos", json=payload, headers={"Authorization": f"Bearer {JWT}"})
    return resp.status_code in [200, 201]
results.append(test("Test 3", "POST /repos", t3))

# Test 4: GET /repos
def t4():
    resp = requests.get(f"{RENDER}/api/v1/repos", headers={"Authorization": f"Bearer {JWT}"})
    return resp.status_code == 200
results.append(test("Test 4", "GET /repos", t4))

# Test 5: Forged Token Rejection (Issuer Check)
def t5():
    # Forge a token using the correct secret but WRONG issuer
    payload = {
        "sub": "attacker", "aud": "authenticated", "iss": "https://evil.com/auth/v1",
        "role": "authenticated", "exp": int(time.time()) + 3600
    }
    forged = jwt.encode(payload, SECRET, algorithm="HS256")
    resp = requests.get(f"{RENDER}/api/v1/runs", headers={"Authorization": f"Bearer {forged}"})
    return resp.status_code == 401
results.append(test("Test 5", "Forged Token Rejection", t5))

# Test 6: Health Check
def t6():
    resp = requests.get(f"{RENDER}/health")
    return resp.status_code == 200 and resp.json().get("status") == "ok"
results.append(test("Test 6", "Production Health", t6))

print("\n" + "="*40)
print(f"FINAL AUDIT SCORE: {sum(results)}/6")
print("="*40)
