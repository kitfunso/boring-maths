# Boring Math Calculators - Project Specification

## Project Overview

**Project Name:** Boring Math Calculators
**Project Type:** SEO-Optimized Calculator Network
**Target Audience:** Users searching for specific calculation solutions via long-tail keywords
**Business Model:** Ad revenue (AdSense) + Affiliate commissions

---

## Executive Summary

Boring Math Calculators is a network of highly specific, niche calculators designed to capture long-tail search traffic. Each calculator targets a specific user need that existing generic calculators don't address well, providing immediate value while generating passive revenue through advertising and contextual affiliate recommendations.

---

## Technical Specifications

### Tech Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Astro | 4.x | Static site generation, SEO optimization |
| UI Library | React | 19.x | Interactive calculator components |
| Styling | Tailwind CSS | 4.x | Utility-first styling, responsive design |
| Language | TypeScript | 5.x | Type safety, better IDE support |
| Build Tool | Vite | 6.x | Fast builds, HMR in development |
| Hosting | Vercel | - | Free tier, CDN, automatic deployments |

### Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Edge | Last 2 versions |
| Mobile Safari | iOS 14+ |
| Chrome Android | Android 10+ |

### Performance Requirements

| Metric | Target | Maximum |
|--------|--------|---------|
| Lighthouse Performance | 90+ | - |
| Lighthouse Accessibility | 100 | - |
| Lighthouse SEO | 100 | - |
| First Contentful Paint (FCP) | < 1.0s | 1.5s |
| Largest Contentful Paint (LCP) | < 2.0s | 2.5s |
| First Input Delay (FID) | < 50ms | 100ms |
| Cumulative Layout Shift (CLS) | < 0.05 | 0.1 |
| Time to Interactive (TTI) | < 3.0s | 4.0s |
| Total Page Size | < 500KB | 1MB |

---

## Functional Requirements

### FR-001: Calculator Core Functionality

**Description:** Each calculator must perform accurate calculations in real-time as users input data.

**Acceptance Criteria:**
- [ ] Calculations update instantly on input change (no submit button required)
- [ ] Results display within 16ms of input (60fps)
- [ ] Invalid inputs show clear error messages
- [ ] Edge cases handled gracefully (division by zero, negative values, etc.)
- [ ] Results formatted appropriately (currency, percentages, decimals)

### FR-002: Input Validation

**Description:** All calculator inputs must be validated before processing.

**Acceptance Criteria:**
- [ ] Numeric fields reject non-numeric input
- [ ] Range limits enforced where applicable
- [ ] Required fields indicated visually
- [ ] Error messages are specific and actionable
- [ ] Validation happens on input, not just on blur

### FR-003: Responsive Design

**Description:** All calculators must work seamlessly on all device sizes.

**Acceptance Criteria:**
- [ ] Mobile-first design approach
- [ ] Touch-friendly input controls (min 44px tap targets)
- [ ] Readable on screens from 320px to 2560px wide
- [ ] No horizontal scrolling at any viewport
- [ ] Results visible without scrolling after calculation

### FR-004: Accessibility

**Description:** All calculators must be accessible to users with disabilities.

**Acceptance Criteria:**
- [ ] WCAG 2.1 AA compliance
- [ ] All form fields have associated labels
- [ ] Keyboard navigation fully supported
- [ ] Screen reader compatible
- [ ] Sufficient color contrast (4.5:1 minimum)
- [ ] Focus states clearly visible

### FR-005: SEO Optimization

**Description:** Each calculator page must be optimized for search engine discovery.

**Acceptance Criteria:**
- [ ] Unique, keyword-rich title (55-60 characters)
- [ ] Compelling meta description (150-160 characters)
- [ ] Schema.org `SoftwareApplication` markup
- [ ] FAQ section with `FAQPage` schema
- [ ] Canonical URL specified
- [ ] Open Graph and Twitter Card meta tags
- [ ] Semantic HTML structure (h1, h2, etc.)

