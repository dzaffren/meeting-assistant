import { autoName, formatDay, formatDuration } from '../name';

describe('autoName', () => {
  it('names a blank meeting by weekday, date and time', () => {
    expect(autoName(new Date(2026, 9, 7, 15, 2))).toBe('Meeting, Wed 7 Oct 15:02');
  });
  it('pads minutes', () => {
    expect(autoName(new Date(2026, 9, 7, 9, 5))).toBe('Meeting, Wed 7 Oct 09:05');
  });
});

describe('formatDuration', () => {
  it('shows seconds under a minute', () => expect(formatDuration(5_200)).toBe('5 s'));
  it('shows minutes under an hour', () => expect(formatDuration(48 * 60_000)).toBe('48 min'));
  it('shows hours and minutes', () => expect(formatDuration(72 * 60_000)).toBe('1 h 12 min'));
  it('shows whole hours without minutes', () => expect(formatDuration(60 * 60_000)).toBe('1 h'));
  it('never shows 0 s for a tiny recording', () => expect(formatDuration(300)).toBe('1 s'));
});

describe('formatDay', () => {
  const today = new Date(2026, 9, 7, 15, 2);
  it('says Today for the same day', () => expect(formatDay(new Date(2026, 9, 7, 9, 0), today)).toBe('Today'));
  it('shows weekday and date for an earlier day', () => expect(formatDay(new Date(2026, 9, 6, 9, 0), today)).toBe('Tue 6 Oct'));
});
