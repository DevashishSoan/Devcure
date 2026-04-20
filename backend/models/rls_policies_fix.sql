-- SUPABASE RLS HOTFIX
-- Ensures authenticated users have permission to build their own repo networks.

-- 1. repo_configs: Enable INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "Users can insert own repos" ON public.repo_configs;
CREATE POLICY "Users can insert own repos" 
  ON public.repo_configs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own repos" ON public.repo_configs;
CREATE POLICY "Users can update own repos" 
  ON public.repo_configs FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own repos" ON public.repo_configs;
CREATE POLICY "Users can delete own repos" 
  ON public.repo_configs FOR DELETE 
  USING (auth.uid() = user_id);

-- 2. runs: Enable user-level visibility
DROP POLICY IF EXISTS "Users can view own runs" ON public.runs;
CREATE POLICY "Users can view own runs" 
  ON public.runs FOR SELECT 
  USING (auth.uid() = user_id);

-- 3. ab_events: Ensure tracking is enabled
DROP POLICY IF EXISTS "Enable insert for all authenticated users" ON public.ab_events;
CREATE POLICY "Enable insert for all authenticated users" 
  ON public.ab_events FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- 4. Verify RLS is actually ON
ALTER TABLE public.repo_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
