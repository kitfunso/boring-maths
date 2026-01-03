# Boring Math Calculators - Design System

## Design Philosophy

> "Make the complex simple, and the simple delightful."

Our design philosophy centers on three core principles:

1. **Trust Through Clarity** - Clean, professional design that instills confidence in calculations
2. **Instant Gratification** - Users see results immediately with zero friction
3. **Quiet Confidence** - The design should be unobtrusive yet sophisticated

---

## Brand Identity

### Brand Personality

| Trait | Expression |
|-------|------------|
| **Trustworthy** | Blue-dominant palette, professional typography |
| **Approachable** | Friendly copy, clear instructions, warm accents |
| **Efficient** | Minimal UI, fast performance, no clutter |
| **Modern** | Clean aesthetics, subtle animations, fresh colors |

### Brand Voice

- **Helpful, not patronizing** - Explain without condescension
- **Confident, not arrogant** - State facts clearly
- **Friendly, not casual** - Professional yet approachable
- **Concise, not terse** - Every word earns its place

---

## Color System

### Primary Palette

Our color system is built around **blue for trust** - the most used color in financial institutions worldwide. Blue communicates reliability, stability, and professionalism.

```css
/* Primary Colors */
--primary-50: #eff6ff;   /* Lightest - backgrounds */
--primary-100: #dbeafe;  /* Light - hover states */
--primary-200: #bfdbfe;  /* Light - borders */
--primary-300: #93c5fd;  /* Medium light */
--primary-400: #60a5fa;  /* Medium - icons */
--primary-500: #3b82f6;  /* Base - buttons, links */
--primary-600: #2563eb;  /* Dark - hover buttons */
--primary-700: #1d4ed8;  /* Darker - active states */
--primary-800: #1e40af;  /* Darkest - text accents */
--primary-900: #1e3a8a;  /* Deepest - rarely used */
```

### Semantic Colors

```css
/* Success - Green for positive results */
--success-50: #f0fdf4;
--success-100: #dcfce7;
--success-500: #22c55e;
--success-600: #16a34a;
--success-700: #15803d;

/* Warning - Amber for cautions */
--warning-50: #fffbeb;
--warning-100: #fef3c7;
--warning-500: #f59e0b;
--warning-600: #d97706;

/* Error - Red for invalid inputs */
--error-50: #fef2f2;
--error-100: #fee2e2;
--error-500: #ef4444;
--error-600: #dc2626;

/* Neutral - Grays for text and backgrounds */
--neutral-50: #f9fafb;   /* Page background */
--neutral-100: #f3f4f6;  /* Card backgrounds */
--neutral-200: #e5e7eb;  /* Borders */
--neutral-300: #d1d5db;  /* Disabled states */
--neutral-400: #9ca3af;  /* Placeholder text */
--neutral-500: #6b7280;  /* Secondary text */
--neutral-600: #4b5563;  /* Body text */
--neutral-700: #374151;  /* Headings */
--neutral-800: #1f2937;  /* Primary text */
--neutral-900: #111827;  /* Maximum contrast */
```

### Color Usage Guidelines

| Element | Color | Reasoning |
|---------|-------|-----------|
| Primary CTA buttons | `primary-500` | High visibility, trust association |
| Calculator card backgrounds | `white` | Clean, professional appearance |
| Page background | `neutral-50` | Subtle contrast with cards |
| Positive results | `success-600` | Universal "good" association |
| Negative results | `error-600` | Clear warning indication |
| Input labels | `neutral-700` | High readability |
| Placeholder text | `neutral-400` | Clearly distinguished |
| Links | `primary-600` | Consistent brand color |
| Focus rings | `primary-500` | Accessibility requirement |

### Color Psychology Application

Research shows that **90% of snap judgments** about products stem from color alone. Our palette is designed to:

1. **Build trust** - Blue dominance (used by 70%+ of financial institutions)
2. **Signal money/growth** - Green for positive financial results
3. **Create urgency without alarm** - Amber for important notes
4. **Ensure clarity** - High contrast text for readability

---

## Typography

### Font Stack

```css
/* Primary - UI and body text */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;

/* Monospace - Numbers and results */
font-family: 'Inter', 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
```

**Why Inter?**
- Excellent **tabular lining figures** for financial data display
- Designed specifically for computer screens
- Open source and free
- Extensive language support
- Variable font for optimal performance

### Type Scale

