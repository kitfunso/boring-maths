/**
 * Subscription Audit Calculator - React Component
 *
 * Track and analyze subscription spending with usage ratings
 * to identify savings opportunities.
 */

import { useState, useMemo } from 'preact/hooks';
import { analyzeSubscriptions, formatCurrency } from './calculations';
import {
  getDefaultInputs,
  createSubscription,
  CATEGORY_LABELS,
  COMMON_SUBSCRIPTIONS,
  type SubscriptionAuditInputs,
  type SubscriptionAuditResult,
  type Subscription,
  type SubscriptionCategory,
  type BillingFrequency,
  type UsageRating,
} from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
  Select,
  Checkbox,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
/**
 * Single subscription row
 */
function SubscriptionRow({
  subscription,
  currencySymbol,
  onChange,
  onRemove,
}: {
  subscription: Subscription;
  currencySymbol: string;
  onChange: (updates: Partial<Subscription>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-[var(--color-night)]/50 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Subscription name"
            value={subscription.name}
            onChange={(e) => onChange({ name: (e.target as HTMLInputElement).value })}
          />
        </div>
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 p-2 transition-colors"
          aria-label="Remove subscription"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      <Grid responsive={{ sm: 2, md: 4 }} gap="sm">
        <div>
          <Label htmlFor={`cost-${subscription.id}`}>Cost</Label>
          <Input
            id={`cost-${subscription.id}`}
            variant="currency"
            currencySymbol={currencySymbol}
            min={0}
            step={0.01}
            value={subscription.cost}
            onChange={(e) => onChange({ cost: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor={`freq-${subscription.id}`}>Billing</Label>
          <Select
            id={`freq-${subscription.id}`}
            value={subscription.frequency}
            onChange={(e) =>
              onChange({ frequency: (e.target as HTMLSelectElement).value as BillingFrequency })
            }
            options={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
          />
        </div>
        <div>
          <Label htmlFor={`cat-${subscription.id}`}>Category</Label>
          <Select
            id={`cat-${subscription.id}`}
            value={subscription.category}
            onChange={(e) =>
              onChange({ category: (e.target as HTMLSelectElement).value as SubscriptionCategory })
            }
            options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </div>
        <div>
          <Label htmlFor={`usage-${subscription.id}`}>Usage</Label>
          <Select
            id={`usage-${subscription.id}`}
            value={subscription.usage}
            onChange={(e) =>
              onChange({ usage: (e.target as HTMLSelectElement).value as UsageRating })
            }
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ]}
          />
        </div>
      </Grid>

      <Checkbox
        id={`essential-${subscription.id}`}
        checked={subscription.essential}
        onChange={(e) => onChange({ essential: (e.target as HTMLInputElement).checked })}
        label="Essential (can't live without)"
      />
    </div>
  );
}

/**
 * Recommendation badge
 */
function RecommendationBadge({ recommendation }: { recommendation: 'keep' | 'review' | 'cancel' }) {
  const styles = {
    keep: 'bg-green-500/20 text-green-400 border-green-500/30',
    review: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    cancel: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const labels = {
    keep: 'Keep',
    review: 'Review',
    cancel: 'Cancel',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${styles[recommendation]}`}>
      {labels[recommendation]}
    </span>
  );
}

export default function SubscriptionAudit() {
  // Track calculator usage for analytics
  useCalculatorTracking('Subscription Audit');

  const [inputs, setInputs] = useState<SubscriptionAuditInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results
  const result: SubscriptionAuditResult = useMemo(() => {
    return analyzeSubscriptions(inputs);
  }, [inputs]);

  // Update subscription
  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setInputs((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  // Add subscription
  const addSubscription = (template?: Partial<Subscription>) => {
    const multiplier = inputs.currency === 'GBP' ? 0.8 : inputs.currency === 'EUR' ? 0.92 : 1;
    const newSub = createSubscription({
      ...template,
      cost: template?.cost ? Math.round(template.cost * multiplier * 100) / 100 : 0,
    });
    setInputs((prev) => ({
      ...prev,
      subscriptions: [...prev.subscriptions, newSub],
    }));
    setShowQuickAdd(false);
  };

  // Remove subscription
  const removeSubscription = (id: string) => {
    setInputs((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.filter((s) => s.id !== id),
    }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Subscription Audit"
          subtitle="Find out how much you're really spending"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Estimate Section */}
          <div className="mb-6">
            <Label htmlFor="estimate">
              How much do you THINK you spend monthly on subscriptions?
            </Label>
            <Input
              id="estimate"
              variant="currency"
              currencySymbol={currencySymbol}
              min={0}
              step={5}
              value={inputs.estimatedMonthlySpend}
              onChange={(e) =>
                setInputs((prev) => ({ ...prev, estimatedMonthlySpend: Number(e.target.value) }))
              }
            />
            <p className="text-sm text-[var(--color-muted)] mt-1">
              Studies show people underestimate by 2-3x on average
            </p>
          </div>

          {/* Subscriptions List */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <Label>Your Subscriptions</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQuickAdd(!showQuickAdd)}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Quick Add
                </button>
                <button
                  onClick={() => addSubscription()}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  + Add Custom
                </button>
              </div>
            </div>

            {/* Quick Add Panel */}
            {showQuickAdd && (
              <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/30">
                <p className="text-sm text-[var(--color-muted)] mb-3">
                  Click to add common subscriptions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SUBSCRIPTIONS.map((template) => (
                    <button
                      key={template.name}
                      onClick={() => addSubscription(template)}
                      className="bg-[var(--color-night)] hover:bg-white/10 text-[var(--color-cream)] px-3 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subscription Rows */}
            {inputs.subscriptions.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-muted)]">
                No subscriptions added yet. Click "Add Custom" or "Quick Add" to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {inputs.subscriptions.map((sub) => (
                  <SubscriptionRow
                    key={sub.id}
                    subscription={sub}
                    currencySymbol={currencySymbol}
                    onChange={(updates) => updateSubscription(sub.id, updates)}
                    onRemove={() => removeSubscription(sub.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <Divider />

          {/* Results Section */}
          {inputs.subscriptions.length > 0 && (
            <div className="space-y-6">
              {/* Reality Check */}
              {inputs.estimatedMonthlySpend > 0 && (
                <div
                  className={`rounded-xl p-6 border ${
                    result.estimateComparison.percentageOff > 20
                      ? 'bg-red-900/20 border-red-500/30'
                      : result.estimateComparison.percentageOff > 0
                        ? 'bg-amber-900/20 border-amber-500/30'
                        : 'bg-green-900/20 border-green-500/30'
                  }`}
                >
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-[var(--color-cream)]">
                    Reality Check
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-[var(--color-muted)]">You estimated</div>
                      <div className="text-2xl font-bold text-[var(--color-cream)]">
                        {formatCurrency(result.estimateComparison.estimated, result.currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-[var(--color-muted)]">Actually spending</div>
                      <div className="text-2xl font-bold text-purple-400">
                        {formatCurrency(result.estimateComparison.actual, result.currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-[var(--color-muted)]">Difference</div>
                      <div
                        className={`text-2xl font-bold ${
                          result.estimateComparison.difference > 0
                            ? 'text-red-400'
                            : 'text-green-400'
                        }`}
                      >
                        {result.estimateComparison.difference > 0 ? '+' : ''}
                        {formatCurrency(result.estimateComparison.difference, result.currency)}
                        <span className="text-sm ml-1">
                          ({result.estimateComparison.percentageOff > 0 ? '+' : ''}
                          {result.estimateComparison.percentageOff}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Primary Result */}
              <ResultCard
                label="Total Monthly Spending"
                value={formatCurrency(result.totalMonthly, result.currency, 2)}
                subtitle={`${formatCurrency(result.totalYearly, result.currency)} per year`}
                footer={
                  <>
                    That's{' '}
                    <span className="font-semibold">
                      {formatCurrency(result.summary.costPerDay, result.currency, 2)}/day
                    </span>{' '}
                    on subscriptions
                  </>
                }
              />

              {/* Summary Stats */}
              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <MetricCard
                  label="Subscriptions"
                  value={result.summary.totalSubscriptions.toString()}
                  sublabel={`${result.summary.essentialCount} essential`}
                />
                <MetricCard
                  label="Average Cost"
                  value={formatCurrency(result.summary.averagePerSubscription, result.currency, 2)}
                  sublabel="per subscription"
                />
                <MetricCard
                  label="Potential Savings"
                  value={formatCurrency(result.potentialSavings.monthly, result.currency, 2)}
                  sublabel="per month"
                  valueColor="success"
                />
                <MetricCard
                  label="Yearly Savings"
                  value={formatCurrency(result.potentialSavings.yearly, result.currency)}
                  sublabel="if optimized"
                  valueColor="success"
                />
              </Grid>

              {/* Category Breakdown */}
              {result.categoryBreakdown.length > 0 && (
                <div className="bg-[var(--color-night)] rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Spending by Category
                  </h3>
                  <div className="space-y-3">
                    {result.categoryBreakdown.map((cat) => (
                      <div key={cat.category} className="flex items-center gap-4">
                        <div className="w-32 text-sm text-[var(--color-subtle)] truncate">
                          {cat.label}
                        </div>
                        <div className="flex-1 h-6 bg-white/10 rounded overflow-hidden">
                          <div
                            className="h-full bg-purple-500 transition-all"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                        <div className="w-24 text-right text-sm font-medium text-[var(--color-cream)]">
                          {formatCurrency(cat.monthlyTotal, result.currency, 2)}
                        </div>
                        <div className="w-12 text-right text-xs text-[var(--color-muted)]">
                          {cat.percentage.toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {result.analyzedSubscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[var(--color-cream)]">
                            {sub.name || 'Unnamed'}
                          </span>
                          <RecommendationBadge recommendation={sub.recommendation} />
                        </div>
                        <p className="text-sm text-[var(--color-muted)] mt-1">{sub.reason}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-medium text-[var(--color-cream)]">
                          {formatCurrency(sub.monthlyCost, result.currency, 2)}/mo
                        </div>
                        <div className="text-xs text-[var(--color-muted)]">
                          {formatCurrency(sub.costPerUse, result.currency, 2)}/use
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Savings Alert */}
              {result.potentialSavings.subscriptionsToCancel > 0 && (
                <Alert variant="warning" title="Savings Opportunity">
                  You have {result.potentialSavings.subscriptionsToCancel} subscription
                  {result.potentialSavings.subscriptionsToCancel > 1 ? 's' : ''} recommended for
                  cancellation and {result.potentialSavings.subscriptionsToReview} to review.
                  Optimizing could save you{' '}
                  {formatCurrency(result.potentialSavings.yearly, result.currency)}/year.
                </Alert>
              )}

              {/* Tips */}
              <Alert variant="tip" title="Subscription audit tips:">
                Cancel unused services, downgrade plans you don't fully use, look for annual
                discounts (often 15-20% off), and consider family/group plans to split costs.
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`My subscription audit: ${result.summary.totalSubscriptions} subscriptions = ${formatCurrency(result.totalMonthly, result.currency, 2)}/month (${formatCurrency(result.totalYearly, result.currency)}/year). Potential savings: ${formatCurrency(result.potentialSavings.yearly, result.currency)}/year`}
                  calculatorName="Subscription Audit Calculator"
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </ThemeProvider>
  );
}
