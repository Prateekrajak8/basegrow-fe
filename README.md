# Basegrow React Frontend (Migration)

This folder is the new React frontend for the Next.js to Django migration.

## Run

1. Copy env file:
   - `cp .env.example .env`
2. Install deps:
   - `npm install`
3. Start dev server:
   - `npm run dev`

## Environment

- `VITE_API_BASE_URL` should point to your Django API base, e.g. `http://localhost:8000/api`.

## Current migration status

- Vite + TypeScript React project scaffold
- Copied legacy frontend pages from Next app into `src/pages`
- Copied legacy components into `src/components`
- Copied Redux store into `src/store`
- Added route parity for current frontend URLs
- Added compatibility shims for `next/navigation`, `next/link`, and `next/server`

This allows iterative conversion from legacy Next frontend code to pure React while keeping UI behavior close to current implementation.


## Frontend-only testing (no backend)

- Copy env: `cp .env.example .env`
- Ensure `VITE_ENABLE_MOCKS=true`
- Run: `npm install && npm run dev`

When Django backend is ready, set `VITE_ENABLE_MOCKS=false` and point `VITE_API_BASE_URL` to Django API.
