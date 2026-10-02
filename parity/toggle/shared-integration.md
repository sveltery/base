# Parent-owned Toggle integration

The current Input/Separator owner (`01a0fb67-1f88-77b5-99e4-d0a79168802f`) owns shared helper/export/package/catalog files. This branch changes only Toggle source and dedicated fixtures/tests/parity/docs. Shared helpers and existing tests are unchanged. Proposed additions have been sent through the task clarification channel; integration must wait for its committed checkpoint or merged main and a serialized handoff.

Proposed shared additions:

1. `packages/base/src/lib/index.ts`: `export { Toggle } from './toggle/index.js';` and export `ToggleProps`, `ToggleState`, `ToggleChangeEventReason`, `ToggleChangeEventDetails` from that index.
2. `packages/base/package.json`: `./toggle` export with types `./dist/toggle/index.d.ts`, svelte/default `./dist/toggle/index.js`. No dependency or peer-version change.
3. `docs/upstream-differences.md`: index the dedicated [compatibility record](compatibility.md), accepted baseline framework substitutions, inherited D-03, omitted diagnostic/type/group scope and truthful pending gates. Do not call inherited D-03 approved.
4. Parity/catalog index: link the standalone Toggle ledger. Preserve both group declarations as deferred; change aggregate counts only after complete hosted execution and reconciliation with all other component work.
5. Package verification: invoke `bash scripts/check-toggle-package.sh --public` after the build or incorporate its consumer checks into the shared package script. Until exports land, `--public` deliberately fails; the default checks the isolated packaged internal Toggle entry and clearly reports its narrower scope.

New component and fixture imports intentionally target the dedicated source. The tarball consumer proves packaged internal imports/SSR/types first and public root/subpath imports only after `--public` passes. Root/subpath readiness remains blocked until shared integration; internal packaging is not public API clearance.

No shared helper change is needed. A fresh final-head independent review, Standards, Verification, secured hosted browser run and configured automatic review are required after integration. Parent coordinates merge and the next slice.
