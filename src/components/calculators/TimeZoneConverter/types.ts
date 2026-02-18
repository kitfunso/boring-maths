/**
 * Time Zone Converter - Type Definitions
 */

export interface TimeZoneConverterInputs {
  hours: number;
  minutes: number;
  fromZone: string;
  toZone: string;
}

export interface TimeZoneResult {
  convertedTime: string; // "HH:MM"
  convertedHours: number;
  convertedMinutes: number;
  offsetDiff: number; // hours difference
  dayShift: number; // -1, 0, or 1
  fromAbbrev: string;
  toAbbrev: string;
}

export interface TimeZoneInfo {
  id: string;
  label: string;
  offset: number; // hours from UTC
  abbrev: string;
}

export const TIME_ZONES: TimeZoneInfo[] = [
  { id: 'UTC-12', label: 'Baker Island (UTC-12)', offset: -12, abbrev: 'AoE' },
  { id: 'UTC-11', label: 'American Samoa (UTC-11)', offset: -11, abbrev: 'SST' },
  { id: 'UTC-10', label: 'Hawaii (UTC-10)', offset: -10, abbrev: 'HST' },
  { id: 'UTC-9', label: 'Alaska (UTC-9)', offset: -9, abbrev: 'AKST' },
  { id: 'UTC-8', label: 'Los Angeles / PST (UTC-8)', offset: -8, abbrev: 'PST' },
  { id: 'UTC-7', label: 'Denver / MST (UTC-7)', offset: -7, abbrev: 'MST' },
  { id: 'UTC-6', label: 'Chicago / CST (UTC-6)', offset: -6, abbrev: 'CST' },
  { id: 'UTC-5', label: 'New York / EST (UTC-5)', offset: -5, abbrev: 'EST' },
  { id: 'UTC-4', label: 'Atlantic / AST (UTC-4)', offset: -4, abbrev: 'AST' },
  { id: 'UTC-3', label: 'Buenos Aires / BRT (UTC-3)', offset: -3, abbrev: 'BRT' },
  { id: 'UTC-2', label: 'South Georgia (UTC-2)', offset: -2, abbrev: 'GST' },
  { id: 'UTC-1', label: 'Azores (UTC-1)', offset: -1, abbrev: 'AZOT' },
  { id: 'UTC+0', label: 'London / GMT (UTC+0)', offset: 0, abbrev: 'GMT' },
  { id: 'UTC+1', label: 'Paris / CET (UTC+1)', offset: 1, abbrev: 'CET' },
  { id: 'UTC+2', label: 'Cairo / EET (UTC+2)', offset: 2, abbrev: 'EET' },
  { id: 'UTC+3', label: 'Moscow / MSK (UTC+3)', offset: 3, abbrev: 'MSK' },
  { id: 'UTC+3.5', label: 'Tehran (UTC+3:30)', offset: 3.5, abbrev: 'IRST' },
  { id: 'UTC+4', label: 'Dubai / GST (UTC+4)', offset: 4, abbrev: 'GST' },
  { id: 'UTC+4.5', label: 'Kabul (UTC+4:30)', offset: 4.5, abbrev: 'AFT' },
  { id: 'UTC+5', label: 'Karachi / PKT (UTC+5)', offset: 5, abbrev: 'PKT' },
  { id: 'UTC+5.5', label: 'Mumbai / IST (UTC+5:30)', offset: 5.5, abbrev: 'IST' },
  { id: 'UTC+5.75', label: 'Kathmandu (UTC+5:45)', offset: 5.75, abbrev: 'NPT' },
  { id: 'UTC+6', label: 'Dhaka / BST (UTC+6)', offset: 6, abbrev: 'BST' },
  { id: 'UTC+7', label: 'Bangkok / ICT (UTC+7)', offset: 7, abbrev: 'ICT' },
  { id: 'UTC+8', label: 'Singapore / Beijing (UTC+8)', offset: 8, abbrev: 'SGT' },
  { id: 'UTC+9', label: 'Tokyo / JST (UTC+9)', offset: 9, abbrev: 'JST' },
  { id: 'UTC+9.5', label: 'Adelaide / ACST (UTC+9:30)', offset: 9.5, abbrev: 'ACST' },
  { id: 'UTC+10', label: 'Sydney / AEST (UTC+10)', offset: 10, abbrev: 'AEST' },
  { id: 'UTC+11', label: 'Solomon Islands (UTC+11)', offset: 11, abbrev: 'SBT' },
  { id: 'UTC+12', label: 'Auckland / NZST (UTC+12)', offset: 12, abbrev: 'NZST' },
  { id: 'UTC+13', label: 'Tonga (UTC+13)', offset: 13, abbrev: 'TOT' },
];

export function getDefaultInputs(): TimeZoneConverterInputs {
  return {
    hours: 9,
    minutes: 0,
    fromZone: 'UTC-5',
    toZone: 'UTC+0',
  };
}
