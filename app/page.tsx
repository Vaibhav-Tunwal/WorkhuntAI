'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Brain, Database, BarChart3, Bot, Briefcase, GraduationCap, Mail, Link2, Phone, ChevronDown, ExternalLink, Sparkles, Trophy, Target, Zap, Hash, Globe, Dumbbell } from 'lucide-react'

const EXPERIENCE = [
  {
    period: '06.2024 – 04.2025',
    title: 'Business Development Analyst',
    company: 'Savvy Retail Private Limited, India',
    bullets: [
      'Analyzed transaction data for 120+ SKUs, improving profit margins by 9.3%',
      'Reduced overstock by 17% through predictive demand modeling',
      'Increased category ROI by 22% via data-driven assortment optimization',
    ],
  },
  {
    period: '11.2022 – 05.2024',
    title: 'Data Scientist & Analytics Engineer',
    company: 'M&L Consulting Private Limited, India',
    bullets: [
      'Built scalable PMIS SaaS data models for infrastructure project management',
      'Developed ML prediction models for project timeline, cost forecasting & anomaly detection',
      'Created Power BI dashboards serving 50+ enterprise clients',
    ],
  },
]

const EDUCATION = [
  { period: '09.2025 – Present', title: 'Master in International Management', school: 'Hochschule Wismar, Germany' },
  { period: '09.2021 – 03.2026', title: 'B.Sc. Data Science & Programming', school: 'IIT Madras, India' },
  { period: '09.2020 – 08.2024', title: 'B.Tech. Computer Science', school: 'Rajasthan Technical University, India' },
  { period: '06.2025', title: 'Mini MBA', school: 'IBMI Berlin, Germany' },
]

const SKILLS = [
  { cat: 'AI & ML', items: ['Python', 'Supervised/Unsupervised Learning', 'NLP', 'AI Agent Workflows'] },
  { cat: 'Data Engineering', items: ['SQL', 'MySQL', 'ETL Pipelines', 'RESTful APIs', 'Database Design'] },
  { cat: 'Business Intelligence', items: ['Power BI', 'Data Modeling', 'Financial Analytics', 'KPI Dashboards'] },
  { cat: 'Automation & DevOps', items: ['AI Process Automation', 'Git/GitHub', 'Linux/Bash', 'Vercel', 'Supabase'] },
  { cat: 'Ventures', items: ['Nutreich Lifesciences (R&D)', 'ChallengeX (Platform Architecture)'] },
]

const HOBBIES = [
  { icon: Target, name: 'Poker', desc: 'Game theory & probabilistic decision-making under uncertainty' },
  { icon: Trophy, name: 'Chess', desc: 'Strategic pattern recognition & multi-step planning' },
  { icon: Hash, name: 'Mathematical Trading', desc: 'Algorithmic thinking & mathematical optimization' },
  { icon: Dumbbell, name: 'Sports', desc: 'Team coordination & physical fitness' },
]

