# 📖 Workhunt AI — The Complete Bible (Explained Like You're 5)

> Everything you need to know about this project. Every file, every function, every decision. No jargon.

---

## 🌍 What is Workhunt AI?

Imagine you are a student at Hochschule Wismar University in Germany. You want to find a job or internship. Normally you'd have to:
- Search on 10 different websites every day.
- Write a CV from scratch.
- Wonder if you're even qualified.
- Prepare for interviews alone.

**Workhunt AI** does ALL of that for you automatically. It's like having a personal career robot that:
1. **Fetches jobs** from Germany's official government job website every 24 hours at midnight via Vercel Cron.
2. **Scores your match** — tells you "You match 82% of this job!"
3. **Tells you what skills you're missing** — with direct links to free courses.
4. **Writes your CV and Cover Letter** in German and English using AI.
5. **Generates interview prep cards** using the STAR method.
6. **Lets you find study partners** near you on a map showing Name, University, Department, Email, and Instagram (no Telegram).
7. **Sends you Telegram notifications** when a great job appears.
8. **Admin Portal** — Allows administrators (`v.tunwal@stud.hs-wismar.de`) to manage users and jobs.
9. **Strict Signup-First Flow** — Users must Sign Up and confirm their university email before Signing In.

---

## 🏗️ The Three Layer System (A.N.T. Architecture)

Think of the app like a restaurant:
- **Layer 1: The Menu (SOPs / architecture/)** — Written instructions that say exactly how each dish should be made. Rules and recipes. Never changes unless the head chef approves.
- **Layer 2: The Waiter (Navigation / Next.js API Routes)** — Takes your order (API requests) to the right kitchen (tool/function). Makes decisions.
- **Layer 3: The Kitchen (Tools / lib/)** — Actually prepares the food. Atomic, single-purpose functions. Does one thing perfectly.

---

## 📁 Complete File-by-File Guide

---

### 🔐 `.env` — The Secret Keychain
**What it is:** A file that stores all passwords and secret API keys. Like a keychain that only this app can read.
**NEVER share this file publicly.** It contains real passwords.

| Variable | What it does |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | The address of our cloud database |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public key to read data (like a library card) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key to write data (like a master key) |
| `GEMINI_API_KEY` | Password to use Google's Gemini AI brain |
| `GOOGLE_CUSTOM_SEARCH_API_KEY` | Password to use Google Search to find jobs |
| `GOOGLE_SEARCH_ENGINE_ID` | Which custom Google search engine to use |
| `TELEGRAM_BOT_TOKEN` | Password for the Telegram bot that sends alerts |
| `TELEGRAM_CHAT_ID` | The ID of the Telegram channel to send alerts to |

---

### 📜 `gemini.md` — The Project Constitution (Law Book)
**What it is:** The supreme rulebook of the project. Like a constitution for a country. If something conflicts with this document, this wins.
**Contains:**
- The database table definitions (what data we store and how).
- Rules that can never be broken (e.g., never store photos on the server).
- The AI engine rules (what Gemini is allowed to do).

---

### 📋 `task_plan.md` — The Master Checklist
**What it is:** A giant to-do list split into 5 phases (Blueprint → Link → Architect → Stylize → Trigger). Shows what's done (✅) and what's left (⬜).

---

### 🔍 `findings.md` — The Research Notebook
**What it is:** A record of everything discovered during research. Like a scientist's lab notebook. What APIs exist, what their URLs are, what they return.

---

### 📝 `progress.md` — The Daily Diary
**What it is:** A log of everything that was completed, any errors encountered, and test results. Updated after every major task.

---

## 📁 `architecture/` Folder — The Recipe Book (Layer 1 SOPs)

These are Markdown files that explain **how** each part of the system works. Not code — just clear step-by-step instructions. If a function breaks, you read the SOP first.

### `sop_ingestion.md` — How to Fetch Jobs
- **What it explains:** Every 8 hours, connect to Germany's federal job API and Google Search. Download raw job postings. Hash each job with SHA-256 (a fingerprint) to avoid duplicates. Store in the database. Auto-delete jobs older than 6 days.
- **Key concept:** SHA-256 Hash = A unique fingerprint made from `company name + job title + city`. Same job from two sources → same fingerprint → stored only once.

### `sop_ai_matching.md` — How AI Scores Jobs
- **What it explains:** Take the student's profile (their skills, desired role). Compare it against the job description using Gemini AI. Output a score 0–100. If score > threshold, identify missing skills. Generate STAR interview cards.
- **Key concept:** STAR = Situation, Task, Action, Result. A framework for answering interview questions with real examples.

