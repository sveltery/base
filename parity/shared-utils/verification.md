# Shared utility execution evidence

Implementation worktree: `/workspace/shared-source-utils`, branch `feat/shared-source-utils`, initially based on main `c3a89dd0cb7c4ce74af2a975e6ec18a245315afb`. First canonical leaf checkpoint: `b51912499a8538c9039860ed58ad3f9743679177` (initialized refs, immutable fallbacks and original closure). Runtime body hashes are recorded in [source-graph.json](source-graph.json). Initial full utility source/test checkpoint: `ac0fc9b0f32f094b80a8e19f03f6fb3f980156d1`, proposed in [PR #46](https://github.com/sveltery/base/pull/46). Final head and independent review will be reported through the PR; neither this evidence nor the leaf dependency checkpoint authorizes merge.

Executed 2026-10-03 with Node 24.19.0, pnpm 12.6.0 and Svelte 5.57.1:

| Check | Executed result | Scope/limits |
| --- | --- | --- |
| `bash scripts/bootstrap.sh` | Pass, frozen workspace dependencies | Managed network policy inspected; no runtime React dependency added. |
| Focused `vitest run --config vitest.dom.config.ts tests/dom/shared-source-utils.test.ts` | 9 supplemental rendered probes pass | Controlled ownership/fallback/setters, warning serializer and dependencies, native function values, live stable callback/untrack, explicit sync cleanup, observed signed-zero and previous-value order, timers/refs and shared logger keys. No upstream assertion credit. |
| Focused `vitest run tests/shared-source-utils-ssr.test.ts` | 1 supplemental SSR probe passes | Native setup callback availability with no client effects/attachments during SSR. No browser hydration or component parity claim. |
| `bash scripts/verify.sh` | Pass: 51 script assertions, 193 unit/SSR assertions; 789 DOM assertions pass with 4 existing expected failures | Includes package/fixture builds, both type checks, packaged runtime import boundary, all documented isolated tarball consumers. Existing expected failures remain identified by the existing suite. |
| `bash .github/standards/check.sh` | Pass | ESLint and configured Prettier checks, separate frozen standards lockfile. |
| Exact source reference witness | Pass against immutable source hashes with React 19.2.8 and jsdom 30.1.1 | [reference-witness.mjs](reference-witness.mjs) loads/transpiles original helper bodies without rewriting their logic. [reference-observation.json](reference-observation.json) records SSR initial guard, ref/layout/passive availability, committed same-turn reads and callable initializer. No parity credit. |

The reference witness can be rerun with `node parity/shared-utils/reference-witness.mjs <immutable-upstream-checkout> <reference-package-directory>`; the package directory must provide React 19.2.8, react-dom and jsdom. This checkpoint used `/workspace/direction-provider-upstream` and `/workspace/dialog-b1/.checks/dialog-exact-renderer` without installing a new reference stack. Hash checks reject a changed source checkout before evaluation.

An early whole-suite invocation used an incorrect pnpm argument separator and ran before SvelteKit sync. It reported missing generated fixture tsconfig plus two fixture scalar signed-zero assumptions. The correct focused command and native boxed-input fixture resolved those harness issues; the completed full documented verification then passed. These preliminary failures are not product parity evidence.

## Resumed delivery and callback fidelity repair

The utility branch was rebased onto source-policy main `7da13ea7d31601316787a3dc892959cdaf983231`. Configured review of the original final head `b3bdfb266b1a6e51eb77459d66f6c727eddfddac` identified a stale callback capture in `useValueChanged`. The repair at `72889961123096955875ade8b1b4b2062736c2fa` accepts a live callback getter and invokes its current optional handler through the existing stable callback helper. Callback changes do not trigger a value notification themselves; value tracking still advances when no handler is present. This retains source business ordering without React render machinery.

Executed again on the repaired runtime body with the same Node/pnpm/Svelte versions:

- Focused native DOM probes: **10 pass**, including handler replacement and absent-handler previous-value tracking; focused SSR: **1 pass**.
- Exact immutable-source reference witness: **pass**, React 19.2.8/jsdom 30.1.1; original observations unchanged.
- Full `bash scripts/verify.sh`: **pass**, 51 script assertions, 193 unit/SSR assertions, 790 DOM passes plus four inherited expected failures, both diagnostics/builds, runtime boundary and isolated package consumers/MIT checks.
- `bash .github/standards/check.sh` and `git diff --check`: **pass**.

Historical hosted runs `37083324635` (utility head `b3bdfb2`) and `37084426449` (dependent rendering head `78954af`) finished all eight jobs successfully. They do not establish acceptance of this repaired head. Fresh exact-head CI, configured review, independent source/native/maintainability review and PM approval remain required.

Dependent Input/Field/rendering closure review and secured paired browser acceptance remain separate, applicable gates. Helpers are internal and add no public package exports or catalog/assertion credits.