### FR-006: Content Requirements

**Description:** Each calculator page must include educational content.

**Acceptance Criteria:**
- [ ] H1 includes primary keyword
- [ ] 300-500 words explanatory content
- [ ] "How to Use" section
- [ ] "Understanding Results" section
- [ ] 5-10 FAQ questions (targeting long-tail keywords)
- [ ] Related calculators section

---

## Non-Functional Requirements

### NFR-001: Scalability

**Description:** Architecture must support scaling to 100+ calculators.

**Acceptance Criteria:**
- [ ] Calculator components follow consistent patterns
- [ ] Adding new calculator takes < 2 hours (including content)
- [ ] Build time < 5 minutes with 50 calculators
- [ ] No performance degradation as calculator count grows

### NFR-002: Maintainability

**Description:** Codebase must be easy to understand and modify.

**Acceptance Criteria:**
- [ ] Separation of concerns (UI, logic, types)
- [ ] Reusable shared components
- [ ] TypeScript for type safety
- [ ] Comprehensive documentation
- [ ] Consistent code style (ESLint, Prettier)

### NFR-003: Security

**Description:** Site must be secure despite no backend.

**Acceptance Criteria:**
- [ ] HTTPS enforced via Vercel
- [ ] No sensitive data stored or transmitted
- [ ] All calculations performed client-side
- [ ] No external API calls for core functionality
- [ ] Content Security Policy headers configured

### NFR-004: Privacy

**Description:** User privacy must be respected.

**Acceptance Criteria:**
- [ ] No user data stored on servers
- [ ] Calculations performed entirely in browser
- [ ] Clear privacy policy
- [ ] Analytics limited to aggregate data
- [ ] No third-party tracking (except AdSense if implemented)

---

## Calculator Specifications

### Initial Calculator Set (Phase 1-4)

#### Calculator 1: Freelance Day Rate Calculator

**Target Keyword:** "freelance day rate calculator with tax adjustment"
**Search Volume:** ~150/month
**Competition:** Low

**Inputs:**
| Field | Type | Range | Default | Required |
|-------|------|-------|---------|----------|
| Annual Salary | Currency | $0 - $1,000,000 | - | Yes |
| Tax Rate | Percentage | 0% - 50% | 25% | Yes |
| Vacation Days | Number | 0 - 60 | 15 | Yes |
| Holidays | Number | 0 - 30 | 10 | No |
| Benefits Value | Currency | $0 - $100,000 | $0 | No |

**Outputs:**
- Gross Day Rate
- Net Day Rate (after tax)
- Hourly Rate
- Monthly Income (at full utilization)
- Annual Income Comparison
- Benefits-Adjusted Comparison

**Formula:**
```
Working Days = 260 - Vacation Days - Holidays
Gross Day Rate = Annual Salary / Working Days
Net Day Rate = Gross Day Rate * (1 - Tax Rate)
Hourly Rate = Net Day Rate / 8
```

---

#### Calculator 2: Wedding Alcohol Estimator

**Target Keyword:** "how much alcohol for wedding calculator"
**Search Volume:** ~200/month
**Competition:** Medium

**Inputs:**
| Field | Type | Range | Default | Required |
|-------|------|-------|---------|----------|
| Guest Count | Number | 10 - 500 | 100 | Yes |
| Event Duration | Hours | 2 - 12 | 5 | Yes |
| Beer Preference | Percentage | 0% - 100% | 40% | Yes |
| Wine Preference | Percentage | 0% - 100% | 40% | Yes |
| Liquor Preference | Percentage | 0% - 100% | 20% | Yes |

**Outputs:**
- Beer (cases/bottles)
- Wine (bottles)
- Liquor (bottles)
- Total Drinks per Person
- Estimated Cost Range
- Shopping List

