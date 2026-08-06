'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { Save, Plus, X, Loader2, ArrowLeft, User, BookOpen, Briefcase, MapPin, Sparkles } from 'lucide-react'

const STUDY_PROGRAMS = [
  'Computer Science', 'Business Informatics', 'Industrial Engineering',
  'Mechanical Engineering', 'Architecture', 'Design', 'Civil Engineering',
  'Electrical Engineering', 'Economics', 'Other',
]

const SKILL_SUGGESTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'SQL',
  'Java', 'C++', 'C#', 'Machine Learning', 'Data Analysis', 'Docker',
  'Git', 'AWS', 'Azure', 'Figma', 'Excel', 'AutoCAD', 'MATLAB',
]

const ROLE_SUGGESTIONS = [
  'Software Developer', 'Data Analyst', 'Web Developer', 'DevOps Engineer',
  'UX/UI Designer', 'Product Manager', 'Werkstudent IT', 'Praktikum Software',
  'Machine Learning Engineer', 'System Administrator', 'Consultant',
]

const LOCATION_SUGGESTIONS = [
  'Wismar', 'Hamburg', 'Berlin', 'Munich', 'Rostock', 'Schwerin',
  'Remote', 'Lübeck', 'Frankfurt', 'Stuttgart', 'Cologne', 'Düsseldorf',
]

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customSkill, setCustomSkill] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [customLocation, setCustomLocation] = useState('')

  const [form, setForm] = useState({
    full_name: '',
    study_program: '',
    skills: [] as string[],
    preferred_roles: [] as string[],
    preferred_locations: [] as string[],
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setForm({
          full_name: data.full_name ?? '',
          study_program: data.study_program ?? '',
          skills: data.skills ?? [],
          preferred_roles: data.preferred_roles ?? [],
          preferred_locations: data.preferred_locations ?? [],
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.full_name || !form.study_program) {
      alert('Please fill out Name and Study Program.')
      return
    }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: form.full_name,
        study_program: form.study_program,
        skills: form.skills,
        preferred_roles: form.preferred_roles,
        preferred_locations: form.preferred_locations,
        university_name: 'Hochschule Wismar',
      })

    setSaving(false)
    if (error) {
      alert('Error saving profile: ' + error.message)
      return
    }
    alert('Profile updated successfully!')
    router.push('/dashboard')
  }

  const toggleItem = (key: 'skills' | 'preferred_roles' | 'preferred_locations', val: string) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val],
    }))
  }

  const addItem = (key: 'skills' | 'preferred_roles' | 'preferred_locations', val: string, setVal: (v: string) => void) => {
    const trimmed = val.trim()
    if (!trimmed) return
    if (!form[key].includes(trimmed)) {
      setForm(f => ({
        ...f,
        [key]: [...f[key], trimmed],
      }))
    }
    setVal('')
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
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-800 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold"><span className="text-gradient">Edit Profile</span></h1>
            <p className="text-slate-400 text-sm">Keep your career details and skills up to date</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass p-6 space-y-4">
              <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-400" /> Personal Details
              </h2>
              <div>
                <label className="text-xs text-slate-400 font-medium">Full Name</label>
                <input type="text" value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  className="input-field mt-1" placeholder="Max Mustermann" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Study Program</label>
                <select value={form.study_program}
                  onChange={e => setForm(f => ({ ...f, study_program: e.target.value }))}
                  className="input-field mt-1 bg-slate-800">
                  <option value="">Select your study program</option>
                  {STUDY_PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Skills section */}
            <div className="glass p-6 space-y-4">
              <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" /> Skills & Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {form.skills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 text-xs bg-teal-950 text-teal-300 border border-teal-800 px-2.5 py-1 rounded-full font-medium">
                    {s}
                    <button onClick={() => toggleItem('skills', s)} className="hover:text-red-400 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {form.skills.length === 0 && <p className="text-xs text-slate-500 italic">No skills selected.</p>}
              </div>

              {/* Custom skill input */}
              <div className="flex gap-2">
                <input type="text" placeholder="Add custom skill" value={customSkill}
                  onChange={e => setCustomSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addItem('skills', customSkill, setCustomSkill)}
                  className="input-field py-1.5" />
                <button onClick={() => addItem('skills', customSkill, setCustomSkill)} className="btn-ghost py-1.5 px-3">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Suggestion list */}
              <div>
                <p className="text-xs text-slate-400 mb-2 font-medium">Suggested Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).map(s => (
                    <button key={s} onClick={() => toggleItem('skills', s)}
                      className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-all">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Column */}
          <div className="space-y-6">
            {/* Preferred Roles */}
            <div className="glass p-6 space-y-4">
              <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-teal-400" /> Target Roles
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {form.preferred_roles.map(r => (
                  <span key={r} className="inline-flex items-center gap-1 text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-lg">
                    {r}
                    <button onClick={() => toggleItem('preferred_roles', r)} className="hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Add custom role" value={customRole}
                  onChange={e => setCustomRole(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addItem('preferred_roles', customRole, setCustomRole)}
                  className="input-field py-1.5" />
                <button onClick={() => addItem('preferred_roles', customRole, setCustomRole)} className="btn-ghost py-1.5 px-3">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {ROLE_SUGGESTIONS.filter(r => !form.preferred_roles.includes(r)).map(r => (
                  <button key={r} onClick={() => toggleItem('preferred_roles', r)}
                    className="text-[10px] px-2 py-0.5 rounded border border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300">
                    + {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Locations */}
            <div className="glass p-6 space-y-4">
              <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-400" /> Locations
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {form.preferred_locations.map(l => (
                  <span key={l} className="inline-flex items-center gap-1 text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-lg">
                    {l}
                    <button onClick={() => toggleItem('preferred_locations', l)} className="hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Add custom location" value={customLocation}
                  onChange={e => setCustomLocation(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addItem('preferred_locations', customLocation, setCustomLocation)}
                  className="input-field py-1.5" />
                <button onClick={() => addItem('preferred_locations', customLocation, setCustomLocation)} className="btn-ghost py-1.5 px-3">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {LOCATION_SUGGESTIONS.filter(l => !form.preferred_locations.includes(l)).map(l => (
                  <button key={l} onClick={() => toggleItem('preferred_locations', l)}
                    className="text-[10px] px-2 py-0.5 rounded border border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300">
                    + {l}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
