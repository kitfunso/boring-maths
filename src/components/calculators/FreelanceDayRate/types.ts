/**
 * Freelance Day Rate Calculator - Type Definitions
 *
 * This calculator helps freelancers determine their ideal day rate
 * by comparing to equivalent salaried positions with tax adjustments.
 */

/**
 * Input values for the Freelance Day Rate Calculator
 */
export interface FreelanceDayRateInputs {
  /** Target annual income in dollars */
  annualSalary: number;

  /** Estimated tax rate as decimal (0.25 = 25%) */
  taxRate: number;

  /** Number of vacation days per year */
  vacationDays: number;

  /** Number of public holidays per year */
  holidays: number;

  /** Annual value of benefits to self-fund (health insurance, retirement, etc.) */
  benefitsValue: number;
}

/**
 * Calculated results from the Freelance Day Rate Calculator
 */
export interface FreelanceDayRateResult {
  /** Day rate before taxes */
  grossDayRate: number;

  /** Day rate after taxes */
  netDayRate: number;

  /** Hourly rate based on 8-hour workday */
  hourlyRate: number;

  /** Monthly income at full utilization (21.7 working days) */
  monthlyIncome: number;

  /** Number of billable working days per year */
  workingDays: number;

  /** Weekly income at full utilization */
  weeklyIncome: number;

  /** Annual income comparison */
  annualComparison: {
    /** What you'd earn as an employee */
    asEmployee: number;
    /** What you'd earn as a freelancer at this rate */
    asFreelancer: number;
    /** Difference between freelance and employee income */
    difference: number;
  };
}

/**
 * Default input values for the calculator
 */
export const DEFAULT_INPUTS: FreelanceDayRateInputs = {
  annualSalary: 75000,
  taxRate: 0.25,
  vacationDays: 15,
  holidays: 10,
  benefitsValue: 0,
};

/**
 * Input field configuration for UI generation
 */
export interface InputFieldConfig {
  id: keyof FreelanceDayRateInputs;
  label: string;
  type: 'currency' | 'percentage' | 'number';
  min: number;
  max: number;
  step: number;
  helpText: string;
  required: boolean;
}

/**
 * Configuration for all input fields
 */
export const INPUT_FIELD_CONFIG: InputFieldConfig[] = [
  {
    id: 'annualSalary',
    label: 'Target Annual Salary',
    type: 'currency',
    min: 0,
    max: 1000000,
    step: 1000,
    helpText: 'Your target annual income before taxes',
    required: true,
  },
  {
    id: 'taxRate',
    label: 'Estimated Tax Rate',
    type: 'percentage',
    min: 0,
    max: 50,
    step: 1,
    helpText: 'Combined federal, state, and self-employment tax rate',
    required: true,
  },
  {
    id: 'vacationDays',
    label: 'Vacation Days Per Year',
    type: 'number',
    min: 0,
    max: 60,
    step: 1,
    helpText: 'Days you plan to take off (unpaid)',
    required: true,
  },
  {
    id: 'holidays',
    label: 'Public Holidays',
    type: 'number',
    min: 0,
    max: 30,
    step: 1,
    helpText: 'Days you won\'t work due to holidays',
    required: false,
  },
  {
    id: 'benefitsValue',
    label: 'Benefits Value',
    type: 'currency',
    min: 0,
    max: 100000,
    step: 500,
    helpText: 'Annual cost of benefits you\'ll self-fund (health insurance, retirement, etc.)',
    required: false,
  },
];
