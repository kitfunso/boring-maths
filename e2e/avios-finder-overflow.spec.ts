import { test, expect } from '@playwright/test';
import { collectOverflow } from './helpers/overflow';

/**
 * Layout overflow regression tests for the Avios Destination Finder.
 *
 * Locks the 2026-07-19 production bug where the second travel-date input
 * overflowed the card and was clipped at tablet widths: date inputs sat in
 * a flex row, and flex items (min-width: auto) cannot shrink below a date
 * input's intrinsic width. Grid tracks (minmax(0, 1fr)) can. The two native
 * date inputs are now a single #dateRange trigger button (the calendar popover),
 * so the sweep anchors on #dateRange.
 *
 * The sweep asserts, at every breakpoint, that each form control in the
 * island sits fully inside the card, and that the page never scrolls
 * horizontally. Controls inside an intentional overflow-x container
 * (scrollable results table) are exempt.
 *
 * A second per-viewport check opens the date-range popover and asserts it is
 * not clipped: the Card sets overflow-hidden, so the popover is position:fixed
 * against the viewport. Because a card-clipped dialog shrinks rather than
 * escapes, viewport containment alone is blind to the failure, so the check
 * also asserts a sane dialog width and that the last weekday header is on-screen.
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

test.describe('Avios finder layout overflow sweep', () => {
  for (const viewport of VIEWPORTS) {
    test(`no clipped controls at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(PAGE);

      // Wait for hydration: the island's date-range trigger must be interactive
      await expect(page.locator('#dateRange')).toBeVisible();

      const report = await collectOverflow(page, '#dateRange');

      expect(
        report.offenders,
        `Controls escaping the card at ${viewport.width}px: ${JSON.stringify(report.offenders)}`
      ).toEqual([]);

      expect(
        report.scrollWidth,
        `Page scrolls horizontally at ${viewport.width}px`
      ).toBeLessThanOrEqual(report.clientWidth);

      // Popover sweep (amendment 2): the fixed date-range dialog must not be
      // clipped by the card's overflow-hidden. Run this AFTER collectOverflow so
      // the popover's own buttons are not measured by the overflow sweep.
      const dialog = page.locator('[role="dialog"]');
      // Retry the click until the dialog opens: the trigger's handler attaches
      // only once the client:load island hydrates (a bare click can land on the
      // pre-hydration SSR button). Opening is idempotent, so retrying is safe.
      await expect(async () => {
        await page.locator('#dateRange').click();
        await expect(dialog).toBeVisible({ timeout: 1000 });
      }).toPass({ timeout: 15000 });

      const pop = await page.evaluate(() => {
        const el = document.querySelector('[role="dialog"]');
        if (!el) throw new Error('date-range dialog not found after opening #dateRange');
        const rect = el.getBoundingClientRect();
        const headers = el.querySelectorAll('[role="columnheader"]');
        const last = headers[headers.length - 1].getBoundingClientRect();
        return {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          lastHeaderLeft: Math.round(last.left),
          lastHeaderRight: Math.round(last.right),
          clientWidth: document.documentElement.clientWidth,
        };
      });

      expect(pop.left, `Dialog left off-screen at ${viewport.width}px`).toBeGreaterThanOrEqual(-1);
      expect(pop.right, `Dialog right clipped at ${viewport.width}px`).toBeLessThanOrEqual(
        pop.clientWidth + 1
      );
      expect(
        pop.width,
        `Dialog shrank (card-clipped) at ${viewport.width}px: ${pop.width}px`
      ).toBeGreaterThanOrEqual(280);
      expect(
        pop.lastHeaderLeft,
        `Last weekday header off left edge at ${viewport.width}px`
      ).toBeGreaterThanOrEqual(-1);
      expect(
        pop.lastHeaderRight,
        `Last weekday header clipped at ${viewport.width}px`
      ).toBeLessThanOrEqual(pop.clientWidth + 1);

      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
    });
  }
});
