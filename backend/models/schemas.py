from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime

class RunEvent(BaseModel):
    id: str
    user_id: str
    repo: str
    branch: str
    status: Literal["queued", "running", "completed", "failed", "escalated"]
    run_type: str = "Autonomous Fix"
    mttr_seconds: Optional[float] = None
    error_classes: List[str] = []
    iterations: int = 0
    max_iterations: int = 5
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

class RunStats(BaseModel):
    arr_percent: float = 0.0
    avg_mttr_seconds: float = 0.0
    active_sandboxes: int = 0
    max_sandboxes: int = 200
    bugs_fixed_month: int = 0
    total_runs_month: int = 0

class RepoConfig(BaseModel):
    user_id: Optional[str] = None
    repo_url: str
    branch: str = "main"
    enabled: bool = True
    max_iterations: int = 5
    framework: str = "auto"
    auto_repair: bool = True
    webhook_secret: Optional[str] = None
    notification_channels: List[str] = ["slack"]

class UserProfile(BaseModel):
    user_id: str
    github_username: Optional[str] = None
    github_access_token: Optional[str] = None
    slack_webhook_url: Optional[str] = None
    notify_on_completed: bool = True
    notify_on_escalated: bool = True
    notify_via_email: bool = False
