/**
 * ContractorVsEmployee Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateComparison_main } from '../../src/components/calculators/ContractorVsEmployeeCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/ContractorVsEmployeeCalculator/types';
import type { ContractorVsEmployeeInputs } from '../../src/components/calculators/ContractorVsEmployeeCalculator/types';

describe('ContractorVsEmployeeCalculator', () => {
  describe('calculateComparison_main', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs('USD');

      const result = calculateComparison_main(inputs);

      expect(result).toBeDefined();
      expect(result.contractor).toBeDefined();
      expect(result.employee).toBeDefined();
      expect(result.comparison).toBeDefined();
      expect(result.contractor.grossIncome).toBeGreaterThan(0);
      expect(result.employee.grossIncome).toBeGreaterThan(0);
    });

    it('should calculate comparison correctly', () => {
      const inputs: ContractorVsEmployeeInputs = {
        contractorHourlyRate: 100,
        contractorBillableHoursPerWeek: 40,
        contractorWeeksPerYear: 48,
        employeeSalary: 100000,
        employeeBonusPercent: 10,
        employer401kMatch: 4,
        employer401kMatchLimit: 6,
        employerHealthInsuranceMonthly: 500,
        employerDentalVisionMonthly: 50,
        employerLifeDisabilityMonthly: 30,
        paidTimeOffDays: 15,
        paidHolidaysDays: 10,
        otherBenefitsAnnual: 2000,
        contractorHealthInsuranceMonthly: 600,
        contractorRetirementContribPercent: 15,
        contractorBusinessExpensesMonthly: 200,
        contractorAccountingAnnual: 1500,
        contractorInsuranceAnnual: 1000,
        federalTaxBracket: 0.22,
        stateTaxRate: 0.05,
        selfEmploymentTaxRate: 0.153,
        currency: 'USD',
      };

      const result = calculateComparison_main(inputs);

      expect(result.comparison.winner).toBeDefined();
      expect(['contractor', 'employee']).toContain(result.comparison.winner);
      expect(result.comparison.annualDifference).toBeGreaterThanOrEqual(0);
    });

    it('should calculate effective rates', () => {
      const inputs = getDefaultInputs('USD');

      const result = calculateComparison_main(inputs);

      expect(result.contractorEffectiveRate).toBeGreaterThan(0);
      expect(result.employeeEffectiveRate).toBeGreaterThan(0);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs('USD');

      const result1 = calculateComparison_main(inputs);
      const result2 = calculateComparison_main(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
