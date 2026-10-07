import { File } from 'expo-file-system';
import { useEffect, useReducer, useRef, useState } from 'react';
import { initial, reduce } from '../src/machine';
import { useRecorder } from '../src/recorder';
import { insertMeeting, listMeetings, type Meeting } from '../src/db';
import { moveToMeetings } from '../src/storage';
import { ListScreen } from '../src/screens/ListScreen';
import { NamePrompt } from '../src/screens/NamePrompt';
import { NoMic } from '../src/screens/NoMic';
import { RecordingScreen } from '../src/screens/RecordingScreen';
import { SavedScreen } from '../src/screens/SavedScreen';

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function Index() {
  const [state, dispatch] = useReducer(reduce, initial);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const recorder = useRecorder();

  const refresh = () => listMeetings().then(setMeetings);
  useEffect(() => { refresh(); }, []);

  // One async action at a time. The screens disable their buttons while
  // `busy`, and the ref stops a second tap that lands before the re-render.
  async function run(action: () => Promise<void>, failure: string) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      console.warn(failure, e);
      setError(failure);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  function confirmName(title: string) {
    void run(async () => {
      const micGranted = await recorder.start();
      dispatch({ type: 'confirmName', title, micGranted, now: Date.now() });
    }, "Couldn't start recording. Try again.");
  }

  function stopAndSave() {
    if (state.kind !== 'stopSheet') return;
    const { title, startedAt } = state;
    void run(async () => {
      const { uri, durationMs } = await recorder.stop(startedAt);
      const id = newId();
      const audioPath = await moveToMeetings(uri, id);
      await insertMeeting({ id, title, startedAt: new Date(startedAt), durationMs, audioPath });
      console.log('meeting saved', { id, durationMs, bytes: new File(audioPath).size });
      dispatch({ type: 'stopAndSave', now: startedAt + durationMs });
      refresh();
    }, "Couldn't save. The audio is still on the phone.");
  }

  function confirmDiscard() {
    void run(async () => {
      await recorder.discard();
      dispatch({ type: 'confirmDiscard' });
    }, "Couldn't discard. Try again.");
  }

  switch (state.kind) {
    case 'idle':
      return <ListScreen meetings={meetings} onRecord={() => dispatch({ type: 'tapRecord' })} />;
    case 'naming':
      return <NamePrompt busy={busy} error={error} onConfirm={confirmName} onCancel={() => dispatch({ type: 'back' })} />;
    case 'noMic':
      return <NoMic onBack={() => dispatch({ type: 'back' })} />;
    case 'recording':
    case 'stopSheet':
    case 'discardConfirm':
      return (
        <RecordingScreen
          state={state}
          busy={busy}
          error={error}
          onStop={() => dispatch({ type: 'tapStop' })}
          onKeep={() => dispatch({ type: 'keepRecording' })}
          onSave={stopAndSave}
          onDiscard={() => dispatch({ type: 'tapDiscard', now: Date.now() })}
          onCancelDiscard={() => dispatch({ type: 'back' })}
          onConfirmDiscard={confirmDiscard}
        />
      );
    case 'saved':
      return <SavedScreen title={state.title} durationMs={state.durationMs} onDone={() => dispatch({ type: 'done' })} />;
  }
}
