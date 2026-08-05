'use client'

import { Suspense, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import { Briefcase, Brain, FileText, Users, ArrowRight, Shield, Zap, Globe, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

const features = [
  { icon: Briefcase, title: 'Auto Job Discovery', desc: 'Scans German Federal Job Agency + Google every 8 hours. Zero manual searching.' },
  { icon: Brain, title: 'AI Match Scoring', desc: 'Gemini AI scores every job against your profile. 0–100% match with skill gap analysis.' },
  { icon: FileText, title: 'Document Studio', desc: 'Generates ATS-compliant German Lebenslauf & English CV. Zero files touch our server.' },
  { icon: Users, title: 'Study Buddy Map', desc: 'Find study partners near you. Location is fuzzed to 100m for privacy.' },
  { icon: Zap, title: 'STAR Interview Prep', desc: 'AI-generated interview story cards using the Situation-Task-Action-Result method.' },
  { icon: Globe, title: 'Telegram Alerts', desc: 'Get instant notifications when a high-match job appears. Never miss an opportunity.' },
]

type AuthMode = 'landing' | 'signin' | 'signup' | 'verify'

function LandingPageContent() {
  const params = useSearchParams()
  const router = useRouter()
  const error = params.get('error')

  const [mode, setMode] = useState<AuthMode>('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [isError, setIsError] = useState(false)

  const notify = (text: string, err = false) => { setMsg(text); setIsError(err) }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: { hd: 'stud.hs-wismar.de' },
      },
    })
  }

  const validateEmail = (e: string) => e.endsWith('@stud.hs-wismar.de') || e.endsWith('@hs-wismar.de') || e.endsWith('.edu') || e.endsWith('.ac.uk')

  const handleSignUp = async () => {
    if (!validateEmail(email)) {
      notify('Only university email addresses are allowed (e.g. @stud.hs-wismar.de)', true)
      return
    }
    if (password.length < 8) {
      notify('Password must be at least 8 characters', true)
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` }
    })
    setLoading(false)
    if (error) { notify(error.message, true); return }
    setMode('verify')
    notify('Check your university email for a confirmation link!')
  }

  const handleSignIn = async () => {
    if (!email || !password) { notify('Please enter email and password', true); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { notify(error.message, true); return }
    // Check if profile exists
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
    router.push(profile ? '/dashboard' : '/onboarding')
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-950/20 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: Hero text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-teal-950/50 border border-teal-800/50 rounded-full px-4 py-1.5 mb-8">
                <Shield className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-medium text-teal-300">University Email Required · Privacy First</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                <span className="text-gradient">Workhunt</span>{' '}
                <span className="text-slate-100">AI</span>
              </h1>
              <p className="text-xl text-slate-400 mt-6 max-w-xl leading-relaxed">
                Your AI career co-pilot. Automated job discovery, match scoring, CV generation,
                and interview prep — built exclusively for Hochschule Wismar students.
              </p>
            </div>

            {/* Right: Auth card */}
            <div className="w-full max-w-sm glass p-8 animate-slide-up">
              {mode === 'verify' ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-teal-900/50 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-8 h-8 text-teal-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">Check Your Email</h2>
                  <p className="text-slate-400 text-sm">We sent a confirmation link to <span className="text-teal-300 font-medium">{email}</span>. Click it to activate your account.</p>
                  <button onClick={() => setMode('signin')} className="btn-primary w-full mt-4">Back to Sign In</button>
                </div>
              ) : (
                <>
                  <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 mb-6">
                    <button onClick={() => { setMode('signin'); setMsg('') }}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'signin' || mode === 'landing' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                      Sign In
                    </button>
                    <button onClick={() => { setMode('signup'); setMsg('') }}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'signup' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                      Sign Up
                    </button>
                  </div>

                  {/* Google */}
                  <button onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 border border-slate-700 hover:border-slate-500 rounded-xl py-3 px-4 text-sm font-medium text-slate-200 transition-all hover:bg-slate-800/50 mb-4">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>

                  <div className="relative flex items-center gap-3 mb-4">
                    <div className="flex-1 border-t border-slate-700" />
                    <span className="text-xs text-slate-500">or with university email</span>
                    <div className="flex-1 border-t border-slate-700" />
                  </div>

                  {/* Email/Password */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="email" placeholder="you@stud.hs-wismar.de"
                        value={email} onChange={e => setEmail(e.target.value)}
                        className="input-field pl-10 w-full" />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type={showPass ? 'text' : 'password'} placeholder="Password (min 8 chars)"
                        value={password} onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (mode === 'signup' ? handleSignUp() : handleSignIn())}
                        className="input-field pl-10 pr-10 w-full" />
                      <button onClick={() => setShowPass(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {msg && (
                      <div className={`text-xs px-3 py-2 rounded-lg ${isError ? 'bg-red-950/50 border border-red-800/50 text-red-300' : 'bg-teal-950/50 border border-teal-800/50 text-teal-300'}`}>
                        {msg}
                      </div>
                    )}

                    {(error) && !msg && (
                      <div className="text-xs px-3 py-2 rounded-lg bg-red-950/50 border border-red-800/50 text-red-300">
                        {error === 'not_university' && '⚠️ Only university email addresses are allowed.'}
                        {error === 'auth_failed' && '⚠️ Authentication failed. Please try again.'}
                        {error === 'unauthenticated' && '⚠️ Please sign in to access this page.'}
                        {error === 'no_code' && '⚠️ Something went wrong. Please try again.'}
                      </div>
                    )}

                    <button
                      onClick={mode === 'signup' ? handleSignUp : handleSignIn}
                      disabled={loading}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      {mode === 'signup' ? 'Create Account' : 'Sign In'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need, <span className="text-gradient">automated.</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass p-6 hover:border-teal-700/50 transition-all duration-300 group">
              <div className="w-10 h-10 bg-teal-950 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-900 transition-colors">
                <Icon className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="font-semibold text-slate-100">{title}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-500">
          <span>© 2026 Workhunt AI · Hochschule Wismar</span>
          <span>100% Free · Zero Data Sold · Open Source</span>
        </div>
      </footer>
    </main>
  )
}

export default function LandingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </main>
    }>
      <LandingPageContent />
    </Suspense>
  )
}
