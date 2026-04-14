from fastapi import APIRouter, Request, BackgroundTasks, Depends, HTTPException
from typing import Optional, Any
from core.database import get_supabase
from agents.test_gen import test_gen_agent
from sandbox.manager import sandbox_manager
try:
    from supabase import Client
except ImportError:
    Client = Any
from core.config import settings
import uuid
import asyncio
import time
import hmac
import hashlib

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

def verify_signature(payload_body: bytes, signature_header: str) -> bool:
    """Verifies that the payload was signed by GitHub using the configured secret."""
    if not signature_header or not settings.GITHUB_WEBHOOK_SECRET:
        return False
    
    expected = hmac.new(
        settings.GITHUB_WEBHOOK_SECRET.encode(),
        payload_body,
        hashlib.sha256
    ).hexdigest()
    
    expected_header = f"sha256={expected}"
    
    # Timing-safe comparison to prevent side-channel attacks
    return hmac.compare_digest(expected_header, signature_header)

async def run_autonomous_qa(run_id: str, repo: str, branch: str, supabase: Client):
    """
    Background task to execute the LangGraph agent cycle.
    """
    run_start_time = time.time()
    try:
        # 1. Create sandbox with PAT token
        sandbox = sandbox_manager.create_sandbox(
            repo_url=f"https://github.com/{repo}",
            token=settings.GITHUB_TOKEN
        )
        
        # 1.5 Prepare environment (pip install)
        sandbox_manager.install_dependencies(sandbox["id"])
        setup_time_seconds = round(time.time() - run_start_time, 2)
        
        # 2. Update status to running and record setup telemetry
        if supabase:
            supabase.table("runs").update({
                "status": "running",
                "setup_time_seconds": setup_time_seconds,
                "updated_at": "now()"
            }).eq("id", run_id).execute()
        
        # 3. Execute LangGraph Agent
        state = {
            "run_id": run_id,
            "sandbox_id": sandbox["id"],
            "repo_path": sandbox["path"],
            "repo_full_name": repo,        # e.g. "DevashishSoan/Devcure"
            "branch": branch,              # e.g. "test/autonomous-repair"
            "files": [],
            "failures": [],
            "baseline_failures": set(),
            "target_test_names": set(),
            "diagnosis": None,
            "repair_diff": None,
            "pr_url": None,
            "iteration": 0,
            "max_iterations": 5,
            "status": "starting",
            "target_file": None,
            "run_start_time": run_start_time,
            "setup_time_seconds": setup_time_seconds,
            "agent_start_time": time.time(),
            "trajectory": [],
            "framework_detected": None
        }
        
        final_state = await test_gen_agent.ainvoke(state)
        
        # 4. Final update (Agent completion - MTTR will be updated in verification_node Option A)
        # But we ensure status and iterations are synced here too.
        if supabase:
            try:
                update_payload = {
                    "status": final_state["status"],
                    "iterations_used": final_state["iteration"],
                    "updated_at": "now()"
                }
                if final_state.get("pr_url"):
                    update_payload["pr_url"] = final_state["pr_url"]
                supabase.table("runs").update(update_payload).eq("id", run_id).execute()
            except Exception as e:
                print(f"Warning: Final status sync failed: {e}")
        
    except Exception as e:
        print(f"Error in autonomous run {run_id}: {e}")
        if supabase:
            supabase.table("runs").update({"status": "failed"}).eq("id", run_id).execute()
    finally:
        # Cleanup (Optional: keep for debugging if failed)
        # sandbox_manager.cleanup_sandbox(sandbox["id"])
        pass

@router.post("/github")
async def github_webhook(
    request: Request, 
    background_tasks: BackgroundTasks,
    supabase: Client = Depends(get_supabase)
):
    """
    Receives GitHub push events and triggers the autonomous QA pipeline.
    """
    # 1. Verify Signature
    signature = request.headers.get("X-Hub-Signature-256")
    body = await request.body()
    
    if not verify_signature(body, signature):
        raise HTTPException(status_code=403, detail="Forbidden")

    payload = await request.json()
    event_type = request.headers.get("X-GitHub-Event", "unknown")

    if event_type == "push":
        repo_name = payload.get("repository", {}).get("full_name", "unknown")
        branch = payload.get("ref", "").replace("refs/heads/", "")
        
        run_id = f"run-{uuid.uuid4().hex[:8]}"
        
        # 1. Create run entry in Supabase
        if supabase:
            try:
                supabase.table("runs").insert({
                    "id": run_id,
                    "repo": repo_name,
                    "branch": branch,
                    "status": "queued",
                    "run_type": "Autonomous Fix"
                }).execute()
            except Exception as e:
                print(f"Warning: Failed to create run entry in Supabase: {e}")

        # 2. Queue the background task
        background_tasks.add_task(run_autonomous_qa, run_id, repo_name, branch, supabase)

        return {
            "status": "accepted",
            "run_id": run_id,
            "message": f"Queued autonomous QA run for {repo_name}@{branch}",
        }

    return {"status": "ignored", "event": event_type}
