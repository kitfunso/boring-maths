/**
 * Avios Destination Finder - Preact Component
 *
 * Searches every BA destination at once by Avios budget, dates, region and
 * holiday type. Guide prices from BA's published reward table - NOT live
 * seat availability.
 */
import { computeResults } from './calculations';
import { inputsFromParams, paramsFromInputs } from './urlState';
import {
  CABIN_LABELS,
  HOLIDAY_TYPES,
  HOLIDAY_TYPE_LABELS,
  REGIONS,
  VOUCHER_LABELS,
  VOUCHER_TYPES,
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
import MultiSelectChips from '../../ui/primitives/MultiSelectChips';
import DateRangePicker from './DateRangePicker';
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
import { useEffect, useState } from 'preact/hooks';

// BA blocks parameterised deep links for anonymous sessions (verified 2026-07-19);
// this is the official Reward Flight Finder entry page.
const BA_REWARD_FLIGHT_FINDER_URL =
  'https://www.britishairways.com/travel/flightfinder/public/en_gb';

const REGION_OPTIONS = REGIONS.map((r) => ({ value: r, label: r }));
const HOLIDAY_OPTIONS = HOLIDAY_TYPES.map((t) => ({ value: t, label: HOLIDAY_TYPE_LABELS[t] }));
const CABIN_OPTIONS = (Object.keys(CABIN_LABELS) as Cabin[]).map((c) => ({
  value: c,
  label: CABIN_LABELS[c],
}));
const VOUCHER_OPTIONS = VOUCHER_TYPES.map((v) => ({ value: v, label: VOUCHER_LABELS[v] }));
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'avios', label: 'Fewest Avios first' },
  { value: 'value', label: 'Best bang for your buck' },
  { value: 'cash', label: 'Lowest cash co-pay' },
  { value: 'peakSaving', label: 'Biggest off-peak saving' },
  { value: 'distance', label: 'Shortest flights first' },
  { value: 'name', label: 'A to Z' },
];

const nf = new Intl.NumberFormat('en-GB');

function formatAvios(v: number | null): string {
  return v === null ? '-' : nf.format(v);
}

function ResultRow({ row }: { row: DestinationResult }) {
  const d = row.destination;
  // Over-budget rows dim via muted text colour, not opacity: opacity-50 halved
  // the contrast of already-muted subtext below WCAG AA and dimmed the
  // "Over budget" cue that is supposed to stand out.
  return (
    <tr className={row.withinBudget ? '' : 'text-[var(--color-muted)]'}>
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
      <td className="text-right py-2 pl-3 tabular-nums whitespace-nowrap">
        {formatAvios(row.aviosOffPeak)}
      </td>
      <td className="text-right py-2 pl-3 tabular-nums whitespace-nowrap">
        {formatAvios(row.aviosPeak)}
      </td>
      <td className="text-right py-2 pl-3 tabular-nums whitespace-nowrap">
        £{row.cashTotal.toFixed(2)}
      </td>
      <td className="text-right py-2 pl-3 tabular-nums whitespace-nowrap">
        {nf.format(row.distanceMiles)} <span className="text-[var(--color-muted)] text-xs">mi</span>
      </td>
      <td className="text-right py-2 pl-3 tabular-nums whitespace-nowrap">
        {row.valuePer1k.toFixed(1)}
      </td>
      <td className="text-right py-2 pl-3 tabular-nums whitespace-nowrap">{row.budgetPercent}%</td>
      <td className="text-right py-2 pl-3 whitespace-nowrap">
        <a
          href={BA_REWARD_FLIGHT_FINDER_URL}
          target="_blank"
          rel="noopener nofollow"
          className="text-[var(--color-accent)] hover:underline"
        >
          Check
        </a>
      </td>
    </tr>
  );
}

