# SOP: Study Buddy Directory & Privacy Fuzzing

## Purpose
Allow Hochschule Wismar students to discover peers for course study, local networking, and skill sharing without exposing exact home addresses.

## Privacy & Security Invariants

### 1. Domain Isolation & Opt-In
- Opt-In: Disabled by default (`is_study_buddy_visible = FALSE`).
- Restricted to verified student emails matching `@stud.hs-wismar.de`.

### 2. 100-Meter Location Jitter Algorithm
- Real coordinates are stored securely in PostgreSQL with strict Row Level Security (RLS).
- The public `study_buddies` view calculates a randomized 50m to 100m circular offset before exposing coordinates to the frontend Leaflet/Mapbox map layer:
  ```sql
  fuzzy_lat = lat + (random() * 2 - 1) * (50 / 111320.0);
  fuzzy_lng = lng + (random() * 2 - 1) * (50 / (111320.0 * cos(radians(lat))));
  ```
- The frontend renders a soft translucent 100-meter circular radius rather than a pinpoint marker.

### 3. External Contact Handles
- Display user-provided Telegram / Instagram / Email handles inside a slide-over drawer sheet.
- Zero in-app messaging server overhead required.
