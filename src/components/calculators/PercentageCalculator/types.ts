export type CalculationMode =
  | 'percentOf'
  | 'whatPercent'
  | 'percentChange'
  | 'increaseDecrease';
export interface PercentageCalculatorInputs {
  mode: CalculationMode;

  percentOf_percentage: number;
  percentOf_value: number;

  whatPercent_partValue: number;
  whatPercent_wholeValue: number;

  percentChange_fromValue: number;
  percentChange_toValue: number;

  increaseDecrease_value: number;
  increaseDecrease_percentage: number;
  increaseDecrease_isIncrease: boolean;
}

export interface PercentageCalculatorResult {
  mode: CalculationMode;

  primaryResult: number;
  primaryLabel: string;

  secondaryResult?: number;
  secondaryLabel?: string;

  formattedPrimary: string;
  formattedSecondary?: string;

  commonPercentages?: {
    percentage: number;
    result: number;
    formatted: string;
  }[];
}

export interface ModeConfig {
  value: CalculationMode;
  label: string;
  question: string;
  icon: string;
}

export const MODE_OPTIONS: ModeConfig[] = [
  {
    value: 'percentOf',
    label: 'X% of Y',
    question: 'What is X% of Y?',
    icon: '%',
  },
  {
    value: 'whatPercent',
    label: 'X is ?% of Y',
    question: 'X is what percent of Y?',
    icon: '?',
  },
  {
    value: 'percentChange',
    label: '% Change',
    question: 'Percent change from X to Y',
    icon: '±',
  },
  {
    value: 'increaseDecrease',
    label: 'X ± Y%',
    question: 'Increase or decrease X by Y%',
    icon: '↕',
  },
];

export function getDefaultInputs(): PercentageCalculatorInputs {
  return {
    mode: 'percentOf',
    percentOf_percentage: 15,
    percentOf_value: 200,
    whatPercent_partValue: 30,
    whatPercent_wholeValue: 150,
    percentChange_fromValue: 100,
    percentChange_toValue: 125,
    increaseDecrease_value: 100,
    increaseDecrease_percentage: 20,
    increaseDecrease_isIncrease: true,
  };
}
