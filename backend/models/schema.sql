-- DevCure Supabase Schema (v2 — Multi-tenant)

-- Table for tracking autonomous runs
CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    repo TEXT NOT NULL,
    branch TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    run_type TEXT NOT NULL DEFAULT 'Autonomous Fix',
    framework_detected TEXT,

    -- Telemetry
    mttr_seconds FLOAT,
    agent_time_seconds FLOAT,
    setup_time_seconds FLOAT,
    iterations INTEGER DEFAULT 0,
    max_iterations INTEGER DEFAULT 5,

    -- Agent output
    error_classes JSONB DEFAULT '[]'::jsonb,
    diagnosis TEXT,
    proposed_diff TEXT,
    pr_url TEXT,

    -- Safety data
    baseline_failures JSONB DEFAULT '[]'::jsonb,
    regressions_found JSONB DEFAULT '[]'::jsonb,
    trajectory JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for repository configurations
CREATE TABLE IF NOT EXISTS repo_configs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    repo_url TEXT NOT NULL,
    branch TEXT DEFAULT 'main',
    enabled BOOLEAN DEFAULT TRUE,
    max_iterations INTEGER DEFAULT 5,
    notification_channels JSONB DEFAULT '[]'::jsonb,
    github_access_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Uniqueness is per-user, not global
CREATE UNIQUE INDEX IF NOT EXISTS repo_configs_user_repo_unique
  ON repo_configs(user_id, repo_url);

-- Index for webhook lookup
CREATE INDEX IF NOT EXISTS runs_user_id_idx ON runs(user_id);
CREATE INDEX IF NOT EXISTS repo_configs_user_id_idx ON repo_configs(user_id);

-- Enable RLS
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE repo_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only see/modify their own data
CREATE POLICY "Users can view own runs"
  ON runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own runs"
  ON runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own runs"
  ON runs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own repos"
  ON repo_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own repos"
  ON repo_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own repos"
  ON repo_configs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own repos"
  ON repo_configs FOR DELETE
  USING (auth.uid() = user_id);

-- Service role bypass for backend webhook handler
-- (The backend uses the service_role key, which bypasses RLS by default)

-- Enable Realtime for runs
ALTER PUBLICATION supabase_realtime ADD TABLE runs;
