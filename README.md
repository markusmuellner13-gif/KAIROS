# KAIROS — Personal Intelligence Assistant

**K**nowledge **A**nd **I**ntelligence **R**easoning **O**perating **S**ystem

A full-featured personal assistant for your phone — dark, futuristic, faith-aware.

---

## Features

| Feature | Description |
|---|---|
| **Dashboard** | Live clock, personalised greeting, daily brief, today's appointments |
| **KAIROS Assistant** | Voice + chat interface — say "Hey KAIROS" to activate |
| **Schedule** | Appointments with 30-min push notifications, reminders |
| **Markets** | Stock watchlist, RSI/SMA analysis, buy/sell signals, portfolio tracker |
| **Catholic Bible** | 3 daily scripture notifications (morning, noon, evening) matching the liturgical season |
| **Smart Alerts** | Sleep reminders, workout reminders, morning brief — all configurable |
| **Secure Storage** | All personal data encrypted on-device via OS keychain. Never shared. |

---

## How to Get It On Your Phone

### Option 1 — Expo Go (Instant, No Build Required)

This works **right now** and is the fastest way:

1. **Install Expo Go** on your phone:
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. On your computer, open a terminal in this folder and run:
   ```
   npm start
   ```

3. A QR code appears in the terminal. Scan it with:
   - **Android**: The Expo Go app has a built-in scanner
   - **iPhone**: Use the iOS Camera app

4. KAIROS opens on your phone immediately.

> The computer must be on the same Wi-Fi network as your phone.

---

### Option 2 — Build a Real APK (Install Permanently, No Computer Needed After)

This creates a standalone `.apk` file you can install directly on Android, just like any app.

**Step 1 — Create a free Expo account**
Go to https://expo.dev and sign up (free).

**Step 2 — Install EAS CLI**
```bash
npm install -g eas-cli
eas login
```

**Step 3 — Configure the project**
```bash
eas build:configure
```

**Step 4 — Build the APK (runs in the cloud, no Android Studio needed)**
```bash
eas build -p android --profile preview
```
This takes ~5-10 minutes. When done, Expo gives you a download link.

**Step 5 — Install on your phone**
1. Download the `.apk` file to your phone
2. Go to **Settings > Security > Install unknown apps** and allow your browser/file manager
3. Open the `.apk` file and tap Install

---

### Option 3 — Add to Home Screen via Browser (PWA — Web Version)

Run the web version and add it to your home screen:

```bash
npm run web
```

Open the URL shown in Chrome on your phone → tap the three-dot menu → **Add to Home Screen**.

---

## Catholic Bible Feature

KAIROS contains **90+ verses** from the Douay-Rheims Catholic Bible (public domain), covering all 73 books including the Deuterocanonical books:
- Tobit, Judith, 1 & 2 Maccabees
- Wisdom (Book of Wisdom)
- Sirach (Ecclesiasticus)
- Baruch

### Liturgical Calendar
Verses are automatically selected for the current **liturgical season**:
- 🕯 **Advent** — prophecies, preparation, hope
- ⭐ **Christmas** — Nativity, Incarnation
- ✝️ **Lent** — repentance, fasting, mercy
- 🌅 **Easter** — Resurrection, new life
- 🔥 **Pentecost** — Holy Spirit, gifts
- 📖 **Ordinary Time** — wisdom, faith, daily life

### Feast Days
On **major Catholic feast days** (Immaculate Conception, Assumption, All Saints, etc.), KAIROS shows a feast-specific verse and names the feast in the notification.

### Notification Schedule (configurable)
| Time | Liturgy of the Hours |
|---|---|
| Morning (default 07:00) | Lauds |
| Noon (default 12:00) | Angelus |
| Evening (default 18:00) | Vespers |

---

## Security

- All personal data (appointments, profile, reminders) is stored using **expo-secure-store** — encrypted by the Android Keystore / iOS Keychain
- **No internet required** for core features (Bible, reminders, schedule)
- **No accounts, no cloud, no tracking**
- Stock data uses Alpha Vantage free API (optional)

---

## Stock Disclaimer

> TradeRepublic has no public trading API. KAIROS provides technical analysis signals (RSI, moving averages) to help you make informed decisions. All trades must be placed manually in the TradeRepublic app. **No algorithm can guarantee profits. All investments carry risk.**

---

## Tech Stack

- React Native + Expo SDK 56
- Expo Router (file-based navigation)
- TypeScript (strict)
- expo-secure-store (encrypted storage)
- expo-notifications (push notifications)
- expo-speech (text-to-speech)
- expo-av (audio recording)
- Alpha Vantage API (stock data)

---

*KAIROS v1.1.0*
