from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status, Body, Request
from typing import List, Optional
from pydantic import BaseModel
from models.schemas import RunEvent, RunStats
from core.config import settings
from core.database import get_supabase
from core.auth import get_current_user
from core.runner import run_autonomous_qa_with_config
from supabase import Client
from core.github import github_service
import os
import time
import uuid
import logging

logger = logging.getLogger(__name__)

class ManualRunRequest(BaseModel):
    repo_id: str
    commit_sha: str = "HEAD"
    branch: str = "main"

class ActionRunRequest(BaseModel):
    """Payload format expected by the devcure/auto-heal GitHub Action."""
    repo_url: str                        # e.g. https://github.com/org/repo
    branch: str = "main"
    framework: str = ""                  # auto-detect if empty
    confidence_threshold: int = 70       # 0-100; below this → escalate for human review

router = APIRouter(prefix="/runs", tags=["Runs"])

@router.get("/", response_model=List[dict])
async def list_runs(
    user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Returns all recent autonomous runs for the authenticated user."""
    user_id = user.get("sub")
    if not supabase:
        return []
    
    response = supabase.table("runs").select("*") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .limit(50) \
        .execute()
    return response.data

@router.get("/stats")
async def get_stats(
    user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Returns aggregated dashboard statistics for the authenticated user."""
    user_id = user.get("sub")
    if not supabase:
        return {
            "arr_percent": 0.0,
            "avg_mttr_seconds": 0.0,
            "active_sandboxes": 0,
            "bugs_fixed_month": 0,
            "total_runs": 0,
        }

    # 1. Total Runs
    total_res = supabase.table("runs").select("id", count="exact").eq("user_id", user_id).execute()
    total_count = total_res.count or 0

    # 2. Completed Runs (Success Rate)
    completed_res = supabase.table("runs").select("mttr_seconds", count="exact") \
        .eq("user_id", user_id) \
        .eq("status", "completed") \
        .execute()
    completed_count = completed_res.count or 0
    
    # 3. Monthly Fixes
    from datetime import datetime, timedelta
    first_day_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    monthly_res = supabase.table("runs").select("id", count="exact") \
        .eq("user_id", user_id) \
        .eq("status", "completed") \
        .gte("created_at", first_day_of_month) \
        .execute()
    monthly_fixes = monthly_res.count or 0

    # 4. Active Sandboxes
    active_res = supabase.table("runs").select("id", count="exact") \
        .eq("user_id", user_id) \
        .eq("status", "running") \
        .execute()
    active_sandboxes = active_res.count or 0

    # 5. MTTR Calculation
    mttrs = [r["mttr_seconds"] for r in completed_res.data if r.get("mttr_seconds")]
    avg_mttr = sum(mttrs) / max(len(mttrs), 1)
    
    arr = (completed_count / total_count * 100) if total_count > 0 else 0

    return {
        "autonomous_resolution_rate": round(arr, 1),
        "mean_time_to_resolution": round(avg_mttr, 1),
        "active_sandboxes": active_sandboxes,
        "bugs_fixed_month": monthly_fixes,
        "total_runs": total_count,
    }

@router.post("/demo", status_code=status.HTTP_201_CREATED)
async def trigger_demo_run(
    user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Creates a simulated autonomous run to demonstrate system capability 
    and complete onboarding immediately.
    """
    user_id = user.get("sub")
    run_id = f"run-demo-{uuid.uuid4().hex[:6]}"
    
    # Pre-populate trajectory with realistic AI agent steps
    demo_trajectory = [
        {"timestamp": time.time() - 120, "step": "Initialization", "message": "Neural engine online. Cloning workspace..."},
        {"timestamp": time.time() - 100, "step": "Scanning", "message": "Detected regression in repository: auth_service.py"},
        {"timestamp": time.time() - 80, "step": "Diagnostics", "message": "Analyzing trace logs... Root cause: Off-by-one error in JWT validator"},
        {"timestamp": time.time() - 60, "step": "Repair", "message": "Drafting surgical patch..."},
        {"timestamp": time.time() - 30, "step": "Validation", "message": "Patch verified in sandbox. ALL TESTS PASSED."}
    ]

    # Create the demo run record
    supabase.table("runs").insert({
        "id": run_id,
        "user_id": user_id,
        "repo": "demo/devcure-core",
        "branch": "main",
        "status": "running",
        "run_type": "Instant Activation",
        "trajectory": demo_trajectory,
        "mttr_seconds": 180,
        "iterations": 1
    }).execute()
    
    return {"run_id": run_id, "status": "running"}

@router.get("/{run_id}")
async def get_run(
    run_id: str,
    user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Returns details for a specific run, verifying ownership."""
    user_id = user.get("sub")
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")
        
    response = supabase.table("runs").select("*") \
        .eq("id", run_id) \
        .eq("user_id", user_id) \
        .single() \
        .execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Run not found")
        
    return response.data

@router.get("/{run_id}/logs")
async def get_run_logs(
    run_id: str,
    user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Returns real-time trajectory logs for a specific run."""
    user_id = user.get("sub")
    
    response = supabase.table("runs").select("trajectory") \
        .eq("id", run_id) \
        .eq("user_id", user_id) \
        .single() \
        .execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Run not found")
        
    return response.data.get("trajectory", [])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def trigger_manual_run(
    raw_request: Request,
    background_tasks: BackgroundTasks,
    user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Triggers a manual autonomous QA run for a given repository."""
    print("DEBUG: trigger_manual_run reached!")
    body = await raw_request.json()
    repo_id = body.get("repo_id")
    branch = body.get("branch", "main")
    commit_sha = body.get("commit_sha", "HEAD")
    
    if not repo_id:
        raise HTTPException(status_code=422, detail="repo_id is required")

    user_id = user.get("sub")
    
    # 1. Verify repository ownership
    repo_res = supabase.table("repo_configs") \
        .select("*") \
        .eq("id", repo_id) \
        .eq("user_id", user_id) \
        .single() \
        .execute()
    
    repo_config = repo_res.data
    if not repo_config:
        raise HTTPException(status_code=404, detail="Repository not found or access denied")
    
    # 1.1 Robust repo_name extraction
    try:
        url_parts = repo_config["repo_url"].rstrip("/").replace(".git", "").split("/")
        if len(url_parts) < 2:
            raise ValueError("Malformed repo URL")
        repo_name = f"{url_parts[-2]}/{url_parts[-1]}"
    except Exception:
        repo_name = repo_config["repo_url"]
        
    run_id = f"run-{uuid.uuid4().hex[:8]}"
    
    # 2. Create the run record
    supabase.table("runs").insert({
        "id": run_id,
        "user_id": user_id,
        "repo": repo_name,
        "branch": branch,
        "commit_sha": commit_sha,
        "status": "queued",
        "run_type": "Manual Trigger",
        "max_iterations": repo_config.get("max_iterations", 5)
    }).execute()
    
    # 3. Queue the background task
    background_tasks.add_task(
        run_autonomous_qa_with_config, 
        run_id, 
        user_id, 
        repo_name, 
        branch, 
        repo_config.get("max_iterations", 5), 
        supabase
    )
    
    return {"run_id": run_id, "status": "queued"}

@router.post("/{run_id}/apply")
async def apply_fix(
    run_id: str,
    user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Triggers the creation of a GitHub Pull Request for a completed repair.
    Verifies ownership before applying.
    """
    user_id = user.get("sub")
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not available")

    # 1. Fetch run details (scoped to user)
    run_res = supabase.table("runs").select("*") \
        .eq("id", run_id) \
        .eq("user_id", user_id) \
        .single() \
        .execute()
    run = run_res.data
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    if not run.get("sandbox_id") or not run.get("repo"):
        raise HTTPException(status_code=400, detail="Run lacks infrastructure data to apply fix")

    # 2. Push changes to a new branch
    branch_name = f"devcure/fix-{run_id}"
    sandbox_path = os.path.join(settings.SANDBOX_BASE_PATH, run["sandbox_id"])
    
    success = github_service.push_changes(sandbox_path, run["repo"], branch_name)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to push changes to GitHub")

    # 3. Create Pull Request with Rich Report
    confidence = run.get("confidence_score", 0)
    confidence_color = "brightgreen" if confidence >= 90 else "yellow" if confidence >= 70 else "orange"
    
    pr_body = (
        f"## 🧬 DevCure Autonomous Repair Report\n\n"
        f"![Confidence Score](https://img.shields.io/badge/Confidence-{confidence}%25-{confidence_color}?style=for-the-badge&logo=ai)\n\n"
        f"### 🔍 Diagnosis\n"
        f"> {run.get('diagnosis', 'No diagnosis available')}\n\n"
        f"### 🧠 Reasoning Trace Summary\n"
        f"The DevCure Neural Engine analyzed the failure and generated this surgical patch. "
        f"The fix was verified in an isolated sandbox environment with resource limits (512MB RAM / 2 CPU).\n\n"
        f"### 🔗 Visual Replay\n"
        f"[View full audit trajectory in DevCure Dashboard]({settings.FRONTEND_URL}/runs/{run_id})\n\n"
        f"---\n"
        f"*This PR was generated autonomously by [DevCure](https://github.com/DevashishSoan/DevCure).*"
    )

    pr_url = await github_service.create_pull_request(
        repo_full_name=run["repo"],
        title=f"DevCure Auto-Fix: {run_id}",
        body=pr_body,
        head=branch_name,
        base=run.get("branch", "main")
    )

    if not pr_url:
        raise HTTPException(status_code=500, detail="Failed to open Pull Request on GitHub")

    # 4. Update Supabase
    supabase.table("runs").update({
        "status": "completed",
        "pr_url": pr_url
    }).eq("id", run_id).execute()

    return {"status": "success", "pr_url": pr_url}


@router.post("/trigger", status_code=status.HTTP_201_CREATED)
async def trigger_action_run(
    run_request: ActionRunRequest,
    background_tasks: BackgroundTasks,
    user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Trigger endpoint for the devcure/auto-heal GitHub Action.
    Accepts a repo_url directly — no pre-configured repo record required.
    Returns a run_id for polling.
    """
    user_id = user.get("sub")

    # Normalise repo_url → owner/repo
    try:
        url_parts = run_request.repo_url.rstrip("/").replace(".git", "").split("/")
        if len(url_parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid GitHub repository URL format")
        repo_name = f"{url_parts[-2]}/{url_parts[-1]}"
    except Exception:
        raise HTTPException(status_code=400, detail="Could not parse repository owner and name from URL")
        
    run_id = f"run-{uuid.uuid4().hex[:8]}"

    # Fetch user settings for agent config (from user_profiles table)
    settings_res = supabase.table("user_profiles") \
        .select("*").eq("user_id", user_id).execute()
    user_settings = settings_res.data[0] if settings_res.data else {}

    # Convert confidence_threshold (0-100 int) → float (0.0-1.0)
    confidence_float = run_request.confidence_threshold / 100.0

    supabase.table("runs").insert({
        "id": run_id,
        "user_id": user_id,
        "repo": repo_name,
        "branch": run_request.branch,
        "status": "queued",
        "run_type": "GitHub_Action",
        "max_iterations": user_settings.get("max_repair_iterations", 5),
    }).execute()

    background_tasks.add_task(
        run_autonomous_qa_with_config,
        run_id,
        user_id,
        repo_name,
        run_request.branch,
        user_settings.get("max_repair_iterations", 5),
        supabase,
    )

    logger.info(f"GitHub Action triggered run {run_id} for {repo_name}@{run_request.branch}")
    return {"run_id": run_id, "status": "queued", "repo": repo_name}


@router.get("/{run_id}/trace")
async def get_run_trace(
    run_id: str,
    user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Returns the full structured reasoning trace for a run.
    Used by the dashboard replay feature and the Action's PR comment bot.
    """
    user_id = user.get("sub")

    response = supabase.table("runs") \
        .select("id, status, repo, branch, framework_detected, diagnosis, repair_diff, pr_url, mttr_seconds, confidence_score, trajectory") \
        .eq("id", run_id) \
        .eq("user_id", user_id) \
        .single() \
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Run not found")

    run = response.data
    return {
        "run_id": run["id"],
        "status": run["status"],
        "repo": run.get("repo"),
        "branch": run.get("branch"),
        "framework": run.get("framework_detected"),
        "diagnosis": run.get("diagnosis"),
        "repair_diff": run.get("repair_diff"),
        "pr_url": run.get("pr_url"),
        "mttr_seconds": run.get("mttr_seconds"),
        "confidence_score": run.get("confidence_score"),
        "trace": run.get("trajectory", []),
    }
