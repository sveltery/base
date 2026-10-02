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
