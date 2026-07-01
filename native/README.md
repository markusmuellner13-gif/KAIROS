# KAIROS — Personal Intelligence System

**K**nowledge **A**nd **I**ntelligence **R**easoning **O**perating **S**ystem

A full-featured personal assistant for your phone. Dark, futuristic, faith-aware.

**GitHub:** https://github.com/markusmuellner13-gif/KAIROS

---

## How to Download the App on Your Phone (No Computer Needed After Setup)

### Step 1 — One-time setup (5 minutes, do this once)

1. Create a **free** account at **https://expo.dev** (email + password)
2. On expo.dev: go to **Account Settings → Access Tokens → Create Token** — copy the token
3. On GitHub: go to **https://github.com/markusmuellner13-gif/KAIROS/settings/secrets/actions**
   → **New repository secret** → Name: `EXPO_TOKEN` → Paste your token → Save

> GitHub Actions may also require a payment method on file at https://github.com/settings/billing
> (You won't be charged — free accounts get 2,000 free minutes/month for public repos)

### Step 2 — Get the APK

After setup, the APK builds **automatically** every time code is pushed.

1. Go to **https://github.com/markusmuellner13-gif/KAIROS/releases** on your phone
2. Tap the latest release → download **kairos.apk**
3. Open the file on your phone → tap **Install**
4. If prompted: go to Android Settings → Security → enable **"Install from unknown sources"**

**The app then runs completely standalone — no computer, no server, nothing.**

### Alternative: Build from terminal right now

If you want the APK immediately without waiting for CI:

```bash
npm install -g eas-cli
eas login          # enter your expo.dev credentials
eas build -p android --profile preview
```

Expo builds it in the cloud (~10 minutes). You get a direct download link. Your computer can sleep while it builds.

---

## Features

| Feature | Description |
|---|---|
| **Dashboard** | Live clock, personalised greeting, daily brief, today's schedule |
| **KAIROS Assistant** | Voice + chat — say "Hey KAIROS" to activate |
| **Smart Reminders** | Appointments with push notifications, custom reminders |
| **Bible Companion** | 95 Roman Catholic Bible verses, 3 daily notifications matched to the liturgical season |
| **Context-aware verses** | Tell KAIROS you're sad, anxious, lonely, grateful — it finds the right verse |
| **Markets** | Stock watchlist, RSI/SMA analysis, portfolio tracker |
| **Secure Storage** | All personal data encrypted on-device via OS keychain. Never shared. |

## Catholic Bible

- **95 verses** from all 73 books of the Roman Catholic canon
- Includes Deuterocanonical books: Sirach, Wisdom, Tobit, Baruch, 1–2 Maccabees
- **Unified translation** — same source text in both English and German (Settings → Catholic Bible)
- **Liturgical calendar** — verses change with Advent, Christmas, Lent, Easter, Pentecost, Ordinary Time
- **40+ feast days** detected (Assumption, Immaculate Conception, All Saints, etc.)
- **3 daily notifications** at Lauds (morning), Angelus (noon), Vespers (evening)
- **Context-aware**: ask "I'm feeling sad, give me a Bible verse" and KAIROS finds a verse of comfort

## Stock Disclaimer

> TradeRepublic has no public trading API. KAIROS provides technical analysis signals (RSI, moving averages) for your manual decisions. No algorithm guarantees profits. All investments carry risk.

## License

Proprietary — Copyright © 2025–2026 Markus Müllner. All rights reserved.
See [LICENSE](LICENSE) for details.
