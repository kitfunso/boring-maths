# Monetization Guide

This guide covers how to monetize the Boring Math calculator network through advertising and affiliate partnerships.

---

## Revenue Streams Overview

| Revenue Stream | Effort | Timeline | Potential |
|----------------|--------|----------|-----------|
| **Google AdSense** | Low | 2-4 weeks | $100-500/mo* |
| **Affiliate Links** | Medium | Immediate | $200-1000/mo* |
| **Sponsored Content** | High | 6+ months | Variable |

*Estimates based on 10,000+ monthly visitors

---

## Google AdSense

### Prerequisites for Approval

Before applying, ensure you have:

- [ ] **5+ quality calculators** live
- [ ] **Original content** (300+ words per page)
- [ ] **Privacy Policy** page published
- [ ] **About** page published
- [ ] **Contact** information available
- [ ] **2-4 weeks of traffic** (shows site is active)
- [ ] **No policy violations** (no adult content, hate speech, etc.)

### Application Process

1. **Sign up** at [google.com/adsense](https://www.google.com/adsense)
2. **Add your site** and verify ownership
3. **Add the AdSense code** to your site (temporary verification)
4. **Wait for review** (typically 1-14 days)
5. **Get approved** or address feedback

### Implementation

#### Step 1: Create AdSense Component

Create `src/components/common/AdSense.astro`:

```astro
---
export interface Props {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
}

const {
  slot,
  format = 'auto',
  responsive = true,
  className = ''
} = Astro.props;

// Only show ads in production
const isProd = import.meta.env.PROD;
const publisherId = import.meta.env.PUBLIC_ADSENSE_ID;
---

{isProd && publisherId && (
  <div class={`adsense-container ${className}`}>
    <ins
      class="adsbygoogle"
      style="display:block"
      data-ad-client={publisherId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    />
    <script>
      (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
  </div>
)}
```

#### Step 2: Add to BaseLayout

Add the AdSense script to `BaseLayout.astro`:

```astro
<!-- In <head> section -->
{import.meta.env.PROD && import.meta.env.PUBLIC_ADSENSE_ID && (
  <script
    async
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${import.meta.env.PUBLIC_ADSENSE_ID}`}
    crossorigin="anonymous"
  />
)}
```

#### Step 3: Place Ads in Calculator Layout

Recommended ad placements:

```astro
<!-- Above Calculator (horizontal) -->
<AdSense slot="1234567890" format="horizontal" className="mb-6" />

<!-- Calculator Component Here -->
<FreelanceDayRateCalculator client:load />

<!-- Below Results (rectangle) -->
<AdSense slot="0987654321" format="rectangle" className="mt-6" />

<!-- Sidebar (desktop only) -->
<div class="hidden lg:block">
  <AdSense slot="1122334455" format="vertical" className="sticky top-4" />
</div>
```

### Ad Placement Best Practices

| Position | Ad Type | Notes |
|----------|---------|-------|
| Above calculator | Horizontal banner | High visibility, non-intrusive |
| Below results | Medium rectangle | User engaged, good CTR |
| Sidebar (desktop) | Skyscraper | Use only on desktop |
| In-content | Native ads | Between content sections |

### What to Avoid

- **Don't place ads** that interfere with calculator use
- **Don't exceed** 3-4 ad units per page
- **Don't click** your own ads (instant ban)
- **Don't encourage** users to click ads
- **Don't place ads** near interactive elements
- **Don't hide** content behind ads

### Expected Revenue

| Monthly Pageviews | Estimated Revenue |
|-------------------|-------------------|
| 1,000 | $1-5 |
| 5,000 | $10-25 |
| 10,000 | $25-75 |
| 50,000 | $100-300 |
| 100,000 | $250-750 |

*Based on typical CPMs for calculator/finance niches ($2-5 RPM)

---

## Affiliate Marketing

### How It Works

1. Join affiliate programs for relevant products
2. Add contextual recommendations to calculator pages
3. Earn commission when users purchase through your links
4. FTC requires clear disclosure

### Recommended Affiliate Programs by Calculator Type

#### Finance Calculators

| Program | Commission | Cookie | Best For |
|---------|------------|--------|----------|
| **QuickBooks** | $50-150/sale | 45 days | Freelance, invoicing |
| **FreshBooks** | $55/sale | 120 days | Freelance, invoicing |
| **TurboTax** | $15-25/sale | 30 days | Tax calculators |
| **Wise** | $15-30/referral | 30 days | International payments |
| **Credit Karma** | $2/signup | 30 days | Credit, finance |

#### Wedding Calculators

| Program | Commission | Cookie | Best For |
|---------|------------|--------|----------|
| **The Knot** | $15-50/lead | 30 days | Wedding planning |
| **Zola** | 8%/sale | 30 days | Registry, wedding |
| **Drizly** | 5%/order | 7 days | Alcohol delivery |
| **Total Wine** | 5%/sale | 7 days | Alcohol purchase |

#### General

| Program | Commission | Cookie | Best For |
|---------|------------|--------|----------|
| **Amazon Associates** | 1-10% | 24 hours | Books, products |
| **ShareASale** | Varies | Varies | Multi-merchant |
| **CJ Affiliate** | Varies | Varies | Multi-merchant |
| **Impact** | Varies | Varies | Multi-merchant |

### Implementation

#### Step 1: Create Affiliate Box Component

Create `src/components/common/AffiliateBox.astro`:

```astro
---
export interface AffiliateProduct {
  name: string;
  description: string;
  url: string;
  logo?: string;
  cta?: string;
}

