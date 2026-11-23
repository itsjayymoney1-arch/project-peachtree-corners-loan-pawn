# Repository handoff for Antigravity

Repository: `itsjayymoney1-arch/project-peachtree-corners-loan-pawn`  
Handoff branch: `manus/antigravity-handoff-2026-11-23`  
Active application folder: `antigravity-handoff/`  
Managed source baseline: `0653f80f1b7a67addc3c574ddb7e6c841beb9db7`

Read START_HERE.md, READINESS_AUDIT.md and ANTIGRAVITY_MASTER_PROMPT.md here. This is an active-only source handoff committed alongside the untouched older root application. It is not a database backup, a complete managed Git history transfer, a hosting/auth connection or a production-ready replacement deployment. SOURCE_MANIFEST.json records unchanged baseline source/support/asset hashes. The handoff GitHub commit necessarily differs from the managed baseline commit.

## What is included and what is excluded

The active React/SafeApp/HoursAdmin import closure, Express/MySQL/Manus OAuth backend, dependency lockfile and isolated mock security tests are included. Only the three already-public visual derivatives are copied under handoff-assets/: the archived 2022 storefront, diamond emblem extracted from the business card and optional supplied exterior view. Original upload files, private interiors, real environment files, credentials, database records, dependencies and generated output are excluded. Inactive demo modules are excluded from this application folder; older modules remain at the unchanged repository root and must not be reactivated. Audit references to omitted prototypes describe the original full audited repository, not missing active dependencies.

Baseline README/TODO/server docs are preserved unchanged for source provenance and can contain stale setup claims identified in the audit. Fresher deployment evidence and this handoff govern current status. Do not commit configured owner identity or any credentials when updating docs.

## Existing live site and portability

Read-only checks on November 23 confirmed public successful deployment at the managed baseline on https://peachpawn-yciusafg.manus.space, correct public hours, anonymous administration rejection and working managed storefront image. Auto-publish is disabled. This handoff changes neither that deployment nor Manus's active repository connection. No GitHub main update or deployment is included.

Source retains /manus-storage/ paths. They work in Manus's managed gateway; local copies are not yet mapped to standalone public paths. Propose an approved mapping if external hosting is selected. Opening this GitHub source does not supply Manus OAuth, MySQL, hosting, runtime credentials or Facebook access. Keep the existing live site unless a separate migration/release is approved.

Server configuration names only: DATABASE_URL, MANUS_PROJECT_ID, MANUS_JWT_SECRET, MANUS_OAUTH_PORTAL_URL, MANUS_OAUTH_API_URL, HOURS_OWNER_OPEN_ID; optional HOURS_ALLOWED_ORIGINS, PORT, NODE_ENV. Values are absent, server-only and must be provisioned through protected channels. Current server has no automatic .env loader. Never use VITE_* for secrets.

## Safe local validation

Run commands from antigravity-handoff/, not from the old root app. npm run build compiles the frontend; node server/self-test.mjs uses isolated MySQL/OAuth mocks. The existing tests do not contact the shared database. Never start/import the real server with a shared production DSN merely to test: initialization can create tables/seed missing settings. Real SQL needs an explicitly verified separate disposable target. Mock signing/identity/DSN values in self-test are fabricated fixtures, not production credentials.

The baseline has no lint/typecheck/UI-E2E pipeline. A build is not full production certification. The active-only snapshot build was tested using existing installed dependencies, not a clean install/container/provider acceptance test. Tailwind utility output differs when inactive source modules are excluded; exported active source bytes remain unchanged.

Keep GitHub work on a separate development branch/worktree; no forced resets, stashes, main overwrite, deployment, shared-DB mutations, account connections, messages/posts or schedules without appropriate approval. Begin with inspection and a plan under the master prompt.
