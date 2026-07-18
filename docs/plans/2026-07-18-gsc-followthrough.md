# GSC Follow-through (6 Workstreams) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the 2026-07-18 GSC review into shipped changes across six workstreams: backlink execution (A), striking-distance push (B), events-cluster build-out (C), 2026/27 tax-year refresh (D), technical SEO trio (E), and the explicit no-new-calculators guard rail (F).

**Architecture:** Static Astro 5 site (no backend). Code workstreams are verifier-first: each mechanical sweep (trailing-slash links, em-dash titles) first lands a deterministic checker that fails on the current tree, then a codemod makes it pass, and the checker stays wired into `npm run qa` so the class of defect cannot recur. Content workstreams reuse the existing `relatedCalculators` prop and guide-page patterns. The backlink workstream is ops (docs + outreach), split into [CLAUDE] drafting tasks and [KEITH] account-holding tasks.

**Tech Stack:** Astro 5, Preact, Tailwind 4, TypeScript, Vitest (`npm test`), Playwright (`npm run test:e2e`), husky + lint-staged pre-commit, Node 18+ ESM scripts in `scripts/`.

---

## Context: verified facts (all read from the repo / GSC export this session)

- **Baseline (28d to 2026-07-18):** 59 clicks / 50,801 impressions / 168 pages. Clicks concentrate in the events niche: party-drink 12 (pos 8.7), graduation-party 7 (9.7), event-seating 6 (21.9), conference-room 3 (16.6), coffee-spend 3 (7.8). Full data: `docs/gsc-analysis-2026-07-18.md` + `gsc-export/2026-07-18/`.
- **Striking-distance set (page-level pos 10-20, zero clicks):** see table in Workstream B. Their visible query rows are nearly empty — impressions sit on anonymized queries — so the lever is internal links + content depth, NOT title keyword tweaks.
- **Link mechanism:** `CalculatorLayout.astro` accepts a `relatedCalculators?: RelatedCalculator[]` prop (`src/layouts/CalculatorLayout.astro:29`; interface fields `title`, `description`, `href`, `icon`, `color` — color enum at line 21). Only 15 pages currently pass it (the Jul-3 pass pages). Guide pages use local `calculators` arrays (see `src/pages/guides/best-wedding-event-calculators.astro`).
- **Trailing slash:** `astro.config.mjs` sets `trailingSlash: 'always'`; Cloudflare 308-redirects the non-slash form. But internal links are emitted slash-less: 186 `href="/calculators/..."`-style literals across 36 files, plus `href: '/...'` object fields in `src/lib/calculators.ts` (167 entries), `relatedCalculators` arrays, guide arrays, and breadcrumbs. Every internal crawl hop currently eats a 308. Review additions (R1): `BaseLayout.astro:287-520` emits slash-less footer/nav links (`/about`, `/for-business`, `/privacy-policy`, `/terms`, `/contact`, `/affiliate-disclosure`) on every page, and `CalculatorLayout.astro:60` GENERATES breadcrumb `href: canonicalURL` from the slash-less const — a codemod over source literals can never reach that; the layout itself must normalize.
- **CRITICAL exception:** page-level `const canonicalURL = '/calculators/foo'` consts are DELIBERATELY slash-less — `BaseLayout`/`SEOHead` normalize centrally (project CLAUDE.md). The codemod must not touch them.
- **Em dashes:** 100+ files in `src/pages` have `const title`/`title =` strings containing `—` (grep hit the 100-file display limit). House style (Stop Slop): no em dashes in frontend strings. The Jul-3 pass fixed only its touched pages, replacing `A — B` with `A: B`.
- **Tax year:** 107 occurrences of `2025/26` across 27 `src/pages` files (list in Workstream D). Current UK tax year is 2026/27 (since 6 Apr 2026). Jul-3 note: CGT rates/AEA verified identical across both years; everything else needs per-figure verification. Do NOT bulk find-and-replace. Review additions (R3): 30 MORE occurrences across 10 `src/components` files — UKTaxCalculator, UKEmployerCostCalculator, UKCapitalGainsTaxCalculator, UKRedundancyPayCalculator, NurseryCostCalculator (calculations.ts / types.ts / tsx — the actual logic constants) — plus `public/llms-full.txt` (verified stale) and `public/.well-known/brand-facts.json` (check at execution). UKTax, UKEmployerCost, UKCGT, and NurseryCost have NO calculation test files today.
- **Backlink assets that already exist:** `BACKLINK-STRATEGY.md` (execution rules: relevance first, no exact-match anchor stuffing, log live links to `REVENUE.md`; Reddit strategy SCRAPPED — do not revive), `docs/backlink-sprint-2026-03.md` (5 opportunities per target page + pitch templates), `docs/directory-submissions.md` (tracker: awesome-calculators DONE via PR #27; AlternativeTo, SaaSHub, Product Hunt, BetaList, Indie Hackers TODO with copy drafted), `docs/product-hunt-launch.md`, `docs/outreach/`. `REVENUE.md` exists at repo root.
- **Journalist platforms (verified via web search 2026-07-18):** HARO shut down Dec 2024, revived by Featured.com Apr 2025. Current working set: Qwoted, Featured, Source of Sources, #JournoRequest on X.
- **Events hub:** `src/pages/guides/best-wedding-event-calculators.astro` lists 7 calculators (wedding-budget, wedding-alcohol, party-drink, catering, birthday-party, graduation-party, event-seating). Missing from the list: conference-room, holiday-dinner, bbq. Schema `ItemList` derives from the array (`calculators.length`), so extending the array auto-updates schema.
- **Git state:** branch `master`, dirty: `SEO-ROADMAP.md` (modified this session) + untracked `docs/gsc-analysis-2026-07-18.md`, `gsc-export/`. Other untracked files (`.gstack/`, `CALC-BUILD-STATUS.md`, `lh-*.json`, `scripts/create_videos.py`, `scripts/seo/output/`) are pre-existing — leave them alone.
- **Commands:** `npm run qa` = format:check + lint + test + build. `npm run build` runs prebuild (OG images + shared-data validation) first. Commit messages: conventional prefix, NO em dashes, write with the Write tool and use `git commit -F <file>` (PowerShell pipes inject BOM).

## Execution order

1. Task 0 (branch + baseline commit)
2. Workstream E code tasks (verifier + sweeps) — do these FIRST so later content edits land on the post-sweep normalized strings
3. Workstream D (tax refresh)
4. Workstream B (striking set), Workstream C (events cluster)
5. Workstream A runs in parallel from day 1 (ops; [KEITH] gates)
6. Final task: roadmap/memory writeback

## Non-goals (Workstream F — binding)

- **NO new calculators.** Query-demand coverage was checked signal-by-signal on 2026-07-18 (Scotland LBTT, buy-vs-lease, compound interest, ideal gas law, debt avalanche, 100k trap) — all covered. Registry count stays 167. This is recommendation #5 ("Add: nothing") made explicit.
- No programmatic "X% off $Y" pages (those queries rank pos 9-11 with zero clicks — Google answers inline; also scaled-content-abuse risk).
- No Reddit link drops (SCRAPPED in `BACKLINK-STRATEGY.md`).
- Do not touch `canonicalURL` consts, `/embed/` routes, `src/lib/affiliates.ts`, or AdSense placement.
- No paywalling, no financial-advice wording (project CLAUDE.md rules 1 and 3).
- Meta-description em-dash cleanup deferred — this pass covers titles only (R6).
- Content deepening for the five sub-20-impression striking pages deferred to the next GSC window — links-only now (R5).

---

## Task 0: Branch + baseline commit

**Files:**
- Commit: `SEO-ROADMAP.md` (already modified), `docs/gsc-analysis-2026-07-18.md`, `docs/plans/2026-07-18-gsc-followthrough.md` (this file)

**Step 1:** Verify branch state (NEVER assume):
```bash
git branch --show-current   # expect: master
git status --short          # expect: M SEO-ROADMAP.md, ?? docs/gsc-analysis-2026-07-18.md, ?? gsc-export/, ...
```

**Step 2:** Create the feature branch:
```bash
git checkout -b feat/gsc-jul18-followthrough
```

**Step 3:** Stage ONLY the three named files (never `git add -A`):
```bash
git add SEO-ROADMAP.md docs/gsc-analysis-2026-07-18.md docs/plans/2026-07-18-gsc-followthrough.md
```

**Step 4:** Write commit message to a temp file with the Write tool, then:
```bash
git commit -F <msgfile>
```
Message: `docs: GSC review 2026-07-18 findings, roadmap update, follow-through plan`

**Step 5:** Verify the commit landed and hooks did not revert anything: `git show --stat HEAD`.

---

## Workstream E: technical SEO trio (verifier-first)

### Task E1: Internal-link trailing-slash checker (write it, watch it fail)

**Files:**
- Create: `scripts/seo/check-internal-links.mjs`

**Step 1:** Write the checker. Complete code:

```js
#!/usr/bin/env node
// Fails the build if any internal <a href> in dist/ emits the slash-less
// URL form (Cloudflare 308s it; canonical is trailingSlash:'always').
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const offenders = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith('.html')) checkFile(p);
  }
}

function checkFile(file) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
    const raw = match[1];
    if (raw.startsWith('//')) continue; // protocol-relative external
    const href = raw.replace(/[#?].*$/, ''); // strip fragment/query, THEN check the path (R1)
    if (href === '/' || href === '') continue;
    if (/\.[a-z0-9]+$/i.test(href)) continue; // asset files (.xml, .webp, .txt, ...)
    if (href.startsWith('/embed')) continue;
    if (!href.endsWith('/')) offenders.push(`${path.relative(DIST, file)}: ${raw}`);
  }
}

walk(DIST);
if (offenders.length > 0) {
  console.error(`FAIL: ${offenders.length} internal hrefs missing trailing slash`);
  for (const o of offenders.slice(0, 40)) console.error(`  ${o}`);
  if (offenders.length > 40) console.error(`  ...and ${offenders.length - 40} more`);
  process.exit(1);
}
console.log('OK: all internal hrefs use the trailing-slash canonical form.');
```

**Step 2:** Build and run it — it MUST fail on the current tree:
```bash
npm run build
node scripts/seo/check-internal-links.mjs
```
Expected: `FAIL: <several hundred> internal hrefs missing trailing slash`, exit code 1. (186 source literals × many pages, plus registry-driven links.) If it passes here, the checker is wrong — stop and fix the checker.

**Step 3:** Commit the checker alone: `feat: add dist internal-link trailing-slash checker`

### Task E2: Pre-codemod safety audit

**Step 0 (R9):** Read `scripts/validate-shared-data.mjs` and `scripts/generate-og-images.mjs` — both run in `prebuild` and consume registry/page data. Confirm neither asserts slash-less href shapes or parses hrefs positionally. If either does, update it in the same commit as Task E3.

**Step 1:** Grep for code that COMPARES hrefs (a naive rewrite would break equality checks). Include template-literal consumption (`${...href}` concatenation), not just equality (R9):
```bash
grep -rn ".href ===" src/ ; grep -rn ".href ==" src/ ; grep -rn "startsWith('/calculators" src/ ; grep -rn '{c.href}\|{calc.href}\|\.href}`' src/
```
Expected: zero or a handful of hits. For each hit, note whether adding a trailing slash to registry values changes behavior (e.g. active-nav highlighting, embed allowlist keyed by href in `src/lib/embeds.ts`). Read `src/lib/embeds.ts` and check whether embed config is keyed on calculator `href` values.

**Step 2:** If any comparison site is found, list it in the commit message of Task E3 and normalize BOTH sides there (compare with `.replace(/\/$/, '')` or update the literal). Do not proceed blind.

### Task E3: Trailing-slash codemod + fix to green

**Files:**
- Create: `scripts/codemods/add-trailing-slash.mjs`
- Modify: `src/lib/calculators.ts`, the 36 files with `href="..."` literals, `relatedCalculators` arrays, guide `calculators` arrays, breadcrumb objects

**Step 1:** Write the codemod. Complete code:

```js
#!/usr/bin/env node
// One-time codemod: ALL internal extensionless links -> trailing-slash form
// (R1: /about, /terms etc. from BaseLayout are in scope, not just
// /calculators|/guides). Touches href="..." attributes and href: '...'
// object fields only; skips /embed routes. Never matches canonicalURL
// consts (different syntax).
import fs from 'node:fs';
import path from 'node:path';

const FILE_RE = /\.(astro|ts|tsx)$/;
const RULES = [
  [/href="(\/(?!embed\b)[a-z0-9-]+(?:\/[a-z0-9-]+)*)"/g, 'href="$1/"'],
  [/href: '(\/(?!embed\b)[a-z0-9-]+(?:\/[a-z0-9-]+)*)'/g, "href: '$1/'"],
];

let filesChanged = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (FILE_RE.test(entry.name)) rewrite(p);
  }
}
function rewrite(file) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [re, sub] of RULES) after = after.replace(re, sub);
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    filesChanged += 1;
    console.log(`rewrote ${file}`);
  }
}
walk('src');
console.log(`${filesChanged} files changed`);
```

**Step 2:** Run it: `node scripts/codemods/add-trailing-slash.mjs`. Expected: ~45-55 files changed (36+ literal files incl. `BaseLayout.astro`, registry, related arrays).

**Step 3:** Review the diff — spot-check `git diff src/lib/calculators.ts | head -40` and confirm NO `canonicalURL` lines changed: `git diff | grep canonicalURL` → empty.

**Step 3b (R1): Fix the GENERATED hrefs the codemod cannot reach.** Create `src/lib/url.ts`:

```ts
export function withTrailingSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`;
}
```

