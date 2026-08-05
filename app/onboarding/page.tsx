'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'

const STUDY_PROGRAMS = [
  'Computer Science', 'Business Informatics', 'Industrial Engineering',
  'Mechanical Engineering', 'Architecture', 'Design', 'Civil Engineering',
  'Electrical Engineering', 'Economics', 'Other',
]

const SKILL_OPTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'SQL',
  'Java', 'C++', 'C#', 'Machine Learning', 'Data Analysis', 'Docker',
  'Git', 'AWS', 'Azure', 'Figma', 'Excel', 'AutoCAD', 'MATLAB',
  'R', 'Kotlin', 'Swift', 'PHP', 'Ruby', 'Go', 'Rust',
]

const ROLE_OPTIONS = [
  'Software Developer', 'Data Analyst', 'Web Developer', 'DevOps Engineer',
  'UX/UI Designer', 'Product Manager', 'Werkstudent IT', 'Praktikum Software',
  'Machine Learning Engineer', 'System Administrator', 'Consultant',
]

const LOCATION_OPTIONS = [
  'Wismar', 'Hamburg', 'Berlin', 'Munich', 'Rostock', 'Schwerin',
  'Remote', 'Lübeck', 'Frankfurt', 'Stuttgart', 'Cologne', 'Düsseldorf',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)


  const [form, setForm] = useState({
    full_name: '',
    study_program: '',
    skills: [] as string[],
    preferred_roles: [] as string[],
    preferred_locations: [] as string[],
  })

  const toggleArray = (key: 'skills' | 'preferred_roles' | 'preferred_locations', val: string) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val],
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: form.full_name,
      study_program: form.study_program,
      skills: form.skills,
      preferred_roles: form.preferred_roles,
      preferred_locations: form.preferred_locations,
      university_name: 'Hochschule Wismar',
    })

    if (error) {
      alert('Error saving profile: ' + error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  const steps = [
    // Step 0: Name & Program
    <div key="0" className="animate-slide-up space-y-6">
      <div>
        <label className="text-sm font-medium text-slate-300">Full Name</label>
        <input type="text" value={form.full_name}
          onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
          className="input-field mt-1" placeholder="Max Mustermann" />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-300">Study Program</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {STUDY_PROGRAMS.map(p => (
            <button key={p} onClick={() => setForm(f => ({ ...f, study_program: p }))}
              className={`text-sm px-3 py-2 rounded-xl border transition-all
                ${form.study_program === p
                  ? 'bg-teal-600/20 border-teal-600 text-teal-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 1: Skills
    <div key="1" className="animate-slide-up">
      <label className="text-sm font-medium text-slate-300">Select your skills (max 15)</label>
      <div className="flex flex-wrap gap-2 mt-3">
        {SKILL_OPTIONS.map(s => (
          <button key={s} onClick={() => form.skills.length < 15 || form.skills.includes(s) ? toggleArray('skills', s) : null}
            className={`text-sm px-3 py-1.5 rounded-full border transition-all
              ${form.skills.includes(s)
                ? 'bg-teal-600/20 border-teal-600 text-teal-300'
                : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
            {s}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">{form.skills.length}/15 selected</p>
    </div>,

    // Step 2: Roles & Locations
    <div key="2" className="animate-slide-up space-y-6">
      <div>
        <label className="text-sm font-medium text-slate-300">Preferred Roles</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {ROLE_OPTIONS.map(r => (
            <button key={r} onClick={() => toggleArray('preferred_roles', r)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-all
                ${form.preferred_roles.includes(r)
                  ? 'bg-emerald-600/20 border-emerald-600 text-emerald-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-300">Preferred Locations</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {LOCATION_OPTIONS.map(l => (
            <button key={l} onClick={() => toggleArray('preferred_locations', l)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-all
                ${form.preferred_locations.includes(l)
                  ? 'bg-amber-600/20 border-amber-600 text-amber-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>,
  ]

  const canNext = step === 0 ? form.full_name.length > 1 && form.study_program
    : step === 1 ? form.skills.length >= 2
    : form.preferred_roles.length >= 1

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500
              ${i <= step ? 'bg-teal-500' : 'bg-slate-800'}`} />
          ))}
        </div>

        <h1 className="text-2xl font-bold mb-2">
          {step === 0 && 'Welcome! Tell us about yourself.'}
          {step === 1 && 'What are your skills?'}
          {step === 2 && 'What roles & locations interest you?'}
        </h1>
        <p className="text-sm text-slate-400 mb-8">Step {step + 1} of 3</p>

        {steps[step]}

        <div className="flex items-center justify-between mt-8">
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)} className="btn-ghost flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 2 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext}
              className="btn-primary flex items-center gap-1.5">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canNext || loading}
              className="btn-primary flex items-center gap-1.5">
              {loading ? 'Saving...' : <>Complete <Check className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
