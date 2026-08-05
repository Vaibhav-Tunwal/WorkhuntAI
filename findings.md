# Findings & Technical Deep Research: Workhunt AI

## 1. System Requirements & Document Synthesis

### Document 01: Product Requirements Document (PRD)
- **Target Institution:** Hochschule Wismar (`@stud.hs-wismar.de` & `@hs-wismar.de`) + extensible academic domains (`@*.edu`, `@*.edu.de`, `@*.ac.uk`).
- **Core Modules:**
  - Automated job ingestion (German Federal Employment Agency + Google Custom Search API).
  - Preference matching & skill gap extraction with direct links to free educational materials (Coursera, YouTube, edX, Google Career Certificates).
  - On-screen interactive STAR study cheat sheet.
  - Tailored German (Tabellarischer Lebenslauf) & English CV / Cover Letter generator powered by Gemini 2.5 Flash.
  - Zero-storage privacy model for media assets (photos and signatures strictly in React state / memory, client-side `.docx` generation via `docx.js`).
  - Kanban lifecycle application tracker (`Matched` -> `Docs Generated` -> `Applied` -> `Interviewing` -> `Offer/Rejected`).
  - Telegram Notifications via Telegram Bot API with internal web app deep-links.
  - Study Buddy Peer Directory with 100-meter randomized circular location fuzzing.

### Document 02: Technical Architecture Document (TAD)
- **Tech Stack:**
  - **Framework & Hosting:** Next.js 14 (App Router) on Vercel (100k requests/mo free tier).
  - **Database & Auth:** Supabase PostgreSQL with RLS and domain auth policy (500MB free DB).
  - **Background Jobs:** GitHub Actions scheduled workflow running every 8 hours (2,000 build mins/mo free).
  - **AI Engine 1:** DeepSeek V4 / HuggingFace Inference API for match scoring (0-100%), skill gap parsing, and STAR cheat sheets.
  - **AI Engine 2:** Gemini 2.5 Flash API for tailored CV/Cover Letter generation (< 15 RPM).
  - **Transactional Mail:** Resend API (3,000 emails/mo free) for password resets and system alerts.
  - **Analytics & Errors:** Umami Cloud (cookie-free) & Sentry Developer (5,000 events/mo).

### Document 03: Security & Access Document (SAD)
- OAuth 2.0 with PKCE via Supabase Auth enforcing `hd: 'stud.hs-wismar.de'`.
- PostgreSQL DB trigger blocking auth creation for non-whitelisted email domains.
- Row Level Security (RLS) on all PostgreSQL tables with default `DENY ALL`.
- Strict input validation using Zod schemas on all API routes.
- Privacy & Zero-Storage: Zero media persisted to storage buckets or disk.
- ATS Readability: Standard fonts (Calibri/Arial), OpenXML structured hierarchy without floating text boxes.

### Document 04: UI/UX & Wireframe Design Document (WDD)
- **Design System:** Tailwind Slate Theme + Inter Typography + Lucide React Icons.
- **Color Palette:**
  - Slate 900 (`#0F172A`): Primary Headers
  - Slate 700 (`#334155`): Body Text
  - Teal 600 (`#0D9488`): Primary Actions & Brand Accent
  - Emerald 600 (`#16A34A`): High Match Badges
  - Amber 500 (`#F59E0B`): Skill Gap Chips
- **Key Screens:**
  1. Landing & Domain SSO Auth
  2. Student Profile & Base CV Setup
  3. Job Match Feed & Skill Gap Analysis
  4. Document Studio (CV & Cover Letter Generator)
  5. Interactive STAR Interview Cards
  6. Study Buddy Map Directory

### Document 05: Data Pipeline & Ingestion Document (DPD)
- Deduplication using SHA-256 hash `sha256(company + title + location)`.
- 6-Day Job Retention TTL purge SQL routine.
- 15-Minute RAM/Temp CV cache auto-cleanup.

### Document 06: Testing & Quality Assurance Document (TAD/QA)
- Jest (Unit testing for Zod schemas & utilities), Playwright (E2E testing), RLS Security testing.

---

## 2. Required External APIs & Environment Variables

To fully connect and execute the application, the following environment variables and API keys are required:

| Service / API | Variable Name | Role & Usage | Cost / Free Tier |
|---|---|---|---|
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL` | PostgreSQL DB & Auth endpoint | Free Tier (500MB DB) |
| **Supabase** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side auth & public queries | Free Tier |
| **Supabase** | `SUPABASE_SERVICE_ROLE_KEY` | Admin / Cron background upsert & purge | Free Tier |
| **Gemini AI** | `GEMINI_API_KEY` | Document generation (CV/Cover Letter) | Free Tier (15 RPM) |
| **DeepSeek / HuggingFace** | `DEEPSEEK_API_KEY` | Match index scoring, skill gap, STAR cards | Low-cost / Free Inference API |
| **Federal Job Agency** | *No key needed* (`jobsuche.api.bund.dev`) | Official German job listings API | Free & Public |
| **Google Search API** | `GOOGLE_CUSTOM_SEARCH_API_KEY` | Targeted queries (LinkedIn, Indeed, StepStone) | Free Tier (100 req/day) |
| **Google Search API** | `GOOGLE_SEARCH_ENGINE_ID` | Custom search engine identifier | Free Tier |
| **Telegram Bot API** | `TELEGRAM_BOT_TOKEN` | Dispatches job alerts to student Telegram | Free |
| **Telegram Channel** | `TELEGRAM_CHAT_ID` | Telegram notification target channel/chat | Free |
| **Resend API** | `RESEND_API_KEY` | Transactional email notifications | Free Tier (3,000 emails/mo) |
| **Umami Analytics** | `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Cookie-free privacy analytics | Free Tier |
| **Sentry** | `SENTRY_DSN` | Real-time error monitoring & crash reporting | Free Tier (5,000 events/mo) |

---

## 3. Recommended Project Structure (Next.js 14 App Router Monorepo)

```
Workhunt_AI/
├── .env.example               # Environment Variables template
├── gemini.md                  # Project Constitution & Data Schemas
├── task_plan.md               # Master Plan & Phase Checklists
├── findings.md                # Research & Document Synthesis
├── progress.md                # Task Execution & Audit Log
├── architecture/              # Layer 1: SOPs (Markdown)
│   ├── sop_ingestion.md       # Job scraping & deduplication SOP
│   ├── sop_ai_matching.md     # Dual-engine scoring & STAR generation SOP
│   ├── sop_doc_studio.md      # In-browser docx.js compilation SOP
│   └── sop_study_buddy.md     # 100m location fuzzing & peer matching SOP
├── tools/                     # Layer 3: Atomic Python/Node scripts & utilities
│   ├── ingest_jobs.ts         # Ingestion runner script
│   ├── purge_jobs.sql         # 6-Day TTL purge query
│   └── generate_docx.ts       # Client-side docx builder helpers
├── .tmp/                      # Intermediates / Temp workbench
└── src/ (or root App router)  # Next.js 14 Web Application
    ├── app/
    │   ├── page.tsx           # Landing & Domain SSO Auth
    │   ├── onboarding/        # Profile & Base CV setup
    │   ├── dashboard/         # Job Match Feed & Skill Gap
    │   ├── studio/            # Document Studio (CV & Cover Letter)
    │   ├── star/              # Interactive STAR Cheat Sheet
    │   ├── study-buddy/       # Peer Map Directory
    │   └── api/               # Next.js API Routes / Route Handlers
    ├── components/            # UI Components (Tailwind Slate design system)
    └── lib/                   # Supabase client, Zod schemas, AI handlers
```
