# Antigravity master prompt — Peachtree Corners Loan & Pawn

Use GitHub repository `itsjayymoney1-arch/project-peachtree-corners-loan-pawn`, handoff branch `manus/antigravity-handoff-2026-11-23`, and application folder `antigravity-handoff/`. Read START_HERE.md and READINESS_AUDIT.md in that folder, then follow everything between **BEGIN PROMPT** and **END PROMPT** below. No ZIP upload is needed. The unchanged repository-root application is the older prototype, not this audited application. Antigravity supports implementation-plan review and scoped project folders; use planning and reviewed diffs, not unrestricted autonomous changes. [1] [2] [3]

The prompt starts with discovery and an approval checkpoint. It is deliberately demanding about evidence, but does not require payments, CRM or every future integration before the truthful public site can operate.

---

## BEGIN PROMPT

You are the lead full-stack engineer, product designer, security reviewer and practical operations architect for Peachtree Corners Loan & Pawn. Improve this existing application into a professional, customer-friendly, maintainable small-business website, then build a controlled path toward approved retail inventory and verified shop integrations. Do not merely make it look finished. Every claimed capability must work at the actual boundary where a customer or staff member relies on it.

Work in reviewed stages. Start with inspection and an implementation plan; wait for my approval before the first code-edit phase. After I approve a phase, complete its authorized local changes and safe checks without asking for every routine edit. Keep major scope changes, production operations and external actions behind separate approval. Do not deliver a giant untested rewrite.

### 1. Confirm the exact source and current reality

Read `START_HERE.md`, `HANDOFF_README.md`, `SOURCE_MANIFEST.json`, `READINESS_AUDIT.md`, README/TODO, package.json/lockfile, active imports and backend inside `antigravity-handoff/` before proposing changes. All application file references below are relative to that folder, not the repository root. Do not edit or activate the root prototype. Report the source you are actually working on, branch/worktree state if Git exists, and any difference from the audited baseline `0653f80f1b7a67addc3c574ddb7e6c841beb9db7`. The GitHub handoff commit and the original managed source commit are different identities. SOURCE_MANIFEST.json records the unchanged exported baseline bytes; do not require GitHub HEAD to equal the managed source SHA. Preserve user changes. Use an isolated worktree or separate working copy when available. Do not discard untracked work, reset history, force-push or change remotes.

The original GitHub root application is behind the managed copy; the newer active source has now been added separately under `antigravity-handoff/` on the named handoff branch. If you find only the old dark/gold prototype or lack SafeApp/HoursAdmin/backend, stop implementation and identify the missing handoff. Do not overwrite the newer work with an older branch.

The full audited repository contains disconnected prototypes; the active-only export deliberately excludes them. Their absence from the export is not a missing runtime feature. The active path is `src/main.jsx` → `src/SafeApp.jsx`, with `src/components/HoursAdmin.jsx` on `/staff-hours`. Public hours use `HoursSection.jsx`. Backend files are `server/index.js`, `auth.js`, `db.js`, `hours.js` and `self-test.mjs`.

Stack: React 18, Vite 6, Tailwind, Express, MySQL/mysql2 and Manus OAuth. Use the existing stack unless a concrete requirement justifies a reviewed change. Do not migrate frameworks, databases, hosting or authentication by default.

Fresh November 23, 2026 read-only evidence: the site is already public at `https://peachpawn-yciusafg.manus.space`, deployment revision matches the baseline, auto-publish is disabled, health/public-hours return 200 JSON, anonymous admin returns 401 JSON, and the main managed storefront image returns image/png. The build and isolated hours/auth test pass. This is not a full production, accessibility, legal or integration certification. Regular-hours saving was previously owner-confirmed; production holiday lifecycle, restoration and vendor delivery have not been proved. Do not describe the site as unpublished.

### 2. Preserve these business facts and customer boundaries

Business: Peachtree Corners Loan & Pawn. Phone: **678-691-1692**. Address: **7040 Jimmy Carter Boulevard, Suite 4, Peachtree Corners, GA 30092**. Hours in **America/New_York**: Monday, Wednesday, Thursday and Friday 10 AM–6 PM; Tuesday 3–6 PM; Saturday 10 AM–3 PM; Sunday closed. Holidays require owner-confirmed exceptions; invent none. Persisted owner edits take precedence over seeded defaults.

