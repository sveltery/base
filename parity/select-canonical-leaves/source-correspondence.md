# Before-code correspondence and bounded scope

All Original paths below are at immutable MIT Base UI 1.8.0
[`47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`](https://github.com/mui/base-ui/tree/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c).
The individual module SHA-256 and whole-read scope are in
[the receipt](precode-read-receipt.json). Original paths beginning `react/` mean
`packages/react/src/`; `utils/` means `packages/utils/src/`. Native paths below
are under `packages/base/src/lib/`. New bodies are planned here before code;
existing bodies are read at actual Main `c1600456d3b4e72910d42823b9df69280c74a262`.
This is not final Source closure approval or Select completion.

| Original body / caller and used dependency | Native body actually reused or planned | Business, lifetime and review boundary |
| --- | --- | --- |
| `react/internals/itemEquality.ts: defaultItemEquality` | New `internals/itemEquality.ts: defaultItemEquality` | Stable exported function identity, `Object.is`; matcher must compare that same identity. |
| `compareItemEquality` → comparer | Same new function | Nullish branch uses `Object.is`, never calls consumer comparer. No state/lifecycle. |
| `isSelectedValueDirty` → `utils/areArraysEqual.ts: areArraysEqual` | Same new function → existing `utils/areArraysEqual.ts: areArraysEqual` | Arrays compare ordered entries through nullish-aware comparer. Scalars use literal `!==`, including NaN and signed-zero behavior; never invent scalar custom comparison. Reused helper preserves identity/length/first mismatch and sparse indexed reads. |
| `selectedValueIncludes` → `compareItemEquality` | Same new function | Missing array false; `.some` skips holes; explicit undefined selections do not match. |
| `findItemIndex` → `compareItemEquality` | Same new function | Missing registry -1; `.findIndex` visits holes as undefined, skipped explicitly. |
| private `createSelectionMatcher` → `selectedValueIncludes`, default comparer identity | Same private function | Custom comparer scan; default Set deletes undefined and explicitly rechecks signed zero. No cache or independent registry. |
| `findSelectionIndex` → matcher / `findItemIndex` | Same new function | Only multiple plus actual array enters multiple branch. Rendered order wins; array-as-scalar remains valid; -1 converts to null. |
| `resolveSelectedIndex` → includes / `findSelectionIndex` | Same new function | Registering earlier selected item takes anchor; later item keeps selected earlier holder; holder re-elects on deselection. Registry/current index supplied by future real consumer, no new owner. |
| `removeItem` → comparison | Same new function | Filter removes all matching selections; nullish comparer bypass and sparse-array native filter remain literal. |
| `react/internals/resolveValueLabel.tsx: ItemRecord, ItemsInput, LabeledItem, Group` | New `internals/resolveValueLabel.ts` types; `ValueLabel` | ReactNode becomes scalar or authored Svelte Snippet. No React runtime. Groups preserve open metadata and readonly items. Source broad `any` values remain deliberate internal generic contracts. |
| private `isGroup`; `isGroupedItems` | Same new functions | Actual array `items` on first element only; optional/unrelated metadata is not a group. Preserve empty/mixed-first behavior. |
| `flattenLeafItems` → grouping | Same new function | Flat identity preserved, grouped `.flatMap` order retained. |
| `hasNullItemLabel` → grouping | Same new function | Record uses inherited-aware `'null' in items`, independently of nullish label; flat/grouped arrays require nullish value and non-nullish label. |
| `stringifyAsLabel` → `react/internals/serializeValue.ts: serializeValue` | Same new function → existing `internals/serializeValue.ts` | Custom callback only for non-nullish value, callback nullish result becomes empty string. Object label then value uses String conversion; remaining values use shared serializer. Preserve JSON/string/nullish serializer behavior. |
| `stringifyAsValue` → `serializeValue` | Same new function → same canonical serializer | Custom callback/nullish branch retained; only object with both value and label unwraps value. |
| `resolveSelectedLabel` → grouping / label fallback | Same new function | Non-nullish custom callback first, direct return not coalesced; explicit object label next; own-key record lookup; primitive item search intentionally unguarded; object-value lookup guarded. Source malformed-entry throw remains, no bug fix. |
| `resolveMultipleLabels` → selected label; `React.Fragment` | Same new function; ordered `ValueLabel[]` with comma-space tokens | Preserve reduce order and labels as values. Only Fragment representation changes: native caller will render scalar text or `{@render snippet()}` with native defaults. No authored Snippet coercion; zero unchanged renderer credit. |
| `react/utils/listbox-separator/ListboxSeparator.tsx: ListboxSeparator` → `useRenderElement` | New `utils/listbox-separator/ListboxSeparator.svelte` → canonical `internals/RenderElement.svelte` | Horizontal default, `{orientation}` state, div host, presentation role followed by consumer element props. Do not reuse ordinary Separator's role/ARIA algorithm. Native `$props`, `$derived`, children/render Snippets and bindable host ref replace React forwardRef. |
| `ListboxSeparatorProps`, `ListboxSeparatorState`; `react/internals/types.ts: BaseUIComponentProps, Orientation` | New private `utils/listbox-separator/types.ts` → existing `internals/types.ts` and `svelte/elements` | Native class/style/render/event/ref substitutions, orientation exact union. No public export. Actual installed private component types and SSR consumers verify this internal future dependency. |
| `react/internals/useRenderElement.tsx: useRenderElement` → props/evaluation | Existing `internals/useRenderElement.ts: createRenderElement().useRenderElement`; native RenderElement markup | One existing component-lifetime merged-ref owner, current derived descriptor. Enabled/null, state fallback and business stages retained; new Listbox component creates no second renderer algorithm. |
| `useRenderElementProps` → class/style/state/prop merge/ref fanout | Existing same nested function | Source order reused unchanged. Native opaque snippet forwarding uses canonical attachment transport. Svelte host style/class handling retains actual native defaults. |
| `resolveRenderFunctionProps` → `react/merge-props/index.ts` reexports `mergePropsN`, `mergeProps` | Existing same function → canonical `merge-props/index.ts` and `mergeProps.ts` | Ordered getter/list merge, default/rightmost prop precedence, rightmost-first handlers, native preventBaseUIHandler cancellation. Index is only a barrel, no extra implementation. |
| `evaluateRenderProp`, `renderTag` → React create/clone element | Existing same functions plus `RenderElement.svelte` | Native markup/snippet branches; div has no button/image defaults. Opaque Snippets cannot be cloned; native attachments replace embedded React refs. Invalid native render still throws. No new React element/Flight/lazy/version kernel. |
| `react/internals/getStateAttributesProps.ts: getStateAttributesProps` | Existing `internals/getStateAttributesProps.ts` | Map precedence, true/false/truthiness, lowercase property names; orientation maps to data-orientation. No new aria-orientation invented. |
| `react/utils/resolveClassName.ts: resolveClassName`; `resolveStyle.ts: resolveStyle` | Existing `utils/resolveClassName.ts`, `resolveStyle.ts`; `internals/resolveClassValue.ts`, `nativeProps.ts` | Invoke state callback directly; canonical Svelte ClassValue normalization and CSS string/object serialization reused. New component only passes props/state through. |
| `utils/mergeObjects.ts: mergeObjects` | Existing `utils/mergeObjects.ts` | Existing rightmost merge/null handling, reused by renderer and mergeProps; no copy. |
| `utils/empty.ts: EMPTY_OBJECT` | Existing `utils/empty.ts: EMPTY_OBJECT` | Shared immutable setup fallback, not fabricated component state. Whole unselected exports read, no new business claim. |
| `utils/useMergedRefs.ts: useMergedRefs, useMergedRefsN, mergeRefs, handleRef`; `useRefWithInit.ts: useRefWithInit` | Existing `utils/useMergedRefs.ts: createMergedRefs` fixed/N storage, fanout and cleanup; `utils/useRefWithInit.ts` | One source-ordered native ref owner per renderer lifetime; published actual element, cleanup on replacement/unmount, existing callback/object behavior retained. RenderElement `nativeRefAttachment.ts` transports canonical refs and guards stale cleanup. Authored attachments retain native Svelte lifetime. |
| `utils/getReactElementRef.ts: getReactElementRef`; `reactVersion.ts: isReactVersionAtLeast` | Deliberate existing native opaque Snippet/actual host attachment boundary | React version-dependent cloneable element ref lookup has no native counterpart. No implementation of these React-only functions. Native ref fixture checks the actual replacement host and cleanup. |
| `utils/warn.ts: warn` → `createLogOnce.ts: createLogOnce, reset` and React-only invalid Fragment/element warnings | Existing native renderer explicit invalid-snippet error; Svelte diagnostics | Framework warning/development log machinery not copied. Whole Source bodies freshly read; no unchanged warning assertion credit. |
| `react/internals/types.ts`; `react/types/index.ts` type barrel | Existing `internals/types.ts`, `nativeProps.ts`; Svelte Snippet/HTMLAttributes/event types | Source type-only reachability retained in evidence. Source BaseUIEvent/render/HTML props use native representations. No runtime React/Kit imports or type-only barrel treated as business execution. |
| Type-only closure `react/internals/createBaseUIEventDetails.ts`, `reasons.ts`, `reason-parts.ts` | Existing canonical event-detail/reason types where already used by native foundation | Complete whole bodies read; incoming paths in this Original slice are type-only. They are not new helper implementation scope or a source of new selection callbacks. Native types graph records only actual imports. |

## Scope before code

Exactly four new runtime/type files implement the three leaves above. Existing
canonical rendering/serialization/equality/ref modules remain unchanged. The
new leaf bodies are temporarily unconsumed by production Select; runtime tests
and private installed consumers are the present consumers. Their meaningful
prerequisite status is explicit rather than counted as complete Select.

No public Select/Field remote behavior, export route, unmerged Popup bytes,
`useFloatingRootContext(syncOnly:false)`, additional modality helper, Source bug
fix or shared-renderer mutation is authorized by this lease. The four missing
real helpers in the historical Select plan remain its historical inventory;
this work addresses three, and their actual future Select integration is still
missing. Native mode/public parts and remaining full-family Source read/review
continue separately. Historical ordinary Select credit stays zero.
