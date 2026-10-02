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

No final head, hosted run, PR or executed browser acceptance has been recorded by this documentation checkpoint. [ports.json](ports.json) must identify executed cases and assertion boundaries before any ordinary passing credit is stated. Browser collection, local DOM success and earlier Collapsible results cannot certify Accordion's portable assertions. Public consumers remain blocked until [integration.patch](integration.patch) is serialized with the parent-owned shared changes. Package publication/deployment is outside this work.

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

Pending: component-wide checks, shared integration, genuine installed public package acceptance, secured browser acceptance and final-head reviews. Record exact commands/results and commit/run provenance after execution. Preserve failed or unimplemented scope separately; complete Accordion parity remains unclaimed.
