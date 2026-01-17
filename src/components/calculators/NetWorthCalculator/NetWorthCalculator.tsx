/**
 * Net Worth Calculator - React Component
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateNetWorth, formatCurrency, formatPercent } from './calculations';
import {
  getDefaultInputs,
  generateId,
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES,
  type NetWorthInputs,
  type Asset,
  type Liability,
  type AssetCategory,
  type LiabilityCategory,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function NetWorthCalculator() {
  const [inputs, setInputs] = useState<NetWorthInputs>(() => getDefaultInputs());

  const result = useMemo(() => calculateNetWorth(inputs), [inputs]);

  const addAsset = () => {
    const newAsset: Asset = {
      id: generateId(),
      name: '',
      value: 0,
      category: 'cash',
    };
    setInputs((prev) => ({ ...prev, assets: [...prev.assets, newAsset] }));
  };

  const updateAsset = (id: string, field: keyof Asset, value: string | number) => {
    setInputs((prev) => ({
      ...prev,
      assets: prev.assets.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    }));
  };

  const removeAsset = (id: string) => {
    setInputs((prev) => ({
      ...prev,
      assets: prev.assets.filter((a) => a.id !== id),
    }));
  };

  const addLiability = () => {
    const newLiability: Liability = {
      id: generateId(),
      name: '',
      value: 0,
      category: 'other',
    };
    setInputs((prev) => ({ ...prev, liabilities: [...prev.liabilities, newLiability] }));
  };

  const updateLiability = (id: string, field: keyof Liability, value: string | number) => {
    setInputs((prev) => ({
      ...prev,
      liabilities: prev.liabilities.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }));
  };

  const removeLiability = (id: string) => {
    setInputs((prev) => ({
      ...prev,
      liabilities: prev.liabilities.filter((l) => l.id !== id),
    }));
  };

  const assetCategoryColors: Record<AssetCategory, string> = {
    cash: 'bg-green-500',
    investments: 'bg-blue-500',
    retirement: 'bg-purple-500',
    property: 'bg-amber-500',
    vehicles: 'bg-cyan-500',
    other: 'bg-gray-500',
  };

  const liabilityCategoryColors: Record<LiabilityCategory, string> = {
    mortgage: 'bg-red-500',
    auto: 'bg-orange-500',
    student: 'bg-pink-500',
    credit: 'bg-rose-500',
    other: 'bg-gray-500',
  };

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="Net Worth Calculator"
          subtitle="Calculate your total assets minus liabilities"
        />

        <div className="p-6 md:p-8">
          {/* Assets Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-green-400">Assets (What You Own)</h3>
              <button
                onClick={addAsset}
                className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
              >
                + Add Asset
              </button>
            </div>

            <div className="space-y-3">
              {inputs.assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex gap-3 items-center bg-[var(--color-night)] rounded-lg p-3"
                >
                  <input
                    type="text"
                    placeholder="Asset name"
                    value={asset.name}
                    onChange={(e) =>
                      updateAsset(asset.id, 'name', (e.target as HTMLInputElement).value)
                    }
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--color-cream)] text-sm"
                  />
                  <select
                    value={asset.category}
                    onChange={(e) =>
                      updateAsset(asset.id, 'category', (e.target as HTMLSelectElement).value)
                    }
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--color-cream)] text-sm"
                  >
                    {ASSET_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                      $
                    </span>
                    <input
                      type="number"
                      value={asset.value}
                      onChange={(e) =>
                        updateAsset(asset.id, 'value', Number((e.target as HTMLInputElement).value))
                      }
                      className="w-32 pl-7 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--color-cream)] text-sm text-right"
                    />
                  </div>
                  <button
                    onClick={() => removeAsset(asset.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 text-right text-lg font-semibold text-green-400">
              Total Assets: {formatCurrency(result.totalAssets)}
            </div>
          </div>

          {/* Liabilities Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-400">Liabilities (What You Owe)</h3>
              <button
                onClick={addLiability}
                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
              >
                + Add Liability
              </button>
            </div>

            <div className="space-y-3">
              {inputs.liabilities.map((liability) => (
                <div
                  key={liability.id}
                  className="flex gap-3 items-center bg-[var(--color-night)] rounded-lg p-3"
                >
                  <input
                    type="text"
                    placeholder="Liability name"
                    value={liability.name}
                    onChange={(e) =>
                      updateLiability(liability.id, 'name', (e.target as HTMLInputElement).value)
                    }
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--color-cream)] text-sm"
                  />
                  <select
                    value={liability.category}
                    onChange={(e) =>
                      updateLiability(
                        liability.id,
                        'category',
                        (e.target as HTMLSelectElement).value
                      )
                    }
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--color-cream)] text-sm"
                  >
                    {LIABILITY_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                      $
                    </span>
                    <input
                      type="number"
                      value={liability.value}
                      onChange={(e) =>
                        updateLiability(
                          liability.id,
                          'value',
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                      className="w-32 pl-7 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[var(--color-cream)] text-sm text-right"
                    />
                  </div>
                  <button
                    onClick={() => removeLiability(liability.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 text-right text-lg font-semibold text-red-400">
              Total Liabilities: {formatCurrency(result.totalLiabilities)}
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            <ResultCard
              label="Your Net Worth"
              value={formatCurrency(result.netWorth)}
              subtitle={
                result.netWorth >= 0 ? 'Assets exceed liabilities' : 'Liabilities exceed assets'
              }
              valueColor={result.netWorth >= 0 ? 'success' : 'error'}
            />

            {/* Key Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Total Assets"
                value={formatCurrency(result.totalAssets)}
                sublabel="what you own"
                valueColor="success"
              />
              <MetricCard
                label="Total Liabilities"
                value={formatCurrency(result.totalLiabilities)}
                sublabel="what you owe"
                valueColor="error"
              />
              <MetricCard
                label="Net Worth"
                value={formatCurrency(result.netWorth)}
                sublabel="assets - liabilities"
                valueColor={result.netWorth >= 0 ? 'success' : 'error'}
              />
              <MetricCard
                label="Debt-to-Asset"
                value={formatPercent(result.debtToAssetRatio)}
                sublabel={result.debtToAssetRatio < 50 ? 'healthy' : 'high'}
                valueColor={result.debtToAssetRatio < 50 ? 'success' : 'error'}
              />
            </Grid>

            {/* Asset Breakdown */}
            {result.totalAssets > 0 && (
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Asset Breakdown
                </h3>
                <div className="space-y-3">
                  {ASSET_CATEGORIES.filter((cat) => result.assetBreakdown[cat.value] > 0).map(
                    (cat) => {
                      const amount = result.assetBreakdown[cat.value];
                      const percent = (amount / result.totalAssets) * 100;
                      return (
                        <div key={cat.value}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{cat.label}</span>
                            <span>
                              {formatCurrency(amount)} ({percent.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full ${assetCategoryColors[cat.value]} rounded-full`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Liability Breakdown */}
            {result.totalLiabilities > 0 && (
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Liability Breakdown
                </h3>
                <div className="space-y-3">
                  {LIABILITY_CATEGORIES.filter(
                    (cat) => result.liabilityBreakdown[cat.value] > 0
                  ).map((cat) => {
                    const amount = result.liabilityBreakdown[cat.value];
                    const percent = (amount / result.totalLiabilities) * 100;
                    return (
                      <div key={cat.value}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{cat.label}</span>
                          <span>
                            {formatCurrency(amount)} ({percent.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full ${liabilityCategoryColors[cat.value]} rounded-full`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tips */}
            <Alert variant="tip" title="Building Net Worth:">
              Focus on increasing assets (saving, investing) while decreasing liabilities (paying
              off debt). The average American household has a net worth around $120,000, but median
              is much lower due to wealth inequality. Track your net worth monthly to see progress.
            </Alert>

            {/* Share */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Net Worth: ${formatCurrency(result.netWorth)} (${formatCurrency(result.totalAssets)} assets - ${formatCurrency(result.totalLiabilities)} liabilities)`}
                calculatorName="Net Worth Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
