from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from core.repair_logic import repair_code_snippet
from core.config import settings

router = APIRouter(prefix="/repair", tags=["Repair"])

class RepairRequest(BaseModel):
    code: str
    error_log: str
    file_name: Optional[str] = "main.py"
    ai_provider: Optional[str] = "gemini"
    personality: Optional[str] = "Surgical"

class RepairResponse(BaseModel):
    diagnosis: str
    confidence_score: int
    patch: str
    safety_passed: bool
    safety_reason: Optional[str] = None

@router.post("/snippet", response_model=RepairResponse)
async def repair_snippet(request: RepairRequest):
    """
    Direct endpoint for AI auto-repair of code snippets.
    Takes code and an error log, returns a diagnosis and a surgical patch.
    """
    try:
        result = await repair_code_snippet(
            code=request.code,
            error_log=request.error_log,
            file_name=request.file_name,
            ai_provider=request.ai_provider,
            personality=request.personality
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Repair failed: {str(e)}")
