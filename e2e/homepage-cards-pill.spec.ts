import { test, expect } from '@playwright/test';

/** Mirrors the Avios pill coverage in smoke.spec.ts; kept separate so Task 3's
 *  calculator-page work can land without touching this file. */

test.describe('Cards pill', () => {
  test('filters to the card calculator and carries the rainbow', async ({ page }) => {
    await page.goto('/');

    const pill = page.locator('.category-btn[data-category="Cards"]');
    await expect(pill).toBeVisible();
    await expect(pill).toHaveAttribute('aria-pressed', 'false');

    await pill.click();
    await page.waitForTimeout(400);

    await expect(pill).toHaveAttribute('aria-pressed', 'true');
    const gradient = await pill.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(gradient).toContain('linear-gradient');

    const visible = page.locator('#calculators-grid .calculator-card:not(.hidden)');
    await expect(visible).toHaveCount(1);
    await expect(visible.first()).toHaveAttribute(
      'data-href',
      '/calculators/card-rewards-calculator/'
    );
  });

  test.describe('mobile', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('both hero pills are visible with the filter panel collapsed', async ({ page }) => {
      await page.goto('/');

      await expect(page.locator('#filter-panel')).toHaveClass(/hidden/);
      await expect(page.locator('.category-btn[data-category="Avios"]')).toBeVisible();
      await expect(page.locator('.category-btn[data-category="Cards"]')).toBeVisible();
    });
  });
});
