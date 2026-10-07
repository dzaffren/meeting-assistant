import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

export type Meeting = {
  id: string;
  title: string;
  startedAt: Date;
  durationMs: number;
  audioPath: string;
};

type Row = { id: string; title: string; started_at: string; duration_ms: number; audio_path: string };

let db: Promise<SQLiteDatabase> | undefined;

function getDb(): Promise<SQLiteDatabase> {
  db ??= openDatabaseAsync('meetings.db').then(async (d) => {
    await d.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        started_at TEXT NOT NULL,
        duration_ms INTEGER NOT NULL,
        audio_path TEXT NOT NULL
      );
      PRAGMA user_version = 1;
    `);
    return d;
  });
  return db;
}

export async function insertMeeting(m: Meeting): Promise<void> {
  const d = await getDb();
  await d.runAsync(
    'INSERT INTO meetings (id, title, started_at, duration_ms, audio_path) VALUES (?, ?, ?, ?, ?)',
    m.id, m.title, m.startedAt.toISOString(), m.durationMs, m.audioPath,
  );
}

export async function listMeetings(): Promise<Meeting[]> {
  const d = await getDb();
  const rows = await d.getAllAsync<Row>('SELECT * FROM meetings ORDER BY started_at DESC');
  return rows.map((r) => ({ id: r.id, title: r.title, startedAt: new Date(r.started_at), durationMs: r.duration_ms, audioPath: r.audio_path }));
}
