# Accordion verification

Immutable reference: Base UI v1.8.0 `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. Ordinary 39 sites / 43 variants; portable 38 / 42; Panel:201 Activity deferred. The disabled parameterized declaration 1 / 2 variants, five conformance calls, seven type assertions and one expected type error remain separately counted. Source hashes and ordered assertion text are provenance, not execution credit.

## Required checks

- `node parity/accordion/inventory.mjs /workspace/base-ui-upstream --check`: immutable source trace.
- `node parity/accordion/docs-api.mjs --check`: local API documentation consistency.
- `bash scripts/verify.sh` and `bash .github/standards/check.sh`: script/runtime/DOM/SSR/Svelte/build/package and lint/standards gates after serialized shared integration.
- `bash scripts/check-accordion-package.sh`: internal packed entry checkpoint before integration.
- `bash scripts/check-accordion-package.sh --public`: genuine installed tarball root/subpath SSR and types, with frozen-lock reinstall, after integration.
- `pnpm exec playwright test tests/browser/accordion.spec.ts`: secured paired exact-pin Chromium; the focused and complete combined suite are required on the final head.
- Independent review and completed configured automatic review against the exact final commit; resolve findings and rerun affected checks before merge.

[Draft PR #35](https://github.com/sveltery/base/pull/35) is open. Its first source checkpoint `eb96794339f44b627884190924d79e4a27dd3f34` started [hosted CI run 37044112195](https://github.com/sveltery/base/actions/runs/37044112195); Standards passed, with the remaining jobs pending at this checkpoint. This historical run does not establish acceptance of the expanded final suite. No executed secured Accordion browser credit is recorded. [ports.json](ports.json) must identify executed cases and assertion boundaries before any ordinary passing credit is stated. Browser collection, local DOM success and earlier Collapsible results cannot certify Accordion's portable assertions. Public consumers remain blocked until [integration.patch](integration.patch) is serialized with the parent-owned shared changes. Package publication/deployment is outside this work.

## Evidence log

Executed in the uncommitted feature workspace based on main `39e0a4dc6e46b4696837adae691083f18b6e96bd`; these are development checks, not exact-final-head acceptance:

- Immutable inventory `--check`: PASS, 39 ordinary / 43 variants, one disabled parameterized declaration, five conformance calls, seven type assertions, one expected error.
- Local API generation and `--check`: PASS; feature API generator lint: PASS.
- `pnpm --filter @sveltery/base build`: PASS.
- Internal isolated tarball SSR/types: PASS; svelte-check reports zero errors and zero warnings. This checkpoint resolves Svelte/esm-env through local dependency links and does not establish genuine public dependency installation.
- `bash -n scripts/check-accordion-package.sh`: PASS.
- `git apply --check parity/accordion/integration.patch`: PASS against the shared baseline; no shared mutations applied.
- Temporary overlay docs registry/default overview and Accordion renderer Svelte compilation: PASS. This tests the prepared changes without applying them.

The first package assertion incorrectly expected hidden=until-found during SSR. Actual installed React Base UI 1.8.0 renders boolean hidden="" for the same closed hiddenUntilFound scenario, matching the pinned hook's SSR boolean attribute. The package assertion and docs now preserve that reference boundary; the attached client host's until-found string requires browser evidence. This assertion correction introduces no ordinary credit.

Pending: serialized shared integration, genuine installed public consumer acceptance on that integrated head, secured browser acceptance and final-head reviews. Record exact commands/results and commit/run provenance after execution. Preserve failed or unimplemented scope separately; complete Accordion parity remains unclaimed.

## Expanded feature-local checkpoint

On 2026-10-02, after the nested shared-host fidelity repair and all source/test additions, `bash scripts/verify.sh` passed: 43 script regressions, 165 runtime/SSR cases and 651 DOM passes plus the four existing explicitly accepted Input expected failures. Both library and fixture builds, runtime dependency boundaries and existing public tarball consumers passed. Current Svelte/type checks report zero errors and warnings. `bash .github/standards/check.sh`, immutable inventory regeneration, API snapshot consistency and patch applicability also passed. Accordion-specific execution comprises 30 local DOM cases, 70 separate conformance cases, three SSR cases, and actual React context/shared-host witnesses. Seven type assertions and one expected error compile; they remain separate evidence.

The 252 browser candidates collect without skips or retries: 84 paired portable ordinary instances (38 sites / 42 variants per framework), four disabled parameterized instances, 140 conformance instances and 24 supplemental instances. Collection is not execution. Local secured system Chromium aborts because its SUID sandbox helper is misconfigured; the official Playwright Chromium download returns HTTP 403 `Domain forbidden`. Sandbox settings remain enabled and no local browser assertion passed.

An isolated detached checkout of source checkpoint `eb96794339f44b627884190924d79e4a27dd3f34` applied the prepared shared integration slice, then built and passed `bash scripts/check-accordion-package.sh --public`: actual packed root/subpath imports, all parts/types, SSR, dependency metadata, real installation and frozen-lock reinstall, with zero Svelte/type diagnostics. This proves the proposed packaging checkpoint, not integration on the PR branch or final combined-head acceptance. At that historical checkpoint, the main feature checkout's shared files remained byte-identical to the original baseline. The final patch additionally restores the four fixture imports to public root/subpath entries for parent serialization.

Independent production review against the immutable pin confirmed the shared-host mismatch and re-ran actual React/Svelte witnesses after its repair. Exact final-commit review remains required. The configured review requirement may be waived only after exhausted quota is verified, under the user's instruction “And all other pr can skip review if quota is used up”; failing CI cannot be waived. No deployment, release, access change or merge is performed by this feature-local checkpoint.


## Actual-main Meter reconciliation

Actual main `d889e75bedfee9174c3b36d16fe8a9fb2d2a66d3` is merged into this feature branch at `e79873a94129896c795794a5ce64fd4980dd9e03`. Imported Meter source, evidence and shared integration are preserved. The Accordion integration patch has been regenerated additively against that merged branch and remains unapplied. Its eighteen-file scope includes fourteen shared additions and four public fixture import restorations. Catalog totals after application are 11 bounded / 31 unimplemented. The original Meter browser job and combined suite's 20-minute timeout remain intact.

Fresh patch applicability, API snapshot/inventory consistency and temporary overlay scope/docs compilation checks pass at this uncommitted patch checkpoint. The older isolated public package result above is historical, not acceptance of this combined patch. Fresh full local checks, genuine public consumers, secured focused/combined browser suites and final-commit review remain pending. If Avatar integrates shared changes first, recheck the patch against that new stable checkpoint before application. No real shared files were edited by the patch worker.

## Meter-main synchronization

Fetched and verified actual main `d889e75bedfee9174c3b36d16fe8a9fb2d2a66d3`. Its tree `a3d280e372434a4520aede8555e1d7d8771853f5` exactly equals tested Meter head `85ff67c5ddeaec15cdc89322ace75daefafe9a94`; the full tree diff is empty. The feature merged that main without edits to Meter or existing shared source. The additive patch is rebased, remains unapplied, and preserves the existing Meter exports/navigation/consumer/job and 20-minute combined browser budget. The overlay has 11 bounded modules / 31 unimplemented; recheck after Avatar's next stable shared checkpoint.

Fresh local verification on the synchronized feature workspace passed 44 script checks, 184 runtime/SSR tests, and 665 DOM passes plus the four existing accepted Input expected failures. Both builds, runtime boundaries, every existing public consumer including Meter, standards, immutable/API consistency and zero type/Svelte diagnostics passed. The R:794 four initial assertions now execute literally in upstream order, resolving the minor independent review note. The earlier source run `37044928744` passed Standards, Verification and Collapsible but failed the newly inherited Meter browser job because that historical head predated Meter's source files; that failure is not waived and cannot establish green CI. The synchronized successor requires fresh exact-head hosted acceptance.


## Applied integration after Avatar stable import

The parent authorized applying Accordion shared integration on this branch after Avatar stable `cc2c3e217d6d4d9411a9388f53f9814551328982` was imported at `d695b41fed18013ca2827388af2b469ae5b7721b`. The eighteen-target Accordion patch is now APPLIED and regenerated from the exact diff against that imported checkpoint. Public fixture imports, namespace/type exports, API navigation/renderer/test registration, attribution, public package gate and a focused secured Accordion CI job are integrated. Existing Avatar and Meter records/exports/package gates/CI jobs are preserved; the combined 20-minute budget is unchanged. Catalog totals are 12 bounded / 30 unimplemented.

API snapshot consistency and all three focused docs tests pass. Applied-diff reverse applicability, whitespace and shared scope checks pass. Fresh full verification, genuine public consumers, secured focused/combined hosted execution and final-commit review are being handled by the parent after this source checkpoint. Earlier source runs and isolated package witnesses are historical. Avatar is not yet landed; Accordion merge must follow Avatar landing and fresh combined acceptance. This applied patch does not establish merge eligibility or ordinary declaration credit.


## Integrated acceptance checkpoint `6bfa9e75`

Exact source head `6bfa9e75badd8317b4c082eafc16ce039f57bf85` passed full local `bash scripts/verify.sh` and `bash .github/standards/check.sh`: 189 runtime/SSR tests, 769 DOM passes plus the four existing accepted Input expected failures, zero TypeScript/Svelte errors or warnings, both library/fixture builds and runtime boundary checks. Every genuine public tarball consumer passed, including Accordion root/subpath SSR, all public parts/types, real dependency installation and frozen-lock reinstall. Independent review of this exact source head was clean. These results certify this source checkpoint, not later documentation or implementation changes.

[Hosted run 37046421831](https://github.com/sveltery/base/actions/runs/37046421831) has passing Standards, Verification, Collapsible and Meter jobs at this recording boundary. Focused Accordion job `110969003336` completed with five failures, 136 passing executions and 111 not run out of 252 collected cases. R:431 Svelte Root/Item and React Root disabled-click probes hit Playwright's 30-second disabled-element actionability wait; I:9/H:8 Svelte context probes compared full development Error strings that include framework stack text. The fixture/browser owner is repairing these harness adapters against the pinned assertions. These failures remain failures; partial passing executions establish no ordinary declaration credit. The complete combined Dialog job remains pending.

Inherited Avatar job `110969003095` failed five cases involving source reset, scoped class and ARIA timing. The parent and Avatar owner must resolve those failures and land Avatar before Accordion can merge. They are not waived, and this checkpoint does not establish green combined CI. No Avatar source or evidence is changed by this documentation update.

Remaining gates: repair the focused harness failures without weakening pinned assertions and rerun the full Accordion and combined browser suites, correct and land Avatar, synchronize its final shared checkpoint, then require fresh full consumers/CI and review against the exact final Accordion commit. Historical source runs and package witnesses above retain their original scope. Panel:201 React.Activity remains deferred and uncredited even after all portable gates pass; complete Accordion parity remains unclaimed.


The predecessor combined source run at `3a600` did not pass all 252 Accordion cases. Confirmed log accounting is 246 passing executions and six failures: both Root/Item disabled-click probes in both frameworks, plus the two Svelte Item/Header context Error-string probes. An earlier apparent all-pass interpretation was incorrect. These failures supply no ordinary declaration credit. The `6bfa9e75` focused checkpoint therefore retains five failures with early termination; the successor result is recorded below.


## Successful focused checkpoint `377bf32`

Recorded on 2026-10-02 at 18:30:58 UTC. Exact source head `377bf32b9d0181be168e83a6dfa3651a06b26a12` passed [focused Accordion job 110971936333](https://github.com/sveltery/base/actions/runs/37047259152/job/110971936333) in [hosted run 37047259152](https://github.com/sveltery/base/actions/runs/37047259152): 252 unique passing execution labels, zero failures, and the final summary reports 252 passed in 2.8 minutes. The secured suite retains zero retries and no skipped cases. Harness adapters preserve the pinned assertions while dispatching disabled clicks without Playwright actionability waits and observing the context Error message without the framework's development stack suffix.

The dedicated ledger records **38 passing portable ordinary sites / 42 variants** at this source checkpoint, represented by 84 paired React/Svelte ordinary executions. The disabled parameterized declaration **1 site / 2 variants** has four passing paired executions and stays separate. Five source conformance calls map through fifteen immutable helper bodies to 140 passing paired executions; those are separate bounded conformance evidence. The remaining 24 executions are supplemental. Seven generic type assertions and one expected type error remain separate local/type-check evidence. Panel:201 React.Activity has zero credit and remains deferred. The shared manifest stays at 635 entries; dedicated feature credit does not change its totals or establish complete Accordion parity.

Standards, Verification, Collapsible and Meter pass in this run. Inherited Avatar job `110971936275` failed five cases; combined Dialog job `110971936210` is still in progress at this recording boundary. A successful focused Accordion job does not waive Avatar failures or establish combined CI success. The parent and Avatar owner must correct and land Avatar before Accordion merges, then synchronize its final checkpoint and require fresh full consumers/CI and independent final-head review. The earlier `6bfa9e75` local/public-consumer and clean independent review results retain their exact historical source scope; they do not automatically certify later heads. This documentation update is not merge eligibility.


## Imported Avatar adapter correction

On 2026-10-02 the parent authorized importing Avatar correction `94d0bb13d20c3bcee9d2590359b0166870c66b18`, merged at `fdedbcb866d2f0f5d77b5fd63a3d6d9c28076f32`. The imported delta changes only Avatar fixtures, browser assertions and its existing documentation; shared integration remains unchanged from `cc2c3e217d6d4d9411a9388f53f9814551328982`. Accordion runtime, fixtures, browser assertions, immutable inventory and the recorded 252-pass component evidence remain byte-identical to `e474ba628eaa641abe26127eb1bca2ede039b500`. The applied Accordion integration patch still validates in reverse.

The parent reports that this correction resolves the original five Avatar failures, while three later failures and its assertion-audit repair remain pending. This is an import checkpoint, not completed Avatar or combined-head acceptance. PR #35 stays draft. No repeated full verification is requested until the next corrected Avatar checkpoint; after Avatar correction and landing, fresh final combined-head CI/review and eventual exact post-merge CI remain required.


## Resumed independent assertion audit

On 2026-10-02, independent review of published `ce755239d8abce4df600d86c01a1e09aad65d17a` found two source-test fidelity gaps: R:182 omitted the exact pin’s React.StrictMode boundary around Root while unmounting/remounting generated part IDs, and renderProp:146/:163 browser predicates permitted class-name substrings rather than exact class tokens. The reference now preserves StrictMode for that scenario. Browser and DOM helper ports use component-then-render `classList.contains` assertions in source order. No runtime behavior is changed, no expectation is relaxed and no extra ordinary credit is added.

Historical 252-pass execution remains recorded, but its claim for R:182 and both class helper bodies is withdrawn. The ledger retains 37 ordinary passing sites / 41 variants; R:182, the two helper bodies and the five aggregate conformance calls are candidates until fresh paired secured execution. Immutable inventory and 635-entry shared manifest remain byte-identical. Full integrated verification, browser CI and exact final-head independent/configured review remain required after Avatar lands.
