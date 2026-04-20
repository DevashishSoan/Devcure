import warnings
# Suppress the loud google-generativeai deprecation warning (must be before import)
warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")

import google.generativeai as genai
import asyncio
from core.config import settings

def init_ai():
    """Initializes the Gemini AI SDK."""
    if not settings.GEMINI_API_KEY:
        print("Warning: GEMINI_API_KEY not set.")
        return
    genai.configure(api_key=settings.GEMINI_API_KEY)

async def call_gemini(prompt: str, system_instruction: str = None, max_retries: int = 3) -> str:
    """
    Calls Gemini 2.0 Flash with the given prompt and exponential backoff retry logic.
    """
    if not settings.GEMINI_API_KEY:
        return "AI Error: Mission Key Missing"

    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=system_instruction
    )

    for attempt in range(max_retries):
        try:
            response = await model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            err_str = str(e).lower()
            
            # 429: Quota, 500/503: Server error
            if "429" in err_str or "500" in err_str or "503" in err_str:
                wait = 2 ** attempt
                print(f"Gemini API error ({err_str}). Retrying in {wait}s... (Attempt {attempt+1}/{max_retries})")
                await asyncio.sleep(wait)
                continue
            
            # Non-retryable error (e.g. 400 Bad Request)
            print(f"Gemini API Fatal Error: {err_str}")
            return "ESCALATE" # Signal to agent to stop
            
    return "ESCALATE" # Max retries exhausted

# Initialize on import
init_ai()
