import { NextRequest, NextResponse } from 'next/server'
import { generateSTARCards } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, jobDescription, studentSkills } = await req.json()
    const cards = await generateSTARCards(jobTitle, jobDescription, studentSkills)
    return NextResponse.json({ cards })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
