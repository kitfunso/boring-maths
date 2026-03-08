# SEO A/B Testing Protocol

**Purpose:** Systematically test title tags and meta descriptions to improve GSC click-through rates on high-impression pages.  
**Cadence:** One page per week. Two-week measurement window per test.  
**Source of truth:** GSC (Search Console) Performance report, filtered by page.

---

## Five Pages to Test First

Ranked by impression volume in GSC (highest first). These have the most to gain from a CTR improvement.

| Priority | Page | Target Query | Why test first |
|----------|------|-------------|---------------|
| 1 | `uk-student-loan-calculator` | "uk student loan calculator" | High impressions, competitive SERP, title can be sharper |
| 2 | `uk-100k-tax-trap-calculator` | "60% tax trap calculator" | Strong query intent, title may not match searcher language |
| 3 | `ads-calculator` | "additional dwelling supplement calculator" | Low competition, title tweak could capture more clicks |
| 4 | `freelance-day-rate-calculator` | "freelance day rate calculator" | High volume, evergreen, small CTR gains = meaningful traffic |
| 5 | `income-tax-calculator` | "uk income tax calculator" | Extremely competitive — a better title/desc matters a lot |

---

## Weekly Testing Protocol

### Step 1 — Establish baseline (do this before any change)
1. Open GSC → Performance → Pages tab
2. Filter to the target page
3. Record in the tracker (see `seo-ab-tracker.md`):
   - Average position (last 28 days)
   - CTR (last 28 days)
   - Impression count (last 28 days)
   - Current title tag and meta description (copy from source)

### Step 2 — Write the variant
Rules for writing variants:
- Lead with the primary keyword. Don't bury it.
- For titles: keep under 60 characters. Include a concrete benefit or number if possible.
- For descriptions: keep under 155 characters. Address the searcher's intent directly.
- No filler phrases: "free," "easy," "simple" are weak openers. Lead with what the tool does.
- Avoid: "robust," "comprehensive," "leverage," "powerful tool" — these are invisible in SERPs.

Example format:
- **Before:** `UK Student Loan Calculator — Boring Math`
- **After:** `UK Student Loan Repayment Calculator: Plan 1, 2, 4 & 5`

### Step 3 — Deploy the change
- Edit the page's `title` and `description` variables in the `.astro` frontmatter
- Run `npm run build && npx wrangler pages deploy dist --project-name=boring-maths`
- Record the deploy date in the tracker

### Step 4 — Wait (2 weeks minimum)
- Do not change the page again during the measurement window
- GSC data lags by ~3 days, so the earliest reliable measurement is 17 days after the change
- Mark the measurement date in the tracker: `deploy_date + 17 days`

### Step 5 — Measure
On the measurement date:
1. Open GSC → Performance → Pages → filter to the page → set date range to `deploy_date` through `today`
2. Record new CTR and average position
3. Compare to baseline

---

## Win / Loss Criteria

| Outcome | Criteria |
|---------|----------|
| **Win** | CTR improves by ≥ 0.5 percentage points OR average position improves by ≥ 3 spots |
| **Loss** | Neither threshold met |
| **Emergency rollback** | CTR drops by ≥ 1.0 percentage point vs baseline |

If it's a **Win**: keep the new title/description, log it as the new baseline.  
If it's a **Loss**: keep the new version unless impressions have dropped too — sometimes position improvement takes longer than 2 weeks.  
If it triggers **Emergency rollback**: revert immediately, investigate (did SERP landscape change? did a competitor enter?), then retest.

---

## Rollback Procedure

1. Restore the original title and description from the tracker
2. Build and deploy: `npm run build && npx wrangler pages deploy dist --project-name=boring-maths`
3. Log in the tracker: rollback date, reason, and new baseline impressions

---

## What Not to Do

- Don't test multiple pages simultaneously. Changes to one can affect others via internal links and crawl budget.
- Don't change anything else on the page during the measurement window (no content edits, schema changes, or link building).
- Don't read GSC data before the 17-day mark. The lag will make it look like nothing changed.
- Don't run tests in December or January (search behaviour shifts seasonally).

---

## Logging

After each test, append to `memory/boring-maths-marketing.md`:

```
## SEO A/B Result — [PAGE] — [DATE]
- Baseline CTR: X% | New CTR: X%
- Baseline position: X | New position: X
- Verdict: Win / Loss / Rollback
- New title: "[TEXT]"
- New description: "[TEXT]"
```
