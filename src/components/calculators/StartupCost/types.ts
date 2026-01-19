/**
 * Startup Cost Calculator - Type Definitions
 *
 * Estimate total startup costs based on business type,
 * location, employees, and runway requirements.
 */

import type { Currency } from '../../../lib/regions';

export type BusinessType =
  | 'restaurant'
  | 'consulting'
  | 'ecommerce'
  | 'retail'
  | 'saas'
  | 'service';

export interface BusinessTypeConfig {
  id: BusinessType;
  label: string;
  description: string;
  /** Base one-time costs */
  baseCosts: {
    equipment: number;
    legalFees: number;
    permits: number;
    branding: number;
    inventory: number;
    deposit: number;
    renovation: number;
  };
  /** Base monthly costs */
  monthlyCosts: {
    rent: number;
    utilities: number;
    software: number;
    marketing: number;
    insurance: number;
    supplies: number;
  };
}

export const BUSINESS_TYPES: Record<Currency, Record<BusinessType, BusinessTypeConfig>> = {
  USD: {
    restaurant: {
      id: 'restaurant',
      label: 'Restaurant / Food Service',
      description: 'Full-service restaurant, cafe, or food truck',
      baseCosts: {
        equipment: 75000,
        legalFees: 3000,
        permits: 5000,
        branding: 5000,
        inventory: 10000,
        deposit: 15000,
        renovation: 50000,
      },
      monthlyCosts: {
        rent: 5000,
        utilities: 800,
        software: 200,
        marketing: 1000,
        insurance: 500,
        supplies: 2000,
      },
    },
    consulting: {
      id: 'consulting',
      label: 'Consulting / Professional Services',
      description: 'Management, IT, or other consulting',
      baseCosts: {
        equipment: 3000,
        legalFees: 2000,
        permits: 500,
        branding: 3000,
        inventory: 0,
        deposit: 0,
        renovation: 0,
      },
      monthlyCosts: {
        rent: 0,
        utilities: 100,
        software: 300,
        marketing: 500,
        insurance: 200,
        supplies: 100,
      },
    },
    ecommerce: {
      id: 'ecommerce',
      label: 'E-Commerce',
      description: 'Online store selling products',
      baseCosts: {
        equipment: 2000,
        legalFees: 1500,
        permits: 200,
        branding: 5000,
        inventory: 15000,
        deposit: 0,
        renovation: 0,
      },
      monthlyCosts: {
        rent: 0,
        utilities: 50,
        software: 500,
        marketing: 2000,
        insurance: 150,
        supplies: 500,
      },
    },
    retail: {
      id: 'retail',
      label: 'Retail Store',
      description: 'Physical retail location',
      baseCosts: {
        equipment: 15000,
        legalFees: 2000,
        permits: 1000,
        branding: 5000,
        inventory: 30000,
        deposit: 10000,
        renovation: 20000,
      },
      monthlyCosts: {
        rent: 3500,
        utilities: 400,
        software: 200,
        marketing: 1000,
        insurance: 300,
        supplies: 500,
      },
    },
    saas: {
      id: 'saas',
      label: 'SaaS / Software',
      description: 'Software as a service business',
      baseCosts: {
        equipment: 5000,
        legalFees: 5000,
        permits: 200,
        branding: 10000,
        inventory: 0,
        deposit: 0,
        renovation: 0,
      },
      monthlyCosts: {
        rent: 0,
        utilities: 100,
        software: 1000,
        marketing: 3000,
        insurance: 200,
        supplies: 0,
      },
    },
    service: {
      id: 'service',
      label: 'Service Business',
      description: 'Cleaning, landscaping, handyman, etc.',
      baseCosts: {
        equipment: 8000,
        legalFees: 1500,
        permits: 500,
        branding: 2000,
        inventory: 2000,
        deposit: 0,
        renovation: 0,
      },
      monthlyCosts: {
        rent: 0,
        utilities: 150,
        software: 100,
        marketing: 500,
        insurance: 300,
        supplies: 500,
      },
    },
  },
  GBP: {
    restaurant: {
      id: 'restaurant',
      label: 'Restaurant / Food Service',
      description: 'Full-service restaurant, cafe, or food truck',
      baseCosts: {
        equipment: 60000,
        legalFees: 2500,
        permits: 4000,
        branding: 4000,
        inventory: 8000,
        deposit: 12000,
        renovation: 40000,
      },
      monthlyCosts: {
        rent: 4000,
        utilities: 650,
        software: 160,
        marketing: 800,
        insurance: 400,
        supplies: 1600,
      },
    },
    consulting: {
      id: 'consulting',
      label: 'Consulting / Professional Services',
      description: 'Management, IT, or other consulting',
      baseCosts: {
        equipment: 2500,
        legalFees: 1600,
        permits: 400,
        branding: 2500,
        inventory: 0,
        deposit: 0,
        renovation: 0,
      },
      monthlyCosts: {
        rent: 0,
        utilities: 80,
        software: 250,
        marketing: 400,
        insurance: 160,
        supplies: 80,
      },
    },
    ecommerce: {
      id: 'ecommerce',
      label: 'E-Commerce',
      description: 'Online store selling products',
      baseCosts: {
        equipment: 1600,
        legalFees: 1200,
        permits: 150,
        branding: 4000,
        inventory: 12000,
        deposit: 0,
        renovation: 0,
      },
      monthlyCosts: {
        rent: 0,
        utilities: 40,
        software: 400,
        marketing: 1600,
        insurance: 120,
        supplies: 400,
      },
    },
    retail: {
      id: 'retail',
      label: 'Retail Store',
      description: 'Physical retail location',
      baseCosts: {
        equipment: 12000,
        legalFees: 1600,
        permits: 800,
        branding: 4000,
        inventory: 24000,
        deposit: 8000,
        renovation: 16000,
      },
      monthlyCosts: {
        rent: 2800,
        utilities: 320,
        software: 160,
        marketing: 800,
        insurance: 250,
        supplies: 400,
      },
    },
    saas: {
      id: 'saas',
      label: 'SaaS / Software',
      description: 'Software as a service business',
      baseCosts: {
        equipment: 4000,
        legalFees: 4000,
        permits: 150,
        branding: 8000,
        inventory: 0,
        deposit: 0,
        renovation: 0,
      },
      monthlyCosts: {
        rent: 0,
        utilities: 80,
        software: 800,
        marketing: 2500,
        insurance: 160,
        supplies: 0,
      },
    },
    service: {
      id: 'service',
      label: 'Service Business',
      description: 'Cleaning, landscaping, handyman, etc.',
      baseCosts: {
        equipment: 6500,
        legalFees: 1200,
        permits: 400,
        branding: 1600,
        inventory: 1600,
        deposit: 0,
        renovation: 0,
      },
      monthlyCosts: {
        rent: 0,
        utilities: 120,
        software: 80,
        marketing: 400,
        insurance: 250,
        supplies: 400,
      },
    },
  },
  EUR: {
    restaurant: {
      id: 'restaurant',
      label: 'Restaurant / Food Service',
      description: 'Full-service restaurant, cafe, or food truck',
      baseCosts: {
        equipment: 70000,
        legalFees: 2800,
        permits: 4500,
        branding: 4500,
        inventory: 9000,
        deposit: 14000,
        renovation: 45000,
      },
      monthlyCosts: {
        rent: 4500,
        utilities: 720,
        software: 180,
        marketing: 900,
        insurance: 450,
        supplies: 1800,
      },
    },
    consulting: {
      id: 'consulting',
      label: 'Consulting / Professional Services',
      description: 'Management, IT, or other consulting',
      baseCosts: {
        equipment: 2700,
        legalFees: 1800,
        permits: 450,
        branding: 2700,
        inventory: 0,
        deposit: 0,
        renovation: 0,
      },
      monthlyCosts: {
        rent: 0,
        utilities: 90,
        software: 270,
        marketing: 450,
        insurance: 180,
        supplies: 90,
      },
    },
    ecommerce: {
      id: 'ecommerce',
      label: 'E-Commerce',
      description: 'Online store selling products',
      baseCosts: {
        equipment: 1800,
        legalFees: 1350,
        permits: 180,
        branding: 4500,
        inventory: 13500,
        deposit: 0,
        renovation: 0,
      },
      monthlyCosts: {
        rent: 0,
        utilities: 45,
        software: 450,
        marketing: 1800,
        insurance: 135,
        supplies: 450,
      },
    },
    retail: {
      id: 'retail',
      label: 'Retail Store',
      description: 'Physical retail location',
      baseCosts: {
        equipment: 13500,
        legalFees: 1800,
        permits: 900,
        branding: 4500,
        inventory: 27000,
        deposit: 9000,
        renovation: 18000,
      },
      monthlyCosts: {
        rent: 3150,
        utilities: 360,
        software: 180,
        marketing: 900,
        insurance: 270,
        supplies: 450,
      },
    },
    saas: {
      id: 'saas',
      label: 'SaaS / Software',
      description: 'Software as a service business',
      baseCosts: {
        equipment: 4500,
        legalFees: 4500,
        permits: 180,
        branding: 9000,
        inventory: 0,
        deposit: 0,
        renovation: 0,
      },
      monthlyCosts: {
        rent: 0,
        utilities: 90,
        software: 900,
        marketing: 2700,
        insurance: 180,
        supplies: 0,
      },
    },
    service: {
      id: 'service',
      label: 'Service Business',
      description: 'Cleaning, landscaping, handyman, etc.',
      baseCosts: {
        equipment: 7200,
        legalFees: 1350,
        permits: 450,
        branding: 1800,
        inventory: 1800,
        deposit: 0,
        renovation: 0,
      },
      monthlyCosts: {
        rent: 0,
        utilities: 135,
        software: 90,
        marketing: 450,
        insurance: 270,
        supplies: 450,
      },
    },
  },
};

