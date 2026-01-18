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

### Phase 1: Get Indexed
- [ ] Set up Google Search Console
- [ ] Verify domain ownership
- [ ] Submit sitemap
- [ ] Request indexing for top 10 pages
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
- [ ] Post to 3 relevant subreddits
- [ ] Submit to Product Hunt
- [ ] Sign up for HARO
- [ ] Submit to tool directories

### Phase 5: Technical ✅ COMPLETE
- [x] Internal linking audited (3-4 related per page, category hierarchy)
- [x] PageSpeed analyzed (already well-optimized)
- [x] No critical issues found

### Phase 6: Content ✅ COMPLETE
- [x] All 76 calculators have 6+ FAQs
- [x] All pages have "How to use" sections
- [x] All pages have "Understanding results" sections
- [x] Enhanced high-traffic pages (mortgage, BMI, compound interest)

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

*Last Updated: January 2026*
