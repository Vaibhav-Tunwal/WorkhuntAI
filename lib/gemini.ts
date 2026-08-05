// Gemini AI client — uses AQ. key format with x-goog-api-key header
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL = 'gemini-2.5-flash'

interface GeminiResponse {
  candidates: Array<{ content: { parts: Array<{ text: string }> } }>
}

// Core Gemini call with exponential backoff (respects <15 RPM free tier)
async function callGemini(prompt: string, retries = 3): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}/${MODEL}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        if (res.status === 429) {
          // Rate limit — exponential backoff
          const delay = Math.pow(2, attempt) * 4000
          await new Promise(r => setTimeout(r, delay))
          continue
        }
        throw new Error(`Gemini error ${res.status}: ${JSON.stringify(err)}`)
      }
      const data: GeminiResponse = await res.json()
      return data.candidates[0].content.parts[0].text
    } catch (e) {
      if (attempt === retries - 1) throw e
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 2000))
    }
  }
  throw new Error('Gemini: max retries exceeded')
}

// Score a student profile against a job (0–100 match)
export async function scoreJobMatch(
  profileSkills: string[],
  preferredRoles: string[],
  jobTitle: string,
  jobDescription: string
): Promise<{ score: number; missingSkills: string[]; explanation: string }> {
  const prompt = `You are an expert career coach. Score how well this student profile matches the job.

Student Skills: ${profileSkills.join(', ')}
Student Preferred Roles: ${preferredRoles.join(', ')}
Job Title: ${jobTitle}
Job Description: ${jobDescription.substring(0, 1500)}

Respond ONLY with valid JSON in this exact format:
{
  "score": <integer 0-100>,
  "missingSkills": ["skill1", "skill2"],
  "explanation": "<one sentence>"
}`

  const raw = await callGemini(prompt)
  const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0] ?? '{}'
  return JSON.parse(jsonStr)
}

// Generate STAR interview cards
export async function generateSTARCards(
  jobTitle: string,
  jobDescription: string,
  studentSkills: string[]
): Promise<Array<{ situation: string; task: string; action: string; result: string; topic: string }>> {
  const prompt = `Generate 4 STAR interview story cards for a student applying for: ${jobTitle}

Student skills: ${studentSkills.join(', ')}
Job context: ${jobDescription.substring(0, 800)}

Respond ONLY with a JSON array:
[
  {
    "topic": "<short topic label>",
    "situation": "<describe a relatable scenario>",
    "task": "<what was the challenge>",
    "action": "<what the student should say they did>",
    "result": "<positive measurable outcome>"
  }
]`

  const raw = await callGemini(prompt)
  const jsonStr = raw.match(/\[[\s\S]*\]/)?.[0] ?? '[]'
  return JSON.parse(jsonStr)
}

// Generate German Lebenslauf + English CV + Cover Letter
export async function generateDocuments(profile: {
  fullName: string
  email: string
  studyProgram: string
  university: string
  skills: string[]
  baseCV: Record<string, unknown>
}, job: { title: string; company: string; description: string }): Promise<{
  lebenslauf: string
  coverLetterEN: string
}> {
  const cvPrompt = `You are an expert German CV writer. Write a professional Tabellarischer Lebenslauf (German CV) in German for:

Name: ${profile.fullName}
Email: ${profile.email}
University: ${profile.university}
Study Program: ${profile.studyProgram}
Skills: ${profile.skills.join(', ')}
Background: ${JSON.stringify(profile.baseCV).substring(0, 800)}

Applying for: ${job.title} at ${job.company}

Write a complete, ATS-ready German Lebenslauf. Use clean tabular format. Plain text only. No emojis.`

  const coverPrompt = `Write a professional one-page English cover letter for:

Name: ${profile.fullName}
Applying for: ${job.title} at ${job.company}
Skills: ${profile.skills.join(', ')}
Study Program: ${profile.studyProgram} at ${profile.university}

Job context: ${job.description.substring(0, 600)}

Write in a professional but warm tone. Highlight top 3 relevant skills. Keep under 300 words.`

  const [lebenslauf, coverLetterEN] = await Promise.all([
    callGemini(cvPrompt),
    callGemini(coverPrompt),
  ])

  return { lebenslauf, coverLetterEN }
}

// Extract skills from a job description
export async function extractJobSkills(description: string): Promise<string[]> {
  const prompt = `Extract the top 10 required technical and soft skills from this job description. Return ONLY a JSON array of strings, nothing else.

Job description: ${description.substring(0, 1000)}`

  const raw = await callGemini(prompt)
  const jsonStr = raw.match(/\[[\s\S]*\]/)?.[0] ?? '[]'
  return JSON.parse(jsonStr)
}
