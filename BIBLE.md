# 📖 Workhunt AI — The Complete Bible (Explained Like You're 5)

> Everything you need to know about this project. Every file, every function, every feature location. No jargon.

---

## 🌍 What is Workhunt AI?

Imagine you are a university student in Germany (e.g. Hochschule Wismar, Uni Würzburg). You want to find a job or internship. Normally you'd have to:
- Search on 10 different websites every day.
- Write a CV from scratch.
- Wonder if you're even qualified.
- Prepare for interviews alone.

**Workhunt AI** does ALL of that for you automatically. It's like having a personal career robot that:
1. **Fetches jobs** from Germany's official government job website + Google Custom Search daily at midnight via Vercel Cron.
2. **Scores your match** — tells you "You match 82% of this job!"
3. **Tells you what skills you're missing** — with direct links to free courses.
4. **Writes your CV and Cover Letter** in German and English using AI.
5. **Generates interview prep cards** using the STAR method.
6. **Lets you find study partners** near you on a map showing Name, University, Department, Student Email, and Instagram.
7. **Sends you Telegram notifications** when a great job appears.
8. **Admin Portal** — Allows administrators (`v.tunwal@stud.hs-wismar.de`) to manage users and jobs with CRUD powers.
9. **Strict Signup-First Flow** — Users must Sign Up and confirm their university email before Signing In.

---

## 🗺️ Feature & Function Locator Map

Where to find every feature and function in the code:

