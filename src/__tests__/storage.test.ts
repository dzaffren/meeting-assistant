const mockFiles = new Map<string, boolean>();
const mockDirs = new Set<string>(['file:///documents/']);
const mockMoved: string[][] = [];

jest.mock('expo-file-system', () => {
  class Directory {
    uri: string;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts.map((p) => (typeof p === 'string' ? p : p.uri)).join('/').replace(/\/+/g, '/').replace(':/', ':///') + '/';
    }
    get exists() { return mockDirs.has(this.uri); }
    create() { mockDirs.add(this.uri); }
  }
  class File {
    uri: string;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts.map((p) => (typeof p === 'string' ? p : p.uri)).join('/').replace(/\/+/g, '/').replace(':/', ':///').replace(/\/$/, '');
    }
    get exists() { return mockFiles.get(this.uri) === true; }
    async move(dest: File) { mockMoved.push([this.uri, dest.uri]); mockFiles.delete(this.uri); mockFiles.set(dest.uri, true); }
    delete() { mockFiles.delete(this.uri); }
  }
  return { Directory, File, Paths: { document: { uri: 'file:///documents' } } };
});

import { deleteRecording, moveToMeetings } from '../storage';

beforeEach(() => { mockFiles.clear(); mockMoved.length = 0; });

describe('moveToMeetings', () => {
  it('creates the meetings folder and moves the cache file under the meeting id', async () => {
    mockFiles.set('file:///cache/rec.m4a', true);
    const dest = await moveToMeetings('file:///cache/rec.m4a', 'abc');
    expect(dest).toBe('file:///documents/meetings/abc.m4a');
    expect(mockDirs.has('file:///documents/meetings/')).toBe(true);
    expect(mockMoved).toEqual([['file:///cache/rec.m4a', 'file:///documents/meetings/abc.m4a']]);
    expect(mockFiles.has('file:///cache/rec.m4a')).toBe(false);
  });
});

describe('deleteRecording', () => {
  it('removes the file and tolerates a missing one', () => {
    mockFiles.set('file:///cache/rec.m4a', true);
    deleteRecording('file:///cache/rec.m4a');
    expect(mockFiles.has('file:///cache/rec.m4a')).toBe(false);
    expect(() => deleteRecording('file:///cache/gone.m4a')).not.toThrow();
  });
});