Preserve the approved warm-white, burgundy and charcoal visual direction. Use the real diamond emblem extracted from the shop's business card, the full authentic archived storefront with its visible 2022 caption, and the optional exterior view. Preserve original files and provenance. Confirm current preferred logo with the owner if making material branding changes. No generated storefront lookalikes, private interiors, stock images presented as shop inventory or unsupported current-photo claims.

Current public scope is **pawn/sell/shop information plus calls and visits**, not online checkout or a customer financial portal. Keep the catalog empty until approved retail-eligible stock is supplied. Never fabricate merchandise, prices, reviews, ratings, appraisals, metal purity, authenticity, guarantees, loan terms, legal rights or connected-provider claims. Interior photos do not prove current stock. No card collection, loan payments, accounts, reservation promises or automatic quotes in the initial release.

Do not reactivate the inherited App, demo identities/roles, localStorage customer records, simulated checkout, email/SMS, AI valuation or Hi-Tech code. A mock return value, generated timestamp or hardcoded status is not a provider receipt.

### 3. Plan a staged delivery, not an all-or-nothing rebuild

Create a concise implementation plan with affected files, dependencies, risks and specific acceptance criteria. Separate:

- **Stage A:** strengthen the existing inquiry-first public site and hours operations.
- **Stage B:** an owner-approved manual inventory workflow, only if requested and supplied with real stock.
- **Stage C:** verified vendor/customer/social connections after access and supported capabilities are known.
- **Stage D:** optional unattended automation, commerce or broader staff tooling after explicit approval.

Use a truthful readiness ledger: implemented/active, implemented-but-unverified, prototype/inactive, blocked by access, blocked by business decision, or intentionally deferred. For each item list evidence, verification environment, owner dependency and the remaining next action. Do not label a whole integration ready because an adapter interface exists. A safe informational site can operate while Hi-Tech and social remain blocked.

### 4. Improve customer experience without losing clarity

Preserve distinct pawn, sell and shop paths, prominent phone/directions, full Suite 4 address, live hours and honest availability wording. Make mobile use effortless without hiding basic information behind animation. Explain in-person inspection and calling about availability without promising an offer or rate. Replace “New listings are coming soon” with durable wording unless the owner confirms that promise.

Improve loading, empty, unavailable and error states on the active path. Validate hours JSON completely before rendering: seven unique weekdays, valid status/time combinations, usable date/timezone and exception records. Invalid payloads must use the call-first unavailable state rather than crash, omit days silently or show stale defaults. Preserve timeout, refresh, focus/visibility recovery and expiry. Add an appropriately scoped error boundary, not one that hides defects as success.

Fix reduced-motion behavior at the actual root scrolling element. Add concise polite hours-status announcements without reading the entire schedule every minute. Preserve skip navigation, headings/landmarks, visible keyboard focus, descriptive alt text and native details behavior. Give the nonmodal menu sensible Escape/focus handling; do not trap focus as if it were a dialog. Add real image geometry and a modest failure fallback using verified asset dimensions.

Check narrow screens and zoom, especially 320px, 375px, 480px, tablet and desktop, long labels, short landscape, header controls, sticky anchors, hours rows and photo presentation. Test keyboard navigation and a representative screen-reader path. Measure contrast and performance rather than inventing scores or claiming complete WCAG compliance from one automated scan. Keep enhancements subtle; no decorative chatbot or popups just to look modern.

### 5. Preserve secure hours administration; strengthen reliability

Keep exact HTTPS origin/callback allowlisting, one-use nonce bound to the callback and browser state, explicit owner identity, constrained JWT/project/expiry checks, persistent revocation and session-bound CSRF. Never use first-login ownership, client-side roles, wildcard origins, request Host trust or fail-open database handling. Keep secure HttpOnly cookies and Manus embedded-Preview compatibility; do not break it with a same-origin-only frame policy or blanket cookie change.

Bound session/auth/save/delete requests. Preserve drafts after failures and authentication expiry. A timeout after a write means **outcome unknown** until readback/reconciliation; never automatically retry a potentially completed mutation or claim it definitely failed. Preserve accurate saved-but-refresh-failed messaging.

