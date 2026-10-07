import { autoName } from './name';

type Live = { title: string; startedAt: number };

export type State =
  | { kind: 'idle' }
  | { kind: 'naming' }
  | { kind: 'noMic' }
  | ({ kind: 'recording' } & Live)
  | ({ kind: 'stopSheet' } & Live)
  | ({ kind: 'discardConfirm'; durationMs: number } & Live)
  | { kind: 'saved'; title: string; durationMs: number };

export type Event =
  | { type: 'tapRecord' }
  | { type: 'confirmName'; title: string; micGranted: boolean; now: number }
  | { type: 'back' }
  | { type: 'tapStop' }
  | { type: 'keepRecording' }
  | { type: 'stopAndSave'; now: number }
  | { type: 'tapDiscard'; now: number }
  | { type: 'confirmDiscard' }
  | { type: 'done' };

export const initial: State = { kind: 'idle' };

export function reduce(state: State, event: Event): State {
  switch (state.kind) {
    case 'idle':
      return event.type === 'tapRecord' ? { kind: 'naming' } : state;
    case 'naming':
      if (event.type === 'back') return initial;
      if (event.type !== 'confirmName') return state;
      if (!event.micGranted) return { kind: 'noMic' };
      return { kind: 'recording', title: event.title.trim() || autoName(new Date(event.now)), startedAt: event.now };
    case 'noMic':
      return event.type === 'back' ? initial : state;
    case 'recording':
      return event.type === 'tapStop' ? { ...state, kind: 'stopSheet' } : state;
    case 'stopSheet':
      if (event.type === 'keepRecording') return { ...state, kind: 'recording' };
      if (event.type === 'stopAndSave') return { kind: 'saved', title: state.title, durationMs: event.now - state.startedAt };
      if (event.type === 'tapDiscard') return { ...state, kind: 'discardConfirm', durationMs: event.now - state.startedAt };
      return state;
    case 'discardConfirm':
      if (event.type === 'back') return { kind: 'stopSheet', title: state.title, startedAt: state.startedAt };
      if (event.type === 'confirmDiscard') return initial;
      return state;
    case 'saved':
      return event.type === 'done' ? initial : state;
  }
}
