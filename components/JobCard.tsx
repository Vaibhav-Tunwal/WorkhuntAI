'use client'

import { Bookmark, ExternalLink, Zap } from 'lucide-react'

interface JobCardProps {
  id: string
  title: string
  company: string
  location: string
  matchScore?: number
  missingSkills?: string[]
  extractedSkills?: string[]
  externalUrl?: string
  onBookmark?: (id: string) => void
  onMatch?: (id: string) => void
}

export default function JobCard({
  id, title, company, location, matchScore, missingSkills = [],
  extractedSkills = [], externalUrl, onBookmark, onMatch
}: JobCardProps) {
  const scoreBadge = matchScore !== undefined
    ? matchScore >= 70 ? 'score-high' : matchScore >= 40 ? 'score-mid' : 'score-low'
    : null

  return (
    <div className="glass p-5 animate-slide-up hover:border-teal-700/50 transition-all duration-300 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-slate-100 truncate group-hover:text-teal-300 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-400 mt-0.5">{company} · {location}</p>
        </div>
        {scoreBadge && (
          <span className={scoreBadge}>{matchScore}%</span>
        )}
      </div>

      {extractedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {extractedSkills.slice(0, 6).map(skill => (
            <span key={skill}
              className={missingSkills.includes(skill) ? 'skill-miss' : 'skill-have'}>
              {skill}
            </span>
          ))}
          {extractedSkills.length > 6 && (
            <span className="skill-chip bg-slate-800 text-slate-500">+{extractedSkills.length - 6}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mt-4">
        {onMatch && matchScore === undefined && (
          <button onClick={() => onMatch(id)}
            className="btn-primary text-xs flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Score Match
          </button>
        )}
        {onBookmark && (
          <button onClick={() => onBookmark(id)}
            className="btn-ghost text-xs flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5" /> Save
          </button>
        )}
        {externalUrl && (
          <a href={externalUrl} target="_blank" rel="noopener noreferrer"
            className="btn-ghost text-xs flex items-center gap-1.5 ml-auto">
            <ExternalLink className="w-3.5 h-3.5" /> Source
          </a>
        )}
      </div>
    </div>
  )
}
