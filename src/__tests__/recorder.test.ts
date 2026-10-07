import { renderHook } from '@testing-library/react-native';

type Status = { durationMillis: number };
const mockRecorder: {
  uri: string | null;
  status: Status;
  prepareToRecordAsync: jest.Mock<Promise<void>, []>;
  record: jest.Mock;
  stop: jest.Mock<Promise<void>, []>;
  getStatus: jest.Mock<Status, []>;
} = {
  uri: null,
  status: { durationMillis: 0 },
  prepareToRecordAsync: jest.fn(async () => {}),
  record: jest.fn(),
  stop: jest.fn(async () => {}),
  getStatus: jest.fn((): Status => mockRecorder.status),
};
const mockPermission = jest.fn<Promise<{ granted: boolean }>, []>(async () => ({ granted: true }));
const mockSetMode = jest.fn<Promise<void>, [unknown]>(async () => {});
const mockDelete = jest.fn<void, [string]>();

jest.mock('expo-audio', () => ({
  RecordingPresets: { HIGH_QUALITY: {} },
  requestRecordingPermissionsAsync: () => mockPermission(),
  setAudioModeAsync: (m: unknown) => mockSetMode(m),
  useAudioRecorder: () => mockRecorder,
}));
jest.mock('../storage', () => ({ deleteRecording: (uri: string) => mockDelete(uri) }));

import { useRecorder } from '../recorder';

beforeEach(() => {
  jest.clearAllMocks();
  mockRecorder.uri = null;
  mockRecorder.status = { durationMillis: 0 };
  mockPermission.mockResolvedValue({ granted: true });
});

describe('useRecorder', () => {
  it('start asks for the mic, sets the audio mode, prepares and records', async () => {
    const { result } = await renderHook(() => useRecorder());
    await expect(result.current.start()).resolves.toBe(true);
    expect(mockSetMode).toHaveBeenCalledWith({ allowsRecording: true, playsInSilentMode: true });
    expect(mockRecorder.prepareToRecordAsync).toHaveBeenCalled();
    expect(mockRecorder.record).toHaveBeenCalled();
  });

  it('start returns false and records nothing when the mic is refused', async () => {
    mockPermission.mockResolvedValue({ granted: false });
    const { result } = await renderHook(() => useRecorder());
    await expect(result.current.start()).resolves.toBe(false);
    expect(mockSetMode).not.toHaveBeenCalled();
    expect(mockRecorder.record).not.toHaveBeenCalled();
  });

  it('stop returns the file and the reported duration', async () => {
    mockRecorder.uri = 'file:///cache/rec.m4a';
    mockRecorder.status = { durationMillis: 5200 };
    const { result } = await renderHook(() => useRecorder());
    await expect(result.current.stop(Date.now() - 99_000)).resolves.toEqual({ uri: 'file:///cache/rec.m4a', durationMs: 5200 });
  });

  it('stop falls back to the wall clock when the recorder reports no duration', async () => {
    mockRecorder.uri = 'file:///cache/rec.m4a';
    const { result } = await renderHook(() => useRecorder());
    const { durationMs } = await result.current.stop(Date.now() - 5000);
    expect(durationMs).toBeGreaterThanOrEqual(5000);
    expect(durationMs).toBeLessThan(6000);
  });

  it('stop throws when no file was written', async () => {
    const { result } = await renderHook(() => useRecorder());
    await expect(result.current.stop(Date.now())).rejects.toThrow('recorder stopped without a file');
  });

  it('discard stops and deletes the file', async () => {
    mockRecorder.uri = 'file:///cache/rec.m4a';
    const { result } = await renderHook(() => useRecorder());
    await result.current.discard();
    expect(mockRecorder.stop).toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalledWith('file:///cache/rec.m4a');
  });
});
