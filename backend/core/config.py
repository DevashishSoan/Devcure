from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

# Explicitly load .env from the backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

class Settings(BaseSettings):
    PROJECT_NAME: str = "DevCure Autonomous QA Platform"
    API_V1_STR: str = "/api/v1"
    
    # AI Config (Placeholders - to be updated via .env)
    MINIMAX_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    GITHUB_TOKEN: Optional[str] = None
    GITHUB_WEBHOOK_SECRET: Optional[str] = None

    # Supabase Config
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    
    # Sandbox Config
    SANDBOX_TYPE: str = "local"  # options: local, docker
    SANDBOX_BASE_PATH: str = "./sandboxes"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
