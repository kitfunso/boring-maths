import fs from 'node:fs';
import path from 'node:path';

const KEY_FILE = /^([a-f0-9]{32})\.txt$/;

// The key file in public/ is the only copy of the key, so the script and the deployed site cannot drift.
export function findKey(publicDir) {
  const keys = fs
    .readdirSync(publicDir)
    .map((name) => name.match(KEY_FILE)?.[1])
    .filter((key) => key && fs.readFileSync(path.join(publicDir, `${key}.txt`), 'utf8').trim() === key);
  if (keys.length !== 1) {
    throw new Error(`expected exactly one IndexNow key file in ${publicDir}, found ${keys.length}`);
  }
  return keys[0];
}

export function sitemapLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

export function buildPayload(host, key, urls) {
  const foreign = urls.filter((url) => new URL(url).host !== host);
  if (foreign.length > 0) throw new Error(`URLs not on ${host}: ${foreign.slice(0, 3).join(', ')}`);
  if (urls.length === 0 || urls.length > 10000) {
    throw new Error(`IndexNow takes 1 to 10,000 URLs per post, got ${urls.length}`);
  }
  return { host, key, keyLocation: `https://${host}/${key}.txt`, urlList: urls };
}
