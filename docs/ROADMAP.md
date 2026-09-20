# boring-math.com Roadmap

Live roadmap. Evidence first, then the plan. Every number here regenerates from
`gsc-export/2026-09-20/` with the scripts named beside it.

Opened 2026-09-20.

---

## 1. Where traffic actually stands

28 days to 2026-09-20: **65 clicks, 78,775 impressions, weighted average position 38.2.**
The prior matched window was 111 clicks / 112,225 impressions.

Full diagnosis in `docs/gsc-analysis-2026-09-20.md`. Short version: the 41% click drop is
a 2026-09-02 step change made of non-anglosphere long tail at position ~65 with zero
clicks, plus discount-calculator instant-answer noise. Average position held or improved
on every page that lost clicks. Nothing broke.

### The number that decides the roadmap

Impression mass by position band:

| position | rows | impressions | clicks |
|---|---|---|---|
| 1-3 | 8 | 11 | 0 |
| 3-10 | 121 | 925 | **0** |
| 10-20 | 132 | 370 | 2 |
| 20-30 | 220 | 1,368 | 1 |
| 30-50 | 2,690 | 14,175 | 2 |
| 50-80 | 4,356 | 20,526 | 3 |
| 80+ | 493 | 2,749 | 0 |

**We hold 936 impressions inside the top 10 and take zero clicks from them.** Those
positions are on instant-answer queries (`70% off $80`, `if you spend $3 on coffee per
school/work day`) that Google answers in the SERP. Ranking higher on them pays nothing.

Meanwhile 89% of our impression mass sits at position 30-80, which no on-page change
reaches.

**Conclusion: on-page optimisation of existing pages is exhausted.** The striking-distance
bucket that normally drives this work does not exist here: 5 rows sitewide at position
4-20 with 40+ impressions, 379 impressions, zero clicks.

---

## 2. The Singapore thesis

### The signal

Average position by market, all 43 markets with 50+ impressions. Median is 39.7.

| market | impressions | avg position |
|---|---|---|
| **Hong Kong** | 75 | **18.7** |
| **Singapore** | 142 | **18.9** |
| Finland | 59 | 20.5 |
| Nigeria | 57 | 21.2 |
| Denmark | 72 | 23.0 |
| USA | 44,467 | 29.2 |
| Canada | 2,335 | 30.0 |
| Australia | 2,395 | 31.5 |
| **UK** | 15,013 | **55.8** |
| Malaysia | 427 | 61.6 |
| Indonesia | 622 | 63.6 |

Singapore and Hong Kong are our two best-ranking markets on earth, and we have never
written a line of content for either. They rank more than twice as well as the site
average, on generic pages.

This is not simply "small market flatters the average": Malaysia and Indonesia are also
small and sit at 61-64. The plausible mechanism is an English-language search market with
a small population and few local calculator sites competing.

### The honest caveats

- **142 impressions is a tiny sample.** The error bar on 18.9 is wide.
- **Singapore has produced 0 clicks.** So has every other market in the good-position
  group. Ranking well has not converted anywhere yet.
- Current SG queries are all generic (`pace calculator`, `discount percentage calculator`)
  landing on generic pages. There is no SG-specific demand reaching us because there is no
  SG-specific content.
- If the "lots of Singapore users" impression came from AdSense or Cloudflare rather than
  Search Console, that is a different metric and worth reconciling before we spend build
  time.

---

## 3. The control arm: this play has already failed three times

Before committing to a Singapore cluster, read what the last three country clusters did.

| cluster | calculators | impressions | clicks | weighted position |
|---|---|---|---|---|
| **UK** | 25 | 10,421 | **0** | **65.8** |
| **US** | 14 | 4,203 | 2 | 53.1 |
| **EU** | 5 | 1,544 | 0 | 37.6 |
| whole site | 171 | 78,775 | 65 | 38.2 |

Regenerate: `scripts` in `docs/gsc-analysis-2026-09-20.md`, or the country grouping over
`gsc-pages-28d.json` joined to the `country` field in `src/lib/calculators.ts`.

**44 country-specific calculators have produced 2 clicks from 16,168 impressions.** The UK
cluster ranks at position 65.8, dramatically worse than the 38.2 site average. Building
country-specific calculators is the single most-tested and worst-performing thing this
site has done.

### Why Singapore might still differ

The UK SERP for tax and mortgage calculators is one of the most contested in the world:
gov.uk, MoneySavingExpert, Which?, and every retail bank. Position 65.8 is page 7.

