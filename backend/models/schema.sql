-- DevCure Supabase Schema

-- Table for tracking autonomous runs
CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY,
    repo TEXT NOT NULL,
    branch TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    run_type TEXT NOT NULL DEFAULT 'Autonomous Fix',
    mttr_seconds FLOAT,
    agent_time_seconds FLOAT,
    setup_time_seconds FLOAT,
    iterations_used INTEGER DEFAULT 0,
    regressions_found JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for repository configurations
CREATE TABLE IF NOT EXISTS repo_configs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    repo_url TEXT UNIQUE NOT NULL,
    branch TEXT DEFAULT 'main',
    enabled BOOLEAN DEFAULT TRUE,
    max_iterations INTEGER DEFAULT 5,
    notification_channels JSONB DEFAULT '["slack"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Realtime for runs
ALTER PUBLICATION supabase_realtime ADD TABLE runs;
