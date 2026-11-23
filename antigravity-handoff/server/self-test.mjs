import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { once } from 'node:events';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { DEFAULT_REGULAR_HOURS, storeDate, validateRegular, validateException } from './hours.js';

// All database and OAuth operations below are mocked; this test never connects to
// DATABASE_URL or changes the shared database, including during server startup.
const state = {
  origins: new Set(), nonces: new Map(), revoked: new Map(), exceptions: new Map(),
  tables: [], offline: false, failRevokeInsert: false, oauthCalls: [],
};
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const fakeDb = {
  async query(sql) {
    if (state.offline) throw new Error('mock database offline');
    if (/^CREATE TABLE/i.test(sql.trim())) state.tables.push(sql);
    return [[], []];
  },
  async execute(sql, values = []) {
    if (state.offline) throw new Error('mock database offline');
    const normalized = sql.replace(/\s+/g, ' ').trim();
    if (normalized.startsWith('INSERT IGNORE INTO pawn_hours_settings')) return [{ affectedRows: 1 }];
    if (normalized.startsWith('SELECT regular_json FROM pawn_hours_settings')) return [[{ regular_json: DEFAULT_REGULAR_HOURS }]];
    if (normalized.startsWith('SELECT date_key, label, status, opens, closes FROM pawn_hours_exceptions')) {
      return [[...state.exceptions.values()].filter((row) => !values.length || row.date_key >= values[0]).sort((a, b) => a.date_key.localeCompare(b.date_key))];
    }
    if (normalized.startsWith('SELECT origin FROM pawn_hours_trusted_origins')) {
      // Model a potentially case-insensitive/padded SQL comparison; the app must
      // independently compare the retrieved string exactly.
      return [[...state.origins].filter((origin) => origin.toLowerCase().trimEnd() === values[0].toLowerCase().trimEnd()).map((origin) => ({ origin }))];
    }
    if (normalized.startsWith('DELETE FROM pawn_hours_oauth_nonces WHERE expires_at <')) {
      for (const [key, nonce] of state.nonces) if (nonce.expiresAt < values[0]) state.nonces.delete(key);
      return [{ affectedRows: 0 }];
    }
    if (normalized.startsWith('INSERT INTO pawn_hours_oauth_nonces')) {
      state.nonces.set(values[0], { redirectUri: values[1], expiresAt: values[2] });
      return [{ affectedRows: 1 }];
    }
    if (normalized.startsWith('DELETE FROM pawn_hours_oauth_nonces WHERE nonce_hash')) {
      const nonce = state.nonces.get(values[0]);
      const valid = !!nonce && nonce.redirectUri === values[1] && nonce.expiresAt >= values[2];
      if (valid) state.nonces.delete(values[0]);
      return [{ affectedRows: Number(valid) }];
    }
    if (normalized.startsWith('SELECT token_hash FROM pawn_hours_revoked_sessions')) return [state.revoked.has(values[0]) ? [{ token_hash: values[0] }] : []];
    if (normalized.startsWith('DELETE FROM pawn_hours_revoked_sessions')) {
      for (const [key, expiry] of state.revoked) if (expiry <= values[0]) state.revoked.delete(key);
      return [{ affectedRows: 0 }];
    }
    if (normalized.startsWith('INSERT INTO pawn_hours_revoked_sessions')) {
      if (state.failRevokeInsert) throw new Error('mock revocation insert failed');
      state.revoked.set(values[0], Math.max(state.revoked.get(values[0]) || 0, values[1]));
      return [{ affectedRows: 1 }];
    }
    if (normalized.startsWith('INSERT INTO pawn_hours_exceptions')) {
      const [date_key, label, status, opens, closes] = values;
      if (state.exceptions.has(date_key) && !normalized.includes('ON DUPLICATE KEY UPDATE')) {
        const error = new Error('duplicate'); error.code = 'ER_DUP_ENTRY'; error.errno = 1062; throw error;
      }
      state.exceptions.set(date_key, { date_key, label, status, opens, closes });
      return [{ affectedRows: 1 }];
    }
    if (normalized.startsWith('DELETE FROM pawn_hours_exceptions')) {
      state.exceptions.delete(values[0]); return [{ affectedRows: 1 }];
    }
    throw new Error(`Unexpected mock SQL: ${normalized}`);
  },
};
mysql.createPool = (url) => {
  assert.equal(url, 'mysql://mock-never-connect.invalid/db');
  return fakeDb;
};
const secret = 'isolated-test-secret-that-grants-no-real-access';
const project = 'isolated-test-project';
const owner = 'isolated-test-owner';
Object.assign(process.env, {
  DATABASE_URL: 'mysql://mock-never-connect.invalid/db', PORT: '0',
  MANUS_PROJECT_ID: project, MANUS_JWT_SECRET: secret, HOURS_OWNER_OPEN_ID: owner,
  MANUS_OAUTH_PORTAL_URL: 'https://portal.example', MANUS_OAUTH_API_URL: 'https://oauth.example',
  HOURS_ALLOWED_ORIGINS: '',
});
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, options = {}) => {
  const url = String(input);
  if (url.startsWith('https://oauth.example/')) {
    state.oauthCalls.push({ url, body: JSON.parse(options.body) });
    return new Response(JSON.stringify(url.endsWith('/ExchangeToken') ? { accessToken: 'mock-access' } : { openId: owner, name: 'Test owner' }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  assert.match(url, /^http:\/\/127\.0\.0\.1:\d+\//, 'Unexpected network request');
  return originalFetch(input, options);
};

assert.equal(storeDate(new Date('2026-11-22T04:59:59Z')), '2026-11-21');
assert.equal(storeDate(new Date('2026-11-22T05:00:00Z')), '2026-11-22');
assert.equal(storeDate(new Date('2026-07-01T03:59:59Z')), '2026-06-30');
assert.equal(DEFAULT_REGULAR_HOURS[0].status, 'closed');
assert.deepEqual(validateRegular(DEFAULT_REGULAR_HOURS), DEFAULT_REGULAR_HOURS);
assert.throws(() => validateRegular([...DEFAULT_REGULAR_HOURS.slice(0, 6), DEFAULT_REGULAR_HOURS[0]]));
assert.throws(() => validateException('2026-02-29', { label: 'Test', status: 'closed' }));
assert.throws(() => validateException('2028-02-29', { label: 'Test', status: 'open', opens: '18:00', closes: '10:00' }));

let server;
let base;
async function start(suffix) {
  ({ server } = await import(`./index.js?isolated=${suffix}`));
  if (!server.listening) await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await api('/api/health')).status, 200);
}
async function stop() {
  if (server?.listening) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}
const api = (path, options = {}) => fetch(base + path, options);
const cookie = (response, name) => response.headers.getSetCookie().find((value) => value.startsWith(`${name}=`))?.split(';')[0];
const makeToken = (claims = {}, options = { expiresIn: '10m' }) => jwt.sign({ appId: project, openId: owner, jti: crypto.randomUUID(), ...claims }, secret, { algorithm: 'HS256', ...options });
const headersFor = (token) => ({ cookie: `webdev_app_session=${token}` });
const csrfFor = (token) => crypto.createHmac('sha256', secret).update('pawn-hours-csrf:').update(token).digest('base64url');
const login = (origin, header = origin, extra = {}) => api('/api/auth/login', { method: 'POST', headers: { origin: header, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json', ...extra }, body: JSON.stringify({ origin }) });
async function loginDetails(origin) {
  const response = await login(origin);
  assert.equal(response.status, 200);
  const nonceCookie = cookie(response, 'pawn_hours_oauth_nonce');
  assert.ok(nonceCookie);
  const authorizationUrl = new URL((await response.json()).authorizationUrl);
  assert.equal(authorizationUrl.searchParams.get('redirectUri'), `${origin}/api/auth/callback`);
  return { nonceCookie, state: authorizationUrl.searchParams.get('state') };
}
const callback = (details, encodedState = details.state) => api(`/api/auth/callback?code=mock-code&state=${encodeURIComponent(encodedState)}`, { headers: { cookie: details.nonceCookie }, redirect: 'manual' });

try {
  await start('first');
  assert.ok(state.tables.some((sql) => sql.includes('pawn_hours_trusted_origins')));
  assert.ok(state.tables.some((sql) => sql.includes('pawn_hours_revoked_sessions')));
  const publicResult = await api('/api/hours');
  assert.equal(publicResult.status, 200);
  assert.equal((await publicResult.json()).timeZone, 'America/New_York');

  // Spoofed browser headers and Host cannot establish trust, even when the list is empty.
  assert.equal((await login('https://attacker.example', 'https://attacker.example', { host: 'attacker.example' })).status, 403);
  assert.equal(state.origins.size, 0);
  const origin = 'https://preview.example';
  state.origins.add(origin);
  state.origins.add('https://mixedCase.example');
  assert.equal((await login('https://mixedcase.example')).status, 403, 'Database collation cannot weaken exact matching');
  state.origins.delete('https://mixedCase.example');
  for (const invalid of ['http://preview.example', 'https://preview.example/', 'https://preview.example:443', 'https://preview.example:444', 'https://PREVIEW.example', 'https://user@preview.example', 'https://preview.example.evil']) {
    assert.equal((await login(invalid)).status, 403, `Reject ${invalid}`);
  }
  assert.equal((await login(origin, 'https://proxy-rewritten.example')).status, 200, 'The proxy may rewrite Origin for a trusted browser origin');
  assert.equal((await login('https://attacker.example', origin)).status, 403, 'A forged trusted Origin header cannot authorize an untrusted callback');
  const details = await loginDetails(origin);
  const parsedState = JSON.parse(Buffer.from(details.state, 'base64').toString());
  const forgedState = Buffer.from(JSON.stringify({ ...parsedState, redirectUri: 'https://attacker.example/api/auth/callback' })).toString('base64');
  let response = await callback(details, forgedState);
  assert.equal(response.headers.get('location'), '/staff-hours?login=failed');
  assert.equal(state.oauthCalls.length, 0);
  state.origins.add('https://other-approved.example');
  const wrongApprovedState = Buffer.from(JSON.stringify({ ...parsedState, redirectUri: 'https://other-approved.example/api/auth/callback' })).toString('base64');
  response = await callback(details, wrongApprovedState);
  assert.equal(response.headers.get('location'), '/staff-hours?login=failed', 'Nonce must be bound to the exact redirect URI');
  assert.equal(state.oauthCalls.length, 0);
  state.origins.delete('https://other-approved.example');
  state.origins.delete(origin);
  response = await callback(details);
  assert.equal(response.headers.get('location'), '/staff-hours?login=failed');
  assert.equal(state.oauthCalls.length, 0, 'callback must recheck origin before token exchange');
  state.origins.add(origin);
  response = await callback(details);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), '/staff-hours');
  const issuedCookie = cookie(response, 'webdev_app_session');
  assert.ok(issuedCookie);
  const issuedToken = issuedCookie.slice('webdev_app_session='.length);
  assert.equal(state.oauthCalls.length, 2);
  assert.equal(state.oauthCalls[0].body.redirectUri, `${origin}/api/auth/callback`);
  response = await callback(details);
  assert.equal(response.headers.get('location'), '/staff-hours?login=failed');
  assert.equal(state.oauthCalls.length, 2, 'nonce cannot be replayed');
  const another = await loginDetails(origin);
  response = await callback({ ...another, nonceCookie: 'pawn_hours_oauth_nonce=wrong' });
  assert.equal(response.headers.get('location'), '/staff-hours?login=failed');

  // The explicit server-config allowlist is an alternative, and is also checked at callback.
  const configuredOrigin = 'https://configured.example';
  process.env.HOURS_ALLOWED_ORIGINS = configuredOrigin;
  const configured = await loginDetails(configuredOrigin);
  process.env.HOURS_ALLOWED_ORIGINS = '';
  assert.equal((await callback(configured)).headers.get('location'), '/staff-hours?login=failed');
  process.env.HOURS_ALLOWED_ORIGINS = configuredOrigin;
  assert.equal((await callback(configured)).headers.get('location'), '/staff-hours');
  process.env.HOURS_ALLOWED_ORIGINS = '';

  assert.equal((await api('/api/admin/hours')).status, 401);
  assert.equal((await api('/api/admin/hours', { headers: headersFor(makeToken({ appId: 'wrong-project' })) })).status, 401);
  assert.equal((await api('/api/admin/hours', { headers: headersFor(makeToken({}, {})) })).status, 401);
  assert.equal((await api('/api/admin/hours', { headers: headersFor(makeToken({}, { expiresIn: -1 })) })).status, 401);
  assert.equal((await api('/api/admin/hours', { headers: headersFor(makeToken({}, { algorithm: 'HS384', expiresIn: '10m' })) })).status, 401);
  assert.equal((await api('/api/admin/hours', { headers: headersFor(makeToken({ openId: 'other-user' })) })).status, 403);
  const previewToken = makeToken(); // Compatible preview-issued HS256 project session.
  const ownerHeaders = headersFor(previewToken);
  assert.equal((await api('/api/admin/hours', { headers: ownerHeaders })).status, 200);
  delete process.env.HOURS_OWNER_OPEN_ID;
  assert.equal((await api('/api/admin/hours', { headers: ownerHeaders })).status, 403, 'No implicit owner authorization');
  process.env.HOURS_OWNER_OPEN_ID = owner;
  assert.equal((await api('/api/admin/hours/regular', { method: 'PUT', headers: { ...ownerHeaders, 'content-type': 'application/json' }, body: '{}' })).status, 403);
  const csrf = csrfFor(previewToken);
  assert.equal((await api('/api/admin/hours/regular', { method: 'PUT', headers: { ...ownerHeaders, 'content-type': 'application/json', 'x-hours-csrf': csrf }, body: '{}' })).status, 400);

  const specialHeaders = { ...ownerHeaders, 'content-type': 'application/json', 'x-hours-csrf': csrf };
  const specialPath = '/api/admin/hours/exceptions/2030-01-01';
  const special = (label) => ({ method: 'PUT', headers: specialHeaders, body: JSON.stringify({ label, status: 'closed' }) });
  const race = await Promise.all([api(specialPath, special('First')), api(specialPath, special('Second'))]);
  assert.deepEqual(race.map((item) => item.status).sort(), [200, 409]);
  const originalLabel = state.exceptions.get('2030-01-01').label;
  assert.equal((await api(`${specialPath}?replace=0`, special('Do not replace'))).status, 409);
  assert.equal((await api(`${specialPath}?replace=1&replace=1`, special('Do not replace'))).status, 409);
  assert.equal(state.exceptions.get('2030-01-01').label, originalLabel);
  assert.equal((await api(`${specialPath}?replace=1`, special('Explicit replacement'))).status, 200);
  assert.equal(state.exceptions.get('2030-01-01').label, 'Explicit replacement');
  assert.equal((await api('/api/admin/hours/exceptions/2030-01-02?replace=1', special('Explicit upsert'))).status, 200);

  // Failure to read or write revocation data must never authorize or clear a cookie.
  const outageCallback = await loginDetails(origin);
  const oauthCountBeforeOutage = state.oauthCalls.length;
  state.offline = true;
  response = await callback(outageCallback);
  assert.equal(response.headers.get('location'), '/staff-hours?login=failed');
  assert.equal(cookie(response, 'webdev_app_session'), undefined);
  assert.equal(state.oauthCalls.length, oauthCountBeforeOutage);
  assert.equal((await api('/api/auth/session', { headers: ownerHeaders })).status, 503);
  assert.equal((await api('/api/admin/hours', { headers: ownerHeaders })).status, 503);
  response = await api('/api/auth/logout', { method: 'POST', headers: { ...ownerHeaders, 'x-hours-csrf': csrf } });
  assert.equal(response.status, 503);
  assert.equal(cookie(response, 'webdev_app_session'), undefined);
  assert.equal((await login(origin)).status, 503);
  state.offline = false;
  state.failRevokeInsert = true;
  response = await api('/api/auth/logout', { method: 'POST', headers: { ...ownerHeaders, 'x-hours-csrf': csrf } });
  assert.equal(response.status, 503);
  assert.equal(cookie(response, 'webdev_app_session'), undefined);
  assert.equal(state.revoked.has(hash(previewToken)), false);
  state.failRevokeInsert = false;
  assert.equal((await api('/api/auth/logout', { method: 'POST', headers: { ...ownerHeaders, 'x-hours-csrf': 'wrong' } })).status, 403);
  state.revoked.set('expired-test', Math.floor(Date.now() / 1000) - 1);
  response = await api('/api/auth/logout', { method: 'POST', headers: { ...ownerHeaders, 'x-hours-csrf': csrf } });
  assert.equal(response.status, 200);
  assert.ok(cookie(response, 'webdev_app_session'));
  assert.equal(state.revoked.get(hash(previewToken)), Math.ceil(jwt.decode(previewToken).exp));
  assert.equal(state.revoked.has('expired-test'), false);
  assert.equal((await api('/api/admin/hours', { headers: ownerHeaders })).status, 401);
  assert.equal((await (await api('/api/auth/session', { headers: ownerHeaders })).json()).authenticated, false);
  // A server restart still consults the same persistent-store abstraction.
  await stop();
  await start('restart');
  assert.equal((await api('/api/admin/hours', { headers: ownerHeaders })).status, 401);
  assert.equal((await api('/api/admin/hours', { headers: headersFor(issuedToken) })).status, 200);
  response = await api('/api/auth/logout', { method: 'POST', headers: { ...headersFor(issuedToken), 'x-hours-csrf': csrfFor(issuedToken) } });
  assert.equal(response.status, 200);
  assert.equal((await api('/api/admin/hours', { headers: headersFor(issuedToken) })).status, 401);
  console.log('PASS: isolated mock DB/OAuth; strict origin and callback recheck; nonce replay; HS256/project/expiry/owner/CSRF; preview and app logout revocation across server restart; DB failure closed; atomic duplicate conflict and explicit replace; date validation. No shared database was contacted.');
} finally {
  await stop();
  globalThis.fetch = originalFetch;
}
