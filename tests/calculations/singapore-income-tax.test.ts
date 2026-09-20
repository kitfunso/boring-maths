/** Singapore income tax (YA2026) tests. Brackets confirmed against PwC Tax Summaries and Statrys (IRAS's own rate page is a JS app WebFetch cannot read): 0-20k@0%, 20-30k@2%, 30-40k@3.5%, 40-80k@7%, 80-120k@11.5%, 120-160k@15%, 160-200k@18%, 200-240k@19%, 240-280k@19.5%, 280-320k@20%, 320-500k@22%, 500k-1M@23%, above 1M@24%. */

import { describe, it, expect } from 'vitest';
import { calculateSingaporeIncomeTax } from '../../src/components/calculators/SingaporeIncomeTax/calculations';

describe('SingaporeIncomeTax', () => {
  describe('calculateSingaporeIncomeTax', () => {
    it('charges zero tax at exactly the 20,000 tax-free threshold', () => {
      const result = calculateSingaporeIncomeTax({ assessableIncome: 20000, totalReliefs: 0 });
      expect(result.totalTax).toBe(0);
      expect(result.marginalRate).toBe(0);
    });

    it('computes tax for 40,000: 0 + 10000*0.02 + 10000*0.035 = 200 + 350 = 550', () => {
      const result = calculateSingaporeIncomeTax({ assessableIncome: 40000, totalReliefs: 0 });
      expect(result.totalTax).toBeCloseTo(550, 2);
      expect(result.marginalRate).toBeCloseTo(3.5, 2);
    });

    it('computes tax for 80,000: 550 (to 40k) + 40000*0.07 = 550 + 2800 = 3350', () => {
      const result = calculateSingaporeIncomeTax({ assessableIncome: 80000, totalReliefs: 0 });
      expect(result.totalTax).toBeCloseTo(3350, 2);
      expect(result.marginalRate).toBeCloseTo(7, 2);
      expect(result.effectiveRate).toBeCloseTo((3350 / 80000) * 100, 2);
    });

    it('computes tax for 200,000: 3350 (to 80k) + 40000*.115 + 40000*.15 + 40000*.18 = 3350 + 4600 + 6000 + 7200 = 21150', () => {
      const result = calculateSingaporeIncomeTax({ assessableIncome: 200000, totalReliefs: 0 });
      expect(result.totalTax).toBeCloseTo(21150, 2);
      expect(result.marginalRate).toBeCloseTo(18, 2);
    });

    it('computes tax for 1,500,000 exercising the top 24% band: cumulative tax to 1M is 199150 (20k:0,30k:200,40k:550,80k:3350,120k:7950,160k:13950,200k:21150,240k:28750,280k:36550,320k:44550,500k:84150,1M:199150), plus 500000*0.24=120000, total 319150', () => {
      const result = calculateSingaporeIncomeTax({ assessableIncome: 1500000, totalReliefs: 0 });
      expect(result.totalTax).toBeCloseTo(319150, 2);
      expect(result.marginalRate).toBeCloseTo(24, 2);
    });

    it('returns zero tax and no crash for zero and negative income', () => {
      const zero = calculateSingaporeIncomeTax({ assessableIncome: 0, totalReliefs: 0 });
      expect(zero.totalTax).toBe(0);
      const negative = calculateSingaporeIncomeTax({ assessableIncome: -5000, totalReliefs: 0 });
      expect(negative.totalTax).toBe(0);
      expect(negative.chargeableIncome).toBe(0);
    });

    it('subtracts reliefs from assessable income before taxing', () => {
      const result = calculateSingaporeIncomeTax({ assessableIncome: 90000, totalReliefs: 10000 });
      expect(result.chargeableIncome).toBe(80000);
      expect(result.totalTax).toBeCloseTo(3350, 2);
    });
  });
});
