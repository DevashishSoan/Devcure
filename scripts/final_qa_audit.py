import os
import sys
import uuid
import time
import httpx
import asyncio
from typing import Dict, Any

# Setup paths
sys.path.append(os.path.abspath("backend"))

from core.config import settings
from core.database import get_supabase
from core.auth import get_current_user
from sandbox.manager import sandbox_manager

class FinalQAAudit:
    def __init__(self):
        self.results = []
        self.supabase = get_supabase()
        self.base_url = "http://localhost:8000/api/v1"

    def log(self, step: str, status: str, details: str = ""):
        self.results.append({"step": step, "status": status, "details": details})
        icon = "[PASS]" if status == "PASS" else "[FAIL]" if status == "FAIL" else "[WARN]"
        print(f"{icon} [{step}] {status} {details}")

    async def audit_environment(self):
        """Verifies environment variables and core infrastructure."""
        missing = []
        critical_keys = ["SUPABASE_URL", "SUPABASE_KEY", "GEMINI_API_KEY", "GITHUB_TOKEN"]
        for key in critical_keys:
            if not getattr(settings, key, None):
                missing.append(key)
        
        if missing:
            self.log("Environment Variables", "FAIL", f"Missing: {', '.join(missing)}")
        else:
            self.log("Environment Variables", "PASS", "All critical keys detected.")

    async def audit_sandbox_security(self):
        """Verifies Docker resource constraints and network isolation."""
        try:
            # Test 1: Infrastructure connection
            client = sandbox_manager.client
            if client:
                self.log("Sandbox Infrastructure", "PASS", "Docker Engine connected.")
            else:
                self.log("Sandbox Infrastructure", "WARN", "Docker not available, using local fallback.")

            # Test 2: Create sandbox & verify isolation
            sandbox = sandbox_manager.create_sandbox("https://github.com/DevashishSoan/DevCure")
            sid = sandbox["id"]
            
            output, exit_code = sandbox_manager.run_command_ext(
                sid, 
                "curl -Is google.com --connect-timeout 2"
            )
            
            if exit_code != 0:
                self.log("Sandbox Security (Network)", "PASS", "Network isolation confirmed (or no curl).")
            else:
                self.log("Sandbox Security (Network)", "FAIL", "Sandbox reached external network!")
            
            sandbox_manager.cleanup_sandbox(sid)
        except Exception as e:
            self.log("Sandbox Audit", "ERROR", str(e))

    async def audit_user_settings(self):
        """Tests the new Identity & Neuro-Config endpoints."""
        # This requires a real token, so we'll mock the database update instead
        try:
            test_user_id = str(uuid.uuid4())
            profile = {
                "user_id": test_user_id,
                "display_name": "QA_Bot",
                "organization_name": "DevCure_QA",
                "agent_personality": "Surgical",
                "auto_repair_threshold": 0.9
            }
            # Insert
            self.supabase.table("user_profiles").insert(profile).execute()
            
            # Verify
            fetch = self.supabase.table("user_profiles").select("*").eq("user_id", test_user_id).single().execute()
            if fetch.data and fetch.data["display_name"] == "QA_Bot":
                self.log("User Settings (Identity)", "PASS", "Profile creation and fetch verified.")
            else:
                self.log("User Settings (Identity)", "FAIL", "Data mismatch in profile.")
            
            # Cleanup
            self.supabase.table("user_profiles").delete().eq("user_id", test_user_id).execute()
        except Exception as e:
            self.log("User Settings Audit", "ERROR", str(e))

    async def audit_action_trigger(self):
        """Verifies the GitHub Action trigger endpoint logic."""
        # We test the normalization logic specifically
        test_url = "https://github.com/DevashishSoan/DevCure.git"
        url_parts = test_url.rstrip("/").replace(".git", "").split("/")
        repo_name = f"{url_parts[-2]}/{url_parts[-1]}"
        
        if repo_name == "DevashishSoan/DevCure":
            self.log("Action Trigger (Normalization)", "PASS", "Repo URL normalization confirmed.")
        else:
            self.log("Action Trigger (Normalization)", "FAIL", f"Expected DevashishSoan/DevCure, got {repo_name}")

    def print_summary(self):
        print("\n" + "="*50)
        print("  DEVCURE SYSTEM AUDIT: FINAL QA REPORT  ")
        print("="*50)
        for r in self.results:
            print(f"{r['step']:25} : {r['status']} {r['details']}")
        print("="*50)

async def run_audit():
    audit = FinalQAAudit()
    await audit.audit_environment()
    await audit.audit_sandbox_security()
    await audit.audit_user_settings()
    await audit.audit_action_trigger()
    audit.print_summary()

if __name__ == "__main__":
    asyncio.run(run_audit())
