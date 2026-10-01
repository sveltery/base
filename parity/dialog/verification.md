# Dialog contract verification

Cloud Linux, Node 24.19.0, Corepack-selected pnpm 12.6.0, 2026-10-01. Final foundation base: **`c3230bf07318f9494c9ae9aabe11f5e32f7c2a3a`**; upstream: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. Initial preparation originated at `377419099d869fcf1d03463dbd52ea3384c4009e` and was first published as `76c81aa8bb18c7f569b590157f4be7cd16d4455c`.

| Check on final foundation | Result |
| --- | --- |
| `bash scripts/bootstrap.sh` | PASS; frozen lockfile; package/lock files unchanged |
| `node parity/dialog/inventory.mjs /workspace/base-ui-upstream --check` | PASS; 175 leaves / 371 variant-part candidates, all unported |
| `node scripts/parity-inventory.mjs --upstream /workspace/base-ui-upstream --check` | PASS; parent-owned inventory 633 entries (4 passing, 629 unported) |
| `bash scripts/verify.sh`: script regressions | PASS; 9 tests, 0 skipped |
| `bash scripts/verify.sh`: library runtime tests | PASS; 19 tests / 4 files (11 foundation baseline, 5 added upstream utility assertion adaptations, 3 added local utility probes) |
| Remaining full verification | PASS; packaging, library/fixture diagnostics, fixture SSR/client build, runtime import boundary and isolated tarball consumer |
| Library diagnostics | 0 errors; existing warning because no Svelte components exist |
| Fixture diagnostics | 0 errors, 0 warnings |
| Dialog browser/SSR/hydration/reference execution | NOT RUN / UNPORTED; no components or real mounting/browser adapter |
| New blanket skips/fake Dialog implementation | NONE |

Both final-base scripts ran directly with `COREPACK_HOME=/workspace/.cache/corepack`. The final foundation's shared toolchain selected pinned pnpm 12.6.0 despite preinstalled pnpm 11.19.0, including nested scripts; the initial preparation's temporary wrapper was not used for this run. No bootstrap/build script or dependency was changed by the Dialog branch. Production fixture build's adapter-auto no-deployment-target message is expected and does not establish hydration behavior.

Independent native review uses **gpt-6.1-sol, high reasoning**, in a separate agent, as requested. Initial review independently verified 175 leaves and 550 direct expect chains against pinned source without expression/order mismatch; helper assertions are retained separately as support source. MIT notice byte-matches upstream LICENSE. Review corrected specification precision for display:contents fixtures, controlled Trigger 2 ownership, negative-only P:682 focus return, and nonexistent callback assertions; initial final disposition had no blocking faithfulness findings. Reviewer did not independently rerun build/test commands; outcomes above are primary-agent execution evidence.

Final-base affected-change review confirms all scenario/test/tracer/license files remain byte-identical to old PR head; only README and this evidence file update the base, toolchain and check outcomes. The prerequisite tests use genuine native Event instances and remain valid with the foundation's new native-event brand check. Shared manifest/scanner/runtime/toolchain changes belong to the foundation base and are excluded from the Dialog PR diff. Final affected-change disposition: no remaining blocking faithfulness findings. Reviewer independently reran both inventory checks and verified unchanged source/assertion scope. A read-only probe of the actual rebased mergeProps source also passed: native preventDefault retains the internal handler, while preventBaseUIHandler suppresses it without native default cancellation. This is utility compatibility evidence only.

Initial preparation typechecking caught an unsupported Node fs type import and generic Events passed to mouse/keyboard-specific reasons. Existing shared TypeScript data and public-valid none reason resolved both without dependencies or fake browser event types. Those fixes and all assertions survive the rebase unchanged. The draft still targets feat/foundation-bootstrap; no merge, package publication, deployment or security change occurred.
