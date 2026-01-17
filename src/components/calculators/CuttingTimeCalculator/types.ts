/**
 * Cutting Time Estimator Types
 * Calculate machining time for CNC operations
 */

export interface CuttingTimeInputs {
  operationType: 'milling' | 'turning' | 'drilling';
  // For milling
  pathLength: number;
  pathUnit: 'inches' | 'mm';
  feedRate: number;
  feedUnit: 'ipm' | 'mmpm';
  numberOfPasses: number;
  // For turning
  partLength: number;
  partDiameter: number;
  depthOfCut: number;
  // For drilling
  holeDepth: number;
  numberOfHoles: number;
  peckDepth: number;
  // Common
  rapidRate: number;
  rapidDistance: number;
  toolChangeTime: number;
  numberOfToolChanges: number;
  setupTime: number;
  quantity: number;
}

export interface CuttingTimeResults {
  cuttingTime: number;
  rapidTime: number;
  toolChangeTime: number;
  totalCycleTime: number;
  timePerPart: number;
  totalJobTime: number;
  partsPerHour: number;
  costEstimate: number;
}

// Operation presets
export const OPERATION_TYPES = [
  { value: 'milling', label: 'Milling / Routing' },
  { value: 'turning', label: 'Turning / Lathe' },
  { value: 'drilling', label: 'Drilling / Tapping' },
];

// Common machine rates ($/hour)
export const MACHINE_RATES = [
  { label: 'Manual Mill', rate: 45 },
  { label: 'CNC Mill (3-axis)', rate: 75 },
  { label: 'CNC Mill (5-axis)', rate: 125 },
  { label: 'Manual Lathe', rate: 40 },
  { label: 'CNC Lathe', rate: 85 },
  { label: 'Swiss Lathe', rate: 150 },
  { label: 'Drill Press', rate: 30 },
  { label: 'CNC Router', rate: 60 },
];

// Rapid traverse rates (ipm)
export const RAPID_RATES = {
  manual: 60,
  cnc_standard: 400,
  cnc_high_speed: 800,
  router: 600,
};
