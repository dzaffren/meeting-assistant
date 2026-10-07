const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const two = (n: number) => String(n).padStart(2, '0');

export function autoName(date: Date): string {
  return `Meeting, ${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]} ${two(date.getHours())}:${two(date.getMinutes())}`;
}

export function formatDuration(ms: number): string {
  const seconds = Math.max(1, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function formatDay(date: Date, today: Date): string {
  const sameDay = date.toDateString() === today.toDateString();
  if (sameDay) return 'Today';
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}
