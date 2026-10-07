import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import { deleteRecording } from './storage';

export type Stopped = { uri: string; durationMs: number };

// One recorder for the whole session. Mount it once, above every screen.
export function useRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  async function start(): Promise<boolean> {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) return false;
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    return true;
  }

  async function stop(startedAt: number): Promise<Stopped> {
    const reported = recorder.getStatus().durationMillis;
    await recorder.stop();
    const uri = recorder.uri;
    if (!uri) throw new Error('recorder stopped without a file');
    return { uri, durationMs: reported > 0 ? reported : Date.now() - startedAt };
  }

  async function discard(): Promise<void> {
    await recorder.stop();
    if (recorder.uri) deleteRecording(recorder.uri);
  }

  return { start, stop, discard };
}
