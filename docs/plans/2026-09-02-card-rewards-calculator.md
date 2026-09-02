# UK Card Rewards & Perks Calculator Implementation Plan

> **For Claude:** Execute with subagent-driven development, one task per subagent, non-overlapping file sets per wave. The orchestrator commits; executors never commit.

**Goal:** A new `Cards` calculator page that ranks ~25 UK card products (credit, charge, debit, BNPL, paid account plans) by the estimated net annual value in GBP for the visitor's own spending, plus a second rainbow homepage pill next to Avios.

**Architecture:** Same shape as the Avios finder: a hand-curated data file with a source URL and verified date per row, pure calculation functions, one Preact island with localStorage + shareable URL state, and a static crawlable facts table rendered by Astro from the same data. No affiliate or application links on the page (UK credit broking, RAO 2001 art. 36A). A monthly workflow flags rows whose verified date is older than 120 days.

**Tech stack:** Astro 5 + Preact + Tailwind 4, Vitest (jsdom), Playwright, GitHub Actions.

**Branch:** `feat/card-rewards-calculator` from `feat/avios-category-voucher` (1c1aeee, PR #26). Stacked: the second pill needs the first pill's markup and CSS. Merge order #25, #26, then this.

**Hard rules for every task:**
- Executors do NOT commit. The orchestrator stages specific files and commits per wave. Never `git add -A`.
- No em dashes in frontend strings. No "best card", "recommend", "you should" copy: the page estimates value for the numbers entered, it does not advise (project rule 3).
- No `AffiliateBox`, no `rel="sponsored"`, no "Apply" links, no links to issuer pages in the rendered page. Source URLs live in the data file and the facts table shows the source domain as text.
- Every number in `data/cards.ts` and `data/pointValues.ts` traces to a `sourceUrl` + `lastVerified` on the same row. No invented figures. A row that cannot be verified is dropped, not guessed.
- `calculators.ts` is CRLF. Edit with the Edit tool (exact match) or a CRLF-aware script.
- Select labels stay under 24 characters (the primitive clips at 375px).
- Avios-side changes are limited to three sanctioned edits, all in Task 3: the reciprocal related-calculator link on the Avios page, the `MultiSelectChips` promotion to `src/components/ui/primitives/` (import lines in the Avios island and its test change, nothing else), and the overflow helper extraction from `e2e/avios-finder-overflow.spec.ts` into `e2e/helpers/overflow.ts`. Behaviour of the finder does not change; its tests stay green.
- File ownership is absolute: no two tasks in a wave write the same file. Task 1 never touches `data/`; Task 2 only writes `data/` and its dataset test.
- Run `npx vitest run <file>` after each task; run `npm run qa` only at the end of a wave (the orchestrator does the final run).

---

## Shared contracts (both wave-1 tasks build to these verbatim)

### `src/components/calculators/CardPerksCalculator/types.ts`

```ts
/**
 * UK Card Rewards & Perks Calculator - Type Definitions
 *
 * Every card row is issuer-published data with a source URL and the date it
 * was last verified. Estimates only; issuers change terms without notice.
 */

export const CARD_TYPES = ['credit', 'charge', 'debit', 'bnpl', 'plan'] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const CARD_TYPE_LABELS: Readonly<Record<CardType, string>> = {
  credit: 'Credit card',
  charge: 'Charge card',
  debit: 'Debit card',
  bnpl: 'Debit + BNPL',
  plan: 'Paid account plan',
};

export const SPEND_CATEGORIES = ['groceries', 'travel', 'dining', 'other'] as const;
export type SpendCategory = (typeof SPEND_CATEGORIES)[number];

export const SPEND_CATEGORY_LABELS: Readonly<Record<SpendCategory, string>> = {
  groceries: 'Supermarkets',
  travel: 'Flights & hotels',
  dining: 'Eating out',
  other: 'Everything else',
};

/** Reward currencies. `cashback` is pence of cash back per unit (1 unit = 1p). */
export const POINT_CURRENCIES = [
  'avios',
  'membershipRewards',
  'virginPoints',
  'nectar',
  'clubcard',
  'revpoints',
  'cashback',
  'none',
] as const;
export type PointCurrency = (typeof POINT_CURRENCIES)[number];

export const POINT_CURRENCY_LABELS: Readonly<Record<PointCurrency, string>> = {
  avios: 'Avios',
  membershipRewards: 'Membership Rewards',
  virginPoints: 'Virgin Points',
  nectar: 'Nectar points',
  clubcard: 'Clubcard points',
  revpoints: 'RevPoints',
  cashback: 'Cashback',
  none: 'No rewards',
};

export type TravelInsurance = 'none' | 'basic' | 'comprehensive';

export interface WelcomeBonus {
  /** Units of the card's currency (points or pence for cashback). */
  readonly units: number;
  /** GBP spend needed inside the window. */
  readonly minSpend: number;
  readonly windowDays: number;
  /** Eligibility caveat shown verbatim, e.g. "No Amex card held in the last 24 months". */
  readonly note: string;
}

export interface LoungeAccess {
  readonly network: string;
  /** Included visits per year; null = unlimited. */
  readonly visitsPerYear: number | null;
  /** GBP the cardholder pays per visit; 0 = free. Covers discounted-pass schemes. */
  readonly pricePerVisit: number;
  /** GBP per guest visit; null = not offered. */
  readonly guestFee: number | null;
}

export interface CompanionVoucher {
  /** GBP annual card spend that earns the voucher. */
  readonly spendThreshold: number;
  readonly note: string;
}

export interface CardProduct {
  /** Stable kebab-case id, used as row key and in URLs. */
  readonly id: string;
  readonly name: string;
  readonly issuer: string;
  readonly type: CardType;
  readonly network: 'amex' | 'visa' | 'mastercard';
  /** Annual GBP fee: first year and ongoing (monthly plans stored as x12). */
  readonly fee: { readonly year1: number; readonly ongoing: number };
  /** Representative APR (variable), null for products with no credit line. */
  readonly representativeApr: number | null;
  /** Units earned per GBP 1 spent, per category. 0 = nothing. */
  readonly earn: Readonly<Record<SpendCategory, number>>;
  /** Higher rate once total annual spend passes `fromSpend` (Amex cashback step-ups). */
  readonly tier2: { readonly fromSpend: number; readonly earn: Readonly<Record<SpendCategory, number>> } | null;
  /** Annual GBP cap on reward value (monthly caps stored as x12); null = uncapped. */
  readonly rewardsCapGbp: number | null;
  readonly currency: PointCurrency;
  readonly welcomeBonus: WelcomeBonus | null;
  /** Non-sterling transaction fee, percent. */
  readonly fxFeePct: number;
  readonly lounge: LoungeAccess | null;
  readonly travelInsurance: TravelInsurance;
  readonly purchaseProtection: boolean;
  /** Consumer Credit Act s75 applies (credit and charge cards only). */
  readonly section75: boolean;
  readonly companionVoucher: CompanionVoucher | null;
  /** Free text: BNPL terms, fast track, spend caps, acceptance. Shown in the expanded row. */
  readonly notes: readonly string[];
  /** Minimum income requirement in GBP, null if none published. */
  readonly minIncome: number | null;
  readonly sourceUrl: string;
  /** ISO yyyy-mm-dd. */
  readonly lastVerified: string;
}

export const HORIZONS = ['ongoing', 'year1'] as const;
export type Horizon = (typeof HORIZONS)[number];

export const SORT_KEYS = ['net', 'rewards', 'perks', 'fees', 'fx'] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const SORT_LABELS: Readonly<Record<SortKey, string>> = {
  net: 'Highest net value',
  rewards: 'Most rewards',
  perks: 'Most perks value',
  fees: 'Lowest fees',
  fx: 'Cheapest abroad',
};

export interface CardPerksInputs {
  /** Annual GBP spend per category. */
  readonly spend: Readonly<Record<SpendCategory, number>>;
  /** Annual GBP spend in foreign currency (subset of the above, used for FX cost only). */
  readonly spendAbroad: number;
  readonly loungeVisits: number;
  readonly clearsBalance: boolean;
  /** Average GBP balance carried month to month when not clearing. */
  readonly carriedBalance: number;
  readonly horizon: Horizon;
  /** Pence per unit for each currency; user-adjustable, defaults from data/pointValues.ts. */
  readonly pointValuePence: Readonly<Record<PointCurrency, number>>;
  /** GBP the user puts on one lounge visit (before any per-visit price the card charges). */
  readonly loungeVisitValue: number;
  /** GBP per year the user puts on comprehensive card travel insurance. */
  readonly insuranceValue: number;
  /** GBP the user puts on one BA companion voucher. */
  readonly voucherValue: number;
  /** Empty = all types. */
  readonly types: readonly CardType[];
  readonly loungeOnly: boolean;
  readonly noFeeOnly: boolean;
  readonly sortKey: SortKey;
}

export interface ValueBreakdown {
  readonly rewards: number;
  readonly welcome: number;
  readonly lounge: number;
  readonly insurance: number;
  readonly voucher: number;
  readonly fee: number;
  readonly fx: number;
  readonly interest: number;
  /** Sum of the rounded components: rewards + welcome + lounge + insurance + voucher - fee - fx - interest. */
  readonly net: number;
  /** rewards / total spend, percent, 2dp; 0 when spend is 0. */
  readonly effectiveRewardRate: number;
}

export interface CardResult {
  readonly card: CardProduct;
  readonly breakdown: ValueBreakdown;
  /** 1-based rank in the current sort. */
  readonly rank: number;
  /** True when the welcome bonus was excluded because the spend window is not met. */
  readonly bonusMissed: boolean;
  /** True when the companion voucher threshold is not met. */
  readonly voucherMissed: boolean;
}

export interface CardPerksResult {
  readonly ranked: readonly CardResult[];
  readonly totalSpend: number;
  readonly hiddenCount: number;
  readonly totalCards: number;
}

/** The data-sourced assumptions the island injects; keeps types.ts and calculations.ts free of data imports. */
export interface DefaultAssumptions {
  readonly pointValuePence: Readonly<Record<PointCurrency, number>>;
  readonly loungeVisitValue: number;
  readonly insuranceValue: number;
  readonly voucherValue: number;
}

export function buildDefaultInputs(assumptions: DefaultAssumptions): CardPerksInputs;
```

`buildDefaultInputs(a)` returns: spend `{ groceries: 4800, travel: 2000, dining: 1800, other: 6000 }`, spendAbroad 1500, loungeVisits 2, clearsBalance true, carriedBalance 1000, horizon `'ongoing'`, pointValuePence = `a.pointValuePence`, loungeVisitValue = `a.loungeVisitValue`, insuranceValue = `a.insuranceValue`, voucherValue = `a.voucherValue`, types `[]`, loungeOnly false, noFeeOnly false, sortKey `'net'`. `types.ts`, `calculations.ts` and `urlState.ts` import nothing from `data/`. `urlState.ts` takes the defaults as an argument: `inputsFromParams(search, defaults)` and `paramsFromInputs(inputs, defaults)`. The island (Task 3) composes `buildDefaultInputs(DEFAULT_ASSUMPTIONS)` and `computeResults(inputs, CARDS)`.

### `src/components/calculators/CardPerksCalculator/data/pointValues.ts` (Task 2 writes; Task 1 imports)

```ts
import type { PointCurrency } from '../types';
import { DESTINATIONS } from '../../AviosDestinationFinder/data/destinations';
import { NOT_OFFERED } from '../../AviosDestinationFinder/types';

/** Pence per unit. Each value cites its source in the comment on the same line. */
export const DEFAULT_POINT_VALUE_PENCE: Readonly<Record<PointCurrency, number>>;
export const POINT_VALUE_SOURCES: Readonly<Record<PointCurrency, { url: string; verified: string; note: string }>>;
export const DEFAULT_LOUNGE_VISIT_VALUE: number;   // GBP, cite a walk-up lounge price
export const DEFAULT_INSURANCE_VALUE: number;      // GBP, cite an annual multi-trip policy price
/** Benchmark: London to New York, economy (the finder's default cabin and the only cabin the free BA voucher covers), off-peak, return. The voucher saves one seat's Avios. */
export const VOUCHER_BENCHMARK = { city: 'New York', cabin: 'economy', legs: 2 } as const;
/** Pure: finds the benchmark row in the given list, returns one-way off-peak Avios x legs; throws Error naming the city when the row is missing or NOT_OFFERED. */
export function resolveVoucherBenchmarkAvios(destinations: readonly Destination[]): number;
export const VOUCHER_BENCHMARK_AVIOS: number;      // = resolveVoucherBenchmarkAvios(DESTINATIONS), evaluated at import
export const DEFAULT_VOUCHER_VALUE: number;        // round(VOUCHER_BENCHMARK_AVIOS * avios pence / 100)
export const DEFAULT_ASSUMPTIONS: DefaultAssumptions; // the four defaults above bundled for buildDefaultInputs
export const DATA_LAST_VERIFIED: string;           // ISO date, the newest lastVerified across cards.ts
```

### Value formula (`calculations.ts`, pure)

For card `r`, inputs `i`, `totalSpend = sum(i.spend)`:

- `rewards`: for each category `c`, units = `i.spend[c] * rate[c]` where `rate` is `r.earn` for the share of total spend below `r.tier2.fromSpend` and `r.tier2.earn` for the share above it (share below = `totalSpend === 0 ? 1 : min(1, fromSpend / totalSpend)`, applied to every category; no `tier2` = all at `r.earn`); `rewards = min(sum(units) * i.pointValuePence[r.currency] / 100, r.rewardsCapGbp ?? Infinity)`
- `welcome` (horizon `year1` only): `r.welcomeBonus.units * pence / 100` when `totalSpend * (windowDays / 365) >= minSpend`, else 0 and `bonusMissed = true`. In `ongoing` the bonus is 0 and `bonusMissed` is always false (the view is not evaluating bonuses)
- `lounge = r.lounge ? min(i.loungeVisits, r.lounge.visitsPerYear ?? Infinity) * max(0, i.loungeVisitValue - r.lounge.pricePerVisit) : 0`
- `insurance = r.travelInsurance === 'comprehensive' ? i.insuranceValue : 0` (basic shows as a fact, earns nothing)
- `voucher = r.companionVoucher && totalSpend >= spendThreshold ? i.voucherValue : 0`, else `voucherMissed = true` when the card has a voucher
- `fee = horizon === 'year1' ? r.fee.year1 : r.fee.ongoing`
- `fx = i.spendAbroad * r.fxFeePct / 100`
- `interest = (i.clearsBalance || r.representativeApr === null) ? 0 : i.carriedBalance * r.representativeApr / 100`
- Round every component to whole pounds (`Math.round`) first; `net` = the sum of the rounded components, so the breakdown lines always add up to the net shown.
- `effectiveRewardRate = totalSpend > 0 ? round2(rawRewards / totalSpend * 100) : 0` where `rawRewards` is the unrounded GBP rewards value (before the whole-pound rounding used for `net`)

Filters: `types` (empty = all), `loungeOnly` (r.lounge !== null), `noFeeOnly` (fee for the horizon === 0). Sort comparators: `net` desc, `rewards` desc, `perks` (lounge + insurance + voucher) desc, `fees` asc, `fx` asc; every tie breaks on `net` desc then `name` asc. `rank` is assigned after sort. `hiddenCount = cards.length - ranked.length` where `cards` is the list passed to `computeResults` (never the module-level dataset).

---

## Wave 1 (parallel, disjoint files)

### Task 1: Types, calculations, URL state (executor A)

**Files:**
- Create: `src/components/calculators/CardPerksCalculator/types.ts` (verbatim from the contract above, plus the `buildDefaultInputs` body)
- Create: `src/components/calculators/CardPerksCalculator/calculations.ts`
- Create: `src/components/calculators/CardPerksCalculator/urlState.ts`
- Create: `src/components/calculators/CardPerksCalculator/index.ts` (barrel like the Avios one)
- Test: `tests/calculations/card-perks-calculator.test.ts`
- Test: `tests/calculations/card-perks-url-state.test.ts`

`data/` belongs to Task 2 and Task 1 never reads or writes it. Task 1 builds against fixtures: the tests define three inline `CardProduct` fixtures (one flat-earn credit card with lounge and voucher, one capped cashback debit card with `tier2`, one fee-free `plan` with `pricePerVisit` lounge) plus a `FIXTURE_ASSUMPTIONS: DefaultAssumptions` constant, and pass `cards` into `computeResults(inputs, cards)`. `computeResults` requires the card list (no default parameter), so nothing in Task 1 depends on the live dataset.

**Step 1: Failing tests for the formula** (`card-perks-calculator.test.ts`), one `it` per line:
- rewards: 1 Avios per GBP on 10,000 spend at 1p = 100
- category split: a card with `earn.groceries = 2` and 0 elsewhere earns only on groceries
- welcome bonus counted in `year1` when `totalSpend * window / 365 >= minSpend`; excluded and `bonusMissed` true otherwise; always excluded in `ongoing` with `bonusMissed` false even when spend is below `minSpend`
- lounge capped at `visitsPerYear`; unlimited when null; 0 when `lounge` is null; `pricePerVisit` is subtracted per visit and the result never goes below 0
- tier2 rate applies only to spend above `fromSpend`; `rewardsCapGbp` caps the GBP value; a card with neither behaves as flat
- insurance counts only for `comprehensive`
- voucher counts only when threshold met; `voucherMissed` set otherwise
- fee uses year1 vs ongoing by horizon
- fx = spendAbroad * fxFeePct / 100
- interest 0 when clearing; 0 when APR null (debit); `carriedBalance * apr / 100` otherwise
- every component is a whole number and `net` equals the sum of the displayed components
- sort keys: `fees` ascending, `fx` ascending, tie-break on net then name
- filters: `types`, `loungeOnly`, `noFeeOnly`; `hiddenCount` matches
- `effectiveRewardRate` 0 when spend is 0 (no NaN); a `tier2` card at zero spend earns 0 with no NaN
- `effectiveRewardRate` uses the unrounded rewards value (fixture where rounding would change the 2dp result)
- `hiddenCount` counts against the `cards` argument, not any module-level list
- `rank` is 1-based and contiguous

**Step 2:** `npx vitest run tests/calculations/card-perks-calculator.test.ts` fails (module missing).

**Step 3:** Implement `types.ts`, `calculations.ts` (`computeResults(inputs, cards)` with `cards` required, exported helpers `valueFor(card, inputs)` and `sortResults(results, sortKey)`). No import from `data/` anywhere in Task 1.

**Step 4:** Tests pass.

**Step 5: URL state.** Mirror `AviosDestinationFinder/urlState.ts`: `inputsFromParams(search)` and `paramsFromInputs(inputs)`. Params: `g,t,d,o` (spend), `abroad`, `lounge`, `clear` (0/1), `balance`, `horizon`, `avios` (pence, 1dp), `lv` (lounge visit value), `ins`, `voucher`, `types` (csv), `loungeOnly` (1), `noFee` (1), `sort`. Only non-default values are written. Invalid values are ignored. Both functions take `defaults: CardPerksInputs` as their last argument. Tests: round trip of a non-default input set; defaults produce `''`; garbage is ignored; a negative number in any numeric param is ignored; unknown type in csv is dropped.

**Step 6:** `npx vitest run tests/calculations/` passes. Report the test counts.

### Task 2: Dataset research (executor B, web access)

**Files:**
- Create: `src/components/calculators/CardPerksCalculator/data/cards.ts`
- Create: `src/components/calculators/CardPerksCalculator/data/pointValues.ts`
- Test: `tests/calculations/card-perks-dataset.test.ts`

**Candidate products (verify each on the issuer's own page; drop what you cannot verify; minimum 20 rows, target 26):**
American Express: The Platinum Card (charge), Preferred Rewards Gold (charge), British Airways American Express (credit, free), BA Premium Plus (credit), Nectar credit card, Platinum Cashback Everyday, Platinum Cashback, Amex Rewards credit card. Barclaycard Avios Plus, Barclaycard Avios. Virgin Atlantic Reward+, Virgin Atlantic Reward. HSBC Premier World Elite (note the Premier eligibility). Santander Edge credit card. NatWest Reward credit card. Tesco Bank Clubcard credit card. Sainsbury's Bank Nectar credit card. John Lewis Partnership credit card. M&S credit card. Halifax Clarity (no rewards, 0% FX: the abroad benchmark). Chase current account debit (cashback). Starling debit (no FX fee benchmark). Revolut Standard, Plus, Premium, Metal, Ultra (type `plan`, fee = monthly x 12, RevPoints earn per plan, lounge via the Revolut lounge offering). Monzo Perks and Monzo Max (type `plan`). Klarna Card (type `bnpl`: debit-first with optional Pay in 3; the FCA-authorised UK product page). Curve Pay and Curve X (both type `plan`: paid or free account tiers on a Mastercard debit, like the Revolut rows; fee 0 for the free tier).

**Sourcing:** the issuer's own product page is the source. If it cannot be fetched (bot block, JS-only), use one named secondary source (MoneySavingExpert or Head for Points), put that URL in `sourceUrl`, and add "figures via <domain>, issuer page not fetchable on <date>" to `notes`. Never fill a field from memory.

**Per row, record from the source:** fee year1 and ongoing (intro waivers go in year1), representative APR (null for debit/plan/bnpl with no credit line), earn per category (points per GBP; map issuer categories to the four buckets, put the mapping in `notes`), `tier2` for step-up rates and `rewardsCapGbp` for monthly or annual caps (x12 for monthly), currency, welcome bonus (units, min spend, window days, eligibility note), FX fee percent (a plan with a free-FX allowance then a fee: use the fee above the allowance and note the allowance), lounge (network, included visits per year or null for unlimited, `pricePerVisit` in GBP with 0 for free, guest fee), travel insurance level (`comprehensive` only when the issuer page says worldwide travel insurance is included; `basic` for travel accident or inconvenience cover only), purchase protection, section75 (true for `credit` and `charge` only), companion voucher (threshold + note), min income, notes, sourceUrl (the issuer page you read), lastVerified `2026-09-02`.

**Header comment in `cards.ts`:** what the file is, the no-commission statement, that figures are issuer-published at `lastVerified` and change often, and how to re-verify (open each `sourceUrl`, update the row, bump `lastVerified`).

**`pointValues.ts`:** fill the contract above. Avios, Membership Rewards and Virgin Points pence: cite a points-valuation article (Head for Points or equivalent) with URL and date. Nectar: 500 points = GBP 2.50 (cite Nectar). Clubcard: 1 point = 1p in store (cite Tesco). RevPoints: cite Revolut's Avios transfer rate. Cashback = 1. Lounge visit value: cite one walk-up lounge price (e.g. a Priority Pass or lounge operator page). Insurance: cite one annual multi-trip policy price. `resolveVoucherBenchmarkAvios(destinations)` finds the `VOUCHER_BENCHMARK.city` row and returns its `economy.offPeak` x `VOUCHER_BENCHMARK.legs`; it throws an `Error` naming the city when the row is missing or the cabin is `NOT_OFFERED`. `VOUCHER_BENCHMARK_AVIOS = resolveVoucherBenchmarkAvios(DESTINATIONS)` at module level so the build fails loudly. `DEFAULT_ASSUMPTIONS` bundles the four defaults. `DATA_LAST_VERIFIED` = max `lastVerified` in `cards.ts`. Types come from `../types` via `import type` only (Task 1 writes that file concurrently).

**Dataset test (`card-perks-dataset.test.ts`):** ids unique and kebab-case; at least 20 rows; every `sourceUrl` starts with `https://`; every `lastVerified` matches `^\d{4}-\d{2}-\d{2}$` and is not in the future; fees >= 0 and year1 <= ongoing or a `notes` entry mentions the intro offer (assert `fee.year1 <= fee.ongoing`); `representativeApr` is null for `debit`, `plan` and `bnpl` rows and a number > 0 for `credit` rows; `section75` true only for `credit`/`charge`; earn values between 0 and 10; `fxFeePct` between 0 and 5; lounge `visitsPerYear` null or >= 1; every `PointCurrency` in use has a positive value in `DEFAULT_POINT_VALUE_PENCE` (except `none`); `VOUCHER_BENCHMARK_AVIOS > 0`; `DEFAULT_VOUCHER_VALUE > 0`; `resolveVoucherBenchmarkAvios([])` throws an error whose message names the benchmark city; `resolveVoucherBenchmarkAvios([{ ...newYorkRow, economy: NOT_OFFERED }])` throws; the valid card types list for the per-type assertions is hardcoded in the test (`['credit','charge','debit','bnpl','plan']`) so the test does not need a runtime import from `types.ts`.

**Deliverable report:** the row list with one line per card: `id | type | fee ongoing | currency | sourceUrl`. The orchestrator spot-checks five rows against the cited pages before the wave is accepted.

---

## Wave 2 (parallel, disjoint files; starts when both wave-1 tasks are accepted)

### Task 3: Island, facts table, page, e2e (executor A)

**Files:**
- Move (git mv): `src/components/calculators/AviosDestinationFinder/MultiSelectChips.tsx` to `src/components/ui/primitives/MultiSelectChips.tsx`; export it from `src/components/ui/index.ts` next to the other primitives; update the import in `AviosDestinationFinder.tsx:27` and in `tests/components/multi-select-chips.test.tsx:11`; drop the "local to this calculator" header line (this is the second calculator its header was waiting for)
- Create: `src/components/calculators/CardPerksCalculator/CardPerksCalculator.tsx`
- Create: `src/components/calculators/CardPerksCalculator/CardFactsTable.astro`
- Create: `src/pages/calculators/card-rewards-calculator.astro`
- Modify: `src/pages/calculators/avios-destination-finder.astro:130-153` (add one related-calculator entry pointing at the new page)
- Create: `e2e/helpers/overflow.ts` (extract the `OverflowReport` collector from `e2e/avios-finder-overflow.spec.ts` so both specs import it; the Avios spec keeps its behaviour and its viewport list)
- Modify: `e2e/avios-finder-overflow.spec.ts` (import the helper, delete the inline copy)
- Create: `e2e/card-rewards.spec.ts`
- Test: `tests/components/card-perks-calculator.test.tsx` (render smoke: island mounts, table shows `ranked.length` rows, changing a spend input changes a net value)
- Create: `src/components/calculators/CardPerksCalculator/formatEarn.ts` (pure `formatEarn(card): string` used by `CardFactsTable.astro`; e.g. "2 Avios per £1 supermarkets, 1 elsewhere", cashback rendered as "1% cashback"; collapses to one clause when all four buckets share a rate) with `tests/calculations/card-perks-format-earn.test.ts` (three fixtures: uniform rate, mixed rates, cashback with tier2)

**Island layout (mirror `AviosDestinationFinder.tsx` structure and primitives: `ThemeProvider, Card, CalculatorHeader, Label, Input, Select, ButtonGroup, Toggle, Grid, Divider, Alert, MetricCard, Slider`, `ShareResults`, `useCalculatorBase` with slug `calc-card-perks` and `defaults = buildDefaultInputs(DEFAULT_ASSUMPTIONS)`; `compute = (inputs) => computeResults(inputs, CARDS)`; every numeric `Input` carries `min={0}` and the change handler clamps below 0 to 0):**
1. Card "Your spending": four `Input` fields (GBP per year) for the spend categories, `Input` for spend abroad, `Input` for lounge visits per year.
2. Card "Balance": `Toggle` "I clear my balance in full every month" (default on); `Input` carried balance shown only when off; an `Alert` (info) under it: "Interest wipes out rewards fast. The estimate charges the representative APR on the balance you carry."
3. Card "Assumptions" (collapsed `<details>` with a `summary` "Change the assumptions"): `ButtonGroup` horizon (Ongoing year / First year); `Slider` 0.5 to 2.0 step 0.1, label "Value of 1 airline point", help text "Applies to Avios, Membership Rewards and Virgin Points"; the slider writes the same pence value to all three keys of `pointValuePence`; other currencies keep the data defaults. `Input` lounge visit value, insurance value, voucher value. Under the voucher input, one line: "Default = Avios saved on a {VOUCHER_BENCHMARK.city} economy return, off-peak, from the Avios finder. Raise it if you would use it in a higher cabin." 
4. Results header: three `MetricCard`s: "Highest net value" (card name + GBP), "Cards compared" (ranked/total), "Your yearly spend".
5. Filter row: `MultiSelectChips` for types (from `../../ui`, promoted above), `Toggle` lounge only, `Toggle` no annual fee, `Select` sort (labels from `SORT_LABELS`).
6. Ranked table in `overflow-x-auto`: Rank | Card | Type | Rewards | Perks | Fees & costs | Net / yr. Each row has an expand button (`aria-expanded`, `aria-controls` pointing at the breakdown row id, `aria-label="Show breakdown for {card name}"`, `min-h-11 min-w-11`) that reveals the breakdown lines (rewards, welcome bonus with "not reached" when `bonusMissed`, lounge, insurance, voucher with "spend threshold not met" when `voucherMissed`, fee, FX, interest) plus `notes`, min income and the welcome-bonus eligibility note. Negative net values render with a minus sign plus an amber "Costs you" badge, the same treatment as the finder's "Over budget" badge (`AviosDestinationFinder.tsx:76-86`), so a loss is emphasised, never muted. Numeric cells: `text-right tabular-nums whitespace-nowrap pl-3` like `AviosPriceTable.astro`.
7. Empty state when filters hide everything: "No cards match these filters."
8. Footer of the island: `ShareResults` + "Copy link to this comparison" button that writes `paramsFromInputs` (same pattern as the finder's copy-link button); URL effect mirrors the finder (shared link wins over stored state on mount, `replaceState` on change).
9. Disclaimer line inside the island: "Estimates for the numbers you entered. We take no commission from any card issuer and this page has no application links. Not financial advice."

**`CardFactsTable.astro`:** props `{ rows: readonly CardProduct[]; caption: string }`. Columns: Card | Type | Annual fee (year 1 / ongoing) | Earn (`formatEarn(row)`, e.g. "2 Avios per £1 supermarkets, 1 elsewhere") | Welcome bonus (units + currency, "none") | FX fee | Lounge (network + visits) | Travel insurance | Section 75 | Verified | Source (domain of `sourceUrl` as plain text, no anchor). Sort rows by name. This is the crawlable table; no client JS.

**Page (`card-rewards-calculator.astro`):** copy the Avios page skeleton. `title` = "UK Credit Card Rewards & Perks Calculator: Amex vs Revolut vs Klarna"; `description` (159 chars, keep under 160) = "Compare UK cards by estimated net value for your spend: points, cashback, lounge access, fees and FX on credit, charge, debit and BNPL cards. Free, no sign-up."; `keywords` around credit card rewards calculator uk, amex vs revolut, klarna card vs credit card, best card for points uk (keywords only, never in copy), lounge access credit card uk; `canonicalURL` `/calculators/card-rewards-calculator`. Breadcrumbs, `SEOHead` with `howToSteps` (enter spend, set travel and balance, read the ranked table, check the issuer's terms), `estimatedTime="PT2M"`. Sections: Hero; island (`client:load`); "How the estimate works" (the formula in words with the assumption defaults and the point values from `pointValues.ts`, rendered from data); "Card facts, verified {DATA_LAST_VERIFIED}" with `CardFactsTable`; "What this calculator leaves out" (acceptance of Amex, credit checks, eligibility windows, guest fees, insurance excesses, EU and US cards); FAQ (5 items, data-driven where possible: which cards here have lounge access, which have no FX fee, what Section 75 covers, why Klarna and Revolut are not credit cards, how to value Avios) feeding `FAQPage` schema; `relatedCalculators`: Avios finder, currency converter, vacation budget, debt payoff. `<style is:global>` not needed.

**Copy test (add to `tests/components/card-perks-calculator.test.tsx`):** read the page `.astro` and island `.tsx` sources and assert neither matches `/best card|recommend|you should/i` and neither mentions `AffiliateBox`.

**e2e (`card-rewards.spec.ts`):** page loads with h1; ranked table has at least 20 rows; setting supermarkets spend to 20000 changes the first row's net value text; clicking the "Debit card" type chip reduces the row count; expand button reveals a breakdown; rendered DOM has zero `a[rel~="sponsored"]` and zero anchors whose host matches any `sourceUrl` host from `cards.ts` (import the data in the spec); overflow sweep at 375, 768, 1280 using the shared helper. The homepage pill test lives in Task 4.

**Steps:** write the component test first (fails), build the island, pass; build the facts table + page, `npm run build` succeeds; write the e2e spec; run `npx playwright test e2e/card-rewards.spec.ts e2e/avios-finder-overflow.spec.ts --project=chromium`. Report counts.

### Task 4: Registry, category, pill, llms, freshness (executor B)

**Files:**
- Modify: `src/lib/calculators.ts:50-64` (add `'Cards'` to `CategoryName`), the `CATEGORY_COLORS` map (add `Cards: 'category-badge-cards'`, matching however `Avios` is mapped), and the registry (new entry directly after the Avios entry):
  ```ts
  {
    title: 'UK Card Rewards & Perks Calculator',
    description: 'Compare Amex, Revolut, Klarna and 20+ UK cards by the estimated net value of points, cashback, lounges and perks for your own spending.',
    href: '/calculators/card-rewards-calculator/',
    icon: 'dollar',
    color: 'violet',
    category: 'Cards',
    country: 'UK',
    mostUsed: false,
  },
  ```
- Modify: `src/pages/index.astro:126-136` (pill block becomes a `flex justify-center gap-2 mb-3` row with two buttons; second button `category-btn category-btn-cards`, `data-category="Cards"`, label "Cards") and `:174` (`categories.filter((category) => category !== 'Avios')` becomes a filter on a local `const HERO_CATEGORIES = ['Avios', 'Cards']`)
- Modify: `src/styles/global.css:815-863` (comma-join `.category-btn-cards` / `.category-badge-cards` onto every `.category-btn-avios` / `.category-badge-avios` selector; update the comment to say two pills)
- Modify: `tests/lib/categories.test.ts` (add "has the card calculator as the only Cards calculator")
- Modify: `tests/seo/registry-guard.test.ts` (170 to 171 with a dated one-line note: "170 -> 171 on 2026-09-02: UK Card Rewards & Perks Calculator added at Keith's direction")
- Modify: `public/llms.txt` and `public/llms-full.txt` (entry after the Avios one, same format; `tests/seo/llms-registry-parity.test.ts` enforces this)
- Create: `e2e/homepage-cards-pill.spec.ts` (read the filter JS in `index.astro` first to learn how hidden cards are hidden; then: click the Cards pill, exactly one calculator card is visible and it links to the new page; `aria-pressed` flips; at 375 both pills are visible without the filter panel open)
- Create: `scripts/data/check-card-freshness.mjs` (reads `cards.ts`, regex `lastVerified: '(\d{4}-\d{2}-\d{2})'` next to each `id: '...'`, prints rows older than 120 days, exits 1 when any; `--days N` override)
- Create: `.github/workflows/card-data-freshness.yml` (adapt only the workflow shape from `avios-data-freshness.yml`: monthly cron, checkout, gated issue open/update titled "Card data older than 120 days - re-verify" on `steps.check.outcome == 'failure'`. Do not reuse its check step: that one runs `check-avios-sources.mjs` page fingerprinting, this one runs the age check script)
- Test: `tests/scripts/check-card-freshness.test.ts` (run the script's exported `staleRows(source, today, days)` on a small inline TS string: 0 stale when fresh, 1 stale when old)

**Steps:** categories test first (fails on missing Cards entry) then registry + union + colours; registry-guard bump; pill + CSS; llms entries; freshness script with its test; `npx vitest run tests/lib tests/seo tests/scripts` passes; `npm run build` succeeds; `npx playwright test e2e/homepage-cards-pill.spec.ts --project=chromium` passes (the new page from Task 3 may not exist yet; the pill test only needs the registry entry and the homepage). Screenshots not needed (orchestrator does visual QA).

---

## Wave 3 (orchestrator)

1. `npm run qa` (format, lint, all unit tests, build, postbuild). Expected: 0 lint errors (5 pre-existing warnings), all tests green, build complete.
2. `npx playwright test` (smoke + avios specs + card spec), chromium and firefox.
3. Visual QA: screenshots of the homepage pills at 375 and 1280, the card page at 375 and 1280, one expanded row, the facts table.
4. Commit per wave: `feat: card rewards calculator data and formula`, `feat: card rewards page, Cards pill, freshness check`.
5. Draft PR stacked on #26.

## Success criteria (per Karpathy rule 4)

| # | Criterion | Check |
|---|---|---|
| 1 | Formula matches the spec for every component | `card-perks-calculator.test.ts` green |
| 2 | Dataset has >= 20 verified rows, every row sourced and dated | `card-perks-dataset.test.ts` green + 5-row spot check |
| 3 | Page renders ranked table and static facts table | build output HTML contains both tables; e2e row count >= 20 |
| 4 | No affiliate, application or issuer links on the page | copy test green; e2e link assertions green; `grep -c 'rel="sponsored"' dist/calculators/card-rewards-calculator/index.html` = 0 |
| 5 | Cards pill next to Avios, rainbow, filters to one card | `homepage-cards-pill.spec.ts` green; screenshots |
| 6 | Registry 171, categories consistent | `registry-guard`, `categories` tests green |
| 7 | No horizontal overflow at 375/768/1280 | overflow sweep green |
| 8 | Freshness workflow present and script tested | `check-card-freshness.test.ts` green; workflow file validates in `actionlint` if installed, else YAML parse |
| 9 | Whole suite + build green | `npm run qa` exit 0; Playwright exit 0 |

## Out of scope (say so on the page and in the PR)

EU and US cards (registry `country` field is ready; second dataset later), live APR feeds, credit eligibility checks, guest lounge pricing, insurance excess modelling, Curve fee tiers beyond the published headline, `astro check` in CI (pre-existing gap).
