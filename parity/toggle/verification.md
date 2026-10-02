# Standalone Toggle verification

Base checkpoint: `400ab42` (merged main before this slice). Branch: `feat/standalone-toggle`. Exact implementation/review/CI checkpoints will be recorded here or in its draft PR; no pending gate is presented as passing.

Commands: `bash scripts/bootstrap.sh`; `node parity/toggle/inventory.mjs /workspace/base-ui-upstream --check`; `bash scripts/verify.sh`; `bash .github/standards/check.sh`; `bash scripts/check-toggle-package.sh`; after shared exports, `bash scripts/check-toggle-package.sh --public`; secured hosted `pnpm test:browser` with sandbox enabled, retries zero and no skipped source ports.

Local verification passes library packaging, 0-error/0-warning library and fixture checks, runtime tests, DOM wiring, source SSR without browser globals, fixture production SSR/client build and existing tarball consumers. Five Toggle direct DOM companions retain the observable source assertions; supplements cover cancellation channels/order, controlled fallback, fixed initial defaults, stripped form/reset behavior, focused-host identity and ref/attachment cleanup. Local DOM/SSR evidence alone gives no hosted-browser declaration credit.

Local Chromium installation was blocked before launch by HTTP 403 `Domain forbidden` from the official Playwright CDN. Browser flags and security policy were not changed. The configured Ubuntu 22.04 hosted browser job is the required acceptance path.

Pending gates: exact-head independent GPT-6.1 Sol high review; hosted Standards/Verification/secured browser execution; configured automatic review including any fresh ready-triggered review; parent-owned root/subpath exports and their isolated public consumers. Five standalone ports remain ported-pending-verification; :103 and :150 remain deferred and uncredited. Full conformance, group/Toolbar integration and warning strings remain outside scope.

No merge, release, deployment, production credential use, access/security change or upgrade is performed. Next safe work is parent-owned shared integration followed by its exact-head gates; group integration needs a separate bounded task with its missing prerequisites.
