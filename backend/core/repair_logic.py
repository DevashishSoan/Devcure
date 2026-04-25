import re
import logging
from typing import Optional, Dict, Any
from core.ai import unified_ai_call
from core.safety import validate_patch_safety, parse_agent_response

logger = logging.getLogger(__name__)

async def repair_code_snippet(
    code: str, 
    error_log: str, 
    file_name: str = "unknown_file.py",
    ai_provider: str = "gemini",
    personality: str = "Surgical"
) -> Dict[str, Any]:
    """
    Standalone function to repair a code snippet based on an error log.
    Returns a dictionary with diagnosis, patch, and confidence.
    """
    
    system_instruction = (
        f"You are a surgical code repair agent with a '{personality}' persona. "
        "Your task is to analyze the provided code and error log, diagnose the issue, and provide a surgical fix. "
        "You MUST output your response in exactly this format and nothing else:\n"
        "DIAGNOSIS: <technical analysis of the error>\n"
        "CONFIDENCE: <integer 0-100>\n"
        "PATCH:\n<unified diff>\n"
        "\n"
        "CONFIDENCE must reflect how certain you are the patch fixes the issue without regressions. "
        "Focus ONLY on fixing the provided code. Output the PATCH as a unified diff."
    )
    
    prompt = (
        f"FILE NAME: {file_name}\n\n"
        f"ERROR LOG:\n{error_log}\n\n"
        f"ORIGINAL CODE:\n{code}\n\n"
        "Analyze the error and provide the diagnosis, confidence score, and surgical patch now:"
    )

    response = await unified_ai_call(ai_provider, prompt, system_instruction=system_instruction)
    
    # Parsing
    diagnosis_match = re.search(r"DIAGNOSIS:\s*(.*?)CONFIDENCE:", response, re.S | re.I)
    confidence_match = re.search(r"CONFIDENCE:\s*(\d+)", response, re.I)
    patch_section_match = re.search(r"PATCH:\s*(.+)", response, re.S | re.I)
    
    diagnosis = diagnosis_match.group(1).strip() if diagnosis_match else "No diagnosis provided."
    confidence_score = int(confidence_match.group(1)) if confidence_match else 0
    patch_response = patch_section_match.group(1).strip() if patch_section_match else response
    
    patch_diff = parse_agent_response(patch_response)
    
    # Safety validation (optional for standalone but good practice)
    safety = validate_patch_safety(patch_diff)
    
    return {
        "diagnosis": diagnosis,
        "confidence_score": confidence_score,
        "patch": patch_diff,
        "safety_passed": safety.passed,
        "safety_reason": safety.reason if not safety.passed else None
    }
