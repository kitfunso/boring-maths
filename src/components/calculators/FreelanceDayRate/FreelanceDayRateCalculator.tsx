/**
 * Freelance Day Rate Calculator - React Component
 *
 * Interactive calculator that helps freelancers determine their ideal day rate
 * by comparing to equivalent salaried positions with tax adjustments.
 *
 * Supports multiple currencies (USD, GBP, EUR) with region-specific defaults.
 */

import { useState, useMemo } from 'react';
import {
  calculateFreelanceDayRate,
  formatCurrency,
} from './calculations';
import {
  getDefaultInputs,
  type FreelanceDayRateInputs,
  type FreelanceDayRateResult,
  INPUT_FIELD_CONFIG,
} from './types';
import {
  type Currency,
  CURRENCY_OPTIONS,
  getCurrencySymbol,
  getRegionFromCurrency,
} from '../../../lib/regions';

/**
 * Main calculator component
 */
export default function FreelanceDayRateCalculator() {
  const [inputs, setInputs] = useState<FreelanceDayRateInputs>(() => getDefaultInputs('USD'));
  const [error, setError] = useState<string | null>(null);

  // Get current currency symbol
  const currencySymbol = getCurrencySymbol(inputs.currency);
  const region = getRegionFromCurrency(inputs.currency);

  // Calculate results whenever inputs change
  const result: FreelanceDayRateResult | null = useMemo(() => {
    try {
      setError(null);
      return calculateFreelanceDayRate(inputs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation error');
      return null;
    }
  }, [inputs]);

  // Update a single input field
  const updateInput = (
    field: keyof FreelanceDayRateInputs,
    value: number | Currency
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change - reset to region-appropriate defaults
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  // Get region-specific help text
  const getHelpText = (fieldId: string): string => {
    const field = INPUT_FIELD_CONFIG.find(f => f.id === fieldId);
    if (!field) return '';
    if (field.helpTextByRegion && field.helpTextByRegion[region]) {
      return field.helpTextByRegion[region]!;
    }
    return field.helpText;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Calculate Your Day Rate
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Enter your target salary to find your equivalent freelance rate
            </p>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="currency" className="text-blue-100 text-sm font-medium">
              Currency:
            </label>
            <select
              id="currency"
              value={inputs.currency}
              onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
              className="bg-white/10 text-white border border-white/30 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer
                         hover:bg-white/20 transition-colors"
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
          {/* Annual Salary */}
          <div>
            <label
              htmlFor="annualSalary"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Target Annual Salary <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                {currencySymbol}
              </span>
              <input
                id="annualSalary"
                type="number"
                inputMode="numeric"
                min="0"
                max="1000000"
                step="1000"
                value={inputs.annualSalary}
                onChange={(e) =>
                  updateInput('annualSalary', Number(e.target.value))
                }
                className="w-full pl-8 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl
                           focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                           transition-all duration-200 tabular-nums"
                aria-describedby="annualSalary-help"
              />
            </div>
            <p id="annualSalary-help" className="text-sm text-gray-500 mt-1.5">
              Your target annual income before taxes
            </p>
          </div>

          {/* Tax Rate */}
          <div>
            <label
              htmlFor="taxRate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Estimated Tax Rate <span className="text-red-500">*</span>
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
                onChange={(e) =>
                  updateInput('taxRate', Number(e.target.value) / 100)
                }
                className="w-full pl-4 pr-10 py-3 text-lg border-2 border-gray-200 rounded-xl
                           focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                           transition-all duration-200 tabular-nums"
                aria-describedby="taxRate-help"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                %
              </span>
            </div>
            <p id="taxRate-help" className="text-sm text-gray-500 mt-1.5">
              {getHelpText('taxRate')}
            </p>
          </div>

          {/* Two Column Layout for Days */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Vacation Days */}
            <div>
              <label
                htmlFor="vacationDays"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Vacation Days <span className="text-red-500">*</span>
              </label>
              <input
                id="vacationDays"
                type="number"
                inputMode="numeric"
                min="0"
                max="60"
                value={inputs.vacationDays}
                onChange={(e) =>
                  updateInput('vacationDays', Number(e.target.value))
                }
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
                           focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                           transition-all duration-200 tabular-nums"
              />
              <p className="text-sm text-gray-500 mt-1.5">{getHelpText('vacationDays')}</p>
            </div>

            {/* Holidays */}
            <div>
              <label
                htmlFor="holidays"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Public Holidays
              </label>
              <input
                id="holidays"
                type="number"
                inputMode="numeric"
                min="0"
                max="30"
                value={inputs.holidays}
                onChange={(e) =>
                  updateInput('holidays', Number(e.target.value))
                }
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
                           focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                           transition-all duration-200 tabular-nums"
              />
              <p className="text-sm text-gray-500 mt-1.5">{getHelpText('holidays')}</p>
            </div>
          </div>

          {/* Benefits Value */}
          <div>
            <label
              htmlFor="benefitsValue"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Benefits Value{' '}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                {currencySymbol}
              </span>
              <input
                id="benefitsValue"
                type="number"
                inputMode="numeric"
                min="0"
                max="100000"
                step="500"
                value={inputs.benefitsValue}
                onChange={(e) =>
                  updateInput('benefitsValue', Number(e.target.value))
                }
                className="w-full pl-8 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl
                           focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                           transition-all duration-200 tabular-nums"
                aria-describedby="benefitsValue-help"
              />
            </div>
            <p id="benefitsValue-help" className="text-sm text-gray-500 mt-1.5">
              {getHelpText('benefitsValue')}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8" />

        {/* Results Section */}
        {error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
            <svg
              className="w-12 h-12 text-red-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : result ? (
          <div className="space-y-6">
            {/* Primary Result - Day Rate */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 md:p-8 text-center">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">
                Your Recommended Day Rate
              </p>
              <p className="text-5xl md:text-6xl font-bold text-blue-700 tabular-nums tracking-tight">
                {formatCurrency(result.netDayRate, result.currency)}
              </p>
              <p className="text-blue-600 mt-2">
                After {Math.round(inputs.taxRate * 100)}% tax
              </p>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-blue-600">
                  Gross rate (before tax):{' '}
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(result.grossDayRate, result.currency)}
                  </span>
                </p>
              </div>
            </div>

            {/* Secondary Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ResultCard
                label="Hourly Rate"
                value={formatCurrency(result.hourlyRate, result.currency)}
                sublabel="8-hour day"
              />
              <ResultCard
                label="Weekly Income"
                value={formatCurrency(result.weeklyIncome, result.currency)}
                sublabel="5 days/week"
              />
              <ResultCard
                label="Monthly Income"
                value={formatCurrency(result.monthlyIncome, result.currency)}
                sublabel="~21.7 days"
              />
              <ResultCard
                label="Working Days"
                value={result.workingDays.toString()}
                sublabel="per year"
              />
            </div>

            {/* Annual Comparison */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                Annual Income Comparison
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    As Employee
                  </p>
                  <p className="text-2xl font-bold text-gray-700 tabular-nums">
                    {formatCurrency(result.annualComparison.asEmployee, result.currency)}
                  </p>
                  <p className="text-xs text-gray-500">after tax</p>
                </div>

                <div className="hidden sm:block">
                  <svg
                    className="w-8 h-8 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>

                <div className="text-center sm:text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    As Freelancer
                  </p>
                  <p className="text-2xl font-bold text-green-600 tabular-nums">
                    {formatCurrency(result.annualComparison.asFreelancer, result.currency)}
                  </p>
                  <p className="text-xs text-gray-500">at this day rate</p>
                </div>
              </div>

              {result.annualComparison.difference !== 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-600">
                    {result.annualComparison.difference > 0 ? (
                      <>
                        At full utilization, you'd earn{' '}
                        <span className="font-semibold text-green-600">
                          {formatCurrency(result.annualComparison.difference, result.currency)} more
                        </span>{' '}
                        as a freelancer
                      </>
                    ) : (
                      <>
                        Note: This rate accounts for benefits worth{' '}
                        <span className="font-semibold">
                          {formatCurrency(inputs.benefitsValue, inputs.currency)}
                        </span>{' '}
                        that you'll need to self-fund
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Info Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <svg
                className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-amber-800">
                <strong>Pro tip:</strong> Most freelancers only bill 70-80% of
                working days due to admin, marketing, and gaps between projects.
                Consider adding a 20-30% buffer to your rate.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Result card component for displaying individual metrics
 */
interface ResultCardProps {
  label: string;
  value: string;
  sublabel?: string;
}

function ResultCard({ label, value, sublabel }: ResultCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-200 hover:shadow-sm transition-all">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-xl md:text-2xl font-bold text-gray-800 tabular-nums">
        {value}
      </p>
      {sublabel && (
        <p className="text-xs text-gray-400 mt-1">{sublabel}</p>
      )}
    </div>
  );
}
