import httpx
import google.generativeai as genai
import asyncio
import logging
from core.config import settings

logger = logging.getLogger(__name__)

def init_ai():
    """Initializes the Gemini AI SDK."""
    if not settings.GEMINI_API_KEY:
        print("Warning: GEMINI_API_KEY not set.")
        return
    genai.configure(api_key=settings.GEMINI_API_KEY)

async def unified_ai_call(provider: str, prompt: str, system_instruction: str = None, max_retries: int = 3) -> str:
    """
    Unified entry point for AI calls. Routes to Gemini or MiniMax.
    """
    if provider.lower() == "minimax":
        return await call_minimax(prompt, system_instruction, max_retries)
    if provider.lower() == "gemma":
        return await call_gemma(prompt, system_instruction, max_retries)
    return await call_gemini(prompt, system_instruction, max_retries)

async def call_gemma(prompt: str, system_instruction: str = None, max_retries: int = 3) -> str:
    """
    Calls Gemma 2 27B via OpenRouter.
    """
    if not settings.GEMMA_API_KEY:
        logger.error("Gemma (OpenRouter) API Key missing.")
        return "AI Error: OpenRouter Key Missing"

    url = f"{settings.OPENROUTER_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GEMMA_API_KEY}",
        "HTTP-Referer": "https://devcure.ai", # Required by OpenRouter
        "X-Title": "DevCure",
        "Content-Type": "application/json"
    }
    
    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": "google/gemma-2-27b-it",
        "messages": messages,
        "temperature": 1.0,
        "max_tokens": 4096
    }

    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.warning(f"Gemma API error: {e}. Attempt {attempt+1}/{max_retries}")
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)
            else:
                logger.error(f"Gemma API Fatal Error: {e}")
                return "ESCALATE"

    return "ESCALATE"

async def call_minimax(prompt: str, system_instruction: str = None, max_retries: int = 3) -> str:
    """
    Calls MiniMax M2.7 via NVIDIA NIM API using an OpenAI-compatible interface.
    """
    if not settings.MINIMAX_API_KEY:
        logger.error("MiniMax API Key missing.")
        return "AI Error: NVIDIA NIM Key Missing"

    url = f"{settings.NVIDIA_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.MINIMAX_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Combined prompt for models that might not have a dedicated 'system_instruction' param 
    # but NVIDIA NIM supports OpenAI format.
    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": "minimaxai/minimax-m2.7",
        "messages": messages,
        "temperature": 1.0,
        "top_p": 0.95,
        "max_tokens": 8192,
        "stream": False
    }

    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.warning(f"MiniMax API error: {e}. Attempt {attempt+1}/{max_retries}")
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)
            else:
                logger.error(f"MiniMax API Fatal Error: {e}")
                return "ESCALATE"

    return "ESCALATE"

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
