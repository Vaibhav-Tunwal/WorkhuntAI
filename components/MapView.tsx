'use client'

import { useEffect, useRef, useState } from 'react'

interface Buddy {
  user_id: string
  full_name?: string
  email?: string
  university: string
  study_program: string
  skills: string[]
  fuzzy_latitude: number
  fuzzy_longitude: number
  instagram_handle?: string
}


export default function MapView({ buddies }: { buddies: Buddy[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Must be inside useEffect — Leaflet requires browser APIs
    import('leaflet').then(L => {
      import('leaflet/dist/leaflet.css').catch(() => {})

      // Fix broken default icon paths in webpack/Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const defaultCenter: [number, number] = [53.8932, 11.4629] // Wismar
      const center: [number, number] = buddies.length > 0
        ? [buddies[0].fuzzy_latitude, buddies[0].fuzzy_longitude]
        : defaultCenter

      const map = L.map(mapRef.current!, { center, zoom: 13, zoomControl: true })
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      buddies.forEach(b => {
        if (!b.fuzzy_latitude || !b.fuzzy_longitude) return
        const circle = L.circleMarker([b.fuzzy_latitude, b.fuzzy_longitude], {
          radius: 14,
          fillColor: '#0D9488',
          fillOpacity: 0.35,
          color: '#14B8A6',
          weight: 2,
        })

        const popupHtml = `
          <div style="min-width:180px; font-family: sans-serif;">
            <strong style="font-size:14px; color:#0f172a;">${b.full_name || 'Student'}</strong>
            <p style="font-size:11px; color:#64748b; margin:2px 0 2px;">🏫 ${b.university || 'Hochschule Wismar'}</p>
            <p style="font-size:11px; color:#64748b; margin:0 0 4px;">📚 ${b.study_program || 'Not specified'}</p>
            ${b.email ? `<p style="font-size:11px; color:#0284c7; margin:0 0 4px;">✉️ ${b.email}</p>` : ''}
            ${b.instagram_handle ? `<a href="https://instagram.com/${b.instagram_handle.replace('@','')}" target="_blank" style="font-size:11px; color:#e1306c; text-decoration:none;">📷 ${b.instagram_handle}</a>` : ''}
          </div>
        `
        circle.bindPopup(popupHtml).addTo(map)
      })
    }).catch(err => {
      setError('Failed to load map: ' + err.message)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [buddies])

  if (error) {
    return (
      <div className="w-full h-[500px] glass flex items-center justify-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className="w-full rounded-2xl overflow-hidden"
      style={{ height: '500px', background: '#0F172A' }}
    />
  )
}
