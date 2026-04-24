import time
import logging
import os
import uuid
from supabase import Client
from core.config import settings
from agents.test_gen import test_gen_agent
from sandbox.manager import sandbox_manager
from core.notifications import send_slack_notification

logger = logging.getLogger(__name__)

async def run_autonomous_qa_with_config(run_id: str, user_id: str, repo: str, branch: str, max_iterations: int, supabase: Client):
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
        
        # 2. Fetch User Profile for Neuro-Configuration (Personality, Thresholds)
        profile_res = supabase.table("user_profiles") \
            .select("agent_personality, auto_repair_threshold, max_repair_iterations, ai_provider") \
            .eq("user_id", user_id) \
            .execute()
        
        profile = profile_res.data[0] if profile_res.data else {}
        agent_personality = profile.get("agent_personality", "Surgical")
        max_iterations = profile.get("max_repair_iterations", max_iterations)
        auto_repair_threshold = profile.get("auto_repair_threshold", 0.7)
        ai_provider = profile.get("ai_provider", "gemini")

        # 2.5 Update status to running and record setup telemetry
        if supabase:
            supabase.table("runs").update({
                "status": "running",
                "setup_time_seconds": setup_time_seconds,
                "updated_at": "now()"
            }).eq("id", run_id).execute()
        
        # 3. Execute LangGraph Agent
        state = {
            "run_id": run_id,
            "user_id": user_id,            
            "sandbox_id": sandbox["id"],
            "repo_path": sandbox["path"],
            "repo_full_name": repo,        
            "branch": branch,              
            "files": [],
            "failures": [],
            "baseline_failures": [], 
            "target_test_names": [],
            "diagnosis": None,
            "repair_diff": None,
            "pr_url": None,
            "iteration": 0,
            "max_iterations": max_iterations,
            "auto_repair_threshold": auto_repair_threshold,
            "agent_personality": agent_personality,
            "ai_provider": ai_provider,
            "status": "starting",
            "target_file": None,
            "run_start_time": run_start_time,
            "setup_time_seconds": setup_time_seconds,
            "agent_start_time": time.time(),
            "trajectory": [],
            "framework_detected": None
        }
        
        final_state = await test_gen_agent.ainvoke(state)
        
        # 4. Final update (Agent completion)
        if supabase:
            try:
                status = final_state["status"]
                update_payload = {
                    "status": status,
                    "iterations": final_state["iteration"],
                    "updated_at": "now()"
                }
                
                # Calculate MTTR
                mttr_seconds = round(time.time() - run_start_time, 2)
                update_payload["mttr_seconds"] = mttr_seconds

                if final_state.get("pr_url"):
                    update_payload["pr_url"] = final_state["pr_url"]
                
                supabase.table("runs").update(update_payload).eq("id", run_id).execute()

                # Trigger Notifications
                profile_res = supabase.table("user_profiles") \
                    .select("slack_webhook_url, notify_on_completed, notify_on_escalated") \
                    .eq("user_id", user_id) \
                    .single() \
                    .execute()
                
                profile = profile_res.data
                if profile and profile.get("slack_webhook_url"):
                    should_notify = (status == "completed" and profile.get("notify_on_completed")) or \
                                    (status == "escalated" and profile.get("notify_on_escalated"))
                    
                    if should_notify:
                        await send_slack_notification(
                            webhook_url=profile["slack_webhook_url"],
                            run_id=run_id,
                            repo=repo,
                            status=status,
                            mttr_seconds=mttr_seconds,
                            pr_url=final_state.get("pr_url")
                        )

            except Exception as e:
                logger.error(f"Final status sync or notification failed for run {run_id}: {e}")
        
    except Exception as e:
        logger.error(f"Error in autonomous run {run_id}: {e}", exc_info=True)
        if supabase:
            supabase.table("runs").update({"status": "failed"}).eq("id", run_id).execute()
    finally:
        pass
