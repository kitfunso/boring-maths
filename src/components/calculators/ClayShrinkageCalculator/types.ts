/**
 * Clay Shrinkage Calculator Types
 * For pottery and ceramics
 */

export interface ClayShrinkageInputs {
  calculationMode: CalculationMode;
  knownSize: number;
  shrinkagePercent: number;
  clayType: string;
  firingCone: string;
  unit: 'in' | 'cm';
}

export type CalculationMode = 'thrown-to-fired' | 'fired-to-thrown';

export interface ClayShrinkageResult {
  resultSize: number;
  totalShrinkage: number;
  dryShrinkage: number;
  firingShrinkage: number;
  shrinkageFactor: number;
  sizeChange: number;
}

// Common clay bodies with shrinkage rates
export const CLAY_TYPES: {
  value: string;
  label: string;
  totalShrinkage: number;
  dryShrinkage: number;
}[] = [
  // Earthenware
  { value: 'terracotta', label: 'Terracotta (Cone 06-02)', totalShrinkage: 10, dryShrinkage: 5 },
  {
    value: 'earthenware-red',
    label: 'Red Earthenware (Cone 06-02)',
    totalShrinkage: 11,
    dryShrinkage: 5,
  },
  {
    value: 'earthenware-white',
    label: 'White Earthenware (Cone 06-02)',
    totalShrinkage: 10,
    dryShrinkage: 5,
  },
  // Stoneware
  {
    value: 'stoneware-light',
    label: 'Stoneware - Light (Cone 6)',
    totalShrinkage: 12,
    dryShrinkage: 6,
  },
  {
    value: 'stoneware-dark',
    label: 'Stoneware - Dark (Cone 6)',
    totalShrinkage: 12,
    dryShrinkage: 6,
  },
  {
    value: 'stoneware-high',
    label: 'Stoneware - High Fire (Cone 10)',
    totalShrinkage: 13,
    dryShrinkage: 6,
  },
  { value: 'speckled-buff', label: 'Speckled Buff (Cone 6)', totalShrinkage: 11, dryShrinkage: 5 },
  // Porcelain
  { value: 'porcelain-cone6', label: 'Porcelain (Cone 6)', totalShrinkage: 13, dryShrinkage: 6 },
  { value: 'porcelain-cone10', label: 'Porcelain (Cone 10)', totalShrinkage: 14, dryShrinkage: 7 },
  {
    value: 'translucent-porcelain',
    label: 'Translucent Porcelain',
    totalShrinkage: 15,
    dryShrinkage: 7,
  },
  // Specialty
  { value: 'raku', label: 'Raku Clay', totalShrinkage: 8, dryShrinkage: 4 },
  { value: 'paper-clay', label: 'Paper Clay', totalShrinkage: 10, dryShrinkage: 5 },
  { value: 'sculpture', label: 'Sculpture Clay (grog)', totalShrinkage: 9, dryShrinkage: 4 },
  { value: 'custom', label: 'Custom (enter %)', totalShrinkage: 12, dryShrinkage: 6 },
];

// Firing cone temperatures (for reference)
export const CONE_TEMPS: { cone: string; tempF: number; tempC: number; category: string }[] = [
  { cone: '022', tempF: 1112, tempC: 600, category: 'Low Fire' },
  { cone: '06', tempF: 1828, tempC: 998, category: 'Low Fire' },
  { cone: '04', tempF: 1945, tempC: 1063, category: 'Low Fire' },
  { cone: '02', tempF: 2016, tempC: 1102, category: 'Low Fire' },
  { cone: '1', tempF: 2079, tempC: 1137, category: 'Mid Fire' },
  { cone: '4', tempF: 2167, tempC: 1186, category: 'Mid Fire' },
  { cone: '6', tempF: 2232, tempC: 1222, category: 'Mid Fire' },
  { cone: '8', tempF: 2280, tempC: 1249, category: 'High Fire' },
  { cone: '10', tempF: 2345, tempC: 1285, category: 'High Fire' },
  { cone: '12', tempF: 2383, tempC: 1306, category: 'High Fire' },
];

export function getDefaultInputs(): ClayShrinkageInputs {
  return {
    calculationMode: 'thrown-to-fired',
    knownSize: 10,
    shrinkagePercent: 12,
    clayType: 'stoneware-light',
    firingCone: '6',
    unit: 'in',
  };
}
