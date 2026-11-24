export type UnitSystem = 'metric' | 'imperial';
export type FlowArrangement = 'counterflow' | 'parallelflow' | 'crossflow' | 'shellAndTube';

export interface LMTDInputs {
  unitSystem: UnitSystem;
  flowArrangement: FlowArrangement;
  hotInlet: number;
  hotOutlet: number;
  coldInlet: number;
  coldOutlet: number;
  shellPasses: number;
  tubePasses: number;
}

export interface LMTDResult {
  lmtd: number;
  correctedLMTD: number;
  correctionFactor: number;
  deltaT1: number;
  deltaT2: number;
  effectiveness: number;
  heatCapacityRatio: number;
  ntu: number;
  isValid: boolean;
  validationMessage: string;
}

export const FLOW_ARRANGEMENT_INFO: Record<
  FlowArrangement,
  { name: string; description: string; typicalF: string }
> = {
  counterflow: {
    name: 'Counter-flow',
    description: 'Fluids flow in opposite directions. Most efficient arrangement.',
    typicalF: '1.0 (no correction needed)',
  },
  parallelflow: {
    name: 'Parallel-flow',
    description: 'Fluids flow in same direction. Less efficient than counter-flow.',
    typicalF: '1.0 (no correction needed)',
  },
  crossflow: {
    name: 'Cross-flow',
    description: 'Fluids flow perpendicular to each other.',
    typicalF: '0.85 - 0.95',
  },
  shellAndTube: {
    name: 'Shell & Tube',
    description: 'Multiple tube passes in a shell. F depends on passes.',
    typicalF: '0.75 - 0.95',
  },
};

export function getDefaultInputs(): LMTDInputs {
  return {
    unitSystem: 'metric',
    flowArrangement: 'counterflow',
    hotInlet: 150, // °C
    hotOutlet: 90, // °C
    coldInlet: 30, // °C
    coldOutlet: 70, // °C
    shellPasses: 1,
    tubePasses: 2,
  };
}
