/**
 * Calculator Data Configurations
 *
 * Defines what data each calculator can import and export.
 * This creates the connection graph between calculators.
 */

import type { CalculatorDataConfig } from './types';

/**
 * Registry of all calculator configurations.
 * Keys are kebab-case calculator IDs matching URL slugs.
 */
export const CALCULATOR_CONFIGS: Record<string, CalculatorDataConfig> = {
  // === Income Calculators ===

  'freelance-day-rate': {
    id: 'freelance-day-rate',
    name: 'Freelance Day Rate Calculator',
    imports: ['annualIncome', 'currency'],
    exports: ['annualIncome', 'monthlyIncome', 'hourlyRate', 'dayRate', 'currency'],
  },

  'hourly-to-salary': {
    id: 'hourly-to-salary',
    name: 'Hourly to Salary Calculator',
    imports: ['hourlyRate', 'annualIncome', 'currency'],
    exports: ['annualIncome', 'monthlyIncome', 'hourlyRate', 'currency'],
  },

  'raise-calculator': {
    id: 'raise-calculator',
    name: 'Raise Calculator',
    imports: ['annualIncome', 'currency'],
    exports: ['annualIncome', 'currency'],
  },

  // === Finance Calculators ===

  'emergency-fund': {
    id: 'emergency-fund',
    name: 'Emergency Fund Calculator',
    imports: ['monthlyExpenses', 'monthlyIncome', 'currentSavings', 'currency'],
    exports: ['monthlyExpenses', 'emergencyFundTarget', 'currentSavings', 'currency'],
  },

  'savings-goal': {
    id: 'savings-goal',
    name: 'Savings Goal Calculator',
    imports: [
      'savingsGoal',
      'currentSavings',
      'monthlyContribution',
      'emergencyFundTarget',
      'currency',
    ],
    exports: ['savingsGoal', 'currentSavings', 'monthlyContribution', 'currency'],
  },

  'compound-interest': {
    id: 'compound-interest',
    name: 'Compound Interest Calculator',
    imports: ['currentSavings', 'monthlyContribution', 'currency'],
    exports: ['currentSavings', 'monthlyContribution', 'currency'],
  },

  'mortgage-calculator': {
    id: 'mortgage-calculator',
    name: 'Mortgage Calculator',
    imports: ['homePrice', 'annualIncome', 'currency'],
    exports: ['homePrice', 'mortgagePayment', 'loanAmount', 'currency'],
  },

  'loan-calculator': {
    id: 'loan-calculator',
    name: 'Loan Calculator',
    imports: ['loanAmount', 'currency'],
    exports: ['loanAmount', 'monthlyDebt', 'currency'],
  },

  'debt-payoff': {
    id: 'debt-payoff',
    name: 'Debt Payoff Calculator',
    imports: ['monthlyIncome', 'monthlyDebt', 'currency'],
    exports: ['monthlyDebt', 'currency'],
  },

  // === Health Calculators ===

  'bmi-calculator': {
    id: 'bmi-calculator',
    name: 'BMI Calculator',
    imports: ['heightCm', 'weightKg'],
    exports: ['heightCm', 'weightKg', 'bmi'],
  },

  'calorie-calculator': {
    id: 'calorie-calculator',
    name: 'Calorie Calculator',
    imports: ['heightCm', 'weightKg', 'age', 'gender', 'bmi'],
    exports: ['heightCm', 'weightKg', 'age', 'gender', 'tdee'],
  },

  'age-calculator': {
    id: 'age-calculator',
    name: 'Age Calculator',
    imports: [],
    exports: ['age'],
  },

  // === Event Calculators ===

  'wedding-alcohol': {
    id: 'wedding-alcohol',
    name: 'Wedding Alcohol Calculator',
    imports: ['guestCount'],
    exports: ['guestCount'],
  },

  'bbq-calculator': {
    id: 'bbq-calculator',
    name: 'BBQ Calculator',
    imports: ['guestCount'],
    exports: ['guestCount'],
  },

  // === Business Calculators ===

  'break-even': {
    id: 'break-even',
    name: 'Break-Even Calculator',
    imports: ['currency'],
    exports: ['currency'],
  },

  'side-hustle': {
    id: 'side-hustle',
    name: 'Side Hustle Profitability Calculator',
    imports: ['hourlyRate', 'currency'],
    exports: ['monthlyIncome', 'hourlyRate', 'currency'],
  },

  // === Everyday Calculators ===

  'tip-calculator': {
    id: 'tip-calculator',
    name: 'Tip Calculator',
    imports: ['currency'],
    exports: ['currency'],
  },

  'discount-calculator': {
    id: 'discount-calculator',
    name: 'Discount Calculator',
    imports: ['currency'],
    exports: ['currency'],
  },

  // === Home Calculators ===

  'electricity-cost': {
    id: 'electricity-cost',
    name: 'Electricity Cost Calculator',
    imports: ['currency'],
    exports: ['currency'],
  },

  'paint-calculator': {
    id: 'paint-calculator',
    name: 'Paint Calculator',
    imports: [],
    exports: [],
  },
};

/**
 * Get configuration for a specific calculator by ID.
 */
export function getCalculatorConfig(id: string): CalculatorDataConfig | undefined {
  return CALCULATOR_CONFIGS[id];
}

/**
 * Get all calculators that could receive data from a given calculator.
 * Useful for showing "data will be available in..." messaging.
 */
export function getConnectedCalculators(sourceId: string): CalculatorDataConfig[] {
  const source = CALCULATOR_CONFIGS[sourceId];
  if (!source) return [];

  const connected: CalculatorDataConfig[] = [];

  for (const config of Object.values(CALCULATOR_CONFIGS)) {
    if (config.id === sourceId) continue;

    // Check if any exports from source match imports in this calculator
    const hasConnection = source.exports.some((exp) => config.imports.includes(exp));

    if (hasConnection) {
      connected.push(config);
    }
  }

  return connected;
}
