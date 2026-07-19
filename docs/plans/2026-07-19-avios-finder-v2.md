# Avios Destination Finder v2 Implementation Plan

> **For Claude:** Execute with subagent-driven development, one task per subagent, spec review then quality review after each.

**Goal:** Add real distances + value metrics, an 'All' chip, a modern peak-aware date-range calendar, richer sort options and columns, an insights strip, and automated source-freshness detection.

**Architecture:** All changes stay inside the existing static-island model. Real distance data is GENERATED into a separate `data/distances.ts` keyed by IATA (never edit `data/destinations.ts` - it is pinned verbatim by anchor tests). Peak-day logic moves to `data/peakCalendar.ts` so the calendar UI and the calculations share one definition.

**Tech stack:** Astro 5 + Preact + Tailwind 4, Vitest (jsdom), Playwright e2e, GitHub Actions.

**Branch:** `feat/avios-finder-v2` off master (256508d or later).

**Hard rules for every task:**
- NEVER edit `data/destinations.ts` or the anchor tests in `tests/calculations/avios-destination-finder.test.ts` anchor section. If an anchor test fails, the change is wrong, not the anchor.
- No em dashes in frontend strings or commit messages. Commit messages via file (`git commit -F`).
- Stage specific files only; never `git add -A`.
- All prices/data claims must trace to a source already cited in the repo or to the generator script output. No invented numbers.
- Keep `id="dateRange"`-style stable ids used by e2e specs in sync with `e2e/avios-finder-overflow.spec.ts`.

---

## Task 1: Real distance data + value metrics (calculation layer)

**Files:**
- Create: `scripts/data/build-avios-distances.mjs`
- Create (generated): `src/components/calculators/AviosDestinationFinder/data/distances.ts`
- Modify: `src/components/calculators/AviosDestinationFinder/types.ts`
- Modify: `src/components/calculators/AviosDestinationFinder/calculations.ts`
- Modify: `src/components/calculators/AviosDestinationFinder/data/peakCalendar.ts` (export shared peak-day helper)
- Test: extend `tests/calculations/avios-destination-finder.test.ts` (new describe blocks only; do not touch anchors)

**Generator script requirements (`build-avios-distances.mjs`):**
1. Download https://davidmegginson.github.io/ourairports-data/airports.csv (or accept a local path as argv[2] for offline runs).
2. Parse CSV with proper quoted-field handling (commas inside quotes exist).
3. Filter rows: `iata_code` non-empty AND `scheduled_service === "yes"` AND `type` in {`large_airport`, `medium_airport`}.
4. VERIFIED GOTCHA (2026-07-19): IATA codes are NOT unique in the raw file. Example: AUH matches Zayed International (OMAA, large_airport, scheduled yes) AND Aurora Municipal (KAUH, small_airport, scheduled no). After the filter above, if an IATA still maps to >1 row, prefer large_airport over medium_airport; if still ambiguous, EXIT 1 listing the conflicts. Never silently pick first match.
5. Extract the finder's IATA list by regex `iata: '([A-Z]{3})'` from `data/destinations.ts`. If any IATA is missing from the filtered CSV, EXIT 1 listing them.
6. Haversine great-circle distance in statute miles from London Heathrow using the CSV's own LHR row (verified 2026-07-19: EGLL, 51.470748, -0.459909). Round to nearest 10 miles (great-circle is not the flown route; false precision is dishonest).
7. Write `data/distances.ts`:
   - Header comment: source URL, fetch date, generator command (`node scripts/data/build-avios-distances.mjs`), rounding note.
   - `export const DISTANCE_MILES_FROM_LONDON: Readonly<Record<string, number>> = { ABZ: 400, ... };` (alphabetical by IATA, one per line).
8. Print a summary: count written, min/max city, and the LHR row it used (so the run is auditable).

