# Source-porting gate

Implementations start from original Base UI source, including internal components and shared helpers. Preserve component composition and recognizable business logic while preferring native Svelte primitives and element defaults. Source correspondence, executed test evidence and maintainability are all required; matching tested end behavior alone does not establish a faithful port.

Reference: [Base UI v1.8.0](upstream-contracts.md), immutable commit [`47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`](https://github.com/mui/base-ui/commit/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c), MIT. This gate records the user's source-first directive and subsequent native-Svelte clarification in the project conversation on 2026-10-02 PDT (2026-10-03 UTC). Input must use Field internally; inherent native element/renderer differences keep Svelte defaults rather than emulate React quirks, reflecting HTML and intended browser behavior. The clarification also makes maintainability a PM/code-review gate. These requirements apply to ongoing work immediately; earlier PM decisions and landed PRs do not grant a blanket waiver.

## Before implementation

1. Read the pinned public component, its exported parts and types, and its upstream tests. Record immutable file links and source hashes in the feature evidence.
2. Trace imports recursively through internal components, contexts, stores, utility/helper modules and external dependency entry points. Resolve package imports such as `@base-ui/utils` to their original files. Record the complete dependency graph before implementation code; distinguish runtime and type-only edges. Follow existing local dependencies back to the same source, including modules outside the planned diff.
3. Map each source module/function to a local business port or a deliberate native Svelte replacement, in dependency order. Identify actual component/business dependencies separately from framework renderer machinery. Missing business dependencies must be ported before the dependent component can be claimed complete; a reduced slice remains explicitly incomplete and blocked for the omitted scope.
4. Use the immutable source bodies as the working starting point, preserving upstream MIT attribution for copied/ported code and assertions. Port the recognizable business algorithms and composition; replace framework machinery directly with native Svelte facilities where appropriate. Keep provenance in the feature evidence; do not retain unused source copies as evidence of fidelity.

## Preserve business logic and dependency relationships

Keep business module boundaries, component/helper names and control flow comparable enough for a reviewer to follow the original and local bodies side by side. Preserve component defaults, business operation order, branches, state ownership, callback order, cancellation, registration, teardown and business quirks/bugs. Native framework differences follow the user's directive below. Preserve source-defined fallback behavior as part of the real context/helper implementation; a fallback cannot substitute for missing provided-context behavior.

Implement each shared business helper once and make its consumers use that implementation. Do the same for internal components and shared contexts/stores. Components must not independently reinvent a dependency's business algorithms. Preserve distinct component-specific business mechanisms where the source separates them; record direct native replacements of framework-only dependencies rather than copying their React bodies.

Unused copied files, upstream names attached to custom business algorithms, or cosmetic relocation of an independently written implementation do not satisfy this gate. A source-correspondence table must describe actual used code and native replacements. Apply the [existing difference policy](upstream-differences.md) to observable differences, citing the user's native directive where it applies; it does not authorize unrelated business changes.

## Native Svelte and maintainability

The user’s current native-framework directive supersedes earlier hook-parity guidance: replace React-specific machinery that has a Svelte equivalent with the native primitive and its behavior; port real business mechanisms that have no equivalent. Use classes for reusable state-owner roles previously carried by custom hooks, and keep stateless business functions as functions. Controlled state uses the small `Controlled` class with initial mode, live controlled reads, initial-default fallback and direct value setting. React controlled/default diagnostics, serializers, functional dispatch adapters and explicit effect dependency tuples are unnecessary. Use `$effect` directly; it is SSR-safe without SvelteKit. Preserve real cancellation, registration, resource invalidation and cleanup. Use `untrack` at actual imperative subscription or side-effect boundaries, never as blanket React dependency emulation. Record native expectation changes separately with zero divergent unchanged upstream parity credit.

Element parts use their own direct native branch: `{#if render}{@render render(mergedProps, state, children)}{:else}<button {...mergedProps}>{@render children?.()}</button>{/if}`, substituting the part's actual intrinsic fallback. Do not add `UseRender`, a generic tag renderer, clone/selector host discovery, React callback-ref identity/fanout, render/commit emulation, attachment interception or CSS snapshot/style custody. Pure shared prop, class/style and state-attribute business helpers remain reusable. Publish actual hosts with `$bindable`, native bindings and attachments; capture real registration inputs before untracking the imperative publication, and clean up the captured resource owner. Native snippet/element/style defaults and independent attachment lifetimes are binding under the user's directive.

Prefer Svelte runes, context, lifecycle, snippets, attachments and rendering facilities where they replace Base UI/React framework machinery. For inherent native element/renderer differences, retain Svelte's native defaults and verify actual native behavior. Do not add ReactDOM checked tracking or activation replay, synthetic-event emulation, StrictMode callback duplication or insertion-effect guards solely to reproduce machinery Svelte does not require. Component-level business contracts, including event-detail cancellation and shared validation, remain required.

A small named wrapper may serve source correspondence or shared reuse. Introduce an adapter only for a real framework boundary or contract; do not invent one to resemble the original layout. Share necessary business implementations/adapters, and use a primitive directly when wrapping it adds no value. Runtime imports remain free of React and SvelteKit; React is permitted only in reference fixtures.

PM and code review must assess readability, proportionate complexity, idiomatic native Svelte and reuse. Remove unnecessary abstraction, duplicate implementations and React lifecycle machinery. Passing tests, preserving file names or copying every hook body does not establish maintainability. Keep upstream business bugs by default; record verified native framework differences separately under this user authorization rather than treating them as silent business bug fixes.

### Input and Field.Control

Pinned [Input.tsx](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/input/Input.tsx) delegates directly to `Field.Control`. The Svelte Input must likewise remain a thin wrapper around a real port of [FieldControl.tsx](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/field/control/FieldControl.tsx), preserving forwarding, shared business state/event/type relationships and real Field integration with native Svelte facilities.

Trace Field.Control's actual dependency closure: Field/Form and labelable contexts, control registration, validation, controlled state, value-change tracking, callbacks, timeout/lifecycle, event details, state mappings and rendering, plus their dependencies. Port the business bodies and deliberately map framework dependencies to native Svelte facilities. Independent Input code, a stub Field.Control or constant Field state cannot establish this structure. The original missing-provider fallback belongs in the real context; it does not excuse missing Field integration. Retain native Svelte input defaults, reset, activation and renderer behavior within this source-derived component composition.

## Source-correspondence record

Keep this record beside the feature's source/assertion evidence in `parity/<feature>/`; link it from the feature docs and PR. Record every file/function in the complete closure, including reused business ports, type relationships, external boundaries and direct native replacements. Use immutable original links and name the exact local function/component or Svelte primitive. Add rows rather than concealing several business algorithms under a general label such as “Svelte adaptation.”

| Original file/function at the pin | Local business port or native primitive actually used                | Deliberate replacement and decision                          | Source, native behavior and maintainability check                                               |
| --------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Immutable source link and symbol  | Repository path/symbol, Svelte primitive, or explicit missing status | Exact boundary/reason and applicable user directive, or none | Business body/dependency check, actual native behavior and relevant assertion/probe identifiers |

Also record the graph, original hashes, all missing dependencies and difference decisions in the repository. Record the exact final reviewed commit externally in the PR review and CI evidence; do not require a tracked record to contain its own commit hash. This table is a requirement and a review aid; filling it out does not itself prove structural fidelity or earn assertion credit.

## Final-head acceptance

The independent reviewer must examine the exact final PR commit and the full source closure, including inherited helpers and internal components outside the diff. Review must check:

- Every source dependency is mapped to a real used business port or deliberate native Svelte replacement, or is explicitly missing with dependent scope incomplete.
- Component/helper business bodies retain comparable boundaries, names, branches, operation order, state ownership, callback/cancellation and cleanup contracts. The dependency graph preserves source reuse and composition, including Input → Field.Control.
- Native Svelte primitives and element defaults replace renderer machinery where appropriate. Each adapter has a real purpose and verified observable behavior. The source-correspondence record matches used code and deliberate primitive replacements; no dead copies or cosmetic relocation substitute for business ports.
- PM and code review confirm readability, proportionate complexity, shared implementation and absence of unnecessary abstraction/React lifecycle machinery. Test totals alone cannot satisfy source fidelity, idiomatic Svelte or maintainability.
- MIT attribution and original assertion identifiers/hashes/expectations remain intact as source evidence. Unchanged business assertion ports keep their expectations; native framework assertions use verified native expected behavior and truthfully record differences. Ordinary declarations, parameterized variants, conformance/helper calls, type assertions and supplements retain separate accounting. Divergent native assertions earn zero unchanged upstream parity credit; missing coverage stays explicit.
- The required [CI](ci.md), full repository verification, secured paired browser acceptance, SSR/hydration, type and isolated public-package consumers pass as applicable on that same final head. Configured automatic review and any explicitly recorded scoped exception retain their existing requirements; structural review is an additional independent gate.

After any source change, update correspondence and rerun relevant checks; final review must cover the resulting exact head and assess source fidelity, idiomatic native Svelte and maintainability together. Earlier source checkpoints, test-only review, green CI or PM design approval cannot establish acceptance. Report source review, native differences and executed evidence separately. Documentation checks establish policy consistency only and add no product parity credit.

## Landed-feature audit

Existing implementations require source, native-Svelte and maintainability audit with focused refactoring against this same pin. Preserve historical compatibility records and decisions; attach new source correspondence and audit evidence rather than rewriting the old register as if earlier reviews had checked this gate.

For each already landed component and its shared dependency closure:

- [ ] Inventory public parts/types and trace the complete original import graph, including inherited local helpers.
- [ ] Create the source-correspondence table for business bodies and deliberate native replacements; mark each as reviewed, needing refactor, or missing. Until inspected, record it as unaudited rather than accepted.
- [ ] Identify independently invented business algorithms, duplicated helpers, absent internal components, fallback-only integrations, undocumented framework boundaries and unnecessary React machinery/abstraction.
- [ ] Port missing business dependencies in source order and refactor custom business bodies from the pinned originals. Prefer native Svelte primitives for framework dependencies, consolidate shared implementations and remove unused duplicate copies.
- [ ] Verify inherent native element/renderer behavior against actual Svelte defaults; record differences under the user's native directive. Preserve upstream business bugs and original assertion provenance; retain other intentional differences only within their specific decisions.
- [ ] Run the applicable full execution gates and obtain PM/code review of the entire affected closure at the final head for source fidelity, idiomatic Svelte and maintainability before claiming the audited scope satisfies this gate.

Start with Input's Field.Control dependency and the shared helpers its closure exposes; apply the checklist to every other landed component as well. Passing historical tests and landing status do not complete any unchecked audit item. This document defines the repository audit/refactor process; feature evidence holds the detailed findings and execution records.
