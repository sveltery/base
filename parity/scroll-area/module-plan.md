# ScrollArea source-first module plan

Before runtime implementation, inspected original Base UI 1.8.0 immutable commit
`47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c` (MIT). `source-graph.json` recursively
resolves all runtime/type module imports, barrel exports and `@base-ui/utils` paths;
129 original modules are archived byte-for-byte with SHA256 and immutable URLs.
The conservative graph includes unrelated floating barrel exports and type-only
popup definitions. They are traced for closure, not claimed as used ScrollArea business.
`original-assertions.json` preserves 95 ordinary declarations, one parameterized
declaration (three button variants), and six conformance calls. All initially unported.
No existing-helper acceptance is inferred from a hash.

| Source module/symbol | Planned actual used port or native facility | Business/manual checks |
| --- | --- | --- |
| scroll-area/index.ts, index.parts.ts and six public Props/State pairs | module-owned namespace, aliases and types.ts | exactly Root/Viewport/Content/Scrollbar/Thumb/Corner; native HTML props, explicit undefined, typed snippets |
| root/ScrollAreaRoot.tsx: state, startScrolling, handleScroll | Root.svelte runes plus canonical Timeout | independent axis timers and coordinate delta ownership; fixed defaults |
| Root pointer down/move/up, disableViewportSnap | Root.svelte functions | primary/capture latch, stale capture takeover, missing release buttons guard, snap save/restore order, finite short-track math |
| Root hover/touch, normalizeOverflowEdgeThreshold | Root.svelte functions | source event.target contains; negative thresholds clamp; touch never sets hover |
| root/ScrollAreaRootContext.ts | real root context with getter/setters and reactive ref objects | required context error, independent roots, actual supplied state (no fallback stub) |
| viewport/ScrollAreaViewport.tsx: computeThumbPosition | Viewport.svelte | first metrics, hidden flags, ratios, corner pre-sizing offsets, logical padding/margin, thumb min16, transform direction, CSS metrics, threshold updates |
| viewport: applyOverscrollThumb, pickState, getHiddenState | same local functions | exact damping and edge-pinning formulas, shallow-equal identity bailouts, no changed business expectation |
| viewport removeCSSVariableInheritance | same local function plus canonical source platform engine | one module flag, WebKit skip, catch existing registrations, native CSS.registerProperty |
| viewport effects and scroll/input handlers | native $effect/onMount plus canonical Timeout | microtask after hidden/direction/threshold changes, native hovered mount, ResizeObserver initialization metrics guard, animations allSettled/catch, 100ms programmatic debounce |
| viewport/ScrollAreaViewportContext.ts | actual context computeThumbPosition | Content needs real Viewport; no global state |
| content/ScrollAreaContent.tsx | Content.svelte | minWidth fit-content; captures hasMeasuredScrollbar at mount; skips only initial observer delivery before viewport measurement; disconnect |
| scrollbar/ScrollAreaScrollbar.tsx | Scrollbar.svelte | keepMounted decision, orientation state and refs; source wheel consumes only own axis, ctrl zoom skip, edge chaining, bounds including negative RTL |
| scrollbar track pointer/mouse handlers | same handlers on canonical native renderer | composed native target exclusion, logical offsets, short-track bailout, snap disabled before assignment, RTL jump formula, any-button focus prevention |
| scrollbar/ScrollAreaScrollbarContext.ts | actual nearest orientation context getter | Thumb owns correct axis ref and handlers |
| thumb/ScrollAreaThumb.tsx | Thumb.svelte | axis scrolling, measured visibility, CSS variable resting sizes, down/move/up/cancel source handlers |
| corner/ScrollAreaCorner.tsx | Corner.svelte | conditional mount, aria hidden override, source corner sizes and logical positioning |
| constants/getOffset/stateAttributes and all CSS/DataAttributes | direct MIT source ports | source logical margin symmetry (Safari), mappings suppress cornerHidden and map overflow names |
| utils/scrollEdges.ts, utils clamp | canonical direct shared ports pending exact lease | preserve1px tolerance and nearest edge for short ranges; single implementation |
| utils/addEventListener | canonical direct shared port pending exact lease | listener typing, passive:false wheel and cleanup options preserved |
| utils/styles.tsx styleDisableScrollbar | canonical stylesheet object plus native Svelte style markup pending lease | exact class/CSS, CSP nonce/suppression; React style hoisting is renderer-only and native differences need measured evidence |
| internals/useRenderElement.tsx | existing canonical useRenderElement.ts + RenderElement.svelte | source ordered prop/state/class/style merging, attachment ref fanout, snippet replacement; full inherited closure reviewed by independent reviewer |
| getStateAttributesProps, resolveClassName/resolveStyle, mergeObjects/empty, merge-props | existing canonical shared bodies | actual complete local import closure and bytes recorded later; consumer prevention/order remains required |
| utils/useMergedRefs + useRefWithInit | existing canonical merged refs + native setup lifetime | source attach/detach order and cleanup; native attachment transport |
| internals/useBaseUiId + utils/useId | canonical useBaseUiId with $props.id() | deterministic SSR/hydration ID relationship, explicit viewport IDs retained |
| utils/useTimeout/useOnMount | existing canonical Timeout + native onMount | replacement only lifecycle ownership, clear all scheduled timers on destroy |
| utils/useStableCallback/safeReact/reactVersion/fastHooks/useIsoLayoutEffect | direct native component-lifetime functions + $effect/onMount/untrack as needed | no insertion effect, StrictMode, synthetic-event machinery; callbacks read current runes |
| internals direction-context and csp-context | existing real native contexts | closest direction reactive; CSP defaults and noninheritance |
| floating-ui-react/utils -> element reexports -> utils/shadowDom contains/getTarget | existing canonical utils/shadowDom | preserve source shadow traversal and composedPath[0] fallback; no copied floating algorithms |
| platform/index/parts/engine/shared and unused platform groups | canonical source engine dependency pending root decision | original static CSS.supports WebKit test; unrelated groups traced but unused by selected ScrollArea slice |
| internals/types -> types/index; React intrinsic/render/event/ref types | native Svelte BaseUIComponentProps/WithBaseUIEvent/Snippet/HTMLAttributes | strict installed public consumers prove usable native substitutions; renderer divergences earn zero unchanged credit |
| unrelated floating barrel exports/type-only popup closure | no runtime local ScrollArea use | module graph inventory only; no business implementation or manual acceptance credit |
| six test bodies and describeConformance | preserved original inventory + scoped DOM/paired browser ports | unchanged ordinary assertions remain separate from native and supplemental probes; omitted scope explicit |

No business behavior changes are authorized by this plan. Native renderer/lifecycle
substitutions follow the user's native Svelte directive and will be recorded with
observations. No browser, SSR, source acceptance or assertion parity is claimed at
this preimplementation checkpoint. Shared mutations await a precise root lease.
