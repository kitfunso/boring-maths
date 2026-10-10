import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildPayload, findKey, sitemapLocs } from '../../scripts/seo/indexnow-core.mjs';

const PUBLIC_DIR = path.resolve(__dirname, '..', '..', 'public');

describe('indexnow core', () => {
  it('finds the one key file that public/ ships, and its content is the key', () => {
    const key = findKey(PUBLIC_DIR);
    expect(key).toMatch(/^[a-f0-9]{32}$/);
    expect(fs.readFileSync(path.join(PUBLIC_DIR, `${key}.txt`), 'utf8').trim()).toBe(key);
  });

  it('rejects a key file whose content does not match its name', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'indexnow-'));
    fs.writeFileSync(path.join(dir, `${'a'.repeat(32)}.txt`), 'b'.repeat(32));
    expect(() => findKey(dir)).toThrow(/found 0/);
  });

  it('reads loc entries from a sitemap', () => {
    const xml =
      '<urlset><url><loc>https://boring-math.com/</loc></url><url><loc> https://boring-math.com/about/ </loc></url></urlset>';
    expect(sitemapLocs(xml)).toEqual(['https://boring-math.com/', 'https://boring-math.com/about/']);
  });

  it('builds a payload and refuses URLs from another host', () => {
    const key = 'c'.repeat(32);
    expect(buildPayload('boring-math.com', key, ['https://boring-math.com/'])).toEqual({
      host: 'boring-math.com',
      key,
      keyLocation: `https://boring-math.com/${key}.txt`,
      urlList: ['https://boring-math.com/'],
    });
    expect(() =>
      buildPayload('boring-math.com', key, ['https://www.boring-math.com/'])
    ).toThrow(/not on boring-math.com/);
    expect(() => buildPayload('boring-math.com', key, [])).toThrow(/1 to 10,000/);
  });
});
