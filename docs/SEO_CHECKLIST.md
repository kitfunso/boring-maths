# SEO Checklist

Use this checklist before launching each calculator to ensure maximum search visibility.

---

## Per-Calculator Checklist

### Technical SEO

#### Meta Tags
- [ ] **Title tag** is 55-60 characters
  - Format: `[Primary Keyword] | [Secondary Keyword] | Site Name`
  - Example: `Freelance Day Rate Calculator | Compare to Salary + Tax | Boring Math`

- [ ] **Meta description** is 150-160 characters
  - Includes primary keyword
  - Has clear value proposition
  - Contains call-to-action
  - Example: "Calculate your ideal freelance day rate vs. salaried positions. Includes tax adjustments, benefits analysis. Free online calculator."

- [ ] **Canonical URL** is set correctly
  - Points to the preferred version of the page
  - Uses absolute URL with https

- [ ] **Open Graph tags** present
  - `og:title`
  - `og:description`
  - `og:type` (website)
  - `og:url`
  - `og:image` (1200x630px recommended)

- [ ] **Twitter Card tags** present
  - `twitter:card` (summary_large_image)
  - `twitter:title`
  - `twitter:description`

#### Structured Data (Schema.org)

- [ ] **SoftwareApplication schema** implemented
  ```json
  {
    "@type": "SoftwareApplication",
    "name": "Calculator Name",
    "applicationCategory": "FinanceApplication",
    "offers": { "@type": "Offer", "price": "0" }
  }
  ```

- [ ] **FAQPage schema** for FAQ section
  - Minimum 5 questions
  - Each question has complete answer

- [ ] **BreadcrumbList schema** for navigation
  - Home > Calculators > [Calculator Name]