```css
/* Modular scale: 1.25 (Major Third) */
--text-xs: 0.75rem;    /* 12px - Fine print */
--text-sm: 0.875rem;   /* 14px - Secondary text */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Large body */
--text-xl: 1.25rem;    /* 20px - Small headings */
--text-2xl: 1.5rem;    /* 24px - Section headings */
--text-3xl: 1.875rem;  /* 30px - Page headings */
--text-4xl: 2.25rem;   /* 36px - Hero headings */
--text-5xl: 3rem;      /* 48px - Display text */
```

### Typography Rules

#### 1. Body Text
```css
body {
  font-size: 1rem;           /* 16px minimum */
  line-height: 1.6;          /* Optimal readability */
  color: var(--neutral-700);
  font-feature-settings: "kern" 1, "liga" 1;
}
```

#### 2. Headings
```css
h1, h2, h3, h4 {
  font-weight: 700;
  line-height: 1.2;
  color: var(--neutral-900);
  letter-spacing: -0.02em;  /* Tighter tracking for headings */
}
```

#### 3. Numbers and Results (Critical for Calculators)
```css
.result-value {
  font-feature-settings: "tnum" 1, "lnum" 1;  /* Tabular lining figures */
  font-variant-numeric: tabular-nums lining-nums;
  font-weight: 600;
  letter-spacing: -0.01em;
}
```

**Why Tabular Lining Figures?**
- All digits align vertically (unlike old-style figures)
- Equal width numbers for proper column alignment
- Professional appearance in financial contexts
- Faster scanning and comparison

#### 4. Line Length
```css
.content {
  max-width: 65ch;  /* Optimal 45-75 characters per line */
}
```

### Hierarchy Examples

| Element | Size | Weight | Color | Use Case |
|---------|------|--------|-------|----------|
| Hero Title | 3rem (48px) | 700 | neutral-900 | Homepage hero |
| Page Title | 2.25rem (36px) | 700 | neutral-900 | Calculator page h1 |
| Section Title | 1.5rem (24px) | 600 | neutral-800 | Content sections |
| Card Title | 1.25rem (20px) | 600 | neutral-800 | Calculator cards |
| Body | 1rem (16px) | 400 | neutral-700 | Content text |
| Small | 0.875rem (14px) | 400 | neutral-600 | Supporting text |
| Micro | 0.75rem (12px) | 500 | neutral-500 | Labels, captions |

---

## Spacing System

### Base Unit

All spacing is based on a **4px grid** for pixel-perfect alignment.

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Spacing Application

| Context | Spacing | Example |
|---------|---------|---------|
| Inline elements | `space-2` (8px) | Icon + text |
| Form field gap | `space-4` (16px) | Between inputs |
| Card padding | `space-6` (24px) | Internal padding |
| Section spacing | `space-12` (48px) | Between sections |
| Page margins | `space-4` to `space-8` | Responsive |

---

## Component Design

### Calculator Cards

