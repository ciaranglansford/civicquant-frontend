const LEGACY_SPACE_TIMESTAMP_REGEX =
  /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/;
const ISO_WITHOUT_TIMEZONE_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/;

export function parseFeedEventTime(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const legacyDate = parseUtcFromPattern(LEGACY_SPACE_TIMESTAMP_REGEX, trimmed);
  if (legacyDate) {
    return legacyDate;
  }

  const isoNoTimezoneDate = parseUtcFromPattern(ISO_WITHOUT_TIMEZONE_REGEX, trimmed);
  if (isoNoTimezoneDate) {
    return isoNoTimezoneDate;
  }

  const timestamp = Date.parse(trimmed);
  if (Number.isNaN(timestamp)) {
    return null;
  }

  return new Date(timestamp);
}

export function formatFeedEventTime(value: Date | null): string {
  if (!value) {
    return 'Unknown time';
  }

  const hh = value.getUTCHours().toString().padStart(2, '0');
  const mm = value.getUTCMinutes().toString().padStart(2, '0');
  const dd = value.getUTCDate().toString().padStart(2, '0');
  const month = (value.getUTCMonth() + 1).toString().padStart(2, '0');
  const yyyy = value.getUTCFullYear().toString();

  return `${hh}:${mm}, ${dd}/${month}/${yyyy}`;
}

function parseUtcFromPattern(pattern: RegExp, value: string): Date | null {
  const match = value.match(pattern);
  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second, millisecond = '0'] = match;
  const timestamp = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    Number(millisecond.padEnd(3, '0')),
  );

  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
