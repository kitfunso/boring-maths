<!-- hippo:start -->
## Project Memory (Hippo)

Before starting work, load relevant context:
```bash
hippo context --auto --budget 1500
```

When you learn something important:
```bash
hippo remember "<lesson>"
```

When you hit an error or discover a gotcha:
```bash
hippo remember "<what went wrong and why>" --error
```

After completing work successfully:
```bash
hippo outcome --good
```
<!-- hippo:end -->

# CLAUDE.md - boring-math.com

## Project Overview
149 free online calculators (Astro 5 + Preact + Tailwind 4) deployed on Cloudflare Pages. Monetizing through AdSense, affiliate links, and B2B embeddable widgets. See `docs/PRD.md` for full scope and `docs/ARCHITECTURE.md` for technical design.

## Architecture
Static site. No backend. Calculator logic runs client-side in Preact components. Each calculator lives in `src/components/calculators/[Name]/` with its page in `src/pages/calculators/`. Registry of all calculators in `src/lib/calculators.ts`. See `docs/ARCHITECTURE.md`.

## Non-Negotiable Rules

1. **All 149 calculators stay free.** Never paywall existing calculator functionality. Premium means white-label/API/advanced features, not gating what's already free.
2. **Affiliate links must have disclosure.** Every page with affiliate links uses `rel="nofollow sponsored noopener"` and links to `/affiliate-disclosure`. Already enforced in AffiliateBox/AffiliateCard components.
3. **No financial advice.** Calculators are tools. Never add language that could be construed as recommending a specific financial product or action.
4. **Embeds must not break the host site.** Embed pages use EmbedLayout with no external scripts (no AdSense), scoped styles, and sandboxed iframes. Test cross-origin.
5. **Don't add calculators just for SEO.** Every calculator must solve a real problem for a real user. Quality over quantity.
6. **Calculator registry is source of truth.** `src/lib/calculators.ts` drives the homepage count and grid. If a calculator exists as a page but isn't in the registry, it's intentional (hub/guide pages don't count).
7. **AdSense only on full pages, never in embeds.** Embedding AdSense in iframes violates Google's ToS.

## Coding Conventions
- Astro pages in `src/pages/`, interactive Preact components in `src/components/calculators/`
- Shared calculator sections: HeroSection, ContentSection, FAQSection in `components/calculators/shared/`
- Tailwind 4 utility classes. Design tokens via CSS custom properties (`--color-cream`, `--color-accent`, etc.)
- Tests: Vitest for unit, Playwright for e2e
- Pre-commit: husky + lint-staged (eslint, prettier)

## Critical Files
- `src/lib/calculators.ts` - Calculator catalog. Read before adding/modifying calculators.
- `src/lib/affiliates.ts` - Affiliate partner config per calculator. Read before changing CTAs.
- `src/lib/embeds.ts` - Embed allowlist and white-label config. Read before embed changes.
- `src/layouts/CalculatorLayout.astro` - Wraps all calculator pages. Ad slots, affiliate sections here.
- `src/components/common/AffiliateBox.astro` - Multi-product affiliate component with click tracking.
- `astro.config.mjs` - Sitemap, redirects, build config.

## Common Mistakes to Avoid
- Don't confuse hub/guide pages (19 exist) with calculators. They're intentionally excluded from the registry.
- Don't run AdSense in embed routes. Google will ban the account.
- Don't hardcode affiliate URLs in calculator pages. Use `affiliates.ts` config so they can be updated in one place.
- Trailing slashes matter. Site is configured with `trailingSlash: 'never'`. Don't add them.
