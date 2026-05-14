# Blackout

Blackout is a mobile app for phone-free social gatherings with on-device app blocking. A host sets optional breaks, the end time for the session and shares a link or QR code with others. Participants stay locked out of distracting apps on their phone until the session ends with in-session chat, host announcements, and push notifications for updates on the event. Native iOS and Android custom-written focus/app-limit APIs, Firebase cloud backend, real-time chat, APNs/FCM notifications, and invite links.

This repository contains the full codebase for the React Native mobile app, the website, and Firebase Cloud Functions that handle backend scheduled tasks.

1. **React Native mobile app** for **iOS** and **Android** (`blackout/`)
2. **React website** companion for app join links (`website/`)
3. **Firebase Cloud Functions** for scheduled backend tasks (`functions/`)

## Project structure

```text
.
├── blackout/   # Expo React Native app (iOS + Android)
├── functions/  # Firebase Cloud Functions (scheduled backend jobs)
└── website/    # Website for join flow (blackout.codes)
```

## 1) React Native app (iOS & Android)

Path: `blackout/`

### How the app works

The mobile app uses **Expo Router** and **Firebase Firestore** to run time-based group sessions.

1. **App startup & restore:** `app/index.tsx` checks onboarding and permissions, then restores any active session from `AsyncStorage` (`lib/activeSession.ts`).
2. **Create session (host):** `app/sessionmaker.tsx` creates a Firestore session doc via `lib/sessions.ts` with end time, participant limit, and optional unblock-break settings.
3. **Join session (participant):** users join via QR scan (`app/qrscanner.tsx`) or deep link (`blackout://join/...` / `https://blackout.codes/join/...` handled in `app/_layout.tsx`), then `joinSession` validates capacity/status in a Firestore transaction.
4. **During session:** `app/session.tsx` enforces blocking (iOS: `expo-family-controls`, Android: `expo-android-blocker`), supports optional timed unblock breaks, and keeps break/session state in local storage.
5. **Realtime communication:** chat (`lib/chat.ts`) and host announcements (`lib/announcements.ts`) are live Firestore subcollections shown in `SessionChat` and `SessionAnnouncements`.
6. **Notifications:** push tokens are stored per session (`lib/notifications.ts`); host announcements can push live notifications to participants.
7. **End/cleanup:** when a session ends or host exits, session docs/subcollections are cleaned up and local active-session state is cleared.

### Run locally

```bash
cd blackout
npm install
npx expo prebuild
npx expo run --configuration=release
```

### Run on a connected phone

```bash
# iOS
npx expo run:ios --configuration=release --device

# Android
npm run android --configuration=release --device
```

## 2) React website

Path: `website/`

This website handles app join URLs such as:

- `https://blackout.codes/join/{sessionId}`

It redirects users into the mobile app deep link:

- `blackout://join/{sessionId}`

### Deploy

- **Vercel:** set project root to `website` (uses `website/vercel.json`)
- **Netlify:** set publish directory to `website` (uses `website/netlify.toml`)

## 3) Firebase Cloud Functions

Path: `functions/`

This folder contains Firebase Cloud Functions (TypeScript) for backend scheduled work. It currently runs a minute-based job that finds expired break timers in Firestore and sends silent Expo push notifications so devices re-enable shielding after a break.
