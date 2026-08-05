'use client'

import { useEffect, useState } from 'react'

// Dynamic import of Leaflet avoids SSR issues
export default function MapView({ buddies }: { buddies: Array<{
  user_id: string; university: string; study_program: string;
  skills: string[]; fuzzy_latitude: number; fuzzy_longitude: number;
  instagram_handle?: string; telegram_handle?: string;
}> }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="w-full h-[500px] glass flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading map...</div>
      </div>
    )
  }

  return <MapInner buddies={buddies} />
}

function MapInner({ buddies }: { buddies: Array<{
  user_id: string; university: string; study_program: string;
  skills: string[]; fuzzy_latitude: number; fuzzy_longitude: number;
  instagram_handle?: string; telegram_handle?: string;
}> }) {
  const [MapComponents, setMapComponents] = useState<any>(null)

  useEffect(() => {
    // Dynamically import Leaflet and react-leaflet only on client
    Promise.all([
      import('leaflet'),
      import('react-leaflet'),
    ]).then(([L, RL]) => {
      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
      setMapComponents({ L, ...RL })
    })
  }, [])

  if (!MapComponents) {
    return <div className="w-full h-[500px] glass flex items-center justify-center">
      <div className="animate-pulse text-slate-500">Loading map components...</div>
    </div>
  }

  const { MapContainer, TileLayer, CircleMarker, Popup } = MapComponents
  const center = buddies.length > 0
    ? [buddies[0].fuzzy_latitude, buddies[0].fuzzy_longitude]
    : [53.89, 11.46] // Wismar default

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <MapContainer center={center} zoom={12} className="w-full h-[500px] rounded-2xl overflow-hidden"
        scrollWheelZoom={true}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap' />
        {buddies.map(b => (
          <CircleMarker key={b.user_id}
            center={[b.fuzzy_latitude, b.fuzzy_longitude]}
            radius={14} fillColor="#0D9488" fillOpacity={0.3}
            color="#14B8A6" weight={2}>
            <Popup>
              <div className="text-slate-900 text-sm">
                <p className="font-semibold">{b.study_program}</p>
                <p className="text-xs text-slate-600">{b.university}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {b.skills?.slice(0, 4).map((s: string) => (
                    <span key={s} className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
                {b.telegram_handle && (
                  <a href={`https://t.me/${b.telegram_handle}`} target="_blank" rel="noopener"
                    className="text-xs text-blue-600 mt-1 block">@{b.telegram_handle}</a>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </>
  )
}
