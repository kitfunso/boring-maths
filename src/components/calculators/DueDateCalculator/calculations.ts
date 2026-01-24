/**
 * Due Date Calculator - Calculations
 */

import type { DueDateInputs, DueDateResult, Milestone } from './types';

const PREGNANCY_DAYS = 280; // 40 weeks
const MILESTONES_DATA = [
  { week: 4, name: 'Implantation', description: 'Embryo implants in uterus' },
  { week: 6, name: 'Heartbeat', description: 'Heart begins beating' },
  { week: 8, name: 'First Prenatal Visit', description: 'Typically schedule first appointment' },
  { week: 10, name: 'Fingers & Toes', description: 'Fingers and toes fully formed' },
  { week: 12, name: 'End of First Trimester', description: 'Risk of miscarriage decreases' },
  { week: 16, name: 'Gender Reveal', description: 'Gender may be visible on ultrasound' },
  { week: 20, name: 'Halfway Point', description: 'Anatomy scan, feeling movement' },
  { week: 24, name: 'Viability Milestone', description: 'Baby reaches viability' },
  { week: 28, name: 'Third Trimester', description: 'Final stretch begins' },
  { week: 32, name: 'Baby Shower Time', description: 'Common time for baby showers' },
  { week: 36, name: 'Full Term Soon', description: 'Baby is almost fully developed' },
  { week: 37, name: 'Early Term', description: 'Baby considered early term' },
  { week: 39, name: 'Full Term', description: 'Baby is full term' },
  { week: 40, name: 'Due Date', description: 'Estimated due date' },
];

export function calculateDueDate(inputs: DueDateInputs): DueDateResult {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dueDate: Date;
  let conceptionDate: Date;

  switch (inputs.method) {
    case 'lmp': {
      const lmp = new Date(inputs.lmpDate);
      // Naegele's rule: LMP + 280 days (adjusted for cycle length)
      const adjustment = inputs.cycleLength - 28;
      dueDate = new Date(lmp);
      dueDate.setDate(dueDate.getDate() + PREGNANCY_DAYS + adjustment);
      // Conception typically occurs around day 14 of cycle
      conceptionDate = new Date(lmp);
      conceptionDate.setDate(conceptionDate.getDate() + 14 + adjustment);
      break;
    }
    case 'conception': {
      conceptionDate = new Date(inputs.conceptionDate);
      // Due date is 266 days after conception
      dueDate = new Date(conceptionDate);
      dueDate.setDate(dueDate.getDate() + 266);
      break;
    }
    case 'ivf': {
      const ivfDate = new Date(inputs.ivfDate);
      conceptionDate = new Date(ivfDate);
      // Adjust based on embryo day
      const daysToAdd = inputs.ivfDayType === '3day' ? 263 : 261; // 266 - 3 or 266 - 5
      dueDate = new Date(ivfDate);
      dueDate.setDate(dueDate.getDate() + daysToAdd);
      break;
    }
    case 'ultrasound': {
      const usDate = new Date(inputs.ultrasoundDate);
      const gestationalDays = inputs.ultrasoundWeeks * 7 + inputs.ultrasoundDays;
      // Calculate LMP equivalent
      const lmpEquiv = new Date(usDate);
      lmpEquiv.setDate(lmpEquiv.getDate() - gestationalDays);
      dueDate = new Date(lmpEquiv);
      dueDate.setDate(dueDate.getDate() + PREGNANCY_DAYS);
      conceptionDate = new Date(lmpEquiv);
      conceptionDate.setDate(conceptionDate.getDate() + 14);
      break;
    }
  }

  // Calculate current gestational age
  let lmpEquivalent: Date;
  if (inputs.method === 'lmp') {
    lmpEquivalent = new Date(inputs.lmpDate);
  } else {
    // Work backwards from due date
    lmpEquivalent = new Date(dueDate);
    lmpEquivalent.setDate(lmpEquivalent.getDate() - PREGNANCY_DAYS);
  }

  const daysSinceLMP = Math.floor(
    (today.getTime() - lmpEquivalent.getTime()) / (1000 * 60 * 60 * 24)
  );
  const currentWeeks = Math.floor(daysSinceLMP / 7);
  const currentDays = daysSinceLMP % 7;
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Determine trimester
  let trimester: 1 | 2 | 3;
  let trimesterName: string;
  if (currentWeeks < 13) {
    trimester = 1;
    trimesterName = 'First Trimester';
  } else if (currentWeeks < 27) {
    trimester = 2;
    trimesterName = 'Second Trimester';
  } else {
    trimester = 3;
    trimesterName = 'Third Trimester';
  }

  // Calculate milestones
  const milestones: Milestone[] = MILESTONES_DATA.map((m) => {
    const milestoneDate = new Date(lmpEquivalent);
    milestoneDate.setDate(milestoneDate.getDate() + m.week * 7);
    return {
      ...m,
      date: milestoneDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isPast: today >= milestoneDate,
    };
  });

  const percentComplete = Math.min(100, Math.round((daysSinceLMP / PREGNANCY_DAYS) * 100));

  return {
    dueDate,
    dueDateFormatted: dueDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    currentWeeks: Math.max(0, currentWeeks),
    currentDays: Math.max(0, currentDays),
    trimester,
    trimesterName,
    daysUntilDue: Math.max(0, daysUntilDue),
    daysPregnant: Math.max(0, daysSinceLMP),
    percentComplete,
    conceptionDateEstimate: conceptionDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    milestones,
  };
}
