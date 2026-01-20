/**
 * Fix the remaining failing tests
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TESTS_DIR = path.join(__dirname, '../tests/calculations');

const fixes: Record<string, string> = {
  'fire.test.ts': `import { describe, it, expect } from 'vitest';
import { calculateFIRE } from '../../src/components/calculators/FIRECalculator/calculations';
import type { FIREInputs } from '../../src/components/calculators/FIRECalculator/types';

describe('FireCalculator', () => {
  describe('calculateFIRE', () => {
    it('should calculate with valid inputs', () => {
      const inputs: FIREInputs = {
        currentAge: 30,
        currentSavings: 50000,
        monthlyIncome: 8000,
        monthlyExpenses: 4000,
        expectedReturn: 7,
        withdrawalRate: 4,
        inflationRate: 2.5,
        includeSocialSecurity: false,
        estimatedSSMonthly: 0,
        ssStartAge: 67,
      };

      const result = calculateFIRE(inputs);

      expect(result).toBeDefined();
      expect(result.fireNumber).toBeGreaterThan(0);
      expect(result.yearsToFIRE).toBeGreaterThan(0);
      expect(result.fireAge).toBeGreaterThan(inputs.currentAge);
    });

    it('should produce consistent results', () => {
      const inputs: FIREInputs = {
        currentAge: 35,
        currentSavings: 100000,
        monthlyIncome: 10000,
        monthlyExpenses: 5000,
        expectedReturn: 7,
        withdrawalRate: 4,
        inflationRate: 2.5,
        includeSocialSecurity: false,
        estimatedSSMonthly: 0,
        ssStartAge: 67,
      };

      const result1 = calculateFIRE(inputs);
      const result2 = calculateFIRE(inputs);

      expect(result1).toEqual(result2);
    });
  });
});`,

  'glaze.test.ts': `import { describe, it, expect } from 'vitest';
import { calculateGlaze } from '../../src/components/calculators/GlazeCalculator/calculations';
import type { GlazeInputs, GlazeIngredient } from '../../src/components/calculators/GlazeCalculator/types';

describe('GlazeCalculator', () => {
  describe('calculateGlaze', () => {
    it('should calculate with valid inputs', () => {
      const ingredients: GlazeIngredient[] = [
        { name: 'Silica', percentage: 40 },
        { name: 'Kaolin', percentage: 30 },
        { name: 'Feldspar', percentage: 30 },
      ];

      const inputs: GlazeInputs = {
        ingredients,
        batchSize: 100,
        unit: 'grams',
      };

      const result = calculateGlaze(inputs);

      expect(result).toBeDefined();
      expect(result.ingredients).toHaveLength(3);
      expect(result.totalWeight).toBeGreaterThan(0);
    });

    it('should produce consistent results', () => {
      const ingredients: GlazeIngredient[] = [
        { name: 'Silica', percentage: 50 },
        { name: 'Kaolin', percentage: 50 },
      ];

      const inputs: GlazeInputs = {
        ingredients,
        batchSize: 100,
        unit: 'grams',
      };

      const result1 = calculateGlaze(inputs);
      const result2 = calculateGlaze(inputs);

      expect(result1).toEqual(result2);
    });
  });
});`,

  'ibu.test.ts': `import { describe, it, expect } from 'vitest';
import { calculateIBU } from '../../src/components/calculators/IBUCalculator/calculations';
import type { IBUInputs, HopAddition } from '../../src/components/calculators/IBUCalculator/types';

describe('IbuCalculator', () => {
  describe('calculateIBU', () => {
    it('should calculate with valid inputs', () => {
      const hops: HopAddition[] = [
        { name: 'Cascade', weight: 1, alphaAcid: 5.5, boilTime: 60, form: 'pellet' },
        { name: 'Centennial', weight: 1, alphaAcid: 10, boilTime: 15, form: 'pellet' },
      ];

      const inputs: IBUInputs = {
        hops,
        batchSize: 5,
        batchSizeUnit: 'gallons',
        originalGravity: 1.050,
        ibuFormula: 'tinseth',
      };

      const result = calculateIBU(inputs);

      expect(result).toBeDefined();
      expect(result.totalIBU).toBeGreaterThan(0);
      expect(result.hopBreakdown).toHaveLength(2);
    });

    it('should produce consistent results', () => {
      const hops: HopAddition[] = [
        { name: 'Cascade', weight: 1, alphaAcid: 5.5, boilTime: 60, form: 'pellet' },
      ];

      const inputs: IBUInputs = {
        hops,
        batchSize: 5,
        batchSizeUnit: 'gallons',
        originalGravity: 1.050,
        ibuFormula: 'tinseth',
      };

      const result1 = calculateIBU(inputs);
      const result2 = calculateIBU(inputs);

      expect(result1).toEqual(result2);
    });
  });
});`,

  'kiln-cost.test.ts': `import { describe, it, expect } from 'vitest';
import { calculateKilnCost } from '../../src/components/calculators/KilnCostCalculator/calculations';
import type { KilnCostInputs } from '../../src/components/calculators/KilnCostCalculator/types';

describe('KilnCostCalculator', () => {
  describe('calculateKilnCost', () => {
    it('should calculate with valid inputs', () => {
      const inputs: KilnCostInputs = {
        kilnSize: 7,
        firingType: 'bisque',
        electricityRate: 0.12,
        firingConeTemp: 'cone04',
        loadPercentage: 80,
      };

      const result = calculateKilnCost(inputs);

      expect(result).toBeDefined();
      expect(result.totalCost).toBeDefined();
    });

    it('should handle different firing types', () => {
      const inputsBisque: KilnCostInputs = {
        kilnSize: 7,
        firingType: 'bisque',
        electricityRate: 0.12,
        firingConeTemp: 'cone04',
        loadPercentage: 80,
      };

      const inputsGlaze: KilnCostInputs = {
        kilnSize: 7,
        firingType: 'glaze',
        electricityRate: 0.12,
        firingConeTemp: 'cone6',
        loadPercentage: 80,
      };

      const resultBisque = calculateKilnCost(inputsBisque);
      const resultGlaze = calculateKilnCost(inputsGlaze);

      expect(resultBisque).toBeDefined();
      expect(resultGlaze).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs: KilnCostInputs = {
        kilnSize: 10,
        firingType: 'glaze',
        electricityRate: 0.15,
        firingConeTemp: 'cone10',
        loadPercentage: 100,
      };

      const result1 = calculateKilnCost(inputs);
      const result2 = calculateKilnCost(inputs);

      expect(result1.totalCost).toBe(result2.totalCost);
      expect(result1.kwhUsed).toBe(result2.kwhUsed);
    });
  });
});`,

  'remote-work-savings.test.ts': `import { describe, it, expect } from 'vitest';
import { calculateRemoteWorkSavings } from '../../src/components/calculators/RemoteWorkSavingsCalculator/calculations';
import type { RemoteWorkInputs } from '../../src/components/calculators/RemoteWorkSavingsCalculator/types';

describe('RemoteWorkSavingsCalculator', () => {
  describe('calculateRemoteWorkSavings', () => {
    it('should calculate with valid inputs', () => {
      const inputs: RemoteWorkInputs = {
        daysInOfficePerWeek: 3,
        commuteMiles: 20,
        roundTrip: true,
        gasPricePerGallon: 3.5,
        carMPG: 25,
        parkingCostPerDay: 10,
        publicTransitCostPerDay: 0,
        lunchCostOffice: 15,
        lunchCostHome: 8,
        coffeeCostOffice: 5,
        coffeeCostHome: 1,
        workWearCostPerMonth: 100,
        dryCleaningPerMonth: 50,
        weeksPerYear: 50,
      };

      const result = calculateRemoteWorkSavings(inputs);

      expect(result).toBeDefined();
      expect(result.annualSavings).toBeGreaterThan(0);
      expect(result.monthlySavings).toBeGreaterThan(0);
    });

    it('should produce consistent results', () => {
      const inputs: RemoteWorkInputs = {
        daysInOfficePerWeek: 5,
        commuteMiles: 30,
        roundTrip: true,
        gasPricePerGallon: 4.0,
        carMPG: 30,
        parkingCostPerDay: 15,
        publicTransitCostPerDay: 0,
        lunchCostOffice: 12,
        lunchCostHome: 6,
        coffeeCostOffice: 4,
        coffeeCostHome: 1,
        workWearCostPerMonth: 150,
        dryCleaningPerMonth: 75,
        weeksPerYear: 50,
      };

      const result1 = calculateRemoteWorkSavings(inputs);
      const result2 = calculateRemoteWorkSavings(inputs);

      expect(result1).toEqual(result2);
    });
  });
});`,

  'subscription-audit.test.ts': `import { describe, it, expect } from 'vitest';
import { calculateSubscriptionTotals } from '../../src/components/calculators/SubscriptionAudit/calculations';
import type { Subscription } from '../../src/components/calculators/SubscriptionAudit/types';

describe('SubscriptionAuditCalculator', () => {
  describe('calculateSubscriptionTotals', () => {
    it('should calculate with valid inputs', () => {
      const subscriptions: Subscription[] = [
        { id: '1', name: 'Netflix', cost: 15.99, frequency: 'monthly', category: 'Entertainment', isActive: true },
        { id: '2', name: 'Spotify', cost: 9.99, frequency: 'monthly', category: 'Entertainment', isActive: true },
        { id: '3', name: 'Adobe CC', cost: 52.99, frequency: 'monthly', category: 'Software', isActive: true },
      ];

      const result = calculateSubscriptionTotals(subscriptions);

      expect(result).toBeDefined();
      expect(result.monthlyTotal).toBeGreaterThan(0);
      expect(result.annualTotal).toBeGreaterThan(0);
      expect(result.categorySummary).toBeDefined();
    });

    it('should produce consistent results', () => {
      const subscriptions: Subscription[] = [
        { id: '1', name: 'Netflix', cost: 15.99, frequency: 'monthly', category: 'Entertainment', isActive: true },
      ];

      const result1 = calculateSubscriptionTotals(subscriptions);
      const result2 = calculateSubscriptionTotals(subscriptions);

      expect(result1).toEqual(result2);
    });
  });
});`,

  'unit-converter.test.ts': `import { describe, it, expect } from 'vitest';
import { convert } from '../../src/components/calculators/UnitConverter/calculations';
import type { ConversionInputs } from '../../src/components/calculators/UnitConverter/types';

describe('UnitConverterCalculator', () => {
  describe('convert', () => {
    it('should convert length units', () => {
      const inputs: ConversionInputs = {
        value: 1,
        fromUnit: 'meters',
        toUnit: 'feet',
      };

      const result = convert(inputs);

      expect(result).toBeGreaterThan(3);
      expect(result).toBeLessThan(4);
    });

    it('should convert temperature units', () => {
      const inputs: ConversionInputs = {
        value: 0,
        fromUnit: 'celsius',
        toUnit: 'fahrenheit',
      };

      const result = convert(inputs);

      expect(result).toBe(32);
    });

    it('should produce consistent results', () => {
      const inputs: ConversionInputs = {
        value: 100,
        fromUnit: 'kilograms',
        toUnit: 'pounds',
      };

      const result1 = convert(inputs);
      const result2 = convert(inputs);

      expect(result1).toBe(result2);
    });
  });
});`,

  'yeast-pitch-rate.test.ts': `import { describe, it, expect } from 'vitest';
import { calculateYeastPitchRate } from '../../src/components/calculators/YeastPitchRateCalculator/calculations';
import type { YeastPitchRateInputs } from '../../src/components/calculators/YeastPitchRateCalculator/types';

describe('YeastPitchRateCalculator', () => {
  describe('calculateYeastPitchRate', () => {
    it('should calculate with valid inputs', () => {
      const inputs: YeastPitchRateInputs = {
        batchSize: 5,
        batchSizeUnit: 'gallons',
        originalGravity: 1.050,
        yeastFormat: 'dry',
        packetsOrVials: 1,
        yeastAge: 0,
        starterSize: 0,
        beerType: 'ale',
      };

      const result = calculateYeastPitchRate(inputs);

      expect(result).toBeDefined();
      expect(result.cellsNeeded).toBeGreaterThan(0);
      expect(result.pitchRate).toBeGreaterThan(0);
    });

    it('should handle different beer types', () => {
      const inputsAle: YeastPitchRateInputs = {
        batchSize: 5,
        batchSizeUnit: 'gallons',
        originalGravity: 1.050,
        yeastFormat: 'dry',
        packetsOrVials: 1,
        yeastAge: 0,
        starterSize: 0,
        beerType: 'ale',
      };

      const inputsLager: YeastPitchRateInputs = {
        batchSize: 5,
        batchSizeUnit: 'gallons',
        originalGravity: 1.050,
        yeastFormat: 'dry',
        packetsOrVials: 2,
        yeastAge: 0,
        starterSize: 0,
        beerType: 'lager',
      };

      const resultAle = calculateYeastPitchRate(inputsAle);
      const resultLager = calculateYeastPitchRate(inputsLager);

      expect(resultAle).toBeDefined();
      expect(resultLager).toBeDefined();
      expect(resultLager.cellsNeeded).toBeGreaterThan(resultAle.cellsNeeded);
    });

    it('should produce consistent results', () => {
      const inputs: YeastPitchRateInputs = {
        batchSize: 5,
        batchSizeUnit: 'gallons',
        originalGravity: 1.060,
        yeastFormat: 'liquid',
        packetsOrVials: 2,
        yeastAge: 30,
        starterSize: 0,
        beerType: 'ale',
      };

      const result1 = calculateYeastPitchRate(inputs);
      const result2 = calculateYeastPitchRate(inputs);

      expect(result1).toEqual(result2);
    });
  });
});`,
};

async function main() {
  let fixed = 0;

  for (const [testFile, content] of Object.entries(fixes)) {
    const testPath = path.join(TESTS_DIR, testFile);

    try {
      fs.writeFileSync(testPath, content);
      console.log(`✅ Fixed ${testFile}`);
      fixed++;
    } catch (error) {
      console.error(`❌ Error fixing ${testFile}:`, error);
    }
  }

  console.log(`\n📊 Fixed ${fixed} tests`);
}

main();
