import { NextRequest, NextResponse } from 'next/server'
import { runJobIngestion } from '@/lib/ingestion'

async function handleIngest(req: NextRequest) {
  const authHeader = req.headers.get('x-cron-secret') || req.headers.get('Authorization')?.replace('Bearer ', '')
  if (authHeader !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const result = await runJobIngestion()
    return NextResponse.json({ success: true, ...result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return handleIngest(req)
}

export async function GET(req: NextRequest) {
  return handleIngest(req)
}
