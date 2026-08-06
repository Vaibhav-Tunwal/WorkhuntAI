'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { Users, Briefcase, Plus, Trash2, Calendar, MapPin, Loader2, BarChart2, ShieldAlert } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'jobs'>('users')
  const [usersList, setUsersList] = useState<any[]>([])
  const [jobsList, setJobsList] = useState<any[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Add Job Form state
  const [showAddJob, setShowAddJob] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    external_source_url: '',
    description: '',
    skillsString: '',
  })

  useEffect(() => {
    checkAccessAndLoad()
  }, [])

  const checkAccessAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'v.tunwal@stud.hs-wismar.de'
    if (!user || user.email !== adminEmail) {
      router.push('/')
      return
    }

    await Promise.all([loadUsers(), loadJobs()])
    setLoading(false)
  }

  const loadUsers = async () => {
    const res = await fetch('/api/admin/users')
    if (res.ok) {
      const data = await res.json()
      setUsersList(data)
    }
  }

  const loadJobs = async () => {
    const res = await fetch('/api/admin/jobs')
    if (res.ok) {
      const data = await res.json()
      setJobsList(data)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? All their data, including profile and applications, will be permanently deleted.')) return
    setActionLoading(`delete-user-${id}`)
    const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
    setActionLoading(null)
    if (res.ok) {
      setUsersList(usersList.filter(u => u.id !== id))
    } else {
      alert('Failed to delete user.')
    }
  }

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    setActionLoading(`delete-job-${id}`)
    const res = await fetch(`/api/admin/jobs?id=${id}`, { method: 'DELETE' })
    setActionLoading(null)
    if (res.ok) {
      setJobsList(jobsList.filter(j => j.id !== id))
    } else {
      alert('Failed to delete job.')
    }
  }

  const handleAddJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newJob.title || !newJob.company) {
      alert('Title and Company are required.')
      return
    }
    setActionLoading('add-job')
    const skills = newJob.skillsString.split(',').map(s => s.trim()).filter(Boolean)
    const res = await fetch('/api/admin/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newJob,
        extracted_skills: skills,
      })
    })
    setActionLoading(null)

    if (res.ok) {
      const created = await res.json()
      setJobsList([created, ...jobsList])
      setShowAddJob(false)
      setNewJob({
        title: '',
        company: '',
        location: '',
        external_source_url: '',
        description: '',
        skillsString: '',
      })
    } else {
      const err = await res.json()
      alert('Error creating job: ' + (err.error ?? 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-16 bg-slate-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-teal-400" />
              <span>Admin <span className="text-gradient">Control Panel</span></span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage system configurations, users, and job listings</p>
          </div>
          {activeTab === 'jobs' && (
            <button onClick={() => setShowAddJob(true)} className="btn-primary flex items-center gap-2 text-sm self-start md:self-auto">
              <Plus className="w-4 h-4" /> Add Job Manually
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-teal-600/10 text-teal-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-200 mt-1">{usersList.length}</h3>
            </div>
          </div>
          <div className="glass p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-600/10 text-emerald-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active Jobs</p>
              <h3 className="text-2xl font-bold text-slate-200 mt-1">{jobsList.length}</h3>
            </div>
          </div>
          <div className="glass p-5 flex items-center gap-4 col-span-2 sm:col-span-1">
            <div className="p-3 rounded-xl bg-amber-600/10 text-amber-400">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">System Status</p>
              <h3 className="text-sm font-bold text-emerald-400 mt-1.5 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Ingestion Online
              </h3>
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-2 border-b border-slate-800 pb-4 mb-6">
          <button onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200
              ${activeTab === 'users' ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30' : 'text-slate-400 hover:text-slate-200'}`}>
            Manage Students ({usersList.length})
          </button>
          <button onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200
              ${activeTab === 'jobs' ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30' : 'text-slate-400 hover:text-slate-200'}`}>
            Manage Jobs ({jobsList.length})
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/30 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Study Program</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-sm">
                  {usersList.map(u => (
                    <tr key={u.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="p-4 font-semibold text-slate-200">{u.full_name || 'Incomplete Profile'}</td>
                      <td className="p-4 text-slate-400">{u.email}</td>
                      <td className="p-4 text-slate-400">{u.study_program || '-'}</td>
                      <td className="p-4 text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteUser(u.id)}
                          disabled={actionLoading === `delete-user-${u.id}`}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-950/20 transition-all">
                          {actionLoading === `delete-user-${u.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 italic">No students registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/30 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="p-4">Job Title</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Date Added</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-sm">
                  {jobsList.map(j => (
                    <tr key={j.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="p-4 font-semibold text-slate-200">{j.title}</td>
                      <td className="p-4 text-slate-400">{j.company}</td>
                      <td className="p-4 text-slate-400 flex items-center gap-1.5 mt-0.5"><MapPin className="w-4 h-4 text-slate-500" />{j.location}</td>
                      <td className="p-4 text-slate-500">{new Date(j.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteJob(j.id)}
                          disabled={actionLoading === `delete-job-${j.id}`}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-950/20 transition-all">
                          {actionLoading === `delete-job-${j.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {jobsList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 italic">No active jobs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Job Modal */}
      {showAddJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass w-full max-w-lg p-6 space-y-4 animate-slide-up relative bg-slate-950">
            <h3 className="text-xl font-bold text-slate-100">Add New Job Listing</h3>
            <form onSubmit={handleAddJobSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Job Title *</label>
                <input type="text" required value={newJob.title}
                  onChange={e => setNewJob(n => ({ ...n, title: e.target.value }))}
                  className="input-field mt-1" placeholder="e.g. Werkstudent Softwareentwicklung" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Company *</label>
                  <input type="text" required value={newJob.company}
                    onChange={e => setNewJob(n => ({ ...n, company: e.target.value }))}
                    className="input-field mt-1" placeholder="e.g. Acme Corp" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Location</label>
                  <input type="text" value={newJob.location}
                    onChange={e => setNewJob(n => ({ ...n, location: e.target.value }))}
                    className="input-field mt-1" placeholder="e.g. Wismar / Remote" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400">External URL</label>
                <input type="url" value={newJob.external_source_url}
                  onChange={e => setNewJob(n => ({ ...n, external_source_url: e.target.value }))}
                  className="input-field mt-1" placeholder="https://example.com/job" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Required Skills (comma separated)</label>
                <input type="text" value={newJob.skillsString}
                  onChange={e => setNewJob(n => ({ ...n, skillsString: e.target.value }))}
                  className="input-field mt-1" placeholder="React, Node.js, SQL, TypeScript" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Job Description</label>
                <textarea rows={3} value={newJob.description}
                  onChange={e => setNewJob(n => ({ ...n, description: e.target.value }))}
                  className="input-field mt-1 resize-none" placeholder="Paste description details here..." />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowAddJob(false)} className="btn-ghost py-2 text-sm">Cancel</button>
                <button type="submit" disabled={actionLoading === 'add-job'} className="btn-primary py-2 text-sm flex items-center gap-1.5">
                  {actionLoading === 'add-job' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Create Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
