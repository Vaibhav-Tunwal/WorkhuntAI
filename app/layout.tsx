import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionTracker from '@/components/SessionTracker'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Workhunt AI — Career Co-Pilot for Hochschule Wismar',
  description: 'AI-powered job discovery, CV generation, interview prep, and peer networking for university students.',
  keywords: ['jobs', 'Germany', 'students', 'Hochschule Wismar', 'CV', 'internship', 'Werkstudent'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        <SessionTracker />
        {children}
      </body>
    </html>
  )
}
