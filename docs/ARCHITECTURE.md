# Boring Math Monetization - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  boring-math.com (Astro static site on Cloudflare Pages)       │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ 149 calc │  │ /for-business│  │ /embed/:calculator-slug  │  │
│  │  pages   │  │  landing pg  │  │  iframe-ready versions   │  │
│  └────┬─────┘  └──────┬───────┘  └────────────┬─────────────┘  │
│       │               │                        │                │
│  ┌────┴───────────────┴────────────────────────┴─────────────┐  │
│  │  Monetization Layer                                        │  │
│  │  ┌────────────┐ ┌────────────┐ ┌───────────────────────┐  │  │
│  │  │ AdSense    │ │ Affiliate  │ │ Embed tracker         │  │  │
│  │  │ (auto ads) │ │ CTAs       │ │ (postMessage events)  │  │  │
│  │  └────────────┘ └────────────┘ └───────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
    Google AdSense    Affiliate partners   B2B embed clients
    (display ads)     (Unbiased, Habito,   (IFAs, blogs,
                       VouchedFor, etc.)    comparison sites)
```

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Astro 5 (static) | Already in use. Fast, SEO-friendly, zero JS by default |
| UI | Preact + Tailwind 4 | Already in use. Interactive calculators with minimal bundle |
| Hosting | Cloudflare Pages | Already in use. Free tier, global CDN, fast deploys |
| Ads | Google AdSense | Already configured (pub-id in place). Passive baseline |
| Affiliate tracking | UTM params + data attrs | Already built into AffiliateBox/AffiliateCard components |
| Analytics | Google Search Console | Already connected. Manual CSV export workflow |
| Embed delivery | iframe + postMessage | Lightweight, works cross-origin, no auth needed |
| B2B landing | Static Astro page | No backend needed. Contact form via Formspree/Calendly |

## Repository Structure (new additions marked with *)

```
boring-maths/
├── src/
│   ├── components/
│   │   ├── calculators/        # 149 interactive calculator components
│   │   │   ├── shared/         # Shared calculator sections (Hero, FAQ, Content)
│   │   │   └── [Calculator]/   # Each calculator in its own directory
│   │   ├── common/
│   │   │   ├── AdSense.astro        # AdSense integration
│   │   │   ├── AffiliateBox.astro   # Multi-product affiliate recommendations
│   │   │   ├── AffiliateCard.astro  # Single product affiliate card
│   │   │   ├── SEOHead.astro        # Meta tags, structured data
│   │   │   └── ...
│   │   ├── embed/              # * Embed-specific components
│   │   │   ├── EmbedLayout.astro    # * Minimal layout (no nav/footer/ads)
│   │   │   ├── EmbedBadge.astro     # * "Powered by boring-math.com" badge
│   │   │   └── EmbedTracker.astro   # * PostMessage event tracking
│   │   └── ui/                 # Primitive UI components
│   ├── layouts/
│   │   ├── BaseLayout.astro         # Full site layout
│   │   ├── CalculatorLayout.astro   # Calculator page layout
│   │   ├── CategoryLayout.astro     # Category index layout
│   │   └── EmbedLayout.astro        # * Stripped layout for iframes
│   ├── lib/
│   │   ├── calculators.ts           # Calculator registry (149 entries)
│   │   ├── affiliates.ts            # * Affiliate partner config per calculator
│   │   └── embeds.ts                # * Embed configuration + allowed origins
│   ├── pages/
│   │   ├── calculators/             # 149 calculator pages + category indexes
│   │   ├── embed/                   # * /embed/[calculator-slug] routes
│   │   │   └── [...slug].astro      # * Dynamic route for embeddable versions
│   │   ├── for-business.astro       # * B2B landing page
│   │   ├── index.astro              # Homepage
│   │   └── ...                      # About, privacy, affiliate-disclosure, etc.
│   └── styles/                      # Global CSS
├── docs/
│   ├── PRD.md                       # Product requirements
│   ├── ARCHITECTURE.md              # This file
│   └── plans/                       # Implementation plans
├── scripts/
│   └── seo/                         # GSC analysis pipeline
├── gsc-export/                      # GSC data exports
├── CLAUDE.md                        # AI rules
└── package.json
```

## Embed System Design

### How it works
1. Each calculator gets an embeddable version at `/embed/[calculator-slug]`
2. Uses `EmbedLayout` - no navigation, no footer, no AdSense, minimal chrome
3. Includes `EmbedBadge` - "Powered by boring-math.com" link (free tier)
4. White-label tier removes the badge (paid, controlled by query param + allowed origins)

### Embed URL format
```
# Free embed (with branding)
https://boring-math.com/embed/mortgage-calculator

# White-label (no branding, origin-restricted)
https://boring-math.com/embed/mortgage-calculator?wl=1

# With preset values
https://boring-math.com/embed/mortgage-calculator?price=350000&deposit=35000
```

### Origin allowlist
White-label embeds check `window.location.ancestorOrigins` or `document.referrer` against an allowlist in `src/lib/embeds.ts`. Free embeds work on any origin.

### Tracking
Embeds fire `postMessage` events to parent window on calculator interactions. Also log to a simple analytics endpoint (or just count via Cloudflare Analytics).

## Affiliate Integration

### Existing infrastructure
- `AffiliateBox.astro` - Multi-product recommendation section with click tracking
- `AffiliateCard.astro` - Single product CTA card with disclosure
- `/affiliate-disclosure` page already exists
- Click tracking via `data-partner` and `data-calculator` attributes

### New: Affiliate config file
```typescript
// src/lib/affiliates.ts
export const affiliateConfig: Record<string, AffiliatePartner[]> = {
  'mortgage-calculator': [
    { name: 'Habito', url: 'https://...', cta: 'Compare mortgage deals' },
    { name: 'L&C', url: 'https://...', cta: 'Free mortgage advice' },
  ],
  'uk-pension-calculator': [
    { name: 'PensionBee', url: 'https://...', cta: 'Consolidate pensions' },
  ],
  // ... per-calculator config
};
```

### Rollout order (based on GSC data)
Financial pages are at position 60-90 with zero clicks. Affiliate CTAs should be built now but won't generate revenue until pages rank. Build once, deploy everywhere, wait for traffic.

## B2B Landing Page

### `/for-business` structure
1. Hero: "Add our calculators to your site"
2. Live embed demo (mortgage calculator in an iframe)
3. Pricing table: Free (with badge) / Pro £29/month (white-label) / Enterprise (custom)
4. Calculator catalog (filterable by category)
5. Contact form (Formspree free tier or Calendly link)

### Pricing model
| Tier | Price | Features |
|------|-------|----------|
| Free | £0 | Embed any calculator, "Powered by" badge, no support |
| Pro | £29/month | White-label, priority support, custom colors |
| Enterprise | Custom | Multiple calculators, custom builds, SLA |

## Data Flow

### Ad revenue flow
```
User searches → Lands on calculator page → AdSense displays ads → Google pays RPM
```

### Affiliate revenue flow
```
User completes calculation → Sees contextual CTA → Clicks affiliate link →
Signs up with partner → Partner pays per-lead/commission
```

### B2B revenue flow
```
Business finds /for-business → Embeds free calculator → Sees value →
Upgrades to Pro for white-label → Pays monthly via Stripe/manual invoice
```

### Backlink flywheel
```
Free embeds deployed on client sites → Each embed has "Powered by" backlink →
Domain authority increases → Rankings improve → More traffic → More revenue →
More embed clients (repeat)
```