In `CalculatorLayout.astro`, import it and change the breadcrumb at line 60 to `{ name, href: withTrailingSlash(canonicalURL) }` (line 59's `href: '/'` is already canonical). Then grep both layouts for any other `href={...}` fed by a slash-less variable and route it through the helper. Do NOT touch the `BaseLayout`/`SEOHead` canonical/schema normalization — that is a separate, working mechanism.

**Step 4:** Rebuild and re-run the checker to green:
```bash
npm run build && node scripts/seo/check-internal-links.mjs
```
Expected: `OK: all internal hrefs use the trailing-slash canonical form.` If residual offenders remain (template-literal hrefs the codemod could not match), fix them by hand with targeted Edits and re-run until green.

**Step 5:** Full gate: `npm run qa`. Expected: format, lint, 160+ test files, build all pass. If prettier reformats codemod output, run `npm run format` first.

**Step 6:** Commit (codemod + all rewrites + checker wiring in one commit):
- Modify `package.json` scripts: add `"postbuild": "node scripts/seo/check-internal-links.mjs"` so every `npm run build` (and therefore `qa` and CI) enforces the invariant.
- Message: `fix: emit trailing-slash internal links sitewide and enforce via postbuild check`

### Task E4: Em-dash SERP-string verifier (write it, watch it fail)

**Files:**
- Create: `tests/seo/no-em-dashes.test.ts`
- Create: `tests/seo/registry-guard.test.ts` (R8 — replaces the brittle grep guard: import the calculators registry array from `src/lib/calculators.ts` — check the actual export name before writing the import — and assert `registry.length === 167`)

**Step 1:** Write the failing test. Scope (R6): page `const title` declarations + the registry file only; meta descriptions are DEFERRED (see Non-goals). Complete code:

```ts
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const EM = '—';

function collectAstroFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) collectAstroFiles(p, out);
    else if (entry.name.endsWith('.astro')) out.push(p);
  }
  return out;
}

describe('SERP-visible strings contain no em dashes (house style)', () => {
  it('page title consts are em-dash free', () => {
    const offenders: string[] = [];
    for (const file of collectAstroFiles('src/pages')) {
      const src = readFileSync(file, 'utf8');
      const decls = src.match(/const title\s*=[^;]*;/gs) ?? [];
      if (decls.some((d) => d.includes(EM))) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it('calculator registry is em-dash free', () => {
    expect(readFileSync('src/lib/calculators.ts', 'utf8').includes(EM)).toBe(false);
  });
});
```

**Step 2:** Run it: `npx vitest run tests/seo/no-em-dashes.test.ts`. Expected: FAIL with 100+ offender files listed. If it passes, the regex is wrong — stop and fix.

**Step 3:** Commit the failing test is NOT allowed (husky runs tests? verify: pre-commit runs lint-staged only, so committing is safe — but keep the test and the sweep in one commit anyway; proceed to E5 without committing).

### Task E5: Em-dash codemod + fix to green

**Files:**
- Create: `scripts/codemods/strip-title-em-dashes.mjs`
- Modify: ~100+ `src/pages/**/*.astro` title consts, `src/lib/calculators.ts` if hit

**Step 1:** Write the codemod. Transform rules (matching the Jul-3 hand-edit convention; titles ONLY per R6):
- In `const title = '...'` strings: ` — ` → `: ` when the title has no `:` before the dash, else ` - `
- Touch ONLY the title const declaration per file, nothing else (descriptions, FAQ, and content prose are out of scope this pass).

Complete code:

```js
#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.astro')) out.push(p);
  }
  return out;
}

let changed = 0;
for (const file of walk('src/pages')) {
  const src = fs.readFileSync(file, 'utf8');
  const next = src.replace(/const title\s*=[^;]*;/gs, (decl) => {
    if (!decl.includes('—')) return decl;
    if (!decl.slice(0, decl.indexOf('—')).includes(':')) {
      return decl.replace(/\s*—\s*/g, ': ');
    }
    return decl.replace(/\s*—\s*/g, ' - ');
  });
  if (next !== src) {
    fs.writeFileSync(file, next, 'utf8');
    changed += 1;
  }
}
console.log(`${changed} files changed`);
```

**Step 2:** Run it, then review: `git diff --stat` (expect ~100 files) and eyeball 10 random diffs for double-colon or spacing artifacts; hand-fix any with targeted Edits.

**Step 3:** Re-run the verifier to green: `npx vitest run tests/seo/no-em-dashes.test.ts` → PASS. Then `npm run qa` → all green (prettier may need `npm run format` first).

**Step 4:** Commit test + codemod + sweep in its OWN commit (nothing else mixed in, so the sitewide title diff is reviewable in isolation): `fix: replace em dashes in page titles per house style`

### Task E6 [KEITH]: Bing Webmaster Tools (Phase 1 leftover)

No code. Steps for Keith (accounts/credentials are Keith-only):
1. Go to bing.com/webmasters, sign in, choose **Import from Google Search Console** (imports the verified `sc-domain:boring-math.com` property and sitemap in one step).
2. Confirm `https://boring-math.com/sitemap-index.xml` is listed after import.
3. Tick the Phase 1 checkbox in `SEO-ROADMAP.md` (Claude does the doc edit in the final task).

Why: Bing index feeds Copilot and ChatGPT browsing answers — cheap AEO reach.

### Task E7 (optional, reviewer may strike): stop tracking raw GSC exports

**Files:**
- Modify: `.gitignore`

`gsc-export/` (25k-row JSON dumps) and `scripts/seo/output/` are untracked build/data artifacts. Add both to `.gitignore` so `git status` stays readable. Analysis reports in `docs/` remain tracked. Commit: `chore: gitignore gsc-export and seo output artifacts`

---

## Workstream D: 2026/27 tax-year refresh (27 files, 107 occurrences)

**Rules for every task in this workstream:**
- Verify EVERY figure against the live GOV.UK/devolved source at execution time. Do not trust memory, do not trust this plan for figures — the plan deliberately contains none.
- A file is only "refreshed" when: figures verified for 2026/27, year strings updated, FAQ/copy claims re-checked, and the matching `tests/calculations/*.test.ts` still passes (update test constants in the SAME commit if a threshold changed).
- If a 2026/27 figure CHANGED from 2025/26, the calculator logic constant (in `src/components/calculators/<Name>/` or shared data) changes too — grep for the old figure before editing copy.
- No financial-advice wording (project CLAUDE.md rule 3). While in each file, remove advice-flavoured phrasing.

**Verification sources by group:**
| Group | Files (occurrence count) | Source of truth |
|---|---|---|
| D1 Income tax + NI | `uk-tax-calculator.astro` (14), `uk-salary-sacrifice-calculator.astro` (2), `uk-dividend-tax-calculator.astro` (2), `uk-tax/index.astro` (7), `guides/best-uk-tax-calculators-2026.astro` (8), `guides/salary-sacrifice-uk-guide.astro` (4), `guides/uk-100k-tax-trap-explained.astro` (4) | gov.uk income-tax rates, NI rates, dividend allowance; Scottish bands via gov.scot |
| D2 Property taxes | `sdlt-calculator.astro` (3), `uk-stamp-duty-calculator.astro` (2), `stamp-duty-calculator-wales.astro` (2), `stamp-duty-calculator-scotland.astro` (2), `uk-tax/stamp-duty.astro` (8), `ads-calculator.astro` (2), `uk-tax/additional-dwelling-supplement-explained.astro` (2), `guides/best-uk-property-calculators-2026.astro` (1) | gov.uk SDLT rates; revenue.scot LBTT + ADS; gov.wales LTT |
| D3 IHT / CGT / pension | `inheritance-tax-calculator.astro` (1), `uk-capital-gains-tax-calculator.astro` (6), `guides/best-uk-investment-tax-calculators.astro` (5), `uk-pension-calculator.astro` (4), `guides/best-uk-pension-calculators-2026.astro` (1) | gov.uk IHT thresholds (re-check the "frozen until at least April 2028" FAQ claim), CGT rates + AEA (Jul-3 note says unchanged — re-verify, then this group is mostly year-string edits), pension annual allowance |
| D4 Employment misc | `uk-employer-cost-calculator.astro` (10), `uk-redundancy-pay-calculator.astro` (9), `uk-child-benefit-calculator.astro` (2), `uk-holiday-entitlement-calculator.astro` (2) | employer NI rates; statutory redundancy weekly-pay cap (changes every 6 April — HIGH likelihood of a real figure change); HICBC thresholds |
| D5 Copy-only mentions | `brand-facts.astro` (2), `guides/best-car-transport-calculators.astro` (1), `guides/best-math-everyday-calculators.astro` (1) | n/a (year-string context check only) |

### Task D0 (R3): Full inventory + figure-pinning tests FIRST

**Files:**
- Create: `tests/calculations/uk-tax.test.ts`, `tests/calculations/uk-employer-cost.test.ts`, `tests/calculations/uk-capital-gains-tax.test.ts`, `tests/calculations/nursery-cost.test.ts`

**Step 1:** Authoritative inventory: `grep -rn "2025/26" src/ public/`. This covers the 27 `src/pages` files in the table below PLUS the 10 `src/components` files holding the actual logic constants (UKTaxCalculator, UKEmployerCostCalculator, UKCapitalGainsTaxCalculator, UKRedundancyPayCalculator, NurseryCostCalculator) and `public/llms-full.txt`; also check `public/.well-known/brand-facts.json`. NurseryCostCalculator was absent from the original D1-D5 grouping — fold it into D1.
**Step 2:** For the four calculators with NO existing test file (UKTax, UKEmployerCost, UKCGT, NurseryCost): write a calculation test that PINS the current outputs from the current constants (known inputs → exact expected outputs, matching the style of `tests/calculations/uk-salary-sacrifice.test.ts`). Run each: `npx vitest run tests/calculations/<name>.test.ts` → PASS against today's code. `npm run build` cannot detect numerically wrong tax logic; these tests are the only guard.
**Step 3:** Commit: `test: pin UK tax calculator outputs before 2026/27 refresh`
**Step 4:** Only AFTER this commit do the D1-D5 figure edits begin. When a 2026/27 figure changes, update the constant AND the pinned expectation in the same commit, citing the GOV.UK source in the commit body.

### Task D-pattern (repeat per group D1..D5, one commit per group)

**Step 1:** For each file in the group AND its calculator components (`src/components/calculators/<Name>/` — calculations.ts, types.ts, tsx): `grep -n "2025/26"` and read each hit in context. Group D5 also covers `public/llms-full.txt` and `public/.well-known/brand-facts.json`.
**Step 2:** WebFetch the source-of-truth page(s); record the verified 2026/27 figure next to each claim.
**Step 3:** Edit figures + year strings + titles (`2025/26` → `2026/27` ONLY where the surrounding claim is verified true for 2026/27).
**Step 4:** If a figure changed: update the calculator component constant and the matching test in `tests/calculations/`, run `npx vitest run tests/calculations/<name>.test.ts` → PASS.
**Step 5:** In D1, additionally fix the 100k-trap page's advice-flavoured wording ("consider asking your employer...") to neutral informational phrasing.
**Step 6:** `npm run build` → clean. Commit: `fix: refresh <group> figures and copy for 2026/27 tax year`
**Step 7:** After all five groups: `grep -rn "2025/26" src/` → expect ONLY intentional historical references (e.g. "in the 2025/26 year the threshold was..."). List survivors in the final commit message.

---

## Workstream B: striking-distance push (10 pages, pos 10-20 → page 1)

**Mechanism (per the Context facts):** these pages' impressions are on hidden long-tail queries, so the plan is (1) inbound internal links from topical siblings via the existing `relatedCalculators` prop, (2) an answer-first content section, (3) presence in the matching guide page. Follow the Jul-3 pass as the style reference: `git show 39c9c99` before starting.

**The set, with chosen inbound-link sources (topical adjacency, exact paths under `src/pages/calculators/`). Tiers per review R5: B1-B4 (≥50 imp/28d) get FULL treatment (links + content); B5-B8 and B10 (<20 imp — page-level positions over anonymized long-tail are not stable enough to justify content edits) get LINKS-ONLY, content deferred until the next GSC pull confirms them; B9 bbq is handled entirely in Workstream C (it is an events-cluster page):**

| # | Target page (pos / 28d imp) | Add inbound `relatedCalculators` links FROM | Guide to list it in |
|---|---|---|---|
| B1 | `screen-time-calculator` (16.7 / 209) | `sleep-calculator.astro`, `subscription-audit-calculator.astro`, `coffee-spend-calculator.astro` | `guides/best-health-fitness-calculators.astro` |
| B2 | `water-change-calculator` (11.2 / 88) | `fish-stocking-calculator.astro`, `ei-dosing-calculator.astro` | (aquarium cluster; check `guides/` for best-fit, else skip) |
| B3 | `kiln-cost-calculator` (16.4 / 72) | `glaze-calculator.astro`, `clay-shrinkage-calculator.astro`, `electricity-cost-calculator.astro` | `calculators/hobbies/` hub if one exists for pottery (verify), else skip |
| B4 | `leftovers-calculator` (11.0 / 68) | `cooking-time-calculator.astro`, `holiday-dinner-calculator.astro`, `bbq-calculator.astro` | `guides/best-math-everyday-calculators.astro` |
| B5 | `tipping-guide-calculator` (14.6 / 19) | `tip-calculator.astro`, `vacation-budget-calculator.astro`, `currency-converter.astro` | `guides/best-math-everyday-calculators.astro` |
| B6 | `go-full-time-calculator` (18.3 / 16) | `side-hustle-profitability-calculator.astro`, `freelance-day-rate-calculator.astro`, `consulting-rate-calculator.astro` | `guides/best-freelance-calculators-uk.astro` |
| B7 | `employee-cost-calculator` (14.5 / 13) | `startup-cost-calculator.astro`, `break-even-calculator.astro`, `consulting-rate-calculator.astro` | `guides/best-business-startup-calculators.astro` |
| B8 | `etsy-fee-calculator` (15.0 / 13) | `marketplace-fees-calculator.astro`, `pricing-calculator.astro`, `materials-markup-calculator.astro` | `guides/best-business-startup-calculators.astro` |
| B9 | `bbq-calculator` (13.0 / 9) | `catering-calculator.astro`, `party-drink-calculator.astro`, `cooking-time-calculator.astro` | handled in Workstream C (events hub) |
| B10 | `due-date-calculator` (17.9 / 8) | `ovulation-calculator.astro`, `baby-cost-calculator.astro` | `guides/best-baby-family-calculators.astro` |

**Cannibalization guards while editing:** B7 has a UK twin (`uk-employer-cost-calculator.astro`) and B8 overlaps `marketplace-fees-calculator.astro`. When touching these, confirm titles clearly differentiate (US vs UK; Etsy-specific vs multi-marketplace) — adjust title wording if not, and cross-link the twins to each other so Google picks the right one per query. Verification is explicit (R10): paste the four titles (employee-cost / uk-employer-cost, etsy-fee / marketplace-fees) side by side into the commit body and confirm each pair is differentiated — a checked step, not advice.

### Task B0 (R2): Link-edge assertion checker — the actual proof the links exist

**Files:**
- Create: `scripts/seo/check-link-edges.mjs`, `scripts/seo/expected-link-edges.json`

**Step 1:** `expected-link-edges.json`: one `{ "from": "/calculators/sleep-calculator/", "to": "/calculators/screen-time-calculator/" }` entry for EVERY inbound link this plan adds (all B rows + the C2 cluster/hub edges). Grow it as each batch lands.

**Step 2:** Checker code:

```js
#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const edges = JSON.parse(fs.readFileSync('scripts/seo/expected-link-edges.json', 'utf8'));
const missing = [];
for (const { from, to } of edges) {
  const page = path.join('dist', from, 'index.html');
  if (!fs.existsSync(page) || !fs.readFileSync(page, 'utf8').includes(`href="${to}"`)) {
    missing.push(`${from} -> ${to}`);
  }
}
if (missing.length) {
  console.error(`FAIL: ${missing.length} expected link edges missing from dist:`);
  for (const m of missing) console.error(`  ${m}`);
  process.exit(1);
}
console.log(`OK: all ${edges.length} expected link edges present.`);
```

**Step 3:** Note (R2): `scripts/seo/internal-link-map.mjs` is a similarity-based SUGGESTION generator (`minSimilarity` flag, "Suggested internal links" output) — it verifies nothing. Use it for ideation only; THIS checker is the proof.

**Step 4:** Commit with the first B batch: `feat: link-edge assertion checker for internal-link work`

### Task B-pattern (repeat for B1..B10, one commit per 2-3 pages)

**Step 1:** Read the target page. If it lacks the `relatedCalculators` prop, add it (copy the shape from `cooking-time-calculator.astro:33`; icon/color values must come from the enums in `CalculatorLayout.astro:20-21`) with 3-4 entries: its siblings from the table + the matching guide page.
**Step 2:** For each source page in the table: read it; add/extend its `relatedCalculators` array with an entry for the target page (trailing-slash href — Task E3 already normalized the convention).
**Step 3:** Check the guide page's `calculators` array; append the target if missing (keep the array's existing shape and ranking style).
**Step 4:** (B1-B4 only — links-only pages skip this step.) Content depth: read the page body once; if it lacks an answer-first section, add ONE `<h2>` section directly answering the page's core question in the first two sentences (pattern: the Jul-3 additions in `git show 39c9c99`). Use the calculator's own logic/constants for any numbers — never invent figures.
**Step 5:** `npm run build` → clean (postbuild link check now enforces slash form on the new links). Add the new edges to `expected-link-edges.json`, then `node scripts/seo/check-link-edges.mjs` → all edges present.
**Step 6:** Commit batch: `feat: internal links and answer-first content for <pages> (striking-distance push)`

