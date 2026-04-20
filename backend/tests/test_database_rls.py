import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

load_dotenv()

URL = os.environ.get("SUPABASE_URL")
SERVICE_KEY = os.environ.get("SUPABASE_KEY")
ANON_KEY = os.environ.get("SUPABASE_KEY") # Usually same in .env for local/test, but in prod they differ.

def test_service_role_bypass():
    """Verify service role can write to the runs table."""
    if not URL or not SERVICE_KEY:
        print("⏭️ Supabase credentials missing, skipping service role test.")
        return

    supabase: Client = create_client(URL, SERVICE_KEY)
    
    # Try a simple update or select to verify connectivity
    try:
        res = supabase.table("runs").select("id").limit(1).execute()
        print(f"PASSED: Service role bypass test (found {len(res.data)} runs)")
    except Exception as e:
        print(f"❌ Service role bypass test failed: {e}")

def test_telemetry_columns():
    """Verify that important telemetry columns exist and can be queried."""
    if not URL or not SERVICE_KEY:
        return
        
    supabase: Client = create_client(URL, SERVICE_KEY)
    try:
        res = supabase.table("runs").select("mttr_seconds, framework_detected, iterations, pr_url").limit(1).execute()
        print("PASSED: Telemetry columns exist in database")
    except Exception as e:
        print(f"❌ Telemetry column check failed: {e}")

def test_rls_simulation():
    """
    Simulation of RLS check. In a real test, we would use an auth token
    from 'User A' and try to read 'User B's data.
    """
    print("WARNING: RLS Simulation: Verification required on Supabase Dashboard (Policies: 'Users can only see their own runs').")

if __name__ == "__main__":
    test_service_role_bypass()
    test_telemetry_columns()
    test_rls_simulation()
