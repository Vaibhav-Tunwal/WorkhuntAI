import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { isAcademicEmail } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', req.url))
  }

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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(new URL('/?error=auth_failed', req.url))
  }

  const email = data.session.user.email ?? ''
  if (!isAcademicEmail(email)) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/?error=not_university', req.url))
  }

  // Ensure the user row exists in public.users (handles cases where trigger missed it)
  await supabase.from('users').upsert({
    id: data.session.user.id,
    email,
    domain: email.split('@')[1],
  }, { onConflict: 'id' })

  // Check if profile exists — if not, send to onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.session.user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  return NextResponse.redirect(new URL('/dashboard', req.url))
}
