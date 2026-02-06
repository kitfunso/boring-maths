# LEARNINGS.md - Boring Maths

Patterns, gotchas, and things that worked. Read this before starting new work.

---

## Syndication

### Folder Structure
```
syndication/
  [calculator-slug]/
    devto.md      # Full article, frontmatter for API
    twitter.md    # Thread format, numbered tweets
    linkedin.md   # Professional angle
    reddit.md     # Multiple subreddit angles
```

### Platform Patterns

**Dev.to**
- Title pattern: "I built X because [personal problem]"
- Include frontmatter: title, published: false, tags, canonical_url
- Personal story > tutorial style
- "No signup. No email capture. Just math." resonates

**Twitter/X**
- Thread format: 10-15 tweets max
- Lead with a hook, not the tool
- Numbers and specific examples work
- Don't link until final tweet

**LinkedIn**
- Professional transition angle (employee → consultant)
- Credibility framing
- Less personal, more industry insight

**Reddit**
- NEVER link in main post
- Only mention tool in comments IF someone asks
- r/freelance: peer-to-peer helpful tone
- r/personalfinance: educational, numbers-focused
- Check karma requirements before posting

### Core Principle
Teach the math first. Calculator mention comes last, almost as an afterthought. The value is the insight, not the tool.

---

## SEO

### Meta Titles
- 55-60 characters max (SERP truncation)
- Primary keyword near front
- Include secondary benefit: "| Compare to Salary + Tax"

### Schema
- SoftwareApplication for calculators
- FAQPage for FAQ sections
- HowTo for step-by-step guides (added in SEO overhaul)

### Internal Linking
- Category hub pages help distribute authority
- Related calculators section at bottom of each page

---

## Mobile UX

### Tap Lag Fix
```css
touch-action: manipulation;
```
Eliminates 300ms delay on mobile tap. Add to buttons and interactive elements.

### Tables
Use horizontal scroll wrapper on mobile:
```html
<div class="overflow-x-auto">
  <table>...</table>
</div>
```

### View Transitions
CurrencySelector needs manual sync after navigation - state doesn't persist through View Transitions. Force DOM update on `astro:page-load`.

---

## Shareable URLs

### Pattern
Encode calculator state in URL parameters:
```
/calculators/mortgage?principal=250000&rate=6.5&term=30
```

### Implementation
- Read params on load, hydrate form
- Update URL on input change (debounce!)
- Use `replaceState` not `pushState` to avoid cluttering history

---

## Calculator Bugs Encountered

### Hydration Mismatches
If select element shows wrong value after hydration:
```tsx
// Force DOM to match React state
useEffect(() => {
  if (selectRef.current) {
    selectRef.current.value = currentValue;
  }
}, [currentValue]);
```

### Input Validation
- Max values prevent absurd inputs (salary > $10M)
- Guard against division by zero in working days
- Show inline error, don't crash

---

*Last updated: 2026-02-06*
