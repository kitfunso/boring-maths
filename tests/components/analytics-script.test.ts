import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const source = readFileSync(resolve('src/components/common/Analytics.astro'), 'utf8');
const script = /<script is:inline[^>]*>([\s\S]*?)<\/script>/.exec(source)?.[1] ?? '';

type GaWindow = Window & {
  gaLoaded?: boolean;
  gtag?: unknown;
  dataLayer?: IArguments[];
};

const ga = window as unknown as GaWindow;

const cleanups: Array<() => void> = [];

function recordListeners(target: EventTarget): void {
  const original = target.addEventListener.bind(target);
  const spy = vi.spyOn(target, 'addEventListener').mockImplementation((type, listener, options) => {
    original(type, listener, options);
    cleanups.push(() => target.removeEventListener(type, listener, options));
  });
  cleanups.push(() => spy.mockRestore());
}

function boot(path: string): void {
  recordListeners(window);
  recordListeners(document);
  window.history.pushState({}, '', path);
  document.head.innerHTML = '';
  document.body.innerHTML =
    '<nav><input id="outside" /></nav>' +
    '<astro-island><input id="field" /><button id="btn">x</button><p id="text">y</p></astro-island>';
  delete ga.gaLoaded;
  delete ga.gtag;
  delete ga.dataLayer;
  new Function('gaId', script)('G-TEST');
}

function gaScriptCount(): number {
  return document.head.querySelectorAll('script[src*="googletagmanager"]').length;
}

function calculatorEvents(): unknown[][] {
  return (ga.dataLayer ?? [])
    .map((args) => Array.from(args))
    .filter((args) => args[0] === 'event' && args[1] === 'calculator_used');
}

function fire(id: string, type: string): void {
  document.getElementById(id)?.dispatchEvent(new Event(type, { bubbles: true }));
}

describe('Analytics inline script', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanups.splice(0).forEach((cleanup) => cleanup());
    vi.useRealTimers();
  });

  it('never loads GA for a visitor who does nothing, however long they stay', () => {
    boot('/calculators/tip-calculator/');
    vi.advanceTimersByTime(60_000);
    expect(gaScriptCount()).toBe(0);
    expect(ga.dataLayer).toBeUndefined();
  });

  it('loads GA without counting calculator use on a plain scroll', () => {
    boot('/calculators/scroll-case-calculator/');
    window.dispatchEvent(new Event('scroll'));
    expect(gaScriptCount()).toBe(1);
    expect(calculatorEvents()).toHaveLength(0);
  });

  it('counts calculator use once, with the slug, when a widget control changes', () => {
    boot('/calculators/input-case-calculator/');
    fire('field', 'input');
    expect(calculatorEvents()).toEqual([
      ['event', 'calculator_used', { calculator_name: 'input-case-calculator' }],
    ]);
    fire('btn', 'click');
    expect(calculatorEvents()).toHaveLength(1);
  });

  it('keeps the full slug for a calculator nested under a hub', () => {
    boot('/calculators/income/nested-case/');
    fire('field', 'input');
    expect(calculatorEvents()[0]?.[2]).toEqual({ calculator_name: 'income/nested-case' });
  });

  it('ignores controls outside the widget and text clicks inside it', () => {
    boot('/calculators/ignore-case-calculator/');
    fire('outside', 'input');
    fire('text', 'click');
    expect(calculatorEvents()).toHaveLength(0);
  });

  it('counts nothing away from a calculator page', () => {
    boot('/guides/some-guide/');
    fire('field', 'input');
    expect(calculatorEvents()).toHaveLength(0);
  });
});
