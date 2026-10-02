# Meter implementation gates

Reference: Base UI v1.8.0 `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`.
Starting main: `4412d40c73dfc108e959841824d7ff3ff2f27f54`.
Proposed implementation: [draft PR #32](https://github.com/sveltery/base/pull/32). Draft status does not establish merge eligibility.

The initial runtime checkpoint `c9367f4afeac6f4de2f5ae1726c21bb7e8de8dc2` was pushed and the draft PR opened. The implementation owner reported a successful package build and type check with zero diagnostics. This is bounded runtime checkpoint evidence; it does not certify later tests, shared integration, public consumers, browsers or final-head review.

The integrated candidate working tree based on that runtime checkpoint subsequently passed 19 Meter SSR tests, 14 Meter DOM tests, all 171 runtime/SSR tests and all 333 DOM tests. Both workspace type checks reported zero diagnostics. The internal Meter tarball consumer and standards checks also passed, as reported by the implementation owner. These are working-tree results containing the new test/fixture candidates, not a committed final-head certificate; the public mode and secured browser gates remain pending.

The provenance owner executed `node parity/meter/inventory.mjs /workspace/base-ui-upstream --check` and `git apply --check parity/meter/shared-integration.patch` successfully against the current unchanged shared checkpoint. The snapshot contains 48 exact source files. The initial focused provenance-test attempt stopped at its required browser-file existence check while that file was still being authored. After the browser suite was added, `node --test scripts/tests/meter-provenance.test.mjs` passed its one provenance regression. This establishes snapshot and mapping consistency only.

The byte-exact source inventory has been generated from the actual pinned Git object. Snapshot/hash/count validation is documentation/provenance evidence only. The port ledger starts with 22 ordinary candidates, four separately counted parameterized executions and 15 separate conformance helper declarations, all pending runtime verification. Track has no ordinary declaration but requires full conformance.

The local secured Chromium probe stopped before page creation because `/usr/lib/chromium/chrome-sandbox` lacked the required installation permissions. No sandbox flag, access rule or system permission was changed. Browser runtime parity remains pending hosted execution with the existing secured CI configuration. An implementation-owner report of a clean runtime source review and 49,152 passing arithmetic/formatting comparisons against helpers compiled from the exact pin is supplemental evidence, with zero ordinary declaration credit; it does not replace final exact-head review.

## Outstanding gates

- Coordinate the exact [shared integration proposal](shared-integration.md) through the parent and current shared-file owner. No Input PR #26 or UI #19 decision is included.
- Run full `bash scripts/verify.sh` and `bash .github/standards/check.sh` on the complete integrated head, including the dedicated Meter runtime/SSR/DOM/type tests and builds.
- Run `bash scripts/check-meter-package.sh --public` on that head to verify root/subpath identities, all five parts, SSR, packaged notices and consumer types. Default internal mode and isolated integration previews are bounded evidence only.
- Pass paired React/Svelte tests in real Chromium with `chromiumSandbox: true`, including complete source vectors, all five-part conformance, computed-style assertions, actual SSR/hydration, replacement hosts and raw callback arguments.
- Record exact tested commits and hosted run links before changing ledger status. Parameterized/helper/supplemental executions add no ordinary declaration credit.
- Complete independent exact-head review and configured automatic review, resolve findings, then rerun affected checks after changes. No manual external agent mention is part of this workflow.
- Report exact final merge eligibility before any merge. Verify post-merge CI afterward. No release, deployment, access change or live-data action is authorized.

Final-head checks, browser execution, reviews and public integration remain pending. No runtime passing credit or merge eligibility is claimed in this record.