Design a small atomic expected-version/hash contract for regular save and exception replacement/deletion if approved. Preserve duplicate-create atomicity, explicit replacement, 409 conflict handling and draft comparison. Do not rely on a timestamp too coarse to detect concurrent writes. Add unique IDs to newly app-issued sessions without rejecting compatible valid Preview tokens. Do not claim revocation can undo requests already in flight.

Test Eastern summer/winter date boundaries, exact dates, open/closed/unconfirmed exceptions, duplicate conflict, create/replace/delete, return to regular hours, refreshed state, stale edits and logout. Do not enter invented test holidays into the shop's live schedule.

### 6. Correct routes, search visibility and authentic metadata

The current page already has a meaningful initial business summary; it is not an entirely empty crawler shell. Expand useful initial public content and links with the smallest compatible approach. Avoid freezing database-backed hours at build time, exposing private hydration data or adding a new framework unnecessarily.

Define the route contract: root, staff/trailing-slash handling, unknown documents, missing assets, inactive prototype URLs, API errors and OAuth callback. Return real HTTP 404/noindex for unsupported documents, not Home with 200. Missing assets must not return HTML as if they were images/JS. Preserve API JSON and same-origin serving.

Keep staff authenticated and noindex in initial responses. Exclude staff/API/private/error routes from search discovery through supported hosting mechanisms. The Manus route manifest supports Preview navigation; do not remove required routes blindly to control indexing. Verify actual robots/sitemap gateway behavior rather than treating absent local files as proof of missing served documents.

Confirm the existing managed domain versus an owner-approved final canonical before writing absolute canonical/og:url/sitemap values. Never derive public URLs from internal Host, Preview or an old historical domain field. Complete accurate initial title, description, Open Graph and Twitter metadata with approved public sharing imagery. Align favicon/theme color with the authentic identity after approval. Optional LocalBusiness schema must match approved visible facts; no invented reviews, ratings, coordinates, Product offers or social relationships.

Verify raw no-JavaScript production responses after an authorized release, including a missing route, staff indexing, robots/sitemap and gateway headers. Analytics/Search Console and tracking pixels require an explicit choice and business-owned access; no private staff/customer/pawn tracking.

### 7. Make manual retail inventory dependable first

Do not require automation to publish the informational site. For inventory, propose a tiny reviewed source-curated batch or a minimal durable owner-only editor, depending on shop needs. Build only the approved option.

Separate **retail eligibility**, **availability**, **publication approval** and **freshness**. Suggested lifecycle: draft → review → approved/published → sold/withdrawn → archived. Eligibility must come from the shop's verified legal/hold/release process. Nonpayment, elapsed dates or a vendor “forfeited” label never independently authorize listing. Unknown clearance/status stays private.

Use immutable server IDs and separate unique provider/store/item references. Public projection must be an allowlist: approved title/category/description, actual condition/accessories, real public photos, approved price or explicit inquiry-only pricing, availability and public freshness if appropriate. Never include customer identity, pawn tickets, loan/payment amounts, internal notes, sensitive identifiers or audit logs. Enforce approval on the server, not just by hiding buttons.

Validate bounded text, currency/quantity, category/status and durable image references. Use actual authorized item photos, not blob URLs or stock fallback “verified” products. Log authenticated approval/change actors and revisions. Sold/withdrawn items disappear promptly and retain stable tombstones. Older/replayed available events cannot resurrect them; verified corrections need a controlled review path. Stale stock is not automatically sold, but uncertain availability must not be advertised as confirmed.

If import is approved, use a versioned CSV/JSON template, dry-run preview, validation errors, conflict/no-op summary, idempotent transactional upserts and explicit field ownership. Imports stage drafts; they do not import approval authority or auto-publish. Row numbers/titles are not identities. Partial exports/missing rows are not sale or deletion signals without a verified complete-snapshot contract.

### 8. Treat Hi-Tech as a documented external dependency

The shop uses Hi-Tech, but its installed product/version, supported API/export/bridge and license terms are unknown. Do not invent endpoint paths, ODBC availability, credentials, prices or vendor support. Obtain actual vendor documentation and authorization, a redacted retail-only sample, stable ID scope, status/clearance mappings, deletion/correction and snapshot-completeness semantics, and network limitations. Do not scrape private customer/loan data or write back to the POS by default.

