# SEO Traffic Boost Roadmap

> Goal: Get boring-math.com ranking on Google and driving organic traffic

---

## Phase 1: Get Indexed (Priority: CRITICAL)

### 1.1 Verify Indexing Status
Search `site:boring-math.com` on Google. If nothing shows, Google hasn't crawled you.

### 1.2 Set Up Google Search Console
1. Go to https://search.google.com/search-console
2. Add property: `https://boring-math.com`
3. Verify ownership (HTML file, DNS, or Google Analytics)
4. **Submit sitemap**: `https://boring-math.com/sitemap-index.xml`

### 1.3 Request Indexing
In Search Console → URL Inspection → Enter URL → Click "Request Indexing"

Priority pages to index first:
- `/` (homepage)
- `/calculators/tip-calculator`
- `/calculators/fire-calculator`
- `/calculators/compound-interest-calculator`
- `/calculators/mortgage-calculator`
- `/calculators/bmi-calculator`
- `/calculators/paint-calculator`
- `/calculators/bbq-calculator`
- `/calculators/us-tax-bracket-calculator`
- `/calculators/uk-100k-tax-trap-calculator`

---

## Phase 2: Add Structured Data (Priority: HIGH)

### 2.1 WebApplication Schema
Add JSON-LD to each calculator page:
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Calculator Name",
  "description": "Calculator description",
  "url": "https://boring-math.com/calculators/calculator-slug",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

### 2.2 FAQPage Schema
Add FAQ schema for rich results in "People Also Ask" boxes.

---

## Phase 3: Keyword Strategy (Priority: HIGH)

### Target Keywords by Page
| Page | Target Keyword | Monthly Volume |
|------|----------------|----------------|
| Tip Calculator | "tip calculator" | 1M+ |
| BBQ Calculator | "how much meat for bbq" | 8K |
| Paint Calculator | "how much paint do i need" | 40K |
| FIRE Calculator | "fire calculator" | 22K |
| Mortgage Calculator | "mortgage calculator" | 500K+ |
| BMI Calculator | "bmi calculator" | 1M+ |

### On-Page Optimization
- `<title>` starts with target keyword
- `<h1>` includes target keyword
- Meta description is compelling with keyword
- URL contains keyword

---

## Phase 4: Build Backlinks (Priority: HIGH)

### Quick Wins
| Method | Effort | Impact |
|--------|--------|--------|
| Reddit posts (r/personalfinance, r/homeimprovement) | Low | Medium |
| HARO (helpareporter.com) | Medium | High |
| Product Hunt launch | Medium | Medium |
| Indie Hackers/Twitter | Low | Low-Medium |

### Long-term
- Guest posts on finance blogs
- Tool directories submission
- Niche community engagement

---

## Phase 5: Technical SEO (Priority: MEDIUM)

### 5.1 Internal Linking
Link related calculators to each other:
- Tip Calculator → Wedding Alcohol Calculator
- FIRE Calculator → Compound Interest Calculator
- Mortgage Calculator → Loan Calculator

### 5.2 Core Web Vitals
Run https://pagespeed.insights.google.com
Target scores: LCP < 2.5s, FID < 100ms, CLS < 0.1

### 5.3 Mobile Optimization
Ensure all calculators work perfectly on mobile.

---

## Phase 6: Content Expansion (Priority: MEDIUM)

### Per Calculator Page
| Section | Target Length |
|---------|---------------|
| How to use | 200-300 words |
| Understanding results | 200-300 words |
| FAQs | 5-10 questions |
| Related calculators | 3-5 links |

---

## Progress Checklist

### Phase 1: Get Indexed ✅ COMPLETE
- [x] Set up Google Search Console
- [x] Verify domain ownership
- [x] Submit sitemap
- [x] Request indexing for top 10 pages
- [ ] Set up Bing Webmaster Tools (bonus)

### Phase 2: Structured Data ✅ COMPLETE
- [x] Add WebApplication schema to CalculatorLayout
- [x] Add FAQPage schema component
- [x] Test with Google Rich Results Test

