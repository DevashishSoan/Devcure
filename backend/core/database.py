from typing import Optional, Any
from core.config import settings
from functools import lru_cache

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = Any

@lru_cache()
def get_supabase() -> Optional[Client]:
    """
    Initializes and returns a Supabase client.
    Requires SUPABASE_URL and SUPABASE_KEY in settings.
    """
    if not create_client or not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        # Fallback for development if keys are missing or package not installed
        return None
        
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
