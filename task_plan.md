# Master Task Plan: Workhunt AI

## Overview
Automated AI Job Automation & Career Co-Pilot Platform tailored for Hochschule Wismar students (`@stud.hs-wismar.de`) and partner academic institutions, featuring Gemini AI (Gemini 2.5 Flash), zero-storage binary CV compilation, and privacy-first peer networking.

---

## Phase 1: Blueprint (Vision, Schemas & Requirements) - [COMPLETE]
- [x] Deep Research & Requirement extraction from PRD, TAD, SAD, WDD, DPD, QA documents.
- [x] Initialize Project Constitution (`gemini.md`) with complete relational database schemas and invariants.
- [x] Create `.env.example` with all required API keys and configuration secrets.
- [x] Write Layer 1 Technical SOPs in `architecture/`.

---

## Phase 2: Link (Connectivity & Environment Verification) - [COMPLETE]
- [x] Read and format user's `.env` configuration file securely.
- [x] Create local virtual environment `.venv` for isolated execution.
- [x] Implement Google's new `AQ.` header authentication standard (`x-goog-api-key`).
- [x] Execute Link verification handshake script (`tools/verify_links.py`) with 100% success across:
  - [x] Supabase Database Connection
  - [x] Gemini Flash API Connection (AQ Header Format)
  - [x] Federal Job Agency API (`jobsuche-service`)
  - [x] Telegram Bot API notification dispatch

---

## Phase 3: Architect (3-Layer Implementation) - [COMPLETE]
- [x] Create Supabase migration SQL scripts for tables (`users`, `profiles`, `raw_jobs`, `jobs`, `applications`, `study_buddies` view) and RLS policies.
- [x] Build Automated Job Ingestion Engine (`lib/ingestion.ts`):
  - Federal Employment Agency API integration (`jobsuche-service`).
  - Google Custom Search API integration for site-specific jobs.
  - SHA-256 deduplication and database upsert.
  - 6-Day job TTL purge handler (`purge_jobs.sql`).
- [x] Build Gemini AI Engine (`lib/gemini.ts`):
  - Match Index Scoring (0-100%) against profile skills & target roles.
  - Skill Gap Extractor + Direct search query builder.
  - STAR Interview Cheat Sheet generator.
  - Tailored German (Tabellarischer Lebenslauf) & English CV generator.
  - Personalized Cover Letter drafting engine.
  - Exponential backoff rate limit queue buffer (< 15 RPM).
- [x] Build client-side binary document builder and storage limits:
  - Base64 -> plain text ATS representation (respecting zero server storage rules).
- [x] Build Study Buddy Peer Directory & Privacy Layer:
  - 50m-100m randomized circular location fuzzing algorithm (`lib/utils.ts` and view).
  - Create SQL view for `study_buddies` exposing only fuzzified coordinates and opt-in profiles.

---

## Phase 4: Stylize (UI/UX & Design System) - [COMPLETE]
- [x] Build Next.js 14 Web Application screens:
  - [x] **Screen 1: Landing & Domain SSO Auth** (`/`).
  - [x] **Screen 2: Student Profile & Base CV Setup Wizard** (`/onboarding`).
  - [x] **Screen 3: Job Match Feed & Skill Gap Analysis** (`/dashboard`).
  - [x] **Screen 4: Document Studio (CV & Cover Letter Generator)** (`/studio`).
  - [x] **Screen 5: Interactive STAR Interview Cards** (`/star`).
  - [x] **Screen 6: Study Buddy Peer Map Directory** (`/study-buddy`).

---

## Phase 5: Trigger (Automation & Deployment) - [READY FOR DEPLOY]
- [x] Configure Telegram Bot dispatch trigger for job matches above student threshold.
- [ ] Configure GitHub Actions Workflow for 8-hour automated cron execution.
- [ ] Setup production build on Vercel with environment variables.
- [ ] Verify zero-downtime deployment, RLS security policies, and performance benchmarks.
