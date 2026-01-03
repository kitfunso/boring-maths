# Boring Math Calculators

> Free online calculators for everyday math problems. Making boring math easy.

A network of highly specific, niche calculators designed to capture long-tail search traffic and provide genuine value to users searching for specific calculation solutions.

## Overview

This project implements a collection of SEO-optimized calculators targeting specific user needs:

- **Freelance Day Rate Calculator** - Compare freelance rates to salaried positions
- **Wedding Alcohol Estimator** - Calculate alcohol quantities for events
- **Hourly to Annual Salary Converter** - Convert hourly rates with tax adjustments
- **Savings Goal Calculator** - Plan savings with inflation adjustment
- **Side Hustle Profitability Calculator** - Analyze side business viability

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Astro](https://astro.build) | Static site generation, SEO optimization |
| [React](https://react.dev) | Interactive calculator components |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Vercel](https://vercel.com) | Hosting & deployment |

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/boring-math-calculators.git

# Navigate to project directory
cd boring-math-calculators

# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:4321`

### Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start development server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |
| `npm run astro` | Run Astro CLI commands |

## Project Structure

```
boring-math-calculators/
├── src/
│   ├── layouts/
│   │   ├── BaseLayout.astro         # Global layout (header, footer, SEO)
│   │   └── CalculatorLayout.astro   # Calculator page layout
│   │
│   ├── components/
│   │   ├── common/                  # Shared UI components
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   └── SEOHead.astro
│   │   │
│   │   └── calculators/             # Calculator components
│   │       ├── shared/              # Reusable calculator parts
│   │       │   ├── InputField.astro
│   │       │   ├── ResultDisplay.astro
│   │       │   └── CalculatorCard.astro
│   │       │
│   │       └── FreelanceDayRate/    # Individual calculator
│   │           ├── FreelanceDayRateCalculator.tsx
│   │           ├── calculations.ts
│   │           └── types.ts
│   │
│   ├── pages/
│   │   ├── index.astro              # Homepage
│   │   └── calculators/             # Calculator pages
│   │       └── freelance-day-rate-calculator.astro
│   │
│   ├── styles/
│   │   └── global.css               # Global styles + Tailwind
│   │
│   └── utils/                       # Utility functions
│       ├── formatters.ts
│       └── validators.ts
│
├── public/                          # Static assets
│   ├── favicon.svg
│   └── robots.txt
│
├── docs/                            # Documentation
│   ├── SPEC.md                      # Project specifications
│   ├── DESIGN.md                    # Design system
│   ├── ADDING_CALCULATORS.md        # How to add calculators
│   ├── SEO_CHECKLIST.md             # SEO checklist
│   └── MONETIZATION.md              # Monetization guide
│
├── astro.config.mjs                 # Astro configuration
├── tailwind.config.mjs              # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json
```

## Adding New Calculators

See [docs/ADDING_CALCULATORS.md](docs/ADDING_CALCULATORS.md) for a step-by-step guide on creating new calculators.

**Quick summary:**

1. Research long-tail keyword (< 200 monthly searches)
2. Create calculator folder in `src/components/calculators/`
3. Implement `types.ts`, `calculations.ts`, and `Calculator.tsx`
4. Create page in `src/pages/calculators/`
5. Write SEO content (300-500 words + 5-10 FAQs)
6. Test and deploy

## Documentation

| Document | Description |
|----------|-------------|
| [SPEC.md](docs/SPEC.md) | Complete project specifications |
| [DESIGN.md](docs/DESIGN.md) | Design system and visual guidelines |
| [ADDING_CALCULATORS.md](docs/ADDING_CALCULATORS.md) | How to create new calculators |
| [SEO_CHECKLIST.md](docs/SEO_CHECKLIST.md) | Pre-launch SEO checklist |
| [MONETIZATION.md](docs/MONETIZATION.md) | AdSense and affiliate setup |

## Design System

Our design is built on principles of trust and clarity:

- **Color:** Blue-dominant palette for trust (used by 70%+ of financial institutions)
- **Typography:** Inter font with tabular lining figures for numbers
- **Layout:** Mobile-first, single-column calculator inputs
- **Accessibility:** WCAG 2.1 AA compliant

See [docs/DESIGN.md](docs/DESIGN.md) for the complete design system.

## Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | 90+ |
| First Contentful Paint | < 1.0s |
| Largest Contentful Paint | < 2.0s |
| Cumulative Layout Shift | < 0.1 |

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

The site auto-deploys on push to `main` branch when connected to Vercel.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_SITE_URL` | Yes | Production URL for sitemap |
| `PUBLIC_GA_ID` | No | Google Analytics 4 ID |
| `PUBLIC_ADSENSE_ID` | No | AdSense publisher ID |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-calculator`)
3. Commit your changes (`git commit -m 'feat: add new calculator'`)
4. Push to the branch (`git push origin feature/new-calculator`)
5. Open a Pull Request

### Commit Message Format

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
```

## License

MIT License - See [LICENSE](LICENSE) for details.

## Acknowledgments

- [Astro](https://astro.build) - The web framework
- [Tailwind CSS](https://tailwindcss.com) - Styling framework
- [Heroicons](https://heroicons.com) - Icon library
- [Inter Font](https://rsms.me/inter/) - Typography

---

Built with Astro and deployed on Vercel.
