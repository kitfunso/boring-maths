import type { LeftoversInputs, LeftoversResult } from './types';
import { FOOD_SAFETY_DATA } from './types';

export function calculateLeftovers(inputs: LeftoversInputs): LeftoversResult {
  const { foodCategory, storageMethod, preparedDate } = inputs;
  const entry = FOOD_SAFETY_DATA[foodCategory];

  const prepared = parseDate(preparedDate);
  const now = new Date();

  const expiryDate = calculateExpiryDate(prepared, storageMethod, entry);
  const expiryDateStr = formatISODate(expiryDate);

  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expiryMidnight = new Date(
    expiryDate.getFullYear(),
    expiryDate.getMonth(),
    expiryDate.getDate()
  );
  const daysRemaining = Math.floor(
    (expiryMidnight.getTime() - nowMidnight.getTime()) / (1000 * 60 * 60 * 24)
  );

  let isSafe: boolean;
  if (storageMethod === 'counter') {
    const hoursElapsed = (now.getTime() - prepared.getTime()) / (1000 * 60 * 60);
    isSafe = hoursElapsed <= entry.counterHours;
  } else {
    isSafe = daysRemaining >= 0;
  }

  return {
    fridgeDays: entry.fridgeDays,
    freezerMonths: entry.freezerMonths,
    counterHours: entry.counterHours,
    expiryDate: expiryDateStr,
    daysRemaining,
    isSafe,
    spoilageSigns: entry.spoilageSigns,
    freezingTips: entry.freezingTips,
    reheatingTemp: entry.reheatingTemp,
  };
}

function calculateExpiryDate(
  prepared: Date,
  method: string,
  entry: { fridgeDays: number; freezerMonths: number; counterHours: number }
): Date {
  const expiry = new Date(prepared);

  switch (method) {
    case 'fridge':
      expiry.setDate(expiry.getDate() + entry.fridgeDays);
      break;
    case 'freezer':
      expiry.setMonth(expiry.getMonth() + entry.freezerMonths);
      break;
    case 'counter':
      expiry.setHours(expiry.getHours() + entry.counterHours);
      break;
  }

  return expiry;
}

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatISODate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDaysRemaining(days: number): string {
  if (days < 0) {
    const absDays = Math.abs(days);
    return absDays === 1 ? 'Expired 1 day ago' : `Expired ${absDays} days ago`;
  }
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day remaining';
  return `${days} days remaining`;
}
