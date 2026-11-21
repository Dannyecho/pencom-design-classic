# PenCom website: "classic" theme (Next.js)

The classic homepage design (the earlier full-width slider; original route `/home-classic`) as its own Next.js
project, rebuilt as a national pension portal. Copied from the calm theme; pages are restyled session by session
(see `SESSIONS.md`).

## Run

```bash
npm install
npm run dev          # http://localhost:3015 (PORT=3025 npm run dev to change)
npm run build && npm start   # production on port 3015 (or $PORT)
```

## Layout

- `src/app` – routes (Next.js App Router). `page.tsx` is the home page.
- `src/views` – page sections (home: `HomeClassic.tsx`, `homeclassic/` from session CL1).
- `src/components` – header, footer, notices bell, assistant, popups, accessibility.
- `src/i18n` – English, Hausa, Yoruba and Igbo (drafts for review).
- `src/lib/router.tsx` – lets the shared components use react-router style links on Next.js.
