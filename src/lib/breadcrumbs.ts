const SITE_URL = 'https://boring-math.com';

export interface Crumb {
  readonly name: string;
  /** Site-relative path in the served trailing-slash form. */
  readonly path: string;
}

/** BreadcrumbList JSON-LD. Every trail starts at Home, so this prepends it. */
export function breadcrumbSchema(trail: readonly Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}