**Type changes (`types.ts`):**
- `SortKey` becomes `'avios' | 'value' | 'cash' | 'peakSaving' | 'distance' | 'name'`.
- `DestinationResult` gains:
  - `readonly distanceMiles: number;`
  - `readonly valuePer1k: number;` // party miles flown per 1,000 Avios spent, 1dp
  - `readonly peakSavingPct: number | null;` // (peak - offPeak) / peak * 100, whole %, null unless both seasons priced
- `AviosFinderResult` gains `readonly voucherSavingAvios: number;` // Avios saved by the companion voucher on the CHEAPEST affordable row; 0 when voucher off, no travellers=2, or nothing affordable

**Peak helper move (`peakCalendar.ts`):**
- Add `export function isPeakIsoDate(iso: string): boolean` (build intervals once at module load).
- `calculations.ts` refactors its private `isPeakDay`/`PEAK_INTERVALS` to use it. One definition, shared later by the calendar UI.

**Calculation changes (`calculations.ts`):**
- Import `DISTANCE_MILES_FROM_LONDON`; `distanceMiles = DISTANCE_MILES_FROM_LONDON[d.iata]`. If undefined, THROW with the IATA (build-time data bug; tests catch it - never default to 0).
- `partyMiles = distanceMiles * legs * travellers` (both travellers fly; voucher does not change miles).
- `valuePer1k = round1dp(partyMiles / rankAvios * 1000)` (rankAvios > 0 always; guard divide-by-zero defensively anyway).
- `peakSavingPct = aviosPeak !== null && aviosOffPeak !== null ? Math.round((aviosPeak - aviosOffPeak) / aviosPeak * 100) : null`.
- Replace `distanceProxy` with real `distanceMiles` comparison. Delete the proxy function and its comment.
- New comparators: `value` DESC (ties: rankAvios ASC), `cash` ASC (ties: rankAvios ASC), `peakSaving` DESC with nulls LAST (ties: rankAvios ASC).
- `voucherSavingAvios`: for the cheapest affordable row (post-sort by the CURRENT sort this is wrong - compute from min rankAvios among affordable), recompute party totals with `companionVoucher: false` and subtract. 0 if voucher off or travellers !== 2 or no affordable rows.

**Tests (new describe blocks):**
- Every DESTINATIONS row has a distance entry > 0 (closes the regex-extraction loophole in the generator).
- Distance sanity anchors: include the verbatim CSV rows used, computed via an in-test haversine of hardcoded coordinates for LHR->JFK and LHR->SYD; assert table values within 1% of the in-test computation (self-consistent, no memory-sourced numbers).
- Value: voucher on (2 travellers) doubles valuePer1k vs voucher off for the same row.
- peakSavingPct null when date range is peak-only or off-peak-only.
- Sort orders: value DESC, cash ASC, peakSaving nulls last.
- voucherSavingAvios equals cheapest affordable row's no-voucher avios minus voucher avios; 0 cases covered.

**Commit:** `feat: real distances, value metrics and new sort keys for Avios finder`

---

## Task 2: 'All' chips for region and holiday filters

**Files:**
- Modify: `src/components/calculators/AviosDestinationFinder/MultiSelectChips.tsx`
- Modify: `AviosDestinationFinder.tsx` (pass the new prop)
- Test: create `tests/components/multi-select-chips.test.tsx`

**Spec:**
- New optional prop `allLabel?: string`. When set, render a leading chip with that label.
- The All chip is active (same active styling) when `selected.length === 0`; clicking it calls `onChange([])`. Clicking it while already active is a no-op (still call onChange([]) - harmless, idempotent).
- `aria-pressed` reflects active state like other chips.
- Enable in the finder: regions chip group gets `allLabel="All"`, holiday types gets `allLabel="All"` (consistency between the two adjacent groups).
- Tests: All active on empty selection; selecting a region deactivates All; clicking All clears selection and reactivates; aria-pressed correct.

**Commit:** `feat: All chip for region and holiday type filters`

---

## Task 3: New sort options, table columns and check-seats link

