# Collapsible landed-feature Source audit and repair plan

The audit starts from accepted Main `c1600456d3b4e72910d42823b9df69280c74a262`, after Collapsible PR29 landed. The immutable authority is Base UI v1.8.0 `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, MIT. This is a new precode audit; earlier reviews, merges and green tests do not satisfy the later Source/native-Svelte/maintainability gate.

**Source: NOT CLEAR. Native Svelte and maintainability: NOT CLEAR pending the repairs below. No runtime edit or new acceptance is recorded.**

| Actual inspected closure | Modules | Edges | Runtime / type |
| --- | ---: | ---: | ---: |
| Original public/component closure | 55 | 151 | 53 / 2 |
| Current native public/component closure | 31 | 87 | 28 / 3 |
| Original component and actual tests/helpers | 68 | 201 | 66 / 2 |
| Native component and actual tests/fixtures/package gates | 54 | 143 | 51 / 3 |
| Existing canonical helper inputs proposed for reuse | 36 | 71 | 35 / 1 |

Every reached Original and native body was freshly read in full. The prospective helper closure was also read in full; it is not falsely described as current Collapsible reuse. [audit.json](audit.json) records individual hashes, read scopes and dispositions. Graphs preserve declared versus effective type edges, actual imported members, runtime/type reachability and excluded public/test barrel siblings. [archives.json](archives.json) identifies all 68 Original bodies; each archive equals both the immutable Git object and the physical pinned checkout. External React/ReactDOM, Floating UI DOM entry points, the MUI test renderer, Svelte/esm-env and browser/test tools remain explicit boundaries. No inspection of external package internals is claimed.

## Findings

1. **CO-S01 — legacy button composition.** Trigger calls `button/props.getButtonProps` instead of the Source `useButton` composition. This loses Composite context inference, shared disabled-host ref handling and canonical diagnostics, and retains the old disabled mousedown default correction. Reuse accepted Main's real `internals/use-button/useButton.svelte.ts` and canonical renderer, with the Source options and ordered prop array. Issue66 already tracks the original mousedown quirk; restore the Source behavior through canonical reuse, without a new fix or extra ordinary credit.
2. **CO-S02 — generic React style restoration.** Panel and `animations.preserveUnchangedInlineStyles` parse entire old/new styles, inspect arbitrary properties and restore a DOM snapshot to emulate React's property diff. Remove Collapsible's caller and its snapshot/pre-effect/post-effect machinery. Native CSS string assignment and authored precedence remain canonical. This export has a second live caller in Accordion.Panel; deletion of that helper is outside this lease until the Accordion caller is separately audited and removed.
3. **CO-S03 — flattened and duplicated business dependencies.** Root embeds `useControlled` and `useTransitionStatus`; Panel embeds `useCollapsiblePanel`, `useOpenChangeComplete` and `useAnimationsFinished`. Accepted canonical control, transition, animation-completion and renderer helpers now exist on Main. Restore real source helper composition. Current Panel and Accordion.Panel also duplicate the same orchestration; the pin makes both use `collapsible/panel/useCollapsiblePanel`. The new shared Panel helper must be suitable for that real reuse, but this lease does not edit Accordion.
4. **CO-S04 — React commit snapshots and hidden coercion.** Root copies open and callback values with a pre-effect. Panel forces the hidden string after a tick even though Svelte supports it directly. Prefer native live state/callback reads and a directly rendered `hidden="until-found"` value, preserving event-detail creation, callback-before-write order and cancellation. Record actual Original/bare-Svelte/canonical-control differences before changing assertions. The state-owned beforematch subscription and the original host-replacement bug are separate business behavior and remain intact.
5. **CO-S05 — correspondence and shared mapping.** Current parts use the legacy Element call-shape adapter and handwritten attribute maps rather than the exact Source maps. Consume canonical `RenderElement` directly, port missing shared `collapsibleOpenStateMapping`, the used CSS/data constants and the two composed mappings, and use the existing shared logging/ID helpers.

## Requested runtime lease

Feature-owned changes:

- `collapsible/Root.svelte`, `Trigger.svelte`, `Panel.svelte`, `context.ts`, `types.ts`, `state.ts` and their actual exports only as necessary. Replace obsolete state mapping only after all its callers are removed.
- New `collapsible/root/useCollapsibleRoot.svelte.ts` and `collapsible/panel/useCollapsiblePanel.svelte.ts`, started from the complete pinned bodies with MIT notices. Keep the helper names, branch order, dimensions cache, one-shot motion flags, callback/cancellation and cleanup ownership recognizable.
- New used source constants and mappings under `collapsible/root`, `collapsible/panel` and `collapsible/trigger`.
- Exactly two missing shared leaf ports: `utils/collapsibleOpenStateMapping.ts` and `utils/warn.ts`. They consume existing canonical mapping/data and `createLogOnce` helpers. No generic renderer, shared button, animation or control helper mutation is proposed.
- Collapsible docs, Source correspondence, difference/evidence records and meaningful focused tests/fixtures. Historical inventories, assertion bodies, failed reports and prior acceptance remain unchanged.

Read-only reused canonical helpers include `useControlled`, `useTransitionStatus`, `useBaseUiId`, `useButton`, `useOpenChangeComplete`, `useAnimationsFinished`, `useAnimationFrame`, `useStableCallback`, `useIsoLayoutEffect`, `addEventListener`, `ownerWindow`, canonical rendering/merged refs/prop merging and logging. The full prospective closure is in [prospectiveHelpers-graph.json](prospectiveHelpers-graph.json). No pending branch body is a prerequisite.

`animations.ts` remains temporarily for its existing Accordion callers. It must leave the audited Collapsible runtime graph after shared composition is restored; preserving that unaudited sibling cannot establish whole Accordion acceptance.

## Native style-variable ownership proposal

First port the exact Source measurement and temporary-write algorithm without generic restoration. Dimensions remain the two Source CSS variables; authored styles retain canonical rightmost precedence. `resetLayoutStyles` retains its four synchronous `initial!important` writes and value-only next-frame/cleanup restoration. `setTemporaryStyle` retains previous value/priority capture, direct write and exact cleanup/removal. The beforematch duration override stays one-shot and is restored before detecting the next close mode. No all-style snapshot, arbitrary DOM reapplication, authored-property diff, MutationObserver restoration or second motion engine is permitted.

The critical native boundary is internal dimension updates changing CSS text after temporary Source writes. Execute an exact Original, bare Svelte and real candidate witness before adding an adapter. If the direct native port loses required measured motion or beforematch's zero duration, request a separate small, property-specific native ownership lease. The bounded candidate is a Panel-owned attachment for **only height and width CSS variables**: initial `auto` values support SSR, reactive native writes update those two keys on the actual host, and authored CSS-variable overrides keep Source precedence. Native authored style changes still behave like bare Svelte and may replace unrelated imperative styles. That attachment cannot snapshot or restore alignment, duration or arbitrary authored properties; no runtime version of it is authorized by this plan.

Witnesses must cover default and forwarding replacement hosts, authored style strings and objects, authored CSS-variable overrides and `!important`, unrelated authored style updates, removal/undefined style, host swap/null/replacement, cleanup of disconnected hosts, open/close interruption and actual SSR/hydration. Record native differences with zero divergent ordinary credit. If a proportionate native mechanism cannot preserve business behavior, retain that scope incomplete instead of rebuilding React's renderer.

## Business operation and lifetime mapping

- Root: fixed initial controlled mode/default via canonical control; `useTransitionStatus(open, true, true)`; generated ID plus registered-ID null sentinel; trigger reason construction → consumer callback → cancellation check → owner write. Native state/callback construction replaces React insertion/commit snapshot machinery.
- Panel: parameter/context ownership → real ref fanout → dimension/cache initialization → hidden/status derivation → force-idle reset → pending temporary cleanup → post-DOM measurement before deferred ending style → open completion → extra-frame closing completion → native hidden render → state-owned beforematch registration → shouldRender/result.
- Measurement branches retain initially open keyframe caching; none/transition/keyframe opening order; beforematch skip consumption; pre-ending close measurement; no-motion close; zero-size ending; and temporary animation-name toggling. Pending durations restore before the next close's animation-mode detection.
- Open completion rechecks current open before clearing dimensions; close completion rechecks current open and cancellation before unmount/clear. Actual shared canonical helpers own watched promises, replacement animations and batching. Reopen/teardown/ref replacement must be proved on the real host.
- Preserve original no-motion idle, null-host ending and state-owned beforematch listener behavior. Existing issues30/31/33/34 stay historical; no Source-shared bug is silently fixed. React.Activity remains six explicitly missing declarations; no fake Svelte equivalent is proposed.

## Verification and acceptance

The existing immutable inventory remains 47 ordinary declaration sites /49 variants, portable41/43, six Activity deferrals, three conformance calls and ten type assertions. This audit adds zero declaration credit. Existing 130 secured browser instances comprise86 portable paired ordinary instances and44 supplements; their actual current-head execution is not yet established here. Renderer-boundary differences must preserve Original predicates/provenance and use separate verified native expectations.

Run focused current DOM/SSR tests, native type checks, genuine isolated root/subpath tarball consumers with refs/render/attachments and negative type examples, secured paired Chromium including actual same-node SSR hydration, and applicable CI/Standards/full verification on the exact final head. Source inventories and hash equality are audit checks, not runtime passes. Final independent full-closure Source/native/maintainability review, configured review/valid scoped exception, Root PM approval and a normal expected-head merge remain separate gates.

Reproduce this precode inventory with installed TypeScript5.9.3:

```sh
COLLAPSIBLE_AUDIT_TYPESCRIPT=/path/to/typescript node parity/collapsible/source-audit/generate.mjs
```

Regeneration is audit tooling only. Do not overwrite this pre-repair checkpoint with later implementation bytes; use a successor evidence directory for the candidate closure.
