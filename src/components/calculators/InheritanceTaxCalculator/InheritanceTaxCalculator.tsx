import { calculateIHT, formatCurrency, formatPercent } from './calculations';
import { getDefaultInputs, type IHTInputs } from './types';
import { ThemeProvider, Card, CalculatorHeader, Label, Input, Grid, Toggle } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';
export default function InheritanceTaxCalculator() {
  const { inputs, result, updateInput } = useCalculatorBase<
    IHTInputs,
    ReturnType<typeof calculateIHT>
  >({
    name: 'Inheritance Tax Calculator',
    slug: 'calc-inheritance-tax-inputs',
    defaults: getDefaultInputs,
    compute: calculateIHT,
  });

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Inheritance Tax Calculator"
          subtitle="Estimate UK inheritance tax with nil-rate bands, residence relief, and spouse exemption"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Estate Value */}
            <div>
              <Label htmlFor="estateValue" required>
                Total Estate Value
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="estateValue"
                  type="number"
                  value={inputs.estateValue}
                  onChange={(e) => updateInput('estateValue', Number(e.currentTarget.value))}
                  min={0}
                  step={10000}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Main Residence */}
            <div>
              <Label htmlFor="mainResidenceValue">Main Residence Value (within estate)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="mainResidenceValue"
                  type="number"
                  value={inputs.mainResidenceValue}
                  onChange={(e) => updateInput('mainResidenceValue', Number(e.currentTarget.value))}
                  min={0}
                  step={10000}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Gifts in last 7 years */}
            <div>
              <Label htmlFor="giftsInLast7Years">Gifts Made in Last 7 Years</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="giftsInLast7Years"
                  type="number"
                  value={inputs.giftsInLast7Years}
                  onChange={(e) => updateInput('giftsInLast7Years', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Charitable Donation */}
            <div>
              <Label htmlFor="charitableDonation">Charitable Donations in Will</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="charitableDonation"
                  type="number"
                  value={inputs.charitableDonation}
                  onChange={(e) => updateInput('charitableDonation', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <Toggle
                checked={inputs.leavingToDirectDescendants}
                onChange={(val) => updateInput('leavingToDirectDescendants', val)}
                label="Leaving home to children/grandchildren (RNRB)"
              />

              <Toggle
                checked={inputs.marriedOrCivilPartner}
                onChange={(val) => updateInput('marriedOrCivilPartner', val)}
                label="Transferring deceased spouse's unused allowance"
              />

              <Toggle
                checked={inputs.spouseInheritingEstate}
                onChange={(val) => updateInput('spouseInheritingEstate', val)}
                label="Spouse/civil partner inheriting entire estate (exempt)"
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div
              className={`rounded-2xl p-6 border-2 ${
                result.ihtDue === 0
                  ? 'bg-emerald-950/50 border-emerald-500/30'
                  : 'bg-blue-950/50 border-blue-500/30'
              }`}
            >
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">Inheritance Tax Due</p>
                <p
                  className={`text-4xl md:text-5xl font-display font-bold ${
                    result.ihtDue === 0 ? 'text-emerald-400' : 'text-blue-400'
                  }`}
                >
                  {formatCurrency(result.ihtDue)}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  Effective rate: {formatPercent(result.effectiveRate)} (at{' '}
                  {formatPercent(result.taxRate, 0)})
                </p>
              </div>
            </div>

            {inputs.spouseInheritingEstate && (
              <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-500/30">
                <span className="text-emerald-400 font-medium">
                  ✓ Spouse exemption applies — no inheritance tax due on transfers between spouses
                </span>
              </div>
            )}

            {/* Allowance Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-cream)] mb-4">
                Allowance Breakdown
              </h3>
              <div className="bg-white/5 rounded-xl overflow-hidden">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="px-4 py-3 text-sm text-[var(--color-subtle)]">
                        Nil-Rate Band
                      </td>
                      <td className="text-right px-4 py-3 text-sm font-medium text-[var(--color-cream)]">
                        {formatCurrency(325000)}
                      </td>
                    </tr>
                    {result.transferredNilRateBand > 0 && (
                      <tr className="border-b border-white/5">
                        <td className="px-4 py-3 text-sm text-[var(--color-subtle)]">
                          Transferred Nil-Rate Band
                        </td>
                        <td className="text-right px-4 py-3 text-sm font-medium text-[var(--color-cream)]">
                          {formatCurrency(result.transferredNilRateBand)}
                        </td>
                      </tr>
                    )}
                    {result.residenceNilRateBand > 0 && (
                      <tr className="border-b border-white/5">
                        <td className="px-4 py-3 text-sm text-[var(--color-subtle)]">
                          Residence Nil-Rate Band
                        </td>
                        <td className="text-right px-4 py-3 text-sm font-medium text-[var(--color-cream)]">
                          {formatCurrency(result.residenceNilRateBand)}
                        </td>
                      </tr>
                    )}
                    {result.transferredResidenceNilRateBand > 0 && (
                      <tr className="border-b border-white/5">
                        <td className="px-4 py-3 text-sm text-[var(--color-subtle)]">
                          Transferred Residence Nil-Rate Band
                        </td>
                        <td className="text-right px-4 py-3 text-sm font-medium text-[var(--color-cream)]">
                          {formatCurrency(result.transferredResidenceNilRateBand)}
                        </td>
                      </tr>
                    )}
                    {result.charitableDeduction > 0 && (
                      <tr className="border-b border-white/5">
                        <td className="px-4 py-3 text-sm text-[var(--color-subtle)]">
                          Charitable Deduction
                        </td>
                        <td className="text-right px-4 py-3 text-sm font-medium text-emerald-400">
                          −{formatCurrency(result.charitableDeduction)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-white/5">
                      <td className="px-4 py-3 text-sm font-semibold text-[var(--color-cream)]">
                        Total Tax-Free Allowance
                      </td>
                      <td className="text-right px-4 py-3 text-sm font-bold text-blue-400">
                        {formatCurrency(result.totalNilRateBand)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Reference */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">Summary</h4>
              <Grid responsive={{ sm: 2, md: 3 }} gap="sm">
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Estate Value</p>
                  <p className="text-lg font-semibold text-[var(--color-cream)]">
                    {formatCurrency(inputs.estateValue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)]">IHT Due</p>
                  <p className="text-lg font-semibold text-blue-400">
                    {formatCurrency(result.ihtDue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Net Estate</p>
                  <p className="text-lg font-semibold text-[var(--color-cream)]">
                    {formatCurrency(result.netEstate)}
                  </p>
                </div>
              </Grid>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Inheritance Tax estimate: ${formatCurrency(result.ihtDue)} on a ${formatCurrency(inputs.estateValue)} estate (${formatPercent(result.effectiveRate)} effective rate). Net estate after IHT: ${formatCurrency(result.netEstate)}.`}
                calculatorName="Inheritance Tax Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
