jest.mock('expo-audio', () => ({
  AudioModule: { requestRecordingPermissionsAsync: jest.fn() },
  RecordingPresets: { HIGH_QUALITY: {} },
  setAudioModeAsync: jest.fn(),
  useAudioRecorder: jest.fn(),
}));
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
jest.mock('expo-file-system', () => ({
  Paths: { document: { uri: 'file:///documents/' }, cache: { uri: 'file:///cache/' } },
  File: jest.fn(),
  Directory: jest.fn(),
}));
