import type { CuttingTimeInputs, CuttingTimeResults } from './types';

function calculateMillingTime(inputs: CuttingTimeInputs): number {
  let pathLength = inputs.pathLength;
  let feedRate = inputs.feedRate;

  if (inputs.pathUnit === 'mm') {
    pathLength = pathLength / 25.4;
  }
  if (inputs.feedUnit === 'mmpm') {
    feedRate = feedRate / 25.4;
  }

  const cuttingTime = (pathLength / feedRate) * inputs.numberOfPasses;
  return cuttingTime;
}

function calculateTurningTime(inputs: CuttingTimeInputs): number {
  let partLength = inputs.partLength;
  const partDiameter = inputs.partDiameter;
  let depthOfCut = inputs.depthOfCut;
  let feedRate = inputs.feedRate;

  if (inputs.pathUnit === 'mm') {
    partLength = partLength / 25.4;
    void (partDiameter / 25.4);
    depthOfCut = depthOfCut / 25.4;
  }
  if (inputs.feedUnit === 'mmpm') {
    feedRate = feedRate / 25.4;
  }

  void depthOfCut;
  const passesNeeded = Math.max(1, inputs.numberOfPasses);

  const timePerPass = partLength / feedRate;
  const cuttingTime = timePerPass * passesNeeded;

  return cuttingTime;
}

function calculateDrillingTime(inputs: CuttingTimeInputs): number {
  let holeDepth = inputs.holeDepth;
  let peckDepth = inputs.peckDepth;
  let feedRate = inputs.feedRate;

  if (inputs.pathUnit === 'mm') {
    holeDepth = holeDepth / 25.4;
    peckDepth = peckDepth / 25.4;
  }
  if (inputs.feedUnit === 'mmpm') {
    feedRate = feedRate / 25.4;
  }

  void (peckDepth > 0 ? Math.ceil(holeDepth / peckDepth) : 1);

  const drillTime = holeDepth / feedRate;
  const peckOverhead = peckDepth > 0 ? drillTime * 0.5 : 0;
  const timePerHole = drillTime + peckOverhead;

  const totalTime = timePerHole * inputs.numberOfHoles;
  return totalTime;
}

export function calculateCuttingTime(inputs: CuttingTimeInputs): CuttingTimeResults {
  let cuttingTime: number;
  switch (inputs.operationType) {
    case 'turning':
      cuttingTime = calculateTurningTime(inputs);
      break;
    case 'drilling':
      cuttingTime = calculateDrillingTime(inputs);
      break;
    default:
      cuttingTime = calculateMillingTime(inputs);
  }

  let rapidDistance = inputs.rapidDistance;
  if (inputs.pathUnit === 'mm') {
    rapidDistance = rapidDistance / 25.4;
  }
  const rapidTime = rapidDistance / inputs.rapidRate;

  const toolChangeTime = inputs.toolChangeTime * inputs.numberOfToolChanges;

  const totalCycleTime = cuttingTime + rapidTime + toolChangeTime;

  const setupPerPart = inputs.setupTime / inputs.quantity;
  const timePerPart = totalCycleTime + setupPerPart;

  const totalJobTime = inputs.setupTime + totalCycleTime * inputs.quantity;

  const partsPerHour = totalCycleTime > 0 ? 60 / totalCycleTime : 0;

  const costEstimate = (totalJobTime / 60) * 75;

  return {
    cuttingTime: Math.round(cuttingTime * 100) / 100,
    rapidTime: Math.round(rapidTime * 100) / 100,
    toolChangeTime: Math.round(toolChangeTime * 100) / 100,
    totalCycleTime: Math.round(totalCycleTime * 100) / 100,
    timePerPart: Math.round(timePerPart * 100) / 100,
    totalJobTime: Math.round(totalJobTime * 100) / 100,
    partsPerHour: Math.round(partsPerHour * 10) / 10,
    costEstimate: Math.round(costEstimate * 100) / 100,
  };
}

export function formatTime(minutes: number): string {
  if (minutes < 1) {
    return `${Math.round(minutes * 60)} sec`;
  }
  if (minutes < 60) {
    return `${minutes.toFixed(1)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}
