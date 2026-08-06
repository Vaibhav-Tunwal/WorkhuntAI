import { z } from 'zod'

// Allowed academic email domains
const ALLOWED_DOMAINS = ['stud.hs-wismar.de', 'hs-wismar.de', 'stud-mail.uni-wuerzburg.de']
const ALLOWED_SUFFIXES = ['.edu', '.ac.uk', '.edu.de']

export function isAcademicEmail(email: string): boolean {
  const domain = email.split('@')[1] ?? ''
  return (
    ALLOWED_DOMAINS.includes(domain) ||
    ALLOWED_SUFFIXES.some(s => domain.endsWith(s))
  )
}

// Profile schema
export const ProfileSchema = z.object({
  full_name: z.string().min(2).max(100),
  study_program: z.string().min(2).max(100),
  university_name: z.string().default('Hochschule Wismar'),
  preferred_roles: z.array(z.string()).max(5),
  preferred_locations: z.array(z.string()).max(5),
  skills: z.array(z.string()).max(30),
  is_study_buddy_visible: z.boolean().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  instagram_handle: z.string().optional(),
  telegram_handle: z.string().optional(),
  base_cv_json: z.record(z.string(), z.unknown()).default({}),
})

// Job schema
export const JobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  description: z.string().optional(),
  external_source_url: z.string().url().optional(),
  extracted_skills: z.array(z.string()).default([]),
})

// Application status
export const ApplicationStatus = z.enum([
  'BOOKMARKED', 'MATCHED', 'DOCS_GENERATED',
  'APPLIED', 'INTERVIEWING', 'REJECTED', 'ACCEPTED'
])

export type Profile = z.infer<typeof ProfileSchema>
export type Job = z.infer<typeof JobSchema>
export type AppStatus = z.infer<typeof ApplicationStatus>

// Fuzz coordinates by ~50-100m for privacy
export function fuzzCoordinates(lat: number, lng: number) {
  const latJitter = (Math.random() * 2 - 1) * (50 / 111320)
  const lngJitter = (Math.random() * 2 - 1) * (50 / (111320 * Math.cos((lat * Math.PI) / 180)))
  return { lat: lat + latJitter, lng: lng + lngJitter }
}

// SHA-256 dedup hash for jobs (runs in Node / Edge environments)
export async function computeJobHash(company: string, title: string, location: string): Promise<string> {
  const str = `${company.trim().toLowerCase()}|${title.trim().toLowerCase()}|${location.trim().toLowerCase()}`
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}
