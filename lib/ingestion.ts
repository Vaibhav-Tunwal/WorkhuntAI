import { supabaseAdmin } from '@/lib/supabase/server'
import { computeJobHash } from '@/lib/utils'
import { extractJobSkills } from '@/lib/gemini'

const FEDERAL_JOB_API = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs'
const SEARCH_TERMS = ['Softwareentwickler', 'Data Analyst', 'Werkstudent Informatik', 'IT Praktikum', 'Web Developer']

interface RawJob {
  titel?: string
  arbeitgeber?: string
  arbeitsort?: { ort?: string; region?: string }
  refnr?: string
  externeUrl?: string
  stellenbeschreibung?: string
}

// Fetch from German Federal Job Agency
async function fetchFederalJobs(): Promise<RawJob[]> {
  const allJobs: RawJob[] = []

  for (const term of SEARCH_TERMS) {
    try {
      const url = `${FEDERAL_JOB_API}?was=${encodeURIComponent(term)}&zeile=10`
      const res = await fetch(url, {
        headers: {
          'X-API-Key': 'jobboerse-jobsuche',
          'User-Agent': 'WorkhuntAI/1.0',
        },
      })
      if (!res.ok) continue
      const data = await res.json()
      allJobs.push(...(data.stellenangebote ?? []))
    } catch { /* skip failed terms */ }
  }
  return allJobs
}

// Fetch via Google Custom Search for specific job boards
async function fetchGoogleSearchJobs(): Promise<RawJob[]> {
  const key = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY
  const cx = process.env.GOOGLE_SEARCH_ENGINE_ID
  if (!key || !cx) return []

  const queries = [
    'Werkstudent Software site:linkedin.com/jobs Germany',
    'Praktikum Data Science site:stepstone.de',
  ]
  const allJobs: RawJob[] = []

  for (const q of queries) {
    try {
      const url = `https://customsearch.googleapis.com/customsearch/v1?q=${encodeURIComponent(q)}&cx=${cx}&num=5`
      const res = await fetch(url, {
        headers: { 'x-goog-api-key': key }
      })
      if (!res.ok) continue
      const data = await res.json()
      for (const item of data.items ?? []) {
        allJobs.push({
          titel: item.title,
          arbeitgeber: item.displayLink,
          arbeitsort: { ort: 'Germany' },
          externeUrl: item.link,
          stellenbeschreibung: item.snippet,
        })
      }
    } catch { /* skip */ }
  }
  return allJobs
}

// Send Telegram alert for high-match jobs
async function sendTelegramAlert(jobTitle: string, company: string, jobId: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const appUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://workhuntai.vercel.app'}/dashboard?job=${jobId}`
  const message = `🚀 *New Job Match!*\n\n*${jobTitle}*\nat ${company}\n\n[View & Apply →](${appUrl})`

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
  }).catch(() => {})
}

// Main ingestion runner — called by cron route
export async function runJobIngestion(): Promise<{ inserted: number; skipped: number }> {
  const [federalJobs, googleJobs] = await Promise.all([
    fetchFederalJobs(),
    fetchGoogleSearchJobs(),
  ])

  const allRaw = [...federalJobs, ...googleJobs]
  let inserted = 0, skipped = 0

  for (const raw of allRaw) {
    const title = raw.titel ?? 'Unknown'
    const company = raw.arbeitgeber ?? 'Unknown'
    const location = raw.arbeitsort?.ort ?? raw.arbeitsort?.region ?? 'Germany'
    const description = raw.stellenbeschreibung ?? ''
    const externalUrl = raw.externeUrl ?? `https://jobsuche.bundesagentur.de/stellensuche/stellenangebot?refnr=${raw.refnr}`

    const hash = await computeJobHash(company, title, location)

    // Try to insert — skip duplicates via ON CONFLICT
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert({
        dedup_hash: hash,
        title,
        company,
        location,
        external_source_url: externalUrl,
        description,
        extracted_skills: [],
      })
      .select('id')
      .single()

    if (error) {
      skipped++
      continue
    }

    inserted++

    // Async: extract skills and update job
    if (description) {
      extractJobSkills(description).then(skills => {
        supabaseAdmin.from('jobs').update({ extracted_skills: skills }).eq('id', data.id)
      }).catch(() => {})
    }

    // Send Telegram alert (fire-and-forget)
    sendTelegramAlert(title, company, data.id)
  }

  // Purge old jobs
  await supabaseAdmin.rpc('purge_old_jobs')

  return { inserted, skipped }
}
