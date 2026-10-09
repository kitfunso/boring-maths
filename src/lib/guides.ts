// Drives the /guides/ hub and guide breadcrumb schema, so no guide ships without an inbound link.
import { breadcrumbSchema } from './breadcrumbs';

export interface Guide {
  readonly slug: string;
  /** Same text as the visible breadcrumb label on the guide page. */
  readonly name: string;
  readonly blurb: string;
}

export const GUIDES: readonly Guide[] = [
  {
    slug: 'best-uk-tax-calculators-2026',
    name: 'Best UK Tax Calculators 2026',
    blurb:
      'Take-home pay, student loans, salary sacrifice, pensions and the £100k tax trap, compared with HMRC and other UK tools.',
  },
  {
    slug: 'uk-100k-tax-trap-explained',
    name: 'How to Calculate Personal Allowance Over £100k',
    blurb:
      'How much personal allowance you lose over £100k, how the trap works, and how pension contributions restore it.',
  },
  {
    slug: 'salary-sacrifice-uk-guide',
    name: 'Salary Sacrifice UK Guide',
    blurb:
      'When salary exchange beats personal pension contributions, and the real tax and NIC saving.',
  },
  {
    slug: 'best-uk-pension-calculators-2026',
    name: 'Best UK Pension Calculators 2026',
    blurb:
      'Retirement pot projections, salary sacrifice planning and FIRE numbers, compared with Which? and other UK pension tools.',
  },
  {
    slug: 'best-uk-property-calculators-2026',
    name: 'Best UK Property Calculators 2026',
    blurb:
      'Stamp duty (SDLT), mortgage payments, buy vs rent and rental yield, with the Scotland and Wales equivalents.',
  },
  {
    slug: 'best-uk-investment-tax-calculators',
    name: 'Best UK Investment Tax Calculators 2026',
    blurb:
      'Capital gains tax, dividend tax, inheritance tax and the high income child benefit charge.',
  },
  {
    slug: 'best-freelance-calculators-uk',
    name: 'Best Freelance Calculators UK',
    blurb:
      'UK day rate, contractor vs employee, W2 to 1099 conversion, side hustle profit and consulting rates.',
  },
  {
    slug: 'best-us-tax-calculators-2026',
    name: 'Best US Tax Calculators 2026',
    blurb:
      'Federal tax brackets, paycheck withholding, self-employment tax, quarterly estimates and capital gains.',
  },
  {
    slug: 'best-singapore-calculators',
    name: 'Best Singapore Calculators 2026',
    blurb:
      'CPF take-home pay, employer CPF and SDL cost, income tax, Buyer and Seller Stamp Duty, GST and utility bills.',
  },
  {
    slug: 'best-salary-income-calculators',
    name: 'Best Salary and Income Calculators 2026',
    blurb:
      'Hourly to salary, pay raise impact, overtime pay, job offer comparison and remote work savings.',
  },
  {
    slug: 'best-savings-investment-calculators',
    name: 'Best Savings & Investment Calculators',
    blurb:
      'Compound interest, savings goals, net worth, ROI, debt payoff, inflation and emergency fund planning.',
  },
  {
    slug: 'best-business-startup-calculators',
    name: 'Best Business & Startup Calculators',
    blurb:
      'Break even analysis, profit margins, SaaS metrics, startup costs, pricing and employee costs.',
  },
  {
    slug: 'best-home-improvement-calculators',
    name: 'Best Home Improvement Calculators',
    blurb:
      'How much paint, tile, flooring, mulch and fencing you need, plus solar savings and electricity costs.',
  },
  {
    slug: 'best-car-transport-calculators',
    name: 'Best Car and Transport Calculators 2026',
    blurb: 'Electric vs petrol running costs, fuel costs, buy vs lease and CO2 emissions.',
  },
  {
    slug: 'best-health-fitness-calculators',
    name: 'Best Health & Fitness Calculators',
    blurb:
      'BMI, body fat percentage, TDEE, calorie needs, macro splits, sleep cycles and running pace.',
  },
  {
    slug: 'best-baby-family-calculators',
    name: 'Best Baby and Family Planning Calculators 2026',
    blurb:
      'Due date, first-year baby costs, nursery costs, ovulation tracking, pet costs and dog age.',
  },
  {
    slug: 'best-wedding-event-calculators',
    name: 'Best Wedding & Event Calculators',
    blurb:
      'Wedding budget, alcohol quantities, party drinks, catering amounts, seating plans and birthday parties.',
  },
  {
    slug: 'best-homebrewing-calculators',
    name: 'Best Homebrewing Calculators',
    blurb: 'ABV, IBU, mash water and priming sugar, plus candle wax, soap lye and clay shrinkage.',
  },
  {
    slug: 'best-engineering-calculators',
    name: 'Best Engineering Calculators 2026',
    blurb:
      'CNC speeds and feeds, tap drill sizes, pipe flow, Reynolds number, pressure drop and ideal gas law.',
  },
  {
    slug: 'best-math-everyday-calculators',
    name: 'Best Math and Everyday Calculators 2026',
    blurb:
      'Percentages, unit conversion, discounts, tips, age, date differences, currency and GPA.',
  },
];

export const guideHref = (slug: string): string => `/guides/${slug}/`;

/** Breadcrumb schema for a guide page, or null when the path is not a guide. */
export function guideBreadcrumbSchema(pathname: string) {
  const slug = pathname.match(/^\/guides\/([^/]+)\/?$/)?.[1];
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) return null;
  return breadcrumbSchema([
    { name: 'Guides', path: '/guides/' },
    { name: guide.name, path: guideHref(guide.slug) },
  ]);
}