export interface Props {
  title: string;
  products: AffiliateProduct[];
}

const { title, products } = Astro.props;
---

<aside class="bg-gray-50 rounded-xl p-6 my-8 border border-gray-200">
  <p class="text-xs text-gray-500 uppercase tracking-wide mb-3">
    Recommended Tools
  </p>
  <h3 class="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

  <div class="space-y-4">
    {products.map((product) => (
      <a
        href={product.url}
        target="_blank"
        rel="nofollow sponsored noopener"
        class="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-medium text-gray-900">{product.name}</h4>
            <p class="text-sm text-gray-600 mt-1">{product.description}</p>
          </div>
          <span class="text-blue-600 font-medium text-sm whitespace-nowrap ml-4">
            {product.cta || 'Learn More'} →
          </span>
        </div>
      </a>
    ))}
  </div>

  <p class="text-xs text-gray-400 mt-4">
    * We may earn a commission if you sign up through these links.
    <a href="/affiliate-disclosure" class="underline">Learn more</a>
  </p>
</aside>
```

#### Step 2: Add to Calculator Pages

```astro
---
import AffiliateBox from '../../components/common/AffiliateBox.astro';

const affiliateProducts = [
  {
    name: 'QuickBooks Self-Employed',
    description: 'Track income, expenses, and mileage. Separate business and personal.',
    url: 'https://quickbooks.com/?ref=yourcode',
    cta: 'Start Free Trial'
  },
  {
    name: 'FreshBooks',
    description: 'Invoicing, time tracking, and expense management for freelancers.',
    url: 'https://freshbooks.com/?ref=yourcode',
    cta: 'Try Free'
  }
];
---

<!-- After calculator results -->
<AffiliateBox
  title="Tools for Freelancers"
  products={affiliateProducts}
/>
```

### Affiliate Link Best Practices

#### Do:
- **Be transparent** - Always disclose affiliate relationships
- **Be relevant** - Only recommend products related to the calculator
- **Be genuine** - Only recommend products you'd actually use
- **Track performance** - Use unique tracking codes per page
- **Update regularly** - Remove dead links, update commissions

#### Don't:
- **Don't hide disclosures** - FTC requires clear visibility
- **Don't overdo it** - 1-3 affiliate recommendations per page
- **Don't mislead** - Don't imply endorsement that doesn't exist
- **Don't ignore rules** - Follow each program's terms

### FTC Disclosure Requirements

Create `src/pages/affiliate-disclosure.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Affiliate Disclosure | Boring Math Calculators">
  <article class="prose prose-lg max-w-3xl mx-auto">
    <h1>Affiliate Disclosure</h1>

    <p>
      Boring Math Calculators is a participant in affiliate advertising programs
      designed to provide a means for sites to earn advertising fees by linking
      to products and services we recommend.
    </p>

    <h2>How It Works</h2>
    <p>
      Some links on our website are affiliate links. This means if you click on
      the link and purchase a product or service, we may receive a small commission
      at no additional cost to you.
    </p>

    <h2>Our Commitment</h2>
    <p>
      We only recommend products and services that we believe will add value to
      our readers. Our primary goal is to help you make informed decisions with
      our calculators, not to sell you products.
    </p>

    <h2>Identification</h2>
    <p>
      Affiliate links are identified with an asterisk (*) or the text "affiliate
      link" near the link. We also include a brief disclosure near any affiliate
      recommendations.
    </p>

    <h2>Questions</h2>
    <p>
      If you have questions about our affiliate relationships, please contact us
      at [your email].
    </p>
  </article>
</BaseLayout>
```

### Tracking Affiliate Performance

#### Add UTM Parameters

```javascript
// Track which calculator drove the conversion
const affiliateUrl = new URL('https://partner.com/signup');
affiliateUrl.searchParams.set('ref', 'boringmath');
affiliateUrl.searchParams.set('utm_source', 'boringmath');
affiliateUrl.searchParams.set('utm_medium', 'affiliate');
affiliateUrl.searchParams.set('utm_campaign', 'freelance-calculator');
```

#### Track Clicks with Google Analytics

```javascript
// In your AffiliateBox component
gtag('event', 'affiliate_click', {
  'affiliate_partner': 'quickbooks',
  'calculator_page': 'freelance-day-rate',
  'link_position': 'below_results'
});
```

---

## Privacy Policy Requirements

### Required for AdSense

Your privacy policy must include:

1. **What data you collect** (analytics, cookies)
2. **How you use data** (improve service, advertising)
3. **Third-party services** (Google Analytics, AdSense)
4. **Cookie usage** disclosure
5. **User rights** (opt-out options)
6. **Contact information**

### Template Section for AdSense

Add to your privacy policy:

```markdown
## Advertising