---

## Workstream C: events/party cluster build-out (the proven click wedge)

Cluster pages (all under `src/pages/calculators/`): `party-drink`, `graduation-party`, `event-seating`, `conference-room`, `birthday-party`, `wedding-budget`, `wedding-alcohol`, `catering`, `holiday-dinner`, `bbq`.

### Task C1: Extend the hub

**Files:**
- Modify: `src/pages/guides/best-wedding-event-calculators.astro`

**Step 1:** Append 3 entries to the `calculators` array (ranks 8-10): conference-room (meeting/seating capacity), holiday-dinner, bbq. Follow the exact object shape at lines 17-74. Schema ItemList updates automatically via `calculators.length`.
**Step 2:** Add 2 FAQs mirroring real query phrasings from the GSC data ("How many people fit in a meeting room?", "How much meat per person for a BBQ?"), answers derived from the calculators' own constants.
**Step 3:** `npm run build` → clean. Commit: `feat: add conference-room, holiday-dinner and bbq to events hub guide`

### Task C2: Bidirectional cluster linking

**Step 1:** For each of the 10 cluster pages: ensure `relatedCalculators` exists and contains (a) 2-3 cluster siblings and (b) the hub guide (`/guides/best-wedding-event-calculators/`). party-drink, graduation-party, event-seating, conference-room, birthday-party already have the prop (Jul-3 pass) — extend, don't duplicate; check for existing entries before appending.
**Step 2:** `npm run build` → clean.
**Step 3:** Commit: `feat: bidirectional internal links across events cluster`