### Phase 3: Keywords ✅ COMPLETE
- [x] Audit all page titles (15 fixed)
- [x] Audit all meta descriptions (optimized high-priority pages)
- [x] Audit all H1 tags

### Phase 4: Backlinks (See BACKLINK-STRATEGY.md)
- [x] ~~Post to 3 relevant subreddits~~ — Not viable (self-promotion flagging)
- [ ] Submit to Product Hunt
- [ ] Sign up for HARO
- [ ] Submit to tool directories

### Phase 5: Technical ✅ COMPLETE
- [x] Internal linking audited (3-4 related per page, category hierarchy)
- [x] PageSpeed analyzed (already well-optimized)
- [x] No critical issues found

### Phase 6: Content ✅ COMPLETE
- [x] All 150+ calculators have 6+ FAQs
- [x] All pages have "How to use" sections
- [x] All pages have "Understanding results" sections
- [x] Enhanced high-traffic pages (mortgage, BMI, compound interest)

---

## Overall Progress Summary (February 2026)

| Phase | Status |
|-------|--------|
| Phase 1: Get Indexed | ✅ Complete (Bing Webmaster optional) |
| Phase 2: Structured Data | ✅ Complete |
| Phase 3: Keywords | ✅ Complete |
| Phase 4: Backlinks | **OPEN** — No posts made yet (see BACKLINK-STRATEGY.md) |
| Phase 5: Technical SEO | ✅ Complete |
| Phase 6: Content | ✅ Complete |

**Key blocker:** Phase 4 (backlinks) is the main remaining lever for driving organic traffic growth.

## AI Search: AI Overviews & AI Mode (added 2026-05-22)

Source: Google's [AI features and your website](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

**Core finding: AI Overviews and AI Mode are not a separate channel.** They run on Google's
core Search ranking and quality systems. Per Google: *"SEO best practices continue to be
relevant because our generative AI features on Google Search are rooted in our core Search
ranking and quality systems."* Phases 1-6 above **are** the AI-optimization work. There is
no second playbook.

### Eligibility floor
A page only appears in AI Overviews / AI Mode if it is **indexed and snippet-eligible**
(Google: *"a page must be indexed and eligible to be shown in Google Search with a snippet"*).
Phase 1 covers this. Keep content out of `noindex` and unblocked for JS rendering.

### What this means for our existing AEO work

| Item | Verdict |
|------|---------|
| `public/llms.txt`, `public/llms-full.txt` | Do nothing for Google AI features. Google explicitly says no AI text files / `llms.txt` / special markup are needed. Harmless but low-ROI. Do not expand. |
| `aeo-task.md` Deliverable 1 (`.well-known/brand-facts.json`) | Do **not** build. Same category as `llms.txt`: a machine-readable file Google ignores. No pickup expected. |
| `aeo-task-2..5` UK Answer Hub guide pages | **Keep.** These are legitimate topic-cluster hub pages. Google's query fan-out rewards comprehensive hub content. Re-file them under Phase 6 (Content Expansion), not a separate "AEO" track. |
| FAQPage / WebApplication schema (Phase 2) | Keep. Not required for AI, but still drives rich results. Stop framing it as "AI" work. |
| Relevance-first backlinks (`BACKLINK-STRATEGY.md`) | Already correct. Google warns against inauthentic "mentions" — our rule already forbids DR-chasing and exact-match stuffing. |

### The real lever: non-commodity content
Google rewards *"a unique point of view"* and down-weights commodity content. For a
calculator site the structural risk is zero-click: an AI Overview answers a simple
calculation inline and the user never visits. Defence is depth a snippet can't reproduce —
methodology, UK-specific edge cases (the 100k trap, ADS vs SDLT), worked examples, real
interactivity. UK-specific pages are well-positioned; generic ones (tip, BMI, paint) are
exposed. Watch **scaled content abuse**: Google flags "separate content for every possible
variation" built to manipulate rankings — same line as CLAUDE.md rule 5.

