# Store-hours service integration

## Integration and runtime

- `src/components/HoursSection.jsx` and `src/components/HoursAdmin.jsx` each export a default React component. Mount `HoursSection` wherever public hours should appear. Render `HoursAdmin` at `/staff-hours`; do not hide it behind the legacy/demo account roles. These components communicate only with same-origin `/api` routes.
- Development: run `npm run dev:server` (Express on port 3001) alongside Vite on port 3000, proxying `/api` to `http://127.0.0.1:3001`. The OAuth callback is `/api/auth/callback` on the actual browser-facing HTTPS origin. The app redirects back to the fixed `/staff-hours` after callback. Configure the Manus OAuth platform redirect policy for that callback if needed.
- Production: `npm run build` writes the Vite SPA to `dist`; `npm start` runs `server/index.js`, serves `dist/index.html`/assets, and honors `PORT` (default 3000). The root `Dockerfile` installs the lockfile, builds the SPA, and starts the server. Deployment uses `dockerfilePath: Dockerfile` and `/api/health`. The listener starts before MySQL initialization; `/api/health` reports 503 until the database is ready.
- Required runtime values: platform-provided `DATABASE_URL`, `MANUS_PROJECT_ID`, `MANUS_JWT_SECRET`, `MANUS_OAUTH_PORTAL_URL`, `MANUS_OAUTH_API_URL`; project-configured `HOURS_OWNER_OPEN_ID` as described below. No secret goes to Vite or the browser. MySQL database and development are shared with production; initialization only adds `pawn_hours_*` tables and inserts defaults if there is no settings row. It never replaces existing edits on restart. The shop confirmed Sunday is closed; the initial defaults reflect that. Existing settings are not overwritten when defaults change.
- Session and OAuth nonce cookies are `Secure; SameSite=None; HttpOnly`; browser third-party-cookie restrictions may still block embedded Preview login. Login and callback fail closed if the origin is not explicitly approved or MySQL is unavailable.

## Required exact HTTPS origin registration

