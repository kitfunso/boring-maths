import { test, expect } from '@playwright/test';

/**
 * Smoke tests for boring-math.com
 *
 * Covers: homepage grid, category filtering, search, mobile menu,
 * calculator rendering, input/result flow, navigation, share URL params,
 * and mobile viewport behavior.
 *
 * Note: Astro's dev toolbar injects extra <h1> elements, so all heading
 * assertions scope to `main` or use `getByRole` with a name filter.
 */

// ---------------------------------------------------------------------------
// 1. Homepage loads with calculator grid
// ---------------------------------------------------------------------------

test.describe('Homepage', () => {
  test('renders calculator grid with cards', async ({ page }) => {
    await page.goto('/');
    const grid = page.locator('#calculators-grid');
    await expect(grid).toBeVisible();

    const cards = grid.locator('.calculator-card');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(10);
  });

  test('displays site header with logo', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    await expect(page.locator('a[href="/"]').first()).toBeVisible();
  });

  test('displays search input on desktop', async ({ page }) => {
    await page.goto('/');
    const search = page.locator('#search-input');
    await expect(search).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. Category filtering on homepage
// ---------------------------------------------------------------------------

test.describe('Category filtering', () => {
  test('filters cards when a category button is clicked', async ({ page }) => {
    await page.goto('/');

    const grid = page.locator('#calculators-grid');
    const allCards = grid.locator('.calculator-card');
    const totalBefore = await allCards.count();

    // Click the "Health" category button
    const healthBtn = page.locator('.category-btn[data-category="Health"]');
    await healthBtn.click();
    await page.waitForTimeout(400);

    const visibleCards = grid.locator('.calculator-card:not(.hidden)');
    const visibleCount = await visibleCards.count();
    expect(visibleCount).toBeGreaterThan(0);
    expect(visibleCount).toBeLessThan(totalBefore);

    for (const card of await visibleCards.all()) {
      await expect(card).toHaveAttribute('data-category', 'Health');
    }
  });

  test('search filters cards by title', async ({ page }) => {
    await page.goto('/');

    const search = page.locator('#search-input');
    await search.fill('tip');
    await page.waitForTimeout(400);

    const grid = page.locator('#calculators-grid');
    const visible = grid.locator('.calculator-card:not(.hidden)');
    const count = await visible.count();
    expect(count).toBeGreaterThan(0);

    for (const card of await visible.all()) {
      const title = await card.getAttribute('data-title');
      const desc = await card.getAttribute('data-description');
      const matches =
        (title ?? '').includes('tip') || (desc ?? '').includes('tip');
      expect(matches).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Mobile menu opens and closes
// ---------------------------------------------------------------------------

test.describe('Mobile menu', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('opens and closes on hamburger tap', async ({ page }) => {
    await page.goto('/');

    const menuBtn = page.locator('#mobile-menu-btn');
    const menu = page.locator('#mobile-menu');

    // Menu links should not be visible initially
    await expect(menu.locator('a[href="/about"]')).not.toBeVisible();

    // Open the menu
    await menuBtn.click();
    await expect(menu.locator('a[href="/"]')).toBeVisible();
    await expect(menu.locator('a[href="/about"]')).toBeVisible();

    // Close the menu
    await menuBtn.click();
    await expect(menu.locator('a[href="/about"]')).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 4. Mobile filter toggle
// ---------------------------------------------------------------------------

test.describe('Mobile filter toggle', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('expands and collapses filter panel', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('#mobile-filter-toggle');
    const filterPanel = page.locator('#filter-panel');

    await expect(filterPanel).toHaveClass(/hidden/);

    await toggle.click();
    await page.waitForTimeout(400);
    await expect(filterPanel).not.toHaveClass(/hidden/);

    await toggle.click();
    await page.waitForTimeout(400);
    await expect(filterPanel).toHaveClass(/hidden/);
  });
});

// ---------------------------------------------------------------------------
// 5. Calculator page renders
// ---------------------------------------------------------------------------

test.describe('Calculator page', () => {
  test('tip calculator loads with inputs and results', async ({ page }) => {
    await page.goto('/calculators/tip-calculator');

    // Use getByRole with name to avoid Astro dev toolbar h1 conflicts
    const heading = page.getByRole('heading', { name: /tip calculator/i, level: 1 });
    await expect(heading).toBeVisible();

    await expect(page.locator('h2:has-text("Calculate Your Tip")')).toBeVisible();

    const billInput = page.locator('#billAmount');
    await expect(billInput).toBeVisible();

    const resultCard = page.locator('[role="status"][aria-live="polite"]');
    await expect(resultCard.first()).toBeVisible();
  });

  test('percentage calculator loads with mode selector', async ({ page }) => {
    await page.goto('/calculators/percentage-calculator');

    const heading = page.getByRole('heading', { name: /percentage calculator/i, level: 1 });
    await expect(heading).toBeVisible();

    const resultCard = page.locator('[role="status"][aria-live="polite"]');
    await expect(resultCard.first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 6. Calculator computes and updates results
// ---------------------------------------------------------------------------

test.describe('Calculator computation', () => {
  test('tip calculator updates result when bill amount changes', async ({ page }) => {
    await page.goto('/calculators/tip-calculator');

    const billInput = page.locator('#billAmount');
    const resultCard = page.locator('[role="status"][aria-live="polite"]').first();

    await billInput.fill('100');
    await page.waitForTimeout(300);

    const resultText = await resultCard.textContent();
    expect(resultText).toBeTruthy();
    expect(resultText).toMatch(/\d/);
  });

  test('tip calculator quick select buttons change tip percentage', async ({ page }) => {
    await page.goto('/calculators/tip-calculator');

    // Wait for Preact hydration
    const billInput = page.locator('#billAmount');
    await expect(billInput).toBeVisible();

    // Click 15% first to ensure a known state
    const btn15 = page.locator('button[role="radio"]:has-text("15%")');
    await btn15.click();
    await expect(btn15).toHaveAttribute('aria-checked', 'true', { timeout: 5_000 });

    // Now click 25% (guaranteed different from 15%)
    const btn25 = page.locator('button[role="radio"]:has-text("25%")');
    await btn25.click();
    await expect(btn25).toHaveAttribute('aria-checked', 'true', { timeout: 5_000 });

    // 15% should now be unchecked
    await expect(btn15).toHaveAttribute('aria-checked', 'false');

    // Result should contain numeric values
    const resultCard = page.locator('[role="status"][aria-live="polite"]').first();
    const text = await resultCard.textContent();
    expect(text).toMatch(/\d/);
  });
});

// ---------------------------------------------------------------------------
// 7. Navigation between calculators
// ---------------------------------------------------------------------------

test.describe('Navigation', () => {
  test('clicking a calculator card navigates to the calculator page', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('#calculators-grid .calculator-card:not(.hidden) a').first();
    const href = await firstCard.getAttribute('href');
    expect(href).toBeTruthy();

    await firstCard.click();
    await page.waitForURL(`**${href!}`);

    // Scope heading check to main content area to avoid Astro toolbar elements
    const mainHeading = page.locator('main h1, header h1').first();
    await expect(mainHeading).toBeVisible();
  });

  test('navigating to About page works', async ({ page }) => {
    await page.goto('/');

    await page.locator('a[href="/about"]').first().click();
    await page.waitForURL('**/about');

    const heading = page.locator('main h1, header.text-center h1').first();
    await expect(heading).toBeVisible();
  });

  test('breadcrumb links back to homepage', async ({ page }) => {
    await page.goto('/calculators/tip-calculator');

    const breadcrumbLink = page.locator('a[href="/calculators"], a[href="/"]').first();
    await expect(breadcrumbLink).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 8. Share URL params
// ---------------------------------------------------------------------------

test.describe('Share URL params', () => {
  test('share button is present on calculator page', async ({ page }) => {
    await page.goto('/calculators/tip-calculator');

    const shareBtn = page.locator('button:has-text("Share Result")');
    await expect(shareBtn).toBeVisible({ timeout: 15_000 });
  });

  test('share menu opens with social links and copy buttons', async ({ page }) => {
    await page.goto('/calculators/tip-calculator');

    const shareBtn = page.locator('button:has-text("Share Result")');
    await expect(shareBtn).toBeVisible({ timeout: 15_000 });
    await shareBtn.click();

    // The share menu renders via Preact; give it a moment
    const menu = page.locator('[role="menu"][aria-label="Share options"]');
    await expect(menu).toBeVisible({ timeout: 5_000 });

    await expect(menu.locator('button:has-text("Twitter")')).toBeVisible();
    await expect(menu.locator('button:has-text("Copy Link")')).toBeVisible();
    await expect(menu.locator('button:has-text("Copy Result")')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 9. Responsive layout
// ---------------------------------------------------------------------------

test.describe('Responsive layout', () => {
  test('desktop shows multi-column grid', async ({ page }) => {
    await page.goto('/');
    const grid = page.locator('#calculators-grid');
    await expect(grid).toBeVisible();
    await expect(grid).toHaveClass(/grid-cols-1/);
  });

  test('mobile viewport hides desktop search', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const desktopSearch = page.locator('#search-input');
    await expect(desktopSearch).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 10. 404 page
// ---------------------------------------------------------------------------

test.describe('404 page', () => {
  test('returns a page for non-existent routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-xyz');
    expect(response?.status()).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// 11. Calculator page has proper meta tags
// ---------------------------------------------------------------------------

test.describe('SEO meta', () => {
  test('calculator page has title and meta description', async ({ page }) => {
    await page.goto('/calculators/tip-calculator');

    const title = await page.title();
    expect(title).toContain('Tip Calculator');

    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /tip|bill/i);
  });

  test('homepage has title', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toContain('Boring Math');
  });
});

// ---------------------------------------------------------------------------
// 12. Calculator split functionality
// ---------------------------------------------------------------------------

test.describe('Tip calculator split', () => {
  test('increasing split count updates the result label', async ({ page }) => {
    await page.goto('/calculators/tip-calculator');

    const billInput = page.locator('#billAmount');
    await billInput.fill('100');

    const increaseBtn = page.locator('button[aria-label="Increase number of people"]');
    await increaseBtn.click();
    await page.waitForTimeout(300);

    const resultCard = page.locator('[role="status"][aria-live="polite"]').first();
    await expect(resultCard).toContainText('Each Person Pays');
  });
});

// ---------------------------------------------------------------------------
// 13. Footer
// ---------------------------------------------------------------------------

test.describe('Footer', () => {
  test('footer is visible on homepage', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
