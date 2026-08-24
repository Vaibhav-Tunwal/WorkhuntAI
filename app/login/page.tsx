'use client'

import { Suspense, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import { isAcademicEmail } from '@/lib/utils'
import Link from 'next/link'
import { Briefcase, ArrowRight, Shield, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'

type AuthMode = 'signin' | 'signup' | 'verify' | 'forgot' | 'forgot_sent'

const TELEGRAM_GROUP_LINK = 'https://t.me/+workhuntai'

function LoginPageContent() {
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
  const [showTelegramModal, setShowTelegramModal] = useState(false)

  const notify = (text: string, err = false) => { setMsg(text); setIsError(err) }
  const clearMsg = () => setMsg('')
  const validateEmail = (e: string) => isAcademicEmail(e)

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

    // Show Telegram group link after successful login
    setShowTelegramModal(true)

    // Admin check
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'v.tunwal@stud.hs-wismar.de'
    if (user.email === adminEmail) {
      setTimeout(() => router.push('/admin'), 3000)
      return
    }

    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
    setTimeout(() => router.push(profile ? '/dashboard' : '/onboarding'), 3000)
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
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-teal-950/20 via-slate-950 to-slate-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </Link>

        <div className="glass p-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-100">Workhunt AI</h1>
              <p className="text-xs text-slate-500">Career Co-Pilot for Students</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-teal-950/50 border border-teal-800/50 rounded-full px-3 py-1 mb-5">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-xs text-teal-300">University Email Required</span>
          </div>

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
              <p className="text-slate-400 text-sm">Check your inbox at <span className="text-teal-300 font-medium">{email}</span>.</p>
              <button onClick={() => { setMode('signin'); clearMsg() }} className="btn-primary w-full mt-4">Back to Sign In</button>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="space-y-4">
              <button onClick={() => { setMode('signin'); clearMsg() }} className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1">← Back</button>
              <h2 className="text-xl font-bold text-slate-100">Forgot Password</h2>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" placeholder="you@stud.hs-wismar.de" value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleForgotPassword()} className="input-field pl-10 w-full" />
              </div>
              {msg && <div className={`text-xs px-3 py-2 rounded-lg ${isError ? 'bg-red-950/50 border border-red-800/50 text-red-300' : 'bg-teal-950/50 border border-teal-800/50 text-teal-300'}`}>{msg}</div>}
              <button onClick={handleForgotPassword} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Send Reset Link
              </button>
            </div>
          )}

          {(mode === 'signin' || mode === 'signup') && (
            <>
              <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 mb-4">
                <button onClick={() => { setMode('signup'); clearMsg() }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'signup' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                  Sign Up
                </button>
                <button onClick={() => { setMode('signin'); clearMsg() }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'signin' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                  Sign In
                </button>
              </div>
              {mode === 'signup' && <p className="text-xs text-slate-500 mb-3 text-center">Create your account first, then sign in after verifying your email.</p>}

              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="email" placeholder="you@stud.hs-wismar.de" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-10 w-full" />
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
                  <button onClick={() => { setMode('forgot'); clearMsg() }} className="text-xs text-teal-400 hover:text-teal-300 text-right w-full block">Forgot password?</button>
                )}

                {(msg || (urlError && !msg)) && (
                  <div className={`text-xs px-3 py-2 rounded-lg ${isError ? 'bg-red-950/50 border border-red-800/50 text-red-300' : 'bg-teal-950/50 border border-teal-800/50 text-teal-300'}`}>
                    {msg || (urlError === 'not_university' ? '⚠️ Only university emails allowed.' : urlError === 'auth_failed' ? '⚠️ Authentication failed.' : urlError === 'unauthenticated' ? '⚠️ Please sign in.' : '')}
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

      {/* Telegram Group Modal */}
      {showTelegramModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass w-full max-w-sm p-8 text-center animate-slide-up bg-slate-950">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">Welcome to Workhunt AI!</h2>
            <p className="text-sm text-slate-400 mb-5">Join our Telegram group for instant job alerts and community support.</p>
            <a href={TELEGRAM_GROUP_LINK} target="_blank" rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-2 mb-3">
              Join Telegram Group →
            </a>
            <button onClick={() => setShowTelegramModal(false)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Skip for now · Redirecting in 3s...
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </main>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
