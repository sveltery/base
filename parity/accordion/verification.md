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

An isolated detached checkout of source checkpoint `eb96794339f44b627884190924d79e4a27dd3f34` applied the prepared shared integration slice, then built and passed `bash scripts/check-accordion-package.sh --public`: actual packed root/subpath imports, all parts/types, SSR, dependency metadata, real installation and frozen-lock reinstall, with zero Svelte/type diagnostics. This proves the proposed packaging checkpoint, not integration on the PR branch or final combined-head acceptance. The main feature checkout's shared files remain byte-identical to the original baseline. The final patch additionally restores the four fixture imports to public root/subpath entries for parent serialization.

Independent production review against the immutable pin confirmed the shared-host mismatch and re-ran actual React/Svelte witnesses after its repair. Exact final-commit review remains required. The configured review requirement may be waived only after exhausted quota is verified, under the user's instruction “And all other pr can skip review if quota is used up”; failing CI cannot be waived. No deployment, release, access change or merge is performed by this feature-local checkpoint.
