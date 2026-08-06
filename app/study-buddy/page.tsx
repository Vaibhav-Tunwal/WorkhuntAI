'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import dynamic from 'next/dynamic'
import { MapPin, Eye, EyeOff, Save, Loader2 } from 'lucide-react'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function StudyBuddyPage() {
  const [buddies, setBuddies] = useState<any[]>([])

  const [visible, setVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [handles, setHandles] = useState({ instagram: '', telegram: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [buddiesRes, profileRes] = await Promise.all([
      supabase.from('study_buddies').select('*'),
      supabase.from('profiles').select('is_study_buddy_visible, latitude, longitude, instagram_handle, telegram_handle')
        .eq('id', user.id).single(),
    ])

    setBuddies(buddiesRes.data ?? [])
    if (profileRes.data) {
      setVisible(profileRes.data.is_study_buddy_visible)
      setHandles({
        instagram: profileRes.data.instagram_handle ?? '',
        telegram: profileRes.data.telegram_handle ?? '',
      })
      if (profileRes.data.latitude && profileRes.data.longitude) {
        setLocation({ lat: profileRes.data.latitude, lng: profileRes.data.longitude })
      }
    }
  }

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert('Location access denied. Please enable location services.'),
      { enableHighAccuracy: true }
    )
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      is_study_buddy_visible: visible,
      latitude: location?.lat,
      longitude: location?.lng,
      instagram_handle: handles.instagram || null,
      telegram_handle: handles.telegram || null,
    }).eq('id', user.id)

    loadData()
    setSaving(false)
  }

  return (
    <main className="min-h-screen pt-16">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">Study Buddy</span> Map
        </h1>
        <p className="text-slate-400 mb-8">
          Find study partners near you. Your exact location is fuzzed by ~100 meters for privacy.
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="glass p-6 space-y-5 lg:col-span-1">
            <h2 className="font-semibold text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" /> Your Settings
            </h2>

            <div>
              <button onClick={() => setVisible(!visible)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all
                  ${visible ? 'bg-teal-600/20 border-teal-600' : 'border-slate-700'}`}>
                <span className="text-sm">{visible ? 'Visible on map' : 'Hidden from map'}</span>
                {visible ? <Eye className="w-4 h-4 text-teal-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
              </button>
            </div>

            <div>
              <button onClick={requestLocation} className="btn-ghost w-full text-sm">
                {location ? `📍 ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '📍 Share Location'}
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400">Instagram Handle</label>
              <input type="text" value={handles.instagram}
                onChange={e => setHandles(h => ({ ...h, instagram: e.target.value }))}
                className="input-field mt-1" placeholder="@username" />
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                : <><Save className="w-4 h-4" /> Save Settings</>}
            </button>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your real coordinates are stored securely. The map shows a random offset (~100m) for all users. Nobody sees your exact location.
            </p>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <MapView buddies={buddies} />
            <p className="text-xs text-slate-600 mt-2 text-center">
              {buddies.length} student{buddies.length !== 1 ? 's' : ''} visible · Locations are privacy-fuzzed
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
