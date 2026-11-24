import { describe, it, expect } from 'vitest';
import { calculateComparison_main } from '../../src/components/calculators/ContractorVsEmployeeCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/ContractorVsEmployeeCalculator/types';
import type { ContractorVsEmployeeInputs } from '../../src/components/calculators/ContractorVsEmployeeCalculator/types';
import { calculateSalary } from '../../src/components/calculators/EUSalaryCalculator/calculations';

describe('ContractorVsEmployeeCalculator', () => {
  describe('USD', () => {
    it('taxes the contractor on profit with SE tax, the standard and QBI deductions and state tax', () => {
      const { contractor } = calculateComparison_main(getDefaultInputs('USD'));
      expect(contractor.grossIncome).toBe(144000);
      expect(contractor.socialTax).toBeCloseTo(19654.20405, 4);
      expect(contractor.incomeTax).toBeCloseTo(14585.274943, 4);
      expect(contractor.netIncome).toBeCloseTo(76060.521007, 4);
    });

    it('taxes the employee on brackets after the standard deduction plus FICA', () => {
      const { employee, comparison } = calculateComparison_main(getDefaultInputs('USD'));
      expect(employee.incomeTax).toBeCloseTo(20870, 6);
      expect(employee.socialTax).toBeCloseTo(8415, 6);
      expect(employee.netIncome).toBeCloseTo(80715, 6);
      expect(comparison.winner).toBe('employee');
      expect(comparison.annualDifference).toBeCloseTo(27229.863609, 3);
    });

    it('adds the 0.9% Additional Medicare above the filing threshold', () => {
      const inputs: ContractorVsEmployeeInputs = {
        ...getDefaultInputs('USD'),
        employeeSalary: 250000,
        employeeBonusPercent: 0,
      };
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
      const { contractor } = calculateComparison_main(getDefaultInputs('GBP'));
      expect(contractor.socialTax).toBeCloseTo(3280.6, 6);
      expect(contractor.incomeTax).toBeCloseTo(21576, 6);
      expect(contractor.netIncome).toBeCloseTo(58703.4, 6);
    });

    it('charges the employee income tax and Class 1 NI, not US FICA', () => {
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
