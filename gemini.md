# Project Constitution: Workhunt AI

## 1. Project Overview & Identity
- **Project Name:** Workhunt AI (AI Job Automation & Career Co-Pilot Platform)
- **Target Audience:** Hochschule Wismar students & alumni (`@stud.hs-wismar.de`, `@hs-wismar.de`) and extensible partner academic domains (`@*.edu`, `@*.edu.de`, `@*.ac.uk`).
- **Core Mission:** Automate German & European job discovery, match index evaluation, skill-gap analysis, interactive STAR study cheat sheets, zero-storage ATS-compliant German (Lebenslauf) and English CV/Cover Letter generation, and a privacy-first Study Buddy directory.
- **Hosting Model:** 100% Free-Tier Serverless Architecture (Next.js 14 on Vercel, Supabase PostgreSQL, GitHub Actions, DeepSeek + Gemini 2.5 Flash).

---

## 2. Core Architectural Invariants
1. **3-Layer Architecture (A.N.T.):**
   - **Layer 1: SOPs (`architecture/`)** - Plaintext Markdown specifying steps, edge cases, and schemas.
   - **Layer 2: Navigation & Orchestration** - API Route Handlers / RSC driving workflow logic.
   - **Layer 3: Tools (`tools/` & `lib/`)** - Atomic, deterministic, single-responsibility functions/scripts.
2. **Data-First Schema Enforcement:** All payloads match strictly defined Supabase PostgreSQL schemas and Zod schema validations.
3. **Zero-Storage Media Architecture:** Profile photos and signatures reside strictly in React RAM state (`useState` / ArrayBuffer). Client-side `docx.js` compiles binaries directly in-browser. Zero media files touch Supabase storage or server disks.
4. **Dual-Engine AI Partitioning:**
   - **Engine 1 (DeepSeek V4 / HuggingFace):** Fast, low-cost operations: Match Index Scoring (0-100%), Skill Gap Extraction, and STAR Interview Cheat Sheet generation.
   - **Engine 2 (Gemini 2.5 Flash):** High-level document creation: Tailored German Lebenslauf and English CV & Cover Letter drafting. Guarded with an exponential backoff buffer (< 15 RPM).
5. **Location Privacy & Coordinate Jitter:** Study Buddy locations apply a randomized 100-meter circular offset before surfacing coordinates to the client layer:
   ```
   LAT_fuzzy = LAT_actual + (random(-1, 1) * (50 / 111320))
   LNG_fuzzy = LNG_actual + (random(-1, 1) * (50 / (111320 * cos(LAT_actual))))
   ```
6. **Ultra-Lean Storage Lifecycle:**
   - 6-Day Job Retention TTL (older job listings auto-purged via SQL cron).
   - 15-Minute generated temporary buffer auto-cleanup.

---

## 3. Complete Relational Database Schema (Supabase PostgreSQL)

### Table 1: `users` (Auth Mirror)
- `id`: UUID (PK, references `auth.users`)
- `email`: TEXT (UNIQUE, restricted to `@stud.hs-wismar.de`, `@hs-wismar.de`, etc.)
- `domain`: TEXT
- `created_at`: TIMESTAMPTZ (Default `NOW()`)

### Table 2: `profiles`
- `id`: UUID (PK, FK to `users.id`)
- `email`: TEXT (UNIQUE)
- `full_name`: TEXT
- `university_name`: TEXT (Default `'Hochschule Wismar'`)
- `study_program`: TEXT
- `preferred_roles`: TEXT[]
- `preferred_locations`: TEXT[]
- `base_cv_json`: JSONB
- `skills`: TEXT[]
- `is_study_buddy_visible`: BOOLEAN (Default `FALSE`)
- `latitude`: NUMERIC
- `longitude`: NUMERIC
- `created_at`: TIMESTAMPTZ (Default `NOW()`)

### Table 3: `raw_jobs` (Temporary Ingestion Buffer)
- `id`: UUID (PK, Default `gen_random_uuid()`)
- `source_api`: TEXT
- `raw_payload`: JSONB
- `ingested_at`: TIMESTAMPTZ (Default `NOW()`)

### Table 4: `jobs` (Normalized Active Jobs - 6-Day TTL Purge)
- `id`: UUID (PK, Default `gen_random_uuid()`)
- `dedup_hash`: TEXT (UNIQUE, SHA-256 hash of `company + title + location`)
- `title`: TEXT
- `company`: TEXT
- `location`: TEXT
- `app_job_url`: TEXT (Internal web app deep-link)
- `external_source_url`: TEXT
- `description`: TEXT
- `extracted_skills`: TEXT[]
- `created_at`: TIMESTAMPTZ (Default `NOW()`)

### Table 5: `applications` (Permanent Tracking Records)
- `id`: UUID (PK, Default `gen_random_uuid()`)
- `user_id`: UUID (FK to `profiles.id`)
- `job_id`: UUID (FK to `jobs.id`)
- `status`: TEXT (Check constraint: `'BOOKMARKED'`, `'MATCHED'`, `'DOCS_GENERATED'`, `'APPLIED'`, `'INTERVIEWING'`, `'REJECTED'`, `'ACCEPTED'`)
- `match_score`: INTEGER (0-100)
- `missing_skills`: TEXT[]
- `updated_at`: TIMESTAMPTZ (Default `NOW()`)
- `created_at`: TIMESTAMPTZ (Default `NOW()`)

### Table 6 / View: `study_buddies` (SQL Security & Privacy View)
- `user_id`: UUID (FK to `profiles.id`)
- `university`: TEXT
- `study_program`: TEXT
- `skills`: TEXT[]
- `fuzzy_latitude`: NUMERIC (Calculated 100m randomized offset)
- `fuzzy_longitude`: NUMERIC (Calculated 100m randomized offset)
- `instagram_handle`: TEXT
- `telegram_handle`: TEXT

---

## 4. Behavioral & Domain Rules
1. **Domain Whitelist & Auth Policy:** OAuth logins check the `hd` claim and user email domain. Non-academic emails are blocked at the OAuth callback level and PostgreSQL trigger level.
2. **ATS Readability Rules:** Generated CVs must use standard typography (Arial/Calibri), standard OpenXML hierarchy without floating text boxes, and follow the German Tabular (Tabellarischer Lebenslauf) standard or English ATS format.
3. **Self-Annealing Error Repair Loop:** If an execution fails, trace stack trace, patch script in `tools/`, run test verification, and record updated constraints in `architecture/`.
