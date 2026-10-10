// Submits the live sitemap to IndexNow (Bing, Yandex, Seznam, Naver): npm run seo:indexnow [-- --dry-run]
// Run after a deploy that adds or changes pages, not on every build: repeat posts read as spam.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildPayload, findKey, sitemapLocs } from './indexnow-core.mjs';

const HOST = 'boring-math.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const PUBLIC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'public');

async function text(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} returned ${res.status}`);
  return res.text();
}

async function liveUrls() {
  const children = sitemapLocs(await text(`https://${HOST}/sitemap-index.xml`));
  const pages = await Promise.all(children.map(async (child) => sitemapLocs(await text(child))));
  return [...new Set(pages.flat())];
}

async function main() {
  const key = findKey(PUBLIC_DIR);
  const served = await fetch(`https://${HOST}/${key}.txt`).then((res) =>
    res.ok ? res.text() : ''
  );
  if (served.trim() !== key) {
    throw new Error(`https://${HOST}/${key}.txt does not serve the key yet; deploy first`);
  }
  const payload = buildPayload(HOST, key, await liveUrls());
  if (process.argv.includes('--dry-run')) {
    console.log(
      `dry run: would submit ${payload.urlList.length} URLs, first ${payload.urlList[0]}`
    );
    return;
  }
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  console.log(
    `IndexNow ${res.status} for ${payload.urlList.length} URLs ${await res.text()}`.trim()
  );
  if (res.status !== 200 && res.status !== 202) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exitCode = 1;
});
