import os
from supabase import create_client, Client

# Usage: python scratch/migrate_ab_events.py
# This script attempts to verify if the ab_events table exists or 
# reminds the user to run the SQL in the dashboard.

def run_migration():
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not url or not key:
        print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in environment.")
        return

    supabase: Client = create_client(url, key)
    
    # Supabase-py doesn't support raw SQL. 
    # We will try to insert a dummy record to see if the table exists.
    try:
        res = supabase.table("ab_events").select("*").limit(1).execute()
        print("✅ Table 'ab_events' already exists.")
    except Exception as e:
        print("❌ Table 'ab_events' does not exist or is inaccessible.")
        print("\nPLEASE RUN THIS SQL IN YOUR SUPABASE DASHBOARD:\n")
        print("""
CREATE TABLE IF NOT EXISTS ab_events (
  id uuid primary key default gen_random_uuid(),
  experiment_id text not null,
  variant text not null check (variant in ('A','B')),
  event_name text not null,
  user_id uuid references auth.users(id) on delete set null,
  anonymous_id text,
  metadata jsonb,
  created_at timestamptz default now(),
  constraint requires_identity check (
    user_id is not null or anonymous_id is not null
  )
);

CREATE INDEX ab_events_experiment_idx ON ab_events(experiment_id);
CREATE INDEX ab_events_user_idx ON ab_events(user_id);
CREATE INDEX ab_events_anon_idx ON ab_events(anonymous_id);
CREATE INDEX ab_events_variant_idx ON ab_events(experiment_id, variant);

ALTER TABLE ab_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_ab_events"
  ON ab_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "anyone_can_insert_ab_events"
  ON ab_events FOR INSERT
  WITH CHECK (true);
        """)

if __name__ == "__main__":
    run_migration()
