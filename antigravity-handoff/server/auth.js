import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { ensureDatabase } from './db.js';

const SESSION_COOKIE = 'webdev_app_session';
const NONCE_COOKIE = 'pawn_hours_oauth_nonce';
const cookieOptions = { httpOnly: true, secure: true, sameSite: 'none', path: '/' };
const nonceOptions = { ...cookieOptions, path: '/api/auth' };
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const NONCE_AGE = 10 * 60 * 1000;

const compare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const first = Buffer.from(a); const second = Buffer.from(b);
  return first.length === second.length && crypto.timingSafeEqual(first, second);
};
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');
function configured() {
  return !!(process.env.MANUS_PROJECT_ID && process.env.MANUS_JWT_SECRET && process.env.MANUS_OAUTH_PORTAL_URL && process.env.MANUS_OAUTH_API_URL);
}
async function sessionFrom(req) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token || !process.env.MANUS_PROJECT_ID || !process.env.MANUS_JWT_SECRET) return null;
  let claims;
  try { claims = jwt.verify(token, process.env.MANUS_JWT_SECRET, { algorithms: ['HS256'] }); }
  catch { return null; }
  if (!claims || typeof claims !== 'object' || typeof claims.exp !== 'number' || !Number.isSafeInteger(Math.ceil(claims.exp)) || claims.appId !== process.env.MANUS_PROJECT_ID || typeof claims.openId !== 'string' || !claims.openId || claims.openId.length > 255) return null;
  // Check all verified tokens, including compatible preview-issued cookies, every time.
  // A database failure propagates to the caller; it must never authorize the session.
  const db = await ensureDatabase();
  const [revoked] = await db.execute('SELECT token_hash FROM pawn_hours_revoked_sessions WHERE token_hash = ?', [digest(token)]);
  if (revoked.length) return null;
  return { token, expiresAt: Math.ceil(claims.exp), openId: claims.openId, name: typeof claims.name === 'string' ? claims.name.slice(0, 200) : '' };
}
function isOwner(session) {
  const ownerId = process.env.HOURS_OWNER_OPEN_ID?.trim();
  return !!(ownerId && session && compare(session.openId, ownerId));
}
function csrf(session) {
  return crypto.createHmac('sha256', process.env.MANUS_JWT_SECRET).update('pawn-hours-csrf:').update(session.token).digest('base64url');
}
function apiError(res, status, error) { return res.status(status).json({ error }); }

// Accept only the exact serialized HTTPS origin, never a URL with credentials,
// paths, query, fragments, a default port, or a noncanonical hostname spelling.
function canonicalHttpsOrigin(origin) {
  if (typeof origin !== 'string' || origin.length > 512) return false;
  try {
    const parsed = new URL(origin);
    return parsed.protocol === 'https:' && parsed.origin === origin && !parsed.username && !parsed.password;
  } catch { return false; }
}
async function trustedOrigin(db, origin) {
  if (!canonicalHttpsOrigin(origin)) return false;
  // The environment list and the operator-managed table are explicit alternatives.
  const configuredOrigins = (process.env.HOURS_ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean);
  if (configuredOrigins.includes(origin)) return true;
  const [rows] = await db.execute('SELECT origin FROM pawn_hours_trusted_origins WHERE origin = ?', [origin]);
  // Compare in JS too, rather than depending on MySQL collation/padding behavior.
  return rows.some((row) => row.origin === origin);
}