### Task C3 — STRUCK (review R4)

Both pages already carry this content: party-drink has "Drinks Per Person Per Hour" and guest-count reference sections (verified, 3 per-hour hits in `party-drink-calculator.astro`), and graduation-party already has quantity and per-person budget sections (confirmed in the codex pass). Adding more would duplicate content on the site's two best-performing pages. No content work here; both pages still receive C2 cluster links.

---

## Workstream A: backlink execution (ops; runs in parallel from day 1)

Binding rules from `BACKLINK-STRATEGY.md`: relevance first (no DR-chasing), natural anchors, log every live link in `REVENUE.md` with date + URL + first-crawl date, keep relevant nofollow links, NO Reddit.

### Task A0 [CLAUDE] (R7): Referring-domain baseline — BEFORE any outreach

Snapshot today's link state into `REVENUE.md`, date-stamped: GSC Links report referring-domains count and top linked pages (from the GSC UI or the next API pull). Sprint success is defined against THIS baseline: new relevant live links pointing at the named money pages (ADS, 100k-trap, student-loan, IHT, CGT), each logged with contacted/sent/live dates. Directory and Product Hunt homepage links are secondary — they build the domain, not the pos-80 money pages.

### Task A1 [CLAUDE]: Link log + tracker hygiene
Add a `## Backlink log (2026-07 sprint)` table to `REVENUE.md` (columns: date, target page, source URL, type, follow/nofollow, first-crawl). Update the March sprint table in `BACKLINK-STRATEGY.md` with a 2026-07 status column. Commit: `docs: backlink sprint log and tracker refresh`

