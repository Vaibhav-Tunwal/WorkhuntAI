import { NextRequest, NextResponse } from 'next/server'
import { generateDocuments } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { profile, job } = await req.json()
    const result = await generateDocuments(profile, job)
    return NextResponse.json(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