**Files:**
- Modify: `AviosDestinationFinder.tsx` (SORT_OPTIONS, ResultRow, table head)
- Test: extend `tests/components/` coverage if a ResultRow test exists; otherwise assert via calculations tests already added in Task 1.

**Spec:**
- SORT_OPTIONS (exact labels, this order):
  1. `avios` - "Fewest Avios first"
  2. `value` - "Best bang for your buck"
  3. `cash` - "Lowest cash co-pay"
  4. `peakSaving` - "Biggest off-peak saving"
  5. `distance` - "Shortest flights first"
  6. `name` - "A to Z"
- Table columns (in order): Destination | Off-peak Avios | Peak Avios | + cash from | Distance | Value | % of budget | Seats
  - Distance cell: `nf.format(distanceMiles)` + `mi` in muted small suffix; numeric styling matches existing cells (`text-right py-2 pl-3 tabular-nums whitespace-nowrap`).
  - Value cell: `valuePer1k.toFixed(1)`; `<th>` is `Value` with `title="Miles flown per 1,000 Avios - higher is better"` and visible small sub-caption in the header cell: `mi per 1k Avios`.
  - Seats cell: link "Check" -> `https://www.britishairways.com/travel/flightfinder/public/en_gb` with `target="_blank" rel="noopener nofollow"`, styled as accent link. One shared constant `BA_REWARD_FLIGHT_FINDER_URL` at top of file with a comment: BA blocks parameterised deep links for anonymous sessions (verified 2026-07-19); this is the official Reward Flight Finder entry page.
- The table is already inside `overflow-x-auto`; extra columns scroll horizontally on narrow screens. Do NOT let the table force the card wider (e2e overflow spec guards this).
- Update the results-table `aria-label` to mention it is sortable by the dropdown.

**Commit:** `feat: value, cash and peak-saving sorts plus distance and seats columns`

---

## Task 4: Peak-aware date-range calendar

**Files:**
- Create: `src/components/calculators/AviosDestinationFinder/DateRangePicker.tsx`
- Modify: `AviosDestinationFinder.tsx` (replace the two native date inputs)
- Modify: `e2e/avios-finder-overflow.spec.ts` (anchor + popover sweep)
- Test: create `tests/components/date-range-picker.test.tsx`

**Spec (component):**
- Single trigger button `id="dateRange"` (Label `htmlFor="dateRange"`), full width of its grid column, styled like `Input` (same border/radius/bg classes). Shows `Any dates` when unset, else `12 Aug 2026 - 26 Aug 2026` (en-GB short format). A small inline clear button (aria-label "Clear travel dates") appears when set; clearing resets both to ''.
- Clicking opens a popover (absolutely positioned below the trigger, `z-20`, card-styled: `bg-[var(--color-night)] border border-white/10 rounded-xl shadow-xl p-4`). On viewports < 480px the popover is `fixed inset-x-4` centered to stay on-screen.
- One month shown at a time. Header: prev/next month buttons (aria-labels), month+year title. Range: first day click sets start, second sets end; clicking a day before the start restarts the range at that day. Selecting an end closes nothing - user clicks Done.
- Footer: legend dot amber + "BA peak pricing", buttons "Clear" and "Done".
- Peak days: `isPeakIsoDate` from `data/peakCalendar.ts` -> amber tint (`bg-amber-500/20 text-amber-200`); selected range -> accent (`tokens.bg600` endpoints, `bg-white/10` in-range); today outlined. Days before today disabled (`opacity-40`, not clickable). Navigation bounded: current month to Dec 2027.
- Emits ISO `yyyy-mm-dd` strings via `onChange(dateFrom, dateTo)`; parent wiring keeps `updateInput('dateFrom'|'dateTo', ...)` semantics and localStorage persistence unchanged. Compute layer untouched.
- Accessibility: popover `role="dialog"` `aria-label="Choose travel dates"`; day grid `role="grid"` with weekday column headers; each day a real `<button>` with `aria-label` like "12 August 2026, peak pricing"; Escape closes and returns focus to trigger; click-outside closes; arrow keys move day focus (roving tabindex), Enter selects. Weeks start Monday (UK site).
- No new dependencies. Hand-rolled; date math in UTC to avoid DST drift (reuse the `Date.parse(iso + 'T00:00:00Z')` idiom from calculations.ts).

