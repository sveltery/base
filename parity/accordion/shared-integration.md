# Serialized Accordion integration handoff

Feature-local files implement the five Accordion parts, dedicated tests/fixtures/reference routes, package checks and docs/parity evidence. The parent authorized applying shared integration on this feature branch after Avatar stable checkpoint `cc2c3e217d6d4d9411a9388f53f9814551328982` was imported at `d695b41fed18013ca2827388af2b469ae5b7721b`. [integration.patch](integration.patch) now records the APPLIED additive changes against that imported checkpoint. Existing Meter and Avatar source, evidence, exports and jobs are preserved. Review the combined result for [draft PR #35](https://github.com/sveltery/base/pull/35). Earlier unapplied patches targeted original main `39e0a4dc6e46b4696837adae691083f18b6e96bd` and Meter main `d889e75bedfee9174c3b36d16fe8a9fb2d2a66d3`.

This is an integrated source checkpoint, not merge eligibility. Avatar has not yet landed; Accordion merge must follow Avatar landing and fresh combined-head CI and review. No other component's private source or parity records were edited.

The patch adds fourteen shared-file changes plus four feature fixture import restorations:

- Root `Accordion` namespace object and all fifteen named value/props/state/event types; subpath metadata for the feature's namespace, five named parts and types. Root runtime aliases are not invented.
- MIT package attribution, root README/component links, central compatibility and catalog records. Accordion becomes bounded, not fully compatible. Against the new baseline, catalog totals are 12 bounded / 30 unimplemented, including Meter and Avatar.
- Accordion documentation navigation in the Components group, preserving the overview as the default page; a renderer for the generated [api.json](api.json) and shared script-test registration for [docs-api.mjs](docs-api.mjs). API validation proves documentation consistency only.
- The genuine installed public Accordion tarball SSR/type gate in `scripts/check-package.sh`, which is already called by local verification and CI Verification. Existing packed dependencies and frozen lock stay intact; no dependency changes are required for Accordion.
- A focused secured Chromium job follows the existing jobs, with exact-head checkout, frozen install and actual library build. Existing Avatar/Meter/Collapsible jobs and the combined job’s 20-minute timeout stay intact; the combined job still runs the full suite.

The patch deliberately leaves `parity/manifest.json` and shared ordinary totals unchanged: the feature has a separate immutable inventory and candidate execution ledger, not passing ordinary credit. Parameterized/conformance/type/supplemental evidence stays separate. A feature-specific provenance script is independently owned by the evidence worker and is picked up by the existing script glob.

The rebased patch applied cleanly on `d695b41fed18013ca2827388af2b469ae5b7721b`. Reverse applicability verifies the recorded applied diff; its exact scope is eighteen targets. Focused API/docs checks pass. Shared scope checks preserve the entire prior CI prefix including Avatar and its secured job, all non-Accordion catalog rows, existing package metadata/exports, package gates, source index prefix and the overview default route. The recorded patch can be reapplied to its imported checkpoint; do not reapply it to this already integrated tree.

Earlier internal packed checks and the isolated detached public package witness at `eb96794339f44b627884190924d79e4a27dd3f34` remain historical. They do not certify this integrated source checkpoint. Fresh full verification, genuine public consumers, secured focused and combined browser runs and exact-final-commit review remain required. This source integration is not acceptance or authorization to publish.