The Singapore case rests entirely on the SERP being thinner. That is an empirical question,
not a hope, and it is the question the research in section 4 exists to answer. The main
risk is the opposite of thin: CPF Board, IRAS, HDB and LTA all publish official
calculators, and a government tool for a government scheme is close to unbeatable.

**If the research says the SG SERP is locked by gov.sg, this roadmap item dies here and
that is the correct outcome.** A fourth failed country cluster is worse than none.

---

## 4. Singapore research

Four research lanes commissioned 2026-09-20: personal tax and CPF; housing and property;
cars, COE and transport; salary, everyday and cross-topic demand. Full findings in
section 4.3.

### 4.1 The SERP check, and why it changes the plan

The thesis in section 2 rests on the Singapore SERP being thinner than the UK one. I
checked three of the research lanes' own top-ranked "winnable" opportunities directly.

**All three are already served by multiple dedicated calculators.**

| opportunity | rated by research as | what actually ranks |
|---|---|---|
| CPF accrued interest | "strongest opportunity in this whole set", "real gap" | smartcalculator.sg, meisays.com, divedeals.sg, plus CPF's own official housing-usage calculator, plus PropertyGuru and Homejourney editorial |
| COE 5 vs 10 year renewal | "thin", "looks winnable", "nobody else surfaces this" | smartcalculator.sg, calculator.meyermotors.sg (a dedicated subdomain), lonutguides, therightworkshop, visionmotoring, carro, MoneySmart, plus LTA's own page |
| HDB resale levy | "thin, no dedicated interactive calculator found", "quick win" | smartcalculator.sg, ec.sg, **hdbcalculator.com** (an entire domain for HDB calculators), plus PropertyGuru and several agent blogs |

`smartcalculator.sg` ranks on **all three**. It is the same archetype as boring-math.com,
except Singapore-native and with topical authority in exactly these niches.

**The Singapore calculator market is not thin. It is densely farmed by local specialist
sites.** The research lanes each looked at their own topic and reported "no dedicated
calculator found"; searching the live SERP contradicts that in every case checked. Treat
the lanes' winnability verdicts as unreliable and re-check any before building.

### 4.2 What the Singapore signal actually means

The position 18.9 number in section 2 is real, but it is measured on **generic** queries:
`pace calculator`, `discount percentage calculator`, `x is what percent of y calculator`,
landing on our generic pages. Nothing in the SG data is CPF, COE or HDB.

So the mechanism is not "Singapore niches are open". It is "fewer sites compete for
generic English calculator terms in the Singapore market". Those are opposite conclusions
with opposite plans:

- Building a CPF/COE/HDB cluster moves us **out of** the market where we rank 18.9 and
  **into** niches held by SG-native specialists, with zero topical authority and 5
  referring domains. That is the UK cluster mistake under a different flag.
- The signal, read correctly, says our Singapore advantage is on the **generic pages we
  already have**.

### 4.3 Scale check

Even winning Singapore outright is a small prize as things stand: 142 impressions in 28
days, 0.18% of the site. It would need to grow roughly 100x to move the 65-click number.
Hong Kong is 75 impressions. This is a market to serve better, not a market to rebuild
the roadmap around.

### 4.4 Research detail

Both completed lanes produced solid rate reference sheets with primary sources, and both
were honest about what they could not verify. Those sheets are worth keeping regardless of
whether we build: they are in the session record, and the unverified items are listed
below so nothing ships on secondary sourcing.

**Cars / COE lane**, verified against LTA onemotoring: ARF tiers (100% to 320% by OMV
band, post-15-Feb-2023), excise duty 20% of OMV, registration fee $350, road tax formulas
for petrol by cc and EV by kW, PARF rebate table (75% down to 50% by age, capped $60,000),
COE rebate = premium x unused months / 120, VES bands (-$22,500 to +$35,000 for 2026).
COE premiums are fortnightly and must never be hardcoded.

*Unverified, do not ship without a primary check:* MAS car loan LTV caps (mas.gov.sg
blocked automated fetch), the post-Feb-2026 PARF cohort table, whether PARF applies to a
renewed-COE car, EV road tax AFC ($350 vs $700, sources disagreed), and the age-based road
tax surcharge (found only on third-party sites).

