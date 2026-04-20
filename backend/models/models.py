from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, JSON, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from core.database import Base
from datetime import datetime
import uuid

class Run(Base):
    __tablename__ = "runs"

    id               = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id          = Column(UUID(as_uuid=True), nullable=False, index=True)
    repo             = Column(String, index=True)
    branch           = Column(String)
    status           = Column(String, default="queued")
    run_type         = Column(String, default="Autonomous Fix")
    framework_detected = Column(String, nullable=True)
    
    # Telemetry
    mttr_seconds     = Column(Float, nullable=True)
    agent_time_seconds = Column(Float, nullable=True)
    setup_time_seconds = Column(Float, nullable=True)
    iterations       = Column(Integer, default=0)      
    max_iterations   = Column(Integer, default=5)
    
    # Agent output
    error_classes    = Column(JSONB, default=list)
    diagnosis        = Column(Text, nullable=True)
    proposed_diff    = Column(Text, nullable=True)
    pr_url           = Column(String, nullable=True)
    
    # Safety data
    baseline_failures = Column(JSONB, default=list)
    regressions_found = Column(JSONB, default=list)
    trajectory       = Column(JSONB, default=list)
    
    created_at       = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at       = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class RepositoryConfig(Base):
    __tablename__ = "repo_configs"

    id                    = Column(Integer, primary_key=True, autoincrement=True)
    user_id               = Column(UUID(as_uuid=True), nullable=False, index=True)
    repo_url              = Column(String, unique=False)  # unique per user, not globally
    branch                = Column(String, default="main")
    enabled               = Column(Boolean, default=True)
    max_iterations        = Column(Integer, default=5)
    notification_channels = Column(JSONB, default=list)
    github_access_token   = Column(Text, nullable=True)   # per-user token (Gap 2)
    created_at            = Column(DateTime(timezone=True), default=datetime.utcnow)
