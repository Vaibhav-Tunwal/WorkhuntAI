import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/onboarding', '/studio', '/star', '/study-buddy', '/profile', '/admin']


export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => { res.cookies.set({ name, value, ...options }) },
        remove: (name: string, options: any) => { res.cookies.set({ name, value: '', ...options }) },
    }}
  )

  const { data: { session } } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname
  const isProtected = PROTECTED.some(p => path.startsWith(p))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/?error=unauthenticated', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/studio/:path*',
    '/star/:path*',
    '/study-buddy/:path*',
    '/profile/:path*',
    '/admin/:path*'
  ],
}
