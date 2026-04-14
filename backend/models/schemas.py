from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime

class RunEvent(BaseModel):
    id: str
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
    repo_url: str
    branch: str = "main"
    enabled: bool = True
    max_iterations: int = 5
    notification_channels: List[str] = ["slack"]
