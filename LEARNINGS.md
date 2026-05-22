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

---

## Tooling

### X-Bot (`tools/x-bot/`)
Automated Twitter/X content generation and posting:
- Templates in `data/templates.json`
- Calculator data in `data/calculators.json`
- CLI: `python -m src.cli generate`, `post`, `monitor`
- Requires X API credentials + OpenAI key in `.env`

Use for scheduled content posting after manual review of generated drafts.

---

## Task Queue Hygiene

### Archive Completed Tasks
Don't let completed tasks sit in "Active" section — creates confusion when checking for work. Move to DONE.md or separate archive section.

### Empty Backlog Is Success
No tasks = job done. Don't manufacture busywork. Wait for assignment.

---

## Key Documentation

### ADDING_CALCULATORS.md (`docs/ADDING_CALCULATORS.md`)
Comprehensive guide for AI-assisted calculator creation:
- Keyword research criteria and tools
- Input/output definition templates
- Complete file structure (types → calculations → component → page)
- AI prompts for each step
- Testing checklist (functionality, design, accessibility, SEO, performance)
- Example code for every file type

**Use this for every new calculator.** It's the single source of truth for the development workflow.

---

## SEO & AI Search

### AI Overviews / AI Mode is not a separate channel
Google's [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
states AI features "are rooted in our core Search ranking and quality systems." Optimizing
for AI search **is** SEO. Consequences for this repo:

- **No `llms.txt`, no AI markup, no `brand-facts.json`.** Google explicitly says these files
  are not needed and are not used. The existing `public/llms.txt` / `llms-full.txt` are
  harmless but do nothing for Google. Don't build more of them.
- **Eligibility floor = indexed + snippet-eligible.** Nothing extra. `noindex` or JS-blocked
  content is invisible to AI features.
- **Commodity content loses.** Google rewards a unique point of view. Bare calculators with
  generic filler get answered inline by AI Overviews (zero-click). Depth, methodology, and
  UK-specific edge cases are the defence.
- **AEO ≠ separate workstream.** The `aeo-task-2..5` Answer Hub pages are fine as hub/guide
  content — just file them under content expansion, not a parallel "AEO" track. See the
  AI Search section in `SEO-ROADMAP.md`.

---

*Last updated: 2026-05-22*
