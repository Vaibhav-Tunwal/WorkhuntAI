'use client'

import { supabase } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Briefcase, Brain, FileText, Users, ArrowRight, Shield, Zap, Globe } from 'lucide-react'

export default function LandingPage() {
  const params = useSearchParams()
  const error = params.get('error')


  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: { hd: 'stud.hs-wismar.de' },
      },
    })
  }

  const features = [
    { icon: Briefcase, title: 'Auto Job Discovery', desc: 'Scans German Federal Job Agency + Google every 8 hours. Zero manual searching.' },
    { icon: Brain, title: 'AI Match Scoring', desc: 'Gemini AI scores every job against your profile. 0–100% match with skill gap analysis.' },
    { icon: FileText, title: 'Document Studio', desc: 'Generates ATS-compliant German Lebenslauf & English CV. Zero files touch our server.' },
    { icon: Users, title: 'Study Buddy Map', desc: 'Find study partners near you. Location is fuzzed to 100m for privacy.' },
    { icon: Zap, title: 'STAR Interview Prep', desc: 'AI-generated interview story cards using the Situation-Task-Action-Result method.' },
    { icon: Globe, title: 'Telegram Alerts', desc: 'Get instant notifications when a high-match job appears. Never miss an opportunity.' },
  ]

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-950/20 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-950/50 border border-teal-800/50 rounded-full px-4 py-1.5 mb-8">
            <Shield className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-medium text-teal-300">University Email Required · Privacy First</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-gradient">Workhunt</span>{' '}
            <span className="text-slate-100">AI</span>
          </h1>
          <p className="text-xl text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed">
            Your AI career co-pilot. Automated job discovery, match scoring, CV generation,
            and interview prep — built exclusively for Hochschule Wismar students.
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">
            <button onClick={handleLogin}
              className="btn-primary text-base px-8 py-3 flex items-center gap-2 group">
              Sign in with Google
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {error && (
            <div className="mt-6 inline-block bg-red-950/50 border border-red-800/50 rounded-xl px-4 py-2 text-sm text-red-300">
              {error === 'not_university' && '⚠️ Only university email addresses are allowed.'}
              {error === 'auth_failed' && '⚠️ Authentication failed. Please try again.'}
              {error === 'unauthenticated' && '⚠️ Please sign in to access this page.'}
              {error === 'no_code' && '⚠️ Something went wrong. Please try again.'}
            </div>
          )}
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
