'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { FileText, Download, Loader2, ChevronDown } from 'lucide-react'

export default function StudioPage() {
  const [profile, setProfile] = useState<any>(null)

  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ lebenslauf: string; coverLetterEN: string } | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [profileRes, jobsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(20),
    ])
    setProfile(profileRes.data)
    setJobs(jobsRes.data ?? [])
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleGenerate = async () => {
    if (!profile || !selectedJob) return
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            fullName: profile.full_name,
            email: profile.email,
            studyProgram: profile.study_program,
            university: profile.university_name,
            skills: profile.skills,
            baseCV: profile.base_cv_json,
          },
          job: {
            title: selectedJob.title,
            company: selectedJob.company,
            description: selectedJob.description ?? '',
          },
        }),
      })
      const data = await res.json()
      setResult(data)

      // Update application status
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('applications').upsert({
          user_id: user.id, job_id: selectedJob.id, status: 'DOCS_GENERATED',
        })
      }
    } catch (e) {
      console.error('Generation error:', e)
      alert('Failed to generate documents. Please try again.')
    }
    setLoading(false)
  }

  const downloadAsText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen pt-16">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">Document</span> Studio
        </h1>
        <p className="text-slate-400 mb-8">Generate ATS-compliant German Lebenslauf & English Cover Letter. Photos stay in your browser — zero server storage.</p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Job Selector */}
          <div className="glass p-6">
            <h2 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" /> Select a Job
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {jobs.map(j => (
                <button key={j.id} onClick={() => setSelectedJob(j)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all
                    ${selectedJob?.id === j.id
                      ? 'bg-teal-600/20 border border-teal-600 text-teal-300'
                      : 'border border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                  <span className="font-medium text-slate-200">{j.title}</span>
                  <span className="block text-xs text-slate-500">{j.company}</span>
                </button>
              ))}
              {jobs.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No jobs available yet. Wait for the next ingestion.</p>
              )}
            </div>
          </div>

          {/* Photo Upload + Generate */}
          <div className="glass p-6 flex flex-col">
            <h2 className="font-semibold text-slate-200 mb-3">Photo (optional, stays in browser)</h2>
            <label className="btn-ghost text-sm cursor-pointer text-center mb-4">
              {photo ? '✓ Photo loaded (in-memory only)' : 'Upload passport photo'}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {photo && (
              <img src={photo} alt="Preview" className="w-24 h-24 rounded-xl object-cover mx-auto mb-4 border-2 border-slate-700" />
            )}

            <div className="flex-1" />

            <button onClick={handleGenerate} disabled={!selectedJob || loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                : <>Generate Documents <ChevronDown className="w-4 h-4" /></>}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-slide-up">
            <div className="glass p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-200">German Lebenslauf</h2>
                <button onClick={() => downloadAsText(result.lebenslauf, `Lebenslauf_${profile?.full_name?.replace(/\s/g,'_')}.txt`)}
                  className="btn-ghost text-xs flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-950 rounded-xl p-4 max-h-96 overflow-y-auto">
                {result.lebenslauf}
              </pre>
            </div>

            <div className="glass p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-200">English Cover Letter</h2>
                <button onClick={() => downloadAsText(result.coverLetterEN, `Cover_Letter_${profile?.full_name?.replace(/\s/g,'_')}.txt`)}
                  className="btn-ghost text-xs flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-950 rounded-xl p-4 max-h-96 overflow-y-auto">
                {result.coverLetterEN}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
