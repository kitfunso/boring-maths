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

/** Generate embed snippet HTML */
export function getEmbedSnippet(slug: string, width?: string, height?: string): string {
  const w = width || embedConfig.defaultWidth;
  const h = height || embedConfig.defaultHeight;
  return `<iframe src="https://boring-math.com/embed/${slug}" width="${w}" height="${h}" frameborder="0" style="border:none;border-radius:12px;" loading="lazy"></iframe>`;
}