**Housing lane**, verified against MOF and CPF: BSD bands (1% to 6%, post-15-Feb-2023,
quoted verbatim from MOF), ABSD (SC 0/20/30%, PR 5/25/30%, foreigners 60%, entities 65%),
SSD (16/12/8/4% for purchases from 4 Jul 2025, with a separate table for 11 Mar 2017 to
3 Jul 2025, so purchase date is a required input), EHG/PHG grant amounts, MSR 30% and
TDSR 55% with a 4% stress-test floor and a 70% haircut on variable income, HDB
concessionary rate 2.6%, CPF OA 2.5%, Withdrawal Limit 120% of Valuation Limit, resale
levy table ($15,000 to $55,000 by flat type, half for singles).

*Unverified, do not ship without a primary check:* the CPF valuation/withdrawal/accrued
interest page (404'd), the full IRAS non-owner-occupied property tax table (only partial),
the HDB resale levy official page (secondary sources only), and whether the Family Grant
income ceiling moved with the August 2026 BTO ceiling change.

**Tax and CPF lane**, the best-sourced of the three: CPF contribution rates from 1 Jan
2026 read verbatim from CPF's own PDF (37% total below 55, stepping to 12.5% above 70,
with the graduated sub-$750 formula and the SPR first/second-year tables), the full
OA/SA/MA allocation ratio table, CPF interest (OA 2.5%, SA/MA/RA 4%, plus the extra
interest tiers), Basic Healthcare Sum $79,000, and the 2026 retirement sums (BRS $110,200,
FRS $220,400, ERS $440,800). YA2026 income tax brackets and the full relief list.

This lane also found the single most useful competitive fact in the whole research:

> SmartCalculator.sg is already building this exact suite (allocation, LIFE payout, income
> tax, tax relief optimizer, non-resident tax, retirement, MediSave) and is the incumbent
> across nearly every idea on this list, not just one.

Four independent SG calculator sites had already shipped CPF calculators updated for 2026
before we started looking.

*Unverified, do not ship without a primary check:* SRS caps, the self-employed MediSave
age-by-income table (incomplete), the $80,000 overall relief cap, earned income relief,
and the ERS CPF LIFE payout figure.

*Two traps worth keeping even if we never build:* Course Fees Relief died at YA2026 and
several live competitor calculators still show it; and ERS became 4x BRS (not 3x) on
1 Jan 2025, which an official-looking older MOM PDF still gets wrong. Both are places a
careful build would be more correct than the incumbents.

*One honesty flag:* CPF Board does not publish a CPF LIFE payout formula for arbitrary
balances. Competitor calculators that output a precise monthly payout for a custom balance
are interpolating between three published anchor points and presenting a guess as a fact.
We would not do that.

#### Lane D: salary, employment and everyday, plus a cross-topic demand audit

This lane was the one briefed to hunt for high demand with bad existing tools. It found the
number that settles the whole question:

> **smartcalculator.sg has 219 calculators**, all rate-dated 2026, covering CPF, tax and
> salary, leave and workforce, housing, NS, education, health, cars, retirement, parking,
> relocation and personal finance.

Source: their `/calculators` index, fetched 2026-09-20. Category depth: 41 housing tools,
23 tax and salary, 16 leave and workforce, 14 CPF, 11 car.

Of 14 salary and employment ideas it worked through, **one** is a clean gap: AWS
(13th-month bonus) proration, and it is a gap only because MOM deliberately leaves AWS
contractual, so no authoritative formula exists to build against. It is low volume and
seasonal. Four more are "hard but flankable" with a sharper angle. The rest are saturated.

Rates verified against primary sources this lane: the 2026 CPF contribution table by age
band (employee 20% / employer 17% under 55, OW cap $8,000), MOM notice periods (1 day to
4 weeks by service length), MOM annual leave entitlement (7 days rising to 14), SP Group
Q3 2026 electricity tariff (31.91 c/kWh before GST, a record and up 17%), and PUB water
from 1 Apr 2025 ($3.24/m3 tier 1, $4.39 tier 2, before GST).

Rates it could only source secondhand, and which would need a primary fetch before any
number went live: the MOM foreign worker levy table by sector and tier, the government-paid
maternity and paternity caps, the Part IV overtime coverage thresholds, and the maid levy
concession rules.

*Method caveat the lane stated plainly:* no keyword volume tool was reachable, so "demand"
throughout is inferred from SERP density and from what a competitor with real analytics
chose to build. That is decent evidence of demand and no evidence at all of headroom.

---

## 4.5 Verdict on Singapore

