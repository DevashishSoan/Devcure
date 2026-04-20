-- SQL Script: Create user_profiles and automation triggers
-- This table stores global notification and system settings.

-- 1. Create the table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  slack_webhook_url text,
  notify_on_completed boolean default true,
  notify_on_escalated boolean default true,
  notify_via_email boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Define Policies
CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- 4. Automation: Profile Creation Trigger
-- This creates a default profile the first time a user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Optional: Initialize for existing users
-- INSERT INTO public.user_profiles (user_id)
-- SELECT id FROM auth.users
-- ON CONFLICT (user_id) DO NOTHING;
