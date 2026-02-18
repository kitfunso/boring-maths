/**
 * Time Zone Converter - Calculation Logic
 */

import { TIME_ZONES, type TimeZoneConverterInputs, type TimeZoneResult } from './types';

export function convertTimeZone(inputs: TimeZoneConverterInputs): TimeZoneResult {
  const { hours, minutes, fromZone, toZone } = inputs;

  const from = TIME_ZONES.find((tz) => tz.id === fromZone) || TIME_ZONES[12]; // default GMT
  const to = TIME_ZONES.find((tz) => tz.id === toZone) || TIME_ZONES[12];

  const offsetDiff = to.offset - from.offset;

  // Convert to total minutes, apply offset
  let totalMinutes = hours * 60 + minutes + offsetDiff * 60;
  let dayShift = 0;

  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
    dayShift = -1;
  } else if (totalMinutes >= 24 * 60) {
    totalMinutes -= 24 * 60;
    dayShift = 1;
  }

  const convertedHours = Math.floor(totalMinutes / 60);
  const convertedMinutes = Math.round(totalMinutes % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const convertedTime = `${pad(convertedHours)}:${pad(convertedMinutes)}`;

  return {
    convertedTime,
    convertedHours,
    convertedMinutes,
    offsetDiff,
    dayShift,
    fromAbbrev: from.abbrev,
    toAbbrev: to.abbrev,
  };
}
