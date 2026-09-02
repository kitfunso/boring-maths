import { test, expect } from '@playwright/test';
import { collectOverflow } from './helpers/overflow';
import { CARDS } from '../src/components/calculators/CardPerksCalculator/data/cards';

/** Must not depend on any card name/id except the anchors fixed at wave-1: amex-platinum, barclaycard-avios-plus, chase-debit. */

const PAGE = '/calculators/card-rewards-calculator/';
const TABLE_NAME = 'Cards ranked by estimated net value';

test.describe('Card Rewards & Perks Calculator', () => {
  test('loads with a heading and a ranked table of at least 20 cards', async ({ page }) => {
    await page.goto(PAGE);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Card Rewards & Perks Calculator' })
    ).toBeVisible();

    const table = page.getByRole('table', { name: TABLE_NAME });
    const rowCount = await table.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThanOrEqual(20);
  });

  test('changing a spend input changes the top row net value text', async ({ page }) => {
    await page.goto(PAGE);
    const table = page.getByRole('table', { name: TABLE_NAME });
    const netCellBefore = await table.locator('tbody tr').first().locator('td').last().innerText();

    const groceries = page.locator('#spend-groceries');
    await expect(groceries).toBeVisible();
    await page.waitForTimeout(300); // Preact hydration, same convention as smoke.spec.ts

    await groceries.fill('20000');
    await groceries.blur();

    await expect
      .poll(() => table.locator('tbody tr').first().locator('td').last().innerText())
      .not.toBe(netCellBefore);
  });

  test('a card-type chip filter reduces the row count', async ({ page }) => {
    await page.goto(PAGE);
    const table = page.getByRole('table', { name: TABLE_NAME });
    const before = await table.locator('tbody tr').count();

    const chip = page
      .getByRole('group', { name: 'Filter by card type' })
      .getByRole('button', { name: 'Debit card' });
    await expect(chip).toBeVisible();
    await page.waitForTimeout(300); // Preact hydration, same convention as smoke.spec.ts

    await chip.click();

    await expect.poll(() => table.locator('tbody tr').count()).toBeLessThan(before);
  });

  test('expanding a row reveals its breakdown', async ({ page }) => {
    await page.goto(PAGE);
    const table = page.getByRole('table', { name: TABLE_NAME });
    const expandButton = table.locator('tbody tr').first().getByRole('button');

    await expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    const rowId = await expandButton.getAttribute('aria-controls');
    if (!rowId) throw new Error('Expand button has no aria-controls');
    await page.waitForTimeout(300); // Preact hydration, same convention as smoke.spec.ts

    await expandButton.click();
    await expect(expandButton).toHaveAttribute('aria-expanded', 'true');

    const breakdownRow = page.locator(`#${rowId}`);
    await expect(breakdownRow).toBeVisible();
    await expect(breakdownRow.getByText('Welcome bonus')).toBeVisible();
  });

  test('both table wrappers are keyboard-focusable labelled regions', async ({ page }) => {
    await page.goto(PAGE);
    const regions = page.locator(
      'div[role="region"][tabindex="0"][aria-label$="scrolls sideways"]'
    );
    await expect(regions).toHaveCount(2);
  });

  test('has no sponsored/affiliate links and no direct issuer source links', async ({ page }) => {
    await page.goto(PAGE);

    expect(await page.locator('a[rel~="sponsored"]').count()).toBe(0);

    const sourceHosts = new Set(
      CARDS.map((c) => new URL(c.sourceUrl).hostname.replace(/^www\./, ''))
    );
    const hrefs = await page
      .locator('a[href]')
      .evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).href));

    for (const href of hrefs) {
      let host: string;
      try {
        host = new URL(href).hostname.replace(/^www\./, '');
      } catch {
        continue;
      }
      expect(sourceHosts.has(host), `${href} links directly to a card issuer source host`).toBe(
        false
      );
    }
  });

  for (const viewport of [
    { width: 375, height: 812 },
    { width: 768, height: 1024 },
    { width: 1280, height: 900 },
  ]) {
    test(`no clipped controls at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(PAGE);
      await expect(page.locator('#spendAbroad')).toBeVisible();

      const report = await collectOverflow(page, '#spendAbroad');

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
