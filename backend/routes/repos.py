from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import secrets
from models.schemas import RepoConfig
from core.database import get_supabase
from core.auth import get_current_user
from supabase import Client

router = APIRouter(prefix="/repos", tags=["Repositories"])

def _normalize_repo_url(url: str) -> str:
    """Removes trailing .git and whitespace to ensure consistent indexing."""
    url = url.strip()
    if url.endswith(".git"):
        url = url[:-4]
    return url

@router.get("/", response_model=List[dict])
async def list_repo_configs(
    user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Returns all repository configurations for the authenticated user."""
    user_id = user.get("sub")
    
    response = supabase.table("repo_configs") \
        .select("*") \
        .eq("user_id", user_id) \
        .execute()
    return response.data

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_repo_config(
    config: RepoConfig,
    user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Registers a new repository for autonomous monitoring."""
    user_id = user.get("sub")
    
    payload = config.dict()
    payload["user_id"] = user_id
    payload["repo_url"] = _normalize_repo_url(payload["repo_url"])
    payload["webhook_secret"] = secrets.token_hex(32) # Generate per-repo secret
    
    try:
        response = supabase.table("repo_configs").insert(payload).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create repository configuration")
        return response.data[0]
    except Exception as e:
        # Check if it's a duplicate key error (code 23505)
        if "23505" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Repository '{config.repo_url}' is already connected."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

@router.patch("/{repo_id}")
async def update_repo_config(
    repo_id: str,
    config_update: dict,
    user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Updates an existing repository configuration."""
    user_id = user.get("sub")
    
    # Filter out sensitive fields or those that shouldn't be updated via PATCH
    allowed_fields = {"branch", "enabled", "max_iterations", "framework", "auto_repair", "notification_channels"}
    update_data = {k: v for k, v in config_update.items() if k in allowed_fields}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid update fields provided")
        
    response = supabase.table("repo_configs") \
        .update(update_data) \
        .eq("id", repo_id) \
        .eq("user_id", user_id) \
        .execute()
        
    if not response.data:
        raise HTTPException(status_code=404, detail="Repository not found or access denied")
        
    return response.data[0]

@router.delete("/{repo_id}")
async def delete_repo_config(
    repo_id: str,
    user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Removes a repository configuration."""
    user_id = user.get("sub")
    
    response = supabase.table("repo_configs") \
        .delete() \
        .eq("id", repo_id) \
        .eq("user_id", user_id) \
        .execute()
        
    return {"status": "success"}
