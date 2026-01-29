/**
 * UK Nursery Cost Calculator - React Component
 *
 * Calculate childcare costs in the UK including free hours eligibility,
 * Tax-Free Childcare, and Universal Credit support.
 */

import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import {
  calculateNurseryCost,
  formatCurrency,
  formatCurrencyPrecise,
  formatPercent,
  formatHours,
} from './calculations';
import {
  getDefaultInputs,
  UK_REGION_LABELS,
  CHILD_AGE_LABELS,
  EMPLOYMENT_STATUS_LABELS,
  BENEFIT_STATUS_LABELS,
  type NurseryCostInputs,
  type UKRegion,
  type ChildAge,
  type EmploymentStatus,
  type BenefitStatus,
  type ChildInfo,
} from './types';
import { ThemeProvider, Card, CalculatorHeader, Label, Input, Grid, Select, Alert } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';

export default function NurseryCostCalculator() {
  useCalculatorTracking('UK Nursery Cost Calculator');

  const [inputs, setInputs] = useLocalStorage<NurseryCostInputs>(
    'calc-nursery-cost-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => calculateNurseryCost(inputs), [inputs]);

  const updateInput = <K extends keyof NurseryCostInputs>(
    field: K,
    value: NurseryCostInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const updateChild = (
    index: number,
    field: keyof ChildInfo,
    value: ChildInfo[keyof ChildInfo]
  ) => {
    setInputs((prev) => {
      const newChildren = [...prev.children];
      newChildren[index] = { ...newChildren[index], [field]: value };
      return { ...prev, children: newChildren };
    });
  };

  const addChild = () => {
    if (inputs.children.length >= 4) return;
    setInputs((prev) => ({
      ...prev,
      children: [
        ...prev.children,
        {
          id: String(Date.now()),
          age: '2-years' as ChildAge,
          hoursPerWeek: 30,
          hasDisability: false,
        },
      ],
    }));
  };

  const removeChild = (index: number) => {
    if (inputs.children.length <= 1) return;
    setInputs((prev) => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index),
    }));
  };

  return (
    <ThemeProvider defaultColor="violet">
      <Card variant="elevated">
        <CalculatorHeader
          title="UK Nursery Cost Calculator"
          subtitle="Estimate childcare costs and government support"
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Region Selection */}
            <div>
              <Label htmlFor="region" required>
                Region
              </Label>
              <Select
                id="region"
                value={inputs.region}
                onChange={(e) => updateInput('region', e.currentTarget.value as UKRegion)}
                options={Object.entries(UK_REGION_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Nursery costs vary significantly by region
              </p>
            </div>

            {/* Children Section */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--color-cream)]">
                  Children in Childcare
                </h3>
                {inputs.children.length < 4 && (
                  <button
                    type="button"
                    onClick={addChild}
                    className="text-xs px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors"
                  >
                    + Add Child
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {inputs.children.map((child, index) => (
                  <div key={child.id} className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-[var(--color-subtle)]">
                        Child {index + 1}
                      </span>
                      {inputs.children.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChild(index)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <Grid responsive={{ sm: 1, md: 3 }} gap="md">
                      <div>
                        <Label htmlFor={`child-age-${index}`}>Age</Label>
                        <Select
                          id={`child-age-${index}`}
                          value={child.age}
                          onChange={(e) =>
                            updateChild(index, 'age', e.currentTarget.value as ChildAge)
                          }
                          options={Object.entries(CHILD_AGE_LABELS).map(([value, label]) => ({
                            value,
                            label,
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`child-hours-${index}`}>Hours/Week</Label>
                        <Input
                          id={`child-hours-${index}`}
                          type="number"
                          value={child.hoursPerWeek}
                          onChange={(e) =>
                            updateChild(index, 'hoursPerWeek', Number(e.currentTarget.value))
                          }
                          min={1}
                          max={50}
                          step={1}
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer py-3">
                          <input
                            type="checkbox"
                            checked={child.hasDisability}
                            onChange={(e) =>
                              updateChild(index, 'hasDisability', e.currentTarget.checked)
                            }
                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
                          />
                          <span className="text-sm text-[var(--color-subtle)]">Has disability</span>
                        </label>
                      </div>
                    </Grid>
                  </div>
                ))}
              </div>
            </div>

            {/* Employment & Income */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div>
                <Label htmlFor="employmentStatus" required>
                  Employment Status
                </Label>
                <Select
                  id="employmentStatus"
                  value={inputs.employmentStatus}
                  onChange={(e) =>
                    updateInput('employmentStatus', e.currentTarget.value as EmploymentStatus)
                  }
                  options={Object.entries(EMPLOYMENT_STATUS_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="householdIncome" required>
                  Household Income
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                    £
                  </span>
                  <Input
                    id="householdIncome"
                    type="number"
                    value={inputs.householdIncome}
                    onChange={(e) => updateInput('householdIncome', Number(e.currentTarget.value))}
                    min={0}
                    step={1000}
                    className="pl-8"
                  />
                </div>
              </div>
            </Grid>

            {/* Benefits & Options */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div>
                <Label htmlFor="benefitStatus">Benefits Received</Label>
                <Select
                  id="benefitStatus"
                  value={inputs.benefitStatus}
                  onChange={(e) =>
                    updateInput('benefitStatus', e.currentTarget.value as BenefitStatus)
                  }
                  options={Object.entries(BENEFIT_STATUS_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="weeksPerYear">Childcare Weeks/Year</Label>
                <Select
                  id="weeksPerYear"
                  value={String(inputs.weeksPerYear)}
                  onChange={(e) => updateInput('weeksPerYear', Number(e.currentTarget.value))}
                  options={[
                    { value: '38', label: '38 weeks (term time only)' },
                    { value: '48', label: '48 weeks (with holidays)' },
                    { value: '52', label: '52 weeks (full year)' },
                  ]}
                />
              </div>
            </Grid>

            {/* Tax-Free Childcare Toggle */}
            {inputs.benefitStatus === 'none' && (
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-xl border border-white/10">
                <input
                  type="checkbox"
                  checked={inputs.useTaxFreeChildcare}
                  onChange={(e) => updateInput('useTaxFreeChildcare', e.currentTarget.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
                />
                <div>
                  <span className="text-sm font-medium text-[var(--color-cream)]">
                    Use Tax-Free Childcare
                  </span>
                  <p className="text-xs text-[var(--color-muted)]">
                    Government pays £2 for every £8 you deposit (up to £2,000/year per child)
                  </p>
                </div>
              </label>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Result */}
            <div className="rounded-2xl p-6 border-2 bg-violet-950/50 border-violet-500/30">
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">Your Annual Childcare Cost</p>
                <p className="text-4xl md:text-5xl font-display font-bold text-violet-400">
                  {formatCurrency(result.totalNetAnnualCost)}
                </p>
                <p className="text-lg text-[var(--color-cream)] mt-2">
                  {formatCurrency(result.monthlyNetCost)}/month
                </p>
                {result.totalSavings > 0 && (
                  <p className="text-sm text-green-400 mt-2">
                    Saving {formatCurrency(result.totalSavings)}/year (
                    {formatPercent(result.savingsPercentage)}) with government support
                  </p>
                )}
              </div>
            </div>

            {/* Cost Breakdown */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-xs text-[var(--color-muted)] mb-1">Gross Cost</p>
                <p className="text-xl font-bold text-[var(--color-cream)]">
                  {formatCurrency(result.totalGrossAnnualCost)}
                </p>
                <p className="text-xs text-[var(--color-muted)]">/year before support</p>
              </div>
              <div className="bg-green-950/30 rounded-xl p-4 border border-green-500/30">
                <p className="text-xs text-[var(--color-muted)] mb-1">Free Hours Value</p>
                <p className="text-xl font-bold text-green-400">
                  -{formatCurrency(result.totalFreeHoursValue)}
                </p>
                <p className="text-xs text-[var(--color-muted)]">/year saved</p>
              </div>
              {result.taxFreeChildcareContribution > 0 && (
                <div className="bg-green-950/30 rounded-xl p-4 border border-green-500/30">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Tax-Free Childcare</p>
                  <p className="text-xl font-bold text-green-400">
                    -{formatCurrency(result.taxFreeChildcareContribution)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">/year govt top-up</p>
                </div>
              )}
              {result.ucChildcareElement > 0 && (
                <div className="bg-green-950/30 rounded-xl p-4 border border-green-500/30">
                  <p className="text-xs text-[var(--color-muted)] mb-1">UC Childcare Element</p>
                  <p className="text-xl font-bold text-green-400">
                    -{formatCurrency(result.ucChildcareElement)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">/year (85% of costs)</p>
                </div>
              )}
              <div className="bg-violet-950/30 rounded-xl p-4 border border-violet-500/30">
                <p className="text-xs text-[var(--color-muted)] mb-1">Net Cost</p>
                <p className="text-xl font-bold text-violet-400">
                  {formatCurrency(result.totalNetAnnualCost)}
                </p>
                <p className="text-xs text-[var(--color-muted)]">/year final cost</p>
              </div>
            </Grid>

            {/* Eligibility Summary */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-sm font-medium text-[var(--color-cream)] mb-3">
                Your Eligibility
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <EligibilityBadge
                  label="30 Free Hours"
                  eligible={result.eligibleFor30Hours}
                  description="Working parents"
                />
                <EligibilityBadge
                  label="15 Universal Hours"
                  eligible={result.eligibleFor15HoursUniversal}
                  description="All 3-4 year olds"
                />
                <EligibilityBadge
                  label="Tax-Free Childcare"
                  eligible={result.eligibleForTaxFreeChildcare}
                  description="£2 per £8 deposited"
                />
                <EligibilityBadge
                  label="UC Childcare"
                  eligible={result.eligibleForUCChildcare}
                  description="85% of costs covered"
                />
                <EligibilityBadge
                  label="2yo 15 Hours"
                  eligible={result.eligibleFor15Hours2YearOld}
                  description="Low income on UC"
                />
              </div>
            </div>

            {/* Per Child Breakdown */}
            {result.childBreakdowns.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-cream)] mb-4">
                  Per Child Breakdown
                </h3>
                <div className="bg-white/5 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-muted)]">
                            Child
                          </th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-[var(--color-muted)]">
                            Rate/hr
                          </th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-[var(--color-muted)]">
                            Free Hours
                          </th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-[var(--color-muted)]">
                            Weekly Cost
                          </th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-[var(--color-muted)]">
                            Annual Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.childBreakdowns.map((child, index) => (
                          <tr key={child.childId} className="border-b border-white/5 last:border-0">
                            <td className="px-4 py-3">
                              <p className="text-sm text-[var(--color-subtle)]">
                                Child {index + 1}
                              </p>
                              <p className="text-xs text-[var(--color-muted)]">
                                {CHILD_AGE_LABELS[child.age]} • {formatHours(child.hoursPerWeek)}
                              </p>
                            </td>
                            <td className="text-right px-4 py-3 text-sm text-[var(--color-cream)] tabular-nums">
                              {formatCurrencyPrecise(child.hourlyRate)}
                            </td>
                            <td className="text-right px-4 py-3 text-sm tabular-nums">
                              {child.freeHoursPerWeek > 0 ? (
                                <span className="text-green-400">{child.freeHoursPerWeek} hrs</span>
                              ) : (
                                <span className="text-[var(--color-muted)]">-</span>
                              )}
                            </td>
                            <td className="text-right px-4 py-3 text-sm text-[var(--color-cream)] tabular-nums">
                              {formatCurrency(child.netWeeklyCost)}
                            </td>
                            <td className="text-right px-4 py-3 text-sm font-medium text-violet-400 tabular-nums">
                              {formatCurrency(child.annualNetCost)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Info Alert */}
            <Alert variant="tip" title="Free Hours in 2025">
              From September 2025, working parents are entitled to 30 free hours for children aged 9
              months to school age. Free hours apply for 38 term-time weeks only. You can spread
              hours over more weeks but will receive fewer hours per week.
            </Alert>

            {/* Comparison */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">
                Cost Comparison
              </h4>
              <Grid responsive={{ sm: 1, md: 3 }} gap="sm">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)]">Without Support</p>
                  <p className="text-lg font-semibold text-[var(--color-cream)]">
                    {formatCurrency(result.costWithoutSupport)}
                  </p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)]">With Free Hours Only</p>
                  <p className="text-lg font-semibold text-[var(--color-cream)]">
                    {formatCurrency(result.costWithFreeHoursOnly)}
                  </p>
                </div>
                <div className="text-center p-3 bg-violet-950/30 rounded-lg border border-violet-500/20">
                  <p className="text-xs text-[var(--color-muted)]">With All Support</p>
                  <p className="text-lg font-semibold text-violet-400">
                    {formatCurrency(result.totalNetAnnualCost)}
                  </p>
                </div>
              </Grid>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`UK Nursery Cost: ${formatCurrency(result.totalNetAnnualCost)}/year (${formatCurrency(result.monthlyNetCost)}/month). Saving ${formatCurrency(result.totalSavings)} with government support.`}
                calculatorName="UK Nursery Cost Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}

// Helper component for eligibility badges
function EligibilityBadge({
  label,
  eligible,
  description,
}: {
  label: string;
  eligible: boolean;
  description: string;
}) {
  return (
    <div
      className={`p-2 rounded-lg border ${
        eligible ? 'bg-green-950/30 border-green-500/30' : 'bg-white/5 border-white/10 opacity-50'
      }`}
    >
      <div className="flex items-center gap-2">
        {eligible ? (
          <svg
            className="w-4 h-4 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-[var(--color-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
        <span
          className={`text-xs font-medium ${eligible ? 'text-green-400' : 'text-[var(--color-muted)]'}`}
        >
          {label}
        </span>
      </div>
      <p className="text-xs text-[var(--color-muted)] mt-1 ml-6">{description}</p>
    </div>
  );
}
