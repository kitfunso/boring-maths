/**
 * Sleep Calculator - Calculations
 *
 * Based on 90-minute sleep cycles for optimal wake times.
 */

import type { SleepInputs, SleepResult, SleepCycle, NapResult, AgeGroup } from './types';
import { AGE_SLEEP_NEEDS } from './types';

const SLEEP_CYCLE_MINUTES = 90;

const SLEEP_TIPS = [
  'Avoid screens for 1 hour before bed for better melatonin production.',
  'Keep your bedroom cool (65-68°F / 18-20°C) for optimal sleep.',
  'Consistent sleep schedule helps regulate your circadian rhythm.',
  'Avoid caffeine at least 6 hours before bedtime.',
  'Exercise regularly, but not within 3 hours of bedtime.',
  'A dark room promotes deeper sleep - consider blackout curtains.',
  'Limit naps to 20-30 minutes to avoid affecting nighttime sleep.',
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function parseTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function getQuality(cycles: number, ageGroup: AgeGroup): 'optimal' | 'good' | 'fair' {
  const needs = AGE_SLEEP_NEEDS[ageGroup];
  const hours = (cycles * SLEEP_CYCLE_MINUTES) / 60;

  if (hours >= needs.min && hours <= needs.max) {
    if (Math.abs(hours - needs.optimal) <= 0.5) return 'optimal';
    return 'good';
  }
  return 'fair';
}

export function calculateSleepTimes(inputs: SleepInputs): SleepResult {
  const recommendations: SleepCycle[] = [];

  if (inputs.mode === 'wakeTime') {
    // Calculate optimal bed times for a given wake time
    const wakeDate = parseTime(inputs.wakeTime);

    // Generate options for 4, 5, 6, 7 cycles (6h, 7.5h, 9h, 10.5h)
    for (let cycles = 6; cycles >= 4; cycles--) {
      const sleepMinutes = cycles * SLEEP_CYCLE_MINUTES;
      const totalMinutes = sleepMinutes + inputs.fallAsleepMinutes;

      const bedDate = new Date(wakeDate);
      bedDate.setMinutes(bedDate.getMinutes() - totalMinutes);

      recommendations.push({
        cycles,
        wakeTime: formatTime(wakeDate),
        bedTime: formatTime(bedDate),
        sleepDuration: formatDuration(sleepMinutes),
        quality: getQuality(cycles, inputs.ageGroup),
      });
    }
  } else if (inputs.mode === 'bedTime') {
    // Calculate optimal wake times for a given bed time
    const bedDate = parseTime(inputs.bedTime);
    const fallAsleepDate = new Date(bedDate);
    fallAsleepDate.setMinutes(fallAsleepDate.getMinutes() + inputs.fallAsleepMinutes);

    // Generate options for 4, 5, 6, 7 cycles
    for (let cycles = 4; cycles <= 6; cycles++) {
      const sleepMinutes = cycles * SLEEP_CYCLE_MINUTES;

      const wakeDate = new Date(fallAsleepDate);
      wakeDate.setMinutes(wakeDate.getMinutes() + sleepMinutes);

      recommendations.push({
        cycles,
        wakeTime: formatTime(wakeDate),
        bedTime: formatTime(bedDate),
        sleepDuration: formatDuration(sleepMinutes),
        quality: getQuality(cycles, inputs.ageGroup),
      });
    }
  }

  const needs = AGE_SLEEP_NEEDS[inputs.ageGroup];
  const tipIndex = Math.floor(Math.random() * SLEEP_TIPS.length);

  return {
    recommendations,
    optimalSleep: `${needs.min}-${needs.max} hours`,
    cycleLength: SLEEP_CYCLE_MINUTES,
    tipOfTheDay: SLEEP_TIPS[tipIndex],
  };
}

export function calculateNapTimes(startTime: string): NapResult[] {
  const napStart = parseTime(startTime);

  return [
    {
      wakeTime: formatTime(new Date(napStart.getTime() + 20 * 60000)),
      napDuration: '20 min',
      napType: 'power',
      benefit: 'Alertness boost without grogginess',
    },
    {
      wakeTime: formatTime(new Date(napStart.getTime() + 45 * 60000)),
      napDuration: '45 min',
      napType: 'short',
      benefit: 'Light sleep, avoid if possible (wake during light sleep)',
    },
    {
      wakeTime: formatTime(new Date(napStart.getTime() + 90 * 60000)),
      napDuration: '90 min',
      napType: 'full',
      benefit: 'Full cycle with REM - best for creativity',
    },
  ];
}
