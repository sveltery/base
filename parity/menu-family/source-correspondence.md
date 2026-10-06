# Menu family used source composition

The pre-code checkpoint `d471c0d26df95840d14ef8349e3cf9efa3492114` records
the complete Original Base UI 1.8.0 closure at immutable MIT pin
`47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. The original graph has 200 modules
and 1,038 import/reexport/type edges; the separate complete test/helper graph has
745 modules and 4,418 edges. Immutable archives establish provenance, never
unused-file completion. NavigationMenu remains separate.

[Actual native closure](native-closure.json) currently records 197 used modules
and 891 runtime/type edges from Menu, ContextMenu and Menubar public entries.
[Per-source correspondence](source-correspondence.json) reconciles every
Original source module to used local bodies, explicit native replacement, or
unselected conservative barrel/type export. The generator rejects mappings to
unused files and verifies every Original archived source hash. Its current
statuses require full manual and independent exact-head business, native Svelte
and maintainability review; a resolved path or hash is not acceptance.

[Original assertions](original-assertions.json) preserves 331 ordinary and
parameterized declaration sites, original expectation text and hashes, 19
separate conformance/helper calls and original public type source provenance.
Every Original declaration remains unported with zero ordinary credit. Authored
actual Original/native DOM and browser pairs are supplemental evidence only.

| Original bodies | Actual used native composition | Framework boundary and review check |
| --- | --- | --- |
| MenuRoot and useMenuRootStore | Root.svelte and root/createMenuRoot.svelte.ts; canonical MenuStore and popup helpers | Native initialized context, runes, snippets and actions binding. Compare parent classification, default/controlled seeds, setOpen callback/cancel/dispatch/state order, touch guards, transition/imperative ownership, tree dismissal and navigation/typeahead. |
| MenuTrigger | Trigger.svelte and trigger/createMenuTrigger.svelte.ts | Real shared handle store, data forwarding and registration; canonical button/hover/click/focus. Inspect detached migration, node/tree ownership, release guards, patient-click delay and Menubar CompositeItem. |
| MenuSubmenuRoot and Trigger | SubmenuRoot.svelte, SubmenuTrigger.svelte and submenu-trigger/createMenuSubmenuTrigger.svelte.ts | Native provider and actual parent store; Original navigation/hover/disabled registration and touch/VoiceOver branches. No second submenu engine. |
| MenuPositioner | Positioner.svelte and positioner/createMenuPositioner.svelte.ts | Actual shared positioning/store/tree bridge, positioner policy, internal backdrop, scroll lock and CompositeList. Inspect sibling/parent/item hover events, close handling, guards, mounted exit and cleanup. |
| useFloatingWithStore / useBaseUIFloating | floating-ui/hooks/useFloating.svelte.ts and internals/anchor-positioning/useFloating.svelte.ts | Root/store/tree/ref/context publication delegates one default @floating-ui/dom geometry driver. DOM reference and explicit virtual position reference have distinct ownership; geometry-free interaction contexts have no fabricated positioning fields. Native teardown releases only the context published by this positioner's lifetime, because Root/tree outlive popup-derived getters. |
| MenuPopup | Popup.svelte with canonical FloatingFocusManager and hover helpers | Native renderer/ref attachments; real public Toolbar context. The generic focus manager reads the current explicit finalFocus callback/ref/boolean at actual cleanup, as Original does. Only Popup's mounted default boolean survives native teardown, observed through the existing Store.observe. No consumer prop is captured at close. Inspect return/initial focus, retained updates, nested/external tree, callback completion and composite events. |
| ordinary, link, checkbox and radio items | Actual Menu part components and canonical item/useMenuItem/common helpers | Source hover relay, disabled focusability, labels, modifiers and close semantics. Checkbox/radio share real contexts and cancelable callbacks in Source order. |
| Group/label, indicators, Arrow/Backdrop/Portal, Viewport | Actual public Menu parts, canonical Separator alias and shared popup helpers | Native IDs, attributes, CSS strings, refs and snippet/host composition. Captured previous DOM is inert; current content remounts on trigger/payload key changes with measurement and abortable animation cleanup. |
| usePopupViewport/usePopupAutoResize | One canonical shared utility body each | Narrow actual popup-store useState/set capabilities replace Original erased Pick<ReactStore>; no Menu-only store dependency. Native keyed snippet markup replaces returned React children. Inspect retained current/previous Object.is observation, capture/effect/attachment order, measurement restoration and stale watcher abort. |
| ContextMenuRoot/Trigger/Positioner | Thin native Root provider and actual MenuRoot; full Trigger body; Positioner alias to canonical MenuPositioner | Source virtual rect/long-press/movement/multiple-touch/mac-control-click/release/owner/abort branches. Native lower-case DOM event props, bindings and fixed positioning retain actual business composition. |
| Menubar/MenubarContent | One native Menubar with actual CompositeRoot and FloatingTree/Node | Native context/runes host ownership. Inspect parent-filtered menuopenchange and sibling/list-navigation retention, orientation/RTL/disabled/modal state and relay. |
| navigation/typeahead/focus/hover/safe polygon | One canonical selected Source helper body each | Native stable getters, timers/effects and event props. Original branches, cancellation and cleanup retained. Floating composite utility reexports the same native Composite navigation body; distinct Source grid entry points remain distinct callers. |
| useHoverInteractionSharedState and two actual callers | Canonical shared accessor; useHoverReferenceInteraction/useHoverFloatingInteraction derive the actual current class instance | Native live selection replaces React's returned value on rerender. A destination-owned instance wins; an empty destination receives the original initialized instance. Initial timer disposal ownership remains unchanged. Public two-open-Root handle handoff and exact class identity/mutation/cleanup probes exercise this boundary. |
| native DOM-driver element outputs | Sole internals/anchor-positioning/useFloating body | Native onDestroy marks the derived owner's end. Post-destroy element getters read actual owned referenceRef/floatingRef values, allowing identity-guarded attachment cleanup. Mounted selection, geometry, middleware, request cancellation and default DOM platform are unchanged. The installed null-host and zero-derived_inert probe is a native lifecycle supplement, not an additional unpaired Source finding. |
| inherited Store/FloatingRootStore/tree/events/popup/handle/dismiss/focus/portal/helpers | Actual native modules and hashes recorded in the full closure | Public development dependencies remain explicitly unaccepted as a whole. Reinspect every inherited full body at the exact final head. Existing Store is unchanged; only selected original observe and attachPreventUnmount additions were appended. |
| render, button, merge, ID/class/style/refs and platform helpers | One shared canonical helper per business body | Native snippets, attachments, events, CSS/ClassValue and Svelte defaults. Actual useButton matches public d00a8b0 SHA256 ee71d7077c51139162152716111472919bf80b71e6e9cde62d15ff0b7ce56f59. No React renderer, state-snapshot, insertion-effect or StrictMode emulation kernel. |
| unselected barrel/debug/framework modules | Explicit records in JSON; no unused copies counted as runtime ports | createSelector/memoized, inlineRect, FloatingDelayGroup/useHover/useClientPoint and unused public barrels remain conservative original graph edges. React-only hooks, inspector and inert/version transport use native primitives where selected. |

Reproduce the inventory with `node parity/menu-family/evidence.mjs`; verify it
with `--check`. After source changes regenerate current local hashes and inspect
the actual used business bodies. The recorded development dependencies, receipts
and execution limits remain in [development checkpoints](development-checkpoints.md).
Whole source review, secured paired browser acceptance, final strict packed
consumer, full verification/Standards/configured CI and Root exact-head approval
are still pending. No merge or entire-family acceptance is claimed.
# Current canonical Composite class successor

Menu Positioner, item parts and submenu trigger construct the same [canonical Composite class owners](../composite-owners/source-correspondence.md) with `new`. List map/observer/publication and item index/registration/cleanup business remain shared. Menubar keeps its Root/Item composition. Existing immutable Source/assertion archives, red receipts and historical closure counts remain historical; current class/native closure records grant zero new unchanged Original assertion credit. PR #42/PR #73 and separate reached canonical owners remain accepted-main prerequisites before final acceptance.
