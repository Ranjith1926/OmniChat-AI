# OmniChat AI — Handoff

Status snapshot for continuing this project. Originally written 2026-10-16,
substantially updated 2026-10-17 after a session that got the native Android
build working for real, fixed several previously-undetected bugs, and
implemented Phase 6. See `README.md` for normal setup/run/build instructions
and the API-key security model — this file is about *project state*.

## tl;dr

All 9 phases (0–8 plus the previously-skipped realtime voice, now built) are
implemented. The native Android build **works** — see "Working copy location"
below, it's important. Text chat + TTS are confirmed working end-to-end
against the real Gemini API on a real Android emulator. Several real bugs
that had never been caught (because nothing had ever run against a live
network + valid key + fresh native build before) were found and fixed this
session — see "Bugs found and fixed" below before you assume something is
"Done" just because an earlier phase table said so.

## Working copy location — READ THIS FIRST

**The project's native Android build only succeeds from a short path.** This
machine's checkout lives at `C:\Users\RanjithUma\Desktop\OmniChat AI`, which
is too long/deep for Android's native toolchain on Windows (see "Windows
native build" below for why). The actual build-and-run copy is at:

```
C:\a
```

`C:\a` is a copy of this project (same `src/`, same `app.config.ts`, same
`package.json` — `node_modules`/`android`/`.expo` are NOT shared, each has
its own). **Whenever you edit source here, you must sync changed files to
`C:\a` before rebuilding/testing**, e.g.:

```powershell
Copy-Item "C:\Users\RanjithUma\Desktop\OmniChat AI\src\<path>" "C:\a\src\<path>" -Force
Copy-Item "C:\Users\RanjithUma\Desktop\OmniChat AI\app.config.ts" "C:\a\app.config.ts" -Force
```

(For a bulk resync: `robocopy "<Desktop path>\src" "C:\a\src" /E` from
PowerShell — robocopy exit code `1` means success, not failure, with `/E`.)

This two-location setup is friction and a real risk of the copies drifting.
**Worth fixing properly next session**: either move your actual daily-edit
location to `C:\a` permanently (simplest), or script the sync, or set up a
symlink/junction (we did not get this working cleanly here — see the ninja
path-length section, junctions didn't reliably shorten the paths ninja
actually validates).

## What's implemented

