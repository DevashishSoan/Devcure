from supabase import create_client, Client
import os

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in environment")
    exit(1)

supabase: Client = create_client(url, key)

email = "qa_tester@devcure.ai"
password = "Password123!"

try:
    # Check if user already exists
    # Use auth.admin to skip email verification
    user = supabase.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True
    })
    print(f"User created successfully: {user.user.id}")
except Exception as e:
    print(f"Error: {e}")
