import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateSalarySacrifice, formatCurrency } from './calculations';
import { getDefaultInputs, SACRIFICE_TYPES, type UKSalarySacrificeInputs, type SacrificeType, type TaxRegion } from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  ButtonGroup,
  Grid,
} from '../../ui';

const sacrificeTypeOptions = Object.entries(SACRIFICE_TYPES).map(([key, type]) => ({
  value: key as SacrificeType,
  label: type.name,
}));

const taxRegionOptions = [
  { value: 'england' as TaxRegion, label: 'England/NI/Wales' },
  { value: 'scotland' as TaxRegion, label: 'Scotland' },
];

export default function UKSalarySacrificeCalculator() {
  const [inputs, setInputs] = useLocalStorage<UKSalarySacrificeInputs>(
    'calc-uk-salary-sacrifice-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => calculateSalarySacrifice(inputs), [inputs]);

  const updateInput = <K extends keyof UKSalarySacrificeInputs>(
    field: K,
    value: UKSalarySacrificeInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const currentType = SACRIFICE_TYPES[inputs.sacrificeType];

  return (
    <ThemeProvider defaultColor="teal">
      <Card variant="elevated">
        <CalculatorHeader
          title="UK Salary Sacrifice Calculator"
          subtitle="See how much you save on pension, cycle-to-work, and more"
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Sacrifice Type */}
            <div>
              <Label htmlFor="sacrificeType" required>
                Sacrifice Type
              </Label>
              <ButtonGroup
                options={sacrificeTypeOptions}
                value={inputs.sacrificeType}
                onChange={(value) => updateInput('sacrificeType', value)}
              />
              <p className="text-xs text-[var(--color-muted)] mt-2">
                {currentType.description}
              </p>
            </div>

            {/* Tax Region */}
            <div>
              <Label htmlFor="taxRegion" required>
                Tax Region
              </Label>
              <ButtonGroup
                options={taxRegionOptions}
                value={inputs.taxRegion}
                onChange={(value) => updateInput('taxRegion', value)}
              />
            </div>

            {/* Gross Salary */}
            <div>
              <Label htmlFor="grossSalary" required>
                Annual Gross Salary
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="grossSalary"
                  type="number"
                  value={inputs.grossSalary}
                  onChange={(e) => updateInput('grossSalary', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Sacrifice Amount */}
            <div>
              <Label htmlFor="sacrificeAmount" required>
                Annual Sacrifice Amount
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="sacrificeAmount"
                  type="number"
                  value={inputs.sacrificeAmount}
                  onChange={(e) => updateInput('sacrificeAmount', Number(e.currentTarget.value))}
                  min={0}
                  step={500}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                The amount you want to sacrifice from your gross salary
              </p>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Result - Effective Discount */}
            <div className="rounded-2xl p-6 bg-teal-950/50 border-2 border-teal-500/30">
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">Effective Discount</p>
                <p className="text-4xl md:text-5xl font-display font-bold text-teal-400">
                  {result.effectiveDiscount}%
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  You save {formatCurrency(result.totalSavings)} in tax and NI
                </p>
              </div>
            </div>

            {/* True Cost */}
            <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-500/30">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-emerald-400 font-medium">True Cost of Benefit</p>
                  <p className="text-sm text-[var(--color-subtle)] mt-1">
                    Your {formatCurrency(inputs.sacrificeAmount)} {currentType.name.toLowerCase()} only costs you{' '}
                    <span className="text-emerald-400 font-semibold">{formatCurrency(result.trueCostOfBenefit)}</span> in
                    reduced take-home pay.
                  </p>
                </div>
              </div>
            </div>

            {/* Savings Breakdown */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Income Tax Saved</p>
                <p className="text-2xl font-semibold text-emerald-400">
                  {formatCurrency(result.incomeTaxSaved)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Employee NI Saved</p>
                <p className="text-2xl font-semibold text-emerald-400">
                  {formatCurrency(result.niSavedEmployee)}
                </p>
              </div>
            </Grid>

            {/* Employer NI Saving */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-blue-400 font-medium">Employer Also Saves</p>
                  <p className="text-sm text-[var(--color-subtle)] mt-1">
                    Your employer saves {formatCurrency(result.niSavedEmployer)} in National Insurance contributions.
                    Some employers share this saving with employees or increase pension contributions.
                  </p>
                </div>
              </div>
            </div>

            {/* Net Pay Comparison */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-4">Net Pay Comparison</h4>
              <div className="space-y-4">
                {/* Before */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="text-xs text-[var(--color-muted)]">Without Sacrifice</p>
                    <p className="text-lg font-semibold text-[var(--color-cream)]">
                      {formatCurrency(result.netPayBefore)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--color-muted)]">Tax + NI</p>
                    <p className="text-sm text-red-400">
                      -{formatCurrency(result.incomeTaxBefore + result.niBeforeEmployee)}
                    </p>
                  </div>
                </div>

                {/* After */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-teal-950/30 border border-teal-500/20">
                  <div>
                    <p className="text-xs text-[var(--color-muted)]">With Sacrifice</p>
                    <p className="text-lg font-semibold text-[var(--color-cream)]">
                      {formatCurrency(result.netPayAfter)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--color-muted)]">Tax + NI</p>
                    <p className="text-sm text-red-400">
                      -{formatCurrency(result.incomeTaxAfter + result.niAfterEmployee)}
                    </p>
                  </div>
                </div>

                {/* Difference */}
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-[var(--color-subtle)]">Net pay reduction</span>
                  <span className="text-amber-400 font-medium">
                    {formatCurrency(result.netPayBefore - result.netPayAfter)}/year
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-subtle)]">But you receive</span>
                  <span className="text-emerald-400 font-medium">
                    {formatCurrency(inputs.sacrificeAmount)} in benefits
                  </span>
                </div>
              </div>
            </div>

            {/* Monthly Breakdown */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">Monthly Breakdown</h4>
              <div className="space-y-2 text-sm text-[var(--color-subtle)]">
                <div className="flex justify-between">
                  <span>Monthly sacrifice</span>
                  <span className="text-[var(--color-cream)]">{formatCurrency(inputs.sacrificeAmount / 12)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly tax saved</span>
                  <span className="text-emerald-400">{formatCurrency(result.incomeTaxSaved / 12)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly NI saved</span>
                  <span className="text-emerald-400">{formatCurrency(result.niSavedEmployee / 12)}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                  <span>Monthly true cost</span>
                  <span className="text-teal-400 font-medium">{formatCurrency(result.trueCostOfBenefit / 12)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
