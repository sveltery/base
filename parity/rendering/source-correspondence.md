# Shared rendering foundation source closure

This refactor starts from Base UI v1.8.0 immutable pin `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, MIT, before implementation. [source-graph.json](source-graph.json) records recursively resolved runtime and type edges and original SHA-256 hashes. This focused dependency PR contains no public UseRender API/export scope. Existing component assertions are independent evidence. No structural acceptance or ordinary assertion credit is claimed by this mapping.

Dependency order: canonical `empty`, `useRefWithInit`, `createLogOnce` from the shared utility owner; `mergeObjects`, class/style adapters and `getStateAttributesProps`; source-bodied `mergeProps`/`mergePropsN`; source-bodied `useMergedRefs`/`useMergedRefsN`; `useRenderElement`; native markup boundary; legacy `dialog/Element` adapter; public UseRender and real Field.Control are dependent feature consumers.

| Original module/functions at the immutable pin | Used local destination | Necessary adaptation | Source/observable check |
| --- | --- | --- | --- |
| [react/src/internals/useRenderElement.tsx](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/internals/useRenderElement.tsx): `useRenderElement`, `useRenderElementProps`, `resolveRenderFunctionProps` | `internals/useRenderElement.ts` | A setup-time instance owns merged-ref storage; output is a native render descriptor consumed by `internals/RenderElement.svelte`. | Side-by-side ordered stages, getter ownership/frozen failures, native refs/defaults. |
| Same: `evaluateRenderProp`, `renderTag` | Same functions in `internals/useRenderElement.ts` plus `internals/RenderElement.svelte` | Native tag/snippet descriptor is the sole framework rendering boundary; default button/image props retain source order. | Default tags, invalid render guard, snippet props/state, actual host identity. |
| Same: `unwrapLazyRenderProp`, `warnIfRenderPropLooksLikeComponent`, React lazy/component patterns | Explicit unavailable React-only scope; no unused runtime copies | Snippets are opaque and cannot clone/unwrap React Flight elements or diagnose React hook ownership. | Twelve lazy/Flight/RSC/diagnostic sites/fifteen variants remain unimplemented; no parity claim. |
| [react/src/internals/getStateAttributesProps.ts](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/internals/getStateAttributesProps.ts): mapping type, `getStateAttributesProps` | `internals/getStateAttributesProps.ts` | None: source `for...in`, direct mapping `hasOwnProperty`, null/falsy/lowercase rules. | Native state attribute probes, mapping error behavior. |
| [react/src/utils/resolveClassName.ts](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/utils/resolveClassName.ts): `resolveClassName` | `utils/resolveClassName.ts` | Native ClassValue normalization happens separately at native merge/markup boundary. | State callback order and class string order. |
| [react/src/utils/resolveStyle.ts](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/utils/resolveStyle.ts): `resolveStyle` | `utils/resolveStyle.ts` | Native CSS string/object type replaces React CSSProperties, same function/callback branch. | Style callback order and cascade. |
| [utils/src/mergeObjects.ts](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/utils/src/mergeObjects.ts): `mergeObjects` | `utils/mergeObjects.ts` | None; one-sided object identity retained. | Frozen/style/ref accessor probes. |
| [react/src/merge-props/mergeProps.ts](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/merge-props/mergeProps.ts): `mergeProps`, `mergePropsN`, `createInitialMergedProps`, `copyInitialProps`, `mergeInto`, `mutablyMergeInto`, `isPropsGetter`, `resolvePropsGetter`, event/class functions | `merge-props/mergeProps.ts`; `index.ts` reexports | Lowercase native event keys and native Event brand replace React synthetic event representation. Native `class`/CSS strings and enumerable attachment symbols are isolated extensions. | Shared slot-zero/EMPTY_PROPS/for-in/getter ownership and ordered handlers/class/style tests. |
| [utils/src/useMergedRefs.ts](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/utils/src/useMergedRefs.ts): `useMergedRefs`, `useMergedRefsN`, `createForkRef`, `didChange`, `didChangeN`, `update` | `utils/useMergedRefs.ts` | Setup factory owns one source `useRefWithInit` value. Native attachments call the source callback; source cleanup remains in `update`. | Fixed/N memo identity, ref order/cleanup and actual host teardown. |
| [utils/src/useRefWithInit.ts](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/utils/src/useRefWithInit.ts): `useRefWithInit` | `utils/useRefWithInit.ts` (shared utility PR46 final `b3bdfb266b1a6e51eb77459d66f6c727eddfddac`) | One call in native setup factory instead of React hook rerenders. | Initializer ownership and instance isolation. |
| [utils/src/empty.ts](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/utils/src/empty.ts): `NOOP`, `EMPTY_ARRAY`, `EMPTY_OBJECT` | `utils/empty.ts` (same shared utility checkpoint) | None. | Frozen singleton and disabled-stage behavior. |
| [utils/src/warn.ts](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/utils/src/warn.ts), `createLogOnce.ts`: `warn`, `createLogOnce`, `reset` | React-specific renderer diagnostic boundary; shared `utils/createLogOnce.ts` belongs to the Field utility closure | React function/component hook diagnostic has no native snippet equivalent; no unused copied warning dependency. | Explicit unavailable scope; no dead copied diagnostics. |
| [utils/src/getReactElementRef.ts](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/utils/src/getReactElementRef.ts), `reactVersion.ts`: `getReactElementRef`, `isReactVersionAtLeast` | Explicit React element boundary; no runtime copies | Native snippets own refs via attachments; direct absent second slot preserves the tested fixed/N comparator identity without a constant helper or metadata access. | Supplied + snippet-owned actual host refs and source positional/length semantics. |
| [react/src/internals/types.ts](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/internals/types.ts), [react/src/types/index.ts](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/types/index.ts): `HTMLProps`, `ComponentRenderFn`, `BaseUIEvent`, `WithBaseUIEvent`, component types | `internals/types.ts`, `internals/useRenderElement.ts`, shared `merge-props/mergeProps.ts` | Native event/element/snippet types; unrelated exports are outside render scope and remain inventoried type edges. | Public/internal type check and isolated consumer. |
| Type-only transitive event details/reasons exports | Existing `internals/createBaseUIEventDetails.ts`, `reasons.ts`, `reason-parts.ts` | Existing source ports; not renderer runtime imports. | Graph retains type-only reachability; inherited review remains required. |

## Native adapter and legacy consumers

The attachment adapter publishes the actual host and invokes the shared source merged-ref callback. Native Svelte attachments own attach/detach timing. The React-style pre-update release kernel and forced empty-class DOM setter are removed under the user's updated native-default/maintainability direction. Host removals clean up after removal; same-host ref replacements clean up after native attribute updates. Cleanup code can therefore restore prior attributes over a just-authored class. Source callback/object fanout and callback cleanup semantics remain one shared algorithm; no fabricated DOM, reconnects, private Svelte internals, value tracking, click replay, reset forcing or custom commit timing are used. Historical PM decisions remain versioned history and do not establish acceptance of this source gate.

The native markup adapter renders a literal `<input>` for a default input tag so Svelte owns input spread, defaults and hydration. It also represents native snippet/default children. Svelte omits an empty class on the client while its SSR output retains `class=""`; an actual SSR→hydration probe verifies native normalization without an attribute-fixing attachment. These supplemental differences earn zero unchanged credit.

Legacy `dialog/Element.svelte` callers already supply their own attributes and therefore temporarily suppress generic auto attributes with an explicitly labeled mapping adapter. This is an intermediate convergence step only. Those consumers still require their own pinned mapping/dependency audit and are not structurally cleared by the common renderer change. The fresh Field.Control port uses its real `fieldValidityMapping` and ordered source parameters directly.

Shared utility dependency is PR46 final `b3bdfb266b1a6e51eb77459d66f6c727eddfddac`; the foundation branch is based directly on that exact commit and does not recreate those utilities. Canonical body implementation is now used; local full verification and standards pass. Independent final-head source/native/maintainability review, secured browser CI and PM approval remain pending in [PR #47](https://github.com/sveltery/base/pull/47).


### Temporary legacy suppression ledger

Each caller below still supplies its own state attributes and requires a separate component source/mapping audit. Input is listed only in this branch until the Field owner replaces it with the thin wrapper and real Field.Control. The new Field components must not use this legacy adapter.

- `packages/base/src/lib/accordion/Header.svelte`
- `packages/base/src/lib/accordion/Item.svelte`
- `packages/base/src/lib/accordion/Panel.svelte`
- `packages/base/src/lib/accordion/Root.svelte`
- `packages/base/src/lib/accordion/Trigger.svelte`
- `packages/base/src/lib/avatar/Fallback.svelte`
- `packages/base/src/lib/avatar/Image.svelte`
- `packages/base/src/lib/avatar/Root.svelte`
- `packages/base/src/lib/button/Button.svelte`
- `packages/base/src/lib/collapsible/Panel.svelte`
- `packages/base/src/lib/collapsible/Root.svelte`
- `packages/base/src/lib/collapsible/Trigger.svelte`
- `packages/base/src/lib/dialog/Backdrop.svelte`
- `packages/base/src/lib/dialog/Close.svelte`
- `packages/base/src/lib/dialog/Description.svelte`
- `packages/base/src/lib/dialog/Popup.svelte`
- `packages/base/src/lib/dialog/Portal.svelte`
- `packages/base/src/lib/dialog/Title.svelte`
- `packages/base/src/lib/dialog/Trigger.svelte`
- `packages/base/src/lib/input/Input.svelte`
- `packages/base/src/lib/meter/Indicator.svelte`
- `packages/base/src/lib/meter/Label.svelte`
- `packages/base/src/lib/meter/Root.svelte`
- `packages/base/src/lib/meter/Track.svelte`
- `packages/base/src/lib/meter/Value.svelte`
- `packages/base/src/lib/progress/Indicator.svelte`
- `packages/base/src/lib/progress/Label.svelte`
- `packages/base/src/lib/progress/Root.svelte`
- `packages/base/src/lib/progress/Track.svelte`
- `packages/base/src/lib/progress/Value.svelte`
- `packages/base/src/lib/separator/Separator.svelte`
- `packages/base/src/lib/toast/Action.svelte`
- `packages/base/src/lib/toast/Close.svelte`
- `packages/base/src/lib/toast/Content.svelte`
- `packages/base/src/lib/toast/Description.svelte`
- `packages/base/src/lib/toast/Root.svelte`
- `packages/base/src/lib/toast/Title.svelte`
- `packages/base/src/lib/toast/Viewport.svelte`
- `packages/base/src/lib/toggle/Toggle.svelte`