**Formula:**
```
Drinks Per Guest Per Hour = 1 (industry standard)
Total Drinks = Guest Count * Event Duration * 1
Beer Drinks = Total Drinks * Beer Preference
Wine Drinks = Total Drinks * Wine Preference
Liquor Drinks = Total Drinks * Liquor Preference

Beer Bottles = Beer Drinks / 1 (1 drink = 1 bottle)
Wine Bottles = Wine Drinks / 5 (5 glasses per bottle)
Liquor Bottles = Liquor Drinks / 17 (17 shots per 750ml)
```

---

#### Calculator 3: Hourly to Annual Salary Converter

**Target Keyword:** "hourly rate to salary calculator after tax"
**Search Volume:** ~300/month
**Competition:** Medium

**Inputs:**
| Field | Type | Range | Default | Required |
|-------|------|-------|---------|----------|
| Hourly Rate | Currency | $1 - $500 | - | Yes |
| Hours Per Week | Number | 1 - 80 | 40 | Yes |
| Weeks Per Year | Number | 1 - 52 | 52 | Yes |
| Tax Rate | Percentage | 0% - 50% | 22% | Yes |

**Outputs:**
- Gross Annual Salary
- Net Annual Salary
- Gross Monthly Income
- Net Monthly Income
- Bi-Weekly Pay (gross/net)
- Effective Daily Rate

---

#### Calculator 4: Savings Goal Calculator with Inflation

**Target Keyword:** "savings calculator with inflation adjustment"
**Search Volume:** ~120/month
**Competition:** Low

**Inputs:**
| Field | Type | Range | Default | Required |
|-------|------|-------|---------|----------|
| Goal Amount | Currency | $100 - $10,000,000 | - | Yes |
| Current Savings | Currency | $0 - $10,000,000 | $0 | No |
| Timeline | Months | 1 - 600 | 60 | Yes |
| Expected Inflation | Percentage | 0% - 15% | 3% | Yes |
| Interest Rate | Percentage | 0% - 15% | 4% | No |

**Outputs:**
- Inflation-Adjusted Goal
- Monthly Contribution Needed
- Total Contributions
- Interest Earned
- Real Value at Goal Date
- Purchasing Power Comparison

---

#### Calculator 5: Side Hustle Profitability Calculator

**Target Keyword:** "is my side hustle profitable calculator"
**Search Volume:** ~90/month
**Competition:** Low

**Inputs:**
| Field | Type | Range | Default | Required |
|-------|------|-------|---------|----------|
| Monthly Revenue | Currency | $0 - $100,000 | - | Yes |
| Monthly Expenses | Currency | $0 - $100,000 | - | Yes |
| Hours Per Month | Number | 1 - 300 | - | Yes |
| Hourly Opportunity Cost | Currency | $0 - $200 | - | No |
| Startup Costs | Currency | $0 - $100,000 | $0 | No |

**Outputs:**
- Net Monthly Profit
- Effective Hourly Rate
- True Hourly Rate (with opportunity cost)
- Annual Projected Income
- Months to Break Even
- Profitability Score (1-10)

---

## Content Specifications

### Per-Calculator Content Requirements

| Section | Word Count | Purpose |
|---------|------------|---------|
| Introduction | 50-100 | Hook and value proposition |
| How to Use | 100-150 | Step-by-step instructions |
| Understanding Results | 150-200 | Explanation of outputs |
| Why It Matters | 100-150 | Context and importance |
| FAQ | 300-400 | Long-tail keyword targeting |
| **Total** | **700-1000** | Comprehensive SEO content |

### FAQ Question Types

Each calculator should include FAQs covering:

1. **How-to questions** - "How do I calculate my freelance rate?"
2. **Comparison questions** - "Is freelancing more profitable than employment?"
3. **Definition questions** - "What is a day rate?"
4. **Best practice questions** - "What's a good freelance day rate?"
5. **Scenario questions** - "How much should I charge for 40 hours of work?"

---

## Data & Analytics

### Metrics to Track

