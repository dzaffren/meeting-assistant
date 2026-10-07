import { initial, reduce, type State } from '../machine';

const recording: State = { kind: 'recording', title: 'Raslaw weekly sync', startedAt: 1000 };

describe('machine', () => {
  it('starts idle', () => expect(initial).toEqual({ kind: 'idle' }));

  it('tap record opens the name prompt', () => {
    expect(reduce(initial, { type: 'tapRecord' })).toEqual({ kind: 'naming' });
  });

  it('confirm with a name and the mic starts recording', () => {
    expect(reduce({ kind: 'naming' }, { type: 'confirmName', title: 'Raslaw weekly sync', micGranted: true, now: 1000 })).toEqual(recording);
  });

  it('confirm with a blank name auto-names it', () => {
    const s = reduce({ kind: 'naming' }, { type: 'confirmName', title: '   ', micGranted: true, now: new Date(2026, 9, 7, 15, 2).getTime() });
    expect(s).toEqual({ kind: 'recording', title: 'Meeting, Wed 7 Oct 15:02', startedAt: new Date(2026, 9, 7, 15, 2).getTime() });
  });

  it('confirm without the mic goes to the permission screen, not recording', () => {
    expect(reduce({ kind: 'naming' }, { type: 'confirmName', title: 'x', micGranted: false, now: 1 })).toEqual({ kind: 'noMic' });
    expect(reduce({ kind: 'noMic' }, { type: 'back' })).toEqual({ kind: 'idle' });
  });

  it('cancel from the name prompt returns to idle', () => {
    expect(reduce({ kind: 'naming' }, { type: 'back' })).toEqual({ kind: 'idle' });
  });

  it('stop opens the sheet and keep recording closes it', () => {
    const sheet = reduce(recording, { type: 'tapStop' });
    expect(sheet).toEqual({ ...recording, kind: 'stopSheet' });
    expect(reduce(sheet, { type: 'keepRecording' })).toEqual(recording);
  });

  it('stop and save moves to saved with the duration', () => {
    const sheet = reduce(recording, { type: 'tapStop' });
    expect(reduce(sheet, { type: 'stopAndSave', now: 6000 })).toEqual({ kind: 'saved', title: 'Raslaw weekly sync', durationMs: 5000 });
    expect(reduce({ kind: 'saved', title: 'x', durationMs: 1 }, { type: 'done' })).toEqual({ kind: 'idle' });
  });

  it('discard asks for a confirm, cancel returns to the sheet, confirm returns to idle', () => {
    const sheet = reduce(recording, { type: 'tapStop' });
    const confirm = reduce(sheet, { type: 'tapDiscard', now: 9000 });
    expect(confirm).toEqual({ ...recording, kind: 'discardConfirm', durationMs: 8000 });
    expect(reduce(confirm, { type: 'back' })).toEqual(sheet);
    expect(reduce(confirm, { type: 'confirmDiscard' })).toEqual({ kind: 'idle' });
  });

  it('ignores events that do not apply to the state', () => {
    expect(reduce(initial, { type: 'tapStop' })).toEqual(initial);
    expect(reduce(recording, { type: 'tapRecord' })).toEqual(recording);
  });
});