### Action items
- [x] Retire `aeo-task.md` Deliverable 1 (`brand-facts.json`) — do not build. (Closed 2026-07-03: not built, no plans.)
- [x] Decide on `llms.txt` / `llms-full.txt`: **keep as-is**, zero further investment. (Decided 2026-07-03.)
- [x] Re-file `aeo-task-2..5` Answer Hub pages under Phase 6 content expansion. (They are content work, not a separate AEO track.)
- [ ] Audit generic calculators (tip, BMI, paint) for unique-POV depth vs commodity filler.

---

## GSC Review — 2026-07-03 (28-day window, API pull)

Fresh pull via `npm run seo:gsc-pull` (OAuth re-consented; token was expired). Analysis in
`docs/gsc-analysis-2026-07-03.md`.

### Trend (28d vs the 2026-06-04 pull)
| Metric | Jun 4 pull | Jul 3 pull |
|--------|-----------|-----------|
| Clicks | 27 | 55 |
| Impressions | 30,829 | 39,746 |
| Pages with impressions | 160 | 290 |

Clicks doubled and impressions +29% month-over-month. Absolute numbers still small; the
site is visible (39k impressions) but ranks pos 70-95 for nearly all money queries.

### Findings
1. **Trailing-slash consolidation is in progress, not a problem.** 126 URL pairs still show
   both slash/non-slash variants in GSC (82% of impressions already on the canonical slash
   form). Canonical + sitemap + serving are aligned (`trailingSlash: 'always'`); the
   non-slash 308s. No action; monitor next pull. The "cannibalized queries" count in the
   analysis report is inflated by these pairs.
2. **Authority, not on-page, is the binding constraint for the big UK tax pages.** CGT
   (2.6k imp), IHT (1.9k imp), moving-cost (2.1k imp), salary-sacrifice, dividend-tax all
   sit at pos 80-95. Titles are already competitive. Phase 4 (backlinks) has been open
   since February and is still the main lever.
3. **A striking-distance cluster exists at pos 30-65** where on-page work can plausibly
   reach page 1-2: cooking-time (~900 imp of pork/beef/chicken queries the page didn't
   cover), conference-room (room/seating capacity queries), discount (percent-off),
   raise (salary raise), tap-drill (thread percentage), 100k-trap (personal allowance
   over 100k), birthday-party (average cost queries).

### Actions taken 2026-07-03
- Schema URLs in `SEOHead.astro` normalized to the trailing-slash canonical form (were
  emitting the 308-redirecting non-slash form in JSON-LD).
- On-page query alignment + answer-first content sections added for: cooking-time,
  raise, discount, conference-room, birthday-party, uk-100k-tax-trap, uk-capital-gains
  (Scotland FAQ), inheritance-tax (liability phrasing), tap-drill, speeds-feeds (SFM),
  moving-cost (estimator phrasing), water-intake ("a day" phrasing).
- Em dashes removed from titles on touched pages per house style.

### Candidate follow-ups (not done)
- [x] Internal links sitewide are slash-less hrefs, so every internal crawl hop eats a
  308. Consider emitting slash-form internal hrefs centrally. Low priority. (Done
  2026-07-18: sitewide codemod + postbuild checker.)
- [ ] Bing Webmaster Tools (Phase 1 leftover) — feeds Copilot/ChatGPT answers, cheap AEO win.
- [ ] Next GSC pull ~2026-08-01: check whether the striking-distance set moved.
- [ ] Tax-year refresh: UK pages are still branded "2025/26" but the current tax year is
  2026/27 (since 6 Apr 2026). CGT rates/AEA verified identical across both years, so nothing
  is false, but titles lose freshness signal. Refresh needs per-calculator figure verification
  (thresholds, bands, allowances) — do NOT bulk find-and-replace the year. IHT FAQ's
  "frozen until at least April 2028" and the 100k-trap page's advice-flavoured wording
  ("consider asking your employer...") should be handled in the same pass.

---

## GSC Review — 2026-07-18 (28-day window, API pull)

Fresh pull via `npm run seo:gsc-pull` (OAuth re-consented; testing-mode app expires the
refresh token after ~7 days, so every pull more than a week after the last needs `--reauth`).
Analysis in `docs/gsc-analysis-2026-07-18.md`.

