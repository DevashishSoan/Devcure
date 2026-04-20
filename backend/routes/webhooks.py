import hmac
import hashlib
import time
import uuid
import logging
from fastapi import APIRouter, Request, BackgroundTasks, Depends, HTTPException
from typing import Optional
from core.runner import run_autonomous_qa_with_config
from core.database import get_supabase
from core.config import settings
from supabase import Client

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])
logger = logging.getLogger(__name__)

# Webhook deduplication
webhook_cache = {}
DEDUPE_WINDOW_SECONDS = 30

def verify_signature(payload: bytes, signature: str) -> bool:
    """Verifies that the webhook payload matches the GitHub signature."""
    if not settings.GITHUB_WEBHOOK_SECRET:
        if settings.QA_MODE:
            logger.warning("GITHUB_WEBHOOK_SECRET is missing! Allowing all webhooks because QA_MODE is ON.")
            return True
        return False
    
    if not signature:
        return False
    
    try:
        sha_name, signature_hash = signature.split('=')
        if sha_name != 'sha256':
            return False
            
        mac = hmac.new(settings.GITHUB_WEBHOOK_SECRET.encode(), msg=payload, digestmod=hashlib.sha256)
        return hmac.compare_digest(mac.hexdigest(), signature_hash)
    except Exception:
        return False


async def get_repo_config(repo_url: str, supabase: Client) -> dict | None:
    """Look up which user has connected this repo and get its configuration."""
    try:
        # Check both full URL and shorthand
        result = supabase.table("repo_configs") \
            .select("*") \
            .or_(f"repo_url.eq.{repo_url},repo_url.ilike.%{repo_url.split('/')[-1]}") \
            .limit(1) \
            .execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
    except Exception as e:
        print(f"Error looking up config for repo {repo_url}: {e}")
    return None

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
        repo_url = payload.get("repository", {}).get("clone_url", "")
        branch = payload.get("ref", "").replace("refs/heads/", "")
        commit_sha = payload.get("after", "")
        
        # 1.2 Webhook Deduplication
        now = time.time()
        if commit_sha in webhook_cache:
            if now - webhook_cache[commit_sha] < DEDUPE_WINDOW_SECONDS:
                logger.info(f"Ignoring duplicate webhook for commit {commit_sha}")
                return {"status": "ignored", "message": "Duplicate push detected within 30s"}
        webhook_cache[commit_sha] = now
        
        # Cleanup cache occasionally
        if len(webhook_cache) > 1000:
            expired = [k for k, v in webhook_cache.items() if now - v > DEDUPE_WINDOW_SECONDS]
            for k in expired: del webhook_cache[k]

        # 1.5 Find the owning user (Multi-tenancy lookup)
        repo_config = await get_repo_config(repo_url, supabase)
        if not repo_config:
            logger.info(f"Received push for unconfigured repo: {repo_url}")
            return {"status": "repo not configured", "message": "Repository not configured in DevCure"}

        user_id = repo_config["user_id"]
        
        # 1.6 Branch Filtering
        configured_branch = repo_config.get("branch", "main")
        if branch != configured_branch:
            logger.info(f"Ignoring push to branch {branch} (Configured: {configured_branch})")
            return {"status": "ignored", "message": f"Push to {branch} ignored."}

        run_id = f"run-{uuid.uuid4().hex[:8]}"
        
        # 2. Create run entry in Supabase with user_id
        if supabase:
            try:
                supabase.table("runs").insert({
                    "id": run_id,
                    "user_id": user_id,
                    "repo": repo_name,
                    "branch": branch,
                    "commit_sha": commit_sha,
                    "status": "queued",
                    "run_type": "Autonomous Fix"
                }).execute()
            except Exception as e:
                logger.error(f"Failed to create run entry in Supabase: {e}")

        # 3. Queue the background task
        max_iterations = repo_config.get("max_iterations", 5)
        logger.info(f"Queueing run {run_id} for {repo_name}@{branch}")
        background_tasks.add_task(run_autonomous_qa_with_config, run_id, user_id, repo_name, branch, max_iterations, supabase)

        return {
            "status": "accepted",
            "run_id": run_id,
            "message": f"Queued autonomous QA run for {repo_name}@{branch}",
        }

    return {"status": "ignored", "event": event_type}
