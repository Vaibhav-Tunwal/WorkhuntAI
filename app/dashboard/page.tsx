'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import JobCard from '@/components/JobCard'
import { Search, Filter, RefreshCw, TrendingUp, Bookmark, CheckCircle } from 'lucide-react'

interface Job {
  id: string; title: string; company: string; location: string;
  extracted_skills: string[]; external_source_url: string; description: string;
}
interface Application {
  id: string; job_id: string; status: string; match_score: number; missing_skills: string[];
}
interface Profile {
  skills: string[]; preferred_roles: string[];
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([])

  const [apps, setApps] = useState<Application[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'all' | 'matched' | 'saved'>('all')
  const [loading, setLoading] = useState(true)
  const [scoring, setScoring] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [jobsRes, appsRes, profileRes] = await Promise.all([
      supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('applications').select('*').eq('user_id', user.id),
      supabase.from('profiles').select('skills, preferred_roles').eq('id', user.id).single(),
    ])

    setJobs(jobsRes.data ?? [])
    setApps(appsRes.data ?? [])
    setProfile(profileRes.data)
    setLoading(false)
  }

  const handleMatch = async (jobId: string) => {
    if (!profile) return
    setScoring(jobId)
    const job = jobs.find(j => j.id === jobId)
    if (!job) return

    try {
      const res = await fetch('/api/jobs/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileSkills: profile.skills,
          preferredRoles: profile.preferred_roles,
          jobTitle: job.title,
          jobDescription: job.description,
        }),
      })
      const data = await res.json()
      const { data: { user } } = await supabase.auth.getUser()

      await supabase.from('applications').upsert({
        user_id: user!.id,
        job_id: jobId,
        status: 'MATCHED',
        match_score: data.score,
        missing_skills: data.missingSkills,
      })
      loadData()
    } catch (e) {
      console.error('Match error:', e)
    }
    setScoring(null)
  }

  const handleBookmark = async (jobId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('applications').upsert({
      user_id: user.id, job_id: jobId, status: 'BOOKMARKED',
    })
    loadData()
  }

  const getJobApp = (jobId: string) => apps.find(a => a.job_id === jobId)

  const filteredJobs = jobs.filter(j => {
    const q = search.toLowerCase()
    const matchesSearch = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)
    const app = getJobApp(j.id)

    if (tab === 'matched') return matchesSearch && app?.status === 'MATCHED'
    if (tab === 'saved') return matchesSearch && app?.status === 'BOOKMARKED'
    return matchesSearch
  })

  const stats = {
    total: jobs.length,
    matched: apps.filter(a => a.match_score).length,
    saved: apps.filter(a => a.status === 'BOOKMARKED').length,
    avgScore: apps.filter(a => a.match_score).length > 0
      ? Math.round(apps.filter(a => a.match_score).reduce((s, a) => s + a.match_score, 0) / apps.filter(a => a.match_score).length)
      : 0,
  }

  return (
    <main className="min-h-screen pt-16">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Jobs', val: stats.total, icon: TrendingUp, color: 'text-teal-400' },
            { label: 'Matched', val: stats.matched, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Saved', val: stats.saved, icon: Bookmark, color: 'text-amber-400' },
            { label: 'Avg Score', val: `${stats.avgScore}%`, icon: TrendingUp, color: 'text-violet-400' },
          ].map(s => (
            <div key={s.label} className="glass p-4 flex items-center gap-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold text-slate-100">{s.val}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Tabs */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-10" placeholder="Search jobs..." />
          </div>
          <div className="flex items-center gap-1 bg-slate-900 rounded-xl p-1 border border-slate-800">
            {(['all', 'matched', 'saved'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${tab === t ? 'bg-teal-600/20 text-teal-300' : 'text-slate-400 hover:text-slate-200'}`}>
                {t === 'all' ? 'All Jobs' : t === 'matched' ? 'Matched' : 'Saved'}
              </button>
            ))}
          </div>
          <button onClick={loadData} className="btn-ghost text-sm flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Job Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">No jobs found</p>
            <p className="text-sm mt-2">Try adjusting your search or wait for the next ingestion cycle.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredJobs.map(job => {
              const app = getJobApp(job.id)
              return (
                <JobCard key={job.id} id={job.id} title={job.title} company={job.company}
                  location={job.location} extractedSkills={job.extracted_skills}
                  externalUrl={job.external_source_url}
                  matchScore={app?.match_score} missingSkills={app?.missing_skills}
                  onMatch={scoring === job.id ? undefined : handleMatch}
                  onBookmark={handleBookmark} />
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