### Trend
| Metric | Jun 4 pull | Jul 3 pull | Jul 18 pull |
|--------|-----------|-----------|------------|
| Clicks | 27 | 55 | 59 |
| Impressions | 30,829 | 39,746 | 50,801 |
| Pages with impressions | 160 | 290 | 168 |

Impressions +28% in two weeks; clicks near-flat. Visibility keeps compounding but almost
everything ranks pos 40-90 on money queries, where CTR is ~0.

### Findings
1. **Trailing-slash consolidation is complete in GSC.** Cannibalized-query count fell
   1305 → 91 and the page count halved (290 → 168) as slash pairs merged. The remaining
   cannibalization list is real but low-stakes (wales vs UK stamp duty, conference-room
   vs event-seating, UK vs US CGT).
2. **The Jul-3 striking-distance pass is working, slowly.** Cooking cluster moved ~+6
   positions (55-62 → 44-56) with impressions up 909 → 1,177. Not yet page 1-2.
3. **Clicks come from the event/party niche, not the money pages.** party-drink 12 clicks
   (pos 8.7), graduation-party 7 (pos 9.7), event-seating 6, conference-room 3,
   coffee-spend 3 — over half of all site clicks. The UK-tax cluster (4.8k visible
   impressions across 131 queries) still sits at avg pos 82.7 with 0 clicks:
   authority-bound, unchanged since February.
4. **42% of impressions are on hidden (anonymized) queries**, and nearly all clicks land
   there too — visible query rows account for only 3 of the 59 clicks. Long-tail is doing
   the work.
5. **Coverage is complete; adding calculators is not the lever.** Every demand signal in
   the query data already has a page (Scotland LBTT, car buy-vs-lease, compound interest,
   ideal gas law, debt avalanche, 100k trap). They rank pos 65-93 — same authority story.
6. **Zero-click exposure confirmed for instant-answer queries.** "70% off $80"-style
   queries rank pos 9-11 with zero clicks (Google answers inline). Single-input
   calculators are exposed; multi-input tools (moving cost, IHT, LBTT) are defensible.

### Recommended actions (priority order)
1. **Execute Phase 4 backlinks — open since February, now the only meaningful lever for
   the money cluster.** Assets already written: `docs/backlink-sprint-2026-03.md`,
   `docs/directory-submissions.md`, `docs/product-hunt-launch.md`, `docs/outreach/`.
   Landscape note: HARO shut down Dec 2024 and was revived by Featured.com in Apr 2025;
   the current working set is Qwoted, Featured, Source of Sources, and #JournoRequest on X.
2. **Push the pos 10-20 striking set onto page 1** with internal links + content depth:
   go-full-time (18.3), due-date (17.9), screen-time (16.7), kiln-cost (16.4),
   etsy-fee (15.0), tipping-guide (14.6), employee-cost (14.5), bbq (13.0),
   water-change (11.2), leftovers (11.0). Every page that currently earns clicks sits at
   pos 8-22, so page 1-2 is where clicks start.
3. **Build out the events/party cluster as a hub** (it earns >half of clicks): interlink
   party-drink, graduation-party, event-seating, conference-room, birthday-party,
   wedding-*; consider a party-planning guide page as the hub.
4. **2026/27 tax-year refresh** (tracked above) — freshness signal for the money pages
   while links accrue. Per-calculator figure verification, no bulk find-and-replace.
5. Cheap tail: Bing Webmaster Tools (Phase 1 leftover; feeds Copilot/ChatGPT); emit
   slash-form internal hrefs to kill the sitewide 308 hop; strip em dashes from the 40+
   page titles the Jul-3 pass didn't touch (house style).

Next pull ~2026-08-01: check the striking-distance set and whether Phase 4 links landed.

### Status 2026-07-18 (execution)
- E done: slash-form internal links and em-dash title sweep, both with permanent
  verifiers (postbuild link checker, em-dash title guard test).
- D done: 2026/27 tax-year refresh, all figures source-verified. SDLT, ADS, dividend
  and child benefit were materially stale and are now fixed.
