/**
 * Electricity Cost Calculator - Type Definitions
 *
 * Calculator to determine how much it costs to run appliances.
 */

import type { Currency } from '../../../lib/regions';

/**
 * Common appliance presets
 */
export interface AppliancePreset {
  name: string;
  watts: number;
  typicalHoursPerDay: number;
  category: 'heating' | 'cooling' | 'kitchen' | 'entertainment' | 'computing' | 'other';
}

/**
 * Input values for the Electricity Cost Calculator
 */
export interface ElectricityCostInputs {
  /** Selected currency */
  currency: Currency;

  /** Appliance wattage */
  watts: number;

  /** Hours used per day */
  hoursPerDay: number;

  /** Days used per month */
  daysPerMonth: number;

  /** Electricity rate per kWh */
  ratePerKwh: number;
}

/**
 * Calculated results from the Electricity Cost Calculator
 */
export interface ElectricityCostResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Kilowatt hours per day */
  kwhPerDay: number;

  /** Kilowatt hours per month */
  kwhPerMonth: number;

  /** Kilowatt hours per year */
  kwhPerYear: number;

  /** Cost per day */
  costPerDay: number;

  /** Cost per month */
  costPerMonth: number;

  /** Cost per year */
  costPerYear: number;

  /** Cost per hour of use */
  costPerHour: number;
}

/**
 * Common appliance presets
 */
export const APPLIANCE_PRESETS: AppliancePreset[] = [
  // Heating/Cooling
  { name: 'Space Heater', watts: 1500, typicalHoursPerDay: 8, category: 'heating' },
  { name: 'Window AC Unit', watts: 1200, typicalHoursPerDay: 8, category: 'cooling' },
  { name: 'Central AC', watts: 3500, typicalHoursPerDay: 8, category: 'cooling' },
  { name: 'Electric Fan', watts: 75, typicalHoursPerDay: 8, category: 'cooling' },

  // Kitchen
  { name: 'Refrigerator', watts: 150, typicalHoursPerDay: 24, category: 'kitchen' },
  { name: 'Electric Oven', watts: 2500, typicalHoursPerDay: 1, category: 'kitchen' },
  { name: 'Microwave', watts: 1000, typicalHoursPerDay: 0.5, category: 'kitchen' },
  { name: 'Dishwasher', watts: 1800, typicalHoursPerDay: 1, category: 'kitchen' },
  { name: 'Coffee Maker', watts: 900, typicalHoursPerDay: 0.5, category: 'kitchen' },

  // Entertainment
  { name: 'LED TV (55")', watts: 100, typicalHoursPerDay: 5, category: 'entertainment' },
  { name: 'Gaming Console', watts: 150, typicalHoursPerDay: 3, category: 'entertainment' },
  { name: 'Sound System', watts: 200, typicalHoursPerDay: 4, category: 'entertainment' },

  // Computing
  { name: 'Desktop Computer', watts: 300, typicalHoursPerDay: 8, category: 'computing' },
  { name: 'Laptop', watts: 65, typicalHoursPerDay: 8, category: 'computing' },
  { name: 'Gaming PC', watts: 500, typicalHoursPerDay: 4, category: 'computing' },
  { name: 'Monitor', watts: 40, typicalHoursPerDay: 8, category: 'computing' },
  { name: 'Router/Modem', watts: 15, typicalHoursPerDay: 24, category: 'computing' },

  // Other
  { name: 'Washer', watts: 500, typicalHoursPerDay: 1, category: 'other' },
  { name: 'Dryer', watts: 3000, typicalHoursPerDay: 1, category: 'other' },
  { name: 'Hair Dryer', watts: 1500, typicalHoursPerDay: 0.25, category: 'other' },
  { name: 'Vacuum Cleaner', watts: 1000, typicalHoursPerDay: 0.5, category: 'other' },
  { name: 'LED Light Bulb', watts: 10, typicalHoursPerDay: 6, category: 'other' },
  { name: 'Incandescent Bulb', watts: 60, typicalHoursPerDay: 6, category: 'other' },
];

/**
 * Average electricity rates by region (per kWh)
 */
const AVERAGE_RATES: Record<Currency, number> = {
  USD: 0.15,
  GBP: 0.30,
  EUR: 0.25,
};

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'USD'): ElectricityCostInputs {
  return {
    currency,
    watts: 1000,
    hoursPerDay: 4,
    daysPerMonth: 30,
    ratePerKwh: AVERAGE_RATES[currency],
  };
}

/**
 * Default input values
 */
export const DEFAULT_INPUTS: ElectricityCostInputs = getDefaultInputs('USD');
