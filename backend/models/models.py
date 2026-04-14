from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON
from core.database import Base
from datetime import datetime

class Run(Base):
    __tablename__ = "runs"

    id = Column(String, primary_key=True, index=True)
    repo = Column(String, index=True)
    branch = Column(String)
    status = Column(String)  # queued, running, completed, failed, escalated
    run_type = Column(String, default="Autonomous Fix")
    mttr_seconds = Column(Float, nullable=True)
    error_classes = Column(JSON, default=[])
    iterations = Column(Integer, default=0)
    max_iterations = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class RepositoryConfig(Base):
    __tablename__ = "repo_configs"

    id = Column(Integer, primary_key=True, index=True)
    repo_url = Column(String, unique=True, index=True)
    branch = Column(String, default="main")
    enabled = Column(Boolean, default=True)
    max_iterations = Column(Integer, default=5)
    notification_channels = Column(JSON, default=["slack"])
