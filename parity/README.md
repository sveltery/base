# Parity inventory

`manifest.json` traces selected upstream test declarations to immutable commit and source lines. It is a scoped initial inventory, not an exhaustive catalog or all parameterized/shared assertions. Expand nested suites, dynamic declarations, and shared conformance helpers during each component test port.

Status vocabulary: `passing`, `failing`, `unported`, `approved-deviation`, `ported-pending-verification`. Approved deviations require a specific maintainer decision recorded with rationale; the list currently has no approved deviations. Locally authored regression tests are separate evidence and do not count as upstream ports.

Four initial ports retain upstream bodies/assertions: three event-detail type assertions and one reused-getter regression. The native-event/class adaptations are proposals under review. All Dialog, Drawer, and Toast scenarios are unported. No skipped parity suite hides them behind a green test result.

For each future port, include source file, exact suite/test identifier, source line, adapter differences, Svelte test path, run result, and any assertion change requiring approval. Browser focus/geometry/animation tests must run in a browser. Mounting adapters may differ; observable assertions must preserve upstream meaning.
