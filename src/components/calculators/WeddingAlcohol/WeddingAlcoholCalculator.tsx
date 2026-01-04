/**
 * Wedding Alcohol Calculator - React Component
 *
 * Interactive calculator for estimating alcohol quantities for weddings.
 */

import { useState, useMemo } from 'react';
import { calculateWeddingAlcohol, formatNumber } from './calculations';
import {
  DEFAULT_INPUTS,
  type WeddingAlcoholInputs,
  type WeddingAlcoholResult,
  type DrinkingLevel,
} from './types';

export default function WeddingAlcoholCalculator() {
  const [inputs, setInputs] = useState<WeddingAlcoholInputs>(DEFAULT_INPUTS);

  // Calculate results whenever inputs change
  const result: WeddingAlcoholResult = useMemo(() => {
    return calculateWeddingAlcohol(inputs);
  }, [inputs]);

  // Update a single input field
  const updateInput = <K extends keyof WeddingAlcoholInputs>(
    field: K,
    value: WeddingAlcoholInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Check if drink percentages are valid
  const percentageTotal = inputs.winePercent + inputs.beerPercent + inputs.liquorPercent;
  const isPercentageValid = percentageTotal >= 99 && percentageTotal <= 101;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
        <h2 className="text-xl font-semibold text-white">
          Estimate Your Wedding Alcohol
        </h2>
        <p className="text-purple-100 text-sm mt-1">
          Calculate how much beer, wine, and liquor you'll need
        </p>
      </div>

      <div className="p-6 md:p-8">
        {/* Input Section */}
        <div className="space-y-6 mb-8">
          {/* Guest Count & Event Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Guests <span className="text-red-500">*</span>
              </label>
              <input
                id="guestCount"
                type="number"
                inputMode="numeric"
                min="1"
                max="1000"
                value={inputs.guestCount}
                onChange={(e) => updateInput('guestCount', Number(e.target.value))}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
                           focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                           transition-all duration-200 tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="eventHours" className="block text-sm font-medium text-gray-700 mb-2">
                Event Duration (hours) <span className="text-red-500">*</span>
              </label>
              <input
                id="eventHours"
                type="number"
                inputMode="numeric"
                min="1"
                max="12"
                value={inputs.eventHours}
                onChange={(e) => updateInput('eventHours', Number(e.target.value))}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
                           focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                           transition-all duration-200 tabular-nums"
              />
            </div>
          </div>

          {/* Drinkers Percentage */}
          <div>
            <label htmlFor="drinkersPercent" className="block text-sm font-medium text-gray-700 mb-2">
              Percentage Who Drink Alcohol
            </label>
            <div className="relative">
              <input
                id="drinkersPercent"
                type="range"
                min="0"
                max="100"
                value={inputs.drinkersPercent}
                onChange={(e) => updateInput('drinkersPercent', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>0%</span>
                <span className="font-semibold text-purple-600">{inputs.drinkersPercent}%</span>
                <span>100%</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {result.drinkingGuests} guests will drink alcohol
            </p>
          </div>

          {/* Drinking Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Drinking Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'moderate', 'heavy'] as DrinkingLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => updateInput('drinkingLevel', level)}
                  className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                    inputs.drinkingLevel === level
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300 text-gray-700'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {inputs.drinkingLevel === 'light' && '~0.75 drinks per hour per guest'}
              {inputs.drinkingLevel === 'moderate' && '~1 drink per hour per guest'}
              {inputs.drinkingLevel === 'heavy' && '~1.5 drinks per hour per guest'}
            </p>
          </div>

          {/* Drink Type Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Drink Preferences (must total 100%)
            </label>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Wine</span>
                  <span className="font-medium">{inputs.winePercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={inputs.winePercent}
                  onChange={(e) => updateInput('winePercent', Number(e.target.value))}
                  className="w-full h-2 bg-red-100 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Beer</span>
                  <span className="font-medium">{inputs.beerPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={inputs.beerPercent}
                  onChange={(e) => updateInput('beerPercent', Number(e.target.value))}
                  className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Liquor/Cocktails</span>
                  <span className="font-medium">{inputs.liquorPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={inputs.liquorPercent}
                  onChange={(e) => updateInput('liquorPercent', Number(e.target.value))}
                  className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
            {!isPercentageValid && (
              <p className="text-sm text-amber-600 mt-2">
                Total: {percentageTotal}% (will be normalized to 100%)
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8" />

        {/* Results Section */}
        <div className="space-y-6">
          {/* Primary Results - Bottles Needed */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2">🍷</div>
              <p className="text-3xl font-bold text-red-700 tabular-nums">
                {formatNumber(result.wineBottles)}
              </p>
              <p className="text-red-600 text-sm font-medium mt-1">Wine Bottles</p>
              <p className="text-red-500 text-xs mt-1">({result.breakdown.wineServings} glasses)</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2">🍺</div>
              <p className="text-3xl font-bold text-amber-700 tabular-nums">
                {formatNumber(result.beerBottles)}
              </p>
              <p className="text-amber-600 text-sm font-medium mt-1">Beer Bottles</p>
              <p className="text-amber-500 text-xs mt-1">({result.breakdown.beerServings} servings)</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2">🥃</div>
              <p className="text-3xl font-bold text-blue-700 tabular-nums">
                {formatNumber(result.liquorBottles)}
              </p>
              <p className="text-blue-600 text-sm font-medium mt-1">Liquor Bottles</p>
              <p className="text-blue-500 text-xs mt-1">({result.breakdown.liquorServings} cocktails)</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-800 tabular-nums">
                  {formatNumber(result.totalDrinks)}
                </p>
                <p className="text-sm text-gray-600">Total Drinks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 tabular-nums">
                  {result.drinkingGuests}
                </p>
                <p className="text-sm text-gray-600">Drinking Guests</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 tabular-nums">
                  {result.drinksPerGuest}
                </p>
                <p className="text-sm text-gray-600">Drinks per Guest</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex gap-3">
            <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-purple-800">
              <strong>Pro tip:</strong> Buy 10-15% extra to account for spillage, heavy drinkers, and unexpected guests. Most stores allow returns of unopened bottles.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
