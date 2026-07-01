# KAIROS — Personal Intelligence System

**K**nowledge **A**nd **I**ntelligence **R**easoning **O**perating **S**ystem

A full-featured personal assistant. Dark, futuristic, faith-aware. This repo
has two independent apps that share the same feature logic (Bible verses,
stock analysis, assistant replies), ported rather than duplicated from
scratch:

- **`/` (this directory)** — a Next.js **PWA**, deployable straight to
  Vercel. No Expo involved, works in any browser today.
- **`native/`** — the **Expo/React Native app**, for building an actual
  iOS/Android binary and publishing to the App Store / Play Store.

If you only need to test or demo KAIROS right now, use the web app below —
it's the fastest path and needs no simulator, no Expo Go, no build step.

---

## Web PWA (this directory)

Same dark "Jarvis" HUD look and the same core features (dashboard, chat
assistant, schedule, inbox, markets, Bible verses) as the native app,
running entirely in the browser with `localStorage` persistence.
Installable as a home-screen app on iOS/Android/desktop via the web
manifest + service worker.

### Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — works in any browser, no Expo Go, no
simulator required.

### Deploy to Vercel

1. Push this repo to GitHub (already done if you're reading this from the
   repo).
2. In the Vercel dashboard: **New Project** → import this GitHub repo →
   leave **Root Directory** as `/` (default) → deploy. Framework preset
   (Next.js) is auto-detected, no other config needed — the Next.js app
   lives at the repo root and the native app is safely tucked away in
   `native/`, so it won't interfere with the build.
3. Every push to the connected branch redeploys automatically.

### Notes / limitations vs. the native app

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
- Wrapping this PWA in a native shell (e.g. Capacitor) is the more direct
  path to an App Store / Play Store build than rewriting — a future step,
  not done here.

---

## Native app (`native/`)

The original Expo/React Native app — see **[native/README.md](native/README.md)**
for how to build and install it as a real Android APK (including the
GitHub Actions auto-build setup) or run it via `eas build`.

### Features (both apps)

| Feature | Description |
|---|---|
| **Dashboard** | Live clock, personalised greeting, daily brief, today's schedule |
| **KAIROS Assistant** | Voice + chat |
| **Smart Reminders** | Appointments and custom reminders |
| **Bible Companion** | 95 Roman Catholic Bible verses, matched to the liturgical season |
| **Context-aware verses** | Tell KAIROS you're sad, anxious, lonely, grateful — it finds the right verse |
| **Markets** | Stock watchlist, RSI/SMA analysis, portfolio tracker |
| **Inbox** | Local log of emails/texts KAIROS can summarise and reference |

## Catholic Bible

- **95 verses** from all 73 books of the Roman Catholic canon
- Includes Deuterocanonical books: Sirach, Wisdom, Tobit, Baruch, 1–2 Maccabees
- **Unified translation** — same source text in both English and German (Settings → Catholic Bible)
- **Liturgical calendar** — verses change with Advent, Christmas, Lent, Easter, Pentecost, Ordinary Time
- **40+ feast days** detected (Assumption, Immaculate Conception, All Saints, etc.)
- **Context-aware**: ask "I'm feeling sad, give me a Bible verse" and KAIROS finds a verse of comfort

## Stock Disclaimer

> TradeRepublic has no public trading API. KAIROS provides technical analysis signals (RSI, moving averages) for your manual decisions. No algorithm guarantees profits. All investments carry risk.

## License

Proprietary — Copyright © 2025–2026 Markus Müllner. All rights reserved.
See [LICENSE](LICENSE) for details.
