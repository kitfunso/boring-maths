import { test, expect } from '@playwright/test';
import { collectOverflow } from './helpers/overflow';

const PAGE = '/calculators/avios-destination-finder/';

const VIEWPORTS = [
  { width: 320, height: 800 },
  { width: 375, height: 812 },
  { width: 414, height: 896 },
  { width: 768, height: 1024 },
  { width: 841, height: 900 },
  { width: 1024, height: 900 },
  { width: 1280, height: 900 },
  { width: 1440, height: 900 },
];

test.describe('Avios finder layout overflow sweep', () => {
  for (const viewport of VIEWPORTS) {
    test(`no clipped controls at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(PAGE);

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
