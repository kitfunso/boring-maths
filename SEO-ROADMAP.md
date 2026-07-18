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
