import { describe, it, expect } from 'vitest';
import { buildPrintDocument } from '../../src/components/ui/printTemplate';

describe('buildPrintDocument', () => {
  it('escapes injected title and result strings', () => {
    const html = buildPrintDocument('Title <script>alert(1)</script>', [
      { label: '<b>Label</b>', value: '<img src=x onerror=alert(1)>' },
    ]);

    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&lt;b&gt;Label&lt;/b&gt;');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
});
