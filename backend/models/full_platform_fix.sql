-- ==========================================
-- DevCure Platform: FULL SYSTEM STABILIZATION
-- ==========================================
-- Run this in your Supabase SQL Editor to fix RLS, Profiles, and Triggers permanently.

-- 1. Ensure Table Row Level Security (RLS) is ON
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repo_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_events ENABLE ROW LEVEL SECURITY;

-- 2. USER PROFILES: Fix Policies and Triggers
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Ensure auto-creation trigger is perfect
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill missing profiles for existing users
INSERT INTO public.user_profiles (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;


-- 3. REPOSITORY CONFIGS: Multi-tenant Lockdown
DROP POLICY IF EXISTS "Users can view own repos" ON public.repo_configs;
CREATE POLICY "Users can view own repos" ON public.repo_configs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own repos" ON public.repo_configs;
CREATE POLICY "Users can insert own repos" ON public.repo_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own repos" ON public.repo_configs;
CREATE POLICY "Users can update own repos" ON public.repo_configs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own repos" ON public.repo_configs;
CREATE POLICY "Users can delete own repos" ON public.repo_configs
  FOR DELETE USING (auth.uid() = user_id);


-- 4. RUNS: Execution Visibility
DROP POLICY IF EXISTS "Users can view own runs" ON public.runs;
CREATE POLICY "Users can view own runs" ON public.runs
  FOR SELECT USING (auth.uid() = user_id);

-- Note: The backend uses Service Role to insert/update, so we don't need Insert policies for users here.
-- However, we add one for manual testing if needed.
DROP POLICY IF EXISTS "Users can insert own runs" ON public.runs;
CREATE POLICY "Users can insert own runs" ON public.runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 5. A/B EVENTS: High-throughput insert
DROP POLICY IF EXISTS "Enable insert for all authenticated users" ON public.ab_events;
CREATE POLICY "Enable insert for all authenticated users" ON public.ab_events
  FOR INSERT TO authenticated WITH CHECK (true);

-- ==========================================
-- END OF SCRIPT
-- ==========================================
