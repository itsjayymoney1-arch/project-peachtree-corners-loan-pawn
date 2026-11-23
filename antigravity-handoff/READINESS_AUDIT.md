# Peachtree Corners Loan & Pawn — Readiness Audit

**Date:** November 23, 2026  
**Author:** Manus AI  
**Audited source:** `0653f80f1b7a67addc3c574ddb7e6c841beb9db7`

The inquiry-first website is **published and public**, but a published website is not the same as a fully connected shop platform. The current site has a genuine call-and-directions customer path, persistent editable hours and an intentionally empty catalog. Automated inventory synchronization, real web-form delivery, customer accounts, payments and social publishing are not implemented in the active application.

## What is verified today

Fresh read-only platform checks confirmed publication, public visibility and deployment success at the audited revision on `https://peachpawn-yciusafg.manus.space`. Live `/api/health` and `/api/hours` returned 200 JSON. Hours matched the confirmed Eastern schedule, with no holiday exceptions. Anonymous `/api/admin/hours` returned 401 JSON. The main storefront image returned 200 image/png through managed storage. These observations supersede earlier notes saying the site was unpublished. Auto-publish remains disabled; this audit did not deploy or change visibility.

`npm run build` and `node server/self-test.mjs` passed. The test replaces MySQL and OAuth with isolated mocks and does not contact the shared database. Earlier, the owner confirmed a successful authenticated regular-hours save. Full production login/callback behavior, holiday create/replace/delete, browser accessibility, restoration and vendor delivery remain unverified. Six source-review areas completed; none failed.

## What should be preserved

The active entry is `src/main.jsx:3–13`, which renders `SafeApp` or `/staff-hours` administration. The inherited `App.jsx` is disconnected. Preserve the approved warm-white/burgundy/charcoal design, authentic diamond emblem, full archival storefront with its 2022 caption and optional supplied exterior view. Do not publish private interior photos or treat them as current merchandise (`src/SafeApp.jsx:76–84,150–156`).

The confirmed phone is 678-691-1692. The address is 7040 Jimmy Carter Boulevard, Suite 4, Peachtree Corners, GA 30092. Native telephone and Maps links exist; an answered call and the exact destination pin have not been tested (`src/data/storeInfo.js:4–17`). The weekly schedule is Monday/Wednesday/Thursday/Friday 10 AM–6 PM, Tuesday 3–6 PM, Saturday 10 AM–3 PM, Sunday closed, in America/New_York.

Keep the empty approved-only catalog, availability disclaimers and conservative pawn/sell copy (`src/data/publicCatalog.js:1–8`; `src/SafeApp.jsx:201–232`). Keep the skip link, landmarks, visible focus and disclosure semantics. Hours already have refresh, timeout, stale-expiry and call-first fallback behavior. Exact HTTPS origin checks, nonce-bound OAuth, explicit owner authorization, constrained JWT verification, persistent session revocation and session-bound CSRF are important safeguards (`server/auth.js:17–32,44–66,85–147`). No active authorization bypass or credential leak was established.

## Priority 1: strengthen the public site's operating foundation

### Recovery is not yet demonstrated

**High operational priority.** No documented backup/restore/application-rollback procedure was found. A source commit is not a backup of edited hours, approved origins, revocations, assets or runtime configuration. Server startup can create tables and seed missing settings, so importing or starting it with the shared production DSN is not a read-only experiment (`server/db.js:17–45`; `server/index.js:16–18,75–79`; `server/README.md:7–8,15–40,68–70`). Existing additive initialization does not overwrite saved hours and is not a demonstrated destructive defect.

Confirm existing platform recovery arrangements or approve a protected recovery runbook. Cover source, public assets, protected configuration and all five `pawn_hours_*` tables. Rehearse restoration only in a verified separate database. Separate application rollback from database restoration, and prevent old restored revocation records from re-enabling logged-out sessions. No backup, restore, migration or live test-data write was performed here.

### Route failures can look like successful homepage visits

**High source correctness priority.** Remaining GET paths fall through to homepage HTML, while every non-staff client pathname renders `SafeApp` (`server/index.js:71–74`; `src/main.jsx:8–12`). Define supported document routes and return true 404/noindex responses for unknown pages and missing assets. Preserve JSON API errors. Actual managed-gateway responses for these failure paths were not checked.

Staff already has an Express noindex header, but its route is advertised in the managed manifest and inherits public initial HTML (`server/index.js:72`; `public/manus-routes.json:1`; `index.html:7–19`). Keep authentication and staff noindex. Do not remove a required Preview route declaration blindly; manage sitemap/indexing through supported mechanisms and verify the served result. Discoverability is not an authorization bypass. Complete canonical and sharing metadata after confirming whether the existing managed origin is the intended canonical. Missing local robots/sitemap files alone do not prove a gateway defect.

### Hours need a little more resilience

**Medium reliability priority.** Public payload checks accept arrays without fully validating the consumed entries. Malformed success data could throw or omit weekdays, although server validators exist and no such production failure was observed (`HoursSection.jsx:10–20,50–56,103,117–127`; `server/hours.js:34–61`). Validate seven unique days, statuses, time ranges, exceptions and consumed date fields before rendering. Invalid data must use the existing unavailable/call-first state, not invented defaults.

