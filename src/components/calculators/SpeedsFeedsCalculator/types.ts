/**
 * Speeds & Feeds Calculator Types
 * For CNC machining and metalworking
 */

export interface SpeedsFeedsInputs {
  material: string;
  toolDiameter: number;
  toolDiameterUnit: 'in' | 'mm';
  numberOfFlutes: number;
  operationType: OperationType;
  depthOfCut: number;
  depthOfCutUnit: 'in' | 'mm';
}

export type OperationType = 'roughing' | 'finishing' | 'slotting' | 'drilling';

export interface SpeedsFeedsResult {
  rpm: number;
  feedRate: number;
  feedRateUnit: string;
  chipLoad: number;
  surfaceSpeed: number;
  materialRemovalRate: number;
  cuttingTime: number;
}

// Material cutting speeds in SFM (Surface Feet per Minute)
export const MATERIALS: { value: string; label: string; sfm: number; chipLoad: number }[] = [
  { value: 'aluminum', label: 'Aluminum (6061)', sfm: 800, chipLoad: 0.004 },
  { value: 'aluminum-cast', label: 'Aluminum (Cast)', sfm: 600, chipLoad: 0.003 },
  { value: 'brass', label: 'Brass', sfm: 300, chipLoad: 0.003 },
  { value: 'bronze', label: 'Bronze', sfm: 200, chipLoad: 0.002 },
  { value: 'copper', label: 'Copper', sfm: 200, chipLoad: 0.002 },
  { value: 'steel-mild', label: 'Mild Steel (1018)', sfm: 100, chipLoad: 0.002 },
  { value: 'steel-medium', label: 'Medium Carbon Steel (1045)', sfm: 80, chipLoad: 0.0015 },
  { value: 'steel-alloy', label: 'Alloy Steel (4140)', sfm: 60, chipLoad: 0.001 },
  { value: 'steel-stainless-304', label: 'Stainless Steel (304)', sfm: 65, chipLoad: 0.001 },
  { value: 'steel-stainless-316', label: 'Stainless Steel (316)', sfm: 50, chipLoad: 0.001 },
  { value: 'steel-tool', label: 'Tool Steel (A2, D2)', sfm: 40, chipLoad: 0.0008 },
  { value: 'titanium', label: 'Titanium (Grade 5)', sfm: 50, chipLoad: 0.001 },
  { value: 'cast-iron', label: 'Cast Iron', sfm: 80, chipLoad: 0.002 },
  { value: 'plastic-acrylic', label: 'Acrylic/PMMA', sfm: 500, chipLoad: 0.005 },
  { value: 'plastic-delrin', label: 'Delrin/POM', sfm: 600, chipLoad: 0.006 },
  { value: 'plastic-nylon', label: 'Nylon', sfm: 400, chipLoad: 0.004 },
  { value: 'plastic-hdpe', label: 'HDPE', sfm: 600, chipLoad: 0.006 },
  { value: 'wood-hardwood', label: 'Hardwood', sfm: 800, chipLoad: 0.008 },
  { value: 'wood-softwood', label: 'Softwood', sfm: 1000, chipLoad: 0.01 },
  { value: 'wood-plywood', label: 'Plywood/MDF', sfm: 600, chipLoad: 0.006 },
];

export const OPERATION_TYPES: {
  value: OperationType;
  label: string;
  sfmMultiplier: number;
  chipLoadMultiplier: number;
}[] = [
  { value: 'roughing', label: 'Roughing', sfmMultiplier: 0.8, chipLoadMultiplier: 1.2 },
  { value: 'finishing', label: 'Finishing', sfmMultiplier: 1.0, chipLoadMultiplier: 0.6 },
  { value: 'slotting', label: 'Slotting', sfmMultiplier: 0.6, chipLoadMultiplier: 0.8 },
  { value: 'drilling', label: 'Drilling', sfmMultiplier: 0.7, chipLoadMultiplier: 1.0 },
];

export const FLUTE_OPTIONS = [1, 2, 3, 4, 6, 8];

export function getDefaultInputs(): SpeedsFeedsInputs {
  return {
    material: 'aluminum',
    toolDiameter: 0.5,
    toolDiameterUnit: 'in',
    numberOfFlutes: 3,
    operationType: 'roughing',
    depthOfCut: 0.1,
    depthOfCutUnit: 'in',
  };
}
