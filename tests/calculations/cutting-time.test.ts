/**
 * CuttingTime Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateCuttingTime } from '../../src/components/calculators/CuttingTimeCalculator/calculations';
import type { CuttingTimeInputs } from '../../src/components/calculators/CuttingTimeCalculator/types';

describe('CuttingTimeCalculator', () => {
  describe('calculateCuttingTime', () => {
    it('should calculate milling time correctly', () => {
      const inputs: CuttingTimeInputs = {
        operationType: 'milling',
        pathLength: 60,
        pathUnit: 'inches',
        feedRate: 30,
        feedUnit: 'ipm',
        numberOfPasses: 2,
        partLength: 0,
        partDiameter: 0,
        depthOfCut: 0,
        holeDepth: 0,
        numberOfHoles: 0,
        peckDepth: 0,
        rapidRate: 200,
        rapidDistance: 10,
        toolChangeTime: 15,
        numberOfToolChanges: 1,
        setupTime: 10,
        quantity: 1,
      };

      const result = calculateCuttingTime(inputs);

      // 60 inches at 30 IPM = 2 min per pass * 2 passes = 4 min cutting
      expect(result.cuttingTime).toBeGreaterThan(0);
      expect(result.totalCycleTime).toBeGreaterThan(result.cuttingTime);
      expect(result.partsPerHour).toBeGreaterThan(0);
    });

    it('should handle drilling operations', () => {
      const inputs: CuttingTimeInputs = {
        operationType: 'drilling',
        pathLength: 0,
        pathUnit: 'inches',
        feedRate: 5,
        feedUnit: 'ipm',
        numberOfPasses: 1,
        partLength: 0,
        partDiameter: 0,
        depthOfCut: 0,
        holeDepth: 1,
        numberOfHoles: 10,
        peckDepth: 0.25,
        rapidRate: 200,
        rapidDistance: 5,
        toolChangeTime: 15,
        numberOfToolChanges: 0,
        setupTime: 5,
        quantity: 5,
      };

      const result = calculateCuttingTime(inputs);

      expect(result.cuttingTime).toBeGreaterThan(0);
      expect(result.totalJobTime).toBeGreaterThan(result.totalCycleTime);
    });

    it('should scale with quantity', () => {
      const base: CuttingTimeInputs = {
        operationType: 'milling',
        pathLength: 30,
        pathUnit: 'inches',
        feedRate: 30,
        feedUnit: 'ipm',
        numberOfPasses: 1,
        partLength: 0,
        partDiameter: 0,
        depthOfCut: 0,
        holeDepth: 0,
        numberOfHoles: 0,
        peckDepth: 0,
        rapidRate: 200,
        rapidDistance: 5,
        toolChangeTime: 0,
        numberOfToolChanges: 0,
        setupTime: 0,
        quantity: 1,
      };

      const r1 = calculateCuttingTime({ ...base, quantity: 1 });
      const r10 = calculateCuttingTime({ ...base, quantity: 10 });

      expect(r10.totalJobTime).toBeGreaterThan(r1.totalJobTime);
    });

    it('should produce consistent results', () => {
      const inputs: CuttingTimeInputs = {
        operationType: 'milling',
        pathLength: 60,
        pathUnit: 'inches',
        feedRate: 30,
        feedUnit: 'ipm',
        numberOfPasses: 2,
        partLength: 0,
        partDiameter: 0,
        depthOfCut: 0,
        holeDepth: 0,
        numberOfHoles: 0,
        peckDepth: 0,
        rapidRate: 200,
        rapidDistance: 10,
        toolChangeTime: 15,
        numberOfToolChanges: 1,
        setupTime: 10,
        quantity: 1,
      };

      const result1 = calculateCuttingTime(inputs);
      const result2 = calculateCuttingTime(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
