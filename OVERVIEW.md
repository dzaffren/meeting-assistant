# Meeting Assistant

**Status:** Active · **Updated:** 2026-10-07 by /ship walking-skeleton

A phone app that records a meeting quietly and, afterwards, gives a summary, the decisions made, and the things to do.
Used by one person, Dzafran, in Teams, Zoom, Meet and in-room meetings.

## Run it

| Task    | Command        |
| ------- | -------------- |
| install | `pnpm install` |
| run     | `pnpm start`, then scan the QR code with Expo Go on the iPhone |
| test    | `pnpm test` |
| lint    | `pnpm typecheck` |
| e2e     | `pnpm e2e` with Maestro and an Android emulator, or EAS Workflows on a PR |

## Where things are

- `app/` — the one Expo Router route and layout
- `src/` — reducer, recorder, storage, database, screens, theme (generated)
- `scripts/tokens-to-ts.mjs` — mirrors the design tokens into `src/theme.ts`
- `.maestro/` — the e2e flow · `.eas/workflows/` — EAS runs it on PRs
- `docs/specs/` — shape doc and slice specs
- `docs/design/` — design brief, design system, screen previews

## Slices

| Slice            | Status | What it does                                              | Page |
| ---------------- | ------ | --------------------------------------------------------- | ---- |
| walking-skeleton | Shipped | tap record, name the meeting, record, stop, save or discard, see it in the list | none, Markdown only |

## More

README.md · docs/ARCHITECTURE.md · DECISIONS.md · CHANGELOG.md
