'use client'

import { useEffect, useRef, useState } from 'react'
import { GERMAN_CITIES } from '@/lib/cities'

interface GermanyMapProps {
  userCity?: string
  jobCities?: { city: string; count: number }[]
}

export default function GermanyMap({ userCity, jobCities = [] }: GermanyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import('leaflet').then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [51.1657, 10.4515],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: false,
      })
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OSM',
        maxZoom: 18,
      }).addTo(map)

      // User city — red marker
      if (userCity && GERMAN_CITIES[userCity]) {
        const [lat, lng] = GERMAN_CITIES[userCity]
        const userIcon = L.divIcon({
          html: `<div style="width:16px;height:16px;background:#ef4444;border:3px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(239,68,68,0.5);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
          className: '',
        })
        L.marker([lat, lng], { icon: userIcon }).addTo(map)
          .bindPopup(`<strong style="font-family:sans-serif;font-size:13px;">📍 Your City: ${userCity}</strong>`)
      }

      // Job city markers — teal circles
      jobCities.forEach(({ city, count }) => {
        const coords = GERMAN_CITIES[city]
        if (!coords) return
        const [lat, lng] = coords
        const radius = Math.min(8 + count * 1.5, 25)
        L.circleMarker([lat, lng], {
          radius,
          fillColor: '#0D9488',
          fillOpacity: 0.5,
          color: '#14B8A6',
          weight: 2,
        }).addTo(map).bindPopup(
          `<div style="font-family:sans-serif;text-align:center;">
            <strong style="font-size:13px;">${city}</strong>
            <p style="font-size:11px;color:#64748b;margin:2px 0 0;">${count} active job${count !== 1 ? 's' : ''}</p>
          </div>`
        )
      })
    }).catch(err => setError(err.message))

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [userCity, jobCities])

  if (error) {
    return (
      <div className="w-full h-full glass flex items-center justify-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" style={{ minHeight: '400px', background: '#0F172A' }} />
  )
}
