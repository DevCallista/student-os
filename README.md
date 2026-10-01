# Student OS

A local-first student productivity workspace built as an installable PWA.

## Features

- Local-first task and coursework workspace
- Dark/light/system theme support
- Offline-first PWA shell
- Task management, coursework tracking, and focus timer
- Schedule and review views
- Guest mode and cloud-sync-ready settings model
- Almanac-inspired starter academic data

## Quick start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Firebase setup (optional)

This project is structured for easy integration with Firebase Authentication and Firestore.

1. Create a Firebase project
2. Enable Google sign-in in Authentication
3. Create a Firestore database
4. Add your Firebase config in a local `.env` file or Vite environment variables
5. Replace the sync mock with real Firestore listeners when credentials are available

Example:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Notes

- The app is intentionally offline-capable and does not require a network dependency for core usage.
- Cloud sync is designed as an optional layer rather than a mandatory dependency.
- Starter academic data is editable and stored locally.

## PWA

The app includes a service worker and web manifest for installability.
