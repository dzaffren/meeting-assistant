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
