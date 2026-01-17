/**
 * EI Dosing Calculator Types
 * Estimative Index method for planted aquarium fertilization
 */

export interface EIDosingInputs {
  tankVolume: number;
  volumeUnit: 'gallons' | 'liters';
  dosingSched: 'ei-standard' | 'ei-low-light' | 'pps-pro' | 'custom';
  // Custom dosing targets (ppm per week)
  nitrateTarget: number;
  phosphateTarget: number;
  potassiumTarget: number;
  ironTarget: number;
  // Fertilizer concentrations
  fertilizerType: 'dry' | 'liquid';
  waterChangePercent: number;
  waterChangeFrequency: 'weekly' | 'biweekly';
}

export interface EIDosingResults {
  // Per dose amounts (3x per week for macros, 3x for micros)
  kno3PerDose: number;
  kh2po4PerDose: number;
  k2so4PerDose: number;
  mgso4PerDose: number;
  csmBPerDose: number;
  // Weekly totals
  kno3Weekly: number;
  kh2po4Weekly: number;
  k2so4Weekly: number;
  mgso4Weekly: number;
  csmBWeekly: number;
  // Target ppms achieved
  nitrateAchieved: number;
  phosphateAchieved: number;
  potassiumAchieved: number;
  ironAchieved: number;
  // Display unit
  doseUnit: string;
}

// Dosing schedule presets (ppm targets per week)
export const DOSING_SCHEDULES = [
  {
    value: 'ei-standard',
    label: 'EI Standard (High Light/CO2)',
    no3: 30,
    po4: 3,
    k: 30,
    fe: 0.5,
    description: 'For high-light, CO2-injected tanks'
  },
  {
    value: 'ei-low-light',
    label: 'EI Low Light',
    no3: 15,
    po4: 1.5,
    k: 15,
    fe: 0.25,
    description: 'For low-light or non-CO2 tanks'
  },
  {
    value: 'pps-pro',
    label: 'PPS-Pro (Leaner)',
    no3: 10,
    po4: 1,
    k: 10,
    fe: 0.2,
    description: 'Perpetual Preservation System - lean dosing'
  },
  {
    value: 'custom',
    label: 'Custom Targets',
    no3: 20,
    po4: 2,
    k: 20,
    fe: 0.3,
    description: 'Set your own ppm targets'
  },
];

// Common fertilizer compounds and their nutrient content
export const FERTILIZERS = {
  kno3: {
    name: 'Potassium Nitrate (KNO3)',
    no3Percent: 61.3,
    kPercent: 38.7,
    gramsPerTsp: 6,
  },
  kh2po4: {
    name: 'Monopotassium Phosphate (KH2PO4)',
    po4Percent: 69.8,
    kPercent: 28.7,
    gramsPerTsp: 5.8,
  },
  k2so4: {
    name: 'Potassium Sulfate (K2SO4)',
    kPercent: 44.8,
    gramsPerTsp: 6.5,
  },
  mgso4: {
    name: 'Magnesium Sulfate (MgSO4·7H2O)',
    mgPercent: 9.9,
    gramsPerTsp: 5,
  },
  csmB: {
    name: 'CSM+B (Plantex)',
    fePercent: 7,
    gramsPerTsp: 5,
  },
};

// Tank size presets
export const TANK_PRESETS = [
  { label: '10 gallon', gallons: 10 },
  { label: '20 gallon', gallons: 20 },
  { label: '29 gallon', gallons: 29 },
  { label: '40 gallon', gallons: 40 },
  { label: '55 gallon', gallons: 55 },
  { label: '75 gallon', gallons: 75 },
  { label: '90 gallon', gallons: 90 },
  { label: '125 gallon', gallons: 125 },
];
