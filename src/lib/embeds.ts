import { getBySlug } from './calculators';

export interface EmbedConfig {
  /** Origins allowed for white-label (no badge) */
  whitelabelOrigins: readonly string[];
  /** Default iframe dimensions */
  defaultWidth: string;
  defaultHeight: string;
}

export const embedConfig: EmbedConfig = {
  whitelabelOrigins: [], // Empty for now - populated when customers sign up
  defaultWidth: '100%',
  defaultHeight: '700',
};

/** Calculator slugs that have embed pages in src/pages/embed/ */
export const embeddableSlugs: readonly string[] = [
  'bmi-calculator',
  'compound-interest-calculator',
  'fire-calculator',
  'loan-calculator',
  'mortgage-calculator',
  'tip-calculator',
  'uk-100k-tax-trap-calculator',
  'uk-pension-calculator',
  'uk-stamp-duty-calculator',
  'uk-tax-calculator',
] as const;

/** Check if a calculator slug has an embed page */
export function isEmbeddable(slug: string): boolean {
  return (embeddableSlugs as readonly string[]).includes(slug);
}

/** Check if an origin is allowed for white-label embedding */
export function isWhitelabelOrigin(origin: string): boolean {
  return embedConfig.whitelabelOrigins.includes(origin);
}

/** Strip characters that could break HTML attribute context */
export function sanitizeDimension(val: string): string {
  return val.replace(/[^0-9.%a-z]/gi, '');
}

/** Calculator page URL, absolute. Trailing slash included for the same reason as embedUrl. */
export function calculatorUrl(slug: string): string {
  return `https://boring-math.com/calculators/${slug}/`;
}

/** Embed page URL. The trailing slash is load-bearing: the site is trailingSlash 'always'. */
export function embedUrl(slug: string, absolute = false): string {
  return `${absolute ? 'https://boring-math.com' : ''}/embed/${slug}/`;
}

/**
 * Generate embed snippet HTML.
 *
 * The credit link sits in the host page, not the iframe: the iframe document is
 * noindex,nofollow, so a link inside it reaches nobody. rel="nofollow" follows
 * Google's widget-link guidance - this is a referral and attribution link, not
 * a ranking one.
 */
export function getEmbedSnippet(slug: string, width?: string, height?: string): string {
  const w = sanitizeDimension(width || embedConfig.defaultWidth);
  const h = sanitizeDimension(height || embedConfig.defaultHeight);
  const entry = getBySlug(`/calculators/${slug}/`);
  const name = entry ? entry.title : 'Calculator';
  return `<iframe src="${embedUrl(slug, true)}" width="${w}" height="${h}" frameborder="0" style="border:none;border-radius:12px;" loading="lazy" title="${name}"></iframe>
<p style="font-size:12px;text-align:right;margin-top:4px;"><a href="${calculatorUrl(slug)}" rel="nofollow noopener" target="_blank">${name}</a> by Boring Math</p>`;
}
