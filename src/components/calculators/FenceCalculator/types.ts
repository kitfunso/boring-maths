/**
 * Fence Calculator - Type Definitions
 *
 * Calculate posts, panels, concrete, and hardware needed for fence projects.
 */

import type { Currency } from '../../../lib/regions';

export type FenceMaterial = 'wood' | 'vinyl' | 'chain_link' | 'aluminum' | 'composite';
export type FenceHeight = '4' | '6' | '8';

export interface FenceCalculatorInputs {
  currency: Currency;

  // Fence dimensions
  totalLength: number; // feet
  fenceHeight: FenceHeight;
  material: FenceMaterial;

  // Gates
  walkGates: number; // 3-4 ft wide
  driveGates: number; // 10-12 ft wide

  // Options
  postSpacing: number; // feet between posts (typically 6-8)
  concretePerPost: number; // bags per post (typically 2)
  doublePostCorners: boolean; // use 2 posts at corners
  cornerCount: number; // number of corners

  // Pricing
  pricePerPanel: number;
  pricePerPost: number;
  pricePerConcreteBag: number;
  pricePerWalkGate: number;
  pricePerDriveGate: number;
}

export interface FenceCalculatorResult {
  currency: Currency;

  // Materials needed
  panelsNeeded: number;
  postsNeeded: number;
  concreteBags: number;
  postCaps: number;
  railsNeeded: number; // for wood fences
  hardwareKits: number; // screws, brackets, etc.

  // Gate materials
  walkGateCount: number;
  driveGateCount: number;

  // Costs
  panelsCost: number;
  postsCost: number;
  concreteCost: number;
  gatesCost: number;
  hardwareCost: number;
  totalMaterialCost: number;

  // Labor estimate (if hired)
  laborCostLow: number;
  laborCostHigh: number;
  totalCostWithLabor: number;

  // Tips
  tips: string[];
}

// Panel width by material (feet)
export const PANEL_WIDTHS: Record<FenceMaterial, number> = {
  wood: 8, // typically 8 ft sections
  vinyl: 8,
  chain_link: 10, // 10 ft rolls
  aluminum: 6,
  composite: 6,
};

// Default prices by currency and material
export const MATERIAL_PRICES: Record<
  Currency,
  Record<FenceMaterial, { panel: number; post: number; walkGate: number; driveGate: number }>
> = {
  USD: {
    wood: { panel: 75, post: 15, walkGate: 150, driveGate: 400 },
    vinyl: { panel: 150, post: 35, walkGate: 250, driveGate: 600 },
    chain_link: { panel: 60, post: 20, walkGate: 125, driveGate: 350 },
    aluminum: { panel: 200, post: 45, walkGate: 300, driveGate: 700 },
    composite: { panel: 180, post: 40, walkGate: 275, driveGate: 650 },
  },
  GBP: {
    wood: { panel: 60, post: 12, walkGate: 120, driveGate: 320 },
    vinyl: { panel: 120, post: 28, walkGate: 200, driveGate: 480 },
    chain_link: { panel: 48, post: 16, walkGate: 100, driveGate: 280 },
    aluminum: { panel: 160, post: 36, walkGate: 240, driveGate: 560 },
    composite: { panel: 144, post: 32, walkGate: 220, driveGate: 520 },
  },
  EUR: {
    wood: { panel: 68, post: 14, walkGate: 135, driveGate: 360 },
    vinyl: { panel: 135, post: 32, walkGate: 225, driveGate: 540 },
    chain_link: { panel: 54, post: 18, walkGate: 112, driveGate: 315 },
    aluminum: { panel: 180, post: 40, walkGate: 270, driveGate: 630 },
    composite: { panel: 162, post: 36, walkGate: 248, driveGate: 585 },
  },
};

// Concrete prices
export const CONCRETE_PRICES: Record<Currency, number> = {
  USD: 5,
  GBP: 4,
  EUR: 4.5,
};

// Labor cost per linear foot by currency
export const LABOR_PER_FOOT: Record<Currency, { low: number; high: number }> = {
  USD: { low: 15, high: 30 },
  GBP: { low: 12, high: 25 },
  EUR: { low: 14, high: 28 },
};

export function getDefaultInputs(currency: Currency = 'USD'): FenceCalculatorInputs {
  const prices = MATERIAL_PRICES[currency].wood;

  return {
    currency,
    totalLength: 100,
    fenceHeight: '6',
    material: 'wood',
    walkGates: 1,
    driveGates: 0,
    postSpacing: 8,
    concretePerPost: 2,
    doublePostCorners: true,
    cornerCount: 4,
    pricePerPanel: prices.panel,
    pricePerPost: prices.post,
    pricePerConcreteBag: CONCRETE_PRICES[currency],
    pricePerWalkGate: prices.walkGate,
    pricePerDriveGate: prices.driveGate,
  };
}

export const DEFAULT_INPUTS: FenceCalculatorInputs = getDefaultInputs('USD');
