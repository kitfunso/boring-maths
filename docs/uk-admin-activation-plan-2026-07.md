# UK Admin Cluster Activation Plan — 2026-07-28

Status: **APPROVED 2026-07-28** (Keith: "apply consolidated"; registry 168→169 for SSP
delegated and decided YES). Outside-voice review applied; original draft superseded.

## Goal

Convert researched-winnable UK admin/employment demand into impressions and clicks.
The cluster mostly exists; it is invisible. Work is differentiated per page — the
review falsified the draft's uniform "add links + FAQs everywhere" approach.

## Evidence (verified against repo, 2026-07-28)

- SERP research: student-loan, statutory-pay, childcare, redundancy and
  holiday-entitlement SERPs are held by thin no-name dedicated domains — winnable at
  our authority.
- `uk-student-loan-calculator`: live since 2026-01-14, **7 non-registry inbound
  links**, in llms.txt, zero GSC impressions ever → discoverability is NOT its
  problem; this page is the indexing/domain-signal case.
- `uk-redundancy-pay-calculator`, `uk-holiday-entitlement-calculator`: live since
  2026-05-28, **true orphans** (zero inbound links outside the registry, absent from
  llms.txt), zero impressions.
- `uk-nursery-cost-calculator`: 144 impr, pos 60.7. Tax-free childcare framing
  already present; actual defects = title says **2025** (stale year on a SERP where
  year-in-title wins) and ~95-char truncation.
- No SSP/SMP page exists. `tests/seo/registry-guard.test.ts` pins 168 as the
  "no-new-calculators rule" (shipped 2026-07-18): building SSP **partially revokes
  that policy by one slot (168→169)** — explicitly approved above.

## Phase 0 — Diagnose

1. **URL Inspection** for the three zero-impression URLs via
   `POST /v1/urlInspection/index:inspect` (NOT the webmasters/v3 base gsc-pull uses;
   same `webmasters.readonly` scope, same token). Inspect the **trailing-slash**
   served URLs, not the slash-less `canonicalURL` consts. New:
   `scripts/seo/gsc-inspect.mjs`.
2. **16-month page-level pull** (`--start` back to GSC retention limit) to confirm
   "zero impressions ever" beyond 28-day windows before declaring
   INDEXED-NEVER-SHOWN.
3. Regenerate the internal-link map (stale CSV caused a false claim in the draft).
4. Verify the www→apex 301 live once PR #18 deploys
   (`curl -sI https://www.boring-math.com/` → 301 to apex).

Exit: each zero page classified NOT-INDEXED vs INDEXED-NEVER-SHOWN, recorded in
SEO-ROADMAP.

## Phase 1 — Differentiated activation edits (one PR)

- **student-loan**: title/H2 overpayment tweak ONLY (FAQ already covers pay-off-early;
  links already saturated).
- **redundancy + holiday-entitlement**: inbound links from the UK money pages
  (uk-tax hub, salary-sacrifice, employer-cost, take-home), llms.txt entries,
  holiday-entitlement title gains pro-rata (description/keywords/FAQs already have it).
- **nursery-cost**: retitle to 2026/27 and shorten under ~65 chars; refresh
  "From September 2025" body copy (GOV.UK-verified).
- **Orphan guard (root-cause fix)**: postbuild check that every registry href appears
  in non-registry, non-hub dist pages. Measure the inbound distribution first, then
  set the threshold (orphan = 0 inbound minimum); ship guard + the links that make it
  pass in the same PR.
- **Cheap test additions**: stale-year title test (no year < current year in titles);
  llms.txt validity test (every llms entry resolves to a registry page).
- Deferred (noted, not this PR): em-dash test extension to FAQ copy.
- After deploy: Request Indexing for the three zero pages.

## Phase 2 — Build SSP (concurrent with Phase 1, same PR train)

- **Two-page design chosen; SSP first, SMP gated** (separate query intents; combined
  page dilutes both titles; SMP's AWE/qualifying-week rules don't share a UI cleanly).
- A brand-new page's time-to-first-impression doubles as the cleanest test of
  "domain problem vs page problem".
- 2026/27 GOV.UK-verified figures (SSP weekly rate, waiting days, linked periods,
  lower earnings limit, 28-week cap), sources quoted in the commit body; pinning
  tests for every statutory figure.
- Registry 168→169 with the registry-guard test updated to cite this approval.
- Related-links into the cluster; llms.txt; no-financial-advice wording.

## Phase 3 — Measure (split gates)

- **2 weeks**: URL Inspection re-check — the three pages + SSP indexed?
- **8-12 weeks**: impressions > 0 AND position < 60 on the activation pages;
  nursery-cost under pos 40.
- If indexed but still zero impressions at 12 weeks: pages are fine, the domain needs
  Phase 4 backlinks — stop content spend on this cluster and say so in the roadmap.

## Constraints

- Registry is source of truth; count moves 168→169 exactly once, for SSP.
- No financial advice; statutory figures verified against GOV.UK primary sources.
- No em dashes in titles; trailing-slash internal hrefs; postbuild gates stay green.
- Rule 5 check: SSP passes — employees and small employers genuinely compute this.
