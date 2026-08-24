# 📖 Workhunt AI — The Complete Bible (Explained Like You're 5)

> Everything you need to know about this project. Every file, every function, every feature. No jargon.

---

## 🌍 What is Workhunt AI?

This is a **dual-purpose platform**:

### Part 1: Portfolio Website (`/`)
The root URL is **Vaibhav Tunwal's personal portfolio** — showcasing AI automation expertise, professional experience, education, projects, skills, and hobbies. Built with a premium dark theme with teal/emerald accents, glassmorphism cards, and scroll animations.

### Part 2: AI Job Portal (`/login` → `/dashboard`)
A career co-pilot for German university students that:
1. **Fetches 50+ jobs daily** from Germany's Federal Job Agency API across 15 search categories via Vercel Cron (midnight daily).
2. **Scores your match** (0–100%) using Gemini AI.
3. **Identifies missing skills** with gap analysis.
4. **Generates ATS-compliant CVs** (German Lebenslauf + English CV) in-browser with zero server storage.
5. **Creates STAR interview prep cards** using the Situation-Task-Action-Result method.
6. **Shows a Germany Map** on the dashboard with your city (red pin) and job cities (teal circles).
7. **Study Buddy Map** — find study partners near you with 100m privacy fuzzing.
8. **Telegram Group** — invite shown after login for job alerts.
9. **Admin Portal** — full CRUD, user map, analytics for admin (`v.tunwal@stud.hs-wismar.de`).
10. **15-minute auto-logout** on inactivity for security.

---

## 🗺️ Feature & Function Locator Map

| Feature | File | Key Function/Component |
|---|---|---|
| **Portfolio Landing** | `app/page.tsx` | `PortfolioPage()` — hero, about, experience, projects, skills, hobbies, CTA |
| **Job Portal Login** | `app/login/page.tsx` | `handleSignUp()`, `handleSignIn()`, `handleForgotPassword()`, Telegram modal |
| **Password Reset** | `app/reset-password/page.tsx` | `handleReset()` |
| **Onboarding + City Picker** | `app/onboarding/page.tsx` | 3-step wizard with city dropdown from `lib/cities.ts` |
| **Dashboard + Germany Map** | `app/dashboard/page.tsx` | Split layout: job feed + `GermanyMap` sidebar |
| **Germany Map Component** | `components/GermanyMap.tsx` | Leaflet map with user city (red) + job cities (teal circles) |
| **Study Buddy Map** | `components/MapView.tsx` | Pure Leaflet — shows Name, University, Dept, Email, Instagram |
| **Admin Control Panel** | `app/admin/page.tsx` | User CRUD, job CRUD, analytics, add-job modal |
| **Admin API — Users** | `app/api/admin/users/route.ts` | `GET()` list, `DELETE()` user |
| **Admin API — Jobs** | `app/api/admin/jobs/route.ts` | `GET()` list, `POST()` create, `DELETE()` job |
| **Job Ingestion Engine** | `lib/ingestion.ts` | `runJobIngestion()` — 15 search terms, Federal API + Google CSE, Telegram alerts, 6-day TTL purge |
| **Vercel Cron Trigger** | `app/api/jobs/ingest/route.ts` | `GET()` + `POST()` with cron secret auth |
| **Cron Schedule** | `vercel.json` | `0 0 * * *` (daily midnight) |
| **AI Engine** | `lib/gemini.ts` | `scoreJobMatch()`, `extractJobSkills()`, `generateSTARCards()`, `generateDocumentText()` |
| **Email Validation** | `lib/utils.ts` | `isAcademicEmail()` — supports `stud.hs-wismar.de`, `stud-mail.uni-wuerzburg.de`, `.edu`, `.ac.uk` |
| **German Cities Data** | `lib/cities.ts` | `GERMAN_CITIES` coordinate map, `CITY_NAMES` sorted list |
| **Profile Editor** | `app/profile/page.tsx` | Skills, roles, locations CRUD |
| **Session Tracker** | `components/SessionTracker.tsx` | 15-min inactivity auto-logout |
| **Navigation Bar** | `components/Navbar.tsx` | Dynamic admin badge (⚡ Admin with ShieldAlert icon) |
| **Auth Middleware** | `middleware.ts` | Protects `/dashboard`, `/admin`, `/profile`, etc. Redirects to `/login` |
| **Database Schema** | `tools/migration.sql` | Tables: `users`, `profiles` (with `current_city`), `jobs`, `applications`, `study_buddies` view |

---

## 🏗️ Architecture (A.N.T. — 3 Layers)

- **Layer 1 (SOPs):** `architecture/` folder — markdown instructions for each feature
- **Layer 2 (Navigation):** `app/api/` routes — take requests, route to the right tool
- **Layer 3 (Tools):** `lib/` folder — atomic functions that do one thing perfectly

---

## 🔐 `.env` Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase database address |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public read key |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin write key |
| `GEMINI_API_KEY` | Google Gemini AI key |
| `GOOGLE_CUSTOM_SEARCH_API_KEY` | Google Search API |
| `GOOGLE_SEARCH_ENGINE_ID` | Custom search engine ID |
| `TELEGRAM_BOT_TOKEN` | Telegram bot |
| `TELEGRAM_CHAT_ID` | Telegram group |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Admin email (`v.tunwal@stud.hs-wismar.de`) |
| `CRON_SECRET` | Vercel cron authorization |
| `NEXT_PUBLIC_APP_URL` | Deployed Vercel URL |

---

## 🗄️ Database (Supabase PostgreSQL)

- **`users`** — Auto-created via trigger on signup. Stores id, email, domain.
- **`profiles`** — Student name, program, skills, roles, locations, `current_city`, Instagram, buddy visibility.
- **`jobs`** — Deduplicated via SHA-256 hash. 6-day TTL auto-purge. 15 search categories.
- **`applications`** — Tracks bookmarks, matches, scores, missing skills per user-job pair.
- **`study_buddies`** — SQL view with 100m coordinate fuzzing. Exposes name, email, university, program, Instagram.

---

## 🚀 Deployment

| Component | Platform | Tier |
|---|---|---|
| Web App | Vercel (Next.js 14) | Free |
| Database | Supabase PostgreSQL | Free |
| AI | Google Gemini 2.5 Flash | Free (15 RPM) |
| Cron | Vercel Crons | Free (daily) |
| Alerts | Telegram Bot API | Free |

---

*Last Updated: 2026-08-24 | v2 Architecture Overhaul Complete*
