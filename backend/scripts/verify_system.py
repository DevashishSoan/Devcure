import os
import sys
import asyncio
from dotenv import load_dotenv
from supabase import create_client
import google.generativeai as genai
from openai import OpenAI

# Add parent dir to path so we can import core modules if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

async def verify():
    print(">> DevCure System Verification Initiated\n" + "="*40)
    load_dotenv(".env")
    
    passed = True

    # 1. Supabase Check
    try:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")
        s = create_client(url, key)
        res = s.table("user_profiles").select("count", count="exact").execute()
        print(f"PASSED: Supabase connected (Count: {res.count})")
    except Exception as e:
        print(f"FAILED: Supabase connection - {e}")
        passed = False

    # 2. GitHub Check
    try:
        from github import Github
        token = os.getenv("GITHUB_TOKEN")
        g = Github(token)
        user = g.get_user()
        print(f"PASSED: GitHub authorized as {user.login}")
    except Exception as e:
        print(f"FAILED: GitHub authorization - {e}")
        passed = False

    # 3. AI Brain Pings
    # 3.1 Gemini
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        # Using gemini-1.5-flash-latest or similar
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("ping")
        if response.text:
            print("PASSED: Brain (Gemini) active")
    except Exception as e:
        # Fallback check for gemini-pro if flash 404s
        try:
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content("ping")
            print("PASSED: Brain (Gemini - Pro) active")
        except:
             print(f"FAILED: Brain (Gemini) - {e}")
             passed = False

    # 3.2 MiniMax (NVIDIA)
    try:
        client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=os.getenv("MINIMAX_API_KEY")
        )
        completion = client.chat.completions.create(
            model="minimaxai/minimax-m2.7",
            messages=[{"role":"user","content":"hello"}],
            max_tokens=5
        )
        if completion.choices[0].message.content:
            print("PASSED: Brain (MiniMax) active")
    except Exception as e:
        print(f"FAILED: Brain (MiniMax) - {e}")
        passed = False

    # 3.3 Gemma (OpenRouter)
    try:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("GEMMA_API_KEY")
        )
        completion = client.chat.completions.create(
            model="google/gemma-2-27b-it",
            messages=[{"role":"user","content":"hello"}],
            max_tokens=5
        )
        if completion.choices[0].message.content:
            print("PASSED: Brain (Gemma) active")
    except Exception as e:
        print(f"FAILED: Brain (Gemma) - {e}")
        passed = False

    # 4. Sandbox Check
    sb_path = os.getenv("SANDBOX_BASE_PATH", "./sandboxes")
    if not os.path.isabs(sb_path):
        sb_path = os.path.join(os.getcwd(), sb_path)
        
    if os.path.exists(sb_path):
        print(f"PASSED: Sandbox directory ready ({sb_path})")
    else:
        try:
            os.makedirs(sb_path, exist_ok=True)
            print(f"PASSED: Sandbox directory created ({sb_path})")
        except Exception as e:
            print(f"FAILED: Sandbox write permission - {e}")
            passed = False

    print("\n" + "="*40)
    if passed:
        print("RESULT: ALL SYSTEMS NOMINAL. READY FOR AUTONOMOUS DEPLOYMENT.")
    else:
        print("RESULT: SYSTEM DEGRADED. CHECK ERRORS ABOVE.")

if __name__ == "__main__":
    asyncio.run(verify())
