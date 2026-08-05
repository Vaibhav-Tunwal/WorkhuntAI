# SOP: Job Ingestion Engine

## Purpose
Automate the aggregation of German and European job listings from official and web search endpoints, deduplicate entries, and schedule 6-day TTL cleanup.

## Workflow & Protocol

### 1. Ingestion Execution
- Frequency: Every 8 hours via GitHub Actions workflow (`.github/workflows/job_ingestion.yml`).
- Data Sources:
  1. **Federal Employment Agency API (`jobsuche.api.bund.dev`):** Query zero-cost public listings matching target student roles (e.g., Software Engineer, Data Analyst, Working Student/Werkstudent, Internship/Praktikum) in Germany.
  2. **Google Custom Search JSON API:** Structured site-specific queries targeting LinkedIn, Indeed, and StepStone postings.

### 2. Deduplication Algorithm
- Before database insertion, compute SHA-256 hash:
  `dedup_hash = sha256(company.trim().toLowerCase() + '|' + title.trim().toLowerCase() + '|' + location.trim().toLowerCase())`
- Execute PostgreSQL `INSERT INTO jobs ... ON CONFLICT (dedup_hash) DO NOTHING`.

### 3. Deep-Link Routing
- Generate an internal web app URL for each listing: `app_job_url = "https://app.workhuntai.com/jobs/" + job.id`.
- Post high-matching jobs (above student match threshold) to Telegram channel using `app_job_url` so users are retained within the web app environment.

### 4. Automated 6-Day Purge
- Run daily SQL routine:
  `DELETE FROM jobs WHERE created_at < NOW() - INTERVAL '6 days';`
- Protect database from bloat and ensure sub-20ms query performance.
