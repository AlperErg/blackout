# Blackout

Blackout is a mobile app for phone-free social gatherings with on-device app blocking. A host sets optional breaks, the end time for the session and shares a link or QR code with others. Participants stay locked out of distracting apps on their phone until the session ends with in-session chat, host announcements, and push notifications for updates on the event. Native iOS and Android custom-written focus/app-limit APIs, Firebase cloud backend, real-time chat, APNs/FCM notifications, and invite links.

This repository contains the codebase for the React Native mobile app. The join-link redirect website is maintained in its own repository, [AlperErg/blackout-web](https://github.com/AlperErg/blackout-web).

1. **React Native mobile app** for **iOS** and **Android** (`blackout/`)
2. **Join-link website** — separate repo: [AlperErg/blackout-web](https://github.com/AlperErg/blackout-web) (hosted at `blackout.ergune.dev`)

## Project structure

```text
.
└── blackout/   # Expo React Native app (iOS + Android)
# Join-link website: separate repo → github.com/AlperErg/blackout-web
```

## 1) React Native app (iOS & Android)

Path: `blackout/`

### How the app works

The mobile app uses **Expo Router** and **Firebase Firestore** to run time-based group sessions.

1. **App startup & restore:** `app/index.tsx` checks onboarding and permissions, then restores any active session from `AsyncStorage` (`lib/activeSession.ts`).
2. **Create session (host):** `app/sessionmaker.tsx` creates a Firestore session doc via `lib/sessions.ts` with end time, participant limit, and optional unblock-break settings.
3. **Join session (participant):** users join via QR scan (`app/qrscanner.tsx`) or deep link (`blackout://join/...` / `https://blackout.ergune.dev/join/...` handled in `app/_layout.tsx`), then `joinSession` validates capacity/status in a Firestore transaction.
4. **During session:** `app/session.tsx` enforces blocking (iOS: `expo-family-controls`, Android: `expo-android-blocker`), supports optional timed unblock breaks, and keeps break/session state in local storage. Break expiry is checked entirely on-device (native timers plus foreground checks) — there is no server-side backup, so re-blocking can be missed if the OS never gives the app a chance to run.
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

## 2) Join-link website (separate repo)

Repo: [AlperErg/blackout-web](https://github.com/AlperErg/blackout-web) · Hosted at `https://blackout.ergune.dev/`

This static site handles app join URLs such as `https://blackout.ergune.dev/join/{sessionId}` and
redirects users into the mobile app deep link `blackout://join/{sessionId}`. It is deployed to
GitHub Pages via a GitHub Actions workflow on every push to its `main` branch.

The app builds these links in `blackout/lib/joinLink.ts` — keep `JOIN_BASE_URL` and the
website's custom domain in sync.
