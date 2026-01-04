/**
 * Side Hustle Profitability Calculator - React Component
 *
 * Interactive calculator for analyzing side hustle profitability.
 */

import { useState, useMemo } from 'react';
import { calculateSideHustle, formatCurrency } from './calculations';
import { getDefaultInputs, type SideHustleInputs, type SideHustleResult } from './types';
import { type Currency, CURRENCY_OPTIONS, getCurrencySymbol, getRegionFromCurrency } from '../../../lib/regions';

export default function SideHustleCalculator() {
  const [inputs, setInputs] = useState<SideHustleInputs>(() => getDefaultInputs('USD'));

  const currencySymbol = getCurrencySymbol(inputs.currency);
  const region = getRegionFromCurrency(inputs.currency);

  // Calculate results
  const result: SideHustleResult = useMemo(() => {
    return calculateSideHustle(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof SideHustleInputs>(
    field: K,
    value: SideHustleInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Analyze Your Side Hustle
            </h2>
            <p className="text-red-100 text-sm mt-1">
              Calculate if your side project is truly profitable
            </p>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="currency" className="text-red-100 text-sm font-medium">
              Currency:
            </label>
            <select
              id="currency"
              value={inputs.currency}
              onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
              className="bg-white/10 text-white border border-white/30 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
            >
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="text-gray-900">
                  {option.flag} {option.value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Input Section */}
        <div className="space-y-6 mb-8">
          {/* Revenue & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="monthlyRevenue" className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Revenue <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  {currencySymbol}
                </span>
                <input
                  id="monthlyRevenue"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="100"
                  value={inputs.monthlyRevenue}
                  onChange={(e) => updateInput('monthlyRevenue', Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl
                             focus:border-red-500 focus:ring-4 focus:ring-red-100
                             transition-all duration-200 tabular-nums"
                />
              </div>
            </div>

            <div>
              <label htmlFor="hoursPerWeek" className="block text-sm font-medium text-gray-700 mb-2">
                Hours Per Week <span className="text-red-500">*</span>
              </label>
              <input
                id="hoursPerWeek"
                type="number"
                inputMode="numeric"
                min="0"
                max="60"
                value={inputs.hoursPerWeek}
                onChange={(e) => updateInput('hoursPerWeek', Number(e.target.value))}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
                           focus:border-red-500 focus:ring-4 focus:ring-red-100
                           transition-all duration-200 tabular-nums"
              />
            </div>
          </div>

          {/* Expenses Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Monthly Expenses
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="monthlyExpenses" className="block text-xs text-gray-600 mb-1">
                  Materials/Supplies
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {currencySymbol}
                  </span>
                  <input
                    id="monthlyExpenses"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={inputs.monthlyExpenses}
                    onChange={(e) => updateInput('monthlyExpenses', Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg
                               focus:border-red-500 focus:ring-2 focus:ring-red-100 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="marketingSpend" className="block text-xs text-gray-600 mb-1">
                  Marketing/Ads
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {currencySymbol}
                  </span>
                  <input
                    id="marketingSpend"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={inputs.marketingSpend}
                    onChange={(e) => updateInput('marketingSpend', Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg
                               focus:border-red-500 focus:ring-2 focus:ring-red-100 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="toolsCost" className="block text-xs text-gray-600 mb-1">
                  Software/Tools
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {currencySymbol}
                  </span>
                  <input
                    id="toolsCost"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={inputs.toolsCost}
                    onChange={(e) => updateInput('toolsCost', Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg
                               focus:border-red-500 focus:ring-2 focus:ring-red-100 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="otherCosts" className="block text-xs text-gray-600 mb-1">
                  Other Costs
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {currencySymbol}
                  </span>
                  <input
                    id="otherCosts"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={inputs.otherCosts}
                    onChange={(e) => updateInput('otherCosts', Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg
                               focus:border-red-500 focus:ring-2 focus:ring-red-100 tabular-nums"
                  />
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Total expenses: {formatCurrency(result.totalExpenses, inputs.currency)}/month
            </p>
          </div>

          {/* Comparison & Tax */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="mainJobHourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
                Main Job Hourly Rate
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  {currencySymbol}
                </span>
                <input
                  id="mainJobHourlyRate"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={inputs.mainJobHourlyRate}
                  onChange={(e) => updateInput('mainJobHourlyRate', Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl
                             focus:border-red-500 focus:ring-4 focus:ring-red-100
                             transition-all duration-200 tabular-nums"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">For opportunity cost comparison</p>
            </div>

            <div>
              <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate
              </label>
              <div className="relative">
                <input
                  id="taxRate"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="60"
                  step="1"
                  value={Math.round(inputs.taxRate * 100)}
                  onChange={(e) => updateInput('taxRate', Number(e.target.value) / 100)}
                  className="w-full pl-4 pr-10 py-3 text-lg border-2 border-gray-200 rounded-xl
                             focus:border-red-500 focus:ring-4 focus:ring-red-100
                             transition-all duration-200 tabular-nums"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  %
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {region === 'US' && 'Include self-employment tax (15.3%)'}
                {region === 'UK' && 'Include National Insurance'}
                {region === 'EU' && 'Include social contributions'}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8" />

        {/* Results Section */}
        <div className="space-y-6">
          {/* Verdict Banner */}
          <div className={`rounded-2xl p-6 text-center ${
            result.beatsMainJob
              ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200'
              : result.isProfitable
              ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200'
              : 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200'
          }`}>
            <div className="text-4xl mb-2">
              {result.beatsMainJob ? '🎉' : result.isProfitable ? '🤔' : '⚠️'}
            </div>
            <p className={`text-lg font-semibold ${
              result.beatsMainJob
                ? 'text-green-700'
                : result.isProfitable
                ? 'text-yellow-700'
                : 'text-red-700'
            }`}>
              {result.beatsMainJob
                ? 'Your side hustle beats your main job rate!'
                : result.isProfitable
                ? 'Profitable, but lower than your main job rate'
                : 'Currently not profitable'}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Effective Hourly Rate
              </p>
              <p className={`text-2xl font-bold tabular-nums ${
                result.effectiveHourlyRate >= inputs.mainJobHourlyRate
                  ? 'text-green-600'
                  : 'text-gray-800'
              }`}>
                {formatCurrency(result.effectiveHourlyRate, result.currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">vs {formatCurrency(inputs.mainJobHourlyRate, inputs.currency)} main job</p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Monthly Net Profit
              </p>
              <p className={`text-2xl font-bold tabular-nums ${
                result.monthlyNetProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(result.monthlyNetProfit, result.currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">after taxes</p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Annual Net Profit
              </p>
              <p className={`text-2xl font-bold tabular-nums ${
                result.annualNetProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(result.annualNetProfit, result.currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">projected</p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Profit Margin
              </p>
              <p className={`text-2xl font-bold tabular-nums ${
                result.profitMargin >= 20 ? 'text-green-600' : result.profitMargin >= 0 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {result.profitMargin}%
              </p>
              <p className="text-xs text-gray-500 mt-1">gross margin</p>
            </div>
          </div>

          {/* Opportunity Cost Analysis */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Opportunity Cost Analysis
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  If you worked these hours at main job
                </p>
                <p className="text-2xl font-bold text-gray-700 tabular-nums">
                  {formatCurrency(result.opportunityCost, result.currency)}
                </p>
                <p className="text-xs text-gray-500">{result.hoursPerMonth} hours/month</p>
              </div>

              <div className="text-center">
                <p className={`text-xl font-bold ${result.netVsMainJob >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.netVsMainJob >= 0 ? '+' : ''}{formatCurrency(result.netVsMainJob, result.currency)}
                </p>
                <p className="text-xs text-gray-500">vs main job</p>
              </div>

              <div className="text-center sm:text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Break-even revenue
                </p>
                <p className="text-2xl font-bold text-gray-700 tabular-nums">
                  {formatCurrency(result.breakEvenRevenue, result.currency)}
                </p>
                <p className="text-xs text-gray-500">minimum needed</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-red-800">
              <strong>Remember:</strong> Don't forget hidden costs like shipping supplies, transaction fees (2-3%), returns, and your time spent on admin tasks. Consider if this side hustle could scale or is trading time for money.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
