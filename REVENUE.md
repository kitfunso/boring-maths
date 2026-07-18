# Revenue Tracking — boring-math.com

## Monthly Revenue vs Costs

| Month | Ad Revenue | Affiliate Revenue | Total | API Costs | Hosting | Net |
|-------|-----------|-------------------|-------|-----------|---------|-----|
| 2026-02 | £0.00 | £0.00 | £0.00 | £0.00 | £0.00 | £0.00 |
| 2026-03 | | | | | | |
| 2026-04 | | | | | | |
| 2026-05 | | | | | | |
| 2026-06 | | | | | | |

## Notes
- AdSense pub-id: `ca-pub-8014911033000505`
- Affiliate links: placeholder URLs (not yet live)
- Update monthly after reconciliation
- 2026-02-23: No revenue yet. First Dev.to blog post published for traffic building. 118 calculators live.
- 2026-02-23: Second Dev.to post published (compound interest deep-dive). 121 calculators live. GSC trending up (40 clicks, 5.2K impressions as of Feb 22).
- 2026-03-02: Third Dev.to post published (personal finance tips): "3 UK Money Checks I Run Before Saying Yes to a Pay Rise" — https://dev.to/kitfunso/3-uk-money-checks-i-run-before-saying-yes-to-a-pay-rise-7p4
- 2026-03-02: Weekly check complete. GSC API/data pull not available in this run; site health fallback passed (https://boring-math.com returned HTTP 200). No non-main branches pending merge/deploy.
- 2026-03-09: Fourth Dev.to post published (FIRE calculator technical deep-dive): "The Math Behind Early Retirement (FIRE) And What Most Calculators Get Wrong" — https://dev.to/kitfunso/the-math-behind-early-retirement-fire-and-what-most-calculators-get-wrong-6hm. 121 calculators live. Site healthy (200 OK). No branches pending deploy.

## Backlink baseline (2026-07-18)

**Referring domains:** the GSC API exposes no Links report. This number only exists in the GSC UI and has to be pulled by hand.

Baseline pulled 2026-07-18 from the GSC Links report (sc-domain:boring-math.com): **83 external links total** across ~5 referring domains. The top 5 sites account for 82 of the 83 links, and dev.to/forem.com are the same platform (Forem mirrors dev.to content), so the independent-domain count is effectively 4. This is the number the backlink sprint exists to move.

| Date | Referring domains | Top 3 linking sites |
|------|--------------------|-----------------------|
| 2026-07-18 | ~5 (83 external links) | dev.to (48), forem.com (23), twitterwebviewer.com (6); also reddit.com (4), 2ip.ru (1) |

**Known links:**
- awesome-calculators GitHub PR #27: https://github.com/xxczaki/awesome-calculators/pull/27. Checked 2026-07-18 via `gh pr view`: state is OPEN, `mergedAt` is null. Not live yet, the link only counts once the PR merges. `docs/directory-submissions.md` had this row marked done (✅); corrected there to reflect the actual PR state.

**Sprint success definition:** new, relevant, live links to the five money pages below. Each one gets logged with contacted / sent / live dates as it moves. Directory listings (AlternativeTo, SaaSHub, BetaList, Indie Hackers) and the Product Hunt homepage link are secondary, they help the referring-domain count but don't count toward this sprint's goal.

| Target page | Contacted | Sent | Live |
|---|---|---|---|
| `/calculators/ads-calculator/` | | | |
| `/calculators/uk-100k-tax-trap-calculator/` | | | |
| `/calculators/uk-student-loan-calculator/` | | | |
| `/calculators/inheritance-tax-calculator/` | | | |
| `/calculators/uk-capital-gains-tax-calculator/` | | | |

## Backlink log (2026-07 sprint)

| Date | Target page | Source URL | Type | Follow/nofollow | First-crawl date |
|------|-------------|-----------|------|------------------|-------------------|
| 2026-07-18 | homepage | https://github.com/xxczaki/awesome-calculators/pull/27 | GitHub awesome-list PR (open, not merged) | n/a until merged | |
