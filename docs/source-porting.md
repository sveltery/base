# Source-porting gate

Implementations start from original Base UI source, including internal components and shared helpers. Source structure and upstream assertions are both binding. Matching tested end behavior alone does not establish a faithful port.

Reference: [Base UI v1.8.0](upstream-contracts.md), immutable commit [`47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`](https://github.com/mui/base-ui/commit/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c), MIT. This gate records the user's source-first directive in the project conversation on 2026-10-02 PDT (2026-10-03 UTC), including the explicit requirement that Input use Field internally. It applies to ongoing work immediately. Earlier PM implementation decisions, accepted native API substitutions and landed PRs do not grant a blanket waiver.

## Before implementation

1. Read the pinned public component, its exported parts and types, and its upstream tests. Record immutable file links and source hashes in the feature evidence.
2. Trace imports recursively through internal components, contexts, stores, utility/helper modules and external dependency entry points. Resolve package imports such as `@base-ui/utils` to their original files. Record the complete dependency graph before implementation code; distinguish runtime and type-only edges. Follow existing local dependencies back to the same source, including modules outside the planned diff.
3. Assign every source module/function a local destination and dependency order. Identify the small framework boundaries that require adaptation. Missing upstream dependencies must be ported before the dependent component can be claimed complete; a reduced slice remains explicitly incomplete and blocked for the omitted scope.
4. Copy the immutable source with upstream MIT notices as the working starting point, then mechanically port its bodies. Preserve attribution for code and assertions. Keep provenance in the feature evidence; do not leave unused copies in runtime source as evidence of fidelity.

## Port the source bodies and dependency relationships

Keep module boundaries, component/helper names and control flow comparable enough for a reviewer to follow the original and local bodies side by side. Preserve defaults, operation order, branches, state ownership, callback order, cancellation, registration, teardown and upstream quirks. Preserve source-defined fallback behavior as part of the real context/helper port. A fallback cannot substitute for missing provided-context behavior.

Port a shared upstream helper once and make its consumers use that implementation. Do the same for internal components and shared contexts/stores. Components must not independently reinvent a dependency's algorithms. A component-specific helper remains separate where the original source makes it separate; do not merge distinct upstream mechanisms merely because their outputs look similar.

Use Svelte runes, context, lifecycle, snippets, attachments and rendering facilities where necessary. Isolate unavoidable React-to-Svelte ownership/render/event boundaries in small explicit framework adapters, shared where the original dependency is shared. Keep the original algorithm in the ported body and document exactly what the adapter changes and how its observable contract is checked. Runtime imports must remain free of React and SvelteKit; React is permitted only in reference fixtures. Native Svelte facilities are implementation tools, not authorization to replace source algorithms with independent designs.

Unused copied files, upstream names attached to custom algorithms, or moving an independently written implementation into a new helper file do not satisfy this gate. A source-correspondence table must describe actual used code. Necessary adaptations do not imply approval of behavioral differences; apply the [existing difference policy](upstream-differences.md) to each observable difference.

### Input and Field.Control

Pinned [Input.tsx](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/input/Input.tsx) delegates directly to `Field.Control`. The Svelte Input must likewise remain a thin wrapper around a real port of [FieldControl.tsx](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/field/control/FieldControl.tsx), preserving forwarding and shared state/event/type relationships through necessary Svelte adapters.

Trace and port Field.Control's actual dependency closure: Field/Form and labelable contexts, control registration, validation, controlled state, value-change tracking, stable callbacks, timeout/lifecycle, event details, state mappings and rendering, plus their dependencies. Independent Input code, a stub Field.Control, or constant Field state cannot establish this structure. The original missing-provider fallback belongs in the ported context; it does not excuse missing real Field integration. Accepted native input defaults, reset or scheduling decisions retain their recorded bounded scope and must be implemented within this source-derived structure.

## Source-correspondence record

Keep this record beside the feature's source/assertion evidence in `parity/<feature>/`; link it from the feature docs and PR. Record every file/function in the complete closure, including reused local ports, type relationships and external dependency boundaries. Use immutable original links and name the exact local function/component. Add rows rather than concealing several algorithms under a general label such as “Svelte adaptation.”

| Original file/function at the pin | Local file/function actually used                      | Specific necessary adaptation                | Structural and observable review check                                      |
| --------------------------------- | ------------------------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------- |
| Immutable source link and symbol  | Repository path and symbol, or explicit missing status | Exact framework boundary and reason, or none | Side-by-side body/dependency check and relevant assertion/probe identifiers |

Also record the graph, original hashes, all missing dependencies and difference decisions in the repository. Record the exact final reviewed commit externally in the PR review and CI evidence; do not require a tracked record to contain its own commit hash. This table is a requirement and a review aid; filling it out does not itself prove structural fidelity or earn assertion credit.

## Final-head acceptance

The independent reviewer must examine the exact final PR commit and the full source closure, including inherited helpers and internal components outside the diff. Review must check:

- Every source dependency is mapped to a real used port or is explicitly missing with the dependent scope incomplete.
- Component/helper bodies retain comparable boundaries, names, branches, operation order, state ownership, callback/cancellation and cleanup mechanisms. The local dependency graph preserves upstream reuse and composition, including Input → Field.Control.
- Each framework adapter is necessary, bounded, shared where appropriate and checked for observable behavior. The source-correspondence record matches code; no dead copies or cosmetic relocation substitute for ported bodies.
- MIT attribution, immutable assertion identifiers/hashes and unchanged expectations remain intact. Ordinary declarations, parameterized variants, conformance/helper calls, type assertions and supplemental regressions retain their separate accounting. Divergent assertions earn zero parity credit; missing coverage stays explicit.
- The required [CI](ci.md), full repository verification, secured paired browser acceptance, SSR/hydration, type and isolated public-package consumers pass as applicable on that same final head. Configured automatic review and any explicitly recorded scoped exception retain their existing requirements; structural review is an additional independent gate.

After any source change, update correspondence and rerun relevant checks; final review must cover the resulting exact head. Earlier source checkpoints, test-only review, green CI, native API acceptance or PM design approval cannot establish structural acceptance. Report source review and executed evidence separately. Documentation checks establish policy consistency only and add no product parity credit.

## Landed-feature audit

Existing implementations require structural audit and focused refactoring against this same pin. Preserve historical compatibility records and decisions; attach new source correspondence and audit evidence rather than rewriting the old register as if earlier reviews had checked this gate.

For each already landed component and its shared dependency closure:

- [ ] Inventory public parts/types and trace the complete original import graph, including inherited local helpers.
- [ ] Create the source-correspondence table and mark each body as structurally reviewed, needing refactor, or missing. Until inspected, record it as unaudited rather than accepted.
- [ ] Identify independently invented component/helper algorithms, duplicated shared helpers, absent internal components, fallback-only integrations and undocumented framework boundaries.
- [ ] Port missing dependencies in source order and refactor custom bodies from the pinned originals. Consolidate consumers onto the one shared port; remove unused duplicate copies as part of the focused refactor.
- [ ] Preserve recorded intentional differences only within their exact decisions, and expose any new observable difference under the existing policy. Keep upstream quirks and test provenance intact.
- [ ] Run the applicable full execution gates and obtain independent review of the entire affected closure at the final head before claiming the audited scope satisfies this gate.

Start with Input's Field.Control dependency and the shared helpers its closure exposes; apply the checklist to every other landed component as well. Passing historical tests and landing status do not complete any unchecked audit item. This document defines the repository audit/refactor process; feature evidence holds the detailed findings and execution records.
