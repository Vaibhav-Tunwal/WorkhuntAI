-- =========================================
-- Workhunt AI: Supabase PostgreSQL Migration
-- Run this in Supabase SQL Editor
-- =========================================

-- 1. Users table (Auth Mirror)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  domain TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles table
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
  p.university_name AS university,
  p.study_program,
  p.skills,
  p.latitude + (random() * 2 - 1) * (50.0 / 111320.0) AS fuzzy_latitude,
  p.longitude + (random() * 2 - 1) * (50.0 / (111320.0 * cos(radians(p.latitude)))) AS fuzzy_longitude,
  p.instagram_handle,
  p.telegram_handle
FROM public.profiles p
WHERE p.is_study_buddy_visible = TRUE
  AND p.latitude IS NOT NULL
  AND p.longitude IS NOT NULL;

-- =========================================
-- Row Level Security (RLS)
-- =========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_jobs ENABLE ROW LEVEL SECURITY;

-- Users: read/write own row only
CREATE POLICY "Users: own row" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Profiles: read own + insert own
CREATE POLICY "Profiles: own row" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Jobs: anyone authenticated can read
CREATE POLICY "Jobs: authenticated read" ON public.jobs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Applications: own rows only
CREATE POLICY "Applications: own rows" ON public.applications
  FOR ALL USING (auth.uid() = user_id);

-- Raw jobs: service role only (cron writes)
CREATE POLICY "Raw jobs: service role" ON public.raw_jobs
  FOR ALL USING (auth.role() = 'service_role');

-- =========================================
-- Auth trigger: block non-university emails
-- =========================================
CREATE OR REPLACE FUNCTION public.check_university_email()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.email NOT LIKE '%@stud.hs-wismar.de'
    AND NEW.email NOT LIKE '%@hs-wismar.de'
    AND NEW.email NOT LIKE '%@%.edu'
    AND NEW.email NOT LIKE '%@%.ac.uk'
    AND NEW.email NOT LIKE '%@%.edu.de'
  THEN
    RAISE EXCEPTION 'Access denied: Only university email domains are permitted.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER enforce_university_email
  BEFORE INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.check_university_email();

-- =========================================
-- Auto-create user row on auth signup
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, domain)
  VALUES (
    NEW.id,
    NEW.email,
    split_part(NEW.email, '@', 2)
  ) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- 6-Day TTL purge function (schedule via pg_cron or call manually)
-- =========================================
CREATE OR REPLACE FUNCTION public.purge_old_jobs()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM public.jobs WHERE created_at < NOW() - INTERVAL '6 days';
  DELETE FROM public.raw_jobs WHERE ingested_at < NOW() - INTERVAL '7 days';
END;
$$;
