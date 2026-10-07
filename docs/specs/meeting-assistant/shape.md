# Meeting Assistant

**Project type:** Mobile app with UI, LLM-backed (greenfield) · **Status:** Shaped

## Problem

Dzafran sits in long meetings on Teams, Zoom, Meet and in rooms, loses
attention partway through, and leaves with no notes. About once a week, and
every time a follow-up comes due, the decisions and to-dos from the meeting
are gone and have to be recovered by asking colleagues or scrolling chat.

## Today

```
 meeting (Teams / Zoom / Meet / room)
        │
        │ talks for 60+ min
        ▼
   Dzafran ──── attention drops ────► no notes taken
        │
        │ a week later: "what did we agree?"
        ▼
   asks colleague / scrolls chat / finds out when it slips   ◄── the pain
```

Nothing is captured during the meeting. Recovery after the fact is manual
and often fails.

## Slices

Phone records quietly during the meeting. Everything happens after.

```
 [0] skeleton ──► [1] transcript ──► [2] summary + decisions + to-dos
  tap record,       read what         the three things
  file saved,       was said          Dzafran asked for
  on the phone
                                           │
                        ┌──────────────────┴──────────────┐
                        ▼                                 ▼
               [3] find an old meeting           [4] survive a long meeting
                   list + open any past              screen lock, background,
                   meeting's notes                   90 min without dying
```

Slice 3 and 4 both need slice 2 and are independent of each other.

| # | Slice | What ships | Why this order |
|---|-------|-----------|----------------|
| 0 | Walking skeleton | App on the real phone. Tap record, name the meeting, confirm, record (glow and stop only on screen), tap stop, confirm, saved. The file shows in a list. One e2e test, CI on push. | Empty repo. Proves the phone, the build, the mic permission and the deploy path before anything clever. |
| 1 | Read the transcript | After stop, the recording becomes text Dzafran can read on the phone. | First real value: "what was said" is never lost again, even before any AI summary. Also settles the transcription choice everything else sits on. |
| 2 | Summary, decisions, to-dos | Transcript becomes three short sections: summary, decisions made, things Dzafran has to do. | This is the thing asked for. Reading a 60 min transcript is not much better than not having one. |
| 3 | Find an old meeting | Past meetings listed by date and title, open any one and see its notes. | The pain is "a week later I need it". Slice 2 only shows the latest meeting. |
| 4 | Survive a long meeting | Recording keeps going with screen locked, app in background, for 90 min. | Dropped from slice 0 on purpose (scale). Phones kill background audio; this is its own problem. |

Slice 0 and 1 could merge if the transcription step turns out to be trivial.
Decide at `/spec`.

## Not doing

- Live notes or a nudge when your name is said. Dzafran chose "record quietly,
  read after" for the first version.
- Sharing notes with other people, calendar integration, a desktop app. Not
  asked for; the pain is personal recall.
- Who said what (speaker labels). Nice, costly, not needed for summary,
  decisions and to-dos. Can be a later slice.
- Editing the transcript or notes in the app. Read-only first.

## Open items

| ID | What | Type | Raised at | Owner | Status | Answer |
| -- | ---- | ---- | --------- | ----- | ------ | ------ |
| O1 | Which phone: Android or iPhone? Decides the whole stack and how slice 4 behaves. | question | shape | user | Resolved | Both. One cross-platform codebase, decided at /spec. |
| O2 | What languages are spoken in the meetings? English only, or Malay and English mixed? Decides which transcription model works. | question | shape | user | Open | — |
| O3 | Is Dzafran allowed to record these meetings (work policy, other people's consent)? Not a code question, but the app is useless if the answer is no. | flag | shape | user | Open | — |
| O4 | Assuming transcription runs in the cloud, not on the phone. Cheaper to build; costs money per meeting and sends work audio off the device. | assumption | shape | user | Open | — |
| O5 | Assuming a phone mic in a room, or next to a laptop speaker, gives audio clear enough to transcribe. Unproven. | unproven | shape | poc | Open | — |
| O6 | Assuming Dzafran is fine with work meeting audio stored on a personal phone and a third-party transcription service. | assumption | shape | user | Open | — |
| O8 | Dark only, no light mode. Craft floor asks for both. | flag | design-system | user | Accepted risk | Personal app, user prefers dark. 2026-10-07 |
