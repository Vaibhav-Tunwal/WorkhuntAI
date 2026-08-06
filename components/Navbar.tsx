'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Briefcase, FileText, Star, Users, Layout, LogOut, User } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'v.tunwal@stud.hs-wismar.de'
      if (user && user.email === adminEmail) {
        setIsAdmin(true)
      }
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const items = [
    { href: '/dashboard', label: 'Jobs', icon: Briefcase },
    { href: '/studio', label: 'Doc Studio', icon: FileText },
    { href: '/star', label: 'STAR Prep', icon: Star },
    { href: '/study-buddy', label: 'Study Buddy', icon: Users },
    { href: '/profile', label: 'Profile', icon: User },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: Layout }] : []),
  ]


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-700/50 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <Layout className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-gradient">Workhunt AI</span>
        </Link>

        <div className="flex items-center gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${active ? 'bg-teal-600/20 text-teal-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            )
          })}
          <button onClick={handleLogout}
            className="ml-2 flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
