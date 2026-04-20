from fastapi import APIRouter, Depends, HTTPException
from models.schemas import UserProfile
from core.database import get_supabase
from core.auth import get_current_user
from supabase import Client
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/user", tags=["User Settings"])

@router.get("/settings", response_model=dict)
async def get_user_settings(
    user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Returns the notification preferences for the authenticated user and auto-initializes if missing."""
    user_id = user.get("sub")
    
    response = supabase.table("user_profiles") \
        .select("slack_webhook_url, notify_on_completed, notify_on_escalated, notify_via_email") \
        .eq("user_id", user_id) \
        .execute()
        
    if not response.data:
        # Create a default profile if it doesn't exist (failsafe for the trigger)
        default_profile = {
            "user_id": user_id,
            "slack_webhook_url": None,
            "notify_on_completed": True,
            "notify_on_escalated": True,
            "notify_via_email": False
        }
        try:
            insert_res = supabase.table("user_profiles").insert(default_profile).execute()
            if insert_res.data:
                return {k: v for k, v in insert_res.data[0].items() if k != "id" and k != "user_id"}
        except Exception as e:
            logger.error(f"Failed to auto-initialize profile: {e}")
            
        return default_profile
        
    return response.data[0]

@router.patch("/settings")
async def update_user_settings(
    settings_update: dict,
    user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Updates the notification preferences for the authenticated user."""
    user_id = user.get("sub")
    
    allowed_fields = {"slack_webhook_url", "notify_on_completed", "notify_on_escalated", "notify_via_email"}
    update_data = {k: v for k, v in settings_update.items() if k in allowed_fields}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid settings fields provided")
        
    response = supabase.table("user_profiles") \
        .update(update_data) \
        .eq("user_id", user_id) \
        .execute()
        
    if not response.data:
        raise HTTPException(status_code=404, detail="User profile not found")
        
    return response.data[0]
