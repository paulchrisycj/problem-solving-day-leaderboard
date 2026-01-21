import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

// Hardcoded timezone for Malaysia (GMT+8)
const TIMEZONE = 'Asia/Kuala_Lumpur';

/**
 * Convert a Date to Malaysia timezone (GMT+8)
 */
export function toGMT8(date: Date): Date {
  return toZonedTime(date, TIMEZONE);
}

/**
 * Format a date in Malaysia timezone (GMT+8)
 */
export function formatGMT8(date: Date, formatStr: string): string {
  return formatInTimeZone(date, TIMEZONE, formatStr);
}

/**
 * Get current time in Malaysia timezone as ISO string
 */
export function getCurrentGMT8(): string {
  return formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

/**
 * Get current time in Malaysia timezone as ISO string (simplified format for storage)
 */
export function getCurrentGMT8ISO(): string {
  return formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss.SSS'+08:00'");
}

/**
 * Parse a datetime-local input value and convert to ISO string in GMT+8
 * Input format: "2024-01-15T14:30"
 */
export function datetimeLocalToGMT8ISO(datetimeLocal: string): string {
  // datetime-local doesn't include timezone, so we treat it as already being in GMT+8
  // Just append the timezone offset
  return `${datetimeLocal}:00.000+08:00`;
}

/**
 * Convert an ISO string to datetime-local format for input fields
 * Output format: "2024-01-15T14:30"
 */
export function isoToDatetimeLocal(isoString: string): string {
  const date = new Date(isoString);
  return formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Format remaining seconds into MM:SS or HH:MM:SS display
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) {
    return '00:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate remaining seconds from end time
 */
export function calculateRemainingSeconds(endTimeISO: string | null): number {
  if (!endTimeISO) {
    return 0;
  }

  const endTime = new Date(endTimeISO).getTime();
  const now = Date.now();
  const remaining = Math.floor((endTime - now) / 1000);

  return Math.max(0, remaining);
}

/**
 * Get the timezone name for display
 */
export function getTimezoneName(): string {
  return 'GMT+8 (Malaysia)';
}

export { TIMEZONE };
