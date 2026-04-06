import { describe, it, expect } from 'vitest';
import { calculateStreamingValue } from '../../src/components/calculators/StreamingValueCalculator/calculations';
import type { StreamingValueInputs } from '../../src/components/calculators/StreamingValueCalculator/types';
import { getDefaultInputs } from '../../src/components/calculators/StreamingValueCalculator/types';

describe('StreamingValueCalculator', () => {
  describe('calculateStreamingValue', () => {
    it('should return empty results when no services enabled', () => {
      const inputs = getDefaultInputs();
      const result = calculateStreamingValue(inputs);

      expect(result.totalMonthlyCost).toBe(0);
      expect(result.totalYearlyCost).toBe(0);
      expect(result.perServiceMetrics).toHaveLength(0);
      expect(result.bestValue).toBe('');
      expect(result.worstValue).toBe('');
      expect(result.recommendedCut).toBe('');
    });

    it('should calculate cost per hour correctly for a single service', () => {
      const inputs: StreamingValueInputs = {
        subscriptions: [
          { name: 'Netflix', monthlyPrice: 15.49, hoursWatchedPerMonth: 20, enabled: true },
        ],
      };

      const result = calculateStreamingValue(inputs);

      expect(result.totalMonthlyCost).toBe(15.49);
      expect(result.totalYearlyCost).toBe(185.88);
      expect(result.perServiceMetrics).toHaveLength(1);
      expect(result.perServiceMetrics[0].costPerHour).toBeCloseTo(0.77, 1);
      expect(result.perServiceMetrics[0].valueRating).toBe('great');
      expect(result.bestValue).toBe('Netflix');
      expect(result.worstValue).toBe('Netflix');
    });

    it('should rank services by cost per hour', () => {
      const inputs: StreamingValueInputs = {
        subscriptions: [
          { name: 'Expensive', monthlyPrice: 20, hoursWatchedPerMonth: 2, enabled: true },
          { name: 'Cheap', monthlyPrice: 8, hoursWatchedPerMonth: 40, enabled: true },
          { name: 'Mid', monthlyPrice: 15, hoursWatchedPerMonth: 10, enabled: true },
        ],
      };

      const result = calculateStreamingValue(inputs);

      expect(result.perServiceMetrics[0].name).toBe('Cheap');
      expect(result.perServiceMetrics[1].name).toBe('Mid');
      expect(result.perServiceMetrics[2].name).toBe('Expensive');
      expect(result.bestValue).toBe('Cheap');
      expect(result.worstValue).toBe('Expensive');
    });

    it('should calculate total costs across multiple services', () => {
      const inputs: StreamingValueInputs = {
        subscriptions: [
          { name: 'A', monthlyPrice: 10, hoursWatchedPerMonth: 20, enabled: true },
          { name: 'B', monthlyPrice: 15, hoursWatchedPerMonth: 10, enabled: true },
          { name: 'C', monthlyPrice: 5, hoursWatchedPerMonth: 5, enabled: false },
        ],
      };

      const result = calculateStreamingValue(inputs);

      expect(result.totalMonthlyCost).toBe(25);
      expect(result.totalYearlyCost).toBe(300);
      expect(result.perServiceMetrics).toHaveLength(2);
    });

    it('should handle zero hours watched', () => {
      const inputs: StreamingValueInputs = {
        subscriptions: [
          { name: 'Unused', monthlyPrice: 15, hoursWatchedPerMonth: 0, enabled: true },
        ],
      };

      const result = calculateStreamingValue(inputs);

      expect(result.perServiceMetrics[0].costPerHour).toBe(999.99);
      expect(result.perServiceMetrics[0].valueRating).toBe('poor');
    });

    it('should recommend cutting the worst-value poor-rated service', () => {
      const inputs: StreamingValueInputs = {
        subscriptions: [
          { name: 'Good', monthlyPrice: 10, hoursWatchedPerMonth: 20, enabled: true },
          { name: 'Bad', monthlyPrice: 15, hoursWatchedPerMonth: 1, enabled: true },
        ],
      };

      const result = calculateStreamingValue(inputs);

      expect(result.recommendedCut).toBe('Bad');
    });

    it('should not recommend a cut when worst service is not poor-rated', () => {
      const inputs: StreamingValueInputs = {
        subscriptions: [
          { name: 'Great', monthlyPrice: 10, hoursWatchedPerMonth: 30, enabled: true },
          { name: 'Good', monthlyPrice: 12, hoursWatchedPerMonth: 10, enabled: true },
        ],
      };

      const result = calculateStreamingValue(inputs);

      expect(result.recommendedCut).toBe('');
    });

    it('should assign correct value ratings', () => {
      const inputs: StreamingValueInputs = {
        subscriptions: [
          { name: 'Great', monthlyPrice: 10, hoursWatchedPerMonth: 20, enabled: true }, // $0.50/hr
          { name: 'Good', monthlyPrice: 15, hoursWatchedPerMonth: 10, enabled: true }, // $1.50/hr
          { name: 'Fair', monthlyPrice: 12, hoursWatchedPerMonth: 4, enabled: true }, // $3.00/hr
          { name: 'Poor', monthlyPrice: 16, hoursWatchedPerMonth: 2, enabled: true }, // $8.00/hr
        ],
      };

      const result = calculateStreamingValue(inputs);
      const byName = Object.fromEntries(result.perServiceMetrics.map((m) => [m.name, m]));

      expect(byName['Great'].valueRating).toBe('great');
      expect(byName['Good'].valueRating).toBe('good');
      expect(byName['Fair'].valueRating).toBe('fair');
      expect(byName['Poor'].valueRating).toBe('poor');
    });

    it('should produce consistent results', () => {
      const inputs: StreamingValueInputs = {
        subscriptions: [
          { name: 'Netflix', monthlyPrice: 15.49, hoursWatchedPerMonth: 20, enabled: true },
          { name: 'Disney+', monthlyPrice: 13.99, hoursWatchedPerMonth: 8, enabled: true },
        ],
      };

      const result1 = calculateStreamingValue(inputs);
      const result2 = calculateStreamingValue(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
