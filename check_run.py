import os
import json
import time
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "backend", ".env"))

try:
    from supabase import create_client
    
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    supabase = create_client(url, key)

    res = supabase.table("runs").select("id, status, framework_detected, iterations, mttr_seconds, pr_url").order("created_at", desc=True).limit(1).execute()
    
    if len(res.data) > 0:
        run = res.data[0]
        print(json.dumps(run, indent=2))
    else:
        print("No runs found in Supabase.")
        
except Exception as e:
    print(f"Error querying Supabase: {e}")
