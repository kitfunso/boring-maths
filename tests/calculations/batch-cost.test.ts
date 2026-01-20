/**
 * BatchCost Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateBatchCost } from '../../src/components/calculators/BatchCostCalculator/calculations';
import { MATERIAL_PRESETS } from '../../src/components/calculators/BatchCostCalculator/types';
import type { BatchCostInputs } from '../../src/components/calculators/BatchCostCalculator/types';

describe('BatchCostCalculator', () => {
  describe('calculateBatchCost', () => {
    it('should calculate with valid inputs', () => {
      const inputs: BatchCostInputs = {
        craftType: 'soap',
        batchName: 'Test Batch',
        unitsProduced: 10,
        materials: MATERIAL_PRESETS.soap,
        laborHours: 2,
        laborRate: 15,
        overheadPercent: 10,
        packagingCostPerUnit: 0.5,
        targetProfitMargin: 50,
        wholesaleDiscount: 30,
      };

      const result = calculateBatchCost(inputs);

      expect(result).toBeDefined();
      expect(result.totalMaterialCost).toBeGreaterThan(0);
      expect(result.totalCostPerUnit).toBeGreaterThan(0);
      expect(result.suggestedRetailPrice).toBeGreaterThan(result.totalCostPerUnit);
      expect(result.costBreakdown).toBeDefined();
    });

    it('should handle empty materials array', () => {
      const inputs: BatchCostInputs = {
        craftType: 'custom',
        batchName: 'Test',
        unitsProduced: 5,
        materials: [],
        laborHours: 1,
        laborRate: 20,
        overheadPercent: 10,
        packagingCostPerUnit: 0,
        targetProfitMargin: 50,
        wholesaleDiscount: 0,
      };

      const result = calculateBatchCost(inputs);

      expect(result).toBeDefined();
      expect(result.totalMaterialCost).toBe(0);
      expect(result.totalLaborCost).toBeGreaterThan(0);
    });

    it('should calculate profit margin correctly', () => {
      const inputs: BatchCostInputs = {
        craftType: 'candle',
        batchName: 'Test',
        unitsProduced: 10,
        materials: MATERIAL_PRESETS.candle,
        laborHours: 2,
        laborRate: 15,
        overheadPercent: 10,
        packagingCostPerUnit: 0.5,
        targetProfitMargin: 50,
        wholesaleDiscount: 0,
      };

      const result = calculateBatchCost(inputs);

      expect(result.profitPerUnit).toBeGreaterThan(0);
      expect(result.suggestedRetailPrice).toBeGreaterThan(result.totalCostPerUnit);
    });

    it('should produce consistent results', () => {
      const inputs: BatchCostInputs = {
        craftType: 'soap',
        batchName: 'Test',
        unitsProduced: 10,
        materials: MATERIAL_PRESETS.soap,
        laborHours: 2,
        laborRate: 15,
        overheadPercent: 10,
        packagingCostPerUnit: 0.5,
        targetProfitMargin: 50,
        wholesaleDiscount: 30,
      };

      const result1 = calculateBatchCost(inputs);
      const result2 = calculateBatchCost(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
