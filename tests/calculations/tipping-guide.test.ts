/**
 * Tipping Guide Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateTippingGuide } from '../../src/components/calculators/TippingGuideCalculator/calculations';
import type { TippingGuideInputs } from '../../src/components/calculators/TippingGuideCalculator/types';

describe('TippingGuideCalculator', () => {
  describe('calculateTippingGuide', () => {
    it('calculates US restaurant tip correctly (20%)', () => {
      const inputs: TippingGuideInputs = {
        country: 'US',
        serviceType: 'restaurant',
        billAmount: 100,
        currency: 'USD',
      };

      const result = calculateTippingGuide(inputs);

      expect(result.suggestedTipPercent).toBe(0.2);
      expect(result.tipAmount).toBe(20);
      expect(result.totalWithTip).toBe(120);
      expect(result.isServiceIncluded).toBe(false);
    });

    it('returns zero tip for Japan restaurant', () => {
      const inputs: TippingGuideInputs = {
        country: 'Japan',
        serviceType: 'restaurant',
        billAmount: 5000,
        currency: 'USD',
      };

      const result = calculateTippingGuide(inputs);

      expect(result.suggestedTipPercent).toBe(0);
      expect(result.tipAmount).toBe(0);
      expect(result.totalWithTip).toBe(5000);
      expect(result.isServiceIncluded).toBe(true);
      expect(result.culturalNote).toContain('rude');
    });

    it('marks service as included for France restaurant', () => {
      const inputs: TippingGuideInputs = {
        country: 'France',
        serviceType: 'restaurant',
        billAmount: 80,
        currency: 'EUR',
      };

      const result = calculateTippingGuide(inputs);

      expect(result.isServiceIncluded).toBe(true);
      expect(result.suggestedTipPercent).toBe(0.05);
      expect(result.tipAmount).toBe(4);
      expect(result.totalWithTip).toBe(84);
    });

    it('calculates UK restaurant tip (10%)', () => {
      const inputs: TippingGuideInputs = {
        country: 'UK',
        serviceType: 'restaurant',
        billAmount: 60,
        currency: 'GBP',
      };

      const result = calculateTippingGuide(inputs);

      expect(result.suggestedTipPercent).toBe(0.1);
      expect(result.tipAmount).toBe(6);
      expect(result.totalWithTip).toBe(66);
      expect(result.isServiceIncluded).toBe(true);
    });

    it('calculates Canada delivery tip (15%)', () => {
      const inputs: TippingGuideInputs = {
        country: 'Canada',
        serviceType: 'delivery',
        billAmount: 40,
        currency: 'USD',
      };

      const result = calculateTippingGuide(inputs);

      expect(result.suggestedTipPercent).toBe(0.15);
      expect(result.tipAmount).toBe(6);
      expect(result.totalWithTip).toBe(46);
    });

    it('rounds to 2 decimal places', () => {
      const inputs: TippingGuideInputs = {
        country: 'Germany',
        serviceType: 'restaurant',
        billAmount: 33.33,
        currency: 'EUR',
      };

      const result = calculateTippingGuide(inputs);

      // 33.33 * 0.10 = 3.333, should round to 3.33
      expect(result.tipAmount).toBe(3.33);
      expect(result.totalWithTip).toBe(36.66);
    });

    it('rounds total up to nearest whole number', () => {
      const inputs: TippingGuideInputs = {
        country: 'US',
        serviceType: 'restaurant',
        billAmount: 47.5,
        currency: 'USD',
      };

      const result = calculateTippingGuide(inputs);

      // 47.5 * 0.20 = 9.50, total = 57.00
      expect(result.totalWithTip).toBe(57);
      expect(result.roundedTotal).toBe(57);
    });

    it('rounds up when total is not whole', () => {
      const inputs: TippingGuideInputs = {
        country: 'US',
        serviceType: 'taxi',
        billAmount: 23,
        currency: 'USD',
      };

      const result = calculateTippingGuide(inputs);

      // 23 * 0.15 = 3.45, total = 26.45
      expect(result.tipAmount).toBe(3.45);
      expect(result.totalWithTip).toBe(26.45);
      expect(result.roundedTotal).toBe(27);
    });

    it('preserves currency in result', () => {
      const inputs: TippingGuideInputs = {
        country: 'Italy',
        serviceType: 'hotel',
        billAmount: 200,
        currency: 'EUR',
      };

      const result = calculateTippingGuide(inputs);

      expect(result.currency).toBe('EUR');
    });

    it('handles zero bill amount gracefully', () => {
      const inputs: TippingGuideInputs = {
        country: 'US',
        serviceType: 'restaurant',
        billAmount: 0,
        currency: 'USD',
      };

      const result = calculateTippingGuide(inputs);

      expect(result.tipAmount).toBe(0);
      expect(result.totalWithTip).toBe(0);
      expect(result.roundedTotal).toBe(0);
    });

    it('returns correct data for Mexico bar', () => {
      const inputs: TippingGuideInputs = {
        country: 'Mexico',
        serviceType: 'bar',
        billAmount: 500,
        currency: 'USD',
      };

      const result = calculateTippingGuide(inputs);

      expect(result.suggestedTipPercent).toBe(0.1);
      expect(result.tipAmount).toBe(50);
      expect(result.totalWithTip).toBe(550);
      expect(result.isServiceIncluded).toBe(false);
    });

    it('returns correct data for Australia hairdresser', () => {
      const inputs: TippingGuideInputs = {
        country: 'Australia',
        serviceType: 'hairdresser',
        billAmount: 80,
        currency: 'USD',
      };

      const result = calculateTippingGuide(inputs);

      expect(result.suggestedTipPercent).toBe(0.1);
      expect(result.tipAmount).toBe(8);
      expect(result.totalWithTip).toBe(88);
      expect(result.isServiceIncluded).toBe(false);
    });
  });
});
