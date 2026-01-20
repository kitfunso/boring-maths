import { describe, it, expect } from 'vitest';
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
});