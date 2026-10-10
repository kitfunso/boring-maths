import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import sharp from 'sharp';
import type { ColorName } from './calculators';

export type OgCard = {
  readonly title: string;
  readonly tagline: string;
  readonly color: string;
};

// The 500 stop of each ICON_COLORS gradient, so a share card matches the calculator's grid icon.
export const OG_COLORS: Readonly<Record<ColorName, string>> = {
  blue: '#3b82f6',
  green: '#10b981',
  accent: '#c4ff00',
  violet: '#8b5cf6',
  coral: '#f43f5e',
  ocean: '#06b6d4',
  amber: '#f59e0b',
  pink: '#ec4899',
};

export const DEFAULT_OG_CARD: OgCard = {
  title: 'Boring Math',
  tagline: 'Free Online Calculators',
  color: '#c4ff00',
};

type Fonts = Parameters<typeof satori>[1]['fonts'];
let fonts: Fonts | undefined;

function loadFonts(): Fonts {
  const file = (weight: number) =>
    fs.readFileSync(
      path.join(
        process.cwd(),
        'node_modules/@fontsource/inter/files',
        `inter-latin-${weight}-normal.woff`
      )
    );
  fonts ??= [
    { name: 'Inter', data: file(400), weight: 400, style: 'normal' },
    { name: 'Inter', data: file(700), weight: 700, style: 'normal' },
  ];
  return fonts;
}

const box = (style: Record<string, unknown>, children?: unknown) => ({
  type: 'div',
  props: { style, children },
});

export async function renderOgImage({
  title,
  tagline,
  color,
}: OgCard): Promise<Uint8Array<ArrayBuffer>> {
  const card = box(
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #07070a 0%, #141420 50%, #0c0c12 100%)',
      fontFamily: 'Inter',
    },
    [
      box({
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: color,
        opacity: 0.08,
      }),
      box({
        position: 'absolute',
        bottom: '-150px',
        right: '-100px',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: '#a78bfa',
        opacity: 0.06,
      }),
      box(
        {
          maxWidth: '1080px',
          fontSize: '60px',
          fontWeight: 700,
          color: '#f5f2eb',
          marginBottom: '20px',
          textAlign: 'center',
          lineHeight: 1.15,
        },
        title
      ),
      box(
        {
          maxWidth: '960px',
          fontSize: '30px',
          color,
          marginBottom: '40px',
          textAlign: 'center',
          lineHeight: 1.35,
        },
        tagline
      ),
      box({
        width: '400px',
        height: '4px',
        borderRadius: '2px',
        background: `linear-gradient(90deg, #c4ff00, ${color}, #a78bfa)`,
        marginBottom: '30px',
      }),
      box({ display: 'flex', alignItems: 'center', gap: '12px' }, [
        box(
          {
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: '#c4ff00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 700,
            color: '#07070a',
          },
          'B'
        ),
        box({ fontSize: '24px', color: '#8888a0' }, 'Boring Math Calculators'),
      ]),
    ]
  );

  const svg = await satori(card as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: loadFonts(),
  });
  const png = new Resvg(svg, { background: '#07070a' }).render().asPng();
  return new Uint8Array(await sharp(png).webp({ quality: 85 }).toBuffer());
}