async function oauthPost(method, body) {
  const base = process.env.MANUS_OAUTH_API_URL.replace(/\/$/, '');
  const response = await fetch(`${base}/webdev.v1.WebDevAuthPublicService/${method}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
  });
  let data;
  try { data = await response.json(); } catch { throw new Error('OAuth returned an invalid response'); }
  if (!response.ok || data.error) throw new Error('OAuth request failed');
  return data;
}

export function registerAuth(app) {
  app.get('/api/auth/session', async (req, res) => {
    try {
      const session = await sessionFrom(req);
      return res.json({ authenticated: !!session, isOwner: isOwner(session), ownerConfigured: !!process.env.HOURS_OWNER_OPEN_ID?.trim(), name: session?.name || null, openId: session?.openId || null, csrfToken: session ? csrf(session) : null });
    } catch (error) {
      console.error('Session verification failed:', error.message);
      return apiError(res, 503, 'Session verification is temporarily unavailable.');
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    if (!configured()) return apiError(res, 503, 'Manus login is not configured.');
    const origin = req.body?.origin;
    // Preview may rewrite Origin. It is not evidence of trust: require an exact
    // operator-approved browser origin and bind the callback to that origin instead.
    if (!canonicalHttpsOrigin(origin)) return apiError(res, 403, 'Login must start from an approved secure application origin.');
    try {
      const db = await ensureDatabase();
      if (!await trustedOrigin(db, origin)) return apiError(res, 403, 'Login must start from an approved secure application origin.');
      const nonce = crypto.randomBytes(32).toString('base64url');
      const redirectUri = `${origin}/api/auth/callback`;
      await db.execute('DELETE FROM pawn_hours_oauth_nonces WHERE expires_at < ?', [Date.now()]);
      await db.execute('INSERT INTO pawn_hours_oauth_nonces (nonce_hash, redirect_uri, expires_at) VALUES (?, ?, ?)', [digest(nonce), redirectUri, Date.now() + NONCE_AGE]);
      const state = Buffer.from(JSON.stringify({ redirectUri, nonce })).toString('base64');
      const url = new URL('/app-auth', process.env.MANUS_OAUTH_PORTAL_URL);
      url.searchParams.set('appId', process.env.MANUS_PROJECT_ID);
      url.searchParams.set('redirectUri', redirectUri);
      url.searchParams.set('state', state);
      url.searchParams.set('responseType', 'code');
      res.cookie(NONCE_COOKIE, nonce, { ...nonceOptions, maxAge: NONCE_AGE });
      return res.json({ authorizationUrl: url.toString() });
    } catch (error) {
      console.error('OAuth initiation failed:', error.message);
      return apiError(res, 503, 'Login is temporarily unavailable.');
    }
  });

  app.get('/api/auth/callback', async (req, res) => {
    // Always consume the initiating browser cookie, even for an invalid callback.
    const cookieNonce = req.cookies?.[NONCE_COOKIE];
    res.clearCookie(NONCE_COOKIE, nonceOptions);
    try {
      if (!configured() || typeof req.query.code !== 'string' || req.query.code.length > 4096 || typeof req.query.state !== 'string' || req.query.state.length > 4096) throw new Error('Invalid callback');
      const state = JSON.parse(Buffer.from(req.query.state, 'base64').toString('utf8'));
      if (!state || typeof state.nonce !== 'string' || !compare(cookieNonce, state.nonce) || typeof state.redirectUri !== 'string' || state.redirectUri.length > 2048) throw new Error('State mismatch');
      const callback = new URL(state.redirectUri);
      if (!canonicalHttpsOrigin(callback.origin) || state.redirectUri !== `${callback.origin}/api/auth/callback`) throw new Error('Invalid redirect');
      const db = await ensureDatabase();
      // Trust is rechecked now, not inferred from an earlier nonce or request Host.
      if (!await trustedOrigin(db, callback.origin)) throw new Error('Origin is no longer approved');
      const [result] = await db.execute('DELETE FROM pawn_hours_oauth_nonces WHERE nonce_hash = ? AND redirect_uri = ? AND expires_at >= ?', [digest(state.nonce), state.redirectUri, Date.now()]);
      if (result.affectedRows !== 1) throw new Error('Expired or used nonce');
      const tokens = await oauthPost('ExchangeToken', { clientId: process.env.MANUS_PROJECT_ID, grantType: 'authorization_code', code: req.query.code, redirectUri: state.redirectUri });
      if (typeof tokens.accessToken !== 'string' || !tokens.accessToken) throw new Error('Missing access token');
      const user = await oauthPost('GetUserInfo', { accessToken: tokens.accessToken });
      if (typeof user.openId !== 'string' || !user.openId || user.openId.length > 255) throw new Error('Missing identity');
      const token = jwt.sign({ openId: user.openId, appId: process.env.MANUS_PROJECT_ID, name: typeof user.name === 'string' ? user.name.slice(0, 200) : '' }, process.env.MANUS_JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d' });
      res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge: MAX_AGE });
      return res.redirect(303, '/staff-hours');
    } catch (error) {
      console.error('OAuth callback failed:', error.message);
      return res.redirect(303, '/staff-hours?login=failed');
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    try {
      const session = await sessionFrom(req);
      if (!session || !compare(req.get('x-hours-csrf'), csrf(session))) return apiError(res, 403, 'Invalid session or request token.');
      const db = await ensureDatabase();
      // Only expired entries may be pruned. Persist this token before clearing it.
      await db.execute('DELETE FROM pawn_hours_revoked_sessions WHERE expires_at <= ?', [Math.floor(Date.now() / 1000)]);
      await db.execute('INSERT INTO pawn_hours_revoked_sessions (token_hash, expires_at) VALUES (?, ?) ON DUPLICATE KEY UPDATE expires_at = GREATEST(expires_at, VALUES(expires_at))', [digest(session.token), session.expiresAt]);
      res.clearCookie(SESSION_COOKIE, cookieOptions);
      return res.json({ ok: true });
    } catch (error) {
      console.error('Logout revocation failed:', error.message);
      return apiError(res, 503, 'Logout is temporarily unavailable; please try again.');
    }
  });
}

export async function requireOwner(req, res, next) {
  try {
    const session = await sessionFrom(req);
    if (!session) return apiError(res, 401, 'Sign in with Manus.');
    if (!isOwner(session)) return apiError(res, 403, 'This account is not authorized to edit store hours.');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !compare(req.get('x-hours-csrf'), csrf(session))) return apiError(res, 403, 'Invalid request token.');
    return next();
  } catch (error) {
    console.error('Owner session verification failed:', error.message);
    return apiError(res, 503, 'Session verification is temporarily unavailable.');
  }
}
