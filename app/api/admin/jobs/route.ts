import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { computeJobHash } from '@/lib/utils'

async function checkAdmin(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      }
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
}

// GET all jobs
export async function GET(req: NextRequest) {
  if (!await checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: jobs, error } = await supabaseAdmin
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(jobs)
}

// POST a new job (Create/Add Job)
export async function POST(req: NextRequest) {
  if (!await checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, company, location, external_source_url, description, extracted_skills } = await req.json()

    if (!title || !company) {
      return NextResponse.json({ error: 'Title and Company are required' }, { status: 400 })
    }

    const hash = await computeJobHash(company, title, location ?? 'Germany')

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert({
        dedup_hash: hash,
        title,
        company,
        location: location ?? 'Germany',
        external_source_url: external_source_url ?? '',
        description: description ?? '',
        extracted_skills: extracted_skills ?? [],
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}

// DELETE a job
export async function DELETE(req: NextRequest) {
  if (!await checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const jobId = url.searchParams.get('id')

  if (!jobId) {
    return NextResponse.json({ error: 'Missing job ID' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('jobs')
    .delete()
    .eq('id', jobId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
