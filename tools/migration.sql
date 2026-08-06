-- =========================================
-- Workhunt AI: Supabase PostgreSQL Migration v2
-- Run this FULLY in Supabase SQL Editor
-- =========================================

-- Drop old tables cleanly (safe re-run)
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.raw_jobs CASCADE;
DROP VIEW IF EXISTS public.study_buddies CASCADE;

-- 1. Users table (Auth Mirror)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  domain TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles table (references public.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  university_name TEXT DEFAULT 'Hochschule Wismar',
  study_program TEXT,
  preferred_roles TEXT[] DEFAULT '{}',
  preferred_locations TEXT[] DEFAULT '{}',
  base_cv_json JSONB DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  is_study_buddy_visible BOOLEAN DEFAULT FALSE,
  latitude NUMERIC,
  longitude NUMERIC,
  instagram_handle TEXT,
  telegram_handle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Raw Jobs (ingestion buffer)
CREATE TABLE IF NOT EXISTS public.raw_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_api TEXT,
  raw_payload JSONB,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Jobs (normalized, 6-day TTL)
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dedup_hash TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  app_job_url TEXT,
  external_source_url TEXT,
  description TEXT,
  extracted_skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Applications (permanent tracking)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'BOOKMARKED' CHECK (status IN ('BOOKMARKED','MATCHED','DOCS_GENERATED','APPLIED','INTERVIEWING','REJECTED','ACCEPTED')),
  match_score INTEGER CHECK (match_score BETWEEN 0 AND 100),
  missing_skills TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- 6. Study Buddies privacy view (100m fuzzing)
CREATE OR REPLACE VIEW public.study_buddies AS
SELECT
  p.id AS user_id,
  p.full_name,
  p.email,
  p.university_name AS university,
  p.study_program,
  p.skills,
  p.latitude + (random() * 2 - 1) * (50.0 / 111320.0) AS fuzzy_latitude,
  p.longitude + (random() * 2 - 1) * (50.0 / (111320.0 * cos(radians(p.latitude)))) AS fuzzy_longitude,
  p.instagram_handle
FROM public.profiles p
WHERE p.is_study_buddy_visible = TRUE
  AND p.latitude IS NOT NULL
  AND p.longitude IS NOT NULL;

-- =========================================
-- Auto-insert into public.users on signup
-- This trigger fires for BOTH Google OAuth
-- AND email/password signups
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, domain)
  VALUES (
    NEW.id,
    NEW.email,
    split_part(NEW.email, '@', 2)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =========================================
-- Row Level Security (RLS)
-- =========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_jobs ENABLE ROW LEVEL SECURITY;

-- Users: read/write own row only
DROP POLICY IF EXISTS "Users: own row" ON public.users;
CREATE POLICY "Users: own row" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Profiles: read/write own row
DROP POLICY IF EXISTS "Profiles: own row" ON public.profiles;
CREATE POLICY "Profiles: own row" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Jobs: everyone can read
DROP POLICY IF EXISTS "Jobs: public read" ON public.jobs;
CREATE POLICY "Jobs: public read" ON public.jobs
  FOR SELECT USING (true);

-- Applications: own rows only
DROP POLICY IF EXISTS "Applications: own row" ON public.applications;
CREATE POLICY "Applications: own row" ON public.applications
  FOR ALL USING (auth.uid() = user_id);

-- Raw jobs: service role only (no user policy)
DROP POLICY IF EXISTS "Raw jobs: service role" ON public.raw_jobs;
CREATE POLICY "Raw jobs: service role" ON public.raw_jobs
  FOR ALL USING (false);

-- =========================================
-- TTL purge: delete jobs older than 6 days
-- =========================================
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule(
  'purge-old-jobs',
  '0 2 * * *',
  $$DELETE FROM public.jobs WHERE created_at < NOW() - INTERVAL '6 days'$$
);