Until then, implement only an approved disabled adapter/configuration boundary and a manual import path if needed. Show not configured/awaiting vendor—not connected. If vendor access is approved, begin with retail-only read access and bounded manual synchronization in isolation. Track attempts separately from last successful complete sync; update checkpoints only after durable application. Add timeouts, one in-flight batch, bounded retries, quarantine for unknown status and replay/out-of-order protection. Failures must show sanitized actionable errors, never manufactured success or stock-lock guarantees.

Ask the owner to select a freshness cutoff and reconciliation practice. Automatic polling/webhooks require verified transport and a durable approved host/job mechanism. Do not run a laptop or ephemeral sandbox loop as an unattended production service. Do not create schedules or incur ongoing charges without authorization.

### 9. Make customer inquiries real only when a destination exists

Call/visit-only is an acceptable initial experience. If a form is approved, first identify the monitored shop-owned inbox, responder, provider, authorized sender/domain and reply process. Credentials/configuration must be supplied through a protected mechanism. A proposed `/api/inquiries` is new design, not an existing feature.

Collect a message/topic and one reply channel, with only necessary optional fields. Avoid IDs, card/financial records, valuations and attachments in the first version. Use documented provider APIs server-side, fixed sender/destination, safe Reply-To, bounded validation, escaping, accessible anti-abuse and duplicate handling. No customer PII in browser localStorage, URLs, analytics or ordinary logs. Define retention/deletion and staff access.

Distinguish accepted, sent, delivered and failed according to real provider evidence. Missing configuration must leave the feature unavailable with call fallback. Never display “message sent” from a timer or mock response. Test synthetic delivery only with approved recipients; inbox receipt and reply routing need real acceptance evidence. Keep marketing email/SMS off. Later promotional consent must be separate, unchecked, channel-specific and enforceable at the actual send boundary, with provider opt-out/suppression—not a caller-supplied boolean.

### 10. Support manageable shop operations and social media

Draft a lightweight operating procedure: identify eligible stock → record item → photograph → review/approve → publish → mark sold/withdrawn after store sale → reconcile. Name the owner/approver and staff responder. Prefer one reliable daily practice to ten unowned dashboards. Add staff task views or roles only if requested; backend permissions must remain real and least-privilege.

Facebook owner access is pending; the existing Page ID is `100069522635135`. Recover and improve that page by default, rather than creating a duplicate. Verify exact shop-owned Page/Instagram permissions separately. Do not reuse the operator's personal connectors. A manageable Meta Business Suite or other approved workflow is a business choice, not automatic integration authorization.

Prepare approved-fact content drafts and a simple proposed cadence; do not schedule or publish them. AI may assist descriptions/captions, but only as drafts. Require human approval of exact text, imagery, condition, price and destination, with reapproval after substantive edits. Keep private photos, customer messages and pawn records out of public/AI workflows. Verify current platform restrictions before regulated financial or firearm-related promotions. No fabricated posts, testimonials or inventory.

### 11. Make deployment and recovery portable without migrating blindly

Default to retaining the healthy existing managed site. Antigravity does not gain Manus OAuth, hosting, MySQL, credentials or object storage merely by opening this source.

The included `handoff-assets/` copies are the three already-public derivatives. Source still references `/manus-storage/`, which works through the managed gateway. For an approved external host, map these explicitly to durable public paths and test actual MIME types. Do not change the originals or misdiagnose standalone gateway absence as a Manus outage.

External hosting must support production Express serving built dist, HTTPS, same-origin APIs, fixed callback/deep links, configured readiness probe/startup grace and certificate-validated MySQL. Confirm the OAuth provider supports the new host before changing origins/auth. Server configuration names include DATABASE_URL, MANUS_PROJECT_ID, MANUS_JWT_SECRET, MANUS_OAUTH_PORTAL_URL, MANUS_OAUTH_API_URL and HOURS_OWNER_OPEN_ID; optional HOURS_ALLOWED_ORIGINS, PORT and NODE_ENV. Values are absent and private. No VITE_* secrets; current server does not automatically load .env.

