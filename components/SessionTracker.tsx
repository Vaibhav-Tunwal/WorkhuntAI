'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SessionTracker() {
  const router = useRouter()

  useEffect(() => {
    let activeTimer: any

    const resetTimer = () => {
      localStorage.setItem('last_activity', Date.now().toString())
    }

    const checkInactivity = async () => {
      const lastActivity = localStorage.getItem('last_activity')
      if (lastActivity) {
        const diff = Date.now() - parseInt(lastActivity, 10)
        // 15 minutes of inactivity
        if (diff > 15 * 60 * 1000) {
          await supabase.auth.signOut()
          localStorage.removeItem('last_activity')
          router.push('/?error=inactive')
        }
      }
    }

    // Set initial activity time
    resetTimer()

    // Listen to user events
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimer))

    // Check inactivity every 10 seconds
    const interval = setInterval(checkInactivity, 10000)

    // Visibility change (logout on tab hidden for >15min)
    const handleVisibility = () => {
      if (document.hidden) {
        localStorage.setItem('tab_hidden_time', Date.now().toString())
      } else {
        const hiddenTime = localStorage.getItem('tab_hidden_time')
        if (hiddenTime) {
          const diff = Date.now() - parseInt(hiddenTime, 10)
          if (diff > 15 * 60 * 1000) {
            checkInactivity()
          }
          localStorage.removeItem('tab_hidden_time')
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer))
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [router])

  return null
}
