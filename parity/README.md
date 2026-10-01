# Parity inventory

`manifest.json` traces selected upstream test declarations to immutable commit and source lines. `sources.json` lists the selected files and three exact event-detail type assertions. The TypeScript parser in `scripts/parity-inventory.mjs` recognizes named declarations across line breaks and conditional modifiers such as `it.skipIf`. Interpolated-template names are recorded once, including the two already in the initial inventory. Parameterized `.each`/`.for` expansion and shared conformance helpers are excluded. This is a scoped initial inventory, not an exhaustive catalog or expanded assertion count.

The corrected inventory contains 633 declarations/type assertions: **4 passing ports / 629 unported**, with no failing executed ports or approved deviations. The previous 569-entry inventory omitted 64 ordinary multiline declarations in the same selected upstream files.

To audit or regenerate after installing workspace dependencies, provide a local Git repository containing the pinned upstream commit:

```sh
node scripts/parity-inventory.mjs --upstream /path/to/base-ui --check
node scripts/parity-inventory.mjs --upstream /path/to/base-ui --write
```

The scanner reads immutable Git objects at the manifest commit, irrespective of the reference repository's checked-out branch. Check mode fails on a difference. Write mode preserves existing statuses, port paths, and verification metadata, marks new declarations unported, and rejects silently discarded existing cases. `verify.sh` runs focused scanner regression tests; the real pinned-source audit is an explicit command so ordinary verification does not require an upstream clone.

Status vocabulary: `passing`, `failing`, `unported`, `approved-deviation`, `ported-pending-verification`. Approved deviations require a specific maintainer decision recorded with rationale; the list currently has no approved deviations. Locally authored regression tests are separate evidence and do not count as upstream ports.

Four initial ports retain upstream bodies/assertions: three event-detail type assertions and one reused-getter regression. The native-event/class adaptations are proposals under review. All Dialog, Drawer, and Toast scenarios are unported. No skipped parity suite hides them behind a green test result.

For each future port, include source file, exact suite/test identifier, source line, adapter differences, Svelte test path, run result, and any assertion change requiring approval. Browser focus/geometry/animation tests must run in a browser. Mounting adapters may differ; observable assertions must preserve upstream meaning.