### Task A2 [KEITH, copy by CLAUDE]: Directory batch
From `docs/directory-submissions.md` (copy already drafted there): submit AlternativeTo, SaaSHub, BetaList, Indie Hackers. Claude pre-fills a per-directory submission block (name, tagline, description, category) in that doc; Keith creates accounts and submits; tick the tracker per submission. Note: the doc says "120+ calculators" — update the count to 167 first.

### Task A3 [KEITH]: Product Hunt launch
Execute `docs/product-hunt-launch.md` as written (assets incl. 240x240 logo exist). Schedule per the doc's guidance. Log the launch URL in `REVENUE.md`.

### Task A4 [KEITH signup, CLAUDE drafts]: Journalist-request platforms
1. Keith signs up: Qwoted, Featured (owns the HARO brand since Apr 2025), Source of Sources. Saved-search keywords: UK tax, inheritance tax, stamp duty, salary sacrifice, freelance rates, wedding budget.
2. Claude drafts into `docs/outreach/2026-07-journalist-kit.md`: a 3-sentence expert bio (Keith = "Principal Researcher and Lead Engineer"), plus 3 reusable response skeletons (UK tax explainer, event-budget stats, freelance-rate math) each ending with the relevant calculator URL.

### Task A5 [CLAUDE drafts, KEITH sends]: Guest-post pitches
From `docs/backlink-sprint-2026-03.md` opportunity lists (ADS, 100k-trap, student-loan pages): draft 5 personalized pitch emails into `docs/outreach/2026-07-pitches.md` using the doc's template, one per named prospect. Keith sends from his own email. Log responses in `REVENUE.md`.

