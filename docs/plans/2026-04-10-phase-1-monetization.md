# Phase 1: Monetization Foundation (Weeks 1-3)

**Goal:** Ship the embed system, B2B landing page, and affiliate config. Get the first free embed deployed on an external site. Start backlink outreach.
**Prerequisites:** Existing 149 calculators, AdSense running, AffiliateBox/AffiliateCard components built.
**Estimated scope:** 8 steps, ~2 weeks of build + 1 week of outreach.

---

## Step 1: Create embed layout and route system
**Files:** `src/layouts/EmbedLayout.astro`, `src/pages/embed/[...slug].astro`, `src/lib/embeds.ts`
**What:**
- `EmbedLayout.astro` - Minimal layout: no nav, no footer, no AdSense, no cookie banner. Just the calculator + "Powered by boring-math.com" badge.
- Dynamic route at `/embed/[calculator-slug]` that loads the same Preact calculator component but in the embed layout.
- `embeds.ts` - Config file with embed settings (allowed origins for white-label, badge toggle).
- Support query params for preset values (e.g., `?price=350000`).
**Verify:** Visit `http://localhost:4321/embed/mortgage-calculator` - should show calculator with badge, no nav/footer.
**Commit:** `feat: add embeddable calculator route system`

## Step 2: Add embed badge component
**Files:** `src/components/embed/EmbedBadge.astro`
**What:**
- Small "Powered by boring-math.com" badge pinned to bottom of embed.
- Links to `https://boring-math.com/calculators/[slug]` (backlink).
- Configurable via `embeds.ts` - hidden when origin is in white-label allowlist.
- Styled to be unobtrusive but visible. Dark/light mode aware.
**Verify:** Badge visible in embed view. Link opens in new tab. Not visible on normal calculator page.
**Commit:** `feat: add powered-by badge for embeds`

## Step 3: Create affiliate partner config
**Files:** `src/lib/affiliates.ts`
**What:**
- Central config mapping calculator slugs to affiliate partners.
- Start with placeholder URLs for: mortgage-calculator, uk-pension-calculator, uk-100k-tax-trap-calculator, compound-interest-calculator, uk-stamp-duty-calculator, inheritance-tax-calculator.
- Each entry: partner name, description, URL, CTA text, tracking ID.
- Export a `getAffiliatesForCalculator(slug)` function.
**Verify:** `npm run build` succeeds. Import and call function in a test.
**Commit:** `feat: add centralized affiliate partner config`

## Step 4: Wire affiliate CTAs into financial calculator pages
**Files:** Modify 6 financial calculator `.astro` pages to use AffiliateBox with config from `affiliates.ts`.
**What:**
- Import `getAffiliatesForCalculator` in each page.
- Add `<AffiliateBox>` below the calculator results section.
- Pages: mortgage, pension, 100k-tax-trap, compound-interest, stamp-duty (SDLT), inheritance-tax.
- Placeholder affiliate URLs for now (swap when partnerships confirmed).
**Verify:** Visit each calculator page. AffiliateBox renders with disclosure. Click tracking fires.
**Commit:** `feat: wire affiliate CTAs into financial calculators`

## Step 5: Build B2B landing page
**Files:** `src/pages/for-business.astro`
**What:**
- Hero: "Add boring-math calculators to your website"
- Live embed demo: mortgage calculator in an iframe
- Pricing table: Free (with badge) / Pro £29/mo (white-label) / Enterprise (custom)
- Calculator catalog snippet (top 20 by category)
- Contact CTA: email link or Calendly booking
- Add to nav/footer as "For Business"
**Verify:** Visit `/for-business`. Demo embed loads. Pricing table renders. Contact link works.
**Commit:** `feat: add B2B landing page`

## Step 6: Add embed snippet generator
**Files:** Add to `/for-business.astro` or new component `src/components/embed/SnippetGenerator.tsx`
**What:**
- Interactive widget on the B2B page.
- User selects a calculator from dropdown, picks dimensions, gets copy-paste iframe code.
- Output: `<iframe src="https://boring-math.com/embed/mortgage-calculator" width="100%" height="600" frameborder="0"></iframe>`
- Preview the embed live as they configure.
**Verify:** Select calculator, copy snippet, paste in a test HTML file, embed loads correctly.
**Commit:** `feat: add embed code snippet generator`

## Step 7: Backlink outreach prep
**Files:** `docs/outreach/targets.md`, `docs/outreach/email-templates.md`
**What:**
- List 30 outreach targets in 3 categories:
  - Finance blogs that could embed mortgage/pension calculators (10)
  - Tool directories to list boring-math.com (10)
  - Forums/communities for organic sharing (10)
- Write 3 email templates:
  - Cold outreach to finance bloggers: "Free calculator widget for your site"
  - Directory submission: standard listing pitch
  - Partnership: for larger sites that might want white-label
- This is the non-code work that will drive both backlinks and B2B revenue.
**Verify:** Documents created with actionable targets and templates.
**Commit:** `docs: add outreach targets and email templates`

## Step 8: Deploy and start outreach
**Files:** None (operational step)
**What:**
- Merge all changes to master, deploy via GitHub Actions.
- Verify embed routes work in production: `https://boring-math.com/embed/mortgage-calculator`
- Send first 10 outreach emails (finance bloggers with free embed offer).
- Submit to 5 tool directories.
- Post B2B landing page link on relevant communities (Indie Hackers, etc.)
**Verify:** Embed works in production. First outreach batch sent. Directory submissions confirmed.
**Commit:** N/A (operational)

---

## Phase 1 success criteria
- [ ] Embed system live and working for all 149 calculators
- [ ] B2B landing page live at `/for-business`
- [ ] Affiliate CTAs on 6 financial calculators
- [ ] 10 outreach emails sent
- [ ] 5 directory submissions made
- [ ] At least 1 external site embedding a calculator

## What comes in Phase 2
- Sign first paying B2B customer (Pro tier)
- Set up Stripe for recurring payments
- Activate real affiliate partnerships (replace placeholder URLs)
- GSC position tracking for financial pages
- Content refresh on striking-distance pages
- Generate Phase 2 plan based on outreach results
