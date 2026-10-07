import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

const mockRecorder = { start: jest.fn(), stop: jest.fn(), discard: jest.fn() };
const mockMove = jest.fn();
const mockInsert = jest.fn();
const mockList = jest.fn(async () => []);

jest.mock('../recorder', () => ({ useRecorder: () => mockRecorder }));
jest.mock('../storage', () => ({ moveToMeetings: (...a: unknown[]) => mockMove(...a) }));
jest.mock('../db', () => ({ insertMeeting: (...a: unknown[]) => mockInsert(...a), listMeetings: () => mockList() }));
jest.mock('expo-file-system', () => ({ File: class { size = 1234; } }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: () => null }));
jest.mock('expo-linking', () => ({ openSettings: jest.fn() }));

import Index from '../../app/index';

const deferred = <T,>() => {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};

async function startRecording(title = 'Raslaw weekly sync') {
  mockRecorder.start.mockResolvedValue(true);
  await fireEvent.press(screen.getByTestId('record'));
  await fireEvent.changeText(screen.getByTestId('meeting-name'), title);
  await fireEvent.press(screen.getByTestId('start-recording'));
  await waitFor(() => screen.getByTestId('screen-recording'));
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  mockList.mockResolvedValue([]);
});

describe('record and save', () => {
  it('moves the file, inserts one row and shows Saved', async () => {
    await render(<Index />);
    await startRecording();
    mockRecorder.stop.mockResolvedValue({ uri: 'file:///cache/rec.m4a', durationMs: 5000 });
    mockMove.mockResolvedValue('file:///documents/meetings/x.m4a');
    mockInsert.mockResolvedValue(undefined);

    await fireEvent.press(screen.getByTestId('stop'));
    await fireEvent.press(screen.getByTestId('stop-and-save'));

    await waitFor(() => screen.getByTestId('screen-saved'));
    expect(mockMove).toHaveBeenCalledWith('file:///cache/rec.m4a', expect.any(String));
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ title: 'Raslaw weekly sync', durationMs: 5000, audioPath: 'file:///documents/meetings/x.m4a' }));
    expect(screen.getByText('Raslaw weekly sync · 5 s')).toBeTruthy();
  });

  it('ignores a second tap while the save is in flight', async () => {
    await render(<Index />);
    await startRecording();
    const stop = deferred<{ uri: string; durationMs: number }>();
    mockRecorder.stop.mockReturnValue(stop.promise);
    mockMove.mockResolvedValue('file:///documents/meetings/x.m4a');
    mockInsert.mockResolvedValue(undefined);

    await fireEvent.press(screen.getByTestId('stop'));
    await fireEvent.press(screen.getByTestId('stop-and-save'));
    await fireEvent.press(screen.getByTestId('stop-and-save'));
    await fireEvent.press(screen.getByTestId('keep-recording'));
    await fireEvent.press(screen.getByTestId('discard'));
    expect(mockRecorder.stop).toHaveBeenCalledTimes(1);
    expect(mockRecorder.discard).not.toHaveBeenCalled();

    await act(async () => { stop.resolve({ uri: 'file:///cache/rec.m4a', durationMs: 3000 }); });
    await waitFor(() => screen.getByTestId('screen-saved'));
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it('shows an error and stays on the sheet when the save fails', async () => {
    await render(<Index />);
    await startRecording();
    mockRecorder.stop.mockResolvedValue({ uri: 'file:///cache/rec.m4a', durationMs: 5000 });
    mockMove.mockResolvedValue('file:///documents/meetings/x.m4a');
    mockInsert.mockRejectedValue(new Error('SQLITE_FULL'));

    await fireEvent.press(screen.getByTestId('stop'));
    await fireEvent.press(screen.getByTestId('stop-and-save'));

    await waitFor(() => screen.getByTestId('error'));
    expect(screen.getByText("Couldn't save. The audio is still on the phone.")).toBeTruthy();
    expect(screen.queryByTestId('screen-saved')).toBeNull();
  });
});

describe('discard', () => {
  it('stops the recorder, writes no row and returns to the list', async () => {
    await render(<Index />);
    await startRecording('Portfolio feedback with Sam');
    mockRecorder.discard.mockResolvedValue(undefined);

    await fireEvent.press(screen.getByTestId('stop'));
    await fireEvent.press(screen.getByTestId('discard'));
    expect(screen.getByText(/Discard .* of audio\?/)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('confirm-discard'));

    await waitFor(() => screen.getByTestId('screen-list'));
    expect(mockRecorder.discard).toHaveBeenCalledTimes(1);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockMove).not.toHaveBeenCalled();
  });
});

describe('name prompt', () => {
  it('keeps Cancel disabled while the recorder starts, then records', async () => {
    await render(<Index />);
    const start = deferred<boolean>();
    mockRecorder.start.mockReturnValue(start.promise);
    await fireEvent.press(screen.getByTestId('record'));
    await fireEvent.press(screen.getByTestId('start-recording'));
    await fireEvent.press(screen.getByText('Cancel'));
    expect(screen.getByTestId('screen-name')).toBeTruthy();

    await act(async () => { start.resolve(true); });
    await waitFor(() => screen.getByTestId('screen-recording'));
  });

  it('shows the permission screen when the mic is refused', async () => {
    await render(<Index />);
    mockRecorder.start.mockResolvedValue(false);
    await fireEvent.press(screen.getByTestId('record'));
    await fireEvent.press(screen.getByTestId('start-recording'));
    await waitFor(() => screen.getByTestId('screen-nomic'));
    expect(screen.getByText('Meeting Assistant needs the microphone to record.')).toBeTruthy();
  });

  it('re-enables the form with a message when the recorder fails to start', async () => {
    await render(<Index />);
    mockRecorder.start.mockRejectedValue(new Error('Failed to configure audio session'));
    await fireEvent.press(screen.getByTestId('record'));
    await fireEvent.press(screen.getByTestId('start-recording'));
    await waitFor(() => screen.getByTestId('error'));
    expect(screen.getByText("Couldn't start recording. Try again.")).toBeTruthy();
    mockRecorder.start.mockResolvedValue(true);
    await fireEvent.press(screen.getByTestId('start-recording'));
    await waitFor(() => screen.getByTestId('screen-recording'));
  });
});
