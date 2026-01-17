/**
 * Cutting Time Estimator Calculations
 */

import type { CuttingTimeInputs, CuttingTimeResults } from './types';

/**
 * Calculate cutting time for milling operations
 */
function calculateMillingTime(inputs: CuttingTimeInputs): number {
  let pathLength = inputs.pathLength;
  let feedRate = inputs.feedRate;

  // Convert to inches if needed
  if (inputs.pathUnit === 'mm') {
    pathLength = pathLength / 25.4;
  }
  if (inputs.feedUnit === 'mmpm') {
    feedRate = feedRate / 25.4;
  }

  // Time = Distance / Feed Rate × Number of Passes
  const cuttingTime = (pathLength / feedRate) * inputs.numberOfPasses;
  return cuttingTime; // in minutes
}

/**
 * Calculate cutting time for turning operations
 * Time = (π × D × L) / (Feed × RPM) but simplified using feed rate in ipm
 */
function calculateTurningTime(inputs: CuttingTimeInputs): number {
  let partLength = inputs.partLength;
  let partDiameter = inputs.partDiameter;
  let depthOfCut = inputs.depthOfCut;
  let feedRate = inputs.feedRate;

  // Convert to inches if needed
  if (inputs.pathUnit === 'mm') {
    partLength = partLength / 25.4;
    partDiameter = partDiameter / 25.4;
    depthOfCut = depthOfCut / 25.4;
  }
  if (inputs.feedUnit === 'mmpm') {
    feedRate = feedRate / 25.4;
  }

  // Number of passes based on material removal
  const stockToRemove = depthOfCut;
  const passesNeeded = Math.max(1, inputs.numberOfPasses);

  // Cutting time per pass = Length / Feed Rate
  const timePerPass = partLength / feedRate;
  const cuttingTime = timePerPass * passesNeeded;

  return cuttingTime; // in minutes
}

/**
 * Calculate cutting time for drilling operations
 */
function calculateDrillingTime(inputs: CuttingTimeInputs): number {
  let holeDepth = inputs.holeDepth;
  let peckDepth = inputs.peckDepth;
  let feedRate = inputs.feedRate;

  // Convert to inches if needed
  if (inputs.pathUnit === 'mm') {
    holeDepth = holeDepth / 25.4;
    peckDepth = peckDepth / 25.4;
  }
  if (inputs.feedUnit === 'mmpm') {
    feedRate = feedRate / 25.4;
  }

  // Calculate pecks needed
  const pecksPerHole = peckDepth > 0 ? Math.ceil(holeDepth / peckDepth) : 1;

  // Time per hole = (Depth / Feed) + retract time
  // Retract adds about 50% overhead for peck drilling
  const drillTime = holeDepth / feedRate;
  const peckOverhead = peckDepth > 0 ? drillTime * 0.5 : 0;
  const timePerHole = drillTime + peckOverhead;

  const totalTime = timePerHole * inputs.numberOfHoles;
  return totalTime; // in minutes
}

/**
 * Main calculation function
 */
export function calculateCuttingTime(inputs: CuttingTimeInputs): CuttingTimeResults {
  // Calculate cutting time based on operation type
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

  // Calculate rapid traverse time
  let rapidDistance = inputs.rapidDistance;
  if (inputs.pathUnit === 'mm') {
    rapidDistance = rapidDistance / 25.4;
  }
  const rapidTime = rapidDistance / inputs.rapidRate;

  // Tool change time
  const toolChangeTime = inputs.toolChangeTime * inputs.numberOfToolChanges;

  // Total cycle time per part
  const totalCycleTime = cuttingTime + rapidTime + toolChangeTime;

  // Time per part including setup amortized over quantity
  const setupPerPart = inputs.setupTime / inputs.quantity;
  const timePerPart = totalCycleTime + setupPerPart;

  // Total job time
  const totalJobTime = inputs.setupTime + totalCycleTime * inputs.quantity;

  // Parts per hour
  const partsPerHour = totalCycleTime > 0 ? 60 / totalCycleTime : 0;

  // Cost estimate (using average machine rate of $75/hr)
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

/**
 * Format time in minutes to readable string
 */
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
