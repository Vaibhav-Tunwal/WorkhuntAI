'use client'

import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, Loader2, Check } from 'lucide-react'

function ResetPasswordContent() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [isError, setIsError] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleReset = async () => {
    if (password.length < 8) {
      setMsg('Password must be at least 8 characters')
      setIsError(true)
      return
    }
    setLoading(true)
    setMsg('')
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setMsg(error.message)
      setIsError(true)
      return
    }

    setSuccess(true)
    // Sign out to force re-login with new password
    await supabase.auth.signOut()
    setTimeout(() => {
      router.push('/')
    }, 3000)
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-teal-900/50 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-teal-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Password Updated</h2>
        <p className="text-slate-400 text-sm">Your password has been reset successfully. Redirecting you to the sign-in page...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-100">Set New Password</h2>
      <p className="text-slate-400 text-sm">Enter a new secure password for your account.</p>

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type={showPass ? 'text' : 'password'}
          placeholder="New Password (min 8 chars)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleReset()}
          className="input-field pl-10 pr-10 w-full"
        />
        <button
          onClick={() => setShowPass(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
        >
          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {msg && (
        <div className={`text-xs px-3 py-2 rounded-lg ${isError ? 'bg-red-950/50 border border-red-800/50 text-red-300' : 'bg-teal-950/50 border border-teal-800/50 text-teal-300'}`}>
          {msg}
        </div>
      )}

      <button
        onClick={handleReset}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Update Password
      </button>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm glass p-8">
        <Suspense fallback={<Loader2 className="w-8 h-8 text-teal-400 animate-spin mx-auto" />}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </main>
  )
}
