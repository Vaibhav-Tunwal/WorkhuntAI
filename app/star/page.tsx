'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import STARCard from '@/components/STARCard'
import { Loader2, Sparkles } from 'lucide-react'

export default function STARPage() {
  const [profile, setProfile] = useState<any>(null)

  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [profileRes, jobsRes] = await Promise.all([
      supabase.from('profiles').select('skills').eq('id', user.id).single(),
      supabase.from('jobs').select('id, title, company, description').order('created_at', { ascending: false }).limit(20),
    ])
    setProfile(profileRes.data)
    setJobs(jobsRes.data ?? [])
  }

  const handleGenerate = async () => {
    if (!selectedJob || !profile) return
    setLoading(true)
    try {
      const res = await fetch('/api/star/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: selectedJob.title,
          jobDescription: selectedJob.description ?? '',
          studentSkills: profile.skills,
        }),
      })
      const data = await res.json()
      setCards(data.cards ?? [])
    } catch (e) {
      console.error('STAR generation error:', e)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen pt-16">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">STAR</span> Interview Prep
        </h1>
        <p className="text-slate-400 mb-8">
          AI-generated flashcards using the Situation-Task-Action-Result framework. Tap a card to flip.
        </p>

        {/* Job selector + generate */}
        <div className="glass p-5 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-slate-300 mb-1 block">Select a Job</label>
              <select value={selectedJob?.id ?? ''}
                onChange={e => setSelectedJob(jobs.find(j => j.id === e.target.value) ?? null)}
                className="input-field">
                <option value="">Choose a job...</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title} — {j.company}</option>
                ))}
              </select>
            </div>
            <button onClick={handleGenerate} disabled={!selectedJob || loading}
              className="btn-primary flex items-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                : <><Sparkles className="w-4 h-4" /> Generate Cards</>}
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        {cards.length > 0 && (
          <div className="grid md:grid-cols-2 gap-5 animate-fade-in">
            {cards.map((card, i) => (
              <STARCard key={i} {...card} />
            ))}
          </div>
        )}

        {cards.length === 0 && !loading && (
          <div className="text-center py-20 text-slate-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-700" />
            <p>Select a job and generate your personalized interview prep cards.</p>
          </div>
        )}
      </div>
    </main>
  )
}
