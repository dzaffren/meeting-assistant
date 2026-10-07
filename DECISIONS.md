# Decisions

Append-only. A changed decision is a new entry that supersedes the old one; only an
old entry's Status line ever changes.

## D1 · 2026-10-07 · Dark only, black surfaces, system font, sky-blue accent, red and a breathing aurora for recording

Why: the brief asks for quiet, trustworthy and readable, never busy or corporate.
Dark only because the user prefers it and meetings are often in dim rooms. A system
font loads instantly on both platforms. One accent keeps the screen quiet. Red and
the breathing aurora are reserved for the recording state, the one signal that must
never be mistaken, and while recording they are the only things on screen. The
structure follows Gemini Live (black, title top, aurora low, round controls at the
bottom); the surface is our own.
Rejected: a light mode (user chose dark only, O8); a webfont such as Inter (a
download to maintain, reads generated); a muted teal accent (user asked for blue);
warm paper neutrals (clashed with a blue accent); a waveform as the listening signal
(busy); a timer on the recording screen (user asked for less on screen); white text
on the blue accent (2.5:1, fails AA).
Source: docs/design/system-brief.md
Status: active

## D2 · 2026-10-07 · Expo (React Native) with TypeScript

Why: one codebase for Android and iPhone, runs on a real iPhone through Expo Go
without a Mac, and expo-audio is the best-documented recording path. Dzafran
delegated the choice.
Rejected: Flutter (smaller audio ecosystem, a new language for no gain); Kotlin
Multiplatform (iOS side immature); two native apps (double the work for one user).
Source: docs/specs/walking-skeleton.md
Status: active

## D3 · 2026-10-07 · Everything on the phone: SQLite rows, audio files in the sandbox, no server

Why: slice 0 has one user and no sharing. A server adds hosting, auth and a
network failure mode to a skeleton whose job is to prove recording works.
Rejected: a hosted database (nothing to sync yet); a JSON file for the list
(no transactions, hand-rolled locking); storing audio in the database (files of
up to 60 MB belong on disk).
Source: docs/specs/walking-skeleton.md
Status: active

## D4 · 2026-10-07 · GitHub Actions for typecheck and unit tests, EAS Workflows for the Maestro e2e

Why: unit tests need no emulator and run free on GitHub. The e2e needs an Android
emulator, which Expo's documented EAS Workflows provide in the cloud.
Rejected: Android emulator on GitHub's free runners (nested virtualisation is
unreliable there and an APK build adds 10+ min per run); iOS simulator on CI
(paid macOS minutes).
Source: docs/specs/walking-skeleton.md
Status: active

## D5 · 2026-10-07 · Maestro for the e2e, pnpm for packages

Why: Maestro drives the built app from YAML and is what EAS Workflows run; pnpm
is fast and refuses to install against a stale lockfile.
Rejected: Detox (needs a native build toolchain on the runner and gray-box
hooks in the app); npm (slower, looser lockfile).
Source: docs/specs/walking-skeleton.md
Status: active
