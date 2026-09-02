import { test, expect, type Page } from '@playwright/test';

// All three cabins are in the HTML; CSS keyed on html[data-avios-cabin] shows the finder's cabin.
const PAGE = '/calculators/avios-destination-finder/';
const STORAGE_KEY = 'calc-avios-finder-inputs';

const header = (page: Page, cabin: string) =>
  page.locator(`#avios-price-tables th[data-cabin="${cabin}"]`).first();

// The island stamps the attribute on mount, so its presence doubles as the hydration signal.
const waitForFinder = (page: Page, cabin: string) =>
  expect(page.locator('html')).toHaveAttribute('data-avios-cabin', cabin, { timeout: 15_000 });

test.describe('Avios finder cabin-driven price tables', () => {
  test('shows Economy by default and switches with the finder', async ({ page }) => {
    await page.goto(PAGE);
    await expect(header(page, 'economy')).toBeVisible();
    await expect(header(page, 'business')).toBeHidden();
    await waitForFinder(page, 'economy');

    await page.locator('#cabin').selectOption('business');
    await waitForFinder(page, 'business');
    await expect(header(page, 'business')).toBeVisible();
    await expect(header(page, 'economy')).toBeHidden();
    await expect(header(page, 'premiumEconomy')).toBeHidden();
  });

  test('a shared link with cabin=premiumEconomy shows Premium Economy on load', async ({
    page,
  }) => {
    await page.goto(`${PAGE}?cabin=premiumEconomy`);
    await waitForFinder(page, 'premiumEconomy');
    await expect(header(page, 'premiumEconomy')).toBeVisible();
    await expect(header(page, 'economy')).toBeHidden();
  });

  test('stored Business cabin with no query string shows Business', async ({ page }) => {
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [STORAGE_KEY, JSON.stringify({ cabin: 'business' })]
    );
    await page.goto(PAGE);
    await waitForFinder(page, 'business');
    await expect(header(page, 'business')).toBeVisible();
    await expect(header(page, 'economy')).toBeHidden();
  });

  test('legacy voucher=1 link selects the Premium Plus voucher', async ({ page }) => {
    await page.goto(`${PAGE}?voucher=1`);
    await waitForFinder(page, 'economy');
    await expect(page.locator('#voucher')).toHaveValue('premiumPlus');
  });
});
