import { NextRequest, NextResponse } from 'next/server'
import { scoreJobMatch } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { profileSkills, preferredRoles, jobTitle, jobDescription } = await req.json()
    const result = await scoreJobMatch(profileSkills, preferredRoles, jobTitle, jobDescription)
    return NextResponse.json(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
