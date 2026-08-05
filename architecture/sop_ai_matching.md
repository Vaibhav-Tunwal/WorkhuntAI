# SOP: Dual-Engine AI Orchestration

## Purpose
Partition AI workloads between DeepSeek (low-cost match scoring, skill gap, STAR cheat sheets) and Gemini 2.5 Flash (high-level tailored CV & Cover Letter drafting) while strictly maintaining rate limits under 15 RPM.

## Engine Partitioning & Rules

### Engine 1: DeepSeek V4 / HuggingFace Inference API
- **Match Index Scoring (0-100%):** Compare candidate profile JSON (skills, experience, preferences) against job description text. Output integer score.
- **Skill Gap Extraction:** Identify required hard/soft skills absent from candidate profile. Generate direct pre-filtered learning search links (Coursera, YouTube, edX, Google Career Certificates).
- **STAR Interview Cheat Sheet:** Generate personalized Situation, Task, Action, Result study cards directly rendered in Next.js UI.

### Engine 2: Gemini 2.5 Flash API
- **Trigger:** Manual user action ("Generate Docs" button).
- **Outputs:**
  1. German Tabular Lebenslauf format or English ATS CV text.
  2. Single-page personalized Cover Letter tailored to the specific job posting.
- **Rate-Limit Guard:** Enforce exponential backoff and queue buffer staying under 15 Requests Per Minute.

## Self-Annealing Repair Protocol
If AI API returns malformed JSON or times out:
1. Log stack trace and input payload to Sentry.
2. Retry with fallback prompt requesting strict JSON schema output.
3. Update SOP with any newly observed edge case or prompt constraint.
