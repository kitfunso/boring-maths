/**
 * One Rep Max Calculator - Type Definitions
 *
 * Estimates maximum weight for a single repetition using multiple proven formulas.
 */

export type WeightUnit = 'kg' | 'lbs';

export type FormulaName = 'epley' | 'brzycki' | 'lander' | 'lombardi' | 'oconner';

export interface OneRepMaxInputs {
  weight: number;
  reps: number;
  unit: WeightUnit;
  formula: FormulaName;
}

export interface PercentageRow {
  readonly percent: number;
  readonly weight: number;
}

export interface FormulaEstimate {
  readonly formula: FormulaName;
  readonly label: string;
  readonly estimated1RM: number;
}

export interface TrainingZone {
  readonly name: string;
  readonly description: string;
  readonly minPercent: number;
  readonly maxPercent: number;
  readonly minWeight: number;
  readonly maxWeight: number;
  readonly repsRange: string;
  readonly color: 'red' | 'yellow' | 'green';
}

export interface OneRepMaxResult {
  readonly estimated1RM: number;
  readonly percentages: readonly PercentageRow[];
  readonly formulaComparison: readonly FormulaEstimate[];
  readonly trainingZones: readonly TrainingZone[];
}

export const FORMULA_OPTIONS: readonly {
  value: FormulaName;
  label: string;
  description: string;
}[] = [
  { value: 'epley', label: 'Epley', description: 'Most widely used formula' },
  { value: 'brzycki', label: 'Brzycki', description: 'Accurate for lower rep ranges' },
  { value: 'lander', label: 'Lander', description: 'Good general-purpose estimate' },
  { value: 'lombardi', label: 'Lombardi', description: 'Power-law based model' },
  { value: 'oconner', label: "O'Conner", description: 'Simple linear approximation' },
];

export function getDefaultInputs(): OneRepMaxInputs {
  return {
    weight: 100,
    reps: 5,
    unit: 'kg',
    formula: 'epley',
  };
}
