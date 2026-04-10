# Boring Math Monetization Strategy - PRD

## One-Line Description
Turn boring-math.com's 149 free calculators into £1,000/month revenue through a multi-channel strategy that doesn't depend on SEO alone.

## Problem Statement
boring-math.com has 149 live calculators, solid on-page SEO, and 22K monthly impressions but generates only £4.65/month from AdSense. The site has demand (impressions) but no authority (positions 60-90 for high-value queries). Organic traffic growth will take 6-12 months to reach monetizable levels. The owner has 5+ hours/week and up to £50/month to invest, and needs revenue channels that work at low traffic AND build toward scale.

## Target Users (Revenue Sources)

### Consumer visitors (current)
- People searching for calculators on Google
- 23 clicks/month, 22K impressions, mostly position 60-90
- Will grow with backlinks/authority but slowly

### B2B customers (new channel)
- Finance blogs, IFA firms, estate agents, comparison sites
- Need embeddable calculators for their own sites
- Willing to pay £200-2,000 for branded/white-label calculator widgets

### Affiliate partners (new channel)
- Mortgage brokers, pension advisers, ISA platforms, tax accountants
- Want high-intent leads from calculator users
- Pay £20-80 per qualified lead or rev-share on sign-ups

## Core Features (MVP Monetization Stack)

1. **Embeddable widget system** - Iframe-ready calculator exports with "Powered by boring-math.com" backlink. Free tier (with branding) and paid tier (white-label). Solves backlink problem AND generates B2B revenue simultaneously.

2. **Affiliate CTA component** - Contextual call-to-action below calculator results on financial pages. "Compare mortgage deals" / "Speak to a pension adviser". Track clicks via UTM parameters.

3. **AdSense optimization** - Ensure ad placement is optimized on all 149 calculators. Auto ads enabled. This is passive baseline revenue that scales with traffic.

4. **Landing page for B2B sales** - `/for-business` page showcasing the calculator library, embed demo, and pricing. Contact form or Calendly link.

5. **Backlink campaign execution** - Not a product feature but a revenue prerequisite. Structured outreach to move high-impression pages from position 60+ to position <20.

## Revenue Model

| Channel | Month 1 | Month 2 | Month 3 | Dependency |
|---------|---------|---------|---------|------------|
| AdSense | £5 | £15 | £40 | Traffic growth via backlinks |
| B2B widget sales | £0 | £200 | £500 | Build embed system + outreach |
| Affiliate/lead gen | £0 | £0 | £50 | Financial pages need to rank first |
| Sponsored calculators | £0 | £0 | £200 | Requires B2B pipeline |
| **Total** | **£5** | **£215** | **£790** | |

Reaching £1,000/month likely takes month 4-5 at this trajectory. Month 3 target: £790. Being honest about the ramp.

## What This Product IS NOT

1. **NOT a SaaS product** - We are not building user accounts, dashboards, or subscription billing for consumers. Monetization wraps around the free product.
2. **NOT a calculator marketplace** - We don't host other people's calculators. We build and own everything.
3. **NOT a financial advice platform** - Calculators are tools, not advice. All affiliate CTAs must include appropriate disclaimers.
4. **NOT a content farm** - We don't add calculators just for SEO. Every calculator must solve a real problem.
5. **NOT a paid-to-use site** - Core calculators stay free forever. Premium means advanced features, API access, or white-label, not paywalling existing content.
6. **NOT an agency** - We sell self-serve embeddable widgets, not custom development projects (unless the price justifies it at £2K+).
7. **NOT dependent on a single channel** - If AdSense dies, affiliate and B2B still work. No single point of revenue failure.

## Success Metrics

| Metric | Now | Month 1 | Month 3 | Month 6 |
|--------|-----|---------|---------|---------|
| Monthly clicks (GSC) | 23 | 80 | 300 | 1,000 |
| Monthly revenue | £4.65 | £10 | £790 | £1,500 |
| Pages in top 20 | 2 | 5 | 15 | 30 |
| B2B leads contacted | 0 | 20 | 60 | 100 |
| Embeds deployed | 0 | 0 | 5 | 20 |
| Backlinks acquired | ~0 | 5 | 20 | 50 |

## Constraints

- **Budget:** £50/month max. No paid ads. Tools only (directory listings, email tools, etc.)
- **Time:** 5+ hours/week for outreach, content, partnerships
- **Technical:** Astro static site on Cloudflare. No server-side rendering. Embeds must work as iframes or web components.
- **Legal:** Financial calculators need "not financial advice" disclaimers. Affiliate links need disclosure page (already exists at /affiliate-disclosure).
- **Solo operator:** No team. Every process must be automatable or low-maintenance after setup.