| Metric | Tool | Purpose |
|--------|------|---------|
| Page Views | Google Analytics 4 | Traffic measurement |
| Time on Page | GA4 | Engagement quality |
| Calculator Usage | GA4 Events | Feature engagement |
| Bounce Rate | GA4 | Content quality |
| Core Web Vitals | Google Search Console | Performance monitoring |
| Keyword Rankings | Google Search Console | SEO effectiveness |
| Ad Revenue | AdSense | Monetization |
| Click-Through Rate | GA4 + AdSense | Ad optimization |

### Custom Events to Implement

```javascript
// Calculator interaction events
gtag('event', 'calculator_used', {
  'calculator_name': 'freelance_day_rate',
  'calculation_completed': true
});

gtag('event', 'result_viewed', {
  'calculator_name': 'freelance_day_rate',
  'result_type': 'day_rate'
});

gtag('event', 'affiliate_click', {
  'calculator_name': 'freelance_day_rate',
  'affiliate_partner': 'quickbooks'
});
```

---

## Deployment Specification

### Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | localhost:4321 | Local development |
| Preview | *.vercel.app | PR previews |
| Production | boring-math-calculators.vercel.app | Live site |

### CI/CD Pipeline

```
Push to main branch
    ↓
Vercel auto-build triggered
    ↓
Install dependencies (npm ci)
    ↓
Build static site (npm run build)
    ↓
Run Lighthouse CI (optional)
    ↓
Deploy to production CDN
    ↓
Invalidate CDN cache
    ↓
Live within 60 seconds
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_SITE_URL` | Yes | Production URL for sitemap |
| `PUBLIC_GA_ID` | No | Google Analytics 4 ID |
| `PUBLIC_ADSENSE_ID` | No | AdSense publisher ID |

---

## Success Criteria

### Phase 1 (Foundation) - Week 1
- [ ] Astro project initialized and configured
- [ ] Base layout with header/footer
- [ ] Homepage with calculator previews
- [ ] Deployed to Vercel

### Phase 2 (First Calculator) - Week 2
- [ ] Freelance Day Rate Calculator functional
- [ ] Full SEO optimization
- [ ] Content meets specifications
- [ ] Lighthouse scores meet requirements

### Phase 3 (Component Library) - Week 3
- [ ] Shared components extracted
- [ ] Calculator layout template
- [ ] Consistent styling established
- [ ] Documentation updated

### Phase 4 (Scale to 5) - Week 4-5
- [ ] All 5 calculators live
- [ ] All pages indexed by Google
- [ ] No critical accessibility issues
- [ ] All performance targets met

### Phase 5 (SEO) - Week 6
- [ ] Sitemap submitted to Google
- [ ] Schema markup validated
- [ ] Internal linking strategy implemented
- [ ] Content enhanced per calculator

### Phase 6 (Monetization) - Week 7-8
- [ ] AdSense approved
- [ ] Ad placements implemented
- [ ] Affiliate links integrated
- [ ] Analytics configured

---

## Appendix

### A. File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Pages | kebab-case.astro | `freelance-day-rate-calculator.astro` |
| Components | PascalCase.tsx | `FreelanceDayRateCalculator.tsx` |
| Utilities | camelCase.ts | `calculations.ts` |
| Types | camelCase.ts | `types.ts` |
| Styles | kebab-case.css | `global.css` |
| Docs | UPPER_SNAKE_CASE.md | `SPEC.md` |

### B. Git Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Example:**
```
feat(calculator): add freelance day rate calculator

- Implement calculation logic with tax adjustment
- Add React component with form validation
- Create Astro page with SEO optimization
- Include FAQ section targeting long-tail keywords

Closes #1
```

### C. Code Quality Standards

- **TypeScript:** Strict mode enabled
- **ESLint:** Astro recommended rules
- **Prettier:** 2 space indentation, single quotes
- **Commits:** Conventional commit format
- **PRs:** Require passing build before merge

---

*Last Updated: January 2026*
*Version: 1.0.0*
