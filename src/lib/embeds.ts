import { getBySlug } from './calculators';

export interface EmbedConfig {
  whitelabelOrigins: readonly string[];
  defaultWidth: string;
  defaultHeight: string;
}

export const embedConfig: EmbedConfig = {
  whitelabelOrigins: [], // Empty for now - populated when customers sign up
  defaultWidth: '100%',
  defaultHeight: '700',
};

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

export function isEmbeddable(slug: string): boolean {
  return (embeddableSlugs as readonly string[]).includes(slug);
}

export function isWhitelabelOrigin(origin: string): boolean {
  return embedConfig.whitelabelOrigins.includes(origin);
}

export function sanitizeDimension(val: string): string {
  return val.replace(/[^0-9.%a-z]/gi, '');
}

export function calculatorUrl(slug: string): string {
  return `https://boring-math.com/calculators/${slug}/`;
}

export function embedUrl(slug: string, absolute = false): string {
  return `${absolute ? 'https://boring-math.com' : ''}/embed/${slug}/`;
}

// The credit link sits in the host page because the embed page is noindex,nofollow; rel="nofollow" follows Google's widget-link guidance.
export function getEmbedSnippet(slug: string, width?: string, height?: string): string {
  const w = sanitizeDimension(width || embedConfig.defaultWidth);
  const h = sanitizeDimension(height || embedConfig.defaultHeight);
  const entry = getBySlug(`/calculators/${slug}/`);
  const name = entry ? entry.title : 'Calculator';
  return `<iframe src="${embedUrl(slug, true)}" width="${w}" height="${h}" frameborder="0" style="border:none;border-radius:12px;" loading="lazy" title="${name}"></iframe>
<p style="font-size:12px;text-align:right;margin-top:4px;"><a href="${calculatorUrl(slug)}" rel="nofollow noopener" target="_blank">${name}</a> by Boring Math</p>`;
}