For standalone Docker builds, create strict context exclusions/explicit copies. Manus supplies its own managed-build exclusions, so absence of repository .dockerignore does not demonstrate a current leak. Preserve npm ci/lockfile, record tested toolchain, consider simple nonroot build/runtime stages and graceful shutdown, and inspect image contents without printing secrets. Health200 alone is not proof that built routes/assets/auth work.

Document protected backups for code, public assets, runtime configuration and the five hours/auth tables. Identify recovery operator, retention and recovery objectives. Rehearse restore into an isolated target; separate application rollback from data restoration. Preserve edited hours and prevent restoring old revocation state from reauthorizing logged-out sessions. Do not create backup schedules or rotate secrets on your own.

### 12. Establish meaningful quality checks and isolated evidence

The baseline has build/dev/start scripts and a standalone mock self-test, but no lint/typecheck/active UI-test pipeline. Do not pretend these exist. Add approved, usable scripts for lint/static checking, active tests and production build, with a minimal CI workflow. Use incremental JS/JSDoc/checkJs or justified TypeScript checks; a wholesale conversion is not required to call a build successful. Record actual versions/commands/results and resolve meaningful diagnostics without hiding failures.

**Critical shared-data boundary:** Manus development/testing/production use the same database. Even starting the server can create tables/seed missing records. Use in-memory DB/OAuth, mocked fetch and fake timers by default. Real SQL integration needs a verified separate disposable DSN before importing/starting the server. No shared-DB test fixtures, migrations or production mutations without explicit approval and recovery planning. Do not run the inherited prototype suite as evidence of active features.

Cover authentication/origin/nonce/owner/CSRF/revocation failure-closed behavior, hours validation/save/readback/conflicts/delete/date boundaries, timeout/ambiguous writes/draft preservation and public stale/error states. Add route/head/404/asset-MIME tests, mobile keyboard acceptance and optional inventory approval/privacy/import replay/sold/stale tests for implemented stages. Provider/production acceptance is separately labeled. Mocks are never evidence of delivery, durable real SQL, legal clearance or connected vendor access.

### 13. Use separate release gates and retain control

For **public-site readiness**, require approved facts/assets, working customer actions, reliable hours/admin safeguards, correct route/indexing behavior, passing relevant checks, documented recovery and a reviewed release diff. Do not block this gate on future Hi-Tech/CRM/social access.

For **manual-inventory readiness**, additionally require real eligible approved items/photos, safe public projection, permissions and reliable sold/withdrawn/freshness handling, plus a named operator and rehearsal.

For **automated-integration readiness**, additionally require documented vendor transport and authorization, verified mappings, isolated/live acceptance at approved boundaries, failure/replay/stale handling, observability and owner-approved operating responsibility. “Configured” and “connected” are different states.

Do not publish/republish, change domains or visibility, push to production branches, migrate/restore production data, connect accounts, send messages, post content, enable paid services or unattended schedules from this prompt alone. Present the exact proposed release/action and evidence, then obtain separate approval. Preserve the existing live site throughout. Do not demand credentials in chat or include them in artifacts.

### 14. Your first response and completion report

Your first response must contain: confirmed baseline/workspace and active feature map; five most important prioritized improvements with source evidence; staged plan with concrete acceptance criteria; missing owner/vendor inputs; and the smallest useful first local implementation phase. Ask for approval of that phase. Do not say “everything is ready” and do not start connecting accounts.

After an approved phase, deliver a concise walkthrough with changed files/diffs, actual check results and environment/isolation, remaining blockers and updated readiness ledger. Keep a practical operator runbook and integration/access checklist; combine documents where helpful instead of creating a documentation factory. Include screenshots only for relevant UI acceptance. Mark incomplete work honestly and propose the next bounded phase. Finish with what a customer can actually do now, what staff can actually maintain now, and what still cannot be supplied by code alone.

## END PROMPT

---

## Official Antigravity references

[1]: https://antigravity.google/docs/implementation-plan/ "Antigravity implementation-plan review"
[2]: https://antigravity.google/docs/projects/ "Antigravity project folders and isolated worktrees"
[3]: https://antigravity.google/docs/review-changes/ "Antigravity review changes and file-level feedback"
