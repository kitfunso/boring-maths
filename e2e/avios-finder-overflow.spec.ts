import { test, expect } from '@playwright/test';

/**
 * Layout overflow regression tests for the Avios Destination Finder.
 *
 * Locks the 2026-07-19 production bug where the second travel-date input
 * overflowed the card and was clipped at tablet widths: date inputs sat in
 * a flex row, and flex items (min-width: auto) cannot shrink below a date
 * input's intrinsic width. Grid tracks (minmax(0, 1fr)) can.
 *
 * The sweep asserts, at every breakpoint, that each form control in the
 * island sits fully inside the card, and that the page never scrolls
 * horizontally. Controls inside an intentional overflow-x container
 * (scrollable results table) are exempt.
 */

const PAGE = '/calculators/avios-destination-finder/';

const VIEWPORTS = [
  { width: 320, height: 800 },
  { width: 375, height: 812 },
  { width: 414, height: 896 },
  { width: 768, height: 1024 },
  { width: 841, height: 900 }, // width of the reported clipping screenshot
  { width: 1024, height: 900 },
  { width: 1280, height: 900 },
  { width: 1440, height: 900 },
];

interface OverflowReport {
  islandRight: number;
  offenders: { tag: string; id: string; label: string; right: number; left: number }[];
  scrollWidth: number;
  clientWidth: number;
}

async function collectOverflow(page: import('@playwright/test').Page): Promise<OverflowReport> {
  return page.evaluate(() => {
    const anchor = document.querySelector('#dateFrom');
    const island = anchor?.closest('astro-island');
    if (!island) throw new Error('Avios finder island not found (is #dateFrom present?)');
    // astro-island is display:contents (zero-size rect); measure the Card div it wraps
    const card = island.firstElementChild;
    if (!card) throw new Error('Avios finder card not found inside island');
    const islandRect = card.getBoundingClientRect();

    const inScrollContainer = (el: Element): boolean => {
      let node = el.parentElement;
      while (node && node !== island) {
        const overflowX = getComputedStyle(node).overflowX;
        if (overflowX === 'auto' || overflowX === 'scroll') return true;
        node = node.parentElement;
      }
      return false;
    };

    const controls = island.querySelectorAll('input, select, button, label');
    const offenders: OverflowReport['offenders'] = [];
    for (const el of controls) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue; // hidden
      if (inScrollContainer(el)) continue; // intentionally scrollable region
      if (r.right > islandRect.right + 1 || r.left < islandRect.left - 1) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40),
          right: Math.round(r.right),
          left: Math.round(r.left),
        });
      }
    }

    return {
      islandRight: Math.round(islandRect.right),
      offenders,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
}

test.describe('Avios finder layout overflow sweep', () => {
  for (const viewport of VIEWPORTS) {
    test(`no clipped controls at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(PAGE);

      // Wait for hydration: the island's date input must be interactive
      await expect(page.locator('#dateFrom')).toBeVisible();
      await expect(page.locator('#dateTo')).toBeVisible();

      const report = await collectOverflow(page);

      expect(
        report.offenders,
        `Controls escaping the card at ${viewport.width}px: ${JSON.stringify(report.offenders)}`
      ).toEqual([]);

      expect(
        report.scrollWidth,
        `Page scrolls horizontally at ${viewport.width}px`
      ).toBeLessThanOrEqual(report.clientWidth);
    });
  }
});
