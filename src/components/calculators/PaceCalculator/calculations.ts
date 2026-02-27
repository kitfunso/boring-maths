/**
 * Pace Calculator - Calculation Logic
 *
 * Pure functions for pace, time, and distance calculations.
 * Conversion: 1 mile = 1.60934 km
 */

import { RACE_DISTANCES, type PaceCalculatorInputs, type PaceCalculatorResult } from './types';

const KM_PER_MILE = 1.60934;

/**
 * Format total seconds into HH:MM:SS or MM:SS string
 */
function formatTime(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds < 0) return '--:--';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Format pace as MM:SS per unit
 */
function formatPace(secondsPerUnit: number): string {
  if (!isFinite(secondsPerUnit) || secondsPerUnit <= 0) return '--:--';
  const m = Math.floor(secondsPerUnit / 60);
  const s = Math.round(secondsPerUnit % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Calculate pace, time, or distance based on mode
 */
export function calculatePace(inputs: PaceCalculatorInputs): PaceCalculatorResult {
  const { mode, distanceUnit, distance, hours, minutes, seconds, paceMinutes, paceSeconds } =
    inputs;

  const invalid: PaceCalculatorResult = {
    valid: false,
    pacePerKm: '--:--',
    pacePerMile: '--:--',
    speedKmh: '--',
    speedMph: '--',
    totalTime: '--:--',
    totalDistance: '--',
    totalDistanceUnit: distanceUnit,
    splits: [],
  };

  let distanceKm: number;
  let totalSeconds: number;
  let paceSecondsPerKm: number;

  if (mode === 'pace') {
    // Calculate pace from distance + time
    if (distance <= 0) return invalid;
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds <= 0) return invalid;

    distanceKm = distanceUnit === 'miles' ? distance * KM_PER_MILE : distance;
    paceSecondsPerKm = totalSeconds / distanceKm;
  } else if (mode === 'time') {
    // Calculate time from distance + pace
    if (distance <= 0) return invalid;
    const paceTotal = paceMinutes * 60 + paceSeconds;
    if (paceTotal <= 0) return invalid;

    distanceKm = distanceUnit === 'miles' ? distance * KM_PER_MILE : distance;
    // Pace input is per km or per mile depending on unit
    paceSecondsPerKm = distanceUnit === 'miles' ? paceTotal / KM_PER_MILE : paceTotal;
    totalSeconds = paceSecondsPerKm * distanceKm;
  } else {
    // Calculate distance from pace + time
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds <= 0) return invalid;
    const paceTotal = paceMinutes * 60 + paceSeconds;
    if (paceTotal <= 0) return invalid;

    // Pace input is per km or per mile depending on unit
    paceSecondsPerKm = distanceUnit === 'miles' ? paceTotal / KM_PER_MILE : paceTotal;
    distanceKm = totalSeconds / paceSecondsPerKm;
  }

  const paceSecondsPerMile = paceSecondsPerKm * KM_PER_MILE;
  const speedKmh = 3600 / paceSecondsPerKm;
  const speedMph = speedKmh / KM_PER_MILE;

  const distanceInUnit = distanceUnit === 'miles' ? distanceKm / KM_PER_MILE : distanceKm;

  // Generate splits for common race distances
  const splits = RACE_DISTANCES.map((race) => ({
    label: race.label,
    km: race.km,
    time: formatTime(paceSecondsPerKm * race.km),
  }));

  return {
    valid: true,
    pacePerKm: formatPace(paceSecondsPerKm),
    pacePerMile: formatPace(paceSecondsPerMile),
    speedKmh: speedKmh.toLocaleString('en-GB', { maximumFractionDigits: 1 }),
    speedMph: speedMph.toLocaleString('en-GB', { maximumFractionDigits: 1 }),
    totalTime: formatTime(totalSeconds),
    totalDistance: distanceInUnit.toLocaleString('en-GB', { maximumFractionDigits: 2 }),
    totalDistanceUnit: distanceUnit,
    splits,
  };
}
