type Row = { id: string; title: string; started_at: string; duration_ms: number; audio_path: string };
const rows: Row[] = [];
const executed: string[] = [];

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => ({
    execAsync: async (sql: string) => { executed.push(sql); },
    runAsync: async (_sql: string, ...params: (string | number)[]) => {
      const [id, title, started_at, duration_ms, audio_path] = params as [string, string, string, number, string];
      rows.push({ id, title, started_at, duration_ms, audio_path });
      return { changes: 1, lastInsertRowId: rows.length };
    },
    getAllAsync: async () => [...rows].sort((a, b) => (a.started_at < b.started_at ? 1 : -1)),
  })),
}));

import { insertMeeting, listMeetings } from '../db';

describe('db', () => {
  it('creates the meetings table on first open', async () => {
    await listMeetings();
    expect(executed.join('\n')).toMatch(/CREATE TABLE IF NOT EXISTS meetings/);
  });

  it('inserts a meeting and lists newest first', async () => {
    await insertMeeting({ id: 'a', title: 'DirtArmy sprint review', startedAt: new Date('2026-10-06T10:00:00Z'), durationMs: 72 * 60_000, audioPath: 'file:///documents/meetings/a.m4a' });
    await insertMeeting({ id: 'b', title: 'Raslaw weekly sync', startedAt: new Date('2026-10-07T07:02:00Z'), durationMs: 5000, audioPath: 'file:///documents/meetings/b.m4a' });
    const list = await listMeetings();
    expect(list.map((m) => m.title)).toEqual(['Raslaw weekly sync', 'DirtArmy sprint review']);
    expect(list[0]).toEqual({ id: 'b', title: 'Raslaw weekly sync', startedAt: new Date('2026-10-07T07:02:00Z'), durationMs: 5000, audioPath: 'file:///documents/meetings/b.m4a' });
  });
});
