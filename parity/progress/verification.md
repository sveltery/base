# Progress implementation gates

Reference: Base UI v1.8.0 `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`.
Starting main: `5e6492007b187bc9f7f5296b79917c1715c4b141`.
Proposed implementation: [PR #28](https://github.com/sveltery/base/pull/28), opened as draft before implementation, then marked ready to trigger the configured automatic review. Ready status does not establish merge eligibility.

Component-local checkpoint `08fdf666ba19266a36a5905581dff7b356cc674c` passed full local `bash scripts/verify.sh`: 32 script regressions, 152 runtime/SSR tests, 318 DOM tests, library/fixture builds, types, runtime boundary and existing public packaged consumers. Separate `bash scripts/check-progress-package.sh` passed the isolated Progress internal entry SSR/types check. Standards lint/formatting passed locally. Immutable inventory/provenance and serialized patch applicability passed. These checks are source/checkpoint evidence; final-head clearance remains separate.

Hosted [run 36992974145](https://github.com/sveltery/base/actions/runs/36992974145) ran the exact checkpoint: Verification passed; Standards rejected whitespace in blank context lines of the serialized patch; secured browser finished with 731 passing / 2 failing executions (210/212 Progress executions passed). Failures were the SSR comment-node parser and an exact-message assertion that rejected Svelte's appended development component stack. The latter now uses a substring assertion, matching the pinned `toThrow(string)` vector, without changing the component's descriptive error. The patch formatting was repaired without changing its resulting shared-file edits. An independent review found the SSR label regex assumed no Svelte comment nodes; the assertion now parses the SSR HTML structurally. Direct paired callback argument probes and an older-label/nested-context regression were added, making 16 focused DOM tests. The refreshed full local verification passed with 32 script regressions, 152 runtime/SSR tests and 319 DOM tests; type/build/runtime/package gates passed. Fresh hosted exact-head checks and reviews are required for the repaired browser assertions.

The configured automatic review of the same checkpoint [completed](https://github.com/sveltery/base/pull/28#issuecomment-5949831806) and requested that this verification record replace its initial pending-only text with commands, results and tested heads. This record now distinguishes executed checkpoint evidence from outstanding final-head and public-integration gates; the repaired head still requires a fresh automatic review.

An isolated detached integration preview applied the exact shared patch and passed `bash scripts/check-progress-package.sh --public` (root/subpath identity, all five part identities, SSR and consumer types). The unintegrated component branch correctly fails that public mode with `ERR_PACKAGE_PATH_NOT_EXPORTED`; the internal mode passes. Preview success is bounded patch evidence, not final public API clearance.

The independent source review verified the actual pin, 20 ordinary vectors, seven separate parameterized variants, all 15 conformance helper mappings, source hashes, SSR omission and patch applicability. No component implementation mismatch remained after the context presence and lazy-SSR assertion fixes. The parser repair and subsequent final head must be reviewed again.

Local browser installation from the official CDN was denied by its network endpoint. The existing system Chromium also failed before interaction because its SUID sandbox helper is not configured for secured startup. No security policy, sandbox flags or environment access was changed. Hosted CI retains `chromiumSandbox: true`; no local interaction or browser parity is claimed from those startup attempts.

## Outstanding integrated-head gates

- Apply/reconcile [shared-integration.patch](shared-integration.patch) through the parent/Input owner, preserving unrelated work.
- Run `bash scripts/check-progress-package.sh --public` on the complete integrated head. Internal imports and any isolated integration preview are separate evidence.
- Pass full local checks, hosted Standards/Verification and all paired secured Chromium assertions, including real SSR/hydration and computed styles, on the final head.
- Obtain independent exact-head review and configured automatic review completion; resolve any findings and rerun affected checks after changes.
- Report the exact final merge-eligible SHA before any merge. This component-local branch is not merge-eligible while public integration remains pending.

Source traces remain immutable/unported; the separate port ledger preserves pending status until recorded secured execution. Helpers, parameterized variants, packages and supplemental cases add no ordinary declaration credit. No release, deployment, access change or external review mention is part of this work.
