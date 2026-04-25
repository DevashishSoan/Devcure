import os
import sys
import time
import asyncio
import httpx
import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from supabase import create_client

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

async def self_test():
    print(">> DevCure Autonomous Self-Test Initiated")
    print("="*50)
    # Load .env from backend directory
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    load_dotenv(env_path)
    
    # Correct auth UUID
    user_id = "5a32b59b-4596-4f3b-a507-757caa32784b" 
    repo_url = "https://github.com/DevashishSoan/student-marks-analyzer"
    supabase_url = os.getenv("SUPABASE_URL")
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
    
    if not supabase_url or not jwt_secret:
        print("Error: SUPABASE_URL or SUPABASE_JWT_SECRET missing in .env")
        return

    project_ref = supabase_url.replace("https://", "").split(".")[0]
    issuer = f"https://{project_ref}.supabase.co/auth/v1"
    
    # Authenticated session
    now = datetime.now(timezone.utc)
    token_payload = {
        "iss": issuer,
        "sub": user_id,
        "aud": "authenticated",
        "role": "authenticated",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=2)).timestamp())
    }
    
    encoded_jwt = jwt.encode(token_payload, jwt_secret, algorithm="HS256")
    headers = {"Authorization": f"Bearer {encoded_jwt}"}
    
    # 1. Register Repo
    print(">> Step 1: Registering Repository...")
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(
                "http://localhost:8000/api/v1/repos/",
                json={
                    "repo_url": repo_url,
                    "branch": "main"
                },
                headers=headers
            )
            if res.status_code in [200, 201]:
                repo_data = res.json()
                repo_id = str(repo_data.get('id'))
                print(f"PASSED: Repo Registered (ID: {repo_id})")
            elif res.status_code in [409, 400, 500]:
                s = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
                existing = s.table("repo_configs").select("id").eq("repo_url", repo_url).execute()
                repo_id = str(existing.data[0]['id'])
                print(f"PASSED: Repo Found (ID: {repo_id})")
            else:
                print(f"FAILED: Registration failed - {res.status_code} {res.text}")
                return
        except Exception as e:
            print(f"FAILED: API Connection Error - {e}")
            return

    # 2. Trigger Run
    print(">> Step 2: Triggering Neural Run (Manual Protocol)...")
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(
                "http://localhost:8000/api/v1/runs/",
                json={
                    "repo_id": repo_id,
                    "commit_sha": "HEAD",
                    "branch": "main"
                },
                headers=headers
            )
            if res.status_code in [200, 201]:
                run_data = res.json()
                run_id = run_data.get("run_id")
                print(f"PASSED: Run Triggered (ID: {run_id})")
            else:
                print(f"FAILED: Trigger failed - {res.status_code} {res.text}")
                return
        except Exception as e:
            print(f"FAILED: API Trigger Error - {e}")
            return

    # 3. Poll Telemetry
    print(">> Step 3: Polling Telemetry (JSON Trajectory)...")
    s = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
    
    last_count = 0
    start_time = time.time()
    while time.time() - start_time < 1200: # 20 min limit
        await asyncio.sleep(8)
        # Check run status and trajectory JSON column
        run_res = s.table("runs").select("status", "trajectory").eq("id", run_id).execute()
        if not run_res.data:
            print("Error: Run record disappeared")
            break
            
        status = run_res.data[0]['status']
        trajectory = run_res.data[0].get('trajectory') or []
        
        if len(trajectory) > last_count:
            for e in trajectory[last_count:]:
                # Normalize key names based on schema
                step = e.get('step') or e.get('event') or "AUDIT"
                msg = e.get('message') or e.get('log') or "..."
                print(f"   [Telemetry] {step.upper()}: {msg[:120]}...")
            last_count = len(trajectory)
            
        if status in ["completed", "failed", "escalated"]:
            print(f"\nFINISH: Run Terminated with Status: {status.upper()}")
            break
            
    print("="*50)
    if status == "completed":
        print("RESULT: SELF-TEST SUCCESSFUL. System fully operational.")
    else:
        print(f"RESULT: SELF-TEST DEGRADED. Run status: {status}.")

if __name__ == "__main__":
    asyncio.run(self_test())
