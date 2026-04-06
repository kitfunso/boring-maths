/**
 * ToolDeflection Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateToolDeflection } from '../../src/components/calculators/ToolDeflectionCalculator/calculations';
import type { ToolDeflectionInputs } from '../../src/components/calculators/ToolDeflectionCalculator/types';

describe('ToolDeflectionCalculator', () => {
  describe('calculateToolDeflection', () => {
    it('should calculate deflection for a 1/2" carbide endmill', () => {
      const inputs: ToolDeflectionInputs = {
        toolDiameter: 0.5,
        stickout: 2.0,
        lengthUnit: 'inches',
        toolMaterial: 'carbide',
        fluteCount: 4,
        cuttingForce: 50,
        forceUnit: 'lbs',
        calculationMode: 'force',
        depthOfCut: 0.1,
        widthOfCut: 0.25,
        feedRate: 10,
        materialFactor: 1,
      };

      const result = calculateToolDeflection(inputs);

      expect(result.deflection).toBeGreaterThan(0);
      expect(result.deflection).toBeLessThan(0.01); // sub-0.01" for typical setup
      expect(result.momentOfInertia).toBeGreaterThan(0);
    });

    it('should increase with stickout length', () => {
      const short: ToolDeflectionInputs = {
        toolDiameter: 0.5,
        stickout: 1.5,
        lengthUnit: 'inches',
        toolMaterial: 'carbide',
        fluteCount: 4,
        cuttingForce: 50,
        forceUnit: 'lbs',
        calculationMode: 'force',
        depthOfCut: 0.1,
        widthOfCut: 0.25,
        feedRate: 10,
        materialFactor: 1,
      };

      const long: ToolDeflectionInputs = { ...short, stickout: 4.0 };

      const shortResult = calculateToolDeflection(short);
      const longResult = calculateToolDeflection(long);

      // Deflection scales with L^3
      expect(longResult.deflection).toBeGreaterThan(shortResult.deflection);
    });

    it('should decrease with larger diameter', () => {
      const small: ToolDeflectionInputs = {
        toolDiameter: 0.25,
        stickout: 2.0,
        lengthUnit: 'inches',
        toolMaterial: 'carbide',
        fluteCount: 4,
        cuttingForce: 50,
        forceUnit: 'lbs',
        calculationMode: 'force',
        depthOfCut: 0.1,
        widthOfCut: 0.125,
        feedRate: 10,
        materialFactor: 1,
      };

      const large: ToolDeflectionInputs = { ...small, toolDiameter: 0.75 };

      const smallResult = calculateToolDeflection(small);
      const largeResult = calculateToolDeflection(large);

      expect(largeResult.deflection).toBeLessThan(smallResult.deflection);
    });

    it('should produce consistent results', () => {
      const inputs: ToolDeflectionInputs = {
        toolDiameter: 0.5,
        stickout: 2.0,
        lengthUnit: 'inches',
        toolMaterial: 'carbide',
        fluteCount: 4,
        cuttingForce: 50,
        forceUnit: 'lbs',
        calculationMode: 'force',
        depthOfCut: 0.1,
        widthOfCut: 0.25,
        feedRate: 10,
        materialFactor: 1,
      };

      const result1 = calculateToolDeflection(inputs);
      const result2 = calculateToolDeflection(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
