/**
 * Avios Destination Finder - Preact Component
 *
 * Searches every BA destination at once by Avios budget, dates, region and
 * holiday type. Guide prices from BA's published reward table - NOT live
 * seat availability.
 */
import { computeResults } from './calculations';
import {
  CABIN_LABELS,
  HOLIDAY_TYPES,
  HOLIDAY_TYPE_LABELS,
  REGIONS,
  getDefaultInputs,
  type AviosFinderInputs,
  type AviosFinderResult,
  type Cabin,
  type DestinationResult,
  type HolidayType,
  type Region,
  type SortKey,
} from './types';
import { DATA_LAST_VERIFIED } from './data/peakCalendar';
import MultiSelectChips from './MultiSelectChips';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Select,
  ButtonGroup,
  Toggle,
  Grid,
  Divider,
  Alert,
  MetricCard,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';

const REGION_OPTIONS = REGIONS.map((r) => ({ value: r, label: r }));
const HOLIDAY_OPTIONS = HOLIDAY_TYPES.map((t) => ({ value: t, label: HOLIDAY_TYPE_LABELS[t] }));
const CABIN_OPTIONS = (Object.keys(CABIN_LABELS) as Cabin[]).map((c) => ({
  value: c,
  label: CABIN_LABELS[c],
}));
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'avios', label: 'Fewest Avios first' },
  { value: 'distance', label: 'Shortest flights first' },
  { value: 'name', label: 'A to Z' },
];

const nf = new Intl.NumberFormat('en-GB');

function formatAvios(v: number | null): string {
  return v === null ? '-' : nf.format(v);
}

function ResultRow({ row }: { row: DestinationResult }) {
  const d = row.destination;
  return (
    <tr className={row.withinBudget ? '' : 'opacity-50'}>
      <td className="py-2">
        <span className="font-medium">{d.city}</span>{' '}
        <span className="text-[var(--color-muted)]">{d.country}</span>
        {!row.withinBudget && (
          <span className="ml-2 text-xs text-amber-400 uppercase tracking-wider">Over budget</span>
        )}
        <div className="text-xs text-[var(--color-muted)]">
          {d.holidayTypes.map((t) => HOLIDAY_TYPE_LABELS[t]).join(' | ')}
        </div>
      </td>
      <td className="text-right py-2 tabular-nums">{formatAvios(row.aviosOffPeak)}</td>
      <td className="text-right py-2 tabular-nums">{formatAvios(row.aviosPeak)}</td>
      <td className="text-right py-2 tabular-nums">£{row.cashTotal.toFixed(2)}</td>
      <td className="text-right py-2 tabular-nums">{row.budgetPercent}%</td>
    </tr>
  );
}