**e2e updates (`avios-finder-overflow.spec.ts`):**
- Replace `#dateFrom` / `#dateTo` waits with `#dateRange`.
- Anchor comment update. Add to each viewport test: click `#dateRange`, assert the dialog's bounding box fits inside the viewport (right <= clientWidth, left >= 0), press Escape.

**Unit tests (jsdom):**
- Renders `Any dates` for empty values; formatted label for set values.
- Click day A then day B (B after A) -> onChange called with ISO A, B.
- Click day B before current start -> restarts range.
- Peak day carries the amber class (pick a date inside a known `PEAK_RANGES_2026` interval, cite it in a comment); off-peak day does not.
- Clear resets to ('', '').
- Escape closes the dialog.

**Commit:** `feat: peak-aware date range calendar replaces native date inputs`

---

## Task 5: Insights strip and voucher savings callout

**Files:**
- Modify: `AviosDestinationFinder.tsx`
- Test: logic is covered by Task 1 calc tests; add a component render test only if trivial.

**Spec:**
- When `result.affordable.length > 0`, render a second `Grid responsive={{ sm: 1, md: 3 }}` of MetricCards directly under the existing three:
  1. "Cheapest trip" - city, `value={nf.format(min rankAvios)} Avios`, sublabel country.
  2. "Best bang for your buck" - city with max valuePer1k, `value=${valuePer1k.toFixed(1)} mi/1k`, sublabel `${nf.format(distanceMiles)} mi each way`.
  3. "Furthest you can fly" - city with max distanceMiles among affordable, value `${nf.format(distanceMiles)} mi`, sublabel `${nf.format(rankAvios)} Avios`.
  (Compute via simple reduce over result.affordable in the component - no new calc exports needed.)
- Voucher callout: when `inputs.companionVoucher && result.voucherSavingAvios > 0`, the existing "Your budget" MetricCard sublabel becomes `Voucher saves ${nf.format(result.voucherSavingAvios)} Avios vs paying for 2 seats`.
- All copy: no em dashes.

**Commit:** `feat: insights strip and voucher savings callout`

---

## Task 6: Source data freshness automation

**Files:**
- Create: `scripts/data/check-avios-sources.mjs`
- Create: `scripts/data/avios-source-hashes.json`
- Create: `.github/workflows/avios-data-freshness.yml`
- Modify: `src/components/calculators/AviosDestinationFinder/data/peakCalendar.ts` (checklist comment gains: "freshness workflow will flag source drift")

**Spec (script):**
- Sources checked: the HfP pricing article URL and the AwardWallet peak-calendar URL already cited in the data file headers (read them from those headers or hardcode with a comment pointing at the headers).
- For each: fetch with a browser-ish User-Agent, extract `<main>`/article text, strip whitespace/scripts, SHA-256.
- Compare to `avios-source-hashes.json` (`{ url, sha256, capturedAt }` entries).
- Drift -> print a clear summary and exit 1. Fetch failure/non-200/blocked -> print "skipped (unreachable)" and exit 0 (a blocked fetch is not evidence of change; never false-alarm).
- `--update` flag rewrites the baseline file (used once now, and after each manual re-verification).

**Workflow:**
- Monthly cron (`0 6 1 * *`) + `workflow_dispatch`.
- Runs the script; on failure creates or comments on an issue titled "Avios source data may have changed - re-verify" using `gh` + `GITHUB_TOKEN` (guard: only one open issue; comment if exists).
- Honest framing in the issue body: guide prices change rarely (annual-ish); this is drift DETECTION, the fix is the manual re-verification checklist in `data/peakCalendar.ts`.

