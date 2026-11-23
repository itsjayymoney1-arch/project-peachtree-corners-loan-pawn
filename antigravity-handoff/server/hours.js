export const STORE_TIME_ZONE = 'America/New_York';

// Sunday was confirmed closed by the shop.
export const DEFAULT_REGULAR_HOURS = [
  { day: 0, status: 'closed', opens: null, closes: null },
  { day: 1, status: 'open', opens: '10:00', closes: '18:00' },
  { day: 2, status: 'open', opens: '15:00', closes: '18:00' },
  { day: 3, status: 'open', opens: '10:00', closes: '18:00' },
  { day: 4, status: 'open', opens: '10:00', closes: '18:00' },
  { day: 5, status: 'open', opens: '10:00', closes: '18:00' },
  { day: 6, status: 'open', opens: '10:00', closes: '15:00' },
];

export function storeDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: STORE_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1900 || year > 9999) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function validTime(value) {
  return typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function normalizeHours(item) {
  if (!item || !['open', 'closed', 'unconfirmed'].includes(item.status)) throw new Error('Choose open, closed, or unconfirmed.');
  if (item.status !== 'open') return { status: item.status, opens: null, closes: null };
  if (!validTime(item.opens) || !validTime(item.closes) || item.opens >= item.closes) {
    throw new Error('Open and closing times must be valid, and closing must be later on the same day.');
  }
  return { status: 'open', opens: item.opens, closes: item.closes };
}

export function validateRegular(value) {
  if (!Array.isArray(value) || value.length !== 7) throw new Error('Provide exactly seven days.');
  const days = new Map();
  for (const item of value) {
    if (!Number.isInteger(item?.day) || item.day < 0 || item.day > 6 || days.has(item.day)) {
      throw new Error('Each day of the week must appear exactly once.');
    }
    days.set(item.day, { day: item.day, ...normalizeHours(item) });
  }
  return [...days.values()].sort((a, b) => a.day - b.day);
}

export function validateException(date, item) {
  if (!validDate(date)) throw new Error('Enter a valid calendar date.');
  if (typeof item?.label !== 'string' || !item.label.trim() || item.label.trim().length > 120 || /[\u0000-\u001f\u007f]/.test(item.label)) {
    throw new Error('Enter a label of 1–120 characters.');
  }
  return { date, label: item.label.trim(), ...normalizeHours(item) };
}