export default function AviosDestinationFinder() {
  const { inputs, result, updateInput } = useCalculatorBase<AviosFinderInputs, AviosFinderResult>({
    name: 'Avios Destination Finder',
    slug: 'calc-avios-finder-inputs',
    defaults: getDefaultInputs,
    compute: computeResults,
  });

  const shown = inputs.showOverBudget ? result.ranked : result.affordable;

  const topPicks =
    result.affordable.length > 0
      ? ` Top picks: ${result.affordable
          .slice(0, 3)
          .map((r) => r.destination.city)
          .join(', ')}`
      : ' None within budget - try a higher budget or wider filters.';

  const summary = `${nf.format(inputs.aviosBudget)} Avios (${CABIN_LABELS[inputs.cabin]}, ${
    inputs.travellers
  } traveller${inputs.travellers === 2 ? 's' : ''}${
    inputs.companionVoucher ? ' + companion voucher' : ''
  }): ${result.affordable.length} destinations within budget.${topPicks}`;

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Avios Destination Finder"
          subtitle="Unofficial guide - see every BA destination your Avios can reach"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div>
                <Label htmlFor="aviosBudget" required>
                  Avios to spend
                </Label>
                <Input
                  id="aviosBudget"
                  type="number"
                  min={0}
                  step={1000}
                  value={inputs.aviosBudget}
                  onChange={(e) => updateInput('aviosBudget', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="dateFrom">Travel dates (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="dateFrom"
                    type="date"
                    aria-label="Travel start date"
                    value={inputs.dateFrom}
                    onChange={(e) => updateInput('dateFrom', e.target.value)}
                  />
                  <Input
                    id="dateTo"
                    type="date"
                    aria-label="Travel end date"
                    value={inputs.dateTo}
                    onChange={(e) => updateInput('dateTo', e.target.value)}
                  />
                </div>
              </div>
            </Grid>

            <div>
              <Label>Where in the world?</Label>
              <MultiSelectChips<Region>
                options={REGION_OPTIONS}
                selected={inputs.regions}
                onChange={(v) => updateInput('regions', v)}
                ariaLabel="Filter by region"
              />
            </div>

            <div>
              <Label>Type of holiday</Label>
              <MultiSelectChips<HolidayType>
                options={HOLIDAY_OPTIONS}
                selected={inputs.holidayTypes}
                onChange={(v) => updateInput('holidayTypes', v)}
                ariaLabel="Filter by holiday type"
              />
            </div>

            <Grid responsive={{ sm: 1, md: 3 }} gap="md">
              <div>
                <Label htmlFor="cabin">Cabin</Label>
                <Select
                  id="cabin"
                  value={inputs.cabin}
                  onChange={(value) => updateInput('cabin', value)}
                  options={CABIN_OPTIONS}
                />
              </div>
              <div>
                <Label>Travellers</Label>
                <ButtonGroup
                  aria-label="Number of travellers"
                  value={String(inputs.travellers)}
                  onChange={(v) => updateInput('travellers', Number(v) as 1 | 2)}
                  options={[
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                  ]}
                />
              </div>
              <div>
                <Label>Trip</Label>
                <ButtonGroup
                  aria-label="Trip type"
                  value={inputs.tripType}
                  onChange={(v) => updateInput('tripType', v)}
                  options={[
                    { value: 'return', label: 'Return' },
                    { value: 'oneWay', label: 'One-way' },
                  ]}
                />
              </div>
            </Grid>

            {inputs.travellers === 2 && (
              <div>
                <Toggle
                  checked={inputs.companionVoucher}
                  onChange={(v) => updateInput('companionVoucher', v)}
                  label="I have a BA Amex Companion Voucher (2-for-1)"
                />
                {inputs.companionVoucher && inputs.cabin !== 'economy' && (
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    Vouchers from the free BA Amex card are economy-only; the Premium Plus voucher
                    works in all cabins. Taxes and fees are payable for both travellers.
                  </p>
                )}
              </div>
            )}
          </div>

          <Divider />

          <div className="space-y-6">
            <Alert variant="info" title="Guide prices, not live availability">
              Prices are BA's published reward flight figures (lowest-cash option, last verified{' '}
              {DATA_LAST_VERIFIED}). Reward seats are limited and sell out - always check
              availability and final taxes on ba.com before planning. This site is not affiliated
              with British Airways; Avios is a trademark of its owner.
            </Alert>

            {result.seasons.beyondCalendar && (
              <Alert variant="warning" title="2027 dates are provisional">
                BA has not yet published the 2027 peak calendar, so both peak and off-peak prices
                are shown for dates beyond 2026.
              </Alert>
            )}

            <Grid responsive={{ sm: 2, md: 3 }} gap="md">
              <MetricCard
                label="Within budget"
                value={String(result.affordable.length)}
                sublabel={`of ${result.totalDestinations} destinations`}
                valueColor="success"
              />
              <MetricCard
                label="Your budget"
                value={`${nf.format(inputs.aviosBudget)} Avios`}
                sublabel={inputs.companionVoucher ? 'with companion voucher' : undefined}
              />
              <MetricCard
                label="Cabin"
                value={CABIN_LABELS[inputs.cabin]}
                sublabel={
                  result.notOfferedCount > 0
                    ? `${result.notOfferedCount} destinations not offered`
                    : undefined
                }
              />
            </Grid>

            <div className="flex items-center justify-between gap-4">
              <div className="w-56">
                <Label htmlFor="sortKey">Sort by</Label>
                <Select
                  id="sortKey"
                  value={inputs.sortKey}
                  onChange={(value) => updateInput('sortKey', value)}
                  options={SORT_OPTIONS}
                />
              </div>
              <Toggle
                checked={inputs.showOverBudget}
                onChange={(v) => updateInput('showOverBudget', v)}
                label="Show over-budget destinations"
              />
            </div>

            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Destinations ranked by Avios cost">
                  <thead>
                    <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider">
                      <th scope="col" className="text-left py-2">
                        Destination
                      </th>
                      <th scope="col" className="text-right py-2">
                        Off-peak Avios
                      </th>
                      <th scope="col" className="text-right py-2">
                        Peak Avios
                      </th>
                      <th scope="col" className="text-right py-2">
                        + cash from
                      </th>
                      <th scope="col" className="text-right py-2">
                        % of budget
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {shown.map((row) => (
                      <ResultRow key={row.destination.iata} row={row} />
                    ))}
                  </tbody>
                </table>
                {shown.length === 0 && (
                  <p className="text-[var(--color-muted)] text-sm py-4">
                    No destinations match these filters. Widen the region or holiday-type selection,
                    or increase the budget.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <ShareResults result={summary} calculatorName="Avios Destination Finder" />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
