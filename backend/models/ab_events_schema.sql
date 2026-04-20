-- SQL Script: Create ab_events table for DevCure A/B Testing
-- Source: scratch/migrate_ab_events.py

-- 1. Create the table
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

-- 2. Create optimized indices
CREATE INDEX IF NOT EXISTS ab_events_experiment_idx ON ab_events(experiment_id);
CREATE INDEX IF NOT EXISTS ab_events_user_idx ON ab_events(user_id);
CREATE INDEX IF NOT EXISTS ab_events_anon_idx ON ab_events(anonymous_id);
CREATE INDEX IF NOT EXISTS ab_events_variant_idx ON ab_events(experiment_id, variant);

-- 3. Enable Security
ALTER TABLE ab_events ENABLE ROW LEVEL SECURITY;

-- 4. Define Access Policies
-- Users can read their own events (useful for dashboard analytics)
CREATE POLICY "users_read_own_ab_events"
  ON ab_events FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can insert events (anonymous or authenticated)
CREATE POLICY "anyone_can_insert_ab_events"
  ON ab_events FOR INSERT
  WITH CHECK (true);

-- Backend (Service Role) bypasses RLS by default