| Feature / Task | File Location | Key Function / Component |
|---|---|---|
| **Allowed Domains & Email Checks** | [lib/utils.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Workhunt_AI/lib/utils.ts) | `isAcademicEmail()` function (contains `stud.hs-wismar.de`, `stud-mail.uni-wuerzburg.de`, etc.) |
| **Sign Up & Sign In Logic** | [app/page.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Workhunt_AI/app/page.tsx) | `handleSignUp()`, `handleSignIn()`, `handleForgotPassword()` |
| **Password Reset Page** | [app/reset-password/page.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Workhunt_AI/app/reset-password/page.tsx) | `handleReset()` |
| **Auth Callback & Auto User Creation** | [app/api/auth/callback/route.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Workhunt_AI/app/api/auth/callback/route.ts) | `GET()` handler |
| **Admin Control Panel UI** | [app/admin/page.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Workhunt_AI/app/admin/page.tsx) | `AdminPage()`, `handleDeleteUser()`, `handleDeleteJob()`, `handleAddJobSubmit()` |
| **Admin API Routes** | [app/api/admin/users/route.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Workhunt_AI/app/api/admin/users/route.ts), [app/api/admin/jobs/route.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Workhunt_AI/app/api/admin/jobs/route.ts) | `GET()`, `POST()`, `DELETE()` handlers |
| **Job Ingestion Engine** | [lib/ingestion.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Workhunt_AI/lib/ingestion.ts) | `runJobIngestion()`, `fetchFederalJobs()`, `fetchGoogleSearchJobs()`, `sendTelegramAlert()` |
| **Vercel Cron Trigger API** | [app/api/jobs/ingest/route.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Workhunt_AI/app/api/jobs/ingest/route.ts) | `GET()`, `POST()` handlers |
| **Vercel Cron Config** | [vercel.json](file:///c:/Users/Lenovo/OneDrive/Desktop/Workhunt_AI/vercel.json) | Cron schedule `0 0 * * *` (midnight daily) |
| **AI Matching Engine** | [lib/gemini.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Workhunt_AI/lib/gemini.ts) | `scoreJobMatch()`, `extractJobSkills()`, `generateSTARCards()`, `generateDocumentText()` |
| **Study Buddy Interactive Map** | [components/MapView.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Workhunt_AI/components/MapView.tsx) | `MapView()` component (pure Leaflet implementation) |
| **Study Buddy Page & Settings** | [app/study-buddy/page.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Workhunt_AI/app/study-buddy/page.tsx) | `StudyBuddyPage()`, `handleSave()` |
| **Edit Student Profile** | [app/profile/page.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Workhunt_AI/app/profile/page.tsx) | `ProfilePage()`, `handleSave()`, `toggleItem()` |
| **15-Min Inactivity Auto-Logout** | [components/SessionTracker.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Workhunt_AI/components/SessionTracker.tsx) | `SessionTracker()` component |
| **Navbar & Admin Link** | [components/Navbar.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Workhunt_AI/components/Navbar.tsx) | `Navbar()` component |
| **Database Schema & Triggers** | [tools/migration.sql](file:///c:/Users/Lenovo/OneDrive/Desktop/Workhunt_AI/tools/migration.sql) | `handle_new_user()` trigger, `study_buddies` view, table definitions |

---

## 🏗️ The Three Layer System (A.N.T. Architecture)

Think of the app like a restaurant:
- **Layer 1: The Menu (SOPs / architecture/)** — Written instructions that say exactly how each dish should be made. Rules and recipes.
- **Layer 2: The Waiter (Navigation / Next.js API Routes)** — Takes your order (API requests) to the right kitchen tool.
- **Layer 3: The Kitchen (Tools / lib/)** — Prepares the food. Single-purpose functions.

---

## 📁 Complete File-by-File Guide

### 🔐 `.env` — The Secret Keychain
**What it is:** Stores passwords and API keys.
- `NEXT_PUBLIC_SUPABASE_URL`: Address of cloud DB
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public read key
- `SUPABASE_SERVICE_ROLE_KEY`: Admin write key
- `GEMINI_API_KEY`: Google Gemini AI key
- `GOOGLE_CUSTOM_SEARCH_API_KEY`: Google Search API key
- `GOOGLE_SEARCH_ENGINE_ID`: Custom search engine ID
- `TELEGRAM_BOT_TOKEN`: Telegram bot token
- `TELEGRAM_CHAT_ID`: Telegram channel ID
- `NEXT_PUBLIC_ADMIN_EMAIL`: Admin email (`v.tunwal@stud.hs-wismar.de`)
- `CRON_SECRET`: Vercel cron secret key

### 📜 `gemini.md` — The Project Constitution
Supreme rulebook containing table definitions and non-negotiable architectural rules.

### 📁 `app/` Folder — The Pages (Screens) & API Routes
- `app/page.tsx`: Landing page with signup-first form, email/pass auth.
- `app/reset-password/page.tsx`: Password reset screen.
- `app/onboarding/page.tsx`: 4-step wizard for new student setup.
- `app/dashboard/page.tsx`: Job feed with AI match scores and application tracker.
- `app/profile/page.tsx`: Profile editor (skills, roles, locations).
- `app/admin/page.tsx`: Admin control panel (users & jobs CRUD).
- `app/studio/page.tsx`: Zero-storage CV & Cover Letter generator.
- `app/star/page.tsx`: STAR interview flashcards.
- `app/study-buddy/page.tsx`: Peer map settings & interactive leaflet map.

### 📁 `lib/` Folder — Core Functions
- `lib/utils.ts`: `isAcademicEmail()` validation (supports `@stud.hs-wismar.de`, `@stud-mail.uni-wuerzburg.de`, `.edu`, etc.), Zod schemas.
- `lib/supabase/client.ts`: Browser Supabase client.
- `lib/supabase/server.ts`: Server-side & admin Supabase client.
- `lib/gemini.ts`: AI engine logic with exponential backoff.
- `lib/ingestion.ts`: Federal API + Google CSE job scraper & Telegram alerts.

### 📁 `components/` Folder — Reusable UI Components
- `components/Navbar.tsx`: Header navigation bar with dynamic Admin link.
- `components/JobCard.tsx`: Job listing card with match score badge.
- `components/STARCard.tsx`: Interview prep flashcard.
- `components/MapView.tsx`: Pure Leaflet map renderer (shows Name, University, Dept, Email, Instagram).
- `components/SessionTracker.tsx`: Tracks mouse/keyboard activity and auto logs out after 15 minutes of inactivity.

---

## 🗄️ Database Structure (Supabase PostgreSQL)

- `users`: Created automatically on signup via PostgreSQL trigger (`handle_new_user()`).
- `profiles`: Holds student name, program, skills, roles, locations, handles.
- `raw_jobs`: Temp inbox for scraped job JSON.
- `jobs`: Unique active job listings with SHA-256 hash deduplication. Auto-deleted after 6 days.
- `applications`: Student job application status tracker (Bookmarked, Applied, etc.).
- `study_buddies`: Security view with 100m randomized coordinate fuzzing exposing Name, University, Program, Email, Instagram.

---

## 🚀 Deployment Pipeline

1. **Code Repository:** GitHub
2. **Hosting Platform:** Vercel (Next.js 14)
3. **Database:** Supabase PostgreSQL
4. **Automated Cron:** Vercel Crons (`vercel.json` - runs daily at `0 0 * * *`)
5. **AI Brain:** Google Gemini 2.5 Flash

*Last Updated: 2026-08-07 | All features up-to-date and verified.*
