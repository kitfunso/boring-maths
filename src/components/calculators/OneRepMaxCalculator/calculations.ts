/**
 * One Rep Max Calculator - Calculation Logic
 *
 * Implements five established 1RM estimation formulas used in
 * strength training and exercise science.
 */

import type {
  OneRepMaxInputs,
  OneRepMaxResult,
  FormulaName,
  PercentageRow,
  FormulaEstimate,
  TrainingZone,
} from './types';

function round(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ---------------------------------------------------------------------------
// Formula implementations
// ---------------------------------------------------------------------------

function epley(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

function brzycki(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps >= 37) return weight * 36; // avoid division by zero
  return weight * (36 / (37 - reps));
}

function lander(weight: number, reps: number): number {
  if (reps === 1) return weight;
  const denominator = 101.3 - 2.67123 * reps;
  if (denominator <= 0) return weight * 10; // cap for extreme reps
  return (100 * weight) / denominator;
}

function lombardi(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * Math.pow(reps, 0.10);
}

function oconner(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + 0.025 * reps);
}

const FORMULA_MAP: Readonly<Record<FormulaName, (w: number, r: number) => number>> = {
  epley,
  brzycki,
  lander,
  lombardi,
  oconner,
};

const FORMULA_LABELS: Readonly<Record<FormulaName, string>> = {
  epley: 'Epley',
  brzycki: 'Brzycki',
  lander: 'Lander',
  lombardi: 'Lombardi',
  oconner: "O'Conner",
};

// ---------------------------------------------------------------------------
// Percentage table (50% to 95% in 5% steps)
// ---------------------------------------------------------------------------

function buildPercentageTable(oneRM: number): readonly PercentageRow[] {
  const rows: PercentageRow[] = [];
  for (let pct = 100; pct >= 50; pct -= 5) {
    rows.push({
      percent: pct,
      weight: round((oneRM * pct) / 100, 1),
    });
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Formula comparison
// ---------------------------------------------------------------------------

function buildFormulaComparison(weight: number, reps: number): readonly FormulaEstimate[] {
  const formulas: FormulaName[] = ['epley', 'brzycki', 'lander', 'lombardi', 'oconner'];
  return formulas.map((f) => ({
    formula: f,
    label: FORMULA_LABELS[f],
    estimated1RM: round(FORMULA_MAP[f](weight, reps), 1),
  }));
}

// ---------------------------------------------------------------------------
// Training zones
// ---------------------------------------------------------------------------

function buildTrainingZones(oneRM: number): readonly TrainingZone[] {
  return [
    {
      name: 'Strength',
      description: 'Heavy singles to triples for maximum force production',
      minPercent: 85,
      maxPercent: 100,
      minWeight: round((oneRM * 85) / 100, 1),
      maxWeight: round(oneRM, 1),
      repsRange: '1-5 reps',
      color: 'red',
    },
    {
      name: 'Hypertrophy',
      description: 'Moderate load for muscle growth and size',
      minPercent: 65,
      maxPercent: 85,
      minWeight: round((oneRM * 65) / 100, 1),
      maxWeight: round((oneRM * 85) / 100, 1),
      repsRange: '6-12 reps',
      color: 'yellow',
    },
    {
      name: 'Endurance',
      description: 'Lighter load for muscular endurance and conditioning',
      minPercent: 50,
      maxPercent: 65,
      minWeight: round((oneRM * 50) / 100, 1),
      maxWeight: round((oneRM * 65) / 100, 1),
      repsRange: '13-20+ reps',
      color: 'green',
    },
  ];
}

// ---------------------------------------------------------------------------
// Main calculation
// ---------------------------------------------------------------------------

export function calculateOneRepMax(inputs: OneRepMaxInputs): OneRepMaxResult {
  const { weight, reps, formula } = inputs;

  if (weight <= 0 || reps < 1) {
    return {
      estimated1RM: 0,
      percentages: [],
      formulaComparison: [],
      trainingZones: [],
    };
  }

  const clampedReps = Math.min(Math.max(Math.round(reps), 1), 30);
  const estimated1RM = round(FORMULA_MAP[formula](weight, clampedReps), 1);

  return {
    estimated1RM,
    percentages: buildPercentageTable(estimated1RM),
    formulaComparison: buildFormulaComparison(weight, clampedReps),
    trainingZones: buildTrainingZones(estimated1RM),
  };
}

export { round };
