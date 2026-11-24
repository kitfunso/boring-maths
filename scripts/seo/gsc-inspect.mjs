#!/usr/bin/env node

import { getAccessToken, fail } from './gsc-auth.mjs';

const SITE = 'sc-domain:boring-math.com';
const ENDPOINT = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';

function normalize(input) {
  let u = input.trim();
  if (!u.startsWith('http')) {
    u = `https://boring-math.com/${u.replace(/^\/+/, '')}`;
  }
  if (!u.endsWith('/') && !u.includes('?') && !/\.[a-z]+$/i.test(u)) {
    u += '/';
  }
  return u;
}

async function inspect(url, accessToken) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE }),
  });
  const json = await res.json();
  if (!res.ok) fail(`urlInspection failed for ${url} (${res.status}): ${JSON.stringify(json)}`);
  return json.inspectionResult || {};
}

async function main() {
  const argv = process.argv.slice(2);
  const reauth = argv.includes('--reauth');
  const urls = argv.filter((a) => !a.startsWith('--')).map(normalize);
  if (urls.length === 0) {
    fail('Usage: node scripts/seo/gsc-inspect.mjs <url-or-slug> [...]');
  }

  const accessToken = await getAccessToken({ reauth });

  for (const url of urls) {
    const r = await inspect(url, accessToken);
    const idx = r.indexStatusResult || {};
    console.log(`\n${url}`);
    console.log(`  verdict:        ${idx.verdict || '-'}`);
    console.log(`  coverageState:  ${idx.coverageState || '-'}`);
    console.log(`  indexingState:  ${idx.indexingState || '-'}`);
    console.log(`  robotsTxtState: ${idx.robotsTxtState || '-'}`);
    console.log(`  lastCrawlTime:  ${idx.lastCrawlTime || 'never'}`);
    console.log(`  googleCanonical: ${idx.googleCanonical || '-'}`);
    console.log(`  userCanonical:   ${idx.userCanonical || '-'}`);
    if (idx.referringUrls?.length) {
      console.log(`  referringUrls:   ${idx.referringUrls.slice(0, 3).join(' | ')}`);
    }
  }
  console.log('');
}

main().catch((e) => fail(e.stack || String(e)));