export interface StartupCostInputs {
  currency: Currency;
  businessType: BusinessType;
  employees: number;
  runwayMonths: number;
  includeContingency: boolean;
  contingencyPercent: number;
  founderSalary: number;
  needsOffice: boolean;
  customEquipment: number;
  customInventory: number;
}

export interface CostBreakdownItem {
  category: string;
  amount: number;
  type: 'one-time' | 'monthly';
  description: string;
}

export interface StartupCostResult {
  currency: Currency;

  /** Total one-time costs */
  oneTimeCosts: number;
  /** Monthly burn rate */
  monthlyBurnRate: number;
  /** Total capital needed for runway */
  totalCapitalNeeded: number;
  /** Contingency buffer */
  contingencyBuffer: number;

  /** Detailed breakdown */
  oneTimeBreakdown: CostBreakdownItem[];
  monthlyBreakdown: CostBreakdownItem[];

  /** Key metrics */
  costPerEmployee: number;
  dailyBurnRate: number;
  weeklyBurnRate: number;

  /** Runway analysis */
  breakdownByMonth: { month: number; remaining: number; spent: number }[];

  /** Tips based on business type */
  tips: string[];
}

/** Average salary by currency for employee cost estimates */
export const AVG_EMPLOYEE_SALARY: Record<Currency, number> = {
  USD: 50000,
  GBP: 35000,
  EUR: 40000,
};

export function getDefaultInputs(currency: Currency = 'USD'): StartupCostInputs {
  const salaryMultiplier = currency === 'GBP' ? 0.8 : currency === 'EUR' ? 0.9 : 1;

  return {
    currency,
    businessType: 'consulting',
    employees: 0,
    runwayMonths: 12,
    includeContingency: true,
    contingencyPercent: 20,
    founderSalary: Math.round(4000 * salaryMultiplier),
    needsOffice: false,
    customEquipment: 0,
    customInventory: 0,
  };
}

export const DEFAULT_INPUTS: StartupCostInputs = getDefaultInputs('USD');