| Phase | What | Status |
|---|---|---|
| 0 | Scaffold: Expo Router, Context+useReducer state, theme system, atomic-design components | Done |
| 1 | Text chat with streamed Gemini responses, stop/regenerate/edit/delete, markdown+code rendering | Done — **verified live** against real Gemini API this session |
| 2 | SQLite-backed conversation history (search/rename/delete), settings persistence | Done |
| 3 | Camera capture + gallery picker, image understanding via Gemini multimodal input | Done — not re-verified live this session |
| 4 | Document upload (PDF/TXT/CSV/DOCX), local text extraction, document chat | Done — not re-verified live this session |
| 5 | Voice: record → transcribe → send, TTS playback of replies (`SpeakButton`) | Done — TTS playback **verified live** this session. Record→transcribe not re-verified live (was blocked all along by the RECORD_AUDIO bug, see below, now fixed but untested end-to-end) |
| 6 | Realtime (live, interrupt-capable) voice conversation | **Implemented this session.** WebSocket connection + mic capture + setup handshake verified live (confirmed via Android's mic-in-use indicator + clean connect/listen/teardown). The actual spoken round-trip — model replying with audio, playback, and barge-in interruption — is **not yet verified live**: the dev emulator has no real microphone input to trigger it. Test on a real device with your voice next. |
| 7 | UI/branding polish: custom icon+splash, empty/error/loading states, accessibility, keyboard handling | Done. Splash screen bug fixed this session (see below) — the native splash was never actually staying up through app load. |
| 8 | Release prep: `eas.json` profiles, README rewrite, dependency health fixes | Done, native build now verified working (see below) |

## Bugs found and fixed this session (2026-10-17)

None of these were caught before because this was the first time the app
ever ran with a working native build + real internet + a valid API key.
Worth knowing about since the symptoms could easily look like new bugs if
you're not aware they're already fixed:

1. **Native Android build failed entirely** — Windows `MAX_PATH` plus, more
   subtly, **`ninja.exe`'s own hardcoded 260-character buffer** for a
   relative path string it builds internally (independent of Windows' own
   long-path support). Fixed by building from `C:\a` (see "Working copy
   location" above). A merely "shortish" path like `C:\dev\omnichat-ai` was
   NOT short enough — one `react-native-gesture-handler` codegen file's
   mirrored path alone was 267 characters before even adding the project
   root length budget.
2. **Gemini API key in `.env` was invalid** — `AIza` vs `Alza` (capital `I`
   vs lowercase `l`) transcription typo. Fixed. Google API keys always start
   with capital-I `AIza`.
3. **Real bug in `src/services/api/gemini.ts`'s SSE stream parser** — the
   Gemini API frames streamed response chunks with `\r\n\r\n`, but the
   parser only split on `\n\n`, so every chunk silently failed to parse.
   `fullText` stayed empty, no `blockReason` was ever set either, so
   `onDone('')` fired with **no error surfaced at all** — just a blank
   assistant bubble. Fixed by normalizing `\r\n` → `\n` before parsing. This
   had nothing to do with the sandbox/network — it would have broken on any
   machine, the first time anyone actually got a real response back.
4. **`RECORD_AUDIO` permission silently stripped from the Android manifest
   app-wide** — `app.config.ts`'s `expo-image-picker` plugin config had
   `microphonePermission: false`. That plugin's `false` doesn't just skip
   requesting the permission for *itself* — it calls
   `AndroidConfig.Permissions.withBlockedPermissions(...)`, which adds a
   `tools:node="remove"` directive to the manifest that wins the Android
   manifest merge **globally**, overriding `expo-audio`'s/
   `react-native-audio-api`'s own additions. This silently broke **every**
   mic-based feature (Phase 5 recording, Phase 6 live voice) from the day
   Phase 4's image-picker config was written — "Microphone access was
   denied" was not a real runtime denial, the permission was never even in
   the installed APK. Fixed by removing that line (image-picker doesn't
   touch the mic itself; omitting it just lets another plugin's addition
   through instead of blocking it).
5. **Native splash screen never actually controlled** — nothing in the app
   called `SplashScreen.preventAutoHideAsync()` / `hideAsync()`, so the
   native splash (correctly configured via the `expo-splash-screen` plugin)
   auto-hid the instant the Android activity launched, before JS even
   started bundling — leaving a blank white screen for however long the JS
   bundle took to load (seconds, sometimes 20+ on a cold cache). Fixed in
   `src/app/_layout.tsx`: `preventAutoHideAsync()` at module scope,
   `hideAsync()` once `Navigation()` mounts (i.e. once SQLite + providers
   are ready).
6. **Benign upstream console noise** — `[Reanimated] Dependencies should
   only be used on the web...` warnings come from `expo-router`'s Drawer
   navigator internals (gesture-handler/reanimated transition code), not
   from any of our own code (confirmed: zero direct `react-native-reanimated`
   usage anywhere in `src/`). Suppressed via `LogBox.ignoreLogs(...)` in
   `_layout.tsx` rather than chased further — it's not actionable on our end.

## Phase 6 architecture (new this session)

Realtime voice uses Google's **Gemini Live API** over a raw WebSocket (no
official SDK was used — see `src/services/api/geminiLive.ts`):

- Endpoint: `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=<API_KEY>`
- Model: `models/gemini-3.8-live` (`DEFAULT_LIVE_MODEL` in `apiConfig.ts`) —
  confirmed against the live `models.list` API to actually support
  `bidiGenerateContent`; re-verify if this starts failing, Google's Live
  model lineup moves.
- Input: 16kHz 16-bit PCM, base64, `realtimeInput.audio`. Output: 24kHz
  16-bit PCM in `serverContent.modelTurn.parts[].inlineData`.
- Interruption: server sends `serverContent.interrupted: true` when
  server-side VAD detects the user talking over the model —
  `useLiveVoiceSession` responds by clearing the playback queue.

Audio capture/playback uses **`react-native-audio-api`** (Software Mansion's
Web Audio API implementation for RN), added this session — `expo-audio`
can only do file-based record/playback, it has no API for streaming raw PCM
buffers in either direction (confirmed against the SDK 58 docs before
reaching for a second library). Key implementation gotcha: the library's
`AudioBufferQueueSourceNode.start(when, offset)` has a bug in its own
default parameters — `offset` defaults to `-1`, but its own validation
throws on `offset < 0`. You must always call `.start(context.currentTime, 0)`
explicitly, never `.start()` or `.start(when)` alone — see the comment in
`useLiveVoiceSession.ts`.

Files: `src/services/api/geminiLive.ts` (WebSocket session),
`src/features/voice/live/` (`useLiveVoiceSession.ts` hook, `pcm.ts` PCM↔base64
helpers), `src/components/organisms/LiveVoiceModal.tsx` (UI). Entry point is
a new phone-icon button in `Composer.tsx`, next to the existing mic button.

**Still needs real-device verification**: the connect/listen/teardown
lifecycle is confirmed solid, but nobody has actually spoken to it and heard
a reply yet. Test on a real phone (not emulator — no real mic input to
trigger Gemini's voice-activity detection) and listen for: does the model's
reply play back smoothly (no clicking/gaps between chunks)? Does speaking
over it actually interrupt playback promptly?

## Architecture quick reference

- **State:** Context + `useReducer`, one slice reducer per domain, combined in `src/context/`. No Redux/Zustand/TanStack Query.
- **Navigation:** Expo Router with a drawer (`src/app/_layout.tsx`), ChatGPT-style conversation list in the drawer (`src/components/organisms/DrawerContent.tsx`).
- **API:** Google Gemini, called directly from the client — no backend. Text/streaming/transcription/TTS in `src/services/api/gemini.ts` + `apiConfig.ts`; realtime voice in `src/services/api/geminiLive.ts`.
- **Persistence:** `expo-sqlite` for conversations/messages (`src/services/db/`), `expo-secure-store` for the API key (`src/services/storage/secureConfig.ts`).
- **Feature folders:** `src/features/{chat,history,attachments,voice,settings}` — hooks + screens per domain.
- **Components:** atomic design under `src/components/{atoms,molecules,organisms,templates}`.

## Known limitations (by design, not bugs)

- DOCX extraction is a lightweight pure-JS XML-text extractor (`src/services/documents/docxExtract.ts`) — no tables/images/formatting fidelity.
- The Gemini API key lives client-side; see README's "API key security" section before distributing this to anyone besides yourself.

## Local sign-in / sign-up / profile (added 2026-10-17)

A device-local account layer — there's no backend, so "sign up" registers a
profile in `@react-native-async-storage/async-storage` and "sign in" checks
against it. Not a real multi-device auth system; passwords are stored as
plain strings in AsyncStorage (documented in a comment in
`authStorage.ts` — there's no server to protect credentials in transit
anyway, so a hashing library would be security theater here, not real
protection). Good enough for a personal single-device profile.

Files: `src/services/storage/authStorage.ts` (AsyncStorage read/write),
`src/context/reducers/authReducer.ts` + the `auth` slice in `rootReducer.ts`,
`src/features/auth/` (`useAuth` hook, `SignInScreen`/`SignUpScreen`/`ProfileScreen`),
routes at `src/app/{signin,signup,profile}.tsx`, new `Avatar` atom
(`src/components/atoms/Avatar.tsx`, image or initials fallback). Entry point
is the drawer's bottom row in `DrawerContent.tsx` — shows "Sign in" when
logged out, avatar + name when logged in, linking to `/signin` or `/profile`
respectively. **The rest of the app is not gated behind login** — chat works
fully without signing in; this is an additive profile feature, not an auth wall.

Fully verified live this session: sign up (with name/email/password + an
optional gallery-picked avatar, copied to permanent storage) → account
persisted + auto-signed-in → drawer updates to show avatar+name → sign out →
sign in again with the same credentials validates correctly against the
stored registry → session survives a full app force-stop/relaunch (hydrates
from AsyncStorage on boot via `useAuth`'s effect). Not yet tested: a second
account (to confirm "already exists" / wrong-password rejection), and the
avatar picker's "allowsEditing" crop step on a real selected photo.

## What's verified vs. not (this session, real device/emulator, real network)

Verified live, with a working internet connection and valid API key:
- Text chat: send → stream → render, including the SSE bug fix above
- TTS playback on assistant replies (confirmed via Android's real media session lifecycle)
- Live voice (Phase 6): WebSocket connect, mic permission + capture start, "Listening…" state, clean end-call teardown
- Local sign-up/sign-in/sign-out/profile/session-persistence (see section above)

**Not yet verified live** (not blocked by anything known — just not gotten to):
- Camera capture / image understanding
- Document upload / document Q&A
- Phase 5 voice recording → transcription (was blocked by the RECORD_AUDIO bug the whole time; bug is now fixed but the flow itself hasn't been re-tested)
- Phase 6's actual spoken round-trip (model audio reply + playback + interrupt) — needs a real device, see above
- Custom app icon/splash rendering as an installed app icon (splash *screen* behavior is fixed and was visually confirmed; the home-screen *icon* specifically wasn't re-checked this session)

## Windows native build — now working, here's how

`npx expo run:android` **works** from `C:\a` (see "Working copy location").
Root cause of the original failure, fully diagnosed this session:

Windows' general `MAX_PATH` (260 char) limit is part of it, but the harder
constraint turned out to be **`ninja.exe`'s own hardcoded 260-character
buffer** for a relative path string it constructs internally (independent of
the OS-level long-paths setting). This means the fix isn't just "put the
project at a merely shortish path" — `C:\dev\omnichat-ai` (20 chars) still
failed on `react-native-gesture-handler`'s codegen output (base relative
path alone was 267 chars, over budget before the project-root portion is
even counted favorably). `C:\a` (4 chars) has enough margin for every
dependency currently in `package.json`; if you add more native deps with
deeply-nested codegen output, re-check this.

Things tried and ruled out before landing on the short-path fix:
- `HKLM\SYSTEM\CurrentControlSet\Control\FileSystem\LongPathsEnabled = 1` — doesn't help; ninja.exe isn't manifested as long-path-aware, so it ignores the OS flag.
- `subst` to a short drive letter — gets further but hits other failures.
- Directory junctions (`mklink /J`) to a short path — not reliable here either; Node/the native toolchain can resolve back through the junction to the real (long) path in ways that defeat the purpose.
- **What worked:** an actual file copy to a genuinely short path (`C:\a`), with `node_modules`/`android` regenerated fresh there (not copied) — see "Working copy location".

Also important: whenever you add a new native dependency (anything requiring
`npx expo install` + a config plugin), **delete `android/` and let
`expo run:android` regenerate it from scratch** rather than relying on an
incremental rebuild — twice this session an incremental build failed with
missing-header / stale-config errors that a full regeneration fixed
immediately. Gradle's "up-to-date" caching does not reliably pick up a
newly-added native module's autolinking requirements.

## Picking this up from here

1. Decide what to do about the two-location (`Desktop` vs `C:\a`) split — see "Working copy location" above.
2. Get a real Android (or iOS) device for the rest of the golden-path testing — camera, documents, voice recording, and especially Phase 6's actual voice round-trip all need real mic/camera input the emulator can't provide.
3. Before any real store submission: see README's "Before you publish" section — `android.package`/`ios.bundleIdentifier` are still placeholder `com.anonymous.omnichatai` values and must be changed to something you actually own.
4. No git remote is configured yet — set one up if you want this to sync normally across machines going forward, rather than manual copying.
