# Current control-witness launcher

The first current-head attempt used `pnpm --filter @sveltery/base exec vitest`. Pnpm attempted an automatic install and stopped before any test ran with `[ERR_SQLITE_ERROR] unable to open database file`. This was a tooling launch failure, not a failed component observation. Its complete output remains in the tool transcript; the redirected file was overwritten when the direct installed runner executed after an incorrect relative-path move failed.

The existing installed runner then executed directly from `packages/base` with `NODE_ENV=development NODE_OPTIONS=--max-old-space-size=768 node node_modules/vitest/vitest.mjs run --config vitest.collapsible-boundary.config.ts`. All three four-way Original/bare-Svelte/canonical-control/Collapsible comparisons passed; exact successful output is `native-control-isolated.log`. No dependency was installed or runtime/assertion changed to make the test run.
