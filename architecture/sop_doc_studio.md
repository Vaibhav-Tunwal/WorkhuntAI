# SOP: Zero-Storage Document Studio

## Purpose
Compile professional, ATS-compliant German (Lebenslauf) and English `.docx` binary documents directly in the user's browser using `docx.js`, enforcing zero-storage media privacy.

## Protocol & Rules

### 1. In-Memory Zero-Storage Isolation
- Profile headshot photos and signature graphic uploads are held strictly in React RAM state (`useState` / ArrayBuffer).
- No image binary or base64 string is ever uploaded to Supabase Storage, S3 buckets, or server disks.

### 2. Client-Side Compilation (`docx.js`)
- Convert base64 / RAM images into OpenXML inline image nodes using `docx.js`.
- Render standard hierarchy: Calibri / Arial 10-12pt font, clean single/multi-page tabular layout.
- Trigger direct browser file download blob: `Workhunt_AI_CV_[StudentName].docx`.
- Immediately garbage-collect React state variables upon download completion.

### 3. 15-Minute Auto-Purge Verification
- Any transient server buffer state or temporary payload pointer must auto-expire within 15 minutes.
