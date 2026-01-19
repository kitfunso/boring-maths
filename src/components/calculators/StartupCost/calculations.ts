/**
 * Startup Cost Calculator - Calculation Logic
 */

import type { StartupCostInputs, StartupCostResult, CostBreakdownItem } from './types';
import { BUSINESS_TYPES, AVG_EMPLOYEE_SALARY } from './types';

export function calculateStartupCost(inputs: StartupCostInputs): StartupCostResult {
  const {
    currency,
    businessType,
    employees,
    runwayMonths,
    includeContingency,
    contingencyPercent,
    founderSalary,
    needsOffice,
    customEquipment,
    customInventory,
  } = inputs;

  const config = BUSINESS_TYPES[currency][businessType];
  const oneTimeBreakdown: CostBreakdownItem[] = [];
  const monthlyBreakdown: CostBreakdownItem[] = [];

  // Calculate one-time costs
  const equipmentCost = customEquipment > 0 ? customEquipment : config.baseCosts.equipment;
  if (equipmentCost > 0) {
    oneTimeBreakdown.push({
      category: 'Equipment & Technology',
      amount: equipmentCost,
      type: 'one-time',
      description: 'Computers, machinery, furniture, tools',
    });
  }

  if (config.baseCosts.legalFees > 0) {
    oneTimeBreakdown.push({
      category: 'Legal & Accounting Fees',
      amount: config.baseCosts.legalFees,
      type: 'one-time',
      description: 'Business registration, contracts, initial accounting setup',
    });
  }

  if (config.baseCosts.permits > 0) {
    oneTimeBreakdown.push({
      category: 'Licenses & Permits',
      amount: config.baseCosts.permits,
      type: 'one-time',
      description: 'Business licenses, industry-specific permits',
    });
  }

  if (config.baseCosts.branding > 0) {
    oneTimeBreakdown.push({
      category: 'Branding & Website',
      amount: config.baseCosts.branding,
      type: 'one-time',
      description: 'Logo, website, marketing materials',
    });
  }

  const inventoryCost = customInventory > 0 ? customInventory : config.baseCosts.inventory;
  if (inventoryCost > 0) {
    oneTimeBreakdown.push({
      category: 'Initial Inventory',
      amount: inventoryCost,
      type: 'one-time',
      description: 'Starting stock and supplies',
    });
  }

  if (config.baseCosts.deposit > 0 && (needsOffice || config.monthlyCosts.rent > 0)) {
    oneTimeBreakdown.push({
      category: 'Security Deposit',
      amount: config.baseCosts.deposit,
      type: 'one-time',
      description: 'Lease deposit (typically 2-3 months rent)',
    });
  }

  if (config.baseCosts.renovation > 0) {
    oneTimeBreakdown.push({
      category: 'Renovation & Buildout',
      amount: config.baseCosts.renovation,
      type: 'one-time',
      description: 'Space customization, fixtures, signage',
    });
  }

  // Calculate monthly costs
  const rentCost =
    needsOffice && config.monthlyCosts.rent === 0
      ? currency === 'USD'
        ? 1500
        : currency === 'GBP'
          ? 1200
          : 1350
      : config.monthlyCosts.rent;

  if (rentCost > 0) {
    monthlyBreakdown.push({
      category: 'Rent / Lease',
      amount: rentCost,
      type: 'monthly',
      description: 'Office or retail space',
    });
  }

  if (config.monthlyCosts.utilities > 0 || needsOffice) {
    monthlyBreakdown.push({
      category: 'Utilities',
      amount:
        config.monthlyCosts.utilities ||
        (currency === 'USD' ? 200 : currency === 'GBP' ? 160 : 180),
      type: 'monthly',
      description: 'Electric, water, internet, phone',
    });
  }

  if (config.monthlyCosts.software > 0) {
    monthlyBreakdown.push({
      category: 'Software & Subscriptions',
      amount: config.monthlyCosts.software,
      type: 'monthly',
      description: 'SaaS tools, accounting, CRM, etc.',
    });
  }

  if (config.monthlyCosts.marketing > 0) {
    monthlyBreakdown.push({
      category: 'Marketing & Advertising',
      amount: config.monthlyCosts.marketing,
      type: 'monthly',
      description: 'Ads, content, PR, events',
    });
  }

  if (config.monthlyCosts.insurance > 0) {
    monthlyBreakdown.push({
      category: 'Insurance',
      amount: config.monthlyCosts.insurance,
      type: 'monthly',
      description: 'Liability, property, professional',
    });
  }

  if (config.monthlyCosts.supplies > 0) {
    monthlyBreakdown.push({
      category: 'Operating Supplies',
      amount: config.monthlyCosts.supplies,
      type: 'monthly',
      description: 'Day-to-day supplies and materials',
    });
  }

  // Founder salary
  if (founderSalary > 0) {
    monthlyBreakdown.push({
      category: 'Founder Salary',
      amount: founderSalary,
      type: 'monthly',
      description: 'Your living expenses',
    });
  }

  // Employee costs
  if (employees > 0) {
    const avgMonthlySalary = Math.round(AVG_EMPLOYEE_SALARY[currency] / 12);
    const employeeBurden = 1.3; // Benefits, taxes, etc.
    const totalEmployeeCost = Math.round(avgMonthlySalary * employees * employeeBurden);

    monthlyBreakdown.push({
      category: 'Employee Costs',
      amount: totalEmployeeCost,
      type: 'monthly',
      description: `${employees} employee(s) with benefits and taxes`,
    });
  }

  // Sum up costs
  const oneTimeCosts = oneTimeBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const monthlyBurnRate = monthlyBreakdown.reduce((sum, item) => sum + item.amount, 0);

  // Calculate total capital needed
  const runwayCosts = monthlyBurnRate * runwayMonths;
  let totalCapitalNeeded = oneTimeCosts + runwayCosts;

  // Add contingency
  const contingencyBuffer = includeContingency
    ? Math.round(totalCapitalNeeded * (contingencyPercent / 100))
    : 0;

  totalCapitalNeeded += contingencyBuffer;

  // Calculate runway breakdown
  const breakdownByMonth: { month: number; remaining: number; spent: number }[] = [];
  let remaining = totalCapitalNeeded;
  let spent = oneTimeCosts;

  // Month 0 is one-time costs
  breakdownByMonth.push({
    month: 0,
    remaining: totalCapitalNeeded - oneTimeCosts,
    spent: oneTimeCosts,
  });
  remaining = totalCapitalNeeded - oneTimeCosts;

  for (let month = 1; month <= runwayMonths; month++) {
    spent += monthlyBurnRate;
    remaining -= monthlyBurnRate;
    breakdownByMonth.push({
      month,
      remaining: Math.max(0, remaining),
      spent,
    });
  }

  // Generate tips
  const tips: string[] = [];

  if (businessType === 'restaurant') {
    tips.push('Restaurant equipment can often be purchased used - save 40-60% on major items');
    tips.push('Negotiate your lease - landlords often offer free rent months for new businesses');
  } else if (businessType === 'consulting') {
    tips.push(
      'Start from home to minimize costs - a coffee shop or coworking pass is often enough'
    );
    tips.push('Build your network before spending on marketing - referrals are your best channel');
  } else if (businessType === 'ecommerce') {
    tips.push(
      'Start with a minimal inventory and use print-on-demand or dropshipping to test products'
    );
    tips.push('Focus marketing budget on one channel initially - master it before expanding');
  } else if (businessType === 'saas') {
    tips.push('Validate with a landing page before building - measure demand first');
    tips.push('Consider outsourcing development initially to reduce upfront costs');
  }

  tips.push(
    'Keep 3-6 months of runway in reserve beyond your plan - unexpected costs always arise'
  );
  tips.push(
    `Your monthly burn is ${formatCurrencySimple(monthlyBurnRate, currency)} - every month of runway costs this much`
  );

  return {
    currency,
    oneTimeCosts,
    monthlyBurnRate,
    totalCapitalNeeded,
    contingencyBuffer,
    oneTimeBreakdown,
    monthlyBreakdown,
    costPerEmployee:
      employees > 0 ? Math.round(totalCapitalNeeded / (employees + 1)) : totalCapitalNeeded,
    dailyBurnRate: Math.round(monthlyBurnRate / 30),
    weeklyBurnRate: Math.round(monthlyBurnRate / 4.33),
    breakdownByMonth,
    tips,
  };
}

function formatCurrencySimple(value: number, currency: Currency): string {
  const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';
  return `${symbol}${value.toLocaleString()}`;
}
