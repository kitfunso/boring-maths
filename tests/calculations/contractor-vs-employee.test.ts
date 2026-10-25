/** Contractor vs employee. Goldens are hand-computed from the 2026 US, 2026/27 UK and EU country rules. */

import { describe, it, expect } from 'vitest';
import { calculateComparison_main } from '../../src/components/calculators/ContractorVsEmployeeCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/ContractorVsEmployeeCalculator/types';
import type { ContractorVsEmployeeInputs } from '../../src/components/calculators/ContractorVsEmployeeCalculator/types';
import { calculateSalary } from '../../src/components/calculators/EUSalaryCalculator/calculations';

describe('ContractorVsEmployeeCalculator', () => {
  describe('USD', () => {
    it('taxes the contractor on profit with SE tax, the standard and QBI deductions and state tax', () => {
      // Revenue 144,000; profit 139,100 after 2,400 expenses and 2,500 services
      // SE 19,654.20; AGI 139,100 - 9,827.10 - 21,600 - 7,200 = 100,472.90
      // Taxable 84,372.90 less QBI 16,874.58 = 67,498.32 -> federal 9,561.63; state 5% of AGI 5,023.64
      const { contractor } = calculateComparison_main(getDefaultInputs('USD'));
      expect(contractor.grossIncome).toBe(144000);
      expect(contractor.socialTax).toBeCloseTo(19654.20405, 4);
      expect(contractor.incomeTax).toBeCloseTo(14585.274943, 4);
      expect(contractor.netIncome).toBeCloseTo(76060.521007, 4);
    });

    it('taxes the employee on brackets after the standard deduction plus FICA', () => {
      // Pay 110,000: federal on 93,900 = 15,370; state 5,500; FICA 6,820 + 1,595
      const { employee, comparison } = calculateComparison_main(getDefaultInputs('USD'));
      expect(employee.incomeTax).toBeCloseTo(20870, 6);
      expect(employee.socialTax).toBeCloseTo(8415, 6);
      expect(employee.netIncome).toBeCloseTo(80715, 6);
      // Benefits 22,575.38, so employee value 103,290.38 beats contractor 76,060.52
      expect(comparison.winner).toBe('employee');
      expect(comparison.annualDifference).toBeCloseTo(27229.863609, 3);
    });

    it('adds the 0.9% Additional Medicare above the filing threshold', () => {
      const inputs: ContractorVsEmployeeInputs = {
        ...getDefaultInputs('USD'),
        employeeSalary: 250000,
        employeeBonusPercent: 0,
      };
      // 184,500 x 6.2% + 250,000 x 1.45% + 50,000 x 0.9%
      expect(calculateComparison_main(inputs).employee.socialTax).toBeCloseTo(15514, 6);
      const joint = calculateComparison_main({ ...inputs, filingStatus: 'married_jointly' });
      expect(joint.employee.socialTax).toBeCloseTo(15064, 6);
    });

    it('caps contractor Social Security at the 2026 wage base', () => {
      const inputs: ContractorVsEmployeeInputs = {
        ...getDefaultInputs('USD'),
        contractorHourlyRate: 125,
        contractorWeeksPerYear: 50,
      };
      // Profit 245,100 x 92.35% = 226,349.85; 184,500 x 12.4% + 226,349.85 x 2.9% + 26,349.85 x 0.9%
      const { contractor } = calculateComparison_main(inputs);
      expect(contractor.socialTax).toBeCloseTo(29679.29, 2);
    });

    it('solves break-even on the same tax model', () => {
      const result = calculateComparison_main(getDefaultInputs('USD'));
      const atBreakEven = calculateComparison_main({
        ...getDefaultInputs('USD'),
        contractorHourlyRate: result.comparison.breakEvenContractRate,
      });
      expect(atBreakEven.contractor.netIncome).toBeCloseTo(103290.3846, 2);
      expect(result.comparison.recommendedContractRate).toBe(
        Math.ceil((result.comparison.breakEvenContractRate * 1.1) / 5) * 5
      );

      const salaryEven = calculateComparison_main({
        ...getDefaultInputs('USD'),
        employeeSalary: result.comparison.breakEvenSalary,
      });
      const value = salaryEven.employee.totalCompensation - salaryEven.employee.totalCosts;
      expect(value).toBeCloseTo(result.contractor.netIncome, 2);
    });
  });

  describe('GBP', () => {
    it('charges the contractor Class 4 NI on profit and income tax after pension relief', () => {
      // Profit 105,600 - 2,400 - 2,000 = 101,200; Class 4: 37,700 x 6% + 50,930 x 2% = 3,280.60
      // Income tax on 101,200 - 15,840 pension = 85,360: 37,700 x 20% + 35,090 x 40% = 21,576
      const { contractor } = calculateComparison_main(getDefaultInputs('GBP'));
      expect(contractor.socialTax).toBeCloseTo(3280.6, 6);
      expect(contractor.incomeTax).toBeCloseTo(21576, 6);
      expect(contractor.netIncome).toBeCloseTo(58703.4, 6);
    });

    it('charges the employee income tax and Class 1 NI, not US FICA', () => {
      // Pay 77,000: tax 37,700 x 20% + 26,730 x 40% = 18,232; NI 37,700 x 8% + 26,730 x 2% = 3,550.60
      const { employee } = calculateComparison_main(getDefaultInputs('GBP'));
      expect(employee.incomeTax).toBeCloseTo(18232, 6);
      expect(employee.socialTax).toBeCloseTo(3550.6, 6);
    });
  });

  describe('EUR', () => {
    it('uses the chosen country model for the employee', () => {
      const inputs = { ...getDefaultInputs('EUR'), euCountry: 'IE' };
      const pay = inputs.employeeSalary * (1 + inputs.employeeBonusPercent / 100);
      const ireland = calculateSalary({ countryCode: 'IE', grossSalary: pay });
      const { employee } = calculateComparison_main(inputs);
      expect(employee.incomeTax).toBeCloseTo(ireland.incomeTax, 6);
      expect(employee.socialTax).toBeCloseTo(ireland.socialSecurity, 6);
    });

    it('charges the contractor the entered social rate on profit', () => {
      // Profit 115,200 - 2,400 - 2,200 = 110,600 at 15%
      const { contractor } = calculateComparison_main(getDefaultInputs('EUR'));
      expect(contractor.socialTax).toBeCloseTo(16590, 6);
      const germany = calculateSalary({ countryCode: 'DE', grossSalary: 110600 - 17280 });
      expect(contractor.incomeTax).toBeCloseTo(germany.incomeTax, 6);
    });
  });

  it('should produce consistent results', () => {
    const inputs = getDefaultInputs('USD');
    expect(calculateComparison_main(inputs)).toEqual(calculateComparison_main(inputs));
  });

  it('should yield finite outputs when numeric inputs are NaN', () => {
    const nanInputs: ContractorVsEmployeeInputs = {
      ...getDefaultInputs('USD'),
      contractorHourlyRate: NaN,
      employeeSalary: NaN,
      stateTaxRate: NaN,
    };

    const result = calculateComparison_main(nanInputs);

    expect(Number.isFinite(result.contractor.netIncome)).toBe(true);
    expect(Number.isFinite(result.employee.netIncome)).toBe(true);
    expect(Number.isFinite(result.comparison.annualDifference)).toBe(true);
    expect(Number.isFinite(result.comparison.breakEvenContractRate)).toBe(true);
  });
});
