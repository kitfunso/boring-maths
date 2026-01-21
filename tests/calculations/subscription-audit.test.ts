import { describe, it, expect } from 'vitest';
import { analyzeSubscriptions } from '../../src/components/calculators/SubscriptionAudit/calculations';
import type { SubscriptionAuditInputs, Subscription } from '../../src/components/calculators/SubscriptionAudit/types';

describe('SubscriptionAuditCalculator', () => {
  describe('analyzeSubscriptions', () => {
    it('should calculate with valid inputs', () => {
      const subscriptions: Subscription[] = [
        { id: '1', name: 'Netflix', cost: 15.99, frequency: 'monthly', category: 'streaming', usage: 'weekly', essential: false },
        { id: '2', name: 'Spotify', cost: 9.99, frequency: 'monthly', category: 'music', usage: 'daily', essential: true },
        { id: '3', name: 'Adobe CC', cost: 52.99, frequency: 'monthly', category: 'software', usage: 'daily', essential: true },
      ];

      const inputs: SubscriptionAuditInputs = {
        currency: 'USD',
        subscriptions,
        estimatedMonthlySpend: 80,
      };

      const result = analyzeSubscriptions(inputs);

      expect(result).toBeDefined();
      expect(result.totalMonthly).toBeGreaterThan(0);
      expect(result.totalYearly).toBeGreaterThan(0);
      expect(result.categoryBreakdown).toBeDefined();
    });

    it('should produce consistent results', () => {
      const subscriptions: Subscription[] = [
        { id: '1', name: 'Netflix', cost: 15.99, frequency: 'monthly', category: 'streaming', usage: 'weekly', essential: false },
      ];

      const inputs: SubscriptionAuditInputs = {
        currency: 'USD',
        subscriptions,
        estimatedMonthlySpend: 20,
      };

      const result1 = analyzeSubscriptions(inputs);
      const result2 = analyzeSubscriptions(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
