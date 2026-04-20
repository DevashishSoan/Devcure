import os
import sys
import json
import asyncio
import hmac
import hashlib
import time
import uuid
import subprocess
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from main import app
from core.config import settings

# TestClient with raise_server_exceptions=False to catch 500s manually if needed
client = TestClient(app, raise_server_exceptions=False)

# Utility for signing
def get_signature(payload_bytes, secret):
    expected = hmac.new(
        secret.encode(),
        payload_bytes,
        hashlib.sha256
    ).hexdigest()
    return f"sha256={expected}"

class BruteTestSuite:
    def __init__(self):
        self.results = []

    def log_result(self, area, sub_test, status, message):
        self.results.append({
            "area": area,
            "sub_test": sub_test,
            "status": status,
            "message": message
        })
        print(f"[{status}] {area} - {sub_test}: {message}")

    async def test_all(self):
        print("\n>>> STARTING BRUTE FORCE TEST SUITE - Exhaustive Function Sweep\n")
        
        await self.brute_webhooks()
        await self.brute_auth()
        await self.brute_database()
        await self.brute_safety()
        await self.brute_sandbox()
        await self.brute_agent_concurrency()
        await self.brute_repos_api()
        await self.brute_notifications()
        
        self.print_summary()

    async def brute_webhooks(self):
        area = "WEBHOOKS"
        # Force a secret for these tests
        test_secret = "brute_force_secret_123"
        
        with patch("core.config.settings.GITHUB_WEBHOOK_SECRET", test_secret), \
             patch("core.config.settings.QA_MODE", False):
            
            # 1. Burst valid webhooks
            for i in range(3):
                payload = {"after": f"burst_{i}", "repository": {"full_name": "owner/repo"}, "ref": "refs/heads/main"}
                body = json.dumps(payload).encode()
                sig = get_signature(body, test_secret)
                with patch("routes.webhooks.get_repo_config", return_value={"user_id": str(uuid.uuid4()), "branch": "main", "max_iterations": 1}):
                    with patch("routes.webhooks.run_autonomous_qa_with_config"):
                        resp = client.post("/api/v1/webhooks/github", content=body, headers={"X-Hub-Signature-256": sig, "X-GitHub-Event": "push"})
                        if resp.status_code == 200:
                            self.log_result(area, f"Burst Webhook {i}", "PASS", "Accepted")
                        else:
                            self.log_result(area, f"Burst Webhook {i}", "FAIL", f"Status {resp.status_code}")

            # 2. Malformed JSON (Fuzzing)
            resp = client.post("/api/v1/webhooks/github", content=b"{invalid_json", headers={"X-Hub-Signature-256": "junk", "X-GitHub-Event": "push"})
            self.log_result(area, "Malformed JSON rejection", "PASS" if resp.status_code >= 400 else "FAIL", f"Status {resp.status_code}")

            # 3. Invalid Signature (Should fail 403 now)
            resp = client.post("/api/v1/webhooks/github", content=b'{"ref":"main"}', headers={"X-Hub-Signature-256": "wrong", "X-GitHub-Event": "push"})
            self.log_result(area, "Invalid Signature enforcement", "PASS" if resp.status_code == 403 else "FAIL", f"Status {resp.status_code}")

    async def brute_auth(self):
        area = "AUTH"
        import jwt
        payload = {"sub": str(uuid.uuid4()), "exp": int(time.time()) - 3600}
        token = jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")
        
        with patch("core.auth.settings.QA_MODE", False):
            resp = client.get("/api/v1/runs/", headers={"Authorization": f"Bearer {token}"})
            self.log_result(area, "Expired Token rejection", "PASS" if resp.status_code == 401 else "FAIL", f"Status {resp.status_code}")

    async def brute_database(self):
        area = "DATABASE"
        from core.database import get_supabase
        try:
            with patch("core.database.create_client") as mock_create:
                mock_create.return_value = MagicMock()
                db = get_supabase()
                self.log_result(area, "Supabase Init", "PASS", "Initialized with mocks")
        except Exception as e:
            self.log_result(area, "Supabase Init", "FAIL", str(e))

    async def brute_safety(self):
        area = "SAFETY_GATE"
        from core.safety import validate_patch_safety
        
        # 1. Multi-file
        bad_diff = "--- a/a.py\n+++ b/a.py\n...\n--- a/b.py\n+++ b/b.py\n"
        val = validate_patch_safety(bad_diff)
        self.log_result(area, "Reject Multi-file", "PASS" if not val.passed and "Max 1" in val.reason else "FAIL", val.reason)

        # 2. Forbidden file
        forbidden_diff = "--- a/backend/main.py\n+++ b/backend/main.py\n@@ -1,1 +1,1 @@\n-old\n+new"
        val = validate_patch_safety(forbidden_diff)
        self.log_result(area, "Reject Forbidden File", "PASS" if not val.passed and "unauthorized" in val.reason.lower() else "FAIL", val.reason)

        # 3. New Import
        evil_diff = "--- a/app.py\n+++ b/app.py\n+import os"
        val = validate_patch_safety(evil_diff)
        self.log_result(area, "Reject New Import", "PASS" if not val.passed and "new imports" in val.reason.lower() else "FAIL", val.reason)

    async def brute_sandbox(self):
        area = "SANDBOX"
        from sandbox.manager import sandbox_manager
        
        # 1. Path Traversal
        try:
            sandbox_manager.get_path("../../../secrets.env")
            self.log_result(area, "Path Traversal Block", "FAIL", "Allowed escape")
        except Exception:
            self.log_result(area, "Path Traversal Block", "PASS", "Blocked correctly")

        # 2. Timeout
        sandbox_id = None
        try:
            sandbox_id = sandbox_manager.create_sandbox()["id"]
            with patch("sandbox.manager.subprocess.run", side_effect=subprocess.TimeoutExpired(cmd="sleep", timeout=1)):
                try:
                    sandbox_manager.run_command(sandbox_id, "sleep 10", timeout=1)
                    self.log_result(area, "Subprocess Timeout", "FAIL", "No timeout raised")
                except Exception:
                    self.log_result(area, "Subprocess Timeout", "PASS", "Timeout handled")
        finally:
            if sandbox_id: sandbox_manager.cleanup_sandbox(sandbox_id)

    async def brute_agent_concurrency(self):
        area = "AGENT_LOOP"
        from agents.test_gen import repair_node
        
        async def mock_repair(i):
            state = {
                "run_id": f"brute_{i}", "sandbox_id": f"sb_{i}", "target_file": "app.py",
                "diagnosis": "fix", "iteration": 0, "max_iterations": 5, "trajectory": []
            }
            with patch("agents.test_gen.call_gemini", return_value="--- a/app.py\n+++ b/app.py\n@@ -1,1 +1,1 @@\n-1\n+2"), \
                 patch("agents.test_gen.sandbox_manager") as mock_sm, \
                 patch("agents.test_gen.get_supabase"):
                mock_sm.read_file.return_value = "1"
                mock_sm.write_file.return_value = None
                mock_sm.run_command.return_value = "Success"
                return await repair_node(state)

        tasks = [mock_repair(i) for i in range(5)]
        results = await asyncio.gather(*tasks)
        success = sum(1 for r in results if r["status"] == "repair_applied")
        self.log_result(area, "Concurrent Repairs (5)", "PASS" if success == 5 else "FAIL", f"{success}/5 success")

    async def brute_repos_api(self):
        area = "REPOS_API"
        resp = client.get("/api/v1/repos/")
        self.log_result(area, "Unauthenticated Access Block", "PASS" if resp.status_code == 401 else "FAIL", f"Status {resp.status_code}")

    async def brute_notifications(self):
        area = "NOTIFICATIONS"
        from core.notifications import send_slack_notification
        try:
            with patch("httpx.AsyncClient.post", return_value=MagicMock(status_code=200)):
                res = await send_slack_notification("http://hook", "run-1", "repo", "completed", 10.0, "http://pr")
                self.log_result(area, "Slack Notification", "PASS" if res else "FAIL", "Executed")
        except Exception as e:
            self.log_result(area, "Slack Notification", "FAIL", str(e))

    def print_summary(self):
        print("\n" + "="*60)
        print("--- BRUTE FORCE TEST SUMMARY")
        print("="*60)
        
        areas = sorted(list(set(r["area"] for r in self.results)))
        for area in areas:
            print(f"\n[{area}]")
            area_results = [r for r in self.results if r["area"] == area]
            for r in area_results:
                icon = "[PASS]" if r["status"] == "PASS" else "[FAIL]"
                print(f"  {icon} {r['sub_test']:30}: {r['message']}")
        
        all_pass = all(r["status"] == "PASS" for r in self.results)
        print("\n" + "="*60)
        print(f"OVERALL RESULT: {'PASSED' if all_pass else 'FAILED'}")
        print("="*60 + "\n")

if __name__ == "__main__":
    asyncio.run(BruteTestSuite().test_all())