Admin requests lack application timeouts, and unconditional writes permit stale-tab overwrites (`HoursAdmin.jsx:11–36,61–97,118–170`; `server/index.js:28–61`). Add bounded requests and preserve drafts. A timed-out mutation can have an unknown outcome: reconcile before retrying. If approved, add atomic version/hash conflicts with useful 409 handling for replacement/deletion. Retain the existing atomic duplicate-create protection. A one-editor operating rule can be a temporary alternative, not equivalent protection.

A unique ID for newly issued app JWTs would avoid a narrow same-second logout/relogin coupling; this is not a forgery finding (`server/auth.js:131,145–147`). Update stale owner-setup documentation without printing the configured identity (`server/README.md:42–49`).

### Customer accessibility needs direct acceptance evidence

**Medium verification priority.** Root smooth scrolling is not covered by the existing reduced-motion selector (`src/index.css:12–16`; `src/safe.css:248–250`). Hours changes lack a concise live-status announcement. The nonmodal mobile menu could use an intentional Escape/focus-return policy, without dialog focus trapping (`HoursSection.jsx:68–99,111–115`; `src/SafeApp.jsx:108–134`).

Responsive CSS exists, but current tests do not establish narrow-screen or assistive-technology acceptance. Test 320px through desktop, zoom, long labels, sticky anchors, hours rows, skip/focus behavior, menu/details and telephone/Maps handoff. No clipping or accessibility score was established. Reserve image geometry from known dimensions and provide a modest failure presentation. Confirm “New listings are coming soon,” or use durable availability-by-phone wording (`src/SafeApp.jsx:227–232`).

### Standalone packaging needs its own safeguards

**High priority only for standalone Docker distribution.** The Dockerfile copies the whole context and the repository has no `.dockerignore`. Git ignores do not restrict a local Docker context. Manus-managed checkpoint builds supply their own exclusions for dependencies, Git and real environment files; this is not evidence of a current managed image leak. Before external builds, restrict the context and inspect image contents in isolation. Keep lockfile-based `npm ci`. Nonroot runtime, toolchain/base-image recording and graceful shutdown are useful hardening, not established outages (`Dockerfile:1–10`; `server/index.js:75–80`).

## Priority 2: make inventory real before making it automatic

An empty catalog is safe for the current inquiry-only site. No active catalog administration/import endpoints exist, and future hardcoded rows would render without approval/status/freshness filtering (`src/SafeApp.jsx:213–225`; `server/index.js:16–64`). Start with a small owner-reviewed batch or a minimal owner-only manual workflow. Separate retail eligibility, publication approval, availability and freshness. Suppress sold, withdrawn, unknown and stale listings. Use real item photos and an explicit public field allowlist; exclude customers, tickets, loans and internal notes.

The inactive Hi-Tech service manufactures synchronization success; AI intake, payment and identity code also simulate capabilities (`src/services/hiTechPawnService.js:571–617`; `aiVisionService.js:4–12,22–109`; `paymentAdapter.js:36–72`). These are activation blockers, not active-site incidents. Do not deploy unused Supabase policies or localStorage roles as production persistence/security (`supabase_schema.sql:397–405`; `src/services/db.js:723–821`).

Actual Hi-Tech work requires the installed product/version, vendor authorization and supported export/API documentation, redacted retail-only samples, stable IDs and verified status/deletion/completeness semantics. Nonpayment or elapsed dates do not independently authorize listing. Use reviewed CSV/import drafts if the vendor cannot support an integration. Import replays must not duplicate items or resurrect sold merchandise; failed or partial sync must not manufacture success or imply a sale.

## Priority 3: connect customer and social workflows deliberately

The active site is phone/visit-first. Inherited contact forms simulate submission; email/SMS simulate delivery, with no active inquiry endpoint (`InquiryForm.jsx:41–56`; `emailService.js:54–77`; `smsService.js:21–41`). Keep them inactive unless a monitored shop-owned destination, provider configuration, minimum fields, privacy/retention rules and real inbox acceptance are approved. Marketing, accounts and payments remain off.

The owner plans to try Facebook access tomorrow; shop-Page authorization is not confirmed. Recover the existing page rather than creating a replacement by default. Instagram must be verified separately. AI/social should prepare drafts from approved facts and public imagery, with exact human approval before publishing. No personal connector substitution, automatic public posting or private interiors.

## Antigravity handoff and owner decisions

The original GitHub checkout does not contain the recent managed redesign and secure-hours work. Antigravity must use the current managed source or compare and reconcile revisions before editing. The accompanying active-only snapshot excludes inactive prototypes, real environment files, dependencies, Git history, generated output and private images. It includes copies of the three already-public visual derivatives, not the private upload originals.

Source does not transfer Manus OAuth, MySQL provisioning, runtime credentials or the `/manus-storage` gateway. Managed asset delivery is currently healthy. External hosting requires approved asset mapping, protected server configuration and verified HTTPS callback/provider support; changing hosts is not necessary to improve the existing site.

The minimum owner decisions are canonical/hosting preference, recovery responsibility, actual holiday exceptions and listing wording. Later inventory/forms/social work needs a named approver/responder, real item facts/photos, vendor/provider documentation and shop-owned access. Sensitive configuration belongs in protected channels, never this report or Git.

The practical order is: strengthen the existing public site; establish approved manual inventory; verify vendor/customer connections; only then consider unattended synchronization or broader automation. This audit is not a production, legal, accessibility or integration guarantee. It changed no website source, accounts, shared database records, publication state or original photos.
