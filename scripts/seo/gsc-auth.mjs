/**
 * Shared Search Console OAuth for the seo scripts (gsc-pull, gsc-inspect).
 *
 * Loopback consent flow with a cached refresh token. Extracted from
 * gsc-pull.mjs so every GSC script shares one token path
 * (scripts/seo/.gsc-token.json) instead of duplicating the flow.
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const CLIENT_PATH_DEFAULT = path.join(__dirname, '.gsc-client.json');
export const TOKEN_PATH = path.join(__dirname, '.gsc-token.json');

export const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const TOKEN_URI = 'https://oauth2.googleapis.com/token';
const AUTH_URI = 'https://accounts.google.com/o/oauth2/v2/auth';

export function fail(msg) {
  console.error(`\nERROR: ${msg}\n`);
  process.exit(1);
}

export function loadClientSecret(clientPath) {
  if (!fs.existsSync(clientPath)) {
    fail(
      `OAuth client secret not found at ${clientPath}\n` +
        `Create a "Desktop app" OAuth client in Google Cloud Console, download the JSON,\n` +
        `and save it there. See the header of gsc-pull.mjs for the full setup steps.`,
    );
  }
  const raw = JSON.parse(fs.readFileSync(clientPath, 'utf8'));
  const cfg = raw.installed || raw.web || raw;
  if (!cfg.client_id || !cfg.client_secret) {
    fail(`Client secret JSON missing client_id/client_secret (got keys: ${Object.keys(raw)})`);
  }
  return { clientId: cfg.client_id, clientSecret: cfg.client_secret };
}

function loadToken() {
  if (!fs.existsSync(TOKEN_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function saveToken(tok) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tok, null, 2), { mode: 0o600 });
}

function openBrowser(url) {
  try {
    if (process.platform === 'win32') {
      spawn('powershell', ['-NoProfile', '-Command', `Start-Process '${url}'`], {
        stdio: 'ignore',
        detached: true,
      }).unref();
    } else if (process.platform === 'darwin') {
      spawn('open', [url], { stdio: 'ignore', detached: true }).unref();
    } else {
      spawn('xdg-open', [url], { stdio: 'ignore', detached: true }).unref();
    }
  } catch {
    /* user can copy the printed URL */
  }
}

/** Run the loopback consent flow, return tokens (incl. refresh_token). */
async function authorize(clientId, clientSecret) {
  const state = crypto.randomBytes(16).toString('hex');
  let redirectUri = '';

  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const params = new URL(req.url, redirectUri).searchParams;
      if (!params.has('code') && !params.has('error')) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(
        '<html><body style="font-family:system-ui;padding:2rem">' +
          '<h2>Search Console authorised.</h2><p>You can close this tab and return to the terminal.</p>' +
          '</body></html>',
      );
      server.close();
      if (params.get('error')) return reject(new Error(`OAuth error: ${params.get('error')}`));
      if (params.get('state') !== state) return reject(new Error('OAuth state mismatch (possible CSRF)'));
      resolve(params.get('code'));
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      redirectUri = `http://127.0.0.1:${server.address().port}`;
      const authUrl =
        `${AUTH_URI}?` +
        new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: SCOPE,
          access_type: 'offline',
          prompt: 'consent',
          state,
        }).toString();
      console.log('\nAuthorise access in your browser. If it does not open, paste this URL:\n');
      console.log(authUrl + '\n');
      openBrowser(authUrl);
    });
  });

  const tok = await exchangeCode(code, redirectUri, clientId, clientSecret);
  if (!tok.refresh_token) {
    fail('No refresh_token returned. Re-run with --reauth and ensure you grant consent fresh.');
  }
  saveToken(tok);
  console.log('Authorised. Refresh token cached at scripts/seo/.gsc-token.json\n');
  return tok;
}

async function exchangeCode(code, redirectUri, clientId, clientSecret) {
  const res = await fetch(TOKEN_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  const json = await res.json();
  if (!res.ok) fail(`Token exchange failed (${res.status}): ${JSON.stringify(json)}`);
  return json;
}

async function refreshAccessToken(refreshToken, clientId, clientSecret) {
  const res = await fetch(TOKEN_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });
  const json = await res.json();
  if (!res.ok) fail(`Token refresh failed (${res.status}): ${JSON.stringify(json)}. Try --reauth.`);
  return json.access_token;
}

/**
 * Return a usable access token, running consent only if needed.
 * args: { reauth?: boolean, client?: string }
 */
export async function getAccessToken(args = {}) {
  const { clientId, clientSecret } = loadClientSecret(
    args.client ? path.resolve(args.client) : CLIENT_PATH_DEFAULT,
  );
  let tok = args.reauth ? null : loadToken();
  if (tok && tok.refresh_token) {
    const accessToken = await refreshAccessToken(tok.refresh_token, clientId, clientSecret);
    return accessToken;
  }
  tok = await authorize(clientId, clientSecret);
  return tok.access_token;
}
