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
    Returns None (gracefully) if keys are missing or the client fails to initialize.
    """
    if not create_client or not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        print("Warning: Supabase credentials missing — running without persistence.")
        return None

    try:
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        print("Supabase client initialized successfully.")
        return client
    except Exception as e:
        print(f"Warning: Supabase client failed to initialize: {e}")
        return None
