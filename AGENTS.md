# Repository guidance

Read [CONTRIBUTING.md](CONTRIBUTING.md), the [source-porting gate](docs/source-porting.md), the pinned source contracts and the [upstream differences](docs/upstream-differences.md) before porting or reviewing changes. Inspect current main and any relevant repository skills before editing. Keep changes focused and preserve upstream attribution.

## Source structure gate

Start implementations from the original Base UI source at immutable v1.8.0 commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. Before code, trace the component's complete import/dependency graph, including internal components and shared helpers. Copy the pinned source with MIT attribution, then mechanically port its bodies: preserve comparable module boundaries, names, operation order, branches, state ownership, cancellation and quirks. Port missing dependencies before claiming the component complete. Source and tests are both binding; matching end behavior alone is insufficient.

Use one shared port for each shared upstream helper. Input must remain a thin wrapper around a real ported Field.Control; independent Input behavior, stubs or constant Field state cannot replace its dependencies. Use native Svelte state, lifecycle and rendering facilities through small, explicit shared framework adapters where necessary, preserving observable contracts. Dead copied files and moving custom algorithms into upstream-named files do not satisfy structural fidelity. Runtime code remains React- and SvelteKit-free.

Record original file/function → local port, each necessary adaptation and its review check in the feature's source-correspondence table. Independent review of the exact final PR head must examine the full source closure, including inherited dependencies, as well as required execution gates. Earlier PM decisions and approved native APIs do not waive this user requirement. Apply the [landed-feature audit checklist](docs/source-porting.md#landed-feature-audit) to existing implementations; merge history and green tests do not establish structural acceptance.

## Upstream porting policy

The pinned upstream is the behavior reference. Reproduce questioned behavior against that exact pin before changing the port. Preserve upstream behavior first, including suspected bugs. Track verified bugs shared with upstream in this repository's GitHub issues for later work; link the reproducer and source pin. Do not silently fix them while porting.

Keep three categories separate: fidelity repairs restore the pinned behavior; intentional differences change it, including local bug fixes; unimplemented scope remains incomplete and blocked. Neither merging a PR nor passing an assertion with a different expected result establishes approval or parity.

For every intentional difference, record the source and immutable pin, observable upstream and local behavior, rationale, test/run evidence, landed PR (or proposed PR until landing), and truthful decision status in the compatibility register. Record framework/API substitutions as well as behavioral fixes. Keep landed status separate from a specific acceptance decision; cite a recorded decision or state that one is not recorded. Divergent assertions earn no parity credit. Preserve MIT notices and assertion provenance, and retain explicit incomplete-parity limits.

Update the compatibility register and affected feature documentation together. Run the documented checks appropriate to the change and verify CI and independent review against the final head. Documentation validation establishes documentation consistency only, not new product parity.
