'use client'

import { useState } from 'react'
import { RotateCw } from 'lucide-react'

interface STARCardProps {
  topic: string
  situation: string
  task: string
  action: string
  result: string
}

export default function STARCard({ topic, situation, task, action, result }: STARCardProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="perspective-1000 cursor-pointer" onClick={() => setFlipped(!flipped)}>
      <div className={`relative w-full min-h-[260px] transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
        {/* Front */}
        <div className="absolute inset-0 backface-hidden glass p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">{topic}</span>
            <h3 className="text-base font-semibold mt-2 text-slate-200">Situation</h3>
            <p className="text-sm text-slate-400 mt-1">{situation}</p>
            <h3 className="text-base font-semibold mt-3 text-slate-200">Task</h3>
            <p className="text-sm text-slate-400 mt-1">{task}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3">
            <RotateCw className="w-3 h-3" /> Tap to flip
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 glass p-6 bg-gradient-to-br from-teal-950/50 to-slate-900/70 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{topic}</span>
            <h3 className="text-base font-semibold mt-2 text-slate-200">Action</h3>
            <p className="text-sm text-slate-300 mt-1">{action}</p>
            <h3 className="text-base font-semibold mt-3 text-slate-200">Result</h3>
            <p className="text-sm text-emerald-300 mt-1">{result}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3">
            <RotateCw className="w-3 h-3" /> Tap to flip back
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  )
}