### `sop_doc_studio.md` — How CVs are Built
- **What it explains:** The student's photo and signature are NEVER uploaded to the server. They live only in browser memory (RAM). Gemini writes the CV text. The browser stitches everything together into a `.docx` file using `docx.js`. The file downloads directly. Zero trace on our server.
- **Key concept:** Zero-storage = no server costs, no privacy risk, no GDPR problems.

### `sop_study_buddy.md` — How Location Privacy Works
- **What it explains:** A student opts in to be visible on the Study Buddy map. Their real GPS coordinates are stored encrypted in the database. When displayed on the map, the coordinates are randomly shifted by up to 100 meters in any direction. So you see "someone is near you" — but not their exact home.
- **Key concept:** Fuzzy coordinates = privacy by design.

---

## 📁 `tools/` Folder — Verification & Utility Scripts (Layer 3)

These Python scripts test that everything is working. They run in the `.venv` virtual environment (a contained Python box that doesn't affect your computer globally).

### `verify_links.py` — The Connection Test
- **What it does:** Pings every external service (Supabase, Gemini, Job API, Telegram) and reports SUCCESS or FAILED.
- **Run it with:** `.venv\Scripts\python.exe tools/verify_links.py`

### `debug_gemini_key.py` — Gemini Key Debugger
- **What it does:** Tests the Gemini API key using both the old URL param method and the new `x-goog-api-key` header method to determine which works.

### `diagnose_apis.py` — API Diagnostics
- **What it does:** Shows detailed HTTP error responses from APIs to identify exact failure reasons.

---

## 📁 `src/` Folder — The Next.js Web Application (Layer 2 & 3)

This is the actual web app that students use. Built with **Next.js 14** (a React framework).

### `src/app/` — The Pages (Screens)

| Folder / File | URL the user visits | What it shows |
|---|---|---|
| `page.tsx` | `/` | Landing page. Login with your university Google account. |
| `onboarding/page.tsx` | `/onboarding` | Setup wizard: name, study program, skills, preferred jobs. |
| `dashboard/page.tsx` | `/dashboard` | Main feed. Shows matched jobs, scores, skill gaps. |
| `studio/page.tsx` | `/studio` | CV and Cover Letter generator. Upload photo, generate docs. |
| `star/page.tsx` | `/star` | STAR interview cheat sheet cards. Click through flash cards. |
| `study-buddy/page.tsx` | `/study-buddy` | Interactive map. Find study partners near you. |

### `src/app/api/` — The Backend Endpoints (Server Functions)

| File | HTTP Route | What it does |
|---|---|---|
| `api/auth/callback/route.ts` | `GET /api/auth/callback` | Handles Google login. Checks if email is from Wismar university. |
| `api/jobs/ingest/route.ts` | `POST /api/jobs/ingest` | Fetches jobs from APIs, deduplicates, saves to DB. |
| `api/jobs/match/route.ts` | `POST /api/jobs/match` | Uses Gemini to score a job vs student profile. |
| `api/studio/generate/route.ts` | `POST /api/studio/generate` | Uses Gemini to write CV/Cover Letter text. |
| `api/star/generate/route.ts` | `POST /api/star/generate` | Uses Gemini to generate STAR interview cards. |
| `api/telegram/notify/route.ts` | `POST /api/telegram/notify` | Sends a Telegram message when a high-match job is found. |

### `src/lib/` — Shared Utility Functions

| File | What it does |
|---|---|
| `supabase.ts` | Creates a connection to the Supabase database. Used everywhere. |
| `gemini.ts` | Creates the Gemini AI connection with the AQ. header. Used by all AI features. |
| `schemas.ts` | Zod validation schemas — makes sure data has the right shape before saving. |
| `location.ts` | The 100-meter fuzzing algorithm for Study Buddy map privacy. |

### `src/components/` — Reusable UI Pieces

| File | What it is |
|---|---|
| `JobCard.tsx` | A card showing a job: title, company, match %, skill gaps. |
| `SkillChip.tsx` | A small colored chip showing a skill (green = have it, amber = missing). |
| `STARCard.tsx` | A flashcard for STAR interview prep. Flip to reveal the answer. |
| `StudyBuddyPin.tsx` | A map marker for a study buddy. Shows a blurred radius circle. |
| `KanbanBoard.tsx` | The application tracker (drag cards: Matched → Applied → Accepted). |

---

## 🗄️ Database Structure (Supabase PostgreSQL)

Think of this like a giant spreadsheet system in the cloud.

### `users` Table — Who is logged in
Stores the basic account info when someone logs in for the first time. Auto-populated by Supabase Auth.

### `profiles` Table — The Student's CV and Preferences
This is the heart. When a student sets up their profile, everything goes here: their name, skills, desired job roles, preferred cities, and base CV data.

### `raw_jobs` Table — Raw Download Buffer
When the job-fetching cron runs, raw JSON from the API is dumped here first. Like an inbox. Gets cleaned up after processing.

### `jobs` Table — Clean, Deduplicated Active Jobs
The processed jobs. Only unique entries (using SHA-256 hash). Automatically deleted after 6 days to keep the database lean.

### `applications` Table — The Tracker
Every time a student interacts with a job (bookmarks it, generates docs, applies), a record is created here with the status. This powers the Kanban board.

### `study_buddies` View — The Privacy-Safe Map Layer
Not a real table — it's a SQL view that reads from `profiles` but returns fuzzy coordinates instead of real ones. Students can opt in or out anytime.

---

## 🤖 The AI Engine — Gemini Flash

We use **Google Gemini** (via the new `AQ.` key format) for ALL AI tasks:
1. **Match Scoring:** "Does this student's skills match this job? Give me a 0-100 score."
2. **Skill Gap Detection:** "What skills does this job need that the student doesn't have yet?"
3. **STAR Card Generation:** "Create 5 STAR interview story cards for this student."
4. **CV Writing:** "Write a professional German Lebenslauf for this student applying to this job."
5. **Cover Letter Writing:** "Write a one-page English cover letter."

**Rate Limit Rule:** Gemini's free tier allows 15 requests per minute. Our code uses exponential backoff (wait 1s, then 2s, then 4s...) if it hits the limit.

---

## 🔄 The Automated Job Ingestion Pipeline

Every 8 hours, a GitHub Actions robot runs automatically:

```
STEP 1: Call Federal Job Agency API
        → Get jobs matching "Software", "Informatik", "Werkstudent" in Germany

STEP 2: Call Google Custom Search API
        → Find more jobs from LinkedIn, Indeed, StepStone via targeted queries

STEP 3: For each job, compute SHA-256 hash(company + title + location)
        → If hash already exists in DB → SKIP (duplicate)
        → If hash is new → INSERT into `jobs` table

STEP 4: Auto-delete jobs older than 6 days
        → DELETE FROM jobs WHERE created_at < NOW() - INTERVAL '6 days'

STEP 5: For each new high-potential job, check student profiles
        → Send Telegram notification with deep-link to the job in the app
```

---

## 🔐 Security Model

1. **Only university emails can log in.** The OAuth callback checks the email domain. If it's not `@stud.hs-wismar.de` or another allowed domain → access denied.
2. **Database has Row Level Security (RLS).** Even if someone guesses our database URL, they can only read their own data — never someone else's.
3. **No photos ever touch the server.** The CV photo lives in browser memory only. This means zero GDPR risk for biometric data.
4. **Location fuzzing.** Even if the database were breached, the lat/lng stored for Study Buddy is the real location. But the VIEW that all code uses returns fuzzy coordinates — so even our own code never sees exact locations after they're stored.

---

## 🚀 Deployment Pipeline

1. **Code lives in:** GitHub repository.
2. **Web app hosted on:** Vercel (free tier, 100k requests/month).
3. **Database hosted on:** Supabase (free tier, 500MB).
4. **Background cron runs on:** GitHub Actions (free tier, 2,000 mins/month).
5. **AI powered by:** Google Gemini (free tier, 15 RPM).
6. **Zero cost to run** as long as usage stays within these free tier limits.

---

## ⚡ Key Invariants (Rules That Never Break)

1. **Never store photos on the server.**
2. **Never show exact coordinates on the Study Buddy map.**
3. **Never allow non-university emails to log in.**
4. **Always use `x-goog-api-key` header for Gemini (never `?key=` URL param).**
5. **Always deduplicate jobs with SHA-256 hash before inserting.**
6. **Always purge jobs older than 6 days.**
7. **Always validate all API inputs with Zod schemas.**
8. **If AI fails, log to Sentry and retry with exponential backoff.**

---

*Last Updated: 2026-08-05 | Phase 2 Complete | All API connections verified.*
