# Meter implementation gates

Reference: Base UI v1.8.0 `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`.
Starting main: `4412d40c73dfc108e959841824d7ff3ff2f27f54`.
Proposed implementation: [PR #32](https://github.com/sveltery/base/pull/32). Draft status does not establish merge eligibility.

The initial runtime checkpoint `c9367f4afeac6f4de2f5ae1726c21bb7e8de8dc2` was pushed and the draft PR opened. The implementation owner reported a successful package build and type check with zero diagnostics. This is bounded runtime checkpoint evidence; it does not certify later tests, shared integration, public consumers, browsers or final-head review.

The integrated candidate working tree based on that runtime checkpoint subsequently passed 19 Meter SSR tests, 14 Meter DOM tests, all 171 runtime/SSR tests and all 333 DOM tests. Both workspace type checks reported zero diagnostics. The internal Meter tarball consumer and standards checks also passed, as reported by the implementation owner. These are working-tree results containing the new test/fixture candidates, not a committed final-head certificate; the public mode and secured browser gates remain pending.

The provenance owner executed `node parity/meter/inventory.mjs /workspace/base-ui-upstream --check` and `git apply --check parity/meter/shared-integration.patch` successfully against the current unchanged shared checkpoint. The snapshot contains 48 exact source files. The initial focused provenance-test attempt stopped at its required browser-file existence check while that file was still being authored. After the browser suite was added, `node --test scripts/tests/meter-provenance.test.mjs` passed its one provenance regression. This establishes snapshot and mapping consistency only.

The byte-exact source inventory has been generated from the actual pinned Git object. Snapshot/hash/count validation is documentation/provenance evidence only. The port ledger starts with 22 ordinary candidates, four separately counted parameterized executions and 15 separate conformance helper declarations, all pending runtime verification. Track has no ordinary declaration but requires full conformance.

The local secured Chromium probe stopped before page creation because `/usr/lib/chromium/chrome-sandbox` lacked the required installation permissions. No sandbox flag, access rule or system permission was changed. Browser runtime parity remains pending hosted execution with the existing secured CI configuration. An implementation-owner report of a clean runtime source review and 49,152 passing arithmetic/formatting comparisons against helpers compiled from the exact pin is supplemental evidence, with zero ordinary declaration credit; it does not replace final exact-head review.

## Serialized source checkpoint

Source checkpoint `4011f2ec96e40d4434b102726c706f1c453532f4` contains the dedicated source/test/fixture/provenance candidates. Full local `bash scripts/verify.sh` and standards completed successfully. An isolated detached checkout at this checkpoint plus the proposed shared patch passed the public root/subpath tarball SSR/type consumer, including all ten named types and required-number assertions, and three catalog/docs consistency checks. This is preview evidence only: the owned branch's shared exports are still unchanged and integrated-head acceptance remains pending.

Hosted [run 36998432321](https://github.com/sveltery/base/actions/runs/36998432321) passed Verification. Its whitespace step rejected single-space blank context lines inside the proposed patch; those lines were removed without changing patch applicability. Standard Track conformance was also restored to its pinned Root wrapper, with context-free Track evidence retained as a separate supplemental pair. The complete browser candidate now has 224 executions: 44 ordinary paired executions, eight parameterized executions, 140 conformance executions and 32 supplemental executions. These totals add no extra ordinary declaration credit. Hosted runtime and configured review results must be inspected at the successor checkpoint.

The PR was initially opened as draft, then marked ready to trigger the configured automatic review without manual external-agent mentions. This does not release shared-file ownership or authorize merge before the remaining gates.

## Outstanding gates

- Coordinate the exact [shared integration proposal](shared-integration.md) through the parent and current shared-file owner. No Input PR #26 or UI #19 decision is included.
- Run full `bash scripts/verify.sh` and `bash .github/standards/check.sh` on the complete integrated head, including the dedicated Meter runtime/SSR/DOM/type tests and builds.
- Run `bash scripts/check-meter-package.sh --public` on that head to verify root/subpath identities, all five parts, SSR, packaged notices and consumer types. Default internal mode and isolated integration previews are bounded evidence only.
- Pass paired React/Svelte tests in real Chromium with `chromiumSandbox: true`, including complete source vectors, all five-part conformance, computed-style assertions, actual SSR/hydration, replacement hosts and raw callback arguments.
- Record exact tested commits and hosted run links before changing ledger status. Parameterized/helper/supplemental executions add no ordinary declaration credit.
- Complete independent exact-head review and configured automatic review, resolve findings, then rerun affected checks after changes. No manual external agent mention is part of this workflow.
- Report exact final merge eligibility before any merge. Verify post-merge CI afterward. No release, deployment, access change or live-data action is authorized.

Final-head checks, browser execution, reviews and public integration remain pending. No runtime passing credit or merge eligibility is claimed in this record.

A source-type audit found the initial native `Record<string, never>` state representation narrowed assignability relative to the pinned public empty interface. Meter now preserves that empty interface with a localized lint explanation; its type witness rejects reading an undeclared status field while retaining upstream structural assignability. Runtime state remains `{}`. This fidelity repair changes no shared types or lint configuration. The successor needs fresh checks and reviews.

Hosted [run 36998999496](https://github.com/sveltery/base/actions/runs/36998999496) executed all 957 secured browser candidates at source checkpoint `2d7cad798aff54e5c1c5fe6b7929db18201b8be4`: 956 passed and one Svelte Label:49 port failed. Meter contributed 223 passing executions and one failure. The captured message contained the exact pinned missing-context error plus Svelte's development component stack. The pin uses `rejects.toThrow(string)` (substring semantics); the browser adapter incorrectly used exact text equality. The successor restores contained-text matching, retains the direct DOM `toThrow` witness and changes no runtime behavior. No full ordinary passing credit is claimed for this failing checkpoint. Standards and Verification passed; independent review found no substantive issues and configured automatic review completed with a bot approval reaction and no review threads on this exact SHA. These reviews do not excuse the failing assertion or shared integration gate.

A deeper rendering-closure audit independently reproduced a state fidelity gap at `face9f656ccae54688e3ae6aaa191f83714a7d3d`: pinned `useRenderElement.tsx` lines 44/66 and `utils/empty.ts` supply one frozen empty singleton. All 15 actual React class/style/render callbacks across the five parts observed a frozen shared identity; local Root/Track callbacks observed mutable distinct objects. The private Meter `emptyState` singleton repairs that behavior without changing shared Element. A DOM regression failed against the previous runtime and is retained; the existing paired replacement supplement now verifies freezing, shared identity, class/style observation, value rerender and host replacement. Execution/declaration counts remain unchanged. The successor must clear fresh full checks, public preview, secured browsers and both reviews.
