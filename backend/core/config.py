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
    SUPABASE_SERVICE_KEY: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None
    
    # Sandbox Config
    SANDBOX_TYPE: str = "local"  # options: local, docker
    SANDBOX_BASE_PATH: str = "./sandboxes"
    
    # Production / Security Config
    VERCEL_URL: str = "https://your-app.vercel.app"
    ENVIRONMENT: str = "production"
    VERSION: str = "1.0.0"
    
    # QA Mode (DO NOT ENABLE IN PRODUCTION)
    QA_MODE: bool = False
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

    def validate(self):
        """Validates critical security settings."""
        if self.ENVIRONMENT == "production":
            required_secrets = {
                "GITHUB_WEBHOOK_SECRET": 32,
                "SUPABASE_JWT_SECRET": 32,
            }
            
            for key, min_len in required_secrets.items():
                val = getattr(self, key, None)
                if not val or val == "ROTATE_NOW_AND_KEEP_SECRET":
                    raise ValueError(f"{key} must be configured in production")
                if len(val) < min_len:
                    raise ValueError(f"{key} is too short (min {min_len} chars)")
            
            # Critical AI/Database keys presence
            for key in ["GEMINI_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_KEY"]:
                if not getattr(self, key, None):
                    raise ValueError(f"{key} is required in production")

settings = Settings()
if os.getenv("ENVIRONMENT") == "production":
    settings.validate()
