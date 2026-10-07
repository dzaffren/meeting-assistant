import { Directory, File, Paths } from 'expo-file-system';

function meetingsDir(): Directory {
  const dir = new Directory(Paths.document, 'meetings');
  if (!dir.exists) dir.create();
  return dir;
}

export async function moveToMeetings(uri: string, id: string): Promise<string> {
  const dest = new File(meetingsDir(), `${id}.m4a`);
  await new File(uri).move(dest);
  return dest.uri;
}

export function deleteRecording(uri: string): void {
  const file = new File(uri);
  if (file.exists) file.delete();
}
