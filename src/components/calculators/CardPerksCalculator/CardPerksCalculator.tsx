/** UK Card Rewards & Perks Calculator - Preact island; estimates only, not financial advice. */
import { computeResults, perksValue, rewardsValue } from './calculations';
import { inputsFromParams, paramsFromInputs } from './urlState';
import {
  CARD_TYPES,
  CARD_TYPE_LABELS,
  SORT_KEYS,
  SORT_LABELS,
  SPEND_CATEGORIES,
  SPEND_CATEGORY_LABELS,
  buildDefaultInputs,
  type CardPerksInputs,
  type CardPerksResult,
  type CardResult,
  type CardType,
  type Horizon,
  type SortKey,
  type ValueBreakdown,
} from './types';
import { CARDS } from './data/cards';
import { DEFAULT_ASSUMPTIONS, VOUCHER_BENCHMARK } from './data/pointValues';
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
  Slider,
  MultiSelectChips,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';
import { useEffect, useState } from 'preact/hooks';

const DEFAULTS = buildDefaultInputs(DEFAULT_ASSUMPTIONS);
const nf = new Intl.NumberFormat('en-GB');

function clampMin0(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function costsTotal(b: ValueBreakdown): number {
  return b.fee + b.fx + b.interest;
}

function gbp(value: number): string {
  return `£${nf.format(value)}`;
}

function ResultRow({
  result,
  expanded,
  onToggle,
}: {
  result: CardResult;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { card, breakdown } = result;
  const rowId = `breakdown-${card.id}`;
  const negative = breakdown.net < 0;

  return (
    <>
      <tr>
        <td className="py-2 pr-2 tabular-nums whitespace-nowrap">{result.rank}</td>
        <td className="py-2">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={rowId}
            aria-label={`Show breakdown for ${card.name}`}
            onClick={onToggle}
            className="min-h-11 min-w-11 flex items-center gap-2 text-left"
          >
            <span aria-hidden="true">{expanded ? '−' : '+'}</span>
            <span className="font-medium">{card.name}</span>
          </button>
        </td>
        <td className="py-2 whitespace-nowrap">{CARD_TYPE_LABELS[card.type]}</td>
        <td className="text-right py-2 pl-3 tabular-nums whitespace-nowrap">
          {gbp(rewardsValue(breakdown))}
        </td>
        <td className="text-right py-2 pl-3 tabular-nums whitespace-nowrap">
          {gbp(perksValue(breakdown))}
        </td>
        <td className="text-right py-2 pl-3 tabular-nums whitespace-nowrap">
          {costsTotal(breakdown) > 0 ? `-${gbp(costsTotal(breakdown))}` : gbp(0)}
        </td>
        <td className="text-right py-2 pl-3 tabular-nums whitespace-nowrap">
          {negative ? `-${gbp(Math.abs(breakdown.net))}` : gbp(breakdown.net)}
          {negative && (
            <span className="ml-2 text-xs text-amber-400 uppercase tracking-wider">Costs you</span>
          )}
        </td>
      </tr>
      {expanded && (
        <tr id={rowId}>
          <td colSpan={7} className="py-3 text-sm text-[var(--color-muted)]">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <dt className="text-xs uppercase tracking-wider">Rewards</dt>
                <dd className="text-[var(--color-cream)]">{gbp(breakdown.rewards)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider">Welcome bonus</dt>
                <dd className="text-[var(--color-cream)]">
                  {card.welcomeBonus === null
                    ? 'None'
                    : result.bonusMissed
                      ? 'Not reached'
                      : gbp(breakdown.welcome)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider">Lounge</dt>
                <dd className="text-[var(--color-cream)]">{gbp(breakdown.lounge)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider">Insurance</dt>
                <dd className="text-[var(--color-cream)]">{gbp(breakdown.insurance)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider">Voucher</dt>
                <dd className="text-[var(--color-cream)]">
                  {card.companionVoucher === null
                    ? 'None'
                    : result.voucherMissed
                      ? 'Spend threshold not met'
                      : gbp(breakdown.voucher)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider">Fee</dt>
                <dd className="text-[var(--color-cream)]">{gbp(breakdown.fee)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider">FX</dt>
                <dd className="text-[var(--color-cream)]">{gbp(breakdown.fx)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider">Interest</dt>
                <dd className="text-[var(--color-cream)]">{gbp(breakdown.interest)}</dd>
              </div>
            </dl>
            {card.minIncome !== null && (
              <p className="mt-3">Minimum income: {gbp(card.minIncome)}/yr</p>
            )}
            {card.welcomeBonus && <p className="mt-2">{card.welcomeBonus.note}</p>}
            {card.notes.length > 0 && (
              <ul className="mt-2 list-disc list-inside space-y-1">
                {card.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function CardPerksCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorBase<
    CardPerksInputs,
    CardPerksResult
  >({
    name: 'Card Rewards & Perks Calculator',
    slug: 'calc-card-perks',
    defaults: DEFAULTS,
    compute: (currentInputs) => computeResults(currentInputs, CARDS),
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Shared-link params win over locally stored state, once, on mount.
  useEffect(() => {
    if (!window.location.search) return;
    setInputs(inputsFromParams(window.location.search, DEFAULTS));
  }, [setInputs]);

  // Keep the address bar in sync so the current comparison is always shareable.
  useEffect(() => {
    const qs = paramsFromInputs(inputs, DEFAULTS);
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [inputs]);

  // Stamped on mount so the e2e specs can wait for hydration instead of a fixed sleep.
  useEffect(() => {
    document.documentElement.dataset.cardPerksReady = 'true';
    return () => {
      delete document.documentElement.dataset.cardPerksReady;
    };
  }, []);

  const copyLink = (): void => {
    void navigator.clipboard?.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const topCard = result.ranked.reduce<CardResult | null>(
    (best, item) => (best === null || item.breakdown.net > best.breakdown.net ? item : best),
    null
  );
  const headlineColor =
    topCard === null ? 'default' : topCard.breakdown.net >= 0 ? 'success' : 'error';
  const shareSummary = topCard
    ? `${topCard.card.name} has the highest estimated net value for ${gbp(result.totalSpend)}/yr spend: ${gbp(topCard.breakdown.net)} a year`
    : 'No cards match these filters';

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        <CalculatorHeader
          title="Card Rewards & Perks Calculator"
          subtitle="Compare UK credit, charge, debit and BNPL cards by estimated net value for your spend"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-cream)] mb-3">
                Your spending
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                {SPEND_CATEGORIES.map((category) => (
                  <div key={category}>
                    <Label htmlFor={`spend-${category}`}>
                      {SPEND_CATEGORY_LABELS[category]} (GBP/yr)
                    </Label>
                    <Input
                      id={`spend-${category}`}
                      variant="currency"
                      currencySymbol="£"
                      min={0}
                      step={100}
                      value={inputs.spend[category]}
                      onChange={(e) =>
                        updateInput('spend', {
                          ...inputs.spend,
                          [category]: clampMin0(Number((e.target as HTMLInputElement).value)),
                        })
                      }
                    />
                  </div>
                ))}
              </Grid>
              <Grid responsive={{ sm: 1, md: 2 }} gap="md" className="mt-4">
                <div>
                  <Label htmlFor="spendAbroad">Spend abroad (GBP/yr)</Label>
                  <Input
                    id="spendAbroad"
                    variant="currency"
                    currencySymbol="£"
                    min={0}
                    step={100}
                    value={inputs.spendAbroad}
                    onChange={(e) =>
                      updateInput(
                        'spendAbroad',
                        clampMin0(Number((e.target as HTMLInputElement).value))
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="loungeVisits">Lounge visits per year</Label>
                  <Input
                    id="loungeVisits"
                    min={0}
                    step={1}
                    value={inputs.loungeVisits}
                    onChange={(e) =>
                      updateInput(
                        'loungeVisits',
                        clampMin0(Number((e.target as HTMLInputElement).value))
                      )
                    }
                  />
                </div>
              </Grid>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--color-cream)] mb-3">Balance</h3>
              <Toggle
                checked={inputs.clearsBalance}
                onChange={(v) => updateInput('clearsBalance', v)}
                label="I clear my balance in full every month"
              />
              {!inputs.clearsBalance && (
                <div className="mt-4 max-w-xs">
                  <Label htmlFor="carriedBalance">Average balance carried (GBP)</Label>
                  <Input
                    id="carriedBalance"
                    variant="currency"
                    currencySymbol="£"
                    min={0}
                    step={100}
                    value={inputs.carriedBalance}
                    onChange={(e) =>
                      updateInput(
                        'carriedBalance',
                        clampMin0(Number((e.target as HTMLInputElement).value))
                      )
                    }
                  />
                </div>
              )}
              <Alert variant="info" className="mt-4">
                Interest wipes out rewards fast. The estimate charges the card purchase rate on the
                balance you carry.
              </Alert>
            </div>

            <details>
              <summary className="cursor-pointer font-semibold text-sm text-[var(--color-cream)]">
                Change the assumptions
              </summary>
              <div className="mt-4 space-y-6">
                <div>
                  <Label>Value horizon</Label>
                  <ButtonGroup
                    aria-label="Value horizon"
                    value={inputs.horizon}
                    onChange={(v) => updateInput('horizon', v as Horizon)}
                    options={[
                      { value: 'ongoing', label: 'Ongoing year' },
                      { value: 'year1', label: 'First year' },
                    ]}
                  />
                </div>
                <div>
                  <Slider
                    value={inputs.pointValuePence.avios}
                    onChange={(v) =>
                      updateInput('pointValuePence', {
                        ...inputs.pointValuePence,
                        avios: v,
                        membershipRewards: v,
                        virginPoints: v,
                      })
                    }
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    label="Value of 1 airline point"
                    showValue
                    labels={{ current: (v) => `${v.toFixed(1)}p` }}
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    Applies to Avios, Membership Rewards and Virgin Points
                  </p>
                </div>
                <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                  <div>
                    <Label htmlFor="loungeVisitValue">Lounge visit value (GBP)</Label>
                    <Input
                      id="loungeVisitValue"
                      variant="currency"
                      currencySymbol="£"
                      min={0}
                      step={1}
                      value={inputs.loungeVisitValue}
                      onChange={(e) =>
                        updateInput(
                          'loungeVisitValue',
                          clampMin0(Number((e.target as HTMLInputElement).value))
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="insuranceValue">Travel insurance value (GBP)</Label>
                    <Input
                      id="insuranceValue"
                      variant="currency"
                      currencySymbol="£"
                      min={0}
                      step={1}
                      value={inputs.insuranceValue}
                      onChange={(e) =>
                        updateInput(
                          'insuranceValue',
                          clampMin0(Number((e.target as HTMLInputElement).value))
                        )
                      }
                    />
                  </div>
                </Grid>
                <div>
                  <Label htmlFor="voucherValue">Companion voucher value (GBP)</Label>
                  <Input
                    id="voucherValue"
                    variant="currency"
                    currencySymbol="£"
                    min={0}
                    step={1}
                    value={inputs.voucherValue}
                    onChange={(e) =>
                      updateInput(
                        'voucherValue',
                        clampMin0(Number((e.target as HTMLInputElement).value))
                      )
                    }
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    Default = Avios saved on a {VOUCHER_BENCHMARK.city} economy return, off-peak,
                    from the Avios finder. Raise it if you would use it in a higher cabin.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <Divider />

          <div className="space-y-6">
            <Grid responsive={{ sm: 1, md: 3 }} gap="md">
              <MetricCard
                label="Highest net value"
                value={topCard ? `${gbp(topCard.breakdown.net)} / yr` : 'No match'}
                sublabel={topCard ? topCard.card.name : undefined}
                valueColor={headlineColor}
              />
              <MetricCard
                label="Cards compared"
                value={`${result.ranked.length} / ${result.totalCards}`}
              />
              <MetricCard label="Your yearly spend" value={`${gbp(result.totalSpend)}/yr`} />
            </Grid>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
              <div className="flex-1 min-w-[220px]">
                <Label>Card type</Label>
                <MultiSelectChips<CardType>
                  options={CARD_TYPES.map((t) => ({ value: t, label: CARD_TYPE_LABELS[t] }))}
                  selected={inputs.types}
                  onChange={(v) => updateInput('types', v)}
                  ariaLabel="Filter by card type"
                  allLabel="All"
                />
              </div>
              <Toggle
                checked={inputs.loungeOnly}
                onChange={(v) => updateInput('loungeOnly', v)}
                label="Lounge access only"
                className="sm:pb-3"
              />
              <Toggle
                checked={inputs.noFeeOnly}
                onChange={(v) => updateInput('noFeeOnly', v)}
                label="No annual fee"
                className="sm:pb-3"
              />
              <div className="w-full sm:w-auto sm:flex-none">
                <Label htmlFor="sortKey">Sort by</Label>
                <Select
                  id="sortKey"
                  value={inputs.sortKey}
                  onChange={(v) => updateInput('sortKey', v as SortKey)}
                  options={SORT_KEYS.map((k) => ({ value: k, label: SORT_LABELS[k] }))}
                />
              </div>
            </div>

            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <div
                className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white"
                tabIndex={0}
                role="region"
                aria-label="Ranked cards table, scrolls sideways"
              >
                <table className="w-full text-sm" aria-label="Cards ranked by estimated net value">
                  <thead>
                    <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider">
                      <th scope="col" className="text-left py-2 pr-2">
                        Rank
                      </th>
                      <th scope="col" className="text-left py-2">
                        Card
                      </th>
                      <th scope="col" className="text-left py-2">
                        Type
                      </th>
                      <th scope="col" className="text-right py-2 pl-3 whitespace-nowrap">
                        Rewards
                      </th>
                      <th scope="col" className="text-right py-2 pl-3 whitespace-nowrap">
                        Perks
                      </th>
                      <th scope="col" className="text-right py-2 pl-3 whitespace-nowrap">
                        Fees & costs
                      </th>
                      <th scope="col" className="text-right py-2 pl-3 whitespace-nowrap">
                        Net / yr
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {result.ranked.map((r) => (
                      <ResultRow
                        key={r.card.id}
                        result={r}
                        expanded={expandedId === r.card.id}
                        onToggle={() =>
                          setExpandedId((prev) => (prev === r.card.id ? null : r.card.id))
                        }
                      />
                    ))}
                  </tbody>
                </table>
                {result.ranked.length === 0 && (
                  <p className="text-[var(--color-muted)] text-sm py-4">
                    No cards match these filters.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <ShareResults
                result={shareSummary}
                calculatorName="Card Rewards & Perks Calculator"
              />
              <button
                type="button"
                onClick={copyLink}
                className="px-4 py-2 rounded-full text-sm font-medium border border-white/15 text-[var(--color-subtle)] hover:text-[var(--color-cream)] hover:border-white/30 transition-colors"
              >
                {linkCopied ? 'Link copied' : 'Copy link to this comparison'}
              </button>
            </div>

            <p className="text-xs text-[var(--color-muted)] text-center">
              Estimates for the numbers you entered. We take no commission from any card issuer and
              this page has no application links. Not financial advice.
            </p>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
