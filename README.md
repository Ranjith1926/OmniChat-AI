# OmniChat AI

A ChatGPT-style mobile chat app built with Expo + TypeScript. It talks directly to the
[Google Gemini API](https://ai.google.dev) from the device — there is no custom backend.

## Features

- **Text chat** with streamed responses, stop/regenerate/edit/delete on any message, and markdown + code-block rendering.
- **Conversation history** persisted locally in SQLite (`expo-sqlite`), with search, rename, and delete.
- **Camera & image understanding** — capture a photo or pick from the gallery and ask Gemini about it.
- **Document chat** — upload PDF, TXT, CSV, or DOCX files and ask questions about their content.
- **Voice input/output** — record a voice message, get it transcribed into the composer, and listen to spoken replies (TTS) via the speaker icon on assistant messages.
- **Light / dark / system theming**, a ChatGPT-style drawer for navigating between conversations.

## Requirements

- Node.js (LTS) and `npx`
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)
- Android Studio (emulator) or a physical Android/iOS device for running a native build — this app uses native modules (camera, audio, SQLite, secure storage) so it **cannot run in Expo Go**.

## Setup

```bash
npm install
```

Add your Gemini API key one of two ways:

1. **In-app (recommended for real devices):** launch the app, open the drawer → Settings, and paste your key. It's stored in `expo-secure-store`, scoped to this device only.
2. **Local dev convenience:** copy `.env.example` to `.env` and set `GEMINI_API_KEY=...`. This is only read when running in development (`__DEV__`) and is never bundled into a release build — see the security note below for why this isn't a substitute for a real secrets story in production.

## Running the app

Because this project uses native modules, you need a development build rather than Expo Go:

```bash
npx expo run:android   # builds and installs on a connected device/emulator
npx expo run:ios       # macOS + Xcode only
```

After the first native build, subsequent iterations can use the faster Metro-only loop:

```bash
npx expo start
```

## Building for distribution (EAS)

This repo includes an `eas.json` with `development`, `preview`, and `production` profiles.

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview   # installable APK for testing
npx eas-cli@latest build --platform android --profile production # AAB for Play Store submission
npx eas-cli@latest submit --platform android                     # after setting up Play Console credentials
```

iOS builds/submission follow the same pattern with `--platform ios`, but require an active Apple Developer account and (for `submit`) App Store Connect access that wasn't available while building this project — budget time to verify provisioning, capabilities (microphone, camera), and App Store review notes (see the security section below; reviewers will ask how the API key is protected) before your first iOS submission.

## ⚠️ API key security — read before shipping to other people

This app calls the Gemini API **directly from the client**, by design (no backend). That means:

- Whatever key is active on a device is present in that device's memory and SecureStore at runtime. A sufficiently determined user of their *own* device can extract it (e.g. via a rooted device, a MITM proxy, or binary inspection) and use it outside the app.
- Each user is expected to supply **their own key** via Settings — the app does not ship with a working key embedded in the binary. The optional `.env`/`GEMINI_API_KEY` path is a development convenience only; it is read solely in `__DEV__` builds (see `src/services/storage/secureConfig.ts` and `app.config.ts`) and is never included in a release/production build.
- If you want to distribute this app to people who shouldn't need to bring their own API key, you need either:
  - a thin backend/proxy that holds the real key and forwards requests (with your own auth/rate-limiting), or
  - a provider-side key-vaulting / ephemeral-token scheme, if Gemini offers one for your use case.
- Don't commit a working key anywhere in this repo. `.env` is git-ignored; double-check before every commit if you've been experimenting with the dev-fallback key.

## Project structure

```
src/
  app/              # Expo Router routes (screens), one file per route
  components/        atoms / molecules / organisms / templates (atomic design)
  features/          chat, history, attachments, voice, settings — hooks + screens per domain
  context/            Context + useReducer state (one slice reducer per domain)
  services/
    api/              Gemini request/streaming/transcription/TTS calls
    db/                SQLite schema + queries
    documents/         PDF/TXT/CSV/DOCX text extraction
    storage/           SecureStore-backed API key storage, permanent file helpers
    permissions/       camera/microphone/media-library permission wrappers
  theme/              light/dark design tokens
```

## Before you publish

A few things in this repo are placeholders generated for development and must be changed before a real store submission:

- **App identifiers** — `android.package` and `ios.bundleIdentifier` in `app.config.ts` are both set to `com.anonymous.omnichatai`, Expo's default for an unconfigured app. Change both to a reverse-domain id you actually own (e.g. `com.yourcompany.omnichatai`) before your first production build — changing it later requires a new app listing on both stores, not just a version bump.
- **EAS project linking** — running `eas build` for the first time will prompt to create/link an EAS project and will write an `extra.eas.projectId` into your config; this hasn't been done yet.

Store-listing checklist (Google Play / Apple App Store both require these):

- Privacy policy URL — required because the app requests camera, microphone, and photo-library access, and stores conversation history + API key on-device. You'll need to host one and describe what's collected (the app itself sends no telemetry anywhere; all data stays on-device and is sent only to Google's Gemini API as part of each request).
- Play Store "Data safety" form / App Store "App Privacy" (nutrition label) — both ask you to disclose that the app collects photos, documents, voice audio, and text the user submits, and transmits it to a third-party AI service (Google Gemini) for processing. Answer accurately; this app does not run its own backend or analytics.
- Screenshots, feature graphic, short/long description, and a content rating questionnaire (expect "AI-generated content" style questions given this is an AI chat app).
- Permission usage strings are already wired up via the Expo config plugins (camera, microphone, photo library) — review the copy in `app.config.ts` `plugins` if you want to adjust the wording reviewers and users will see.

## Known limitations

- **Realtime (live, interrupt-capable) voice conversation** is not implemented — voice is recording-based: record → transcribe → send to chat → speak the reply. This was a deliberate scope decision; see project history for why.
- **DOCX extraction** is a lightweight pure-JS XML-text extractor (no tables/images/formatting), so complex documents may extract partially. PDFs are sent to Gemini as native file input and don't go through local extraction.
- Model availability drifts over time — verify the model id selected in Settings is still current at [ai.google.dev](https://ai.google.dev) if you hit model-not-found errors.