- B/C done: 53 asserted link edges, events/party hub extended to 10 pages,
  cannibalization guards in place.
- A drafted: backlink baseline, log, journalist kit and 5 pitches written. Keith-gated
  before going further: directory signups, outreach sends, Product Hunt, Bing
  Webmaster Tools.

---

## GSC Review — 2026-07-28 (28-day window, API pull + first region breakdown)

Fresh pull via `npm run seo:gsc-pull` (token expired as expected; `--reauth` + browser
consent). The pull script now also exports country, country+page and country+query
dimensions, and `python scripts/gsc_region_analysis.py` produces the per-region report.
Analysis in `docs/gsc-analysis-2026-07-28.md` + `docs/gsc-region-analysis-2026-07-28.md`.

### Trend
| Metric | Jul 3 pull | Jul 18 pull | Jul 28 pull |
|--------|-----------|------------|------------|
| Clicks | 55 | 59 | 59 |
| Impressions | 39,746 | 50,801 | 63,220 |
| Pages with impressions | 290 | 168 | 167 |

Impressions +24% in ten days, clicks flat — but +6.3k of the gain is discount-calculator
alone (now 12.8k impr at pos 13.9, 0 clicks: the known instant-answer trap). Ex-discount,
impressions are roughly flat.

### Region findings (new)
1. **This is a US site in practice.** US = 58% of impressions and 39 of 58 clicks at
   avg pos 31.7. UK = 21% of impressions, 8 clicks, avg pos 63.3. Canada 3.5%,
   Australia 2.3%, Ireland/NZ <1% each — anglosphere ≈ 87%. (Vietnam 2.7% is crawler-ish
   noise: scattered engineering/cooking impressions, zero clicks.)
2. **The mismatch is the story of the account**: the audience is American, the money
   cluster is British. UK-intent pages are seen 92% in the UK (correct targeting) but
   rank pos 60-88 there; US visibility is spread across events/home/machining pages
   that rank pos 14-35.
3. **www host leak — new this window.** uk-mortgage-affordability is indexed under
   `www.boring-math.com` (760 impr at pos 88.3) alongside the apex URL (446 impr at
   pos 84). www serves HTTP 200 instead of redirecting; canonical correctly points to
   apex but Google surfaces www anyway. Fix: host-level 301 in `public/_redirects`
   (`https://www.boring-math.com/* https://boring-math.com/:splat 301`) — works if www
   is attached as a custom domain on the same Pages project; verify after deploy.
4. **GSC suppresses clicks in country splits**: only 5 of 39 US clicks survive in the
   country+page table (0 of 8 UK). Country totals are reliable; per-market page/query
   tables are impression/position signal only. Caveat now printed in the report header.
5. **Seasonal fade in the click engine**: party-drink 12 → 7 clicks, graduation-party
   7 → 4 (season over). Positions held or improved (event-seating 21.9 → 19.0), so this
   is demand seasonality, not ranking loss. Cluster still earns ~40% of clicks.
6. **UK money cluster is shrinking, not growing**: uk-capital-gains −468 impr,
   inheritance-tax −164 vs Jul-18, positions unchanged (76-84).
7. **New striking-distance assets**: raise-calculator 2,544 impr pos 13.7,
   conference-room 2,565 impr pos 14.6, cooking-time 3,290 impr pos 26.4 — the three
   biggest legitimate impression pools outside discount.

### Deep-research round — what to add (winnability-scored, 4 web-research agents)
UK money verdict is **segmented, not uniformly locked**: IHT/dividend-tax SERPs are
advisers/insurers only (backlinks-or-nothing), but SDLT/LTT has thin exact-match
calculator domains on page 1 (crackable), and the non-YMYL UK admin/employment flank is
wide open — entire SERPs of no-name dedicated domains (even a GitHub Pages site ranks).

