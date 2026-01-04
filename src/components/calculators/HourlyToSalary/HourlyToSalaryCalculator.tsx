/**
 * Hourly to Salary Calculator - React Component
 *
 * Interactive calculator for converting hourly rates to annual salary.
 */

import { useState, useMemo } from 'react';
import { calculateHourlyToSalary, formatCurrency } from './calculations';
import { getDefaultInputs, type HourlyToSalaryInputs, type HourlyToSalaryResult } from './types';
import { type Currency, CURRENCY_OPTIONS, getCurrencySymbol, getRegionFromCurrency } from '../../../lib/regions';

export default function HourlyToSalaryCalculator() {
  const [inputs, setInputs] = useState<HourlyToSalaryInputs>(() => getDefaultInputs('USD'));

  const currencySymbol = getCurrencySymbol(inputs.currency);
  const region = getRegionFromCurrency(inputs.currency);

  // Calculate results
  const result: HourlyToSalaryResult = useMemo(() => {
    return calculateHourlyToSalary(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof HourlyToSalaryInputs>(
    field: K,
    value: HourlyToSalaryInputs[K]
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
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Convert Hourly Rate to Salary
            </h2>
            <p className="text-green-100 text-sm mt-1">
              See your annual, monthly, and bi-weekly earnings
            </p>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="currency" className="text-green-100 text-sm font-medium">
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
          {/* Hourly Rate */}
          <div>
            <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Rate <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                {currencySymbol}
              </span>
              <input
                id="hourlyRate"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={inputs.hourlyRate}
                onChange={(e) => updateInput('hourlyRate', Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl
                           focus:border-green-500 focus:ring-4 focus:ring-green-100
                           transition-all duration-200 tabular-nums"
              />
            </div>
          </div>

          {/* Hours & Weeks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="hoursPerWeek" className="block text-sm font-medium text-gray-700 mb-2">
                Hours Per Week
              </label>
              <input
                id="hoursPerWeek"
                type="number"
                inputMode="numeric"
                min="1"
                max="80"
                value={inputs.hoursPerWeek}
                onChange={(e) => updateInput('hoursPerWeek', Number(e.target.value))}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
                           focus:border-green-500 focus:ring-4 focus:ring-green-100
                           transition-all duration-200 tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="weeksPerYear" className="block text-sm font-medium text-gray-700 mb-2">
                Weeks Per Year
              </label>
              <input
                id="weeksPerYear"
                type="number"
                inputMode="numeric"
                min="1"
                max="52"
                value={inputs.weeksPerYear}
                onChange={(e) => updateInput('weeksPerYear', Number(e.target.value))}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
                           focus:border-green-500 focus:ring-4 focus:ring-green-100
                           transition-all duration-200 tabular-nums"
              />
              <p className="text-sm text-gray-500 mt-1">52 weeks minus vacation time</p>
            </div>
          </div>

          {/* Tax Rate */}
          <div>
            <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Tax Rate
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
                           focus:border-green-500 focus:ring-4 focus:ring-green-100
                           transition-all duration-200 tabular-nums"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                %
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {region === 'US' && 'Federal + State income tax (typically 20-30%)'}
              {region === 'UK' && 'Income Tax + National Insurance (typically 20-30%)'}
              {region === 'EU' && 'Income Tax + Social Contributions (typically 25-40%)'}
            </p>
          </div>

          {/* Overtime Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={inputs.includeOvertime}
                onChange={(e) => updateInput('includeOvertime', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">Include overtime pay</span>
            </label>
          </div>

          {/* Overtime Fields */}
          {inputs.includeOvertime && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pl-8 border-l-4 border-green-100">
              <div>
                <label htmlFor="overtimeHours" className="block text-sm font-medium text-gray-700 mb-2">
                  Overtime Hours/Week
                </label>
                <input
                  id="overtimeHours"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="40"
                  value={inputs.overtimeHours}
                  onChange={(e) => updateInput('overtimeHours', Number(e.target.value))}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
                             focus:border-green-500 focus:ring-4 focus:ring-green-100
                             transition-all duration-200 tabular-nums"
                />
              </div>

              <div>
                <label htmlFor="overtimeMultiplier" className="block text-sm font-medium text-gray-700 mb-2">
                  Overtime Rate
                </label>
                <select
                  id="overtimeMultiplier"
                  value={inputs.overtimeMultiplier}
                  onChange={(e) => updateInput('overtimeMultiplier', Number(e.target.value))}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
                             focus:border-green-500 focus:ring-4 focus:ring-green-100
                             transition-all duration-200"
                >
                  <option value="1.25">1.25x (Time and a quarter)</option>
                  <option value="1.5">1.5x (Time and a half)</option>
                  <option value="2">2x (Double time)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8" />

        {/* Results Section */}
        <div className="space-y-6">
          {/* Primary Result - Annual Salary */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 md:p-8 text-center">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-2">
              Your Annual Salary
            </p>
            <p className="text-5xl md:text-6xl font-bold text-green-700 tabular-nums tracking-tight">
              {formatCurrency(result.netAnnual, result.currency)}
            </p>
            <p className="text-green-600 mt-2">
              After {Math.round(inputs.taxRate * 100)}% tax
            </p>
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-sm text-green-600">
                Gross (before tax):{' '}
                <span className="font-semibold tabular-nums">
                  {formatCurrency(result.grossAnnual, result.currency)}
                </span>
              </p>
            </div>
          </div>

          {/* Pay Period Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResultCard
              label="Monthly"
              gross={formatCurrency(result.grossMonthly, result.currency)}
              net={formatCurrency(result.netMonthly, result.currency)}
            />
            <ResultCard
              label="Bi-Weekly"
              gross={formatCurrency(result.grossBiWeekly, result.currency)}
              net={formatCurrency(result.netBiWeekly, result.currency)}
            />
            <ResultCard
              label="Weekly"
              gross={formatCurrency(result.grossWeekly, result.currency)}
              net={formatCurrency(result.netWeekly, result.currency)}
            />
            <ResultCard
              label="Hours/Year"
              gross={result.totalHoursPerYear.toLocaleString()}
              net="total hours"
              isHours
            />
          </div>

          {/* Overtime Info */}
          {inputs.includeOvertime && result.overtimeEarnings > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                <strong>Overtime earnings:</strong>{' '}
                {formatCurrency(result.overtimeEarnings, result.currency)} per year
                {' '}({inputs.overtimeHours} hours/week at {inputs.overtimeMultiplier}x rate)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ResultCardProps {
  label: string;
  gross: string;
  net: string;
  isHours?: boolean;
}

function ResultCard({ label, gross, net, isHours = false }: ResultCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-xl font-bold text-gray-800 tabular-nums">{gross}</p>
      <p className="text-xs text-gray-500 mt-1">
        {isHours ? net : `${net} net`}
      </p>
    </div>
  );
}
