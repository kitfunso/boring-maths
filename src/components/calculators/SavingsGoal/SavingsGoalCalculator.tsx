/**
 * Savings Goal Calculator - React Component
 *
 * Interactive calculator for planning savings with compound interest.
 */

import { useState, useMemo } from 'react';
import { calculateSavingsGoal, formatCurrency } from './calculations';
import { getDefaultInputs, type SavingsGoalInputs, type SavingsGoalResult } from './types';
import { type Currency, CURRENCY_OPTIONS, getCurrencySymbol } from '../../../lib/regions';

export default function SavingsGoalCalculator() {
  const [inputs, setInputs] = useState<SavingsGoalInputs>(() => getDefaultInputs('USD'));

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results
  const result: SavingsGoalResult = useMemo(() => {
    return calculateSavingsGoal(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof SavingsGoalInputs>(
    field: K,
    value: SavingsGoalInputs[K]
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
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Plan Your Savings Goal
            </h2>
            <p className="text-yellow-100 text-sm mt-1">
              Calculate contributions needed to reach your target
            </p>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="currency" className="text-yellow-100 text-sm font-medium">
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
          {/* Goal Amount & Current Savings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Savings Goal <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  {currencySymbol}
                </span>
                <input
                  id="goalAmount"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1000"
                  value={inputs.goalAmount}
                  onChange={(e) => updateInput('goalAmount', Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl
                             focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100
                             transition-all duration-200 tabular-nums"
                />
              </div>
            </div>

            <div>
              <label htmlFor="currentSavings" className="block text-sm font-medium text-gray-700 mb-2">
                Current Savings
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  {currencySymbol}
                </span>
                <input
                  id="currentSavings"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="100"
                  value={inputs.currentSavings}
                  onChange={(e) => updateInput('currentSavings', Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl
                             focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100
                             transition-all duration-200 tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <label htmlFor="timelineYears" className="block text-sm font-medium text-gray-700 mb-2">
              Time to Reach Goal: <span className="font-semibold text-yellow-600">{inputs.timelineYears} years</span>
            </label>
            <input
              id="timelineYears"
              type="range"
              min="1"
              max="30"
              value={inputs.timelineYears}
              onChange={(e) => updateInput('timelineYears', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>1 year</span>
              <span>15 years</span>
              <span>30 years</span>
            </div>
          </div>

          {/* Return Rate & Inflation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="annualReturn" className="block text-sm font-medium text-gray-700 mb-2">
                Expected Annual Return
              </label>
              <div className="relative">
                <input
                  id="annualReturn"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="20"
                  step="0.5"
                  value={Math.round(inputs.annualReturn * 100 * 10) / 10}
                  onChange={(e) => updateInput('annualReturn', Number(e.target.value) / 100)}
                  className="w-full pl-4 pr-10 py-3 text-lg border-2 border-gray-200 rounded-xl
                             focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100
                             transition-all duration-200 tabular-nums"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">7% is typical for diversified investments</p>
            </div>

            <div>
              <label htmlFor="inflationRate" className="block text-sm font-medium text-gray-700 mb-2">
                Expected Inflation Rate
              </label>
              <div className="relative">
                <input
                  id="inflationRate"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="15"
                  step="0.5"
                  value={Math.round(inputs.inflationRate * 100 * 10) / 10}
                  onChange={(e) => updateInput('inflationRate', Number(e.target.value) / 100)}
                  className="w-full pl-4 pr-10 py-3 text-lg border-2 border-gray-200 rounded-xl
                             focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100
                             transition-all duration-200 tabular-nums"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Historical average is 2-3%</p>
            </div>
          </div>

          {/* Contribution Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contribution Frequency
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['monthly', 'biweekly', 'weekly'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => updateInput('contributionFrequency', freq)}
                  className={`py-3 px-4 rounded-xl border-2 font-medium transition-all capitalize ${
                    inputs.contributionFrequency === freq
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-200 hover:border-yellow-300 text-gray-700'
                  }`}
                >
                  {freq === 'biweekly' ? 'Bi-Weekly' : freq}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8" />

        {/* Results Section */}
        <div className="space-y-6">
          {/* Primary Result */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-2xl p-6 md:p-8 text-center">
            <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wider mb-2">
              Save This Amount Every {result.contributionFrequency}
            </p>
            <p className="text-5xl md:text-6xl font-bold text-yellow-700 tabular-nums tracking-tight">
              {formatCurrency(result.contributionAmount, result.currency)}
            </p>
            <p className="text-yellow-600 mt-2">
              to reach {formatCurrency(inputs.goalAmount, inputs.currency)} in {inputs.timelineYears} years
            </p>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Total Contributions
              </p>
              <p className="text-xl font-bold text-gray-800 tabular-nums">
                {formatCurrency(result.totalContributions, result.currency)}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Interest Earned
              </p>
              <p className="text-xl font-bold text-green-600 tabular-nums">
                +{formatCurrency(result.totalInterest, result.currency)}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Final Balance
              </p>
              <p className="text-xl font-bold text-gray-800 tabular-nums">
                {formatCurrency(result.finalBalance, result.currency)}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Real Return Rate
              </p>
              <p className="text-xl font-bold text-gray-800 tabular-nums">
                {result.realReturnRate}%
              </p>
              <p className="text-xs text-gray-500">after inflation</p>
            </div>
          </div>

          {/* Inflation Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-amber-800">
              <strong>Inflation note:</strong> Your {formatCurrency(inputs.goalAmount, inputs.currency)} goal will have the purchasing power of {formatCurrency(result.inflationAdjustedGoal, result.currency)} in today's dollars after {inputs.timelineYears} years at {(inputs.inflationRate * 100).toFixed(1)}% inflation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
