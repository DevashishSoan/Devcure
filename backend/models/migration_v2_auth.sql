-- Migration: Multi-tenant Support (Gap 2)
-- Description: Adds user_id columns, updates uniqueness constraints, and adds missing telemetry fields.

-- 1. Update repo_configs table
ALTER TABLE repo_configs ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL;
ALTER TABLE repo_configs ADD COLUMN IF NOT EXISTS github_access_token TEXT;
ALTER TABLE repo_configs DROP CONSTRAINT IF EXISTS repo_configs_repo_url_key;

-- Create unique index scoped to user_id
CREATE UNIQUE INDEX IF NOT EXISTS repo_configs_user_repo_unique ON repo_configs(user_id, repo_url);

-- 2. Update runs table
ALTER TABLE runs ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL;
ALTER TABLE runs ADD COLUMN IF NOT EXISTS framework_detected TEXT;
ALTER TABLE runs ADD COLUMN IF NOT EXISTS diagnosis TEXT;
ALTER TABLE runs ADD COLUMN IF NOT EXISTS proposed_diff TEXT;
ALTER TABLE runs ADD COLUMN IF NOT EXISTS baseline_failures JSONB DEFAULT '[]'::jsonb;
ALTER TABLE runs ADD COLUMN IF NOT EXISTS trajectory JSONB DEFAULT '[]'::jsonb;

-- Rename iterations_used if it exists and hasn't been renamed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='runs' AND column_name='iterations_used') THEN
        ALTER TABLE runs RENAME COLUMN iterations_used TO iterations;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE repo_configs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: users can only see/modify their own data
-- Drop existing policies if they exist to allow re-running the migration
DROP POLICY IF EXISTS "Users can view own runs" ON runs;
DROP POLICY IF EXISTS "Users can insert own runs" ON runs;
DROP POLICY IF EXISTS "Users can update own runs" ON runs;
DROP POLICY IF EXISTS "Users can delete own runs" ON runs;

CREATE POLICY "Users can view own runs" ON runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own runs" ON runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own runs" ON runs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own runs" ON runs FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own repos" ON repo_configs;
DROP POLICY IF EXISTS "Users can insert own repos" ON repo_configs;
DROP POLICY IF EXISTS "Users can update own repos" ON repo_configs;
DROP POLICY IF EXISTS "Users can delete own repos" ON repo_configs;

CREATE POLICY "Users can view own repos" ON repo_configs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own repos" ON repo_configs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own repos" ON repo_configs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own repos" ON repo_configs FOR DELETE USING (auth.uid() = user_id);

-- 5. Service role bypass
-- Note: Supabase service_role key bypasses RLS by default. 
-- The backend uses this for webhooks and background tasks.