**Do not build the Singapore cluster.** Three independent lines of evidence converge:

1. Country clusters have been run three times and produced 2 clicks from 44 calculators,
   with the UK cluster at position 65.8 against a 38.2 site average (section 3).
2. Every "thin, winnable" niche the research nominated is in fact held by multiple
   dedicated SG-native calculators, `smartcalculator.sg` ranking across all of them, with
   official CPF, IRAS, HDB and LTA tools above them (section 4.1). That one competitor
   runs **219 Singapore calculators**, 2026-dated, against the roughly 9 we would ship.
   Across four research lanes and 14 salary ideas, exactly one clean gap turned up, and it
   is a low-volume seasonal tool (lane D).
3. Our Singapore position advantage is measured on generic queries and generic pages, so
   building SG-specific pages leaves the market where we rank well and enters ones where
   we would start with zero topical authority (section 4.2).

The prize is also small: 142 impressions, 0.18% of the site (section 4.3).

Building it would be the UK cluster mistake under a different flag, and I would rather say
so now than after nine more pages ship. The rate sheets in 4.4 are kept because they are
good and cheap to revive if this decision is revisited.

---

## 4.6 What the data does support

The pattern that actually separates our winners from our losers is not country. It is
competition density.

| page | impressions | clicks | position |
|---|---|---|---|
| coffee-spend-calculator | 1,487 | 9 | **7.8** |
| party-drink-calculator | 3,617 | 14 | **8.3** |
| event-seating-calculator | 1,068 | 1 | 17.2 |
| conference-room-calculator | 2,143 | 2 | 17.7 |
| us-sales-tax-calculator | 2,249 | 0 | 56.2 |
| uk-tax-calculator | 999 | 0 | 59.5 |
| uk-mortgage-affordability-calculator | 2,811 | 0 | 83.5 |

We rank on page one for quirky, specific, low-competition tools and on page six for
commodity finance tools. Every page above position 20 on this site is something odd that
few others bothered to build.

That is the only repeatable signal in the export, and it argues for building more oddities
and none of the standard set. It is also the opposite of what a Singapore tax and property
cluster would be.

**Honest limit on that:** our best page in the world earns 14 clicks in 28 days. Picking
better calculator topics changes the slope, not the order of magnitude.

---

## 5. Staging and the kill gate

*Retained for whenever a country or topic cluster is next proposed. It does not apply to
Singapore, which section 4.5 closes.*

Whatever the research returns, the plan is staged. The control arm in section 3 forbids
building fifteen pages on a thesis that has failed three times.

**Stage 1: build 3.** Pick the three highest (demand x winnability) ideas. Build, ship,
internally link, submit to Search Console.

**Stage 2: measure at 8 weeks.** The kill gate, decided in advance:
- PASS if the three SG pages reach a weighted average position under 25 **and** produce
  any clicks at all.
- FAIL if they land at position 50+ with zero clicks, which is what the UK cluster did.

**Stage 3: on PASS, build out. On FAIL, stop and write it up.** No fourth country cluster.

### Constraints that bind this work

- `CLAUDE.md` rule 5: no calculators added just for SEO. Each must solve a real problem.
  CPF, COE and HDB calculators pass that test on their merits.
- `tests/seo/registry-guard.test.ts` pins the registry at 171 and says bumps need Keith's
  sign-off. This roadmap is the sign-off request.
- `CLAUDE.md` rule 3: no financial advice. These calculators compute, they never recommend.
- Rates must come from primary sources (CPF Board, IRAS, HDB, LTA, MOM) and carry a
  visible "rates as of" date. A stale CPF or ABSD rate is a real-world harm, not a bug.

### Build path already in place

- `src/lib/calculators.ts` already has a `country` field (`UK`, `US`, `EU`). Add `SG`.
- `src/pages/calculators/uk-tax/` is the hub pattern to copy for a Singapore hub.
- No hreflang or locale handling exists anywhere on the site. Worth adding if the SG
  cluster ships, so SG pages are not served to US searchers.

---

## 6. Standing constraint on everything above

Eight separate measurements now point at the same ceiling: **referring domains, about 5.**
The only lever that moves that is off-page, and Keith closed email and outreach on
2026-09-07 ("no emails, in-repo only").

Singapore is worth testing because it is the first idea in this project that routes around
authority instead of fighting it: rank in a market where the competition is thin, rather
than out-rank MoneySavingExpert in one where it is not.
