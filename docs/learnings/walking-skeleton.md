# Lessons from walking-skeleton

- Check the weekday before writing a date into a scenario. The spec said
  "Tue 7 Oct 2026"; it is a Wednesday. Compute it, never type it.
- `check-design-drift.sh` reads tokens only from a file named `tokens*.css`.
  Split token files are invisible to it. Keep one `tokens.css`.
- A generated `src/theme.ts` holds raw hex by design; exclude it from the
  drift check and gate it in CI with `pnpm tokens && git diff --exit-code`.
- Jest's `jest.mock` factory may only reference variables prefixed `mock`.
- Expo Router routes are a poor fit for a flow whose recorder hook must stay
  mounted. One route plus a reducer-driven screen switch is simpler.
- `check-open-items.sh` with no argument waits on stdin (hook mode). Always
  pass the spec path, or wrap it in `timeout`.
