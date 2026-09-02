import type { Page } from '@playwright/test';

/** Shared by avios-finder-overflow.spec.ts and card-rewards.spec.ts; each supplies its own anchor. */

export interface OverflowReport {
  islandRight: number;
  offenders: { tag: string; id: string; label: string; right: number; left: number }[];
  scrollWidth: number;
  clientWidth: number;
}

export async function collectOverflow(page: Page, anchorSelector: string): Promise<OverflowReport> {
  return page.evaluate((selector) => {
    const anchor = document.querySelector(selector);
    const island = anchor?.closest('astro-island');
    if (!island) throw new Error(`Island not found (is ${selector} present?)`);
    // astro-island is display:contents (zero-size rect); measure the Card div it wraps
    const card = island.firstElementChild;
    if (!card) throw new Error('Card not found inside island');
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
  }, anchorSelector);
}
