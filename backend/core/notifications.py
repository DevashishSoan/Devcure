import httpx
import time
import logging
from typing import Optional
from core.utils import format_mttr

logger = logging.getLogger(__name__)

async def send_slack_notification(
    webhook_url: str,
    run_id: str,
    repo: str,
    status: str,
    mttr_seconds: Optional[float] = None,
    pr_url: Optional[str] = None,
    escalation_reason: Optional[str] = None
) -> bool:
    """
    Sends a formatted notification to a Slack webhook.
    """
    if not webhook_url:
        return False

    if status == "completed":
        color = "#00ff88"
        title = f"✅ DevCure fixed a bug in {repo}"
        fields = [
            {"title": "MTTR", "value": format_mttr(mttr_seconds), "short": True},
            {"title": "PR", "value": pr_url or "—", "short": True}
        ]
    elif status == "escalated":
        color = "#f97316"
        title = f"⚠️ DevCure needs your help — {repo}"
        fields = [
            {"title": "Reason", "value": escalation_reason or "Max iterations reached"},
            {"title": "Run ID", "value": run_id, "short": True}
        ]
    else:
        # Ignore other statuses like queued/running
        return False

    payload = {
        "attachments": [{
            "color": color,
            "title": title,
            "fields": fields,
            "footer": "DevCure Autonomous QA",
            "ts": int(time.time()),
            "title_link": pr_url if status == "completed" else None
        }]
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                webhook_url,
                json=payload,
                timeout=10
            )
            return response.status_code == 200
    except Exception as e:
        logger.error(f"Slack notification failed: {e}")
        return False