```
┌─────────────────────────────────────────┐
│  ╭──────╮                               │
│  │ Icon │  Calculator Title             │
│  ╰──────╯                               │
│                                         │
│  Brief description of what this         │
│  calculator does and why it's useful.   │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Try Calculator →                │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Card Styling:**
```css
.calculator-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1),
              0 1px 2px rgba(0,0,0,0.06);
  padding: 24px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.calculator-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1),
              0 4px 6px -2px rgba(0,0,0,0.05);
  transform: translateY(-2px);
}
```

### Calculator Interface

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─ INPUT SECTION ──────────────────────────────────────┐   │
│  │                                                      │   │
│  │   Annual Salary                                      │   │
│  │   ┌──────────────────────────────────────────────┐   │   │
│  │   │ $ 75,000                                     │   │   │
│  │   └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │   Tax Rate                                           │   │
│  │   ┌──────────────────────────────────────────────┐   │   │
│  │   │ 25                                        %  │   │   │
│  │   └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ RESULTS SECTION ────────────────────────────────────┐   │
│  │                                                      │   │
│  │   Your Day Rate                                      │   │
│  │   ╔══════════════════════════════════════════════╗   │   │
│  │   ║  $287.50                                     ║   │   │
│  │   ╚══════════════════════════════════════════════╝   │   │
│  │                                                      │   │
│  │   ┌────────────────┐  ┌────────────────┐            │   │
│  │   │  Hourly Rate   │  │  Monthly       │            │   │
│  │   │  $35.94        │  │  $6,250        │            │   │
│  │   └────────────────┘  └────────────────┘            │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Input Fields

**Default State:**
```css
.input-field {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid var(--neutral-200);
  border-radius: 8px;
  background: white;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
```

**Focus State:**
```css
.input-field:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
```

**Error State:**
```css
.input-field.error {
  border-color: var(--error-500);
  background: var(--error-50);
}
```

### Result Display

**Primary Result (Hero Number):**
```css
.primary-result {
  font-size: 2.25rem;        /* 36px */
  font-weight: 700;
  color: var(--primary-700);
  font-feature-settings: "tnum" 1, "lnum" 1;
  background: var(--primary-50);
  border: 2px solid var(--primary-200);
  border-radius: 12px;
  padding: 20px 24px;
  text-align: center;
}
```

**Secondary Results Grid:**
```css
.secondary-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.result-item {
  background: var(--neutral-50);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.result-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--neutral-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.result-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--neutral-800);
  font-feature-settings: "tnum" 1;
}
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
--bp-sm: 640px;   /* Small tablets */
--bp-md: 768px;   /* Tablets */
--bp-lg: 1024px;  /* Desktop */
--bp-xl: 1280px;  /* Large desktop */
--bp-2xl: 1536px; /* Extra large */
```

### Touch Targets

All interactive elements must meet minimum touch target sizes:

| Element | Minimum Size | Recommended |
|---------|--------------|-------------|
| Buttons | 44px × 44px | 48px × 48px |
| Input fields | 44px height | 48px height |
| Links | 44px tap area | - |
| Checkboxes | 24px × 24px | With 44px tap area |

### Mobile Calculator Layout

```
┌─────────────────────┐
│                     │
│  ┌───────────────┐  │
│  │ Annual Salary │  │
│  │ $ 75,000      │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ Tax Rate      │  │
│  │ 25%           │  │
│  └───────────────┘  │
│                     │
│  ═══════════════════│
│                     │
│  YOUR DAY RATE      │
│  ┌───────────────┐  │
│  │   $287.50     │  │
│  └───────────────┘  │
│                     │
│  ┌──────┐ ┌──────┐  │
│  │$35/hr│ │$6.2k │  │
│  └──────┘ └──────┘  │
│                     │
└─────────────────────┘
```

---

## Micro-interactions

### Button States

```css
.btn-primary {
  background: var(--primary-500);
  color: white;
  transition: background 0.15s ease, transform 0.1s ease;
}

.btn-primary:hover {
  background: var(--primary-600);
}

.btn-primary:active {
  background: var(--primary-700);
  transform: scale(0.98);
}