- [ ] Schema validates in [Google Rich Results Test](https://search.google.com/test/rich-results)

#### URL Structure

- [ ] URL is **kebab-case** (hyphen-separated)
- [ ] URL contains **primary keyword**
- [ ] URL is **under 75 characters**
- [ ] No unnecessary parameters or IDs
- [ ] Example: `/calculators/freelance-day-rate-calculator`

---

### On-Page SEO

#### Content Structure

- [ ] **H1 tag** contains primary keyword
  - Only ONE H1 per page
  - Near top of page content

- [ ] **H2 tags** for main sections
  - "How to Use This Calculator"
  - "Understanding Your Results"
  - "Frequently Asked Questions"
  - "Related Calculators"

- [ ] **H3 tags** for subsections as needed

- [ ] Heading hierarchy is logical (no skipping levels)

#### Content Quality

- [ ] **Word count** is 700-1000+ words
  - Introduction: 50-100 words
  - How to Use: 100-150 words
  - Understanding Results: 150-200 words
  - FAQ: 300-400 words

- [ ] **Primary keyword** appears in:
  - [ ] Title tag
  - [ ] H1
  - [ ] First paragraph
  - [ ] At least one H2
  - [ ] Meta description
  - [ ] URL

- [ ] **Secondary keywords** naturally incorporated

- [ ] Content is **original** (not copied from other sources)

- [ ] Content provides **genuine value** (not just keyword stuffing)

#### FAQ Section

- [ ] **5-10 questions** included
- [ ] Questions use **natural language** (how people actually search)
- [ ] Answers are **comprehensive** (100-200 words each)
- [ ] Each FAQ targets a **related long-tail keyword**
- [ ] FAQPage schema markup applied

---

### Technical Performance

#### Core Web Vitals

- [ ] **LCP (Largest Contentful Paint)** < 2.5s
  - Main calculator should load quickly
  - No blocking resources

- [ ] **FID (First Input Delay)** < 100ms
  - Calculator inputs respond immediately
  - No heavy JS blocking main thread

- [ ] **CLS (Cumulative Layout Shift)** < 0.1
  - No elements jumping around on load
  - Image dimensions specified
  - Font fallbacks prevent layout shift

#### Page Speed

- [ ] **Lighthouse Performance** score 90+
- [ ] **Total page weight** < 500KB
- [ ] Images are optimized (WebP, lazy loaded)
- [ ] CSS is minified and purged
- [ ] JavaScript is minimal and deferred

#### Mobile Friendliness

- [ ] Page passes [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [ ] Touch targets are 44px minimum
- [ ] No horizontal scrolling
- [ ] Text readable without zooming (16px minimum)
- [ ] Calculator usable on mobile

---

### Internal Linking

- [ ] **Homepage** links to calculator
- [ ] **Calculator index page** links to calculator
- [ ] Calculator links to **2-3 related calculators**
- [ ] **Breadcrumb navigation** present
- [ ] **Footer** contains calculator link
- [ ] All internal links use **descriptive anchor text** (not "click here")

---

### Accessibility (SEO Impact)

- [ ] All **images have alt text**
- [ ] All **form inputs have labels**
- [ ] **Color contrast** meets WCAG AA (4.5:1)
- [ ] Page is **keyboard navigable**
- [ ] **ARIA attributes** used appropriately
- [ ] **Focus states** clearly visible

---

## Site-Wide Checklist

### Sitemap & Indexing

- [ ] **XML Sitemap** generated and up-to-date
  - Located at `/sitemap.xml`
  - Includes all calculator pages
  - Submitted to Google Search Console

- [ ] **robots.txt** allows crawling
  - Located at `/robots.txt`
  - Sitemap URL included
  - No important pages blocked

- [ ] **Google Search Console** connected
  - Site verified
  - Sitemap submitted
  - No crawl errors

- [ ] **Bing Webmaster Tools** connected
  - Site verified
  - Sitemap submitted

### Site Architecture

- [ ] **Homepage** is discoverable from all pages
- [ ] **Navigation** is consistent across site
- [ ] **No orphan pages** (all pages linked from somewhere)
- [ ] **Flat hierarchy** (pages within 3 clicks of homepage)

### Security (Ranking Factor)

- [ ] **HTTPS** enabled (automatic with Vercel)
- [ ] **No mixed content** warnings
- [ ] **Security headers** configured

---

## Post-Launch Checklist

### Immediate (Within 24 hours)

- [ ] Page appears in site's XML sitemap
- [ ] Request indexing in Google Search Console
- [ ] Verify page loads correctly (no errors)
- [ ] Test calculator functionality
- [ ] Check mobile rendering

### Week 1

- [ ] Page indexed by Google (search `site:yoursite.com/calculator-url`)
- [ ] No Search Console errors for page
- [ ] Check initial keyword rankings
- [ ] Monitor Core Web Vitals in Search Console

### Month 1

- [ ] Track organic traffic to page
- [ ] Monitor keyword position changes
- [ ] Check for any new Search Console issues
- [ ] Review and respond to any featured snippet opportunities

### Ongoing

- [ ] Monthly content freshness review
- [ ] Quarterly performance audit
- [ ] Update content if calculations/laws change
- [ ] Add new FAQs based on user questions
- [ ] Monitor competitor pages

---

## Keyword Research Checklist

Before building a new calculator, verify the keyword opportunity:

### Viability Check

- [ ] **Search volume** is 50-300/month (long-tail sweet spot)
- [ ] **Competition** is low to medium
- [ ] **Search intent** matches a calculator (informational/transactional)
- [ ] No **dominant competitors** (huge sites ranking)
- [ ] **SERP features** show calculators/tools ranking

### Keyword Selection

- [ ] Primary keyword is **3-5 words**
- [ ] Keyword represents a **specific need** (not generic)
- [ ] Can create **meaningful content** around it
- [ ] Has **related keywords** for content expansion
- [ ] **Commercial potential** for affiliates (optional)

### Related Keywords Identified

- [ ] List of **5-10 secondary keywords**
- [ ] **Question-based keywords** for FAQs
- [ ] **Comparison keywords** (X vs Y)
- [ ] **"Best" or "how to" variations**

---

## Tools Reference

| Tool | Purpose | URL |
|------|---------|-----|
| Google Search Console | Index status, performance | search.google.com/search-console |
| Google Rich Results Test | Schema validation | search.google.com/test/rich-results |
| PageSpeed Insights | Core Web Vitals | pagespeed.web.dev |
| Mobile-Friendly Test | Mobile compatibility | search.google.com/test/mobile-friendly |
| Ahrefs Free Tools | Backlink checker | ahrefs.com/backlink-checker |
| AnswerThePublic | Keyword research | answerthepublic.com |
| Google Keyword Planner | Search volume | ads.google.com/keywordplanner |

---

## Quick Reference: Character Limits

| Element | Min | Max | Optimal |
|---------|-----|-----|---------|
| Title tag | 30 | 60 | 55-60 |
| Meta description | 120 | 160 | 150-160 |
| H1 | 20 | 70 | 50-60 |
| URL | - | 75 | 50-60 |
| Alt text | - | 125 | 80-100 |

---

*Checklist Version: 1.0.0*
*Last Updated: January 2026*
