import { formatFeedEventTime, parseFeedEventTime } from './feed-time.util';

describe('feed-time.util', () => {
  it('parses ISO timestamps with timezone', () => {
    const parsed = parseFeedEventTime('2026-03-01T20:28:48.000Z');

    expect(parsed).not.toBeNull();
    expect(parsed?.toISOString()).toBe('2026-03-01T20:28:48.000Z');
  });

  it('parses legacy timestamps as UTC', () => {
    const parsed = parseFeedEventTime('2026-03-01 20:28:48.000');

    expect(parsed).not.toBeNull();
    expect(parsed?.toISOString()).toBe('2026-03-01T20:28:48.000Z');
  });

  it('returns null for invalid values', () => {
    const parsed = parseFeedEventTime('not-a-timestamp');

    expect(parsed).toBeNull();
  });

  it('formats parsed timestamps in HH:mm, dd/MM/yyyy', () => {
    const parsed = parseFeedEventTime('2026-03-01T20:28:48.000Z');

    expect(formatFeedEventTime(parsed)).toBe('20:28, 01/03/2026');
  });

  it('returns fallback text for missing timestamps', () => {
    expect(formatFeedEventTime(null)).toBe('Unknown time');
  });
});
