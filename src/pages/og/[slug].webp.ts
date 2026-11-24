import type { APIRoute, GetStaticPaths } from 'astro';
import { calculators, slugOf } from '../../lib/calculators';
import { DEFAULT_OG_CARD, OG_COLORS, renderOgImage, type OgCard } from '../../lib/og-image';

export const getStaticPaths = (() => [
  ...calculators.map((calc) => ({
    params: { slug: slugOf(calc) },
    props: { title: calc.title, tagline: calc.description, color: OG_COLORS[calc.color] },
  })),
  { params: { slug: 'default' }, props: DEFAULT_OG_CARD },
]) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
  new Response(await renderOgImage(props as OgCard), {
    headers: { 'Content-Type': 'image/webp' },
  });