### Task A6: Measurement checkpoint
At the next GSC pull (~2026-08-01): snapshot GSC Links report referring-domains count into `REVENUE.md`, compare against the Task A0 baseline, and mark which placements went live with dates. Success (R7) = named live links to money pages, not documents produced. (The pull itself is already a standing follow-up in `SEO-ROADMAP.md`.)

---

## Final task: writeback

**Step 1:** `SEO-ROADMAP.md`: tick completed items (Bing checkbox if done, slash-href follow-up, em-dash note), add one-line status under the 2026-07-18 review section.
**Step 2:** Update memory (`project_boring_maths_gsc_workflow.md`) + `hippo remember` with what shipped, per the writeback-at-ship-time rule.
**Step 3:** `npm run qa` + `npm run test:e2e` full pass on the branch; then stop — merging/PR is a separate user decision.

---

## Verification summary (what "done" means)

| Workstream | Deterministic check |
|---|---|
| E slash links | `npm run build` green (postbuild checker exits 0) |
| E em dashes | `npx vitest run tests/seo/no-em-dashes.test.ts` green |
| D tax refresh | `grep -rn "2025/26" src/` returns only intentional historical mentions; per-group vitest green |
| B/C links | postbuild checker green + `node scripts/seo/check-link-edges.mjs` green (asserts every planned source→target anchor in dist) |
| A backlinks | `REVENUE.md` log rows with live URLs, measured against the A0 baseline |
| F guard | `npx vitest run tests/seo/registry-guard.test.ts` green (registry array length === 167) |

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex` | Independent 2nd opinion | 1 | FOLDED | 8 findings (3 P0, 4 P1, 1 P2), all folded via R1-R10 |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | FOLDED | 6 issues, 3 critical gaps, all folded via R1-R10 |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**CODEX:** consult-mode plan review (high reasoning, ~180k tokens). All 8 findings verified against the repo before absorption; every load-bearing claim confirmed (BaseLayout slash-less footer routes at lines 287-520, internal-link-map.mjs is a suggestion generator not a verifier, 30 `2025/26` occurrences in 10 src/components files outside the plan's D inventory, no UK tax calculation test files, party-drink already has per-hour content).

**CROSS-MODEL:** Overlap: both reviewers found the trailing-slash workstream hole (Claude: generated breadcrumb `href: canonicalURL` at CalculatorLayout.astro:60 unreachable by codemod; Codex: checker scope covers all routes but codemod only rewrites /calculators|/guides, so BaseLayout footer links fail every postbuild). Codex-only: fictitious B/C link verification, tax-constant/test coverage gap, C3 duplication, striking-set data thinness, em-dash sweep risk, missing backlink baseline. Claude-only: validate-shared-data/OG-image preflight before codemod, B7/B8 cannibalization title checks. Tension point: Codex recommends dropping the em-dash sweep entirely; house style (Stop Slop, no em dashes in frontend strings) mandates it — recommended resolution is narrowing scope to titles only, separate commit, rather than dropping.

**VERDICT:** ENG + CODEX CLEARED — user approved "apply consolidated" on 2026-07-18; all 10 revision items (R1-R10) are applied in the plan body above (R1→E1/E2/E3, R2→B0, R3→D0, R4→C3 struck, R5→B tiers, R6→E4/E5 titles-only, R7→A0/A6, R8→registry-guard test, R9→E2 step 0, R10→cannibalization verification). Ready to implement.

NO UNRESOLVED DECISIONS