**Registry cross-check correction (post-research):** several agent "build" candidates
already exist — uk-student-loan, uk-redundancy-pay, uk-holiday-entitlement (all THREE
have ZERO GSC impressions), uk-nursery-cost (144 impr, pos 60.7), bbq-calculator
(2 impr at pos 8.5 — ranks when shown, barely shown), ibu + priming-sugar (homebrew),
marketplace-fees (187 impr, pos 22.6 — already striking distance), fence (330 impr,
pos 42), paint (331 impr, pos 54). The agents verified those SERPs are winnable by
thin no-name sites, yet our existing pages capture none of that demand. That converts
"build the UK admin cluster" into an **activation problem**: check indexing/coverage,
align titles+content with the exact queries the thin incumbents win, and internal-link
them from the money pages. Only genuinely missing tools remain on the build list.

Build shortlist (genuinely new; score = winnability out of 5, from live SERP checks):
- **Machining (cluster already clicks at low authority)**: bolt-circle / hole-pattern
  5/5 (all incumbents thin), thread-engagement expansion of tap-drill 4/5 (page already
  climbing 47 → 35), chip-load 3/5, surface-finish Ra 3/5 (milling underserved).
- **UK admin**: statutory sick pay / maternity pay 4/5 (the one genuinely missing
  piece of the cluster).
- **Events (ahead of next season)**: baby-shower food 4/5 (SERP is blog worksheets).
- **Workplace**: commute-cost 4/5 (pairs with remote-work-savings pos 8.7); PTO payout
  3/5, severance 3/5.
- **Aquarium**: heater wattage 4/5 (pairs with water-change pos 10.9; the existing
  room AC/heater sizing page is HVAC, not aquarium).
- **Activate instead of build**: UK student-loan (add the overpayment angle the SERP
  rewards), redundancy, holiday-entitlement (pro-rata), nursery-cost (tax-free
  childcare framing), BBQ (meat-per-person query coverage), marketplace-fees (add CA:
  Kijiji/FB/Vinted), homebrew (interlink from abv). Painting job-cost: extend
  paint-calculator with a labor/job-estimate mode rather than a new page.
- **Skip**: gravel/sod (omnicalculator exact-match), moving-truck-size (fold into
  moving-cost instead), housewarming (thin demand), anything Google answers inline.

### Deep-research round — what to improve
1. **Title patterns from pos 8-15 winners**: question-format that previews the answer
   ("How Many Tables & Chairs Do You Need?"), "Free / no signup" in title or meta
   (true for us, omitted everywhere), year in title. Apply to event-seating,
   conference-room, job-offer-comparison, contractor-vs-employee, screen-time.
2. **cooking-time**: own the orphaned "bbc roasting calculator" demand (BBC tool is
   dead; only clones rank) — retitle toward roasting + explicit BBC-alternative H2/FAQ.
3. **raise-calculator**: exact-match domain (raise-calculator.com, year-in-title) owns
   the head term — pivot title to the differentiator (career/compounding value of a
   raise) instead of fighting it.
4. **party-drink**: CTR gap at pos 8.6 is brand trust (Evite/Total Wine on the SERP),
   not title copy — lowest-ROI page for further title tuning; try trust-signal meta +
   schema test instead.
5. **speeds-feeds** (1k impr pos 69): our tool already has 20-material presets + MRR;
   the real depth gap vs FSWizard/Machining Doctor is the tool-material dimension
   (HSS vs carbide vs coated, coolant, tool-life estimate).
6. **moving-cost** (1.8k impr pos 67): highest-volume weak US page — depth pass beats
   building moving-truck-size as a separate page.
7. Deprioritize: water-intake (medical-authority ceiling), pace/compound-interest
   (authority-locked), discount (structurally zero-CTR).

### Recommended actions (priority order)
1. **Ship the www → apex 301** (one line in `public/_redirects` + verify on deploy).
   Cheap, stops an active duplicate-host split on a new money page.
2. **Phase 4 backlinks — still the only lever for the locked UK YMYL head terms**
   (IHT, dividend). Unchanged since February; Keith-gated sends remain the blocker.
3. **Activate the existing UK admin cluster** (student-loan, redundancy,
   holiday-entitlement have ZERO impressions on SERPs thin sites win; nursery-cost
   pos 60.7): indexing check, query-aligned titles/content, internal links from the
   money pages. Build SSP/SMP as the one missing piece.
