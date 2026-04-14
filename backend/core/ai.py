import google.generativeai as genai
from core.config import settings

def init_ai():
    """Initializes the Gemini AI SDK."""
    if not settings.GEMINI_API_KEY:
        print("Warning: GEMINI_API_KEY not set.")
        return
    genai.configure(api_key=settings.GEMINI_API_KEY)

async def call_gemini(prompt: str, system_instruction: str = None) -> str:
    """
    Calls Gemini 1.5 Flash with the given prompt.
    """
    if not settings.GEMINI_API_KEY:
        return "AI Error: Mission Key Missing"

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=system_instruction
        )
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return f"AI Error: {str(e)}"

# Initialize on import
init_ai()