export default function AviosDestinationFinder() {
  const { inputs, result, updateInput, setInputs } = useCalculatorBase<
    AviosFinderInputs,
    AviosFinderResult
  >({
    name: 'Avios Destination Finder',
    slug: 'calc-avios-finder-inputs',
    defaults: getDefaultInputs,
    compute: computeResults,
  });

  // State saved before voucher types carries a boolean that priced 2-for-1 in every cabin.
  useEffect(() => {
    setInputs((prev) => {
      if (!('companionVoucher' in prev)) return prev;
      const { companionVoucher, ...rest } = prev as AviosFinderInputs & {
        companionVoucher?: boolean;
      };
      return { ...rest, voucher: companionVoucher ? 'premiumPlus' : rest.voucher };
    });
  }, [setInputs]);

  // Shared-link params win over locally stored state, once, on mount.
  useEffect(() => {
    const patch = inputsFromParams(window.location.search);
    if (patch) setInputs((prev) => ({ ...prev, ...patch }));
  }, [setInputs]);

  // Keep the address bar in sync so the current search is always shareable.
  useEffect(() => {
    const qs = paramsFromInputs(inputs);
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [inputs]);

  // The static price tables below the island follow the cabin via CSS keyed on this attribute.
  useEffect(() => {
    document.documentElement.dataset.aviosCabin = inputs.cabin;
    return () => {
      delete document.documentElement.dataset.aviosCabin;
    };
  }, [inputs.cabin]);

  const [linkCopied, setLinkCopied] = useState(false);
  const copySearchLink = (): void => {
    void navigator.clipboard?.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const shown = inputs.showOverBudget ? result.ranked : result.affordable;

  const hasAffordable = result.affordable.length > 0;
  const cheapestTrip = hasAffordable
    ? result.affordable.reduce((min, row) => (row.rankAvios < min.rankAvios ? row : min))
    : null;
  const bestValueTrip = hasAffordable
    ? result.affordable.reduce((max, row) => (row.valuePer1k > max.valuePer1k ? row : max))
    : null;
  const furthestTrip = hasAffordable
    ? result.affordable.reduce((max, row) => (row.distanceMiles > max.distanceMiles ? row : max))
    : null;

  const topPicks =
    result.affordable.length > 0
      ? ` Top picks: ${result.affordable
          .slice(0, 3)
          .map((r) => r.destination.city)
          .join(', ')}`
      : ' None within budget - try a higher budget or wider filters.';

  const cabinLabel = CABIN_LABELS[inputs.cabin];
  const freeVoucherBlocked =
    inputs.voucher === 'free' && inputs.travellers === 2 && !result.voucherApplied;
  const voucherNote = result.voucherApplied
    ? ` + ${inputs.voucher === 'free' ? 'free' : 'Premium Plus'} companion voucher`
    : freeVoucherBlocked
      ? ` (free voucher not valid in ${cabinLabel})`
      : '';
  const budgetSublabel = result.voucherApplied
    ? result.voucherSavingAvios > 0
      ? `Voucher saves ${nf.format(result.voucherSavingAvios)} Avios vs paying for 2 seats`
      : 'with companion voucher'
    : freeVoucherBlocked
      ? `Free voucher not valid in ${cabinLabel}`
      : undefined;

  const summary = `${nf.format(inputs.aviosBudget)} Avios (${cabinLabel}, ${
    inputs.travellers
  } traveller${inputs.travellers === 2 ? 's' : ''}${voucherNote}): ${
    result.affordable.length
  } destinations within budget.${topPicks}`;

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
                <Label htmlFor="dateRange">Travel dates (optional)</Label>
                <DateRangePicker
                  id="dateRange"
                  valueFrom={inputs.dateFrom}
                  valueTo={inputs.dateTo}
                  onChange={(from, to) => {
                    updateInput('dateFrom', from);
                    updateInput('dateTo', to);
                  }}
                />
              </div>
            </Grid>

            <div>
              <Label>Where in the world?</Label>
              <MultiSelectChips<Region>
                options={REGION_OPTIONS}
                selected={inputs.regions}
                onChange={(v) => updateInput('regions', v)}
                ariaLabel="Filter by region"
                allLabel="All"
              />
            </div>

            <div>
              <Label>Type of holiday</Label>
              <MultiSelectChips<HolidayType>
                options={HOLIDAY_OPTIONS}
                selected={inputs.holidayTypes}
                onChange={(v) => updateInput('holidayTypes', v)}
                ariaLabel="Filter by holiday type"
                allLabel="All"
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
                  onChange={(v) => {
                    const travellers = Number(v) as 1 | 2;
                    updateInput('travellers', travellers);
                    // The voucher is a 2-for-1: solo trips drop it so nothing claims voucher pricing
                    if (travellers === 1) updateInput('voucher', 'none');
                  }}
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
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                <div>
                  <Label htmlFor="voucher">BA Amex companion voucher</Label>
                  <Select
                    id="voucher"
                    value={inputs.voucher}
                    onChange={(value) => updateInput('voucher', value)}
                    options={VOUCHER_OPTIONS}
                  />
                  {freeVoucherBlocked && (
                    <p className="text-xs text-amber-400 mt-1">
                      The free card's voucher is economy only, so {cabinLabel} prices below are for
                      two full-Avios seats. Pick Economy, or the Premium Plus voucher.
                    </p>
                  )}
                  {result.voucherApplied && (
                    <p className="text-xs text-[var(--color-muted)] mt-1">
                      Second seat costs no Avios. Taxes and fees are payable for both travellers.
                    </p>
                  )}
                </div>
              </Grid>
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
                sublabel={`of ${result.totalDestinations - result.notOfferedCount} destinations`}
                valueColor="success"
              />
              <MetricCard
                label="Your budget"
                value={`${nf.format(inputs.aviosBudget)} Avios`}
                sublabel={budgetSublabel}
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

            {cheapestTrip && bestValueTrip && furthestTrip && (
              <Grid responsive={{ sm: 1, md: 3 }} gap="md">
                <MetricCard
                  label="Cheapest trip"
                  value={cheapestTrip.destination.city}
                  sublabel={`${nf.format(cheapestTrip.rankAvios)} Avios`}
                />
                <MetricCard
                  label="Best bang for your buck"
                  value={bestValueTrip.destination.city}
                  sublabel={`${bestValueTrip.valuePer1k.toFixed(1)} mi per 1k Avios`}
                />
                <MetricCard
                  label="Furthest you can fly"
                  value={furthestTrip.destination.city}
                  sublabel={`${nf.format(furthestTrip.distanceMiles)} mi for ${nf.format(furthestTrip.rankAvios)} Avios`}
                />
              </Grid>
            )}

            {/* Stacks below sm: a single-line justify-between squeezed the toggle
                into wrapped text. sm:w-auto lets the select shrink-wrap its widest
                option, so no fixed width can ever clip a sort label again (w-56
                clipped "Best bang for your buck") */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full sm:w-auto sm:flex-none">
                <Label htmlFor="sortKey">Sort by</Label>
                <Select
                  id="sortKey"
                  value={inputs.sortKey}
                  onChange={(value) => updateInput('sortKey', value)}
                  options={SORT_OPTIONS}
                />
              </div>
              {/* pb-3 optically centres the 24px track against the ~50px select */}
              <Toggle
                checked={inputs.showOverBudget}
                onChange={(v) => updateInput('showOverBudget', v)}
                label="Show over-budget destinations"
                className="sm:pb-3"
              />
            </div>

            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <div className="overflow-x-auto">
                <table
                  className="w-full text-sm"
                  aria-label="Destinations, sortable using the Sort by dropdown above"
                >
                  <thead>
                    <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider">
                      <th scope="col" className="text-left py-2">
                        Destination
                      </th>
                      {/* Two-line headers keep the 8-column table inside the card at
                          desktop widths; "Off-peak Avios" one-liners forced a 49px
                          horizontal scroll that hid the Seats column */}
                      <th scope="col" className="text-right py-2 pl-3 whitespace-nowrap">
                        Off-peak
                        <div className="normal-case tracking-normal text-[10px] text-[var(--color-muted)]">
                          Avios
                        </div>
                      </th>
                      <th scope="col" className="text-right py-2 pl-3 whitespace-nowrap">
                        Peak
                        <div className="normal-case tracking-normal text-[10px] text-[var(--color-muted)]">
                          Avios
                        </div>
                      </th>
                      <th scope="col" className="text-right py-2 pl-3 whitespace-nowrap">
                        + cash from
                      </th>
                      <th scope="col" className="text-right py-2 pl-3 whitespace-nowrap">
                        Distance
                      </th>
                      <th
                        scope="col"
                        className="text-right py-2 pl-3 whitespace-nowrap"
                        title="Miles flown per 1,000 Avios - higher is better"
                      >
                        Value
                        <div className="normal-case tracking-normal text-[10px] text-[var(--color-muted)]">
                          mi per 1k Avios
                        </div>
                      </th>
                      <th scope="col" className="text-right py-2 pl-3 whitespace-nowrap">
                        % of budget
                      </th>
                      <th scope="col" className="text-right py-2 pl-3 whitespace-nowrap">
                        Seats
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

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <ShareResults result={summary} calculatorName="Avios Destination Finder" />
              <button
                type="button"
                onClick={copySearchLink}
                className="px-4 py-2 rounded-full text-sm font-medium border border-white/15 text-[var(--color-subtle)] hover:text-[var(--color-cream)] hover:border-white/30 transition-colors"
              >
                {linkCopied ? 'Link copied' : 'Copy link to this search'}
              </button>
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