4. **Machining expansion**: bolt-circle + thread-engagement first; speeds-feeds
   tool-material depth pass.
5. **Striking-set title/meta rewrites** per research patterns (event-seating,
   conference-room, raise, cooking-time/BBC, job-offer, contractor, screen-time).
6. **Events additions** (BBQ, baby-shower) before the autumn/holiday party season.
7. Keith-gated backlog unchanged: outreach sends, directories, Product Hunt, Bing
   Webmaster Tools, CHROMEDRIVER_SKIP_DOWNLOAD env, stale "149 calculators" on
   /advertise.

Next pull ~2026-08-25: compare against this baseline (region tables now in every pull);
check whether the www 301 landed and whether any Phase 4 links finally shipped.

### Status 2026-07-28 (execution, same day)

- **Action 1 partially shipped** (PR #18, merged): striking-set title rewrites +
  country-dimension pulls are live. **The www 301 via `public/_redirects` DOES NOT
  WORK** - Cloudflare Pages `_redirects` does not support domain-level redirects
  (documented; verified live post-deploy: www still 200). KEITH-GATED one-click
  fix: CF dashboard > Rules > Redirect Rules > template "Redirect from WWW to
  Root" (301). Alternatively run `npx wrangler login` in-session and Claude can
  create the rule via API.
- **UK admin activation plan executed** (`docs/uk-admin-activation-plan-2026-07.md`,
  outside-voice reviewed, Keith-approved). Phase 0 diagnosis via the new
  `npm run seo:gsc-inspect` (URL Inspection API): uk-student-loan = "Redirect
  error", last crawled 2026-04-01 (pre-slash-consolidation, never re-crawled);
  uk-redundancy-pay + uk-holiday-entitlement = "URL is unknown to Google" (never
  crawled; both were editorial orphans); nursery-cost = indexed and freshly
  crawled at pos 60 (the authority ceiling, working as expected). All three are in
  the live sitemap — sitemap presence does not get orphans crawled at our
  authority.
- **Phase 1 shipped**: differentiated activation edits (student-loan overpay title;
  holiday pro-rata title; nursery de-staled to 2026 and September-2025 copy
  tensed; redundancy + holiday linked from the uk-tax hub and employer-cost and
  added to llms.txt). **Request Indexing for the three URLs is the remaining
  manual step after deploy.**
- **Phase 2 shipped**: UK Statutory Sick Pay calculator (registry 168 → 169 with
  sign-off; current GOV.UK rules: lower of £123.25/week and 80% of AWE, day one,
  28 weeks; 11 pinning tests). SMP deferred/gated as planned.
- **Structural guards shipped**: postbuild orphan guard (editorial-inbound-links
  check with a ratchet baseline — measurement found **26 orphans** incl.
  cooking-time (3.3k impr), moving-cost (1.8k impr) and uk-mortgage-affordability;
  those three were linked immediately, 23 remain in
  `scripts/seo/known-orphans.json` as shrink-only debt); stale-year title test
  (found and fixed 9 pages shipping "2025" titles — years stripped, not bumped,
  because data currency is unverified); llms.txt registry-parity test.
- **New follow-ups surfaced**: (1) burn down the 23-orphan baseline with a proper
  internal-linking pass; (2) US tax cluster data-currency audit (paycheck,
  quarterly-1040-ES, self-employment, CGT, HSA) — titles de-yeared until the data
  is verified 2026-current; (3) SMP calculator, gated on SSP's time-to-first-
  impression as the domain-vs-pages test.

---

## Timeline Expectations

| Milestone | Timeframe |
|-----------|-----------|
| Pages indexed | 1-2 weeks |
| First organic traffic | 2-4 weeks |
| Ranking page 2-3 | 1-3 months |
| Ranking page 1 for long-tail | 3-6 months |
| Significant traffic | 6-12 months |

---

*Last Updated: 2026-07-18 (GSC follow-through executed: workstreams E, D, B, C shipped; A drafted)*
*Total Live Calculators: 167 (registry count, verified `src/lib/calculators.ts` 2026-07-03)*
