# SEO A/B Test Tracker

Track every title/meta description test. One row per test. Archive rows older than 6 months to keep the table readable.

See `seo-ab-protocol.md` for win/loss criteria and measurement instructions.

---

## Active Tests

| Page | Deploy Date | Measure By | Baseline CTR | Baseline Pos | Baseline Impr | New CTR | New Pos | Delta CTR | Delta Pos | Verdict |
|------|-------------|------------|:------------:|:------------:|:-------------:|:-------:|:-------:|:---------:|:---------:|:-------:|
| *(none yet)* | | | | | | | | | | |

---

## Test Detail Log

Use this section for the full before/after text. One block per test.

---

### Test: [PAGE SLUG] — [YYYY-MM-DD]

**Status:** Planned / In Progress / Complete / Rolled Back

**Baseline** (captured [DATE]):
- Position: 
- CTR: 
- Impressions: 
- Title: 
- Description: 

**Variant** (deployed [DATE]):
- Title: 
- Description: 

**Result** (measured [DATE]):
- Position: 
- CTR: 
- Verdict: Win / Loss / Rollback
- Notes: 

---

## Completed Tests Archive

| Page | Period | Baseline CTR | Final CTR | Delta | Verdict | Winning Title |
|------|--------|:------------:|:---------:|:-----:|:-------:|--------------|
| *(none yet)* | | | | | | |

---

## Test Queue

Pages approved for testing, not yet started. Order = priority.

1. `uk-student-loan-calculator` — test Plan 1/2/4/5 specificity in title
2. `uk-100k-tax-trap-calculator` — test "60% tax trap" as opener vs current
3. `ads-calculator` — test Scottish buyer specificity in description
4. `freelance-day-rate-calculator` — test day rate vs daily rate vs contract rate
5. `income-tax-calculator` — test leading with year (2025/26) vs generic

---

## Notes

- Measurement lag: GSC data lags ~3 days. Always wait ≥17 days after deploy before reading results.
- One test at a time. No parallel tests.
- Emergency rollback threshold: CTR drops ≥ 1.0pp vs baseline. Rollback same day.
