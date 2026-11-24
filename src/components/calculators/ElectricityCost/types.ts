import type { Currency } from '../../../lib/regions';

export interface AppliancePreset {
  name: string;
  watts: number;
  typicalHoursPerDay: number;
  category: 'heating' | 'cooling' | 'kitchen' | 'entertainment' | 'computing' | 'other';
}

export interface SelectedAppliance {
  name: string;
  watts: number;
  hoursPerDay: number;
  category: string;
}

export interface ElectricityCostInputs {
  currency: Currency;

  watts: number;

  hoursPerDay: number;

  daysPerMonth: number;

  ratePerKwh: number;
}

export interface ElectricityCostResult {
  currency: Currency;

  kwhPerDay: number;

  kwhPerMonth: number;

  kwhPerYear: number;

  costPerDay: number;

  costPerMonth: number;

  costPerYear: number;

  costPerHour: number;
}

export const APPLIANCE_PRESETS: AppliancePreset[] = [
  { name: 'Space Heater', watts: 1500, typicalHoursPerDay: 8, category: 'heating' },
  { name: 'Window AC Unit', watts: 1200, typicalHoursPerDay: 8, category: 'cooling' },
  { name: 'Central AC', watts: 3500, typicalHoursPerDay: 8, category: 'cooling' },
  { name: 'Electric Fan', watts: 75, typicalHoursPerDay: 8, category: 'cooling' },

  { name: 'Refrigerator', watts: 150, typicalHoursPerDay: 24, category: 'kitchen' },
  { name: 'Electric Oven', watts: 2500, typicalHoursPerDay: 1, category: 'kitchen' },
  { name: 'Microwave', watts: 1000, typicalHoursPerDay: 0.5, category: 'kitchen' },
  { name: 'Dishwasher', watts: 1800, typicalHoursPerDay: 1, category: 'kitchen' },
  { name: 'Coffee Maker', watts: 900, typicalHoursPerDay: 0.5, category: 'kitchen' },

  { name: 'LED TV (55")', watts: 100, typicalHoursPerDay: 5, category: 'entertainment' },
  { name: 'Gaming Console', watts: 150, typicalHoursPerDay: 3, category: 'entertainment' },
  { name: 'Sound System', watts: 200, typicalHoursPerDay: 4, category: 'entertainment' },

  { name: 'Desktop Computer', watts: 300, typicalHoursPerDay: 8, category: 'computing' },
  { name: 'Laptop', watts: 65, typicalHoursPerDay: 8, category: 'computing' },
  { name: 'Gaming PC', watts: 500, typicalHoursPerDay: 4, category: 'computing' },
  { name: 'Monitor', watts: 40, typicalHoursPerDay: 8, category: 'computing' },
  { name: 'Router/Modem', watts: 15, typicalHoursPerDay: 24, category: 'computing' },

  { name: 'Washer', watts: 500, typicalHoursPerDay: 1, category: 'other' },
  { name: 'Dryer', watts: 3000, typicalHoursPerDay: 1, category: 'other' },
  { name: 'Hair Dryer', watts: 1500, typicalHoursPerDay: 0.25, category: 'other' },
  { name: 'Vacuum Cleaner', watts: 1000, typicalHoursPerDay: 0.5, category: 'other' },
  { name: 'LED Light Bulb', watts: 10, typicalHoursPerDay: 6, category: 'other' },
  { name: 'Incandescent Bulb', watts: 60, typicalHoursPerDay: 6, category: 'other' },
];

const AVERAGE_RATES: Record<Currency, number> = {
  USD: 0.15,
  GBP: 0.3,
  EUR: 0.25,
};

export function getDefaultInputs(currency: Currency = 'USD'): ElectricityCostInputs {
  return {
    currency,
    watts: 1000,
    hoursPerDay: 4,
    daysPerMonth: 30,
    ratePerKwh: AVERAGE_RATES[currency],
  };
}

export const DEFAULT_INPUTS: ElectricityCostInputs = getDefaultInputs('USD');