We use Google AdSense to display advertisements on our website. Google, as a
third-party vendor, uses cookies to serve ads based on your prior visits to
this and other websites. You may opt out of personalized advertising by
visiting [Google's Ads Settings](https://www.google.com/settings/ads).

## Analytics

We use Google Analytics to understand how visitors use our site. Google
Analytics collects information such as how often users visit the site,
what pages they visit, and what other sites they used prior to coming to
our site. We use this information solely to improve our website.
```

---

## Revenue Optimization

### A/B Testing Ad Placements

Test different configurations:

1. **Above vs. below calculator** - Which has higher CTR?
2. **Number of ads** - 2 vs. 3 vs. 4 units
3. **Ad formats** - Rectangle vs. horizontal
4. **Positions** - Inline vs. sidebar

Track with Google Analytics events.

### Improving AdSense RPM

| Strategy | Impact |
|----------|--------|
| Increase traffic | More impressions |
| Improve page speed | Better viewability |
| Target high-CPM niches | Finance, insurance, software |
| Optimize ad placement | Higher viewability |
| Use responsive ads | Better fill rate |

### Improving Affiliate Conversions

| Strategy | Impact |
|----------|--------|
| Contextual placement | Higher relevance |
| Clear CTAs | Better click-through |
| Trust signals | Logos, ratings |
| Limited options | Reduce decision paralysis |
| Seasonal timing | Tax season, wedding season |

---

## Timeline to Monetization

### Month 1-2: Foundation
- [ ] Build 5+ quality calculators
- [ ] Create required pages (privacy, about, contact)
- [ ] Set up Google Analytics
- [ ] Generate initial traffic

### Month 2-3: AdSense
- [ ] Apply for AdSense
- [ ] Implement ad placements
- [ ] Test and optimize positions
- [ ] Monitor for policy violations

### Month 3-4: Affiliates
- [ ] Join relevant affiliate programs
- [ ] Add contextual recommendations
- [ ] Create affiliate disclosure page
- [ ] Track affiliate performance

### Month 4-6: Optimization
- [ ] A/B test ad placements
- [ ] Optimize affiliate CTAs
- [ ] Scale content creation
- [ ] Build backlinks for traffic

### Month 6+: Scale
- [ ] Add more calculators (10-20)
- [ ] Diversify affiliate programs
- [ ] Consider premium ad networks
- [ ] Explore sponsorship opportunities

---

## Revenue Tracking

### Key Metrics to Monitor

| Metric | Tool | Frequency |
|--------|------|-----------|
| Page views | Google Analytics | Daily |
| Ad impressions | AdSense | Daily |
| Ad RPM | AdSense | Weekly |
| Affiliate clicks | GA Events | Weekly |
| Affiliate conversions | Network dashboards | Weekly |
| Total revenue | All sources | Monthly |

### Monthly Revenue Report Template

```markdown
## Revenue Report - [Month Year]

### Traffic
- Page views: X
- Unique visitors: X
- Avg. session duration: Xm Xs

### AdSense
- Impressions: X
- Clicks: X
- RPM: $X.XX
- Revenue: $X.XX

### Affiliates
- [Partner 1]: X clicks, X conversions, $X.XX
- [Partner 2]: X clicks, X conversions, $X.XX
- Total affiliate revenue: $X.XX

### Total Revenue: $X.XX

### Notes
- [What worked]
- [What to improve]
- [Goals for next month]
```

---

## Legal Considerations

### Required Disclosures

1. **FTC Affiliate Disclosure** - Required for US audiences
2. **AdSense Disclosure** - Required by Google
3. **Privacy Policy** - Required for any data collection
4. **Cookie Consent** - Required for EU audiences (GDPR)

### Tax Considerations

- AdSense income is taxable
- Affiliate income is taxable
- Keep records of all payments
- Consider quarterly estimated taxes
- Consult a tax professional

---

## Resources

### Official Documentation
- [Google AdSense Help](https://support.google.com/adsense)
- [FTC Endorsement Guidelines](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking)
- [Google Analytics Help](https://support.google.com/analytics)

### Affiliate Networks
- [ShareASale](https://www.shareasale.com)
- [CJ Affiliate](https://www.cj.com)
- [Impact](https://impact.com)
- [Amazon Associates](https://affiliate-program.amazon.com)

### Learning Resources
- [AdSense Optimization Tips](https://www.google.com/adsense/start/)
- [Affiliate Marketing Guide](https://ahrefs.com/blog/affiliate-marketing/)

---

*Monetization Guide Version: 1.0.0*
*Last Updated: January 2026*
