# Dialog test-first handoff

This branch prepares Dialog behavior contracts against React Base UI **v1.8.0 / `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`**, originating at foundation **`377419099d869fcf1d03463dbd52ea3384c4009e`** and rebased onto final foundation **`c3230bf07318f9494c9ae9aabe11f5e32f7c2a3a`**. All Dialog behavior remains **unported**. The parent assigns implementation and harness work after review.

Read [scenarios.md](scenarios.md) first. It specifies real fixture topology, ordered operations, exact observation requirements and implementation acceptance gates for state/control/cancel, event ordering/composition, focus/Tab/Escape/return, portals, outside press/nesting, presence/cleanup and SSR hydration. It distinguishes source-derived supplemental gates from upstream leaf assertions, and lists the unported remainder without substituting mocks or broad skips.

## Deliverables and evidence boundaries

| File | Purpose / current evidence |
| --- | --- |
| [upstream-inventory.json](upstream-inventory.json) | 175 literal leaf declarations, expanded to 371 variant/part candidate records. Includes all ten Dialog test files, the public type-spec source hash, popup shared conformance, and four local part conformance helpers. Every leaf is unported/port=null. Exact assertion expressions, suite/title/source line IDs, fixture calls, shared support source, source SHA-256, parameter axes, conditions and upstream guards retained. |
| [inventory.mjs](inventory.mjs) | Read-only pinned-source AST tracer using the workspace's existing TypeScript installation. Reads committed bytes, rejects a different upstream HEAD, and supports byte-exact regeneration checking. Executes no upstream code. |
| [merge-scenarios.ts](merge-scenarios.ts) | Four framework-neutral callback-composition cases usable by a real native or React reference adapter. Metadata explicitly restricts evidence to utility prerequisites. React reference adapter is **unported**. |
| [dialog-merge-prerequisites.test.ts](../../packages/base/tests/dialog-merge-prerequisites.test.ts) | Five runnable upstream merge assertion adaptations (:6 plus four shared cases). Executes existing mergeProps. Native Event/lowercase props adaptation documented; no real button/Trigger/Close mounting or Dialog behavior is verified. |
| [dialog-event-prerequisites.test.ts](../../packages/base/tests/dialog-event-prerequisites.test.ts) | Three new local regressions showing independence of native default prevention, merge-handler prevention, detail cancellation and propagation permission. Not upstream ports. Uses reason=none with actual Node Event, not an invented MouseEvent/KeyboardEvent. |
| [UPSTREAM_LICENSE](UPSTREAM_LICENSE) | Complete pinned MIT copyright/permission notice for derived test excerpts and specifications. |
| [verification.md](verification.md) | Cloud commands, outcomes, independent-review scope/findings and limits. |

The 371 count is a trace expansion, **not a passing-test denominator**: helper source conditions/guards still apply. H:155 is unconditionally skipped upstream; that fact is recorded as provenance, not copied into a new skipped suite. Public payload typing is separately specified in scenarios.md, not counted as a runtime leaf. Direct expect chains exclude expectations in called helpers; supportDeclarations preserves those helpers, and outside-06 explicitly requires their assertions. No report may claim complete assertion coverage merely from the direct count.

The parent owns `parity/manifest.json` and its scanner. This Dialog-specific trace does not rewrite the shared manifest. The final foundation scanner correction inventories 633 scoped entries: 4 passing, 629 unported. Our five utility adaptations remain separate evidence pending coordinated shared-manifest reconciliation. Existing PR1 native-event/class adaptations remain proposals under review. The five executable utility adaptations have run evidence but confer zero Dialog parity; reconcile their shared-manifest entries only in coordination with the parent.

## Reproduce

Run the existing frozen bootstrap with Node 24.x and pinned pnpm 12.6.0. Keep the pinned upstream checkout outside this repository. No package, lockfile, runtime, build configuration or CI edits are necessary:

```sh
# In the sveltery/base checkout after existing bootstrap:
node parity/dialog/inventory.mjs /path/to/base-ui-at-47b40521 --check
pnpm --filter @sveltery/base test
bash scripts/verify.sh
```

Without `--check`, the tracer regenerates only `parity/dialog/upstream-inventory.json`. No upstream build/install is required. The check compares the committed Dialog trace to the exact source snapshot; it does not run React or Svelte Dialog. On the final foundation, the shared toolchain selects pnpm 12.6.0 through its Corepack fallback, including nested package scripts. The rebased bootstrap/verification ran directly with the preinstalled pnpm 11.19.0 present and COREPACK_HOME pointing to the existing writable cache; the earlier temporary wrapper was not needed.

## Review and implementation acceptance gates

1. **Approve contract fidelity first.** Keep each upstream source identifier, all intermediate and negative assertions, and parameter cross-products. Any assertion change needs a specific review record; no approved deviations currently exist. Maintain this trace separately from the parent-owned shared manifest until coordinated.
2. **Assign a real harness.** Parent chooses the Svelte render/snippet/ref/action API and a browser/SSR mounting adapter. Supply contained, detached and multiple-detached fixtures; asynchronous host updates; actual native event identity; internal openchange observation; real keyboard, pointer/touch, shadow DOM, animation and hydration support. Do not install reference React or browser dependencies in the runtime package. This branch does not authorize dependency/config changes.
3. **Run P0 behavior on actual parts.** Use the first-slice scenario tables in order. Utility checks cannot satisfy component event composition or canceled open/close/internal-dispatch gates. Real-browser focus and trusted Blink outside-click tests cannot be replaced by Node/synthetic-only tests.
4. **Run both frameworks and record differences.** A future React adapter and Svelte adapter share operation/observation contracts; each port records source variant, fixture/test path, adapter differences, retained assertion list and command/result. Framework syntax differs only through an explicitly reviewed mapping. Store/ID/lifecycle supplements have separate provenance and do not masquerade as source test ports.
5. **Expand the remainder for complete Dialog.** Handles/payload/remount/reparent, ARIA label lifecycle, all eight parts' conformance, public payload types, sibling/cross-type nesting and dependent component regressions remain explicit gates. Missing Menu/Select/AlertDialog/Drawer/ScrollArea/NumberField fixtures are **unported**, not substituted or blanket-skipped.
6. **Keep foundation checks passing; publish draft only.** Final-base verification passes 19 runtime tests and 9 script tests, builds/diagnostics/import/tarball checks, and both pinned inventories. All source assertions/scenario fixtures are byte-identical to the initial reviewed Dialog head; only handoff/evidence prose changed for the coordinated rebase. Draft targets feat/foundation-bootstrap; no merge, npm publication, deployment or security change is in scope.