No origin is trusted automatically, including the internal proxy host, request `Host`, `Origin` or `Sec-Fetch-Site` headers, and client-supplied origin. A trusted operator has independently registered the current Preview origin. For any changed Preview or future production origin, obtain and verify the actual public origin independently (for example from the platform's Preview UI and its browser address), then explicitly provision that exact canonical HTTPS origin. Include scheme and any non-default port, but **no** path, trailing slash, query, fragment, credentials or wildcard. Do not register an origin solely because a request supplied it.

To register a new independently verified Preview or production origin, first start the server with the intended `DATABASE_URL` and wait for `/api/health` to return 200 so additive initialization has created `pawn_hours_trusted_origins`. Then, from the project directory in a trusted server-side environment with that **same** `DATABASE_URL` available and `npm` dependencies installed, run this one-time out-of-band command (do not put database credentials in source files):

```bash
cd /home/ubuntu/peachpawn
export PREVIEW_ORIGIN='https://REPLACE-WITH-VERIFIED-PREVIEW-HOST'
node --input-type=module <<'NODE'
import mysql from 'mysql2/promise';
const origin = process.env.PREVIEW_ORIGIN;
if (!process.env.DATABASE_URL || !origin || origin.length > 512) throw new Error('Set DATABASE_URL and PREVIEW_ORIGIN');
const url = new URL(origin);
if (url.protocol !== 'https:' || url.origin !== origin || url.username || url.password) {
  throw new Error('PREVIEW_ORIGIN must be an exact canonical HTTPS origin, without a trailing slash');
}
const db = await mysql.createConnection(process.env.DATABASE_URL);
try {
  await db.execute('INSERT IGNORE INTO pawn_hours_trusted_origins (origin) VALUES (?)', [origin]);
  console.log('Trusted origin registered:', origin);
} finally {
  await db.end();
}
NODE
```

Registration changes only the new trusted-origins table and is never performed by HTTP requests. Operators can later run the same command with the independently verified production origin; the allowlist is read at login **and again at callback**, so removing an origin takes effect without relying on a prior login nonce. Configure the OAuth provider to accept the matching `<origin>/api/auth/callback` as well. If the Preview URL changes, register the new verified origin rather than trusting a wildcard.

As an alternative or addition, `HOURS_ALLOWED_ORIGINS` may be explicitly set in the protected **server-side** environment to a comma-separated list of exact canonical HTTPS origins, e.g. `https://preview.example,https://www.example.com`. The trusted set is the union of the table and this configuration. Changing the environment requires a restart; removing a table entry alone does not remove a matching environment entry. An unset or empty list is not permissive. MySQL is still required for nonce storage and session revocation, even for an environment-allowed origin.

## Required owner authorization (fail closed)

There is no documented or injected owner OpenID in this environment, and a Manus account login by itself does not establish ownership. No visitor is automatically promoted. Obtain explicit approval from the actual project/store owner as follows:

1. Register the independently verified HTTPS origin as above. The owner opens `/staff-hours` there and completes real Manus login. The logged-in but unauthorized screen displays **only that signed-in account's authenticated Manus OpenID**.
2. The owner verifies that this is their intended account and securely provides/approves that exact OpenID to the project administrator. Do not authorize an arbitrary visitor or the first login.
3. Configure `HOURS_OWNER_OPEN_ID` through the project's protected server-side environment/secret mechanism in development and publication, then restart the server if required. The value must be the exact case-sensitive OpenID, not a name or email. Setting or changing it should require the owner's approval. Once configured, only a valid, unexpired, correctly signed, non-revoked project JWT with that OpenID may read admin data or write changes. Restarting or changing owner configuration does not reset hours.
4. Reload `/staff-hours`. If login, cookies, OAuth redirect policy, origin registration, or owner setup are unavailable, the editor remains inaccessible. Public reads do not require login.

## HTTP contract

All API responses are `Cache-Control: no-store`. Errors use `{ "error": "..." }`, with 400 validation, 401 unauthenticated, 403 unauthorized/CSRF, 409 date conflict, or 503 service-unavailable responses. No API returns OAuth access tokens or private server settings. The session response includes the current authenticated user's own OpenID and a session-bound CSRF token.

- `GET /api/health`: `{ok:true}` when MySQL and initialization work; 503 otherwise.
- `GET /api/hours`: public `{timeZone:"America/New_York", today:"YYYY-MM-DD", regular:[...], exceptions:[...]}`. Only exceptions on or after the current New York calendar date appear, including all of the relevant date. If MySQL is unavailable the endpoint returns 503 rather than presenting potentially stale hours.
- `GET /api/auth/session`: `{authenticated,isOwner,ownerConfigured,name,openId,csrfToken}`. `openId` and `csrfToken` are present only for the current valid session. `isOwner` is a server-side exact match to `HOURS_OWNER_OPEN_ID`. A database failure verifying a valid session returns 503 rather than authorizing it.
- `POST /api/auth/login`: JSON `{origin: window.location.origin}`; the origin must be explicitly approved by table or server configuration. Preview may rewrite the `Origin` header, which is never treated as proof of trust. Returns `{authorizationUrl}`. State is bound to a short-lived secure nonce cookie and a one-use MySQL nonce; the callback uses an absolute fixed-path redirect URI.
- `GET /api/auth/callback?code=...&state=...`: rechecks that the exact HTTPS origin in the fixed-path redirect remains approved, validates and consumes nonce, exchanges the code server-side, gets the real Manus identity, sets the `webdev_app_session` project JWT and redirects only to `/staff-hours` (or `/staff-hours?login=failed`).
- `POST /api/auth/logout`: requires a valid session plus `X-Hours-CSRF`. It stores only a SHA-256 hash of the full JWT and its expiry in `pawn_hours_revoked_sessions` before clearing the cookie. Revocation applies to the presented app-issued or compatible preview-issued session token on every subsequent authenticated request, even after restart, until that JWT expires; logout does not revoke other tokens. Expired revocations are pruned during a later logout. If verification or persistence fails, logout returns 503 without clearing the cookie; retry when the database recovers.
- `GET /api/admin/hours`: owner only; same shape as public hours but includes past exceptions for maintenance.
- `PUT /api/admin/hours/regular`: owner plus `X-Hours-CSRF`; body `{regular:[{day,status,opens,closes},...]}`. Exactly one each of day 0 (Sunday) through 6 (Saturday), statuses `open`, `closed`, `unconfirmed`. Open entries require same-day 24-hour `HH:MM` strings with closing later than opening; other statuses normalize times to null.
- `PUT /api/admin/hours/exceptions/:date`: owner plus `X-Hours-CSRF`; ISO date `YYYY-MM-DD`; body `{label,status,opens,closes}`. Creates one exception per date, returning 409 without changing it if the date already exists. Use `PUT /api/admin/hours/exceptions/:date?replace=1` explicitly to replace an existing exception or create it if absent. Label is 1–120 characters. Same status/time rules as regular hours.
- `DELETE /api/admin/hours/exceptions/:date`: owner plus `X-Hours-CSRF`; removes the dated exception.

`GET /api/auth/session` returns the CSRF value bound to the verified cookie. Each state-changing authenticated request must supply that value in `X-Hours-CSRF`; the server validates both that token and owner authorization. The session cookie is verified using HS256, `MANUS_JWT_SECRET`, expiry, exact project `appId`, and the database revocation record. A fresh login may issue another token, and already-in-flight requests cannot be retroactively canceled.

## Non-destructive security self-test

Run `node server/self-test.mjs` from the project root. It starts isolated HTTP server instances using in-memory MySQL and OAuth mocks. It tests allowlisting on login and callback, spoofed headers, nonce replay, app and compatible preview session revocation, simulated persistence across server restart, failure-closed database errors, JWT/owner/CSRF checks, and create/replace conflict behavior. It does **not** connect to or modify the shared database. It does not replace an integration test against a separate isolated MySQL instance and the real OAuth provider.