export default function PortfolioPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Floating Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 60 ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800/50' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-lg">
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">V</span>T
          </span>
          <div className="flex items-center gap-6 text-sm">
            <a href="#about" className="text-slate-400 hover:text-teal-400 transition-colors hidden md:block">About</a>
            <a href="#experience" className="text-slate-400 hover:text-teal-400 transition-colors hidden md:block">Experience</a>
            <a href="#projects" className="text-slate-400 hover:text-teal-400 transition-colors hidden md:block">Projects</a>
            <a href="#skills" className="text-slate-400 hover:text-teal-400 transition-colors hidden md:block">Skills</a>
            <Link href="/login" className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-5 py-2 rounded-xl transition-all duration-200 active:scale-95 text-sm">
              Job Portal →
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-950/20 via-slate-950 to-slate-950" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-teal-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />

        <div className="relative max-w-4xl mx-auto text-center animate-fade-in">
          <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden border-2 border-teal-500/30 shadow-lg shadow-teal-500/10">
            <img src="/avatar.png" alt="Vaibhav Tunwal" className="w-full h-full object-cover" />
          </div>

          <div className="inline-flex items-center gap-2 bg-teal-950/50 border border-teal-800/50 rounded-full px-4 py-1.5 mb-6">
            <Bot className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-medium text-teal-300">AI Automation · Agent Development · Data Science</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">Vaibhav Tunwal</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed">
            I build <span className="text-teal-300 font-medium">AI automation systems</span> and{' '}
            <span className="text-emerald-300 font-medium">intelligent agents</span> that transform how businesses operate.
            From predictive analytics to end-to-end workflow automation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <a href="#projects" className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> View Projects
            </a>
            <a href="mailto:Kumarvaibhav40555@gmail.com" className="bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium px-8 py-3 rounded-xl transition-all duration-200 flex items-center gap-2">
              <Mail className="w-5 h-5" /> Kumarvaibhav40555@gmail.com
            </a>
          </div>

          <a href="#about" className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <ChevronDown className="w-6 h-6 text-slate-600 animate-bounce" />
          </a>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold mb-8">
          About <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Me</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              I'm an <span className="text-slate-200 font-medium">AI Automation Enthusiast</span> and{' '}
              <span className="text-slate-200 font-medium">Data Scientist</span> with a triple background in
              Computer Science (B.Tech), Data Science (B.Sc. IIT Madras), and International Management (M.Sc. Hochschule Wismar).
            </p>
            <p>
              I specialize in designing <span className="text-teal-300">intelligent automation pipelines</span> that
              replace manual business processes with AI-driven workflows — from ML-powered forecasting engines to
              autonomous agent systems that scrape, analyze, and report without human intervention.
            </p>
            <p>
              My consulting work has improved profit margins by <span className="text-emerald-300 font-semibold">9.3%</span>,
              reduced overstock by <span className="text-emerald-300 font-semibold">17%</span>, and delivered
              BI dashboards to <span className="text-emerald-300 font-semibold">6+ enterprise clients</span>.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Brain, label: 'ML Models Built', value: '10+' },
              { icon: BarChart3, label: 'Dashboards Deployed', value: '6+' },
              { icon: Bot, label: 'AI Agents Shipped', value: '3+' },
              { icon: Database, label: 'Data Pipelines', value: '2+' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-slate-900/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 text-center hover:border-teal-700/50 transition-all">
                <Icon className="w-6 h-6 text-teal-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-100">{value}</div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold mb-12">
          Professional <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Experience</span>
        </h2>
        <div className="space-y-8">
          {EXPERIENCE.map((exp, i) => (
            <div key={i} className="bg-slate-900/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 hover:border-teal-700/50 transition-all group">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-teal-300 transition-colors">{exp.title}</h3>
                  <p className="text-sm text-slate-400">{exp.company}</p>
                </div>
                <span className="text-xs bg-teal-950 text-teal-300 border border-teal-800 px-3 py-1 rounded-full font-medium shrink-0">{exp.period}</span>
              </div>
              <ul className="space-y-2">
                {exp.bullets.map((b, j) => (
                  <li key={j} className="text-sm text-slate-400 flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Education */}
        <h2 className="text-3xl font-bold mt-20 mb-10">
          <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Education</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {EDUCATION.map((ed, i) => (
            <div key={i} className="bg-slate-900/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 hover:border-teal-700/50 transition-all">
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-200 text-sm">{ed.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{ed.school}</p>
                  <p className="text-xs text-slate-600 mt-1">{ed.period}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold mb-12">
          Featured <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Projects</span>
        </h2>

        {/* Workhunt AI — Featured */}
        <div className="bg-gradient-to-br from-slate-900 to-teal-950/30 border border-teal-700/30 rounded-2xl p-8 mb-8 group hover:border-teal-600/50 transition-all">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-600/20 border border-teal-600/30 rounded-full px-3 py-1 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-xs font-semibold text-teal-300">FEATURED PROJECT</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-100">Workhunt AI</h3>
              <p className="text-slate-400 mt-1">AI-Powered Career Co-Pilot for German University Students</p>
            </div>
            <Link href="/login" className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-95 text-sm flex items-center gap-2 shrink-0">
              <ExternalLink className="w-4 h-4" /> Try It
            </Link>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-5">
            A full-stack serverless platform that automates job discovery from Germany's Federal Job Agency,
            scores matches using Gemini AI (0–100%), generates ATS-compliant German CVs and English Cover Letters
            in-browser with zero server storage, and provides STAR interview prep — all for free.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Next.js 14', 'Supabase', 'Gemini AI', 'Vercel', 'TypeScript', 'Leaflet', 'Telegram Bot'].map(t => (
              <span key={t} className="text-xs bg-teal-950 text-teal-300 border border-teal-800 px-2.5 py-1 rounded-full font-medium">{t}</span>
            ))}
          </div>
        </div>

        {/* Other Projects */}
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              title: 'Nutreich Lifesciences',
              desc: 'Strategic R&D automation pipeline for nutraceutical product development with data-driven formulation optimization.',
              tags: ['Python', 'Data Analysis', 'R&D Automation'],
            },
            {
              title: 'ChallengeX Platform',
              desc: 'Full-stack platform architecture for competitive challenge hosting with real-time scoring and analytics engine.',
              tags: ['Platform Architecture', 'Real-time Analytics', 'Full Stack'],
            },
          ].map(p => (
            <div key={p.title} className="bg-slate-900/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 hover:border-teal-700/50 transition-all">
              <h3 className="font-bold text-slate-200">{p.title}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{p.desc}</p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {p.tags.map(t => (
                  <span key={t} className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold mb-12">
          Skills & <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Competencies</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SKILLS.map(s => (
            <div key={s.cat} className="bg-slate-900/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 hover:border-teal-700/50 transition-all">
              <h3 className="font-semibold text-sm text-teal-300 mb-3">{s.cat}</h3>
              <div className="flex flex-wrap gap-1.5">
                {s.items.map(item => (
                  <span key={item} className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOBBIES */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold mb-12">
          Beyond <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Code</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOBBIES.map(h => (
            <div key={h.name} className="bg-slate-900/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 text-center hover:border-teal-700/50 transition-all group">
              <h.icon className="w-8 h-8 text-teal-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-200">{h.name}</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="bg-gradient-to-br from-teal-950/50 to-slate-900 border border-teal-800/30 rounded-3xl p-12">
          <Globe className="w-12 h-12 text-teal-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Need AI Automation for Your Business?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            I help to replace manual processes with intelligent AI workflows —
            from data pipelines to autonomous agents that work 24/7.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="mailto:Kumarvaibhav40555@gmail.com" className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-2">
              <Mail className="w-5 h-5" /> Email Me
            </a>
            <a href="https://www.linkedin.com/in/vaibhav-tunwal-768754229" target="_blank" className="bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium px-8 py-3 rounded-xl transition-all duration-200 flex items-center gap-2">
              <Link2 className="w-5 h-5" /> LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-4">
            <span>© 2026 Vaibhav Tunwal</span>
            <a href="mailto:Kumarvaibhav40555@gmail.com" className="hover:text-teal-400 transition-colors flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</a>
            <a href="https://www.linkedin.com/in/vaibhav-tunwal-768754229" target="_blank" className="hover:text-teal-400 transition-colors flex items-center gap-1"><Link2 className="w-3.5 h-3.5" /> LinkedIn</a>
            <a href="tel:+4915204604744" className="hover:text-teal-400 transition-colors flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> +49 1520 4604 744</a>
          </div>
          <span>Germany</span>
        </div>
      </footer>
    </main>
  )
}
