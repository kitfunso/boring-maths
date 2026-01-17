import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculatePension, formatCurrency } from './calculations';
import { getDefaultInputs, PENSION_CONSTANTS, type UKPensionInputs } from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Grid,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function UKPensionCalculator() {
  const [inputs, setInputs] = useLocalStorage<UKPensionInputs>(
    'calc-uk-pension-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => calculatePension(inputs), [inputs]);

  const updateInput = <K extends keyof UKPensionInputs>(
    field: K,
    value: UKPensionInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="UK Pension Calculator"
          subtitle="Project your retirement pot and income"
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Age Inputs */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div>
                <Label htmlFor="currentAge" required>
                  Current Age
                </Label>
                <Input
                  id="currentAge"
                  type="number"
                  value={inputs.currentAge}
                  onChange={(e) => updateInput('currentAge', Number(e.currentTarget.value))}
                  min={18}
                  max={75}
                />
              </div>
              <div>
                <Label htmlFor="retirementAge" required>
                  Target Retirement Age
                </Label>
                <Input
                  id="retirementAge"
                  type="number"
                  value={inputs.retirementAge}
                  onChange={(e) => updateInput('retirementAge', Number(e.currentTarget.value))}
                  min={inputs.currentAge + 1}
                  max={85}
                />
              </div>
            </Grid>

            {/* Current Pot */}
            <div>
              <Label htmlFor="currentPot" required>
                Current Pension Pot
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="currentPot"
                  type="number"
                  value={inputs.currentPot}
                  onChange={(e) => updateInput('currentPot', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Contributions */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div>
                <Label htmlFor="monthlyContribution" required>
                  Your Monthly Contribution
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                    £
                  </span>
                  <Input
                    id="monthlyContribution"
                    type="number"
                    value={inputs.monthlyContribution}
                    onChange={(e) => updateInput('monthlyContribution', Number(e.currentTarget.value))}
                    min={0}
                    step={50}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="employerContribution">
                  Employer Monthly Contribution
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                    £
                  </span>
                  <Input
                    id="employerContribution"
                    type="number"
                    value={inputs.employerContribution}
                    onChange={(e) => updateInput('employerContribution', Number(e.currentTarget.value))}
                    min={0}
                    step={50}
                    className="pl-8"
                  />
                </div>
              </div>
            </Grid>

            {/* Growth Rates */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div>
                <Label htmlFor="expectedGrowth">
                  Expected Annual Growth
                </Label>
                <div className="relative">
                  <Input
                    id="expectedGrowth"
                    type="number"
                    value={inputs.expectedGrowth}
                    onChange={(e) => updateInput('expectedGrowth', Number(e.currentTarget.value))}
                    min={0}
                    max={15}
                    step={0.5}
                    className="pr-8"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                    %
                  </span>
                </div>
              </div>
              <div>
                <Label htmlFor="inflationRate">
                  Assumed Inflation Rate
                </Label>
                <div className="relative">
                  <Input
                    id="inflationRate"
                    type="number"
                    value={inputs.inflationRate}
                    onChange={(e) => updateInput('inflationRate', Number(e.currentTarget.value))}
                    min={0}
                    max={10}
                    step={0.5}
                    className="pr-8"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                    %
                  </span>
                </div>
              </div>
            </Grid>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Result - Projected Pot */}
            <div className="rounded-2xl p-6 bg-emerald-950/50 border-2 border-emerald-500/30">
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">Projected Pension Pot at {inputs.retirementAge}</p>
                <p className="text-4xl md:text-5xl font-display font-bold text-emerald-400">
                  {formatCurrency(result.projectedPot)}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  {formatCurrency(result.projectedPotReal)} in today's money
                </p>
              </div>
            </div>

            {/* Income Projection */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-4">
                Retirement Income (4% Rule)
              </h4>
              <Grid responsive={{ sm: 2 }} gap="md">
                <div className="bg-emerald-950/30 rounded-lg p-4 border border-emerald-500/20">
                  <p className="text-xs text-[var(--color-muted)]">Annual Income</p>
                  <p className="text-2xl font-semibold text-emerald-400">
                    {formatCurrency(result.annualIncome4Percent)}
                  </p>
                  <p className="text-xs text-[var(--color-subtle)] mt-1">
                    {formatCurrency(result.annualIncomeReal)} in today's money
                  </p>
                </div>
                <div className="bg-emerald-950/30 rounded-lg p-4 border border-emerald-500/20">
                  <p className="text-xs text-[var(--color-muted)]">Monthly Income</p>
                  <p className="text-2xl font-semibold text-emerald-400">
                    {formatCurrency(result.monthlyIncome)}
                  </p>
                  <p className="text-xs text-[var(--color-subtle)] mt-1">
                    {formatCurrency(result.monthlyIncomeReal)} in today's money
                  </p>
                </div>
              </Grid>
            </div>

            {/* State Pension Note */}
            <div className="bg-blue-950/30 rounded-xl p-4 border border-blue-500/30">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-blue-400 font-medium">Plus State Pension</p>
                  <p className="text-sm text-[var(--color-subtle)] mt-1">
                    From age {PENSION_CONSTANTS.statePensionAge}, you may receive up to{' '}
                    {formatCurrency(PENSION_CONSTANTS.statePensionFull)}/year in State Pension
                    (currently {formatCurrency(PENSION_CONSTANTS.statePensionFull / 12)}/month).
                    This is additional to your private pension.
                  </p>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <Grid responsive={{ sm: 3 }} gap="md">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Total Contributions</p>
                <p className="text-2xl font-semibold text-[var(--color-cream)]">
                  {formatCurrency(result.totalContributions)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Investment Growth</p>
                <p className="text-2xl font-semibold text-emerald-400">
                  {formatCurrency(result.totalGrowth)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Tax Relief Gained*</p>
                <p className="text-2xl font-semibold text-teal-400">
                  {formatCurrency(result.taxReliefGained)}
                </p>
              </div>
            </Grid>

            {/* Projection Table */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-4">
                Growth Projection
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[var(--color-muted)] border-b border-white/10">
                      <th className="text-left py-2 pr-4">Age</th>
                      <th className="text-right py-2 px-2">Contributions</th>
                      <th className="text-right py-2 px-2">Growth</th>
                      <th className="text-right py-2 px-2">Pot Value</th>
                      <th className="text-right py-2 pl-4">Real Value*</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearlyProjection.map((row) => (
                      <tr key={row.age} className="border-b border-white/5 text-[var(--color-subtle)]">
                        <td className="py-2 pr-4 text-[var(--color-cream)]">{row.age}</td>
                        <td className="text-right py-2 px-2">{formatCurrency(row.contributions)}</td>
                        <td className="text-right py-2 px-2 text-emerald-400">
                          {formatCurrency(row.growth)}
                        </td>
                        <td className="text-right py-2 px-2 text-[var(--color-cream)] font-medium">
                          {formatCurrency(row.potValue)}
                        </td>
                        <td className="text-right py-2 pl-4 text-[var(--color-subtle)]">
                          {formatCurrency(row.potValueReal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-3">
                * Real value = adjusted for inflation (in today's purchasing power)
              </p>
            </div>

            {/* Assumptions */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">Assumptions</h4>
              <ul className="space-y-1 text-sm text-[var(--color-subtle)]">
                <li>• Contributions remain constant in nominal terms</li>
                <li>• Growth rate is before fees (subtract ~0.5% for typical fund fees)</li>
                <li>• Tax relief shown at basic rate (20%) – may be higher for higher earners</li>
                <li>• The 4% rule provides a rough guide to sustainable withdrawals</li>
                <li>• This is a simplified projection – actual results will vary</li>
              </ul>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Projected pension pot at age ${inputs.retirementAge}: ${formatCurrency(result.projectedPot)} (${formatCurrency(result.projectedPotReal)} in today's money). Est. annual income: ${formatCurrency(result.annualIncome4Percent)} using 4% rule.`}
                calculatorName="UK Pension Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
