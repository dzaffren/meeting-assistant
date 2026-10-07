import { useEffect, useReducer, useState } from 'react';
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
  const recorder = useRecorder();

  const refresh = () => listMeetings().then(setMeetings);
  useEffect(() => { refresh(); }, []);

  async function confirmName(title: string) {
    const micGranted = await recorder.start();
    dispatch({ type: 'confirmName', title, micGranted, now: Date.now() });
  }

  async function stopAndSave() {
    if (state.kind !== 'stopSheet') return;
    const { uri, durationMs } = await recorder.stop(state.startedAt);
    const id = newId();
    const audioPath = await moveToMeetings(uri, id);
    await insertMeeting({ id, title: state.title, startedAt: new Date(state.startedAt), durationMs, audioPath });
    console.log('meeting saved', { id, durationMs });
    dispatch({ type: 'stopAndSave', now: state.startedAt + durationMs });
    refresh();
  }

  async function confirmDiscard() {
    await recorder.discard();
    dispatch({ type: 'confirmDiscard' });
  }

  switch (state.kind) {
    case 'idle':
      return <ListScreen meetings={meetings} onRecord={() => dispatch({ type: 'tapRecord' })} />;
    case 'naming':
      return <NamePrompt onConfirm={confirmName} onCancel={() => dispatch({ type: 'back' })} />;
    case 'noMic':
      return <NoMic onBack={() => dispatch({ type: 'back' })} />;
    case 'recording':
    case 'stopSheet':
    case 'discardConfirm':
      return (
        <RecordingScreen
          state={state}
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
