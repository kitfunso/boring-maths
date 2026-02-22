import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateEmployerCost, calculateComparisonTable, formatCurrency } from './calculations';
import {
  getDefaultInputs,
  COMPARISON_SALARIES,
  type UKEmployerCostInputs,
  type TaxRegion,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  ButtonGroup,
  Toggle,
  Slider,
  Grid,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';

const taxRegionOptions = [
  { value: 'england' as TaxRegion, label: 'England/NI/Wales' },
  { value: 'scotland' as TaxRegion, label: 'Scotland' },
];

export default function UKEmployerCostCalculator() {
  useCalculatorTracking('UK Employer Cost Calculator');

  const [inputs, setInputs] = useLocalStorage<UKEmployerCostInputs>(
    'calc-uk-employer-cost-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => calculateEmployerCost(inputs), [inputs]);

  const comparisonTable = useMemo(
    () => calculateComparisonTable(COMPARISON_SALARIES, inputs),
    [inputs]
  );

  const updateInput = <K extends keyof UKEmployerCostInputs>(
    field: K,
    value: UKEmployerCostInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="UK Employer Cost Calculator"
          subtitle="See the true total cost of hiring someone in the UK (2025/26)"
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
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
              <p className="text-xs text-[var(--color-muted)] mt-2">
                Tax region does not affect employer costs, but is included for consistency.
              </p>
            </div>

            {/* Pension Rate */}
            <div>
              <Slider
                value={inputs.pensionRate}
                onChange={(value) => updateInput('pensionRate', value)}
                min={0}
                max={25}
                step={0.5}
                label="Employer Pension Contribution Rate"
                showValue
                labels={{
                  min: '0%',
                  mid: '3% min',
                  max: '25%',
                  current: (v) => `${v}%`,
                }}
              />
              <p className="text-xs text-[var(--color-muted)] mt-2">
                Auto-enrolment minimum is 3% on qualifying earnings (£6,240 to £50,270).
              </p>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <Toggle
                checked={inputs.includeApprenticeshipLevy}
                onChange={(checked) => updateInput('includeApprenticeshipLevy', checked)}
                label="Include Apprenticeship Levy"
                description="Only applies to employers with a pay bill over £3 million"
              />
              <p className="text-xs text-[var(--color-muted)] ml-15 -mt-2">
                0.5% of total pay bill, minus £15,000 allowance. Only for large employers.
              </p>

              <Toggle
                checked={inputs.includeEmploymentAllowance}
                onChange={(checked) => updateInput('includeEmploymentAllowance', checked)}
                label="Apply Employment Allowance"
                description="£10,500 NIC reduction for eligible small employers"
              />
              <p className="text-xs text-[var(--color-muted)] ml-15 -mt-2">
                Reduces employer NIC by up to £10,500/year. Available to most small employers.
              </p>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Hero: Total Cost */}
            <div className="rounded-2xl p-6 bg-blue-950/50 border-2 border-blue-500/30">
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">Total Employer Cost</p>
                <p className="text-4xl md:text-5xl font-display font-bold text-blue-400">
                  {formatCurrency(result.totalEmployerCost)}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  per year ({formatCurrency(result.monthlyTotal)}/month)
                </p>
              </div>
            </div>

            {/* Hidden Cost Percentage */}
            <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-500/30">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0"
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
                <div>
                  <p className="text-amber-400 font-medium">
                    Hidden Cost: +{result.hiddenCostPercentage}%
                  </p>
                  <p className="text-sm text-[var(--color-subtle)] mt-1">
                    On top of the {formatCurrency(result.grossSalary)} salary, this employee costs
                    an extra{' '}
                    <span className="text-amber-400 font-semibold">
                      {formatCurrency(result.totalEmployerCost - result.grossSalary)}
                    </span>{' '}
                    in employer NIC, pension, and other contributions.
                  </p>
                </div>
              </div>
            </div>

            {/* Cost Breakdown Cards */}
            <Grid responsive={{ sm: 2, lg: 3 }} gap="md">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Employer NIC</p>
                <p className="text-2xl font-semibold text-red-400">
                  {formatCurrency(result.employerNIC)}
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  {result.employerNICRate}% effective rate
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Pension Contribution</p>
                <p className="text-2xl font-semibold text-blue-400">
                  {formatCurrency(result.pensionContribution)}
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  {inputs.pensionRate}% of qualifying earnings
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Apprenticeship Levy</p>
                <p className="text-2xl font-semibold text-purple-400">
                  {formatCurrency(result.apprenticeshipLevy)}
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  {inputs.includeApprenticeshipLevy ? '0.5% of pay bill' : 'Not included'}
                </p>
              </div>
            </Grid>

            {/* Monthly Breakdown */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">
                Monthly Breakdown
              </h4>
              <div className="space-y-2 text-sm text-[var(--color-subtle)]">
                <div className="flex justify-between">
                  <span>Gross salary</span>
                  <span className="text-[var(--color-cream)]">
                    {formatCurrency(result.monthlySalary)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Employer NIC</span>
                  <span className="text-red-400">+{formatCurrency(result.monthlyNIC)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pension contribution</span>
                  <span className="text-blue-400">+{formatCurrency(result.monthlyPension)}</span>
                </div>
                {inputs.includeApprenticeshipLevy && (
                  <div className="flex justify-between">
                    <span>Apprenticeship levy</span>
                    <span className="text-purple-400">+{formatCurrency(result.monthlyLevy)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                  <span className="font-medium text-[var(--color-cream)]">Total monthly cost</span>
                  <span className="text-blue-400 font-semibold">
                    {formatCurrency(result.monthlyTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Comparison Table - Hero Feature */}
            <div className="bg-white/5 rounded-xl p-4 overflow-x-auto">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-4">
                Cost Comparison at Different Salary Levels
              </h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--color-muted)] border-b border-white/10">
                    <th className="pb-3 pr-4 font-medium">Salary</th>
                    <th className="pb-3 pr-4 font-medium">Employer NIC</th>
                    <th className="pb-3 pr-4 font-medium">Pension</th>
                    {inputs.includeApprenticeshipLevy && (
                      <th className="pb-3 pr-4 font-medium">Levy</th>
                    )}
                    <th className="pb-3 pr-4 font-medium">Total Cost</th>
                    <th className="pb-3 font-medium">Hidden %</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonTable.map((row) => {
                    const isCurrentSalary = Math.abs(row.salary - inputs.grossSalary) < 1;
                    return (
                      <tr
                        key={row.salary}
                        className={`border-b border-white/5 ${
                          isCurrentSalary
                            ? 'bg-blue-500/10 text-blue-300'
                            : 'text-[var(--color-subtle)]'
                        }`}
                      >
                        <td className="py-3 pr-4 font-medium text-[var(--color-cream)]">
                          {formatCurrency(row.salary)}
                          {isCurrentSalary && (
                            <span className="ml-2 text-xs text-blue-400">(selected)</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">{formatCurrency(row.employerNIC)}</td>
                        <td className="py-3 pr-4">{formatCurrency(row.pension)}</td>
                        {inputs.includeApprenticeshipLevy && (
                          <td className="py-3 pr-4">{formatCurrency(row.levy)}</td>
                        )}
                        <td className="py-3 pr-4 font-semibold text-[var(--color-cream)]">
                          {formatCurrency(row.totalCost)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              row.hiddenCostPct > 15
                                ? 'bg-red-500/20 text-red-400'
                                : row.hiddenCostPct > 10
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-green-500/20 text-green-400'
                            }`}
                          >
                            +{row.hiddenCostPct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* NIC Rate Explanation */}
            <div className="bg-blue-950/30 rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
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
                <div>
                  <p className="text-blue-400 font-medium">2025/26 Employer NIC Changes</p>
                  <p className="text-sm text-[var(--color-subtle)] mt-1">
                    From April 2025, employer NIC rose from 13.8% to 15%, and the threshold dropped
                    from £9,100 to £5,000. This significantly increases the cost of employing
                    someone, especially for lower-paid roles where the threshold change has a bigger
                    proportional impact.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Employer cost for ${formatCurrency(result.grossSalary)} salary: Total ${formatCurrency(result.totalEmployerCost)}/year (${formatCurrency(result.monthlyTotal)}/month). Employer NIC: ${formatCurrency(result.employerNIC)}. Pension: ${formatCurrency(result.pensionContribution)}. Hidden cost: +${result.hiddenCostPercentage}% above salary.`}
                calculatorName="UK Employer Cost Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