.btn-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
}
```

### Input Feedback

- **On focus:** Border color change + subtle shadow (150ms)
- **On valid input:** Subtle green checkmark appears
- **On error:** Red border + error message slides in
- **Number input:** Values format as you type (e.g., `75000` → `$75,000`)

### Result Animation

```css
.result-value {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.result-value.updating {
  opacity: 0.5;
  transform: scale(0.98);
}

.result-value.updated {
  animation: pulse 0.3s ease;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
```

---

## Iconography

### Icon Style

- **Style:** Outlined (not filled)
- **Stroke width:** 2px
- **Size:** 24px default, 20px small, 32px large
- **Source:** Heroicons (MIT licensed, designed by Tailwind team)

### Icon Categories

| Category | Icons | Use Case |
|----------|-------|----------|
| **Finance** | dollar-sign, currency, chart | Money calculators |
| **Events** | cake, calendar, users | Wedding, event planning |
| **Time** | clock, calendar | Time-based calculations |
| **Math** | calculator, plus, minus | General calculations |
| **UI** | chevron, arrow, check | Navigation, actions |

### Icon + Text Alignment

```css
.icon-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}
```

---

## Dark Mode (Future Enhancement)

### Color Mapping

| Light Mode | Dark Mode |
|------------|-----------|
| `neutral-50` (bg) | `neutral-900` |
| `white` (cards) | `neutral-800` |
| `neutral-700` (text) | `neutral-200` |
| `primary-500` | `primary-400` |

### Implementation

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: var(--neutral-900);
    --bg-card: var(--neutral-800);
    --text-primary: var(--neutral-100);
    --text-secondary: var(--neutral-300);
  }
}
```

---

## Accessibility Guidelines

### Color Contrast

| Element | Minimum Ratio | Target |
|---------|---------------|--------|
| Body text | 4.5:1 | 7:1 |
| Large text (18px+) | 3:1 | 4.5:1 |
| UI components | 3:1 | 4.5:1 |
| Focus indicators | 3:1 | - |

### Keyboard Navigation

- All interactive elements focusable via Tab
- Focus order matches visual order
- Clear focus indicators (3px ring)
- Escape closes modals/dropdowns
- Enter activates buttons/links

### Screen Reader Support

```html
<!-- Input with label -->
<label for="salary" class="block text-sm font-medium text-neutral-700">
  Annual Salary
</label>
<input
  id="salary"
  type="text"
  inputmode="decimal"
  aria-describedby="salary-help"
  aria-invalid="false"
/>
<p id="salary-help" class="text-sm text-neutral-500">
  Enter your gross annual salary before taxes
</p>

<!-- Live results region -->
<div aria-live="polite" aria-atomic="true">
  <p class="sr-only">Your calculated day rate is $287.50</p>
</div>
```

---

## Design Patterns

### Calculator Layout Pattern

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (nav)                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─ HERO ─────────────────────────────────────────┐     │
│  │  H1: Calculator Name                           │     │
│  │  Subtitle: Brief description                   │     │
│  └────────────────────────────────────────────────┘     │
│                                                         │
│  ┌─ CALCULATOR ───────────────────────────────────┐     │
│  │  Inputs → Results (side by side on desktop)    │     │
│  │  Inputs ↓ Results (stacked on mobile)          │     │
│  └────────────────────────────────────────────────┘     │
│                                                         │
│  ┌─ CONTENT ──────────────────────────────────────┐     │
│  │  How to Use                                    │     │
│  │  Understanding Results                         │     │
│  │  Why This Matters                              │     │
│  └────────────────────────────────────────────────┘     │
│                                                         │
│  ┌─ FAQ ──────────────────────────────────────────┐     │
│  │  Accordion questions                           │     │
│  └────────────────────────────────────────────────┘     │
│                                                         │
│  ┌─ RELATED ──────────────────────────────────────┐     │
│  │  Related calculator cards                      │     │
│  └────────────────────────────────────────────────┘     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

### Form Design Pattern

1. **Labels above inputs** (not inline)
2. **One column on mobile** (no side-by-side)
3. **Optional fields marked** (not required fields)
4. **Help text below inputs** (when needed)
5. **Errors inline** (not in alerts)

---

## Assets & Resources

### Required Assets

| Asset | Format | Sizes |
|-------|--------|-------|
| Logo | SVG | Responsive |
| Favicon | SVG, ICO | 16, 32, 180, 512px |
| OG Image | PNG | 1200×630px |
| Calculator Icons | SVG | 24×24px |

### Design Tools

- **Figma:** Component library and prototypes
- **Heroicons:** Icon library
- **Tailwind CSS:** Implementation framework
- **Inter Font:** Typography (Google Fonts)

### Color Tools

- [Coolors](https://coolors.co) - Palette generation
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Accessibility
- [Tailwind Color Generator](https://uicolors.app/create) - Custom palette

---

## Implementation Checklist

### Per Calculator
- [ ] Uses Inter font with tabular figures for numbers
- [ ] Primary color is blue (`primary-500`)
- [ ] Results displayed in `primary-700` on `primary-50` background
- [ ] Input fields have clear focus states
- [ ] All touch targets ≥ 44px
- [ ] Color contrast meets WCAG AA
- [ ] Results animate smoothly on update
- [ ] Mobile layout is single-column
- [ ] Error states use red consistently
- [ ] Success/positive values use green

### Global
- [ ] Consistent spacing using 4px grid
- [ ] Typography follows type scale
- [ ] Icons from Heroicons library
- [ ] Hover states on all interactive elements
- [ ] Focus visible for keyboard users
- [ ] Responsive at all breakpoints
- [ ] Dark mode support (future)

---

## Design References

### Inspiration Sources

- [Dribbble Calculator Designs](https://dribbble.com/tags/calculator-ui) - Modern UI patterns
- [99designs Calculator Gallery](https://99designs.com/inspiration/designs/calculator) - Professional examples
- [Behance Calculator Projects](https://www.behance.net/search/projects/calculator%20ui) - Creative implementations

### Color Psychology Research

- [Striven: Color Theory's Impact on Conversion](https://www.striven.com/blog/design-psychology-color-theorys-impact-on-conversion-rates)
- [Invesp: Psychology of Color in Conversion](https://www.invespcro.com/blog/psychology-of-color/)
- [Crazy Egg: Financial Website Color Palettes](https://www.crazyegg.com/blog/color-palettes-financial/)

### Typography Best Practices

- [Medium: Fintech Typography - Readable Money](https://medium.com/design-bootcamp/the-elements-of-fintech-typography-part-1-readable-money-b6c1226acbde)
- [A List Apart: Web Typography Tables](https://alistapart.com/article/web-typography-tables/)
- [Locus Digital: Typography in Finance](https://www.locusdigital.com/blog/discover-the-best-practices-for-typography-in-finance)

---

*Design System Version: 1.0.0*
*Last Updated: January 2026*
