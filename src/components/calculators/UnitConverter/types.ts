/**
 * Unit Converter - Type Definitions
 *
 * Convert between various units of measurement.
 */

export type UnitCategory = 'length' | 'weight' | 'temperature' | 'volume' | 'area' | 'speed';

export interface UnitOption {
  value: string;
  label: string;
  toBase: (val: number) => number;
  fromBase: (val: number) => number;
}

export interface UnitConverterInputs {
  category: UnitCategory;
  fromUnit: string;
  toUnit: string;
  value: number;
}

export interface UnitConverterResult {
  value: number;
  fromUnit: string;
  toUnit: string;
  formatted: string;
}

// Unit definitions by category
export const UNITS: Record<UnitCategory, UnitOption[]> = {
  length: [
    { value: 'mm', label: 'Millimeters', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { value: 'cm', label: 'Centimeters', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    { value: 'm', label: 'Meters', toBase: (v) => v, fromBase: (v) => v },
    { value: 'km', label: 'Kilometers', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { value: 'in', label: 'Inches', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    { value: 'ft', label: 'Feet', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { value: 'yd', label: 'Yards', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    { value: 'mi', label: 'Miles', toBase: (v) => v * 1609.34, fromBase: (v) => v / 1609.34 },
  ],
  weight: [
    { value: 'mg', label: 'Milligrams', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
    { value: 'g', label: 'Grams', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { value: 'kg', label: 'Kilograms', toBase: (v) => v, fromBase: (v) => v },
    { value: 'oz', label: 'Ounces', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
    { value: 'lb', label: 'Pounds', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
    { value: 'st', label: 'Stone', toBase: (v) => v * 6.35029, fromBase: (v) => v / 6.35029 },
  ],
  temperature: [
    { value: 'c', label: 'Celsius', toBase: (v) => v, fromBase: (v) => v },
    {
      value: 'f',
      label: 'Fahrenheit',
      toBase: (v) => ((v - 32) * 5) / 9,
      fromBase: (v) => (v * 9) / 5 + 32,
    },
    { value: 'k', label: 'Kelvin', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ],
  volume: [
    { value: 'ml', label: 'Milliliters', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { value: 'l', label: 'Liters', toBase: (v) => v, fromBase: (v) => v },
    {
      value: 'gal',
      label: 'Gallons (US)',
      toBase: (v) => v * 3.78541,
      fromBase: (v) => v / 3.78541,
    },
    { value: 'qt', label: 'Quarts', toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
    { value: 'pt', label: 'Pints', toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
    { value: 'cup', label: 'Cups', toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
    {
      value: 'floz',
      label: 'Fluid Ounces',
      toBase: (v) => v * 0.0295735,
      fromBase: (v) => v / 0.0295735,
    },
  ],
  area: [
    { value: 'sqm', label: 'Square Meters', toBase: (v) => v, fromBase: (v) => v },
    {
      value: 'sqkm',
      label: 'Square Kilometers',
      toBase: (v) => v * 1000000,
      fromBase: (v) => v / 1000000,
    },
    {
      value: 'sqft',
      label: 'Square Feet',
      toBase: (v) => v * 0.092903,
      fromBase: (v) => v / 0.092903,
    },
    {
      value: 'sqyd',
      label: 'Square Yards',
      toBase: (v) => v * 0.836127,
      fromBase: (v) => v / 0.836127,
    },
    { value: 'acre', label: 'Acres', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
    { value: 'ha', label: 'Hectares', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
  ],
  speed: [
    { value: 'mps', label: 'Meters/second', toBase: (v) => v, fromBase: (v) => v },
    { value: 'kph', label: 'Kilometers/hour', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
    { value: 'mph', label: 'Miles/hour', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
    { value: 'knots', label: 'Knots', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
  ],
};

export const CATEGORY_LABELS: Record<UnitCategory, string> = {
  length: 'Length',
  weight: 'Weight',
  temperature: 'Temperature',
  volume: 'Volume',
  area: 'Area',
  speed: 'Speed',
};

export function getDefaultInputs(): UnitConverterInputs {
  return {
    category: 'length',
    fromUnit: 'm',
    toUnit: 'ft',
    value: 1,
  };
}

export const DEFAULT_INPUTS: UnitConverterInputs = getDefaultInputs();
