'use client'

import { Suspense, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import { Briefcase, Brain, FileText, Users, ArrowRight, Shield, Zap, Globe, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

const features = [
  { icon: Briefcase, title: 'Auto Job Discovery', desc: 'Scans German Federal Job Agency every 8 hours. Zero manual searching.' },
  { icon: Brain, title: 'AI Match Scoring', desc: 'Gemini AI scores every job against your profile. 0–100% match with skill gap analysis.' },
  { icon: FileText, title: 'Document Studio', desc: 'Generates ATS-compliant German Lebenslauf & English CV. Zero files touch our server.' },
  { icon: Users, title: 'Study Buddy Map', desc: 'Find study partners near you. Location is fuzzed to 100m for privacy.' },
  { icon: Zap, title: 'STAR Interview Prep', desc: 'AI-generated interview story cards using the Situation-Task-Action-Result method.' },
  { icon: Globe, title: 'Telegram Alerts', desc: 'Get instant notifications when a high-match job appears. Never miss an opportunity.' },
]

type AuthMode = 'signin' | 'signup' | 'verify' | 'forgot' | 'forgot_sent'

function LandingPageContent() {
  const params = useSearchParams()
  const router = useRouter()
  const urlError = params.get('error')

  const [mode, setMode] = useState<AuthMode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [isError, setIsError] = useState(false)

  const notify = (text: string, err = false) => { setMsg(text); setIsError(err) }
  const clearMsg = () => setMsg('')

  const ALLOWED = ['stud.hs-wismar.de', 'hs-wismar.de']
  const validateEmail = (e: string) => {
    const domain = e.split('@')[1] ?? ''
    return ALLOWED.includes(domain) || domain.endsWith('.edu') || domain.endsWith('.ac.uk')
  }

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
  }

  const handleSignIn = async () => {
    if (!email || !password) { notify('Please enter your email and password', true); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        notify('Account not found. Please sign up first, then verify your email.', true)
      } else {
        notify(error.message, true)
      }
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Admin check — env var + hardcoded fallback
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'v.tunwal@stud.hs-wismar.de'
    if (user.email === adminEmail) {
      router.push('/admin')
      return
    }

    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
    router.push(profile ? '/dashboard' : '/onboarding')
  }

  const handleForgotPassword = async () => {
    if (!email) { notify('Please enter your email address', true); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) { notify(error.message, true); return }
    setMode('forgot_sent')
  }

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-950/20 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Hero text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-teal-950/50 border border-teal-800/50 rounded-full px-4 py-1.5 mb-8">
                <Shield className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-medium text-teal-300">University Email Required · Privacy First</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                <span className="text-gradient">Workhunt</span>{' '}<span className="text-slate-100">AI</span>
              </h1>
              <p className="text-xl text-slate-400 mt-6 max-w-xl leading-relaxed">
                Your AI career co-pilot — automated job discovery, match scoring, CV generation,
                and interview prep built exclusively for Hochschule Wismar students.
              </p>
            </div>

            {/* Auth Card */}
            <div className="w-full max-w-sm glass p-8 animate-slide-up">
              {mode === 'verify' && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-teal-900/50 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-8 h-8 text-teal-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">Verify Your Email</h2>
                  <p className="text-slate-400 text-sm">We sent a confirmation link to <span className="text-teal-300 font-medium">{email}</span>. Click it to activate your account, then sign in.</p>
                  <button onClick={() => { setMode('signin'); clearMsg() }} className="btn-primary w-full mt-4">Back to Sign In</button>
                </div>
              )}

              {mode === 'forgot_sent' && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-teal-900/50 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-8 h-8 text-teal-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">Reset Link Sent</h2>
                  <p className="text-slate-400 text-sm">Check your inbox at <span className="text-teal-300 font-medium">{email}</span>. Click the link to set a new password.</p>
                  <button onClick={() => { setMode('signin'); clearMsg() }} className="btn-primary w-full mt-4">Back to Sign In</button>
                </div>
              )}

              {mode === 'forgot' && (
                <div className="space-y-4">
                  <button onClick={() => { setMode('signin'); clearMsg() }} className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1">
                    ← Back to Sign In
                  </button>
                  <h2 className="text-xl font-bold text-slate-100">Forgot Password</h2>
                  <p className="text-slate-400 text-sm">Enter your university email and we will send you a reset link.</p>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="email" placeholder="you@stud.hs-wismar.de"
                      value={email} onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
                      className="input-field pl-10 w-full" />
                  </div>
                  {msg && <div className={`text-xs px-3 py-2 rounded-lg ${isError ? 'bg-red-950/50 border border-red-800/50 text-red-300' : 'bg-teal-950/50 border border-teal-800/50 text-teal-300'}`}>{msg}</div>}
                  <button onClick={handleForgotPassword} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    Send Reset Link
                  </button>
                </div>
              )}

              {(mode === 'signin' || mode === 'signup') && (
                <>
                  {/* Tab switcher */}
                  <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 mb-6">
                    <button onClick={() => { setMode('signup'); clearMsg() }}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'signup' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                      Sign Up
                    </button>
                    <button onClick={() => { setMode('signin'); clearMsg() }}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'signin' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                      Sign In
                    </button>
                  </div>
                  {mode === 'signup' && <p className="text-xs text-slate-500 -mt-4 mb-3 text-center">Create your account first, then sign in after verifying your email.</p>}

                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="email" placeholder="you@stud.hs-wismar.de"
                        value={email} onChange={e => setEmail(e.target.value)}
                        className="input-field pl-10 w-full" />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type={showPass ? 'text' : 'password'} placeholder={mode === 'signup' ? 'Password (min 8 chars)' : 'Password'}
                        value={password} onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (mode === 'signup' ? handleSignUp() : handleSignIn())}
                        className="input-field pl-10 pr-10 w-full" />
                      <button onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {mode === 'signin' && (
                      <button onClick={() => { setMode('forgot'); clearMsg() }} className="text-xs text-teal-400 hover:text-teal-300 text-right w-full block">
                        Forgot password?
                      </button>
                    )}

                    {(msg || (urlError && !msg)) && (
                      <div className={`text-xs px-3 py-2 rounded-lg ${isError ? 'bg-red-950/50 border border-red-800/50 text-red-300' : 'bg-teal-950/50 border border-teal-800/50 text-teal-300'}`}>
                        {msg || (urlError === 'not_university' ? '⚠️ Only university emails are allowed.' : urlError === 'auth_failed' ? '⚠️ Authentication failed.' : urlError === 'unauthenticated' ? '⚠️ Please sign in to continue.' : '')}
                      </div>
                    )}

                    <button onClick={mode === 'signup' ? handleSignUp : handleSignIn} disabled={loading}
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

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need, <span className="text-gradient">automated.</span></h2>
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
