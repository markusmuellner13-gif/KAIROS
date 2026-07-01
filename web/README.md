# KAIROS Web (PWA)

A standalone Next.js PWA build of KAIROS — no Expo involved. Same dark
"Jarvis" HUD look, same core features (dashboard, chat assistant, schedule,
inbox, markets, Bible verses), running entirely in the browser with
`localStorage` persistence. Installable as a home-screen app on iOS/Android/
desktop via the web manifest + service worker.

This is intentionally separate from the Expo/React Native app in the repo
root — the two share the same feature logic (bible verse data, stock
analysis, assistant replies) but are independent codebases. If you later
want a native build, the two supported paths are:

- Wrap this PWA in a native shell (e.g. Capacitor) to publish to the App
  Store / Play Store with minimal extra code.
- Or keep growing the existing Expo app in `../app`, `../components`,
  `../services` for a fully native build.

## Run locally

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000 — works in any browser, no Expo Go, no
simulator required.

## Deploy to Vercel

1. Push this repo to GitHub (already done if you're reading this from the
   repo).
2. In the Vercel dashboard: **New Project** → import this GitHub repo →
   set **Root Directory** to `web` → deploy. Framework preset (Next.js) is
   auto-detected, no other config needed.
3. Every push to the connected branch redeploys automatically.

## Notes / limitations vs. the native app

- Storage is browser `localStorage`, not the OS keychain — fine for a demo,
  not encrypted at rest.
- Voice uses the Web Speech API (`speechSynthesis` / `SpeechRecognition`).
  Speech-to-text support varies by browser (best in Chrome; limited in
  Safari/Firefox).
- No background push notifications — there's no server, so scheduled
  reminders only fire while the app/tab is open. Browser `Notification`
  permission is available for foreground alerts only.
- The Inbox is a manual/local log (no live Gmail/SMS sync) — same
  limitation as the native app, see `lib/inbox.ts`.