**Local verification:** run the script once with `--update` to seed real hashes; run again to confirm exit 0.

**Commit:** `feat: monthly source freshness check for Avios data`

---

## Task 7: Page content updates (SEO/AEO follow-through)

**Files:**
- Modify: `src/pages/calculators/avios-destination-finder.astro`

**Spec:**
- Add Distance column (miles, from `DISTANCE_MILES_FROM_LONDON`, same import pattern as the island - single source, build fails if missing) to the popular-destinations static table AND the full A-Z `<details>` table.
- Add one FAQ: "What does best bang for your buck mean?" - explain miles flown per 1,000 Avios using a real data-driven example (compute from the dataset in frontmatter like the existing data-driven FAQs; no hardcoded numbers).
- Mention the peak-calendar date picker in the how-it-works copy (one sentence).
- Keep description/canonical unchanged.

**Commit:** `feat: distance column and value FAQ on finder page`

---

## Plan-review amendments (BINDING - applied 2026-07-19 after opus review)

1. **Task 4 e2e:** `collectOverflow` in `e2e/avios-finder-overflow.spec.ts` hard-codes `document.querySelector('#dateFrom')` (line ~39) and its throw message - change the internal anchor AND the waits to `#dateRange`.
2. **Task 4 popover positioning:** `Card.tsx` applies `overflow-hidden`, so an `absolute` popover is clipped at md+ widths inside the card. Use `position: fixed` at ALL widths: on open, read the trigger's `getBoundingClientRect()`, place the popover below it clamped to the viewport (`left = clamp(rect.left, 8, clientWidth - popWidth - 8)`); close on scroll or resize. e2e must assert the dialog is NOT clipped: dialog bounding box width >= 280px AND the last weekday header cell is fully inside the viewport (a card-clipped dialog shrinks, so viewport-containment alone is blind to this failure).
3. **Task 1 build-time gate:** a missing IATA must fail `astro build`, not just vitest (deploy path runs no tests). `distances.ts` exports `assertDistanceCoverage(destinations: readonly {iata: string, city: string}[]): void` (throws listing gaps); the astro page frontmatter (Task 7) calls it, and its A-Z distance cells use a throwing lookup helper. Keep the runtime throw in calculations.ts as backstop.
4. **Task 6 fingerprint:** do NOT hash whole-article text (ads/comments churn = monthly false alarms). Fingerprint = sorted unique numeric tokens (digits, commas stripped) extracted from `<table>` elements only on the HfP page, and from the article body on the AwardWallet page filtered to date-like and price-like tokens. If no `<table>` found in the fetched HTML, treat as "skipped (page shape changed)" exit 0 with a notice, not drift.
5. **Task 1 peakSaving comparator:** explicit null-safe total order - both null -> 0 then rankAvios ASC; a null -> a last; b null -> b last; else `b.peakSavingPct - a.peakSavingPct`, ties rankAvios ASC. Never rely on `null - number` coercion.
6. **Task 4 back-navigation:** month navigation lower bound = `min(current month, month of dateFrom if set)` so a persisted past range stays reachable and re-editable; upper bound Dec 2027 unchanged.
7. **Task 4 a11y:** popover gets `aria-modal="false"` (non-modal popover, click-outside dismiss, no focus trap).
8. **Task 4 today cutoff:** "days before today disabled" uses the LOCAL calendar date for the cutoff; peak classification stays UTC-based via `isPeakIsoDate`.

## Final gate

1. `npm run qa` (format:check + lint + vitest + build + postbuild link checks) green.
2. `npx playwright test e2e/avios-finder-overflow.spec.ts --project=chromium` green (includes new popover sweep).
3. Whole-branch review by opus subagent against this plan + repo CLAUDE.md.
4. PR with test plan, CI green, merge, verify live.
