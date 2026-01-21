/**
 * SaaS Metrics Calculator - Calculation Logic
 */

import type { SaaSMetricsInputs, SaaSMetricsResult, HealthScore, GrowthProjection } from './types';
import { BENCHMARKS } from './types';

export function calculateSaaSMetrics(inputs: SaaSMetricsInputs): SaaSMetricsResult {
  const { currency, customers, arpu, churnRate, growthRate, cac, grossMargin, monthlyOpex } =
    inputs;

  // Core metrics
  const mrr = customers * arpu;
  const arr = mrr * 12;

  // LTV = ARPU * Gross Margin / Churn Rate (monthly)
  const monthlyChurnDecimal = churnRate / 100;
  const avgCustomerLifetimeMonths = monthlyChurnDecimal > 0 ? 1 / monthlyChurnDecimal : 120;
  const ltv = arpu * (grossMargin / 100) * avgCustomerLifetimeMonths;

  // LTV:CAC Ratio
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;

  // CAC Payback (months)
  const monthlyGrossProfit = arpu * (grossMargin / 100);
  const cacPaybackMonths = monthlyGrossProfit > 0 ? cac / monthlyGrossProfit : 999;

  // Net Revenue Retention (simplified - assumes no expansion revenue)
  // NRR = (1 - churn) * 100
  const netRevenueRetention = (1 - monthlyChurnDecimal) * 100;

  // Quick Ratio = New MRR / Churned MRR
  const newMrr = mrr * (growthRate / 100);
  const churnedMrr = mrr * monthlyChurnDecimal;
  const quickRatio = churnedMrr > 0 ? newMrr / churnedMrr : growthRate > 0 ? 10 : 0;

  // Burn Rate and Runway
  const grossProfit = mrr * (grossMargin / 100);
  const netIncome = grossProfit - monthlyOpex;
  const burnRate = netIncome < 0 ? Math.abs(netIncome) : 0;

  // Assume 6 months cash on hand for runway calculation
  const cashOnHand = monthlyOpex * 6;
  const runwayMonths = burnRate > 0 ? Math.round(cashOnHand / burnRate) : 999;

  // Magic Number = Net New ARR / Sales & Marketing Spend
  // Simplified: (growthRate% of MRR * 12) / (customers * cac / 12)
  const newArrAdded = newMrr * 12;
  const quarterSalesSpend = customers * (growthRate / 100) * cac;
  const magicNumber = quarterSalesSpend > 0 ? newArrAdded / (quarterSalesSpend * 4) : 0;

  // Rule of 40 = Growth Rate + Profit Margin
  const profitMargin = mrr > 0 ? (netIncome / mrr) * 100 : 0;
  const annualGrowthRate = growthRate * 12; // Simplified annual growth
  const ruleOf40 = annualGrowthRate + profitMargin;

  // Health Scores
  const healthScores: HealthScore[] = [];

  // LTV:CAC Score
  healthScores.push({
    metric: 'LTV:CAC Ratio',
    value: `${ltvCacRatio.toFixed(1)}x`,
    benchmark: '>3x is healthy',
    score: getScore(ltvCacRatio, BENCHMARKS.ltvCacRatio, true),
    insight:
      ltvCacRatio >= 3
        ? 'Strong unit economics'
        : ltvCacRatio >= 2
          ? 'Acceptable but room for improvement'
          : 'Acquisition costs too high relative to customer value',
  });

  // CAC Payback Score
  healthScores.push({
    metric: 'CAC Payback',
    value: `${Math.round(cacPaybackMonths)} months`,
    benchmark: '<12 months ideal',
    score: getScore(cacPaybackMonths, BENCHMARKS.cacPaybackMonths, false),
    insight:
      cacPaybackMonths <= 12
        ? 'Efficient customer acquisition'
        : cacPaybackMonths <= 18
          ? 'Acceptable payback period'
          : 'Consider reducing CAC or increasing ARPU',
  });

  // Churn Score
  healthScores.push({
    metric: 'Monthly Churn',
    value: `${churnRate}%`,
    benchmark: '<5% for B2B SaaS',
    score: getScore(churnRate, BENCHMARKS.churnRate, false),
    insight:
      churnRate <= 3
        ? 'Excellent retention'
        : churnRate <= 5
          ? 'Healthy retention rate'
          : 'High churn - focus on customer success',
  });

  // Gross Margin Score
  healthScores.push({
    metric: 'Gross Margin',
    value: `${grossMargin}%`,
    benchmark: '>70% for SaaS',
    score: getScore(grossMargin, BENCHMARKS.grossMargin, true),
    insight:
      grossMargin >= 75
        ? 'Strong software margins'
        : grossMargin >= 60
          ? 'Acceptable margins'
          : 'Margins below typical SaaS - review costs',
  });

  // Quick Ratio Score
  healthScores.push({
    metric: 'Quick Ratio',
    value: `${quickRatio.toFixed(1)}`,
    benchmark: '>2 is sustainable',
    score: getScore(quickRatio, BENCHMARKS.quickRatio, true),
    insight:
      quickRatio >= 4
        ? 'Rapid healthy growth'
        : quickRatio >= 2
          ? 'Sustainable growth'
          : 'Growth not outpacing churn enough',
  });

  // Rule of 40 Score
  healthScores.push({
    metric: 'Rule of 40',
    value: `${Math.round(ruleOf40)}%`,
    benchmark: '>40% is target',
    score: getScore(ruleOf40, BENCHMARKS.ruleOf40, true),
    insight:
      ruleOf40 >= 40
        ? 'Meeting investor expectations'
        : ruleOf40 >= 20
          ? 'Below benchmark but acceptable for growth stage'
          : 'Below healthy SaaS metrics',
  });

  // Calculate projections
  const projections: GrowthProjection[] = [];
  let projCustomers = customers;
  let cumulativeRevenue = 0;

  for (let month = 1; month <= 12; month++) {
    // Apply growth and churn
    const newCustomers = Math.floor(projCustomers * (growthRate / 100));
    const churnedCustomers = Math.floor(projCustomers * monthlyChurnDecimal);
    projCustomers = projCustomers + newCustomers - churnedCustomers;

    const projMrr = projCustomers * arpu;
    cumulativeRevenue += projMrr;

    projections.push({
      month,
      customers: projCustomers,
      mrr: Math.round(projMrr),
      arr: Math.round(projMrr * 12),
      cumulativeRevenue: Math.round(cumulativeRevenue),
    });
  }

  // Overall health rating
  const scores = healthScores.map((h) => h.score);
  const excellentCount = scores.filter((s) => s === 'excellent').length;
  const warningCount = scores.filter((s) => s === 'warning').length;
  const poorCount = scores.filter((s) => s === 'poor').length;

  let overallHealth: 'excellent' | 'good' | 'warning' | 'poor';
  if (poorCount >= 2) {
    overallHealth = 'poor';
  } else if (warningCount >= 2 || poorCount >= 1) {
    overallHealth = 'warning';
  } else if (excellentCount >= 3) {
    overallHealth = 'excellent';
  } else {
    overallHealth = 'good';
  }

  // Generate insights
  const insights: string[] = [];

  if (ltvCacRatio < 3) {
    insights.push(
      `To reach 3x LTV:CAC, either reduce CAC to ${formatSimple(ltv / 3, currency)} or increase LTV to ${formatSimple(cac * 3, currency)}`
    );
  }

  if (churnRate > 5) {
    const retainedCustomers = 100 * Math.pow(1 - monthlyChurnDecimal, 12);
    insights.push(
      `At ${churnRate}% monthly churn, you lose ${Math.round(100 - retainedCustomers)}% of customers per year`
    );
  }

  if (netIncome < 0) {
    insights.push(
      `Currently burning ${formatSimple(burnRate, currency)}/month. You need ${Math.ceil(burnRate / arpu)} more customers to break even.`
    );
  } else {
    insights.push(
      `Profitable! Generating ${formatSimple(netIncome, currency)}/month in net income.`
    );
  }

  const endOfYearMrr = projections[11]?.mrr || mrr;
  const growthMultiple = mrr > 0 ? endOfYearMrr / mrr : 0;
  insights.push(
    `Projected 12-month MRR: ${formatSimple(endOfYearMrr, currency)} (${growthMultiple.toFixed(1)}x growth)`
  );

  return {
    currency,
    mrr: Math.round(mrr),
    arr: Math.round(arr),
    ltv: Math.round(ltv),
    ltvCacRatio: Math.round(ltvCacRatio * 10) / 10,
    cacPaybackMonths: Math.round(cacPaybackMonths * 10) / 10,
    netRevenueRetention: Math.round(netRevenueRetention * 10) / 10,
    quickRatio: Math.round(quickRatio * 10) / 10,
    burnRate: Math.round(burnRate),
    runwayMonths: Math.min(runwayMonths, 99),
    magicNumber: Math.round(magicNumber * 100) / 100,
    ruleOf40: Math.round(ruleOf40),
    healthScores,
    projections,
    overallHealth,
    insights,
  };
}

function getScore(
  value: number,
  benchmarks: { excellent: number; good: number; warning: number; poor: number },
  higherIsBetter: boolean
): 'excellent' | 'good' | 'warning' | 'poor' {
  if (higherIsBetter) {
    if (value >= benchmarks.excellent) return 'excellent';
    if (value >= benchmarks.good) return 'good';
    if (value >= benchmarks.warning) return 'warning';
    return 'poor';
  } else {
    if (value <= benchmarks.excellent) return 'excellent';
    if (value <= benchmarks.good) return 'good';
    if (value <= benchmarks.warning) return 'warning';
    return 'poor';
  }
}

function formatSimple(value: number, currency: Currency): string {
  const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '\u00A3' : '\u20AC';
  return `${symbol}${Math.round(value).toLocaleString()}`;
}
