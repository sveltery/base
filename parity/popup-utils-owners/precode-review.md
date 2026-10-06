# Popup/Utils retained owner pre-code review

Independent review base: `aa4daff54ec82b96e34e1601648d1b3926ef08cf`.
Original: Base UI 1.8.0, immutable MIT commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`.
Read AGENTS.md, CONTRIBUTING.md, source-porting gate, pinned contracts and differences before review. No runtime changes were made by this reviewer.

The manifests record all 107 Original modules/490 edges and 57 native modules/131 edges reachable through conservative full-module runtime/type imports. Every module and top-level declaration has a SHA-256. Original bytes come from `git archive` of the exact immutable commit; native precode bytes come from `git archive` of the exact main commit, independently of concurrent owner edits. Imports include member names and type-only flags. Root declaration-reference traversal labels selected owner/local dependencies versus whole-module siblings. Non-root barrels and bodies remain conservative supersets: a selected-owner path is not a claim that every exported body in that module executes. Syntax runtime-or-mixed is not emitted import erasure. The manifests are closure evidence, not final manual review or parity acceptance.

## Exclusive owner classification

| Original symbol | Retained state/resource | Callers and native representation |
| --- | --- | --- |
| useTriggerRegistration | Installed Store/ID/element triple; map identity guard and cleanup | Shared trigger-data forwarding and Menu submenu trigger; stable registration callback and class field |
| useImplicitActiveTrigger | Resolved active identity, remap/sole-trigger reconciliation and deferred close guards | Dialog/Menu/Popover/Tooltip/PreviewCard roots; class field and direct native effect |
| usePopupHandleStore | Committed hydration flag; external handle pointer subscription | All five detached trigger families; onMount and canonical handle createSubscriber |
| useTriggerFocusGuards | Pre-focus host | Menu/Popover triggers; reactive native host and detached stable arrow handlers |
| useOpenInteractionType | Open modality and close observation | Menu root; native state and canonical ValueChanged |
| useEnhancedClickHandler | Last pointer type | Open-method trigger props; ordinary private state and stable arrows |

`useOpenMethodTriggerProps`, context selectors and `useTriggerDataForwarding` stay functions. Other popupStoreUtils siblings, canonical navigation/style fallback, Floating owners and Menu root/trigger owners are excluded from this class conversion. Their graph inclusion does not transfer implementation authority or independent acceptance.

## Source/native constraints

Registration acquires actual ID and Store before untrack; it unregisters only when the installed map still points to the captured element, preserving replacements. Cleanup retains captured installed owner identity. Existing forwarding preserves registration-before-data order, conditional payload reads and native owner migration.

Reconciliation preserves same-element ID remap, pending versus previously resolved IDs, sole-trigger claim only when no explicit current ID exists, same-tick replacement microtask guards, and canceled-close ownership. Original contains no microtask cancellation resource; do not invent per-publication cancellation that suppresses a legitimate deferred close. Native Store selected reads subscribe to Store notifications; React dependency tuples are unnecessary.

Handle observation preserves inert serverStore until committed mounting, then canonical subscribed live Store reads. Subscription ownership remains in the existing shared handle. Native SSR/hydration defaults require actual execution evidence.

Focus handlers preserve flushSync close-before-tabbable lookup, outside-positioner routing, trigger focus-target fallback and loop escape. Menu destructures these handlers, so class callbacks must retain detached invocation. The pre-focus host remains reactive for existing bindings/effects. Canonical shadow-DOM containment, ownerDocument and visibility/navigation helpers stay shared.

Modality composition retains the exact iOS hitslop fallback and canonical ValueChanged close-reset observer. Enhanced-click preserves defaultPrevented pointerdown, keyboard detail-zero early return, PointerEvent preference, saved pointer fallback and reset ordering. The keyboard early return intentionally retains the previous saved pointer; changing it would repair a source quirk without authorization.

No scoped business repair is identified at this pre-code checkpoint. Source business bug changes require exact-pin reproduction and separate tracking first. Full inherited feature fidelity/coverage remains limited by the corresponding owner work and historical records. Supplements, divergent native expectations and graph hashes earn zero unchanged upstream assertion credit.

## Projection mechanisms and next review

Current projection tooling includes `record-utils-package-source.mjs`, `record-native-framework-projections.mjs`, `record-native-snippet-owners.mjs`, `record-popup-native-helpers.mjs` and the catalog/family projection tools. The native snippet integration checker checks historical whole-body transforms for registration and pre-focus ownership. An additive successor must preserve those historical preimages and compare unchanged other bodies; current hashes may change, historical source/assertion hashes may not. These precode manifests intentionally retain aa4daff54 hashes. Candidate hashes and new class symbols must be refreshed separately before exact final-head review.

Required review probes include captured old Store cleanup, replacement retention, net-zero trigger-count registration, pending ID resolution, same-ID replacement before deferred close, canceled active-trigger close, handle SSR/hydration handoff, detached focus callbacks, and pointer/keyboard sequence. Mandatory hosted checks, strict dual-packed consumers, SSR/hydration and secured actual browsers remain execution gates. No test, CI, configured-review quota waiver or ready disposition is claimed here.

## Independent implementation checkpoint

The completed read-only review covers the complete 107-module conservative Original closure and 57-module native closure, plus actual Dialog/Menu/Popover/Tooltip/PreviewCard caller composition. Review work was divided across independent readers: all 39 Original Utils modules and 18 native Utils modules; all 35 Original Floating and 13 internals modules; the remaining popup/helper/barrel/type modules and all native dependencies. Large Original business bodies were read through complete TypeScript ESNext output with only types/comments erased, with interfaces/barrels and truncated sections reopened from raw immutable source. This describes reading coverage; it does not claim the conservative barrel exports are all executed or accepted feature ports.

At local runtime checkpoint `4f5e967a1fd94aad9e7325bd3fda2d651668c13d`, all six owner deltas retain source-recognizable complete business bodies and composition, shared canonical reuse, state ownership, callback order, resource identity and cancellation guards. No new scoped source/native/maintainability blocker was found. The five runtime files carry named state-owner classes and thin factory glue; stateless composition functions and caller files remain unchanged. Native effects/lifecycle and stable detached callbacks replace framework representation without React snapshots/dependency tuples, ref fanout or rendering machinery.

Caller attachment cleanup still invokes the live registration callback with null. Same-owner overlapping outgoing/replacement native host lifetimes are a question requiring exact-pin/native reproduction, not a proven business bug or blocker from source inspection. This checkpoint does not authorize speculative caller changes.

Inherited canonical navigation/style fallback, nativeProps empty-string transport, Button/Transition, Floating and Menu owner findings remain independently scoped. Original React renderer/development/subscription wrappers and conservative barrel/type/sibling exports remain explicit framework/scope substitutions. Neither this focused conversion nor whole-closure reading grants their feature acceptance, ordinary assertion credit or unchanged divergent native credit. Final public-SHA verification of unchanged reviewed bodies, mandatory execution, secured browsers, packed consumers, configured review, CI and lead disposition remain pending.

## Authorized seventh owner: anchored scroll eligibility

The extension graphs preserve the original six-owner manifests and local checkpoint. `extension-source-graph.json` records the immutable pinned helper closure (18 modules, 30 edges); `extension-native-graph.json` records the actual pre-extension native closure at `4f5e967a1fd94aad9e7325bd3fda2d651668c13d` (14 modules, 21 edges). Both add the complete conservative import graph of the two real callers separately: 196 Original modules/988 edges and 91 native modules/274 edges. Those caller supersets are explicit dependency context, not a claim that this focused lane reviewed or accepts all Menu/Popover/Floating feature bodies.

The retained owner is touch-open eligibility state, initially false. It resets when disabled, not opened by touch, or without a positioner; otherwise it measures the actual owning document viewport and actual positioner width, requires both positive, and uses the exact `popupWidth >= viewportWidth - 20` threshold. Canonical `useScrollLock` retains non-touch locking and delegates all acquired lock resources to the existing shared `ScrollLocker`.

The complete pinned/native helper dependency bodies were inspected. ScrollLocker retains lock-count/restore identity, deferred lock/unlock Timeouts, resize frame/listener cancellation, author-lock observer, overlay/inset branches and scroll/style restoration. Its real style snapshots implement scroll-lock business; this extension adds no renderer/style custody. There is no new ResizeObserver or additional measurement policy. Exact Source shared quirks remain preserved and any questioned repair requires reproduction first.

Only Popover Positioner and Menu Positioner call the helper. The former supplies open true-modal/non-hover eligibility; the latter supplies open menubar-modal/popup-modal eligibility. Both retain live touch modality, positioner and active-trigger inputs. Caller conditions and ownership remain untouched. The proposed AnchoredPopupScrollLock class is a direct native state/effect owner with unchanged construction glue and shared ScrollLocker composition. Current structural inspection finds no new scoped blocker; execution and final exact public-head review remain pending and supplements earn zero unchanged assertion credit.

## Captured registration cleanup coordination proposal

A canonical native registration resource may return a disposer capturing acquisition identity together with the installed Store/ID/host. A stale disposer acts only when the current acquisition is that same token; disposal then clears that acquisition and applies the unchanged Original map guard (`getById(id) === host`) and delete/count body against its captured Store. New registration/migration disposes the old acquisition first, retaining source order. Acquisition identity prevents an outgoing native host from deleting a later resource even if it reuses the same Store/ID/host tuple.

Forwarding can return that canonical disposer while retaining registration-before-data publication, conditional payload branches and reactive forwarding. Its migration effect should return the disposer it actually acquired, rather than a closure that calls the live nullable registration callback. Nullable callbacks can remain compatibility glue while the Menu owner adopts captured attachment disposal. No ref fanout, private registration map, callback lifecycle engine or custom renderer is proposed.

This is API coordination advice, not implemented runtime or a bug/repair claim. The Menu owner owns exact-pin/native reproduction and caller adaptation. Existing source guards remain binding; no caller change or broad source bug fix is authorized by this report.

### Coordination correction: migration-aware captured host

The acquisition-token-only disposer proposal above is superseded for actual attachment cleanup. If an attachment captured acquisition A, then Store/ID migration installed B for the same host, disposing only A can leave B registered when the host disappears while its component remains alive. The caller's plain host ref does not independently invalidate the migration effect. This is API lifetime analysis, not a reproduced product bug or authority to change the Menu caller.

The minimal migration-aware cleanup accepts the captured host and checks it against the current installed registration's element. A matching host retires the current captured Store/ID/element tuple through the existing Source map/count guard; a different replacement host is untouched. A stable `unregisterHost(host)` method or `register(null, capturedHost)` optional guard can express this without a ledger. Forwarding can expose a cleanup closure that captures only the actual host and delegates to that canonical API, so it follows the same host's registration migration without following a different replacement. Cleanup does not publish trigger payload or acquire a different live caller Store.

Concurrent independent attachments to the exact same element remain an explicit Source single-owner/element-identity limit. This proposal does not add attachment refcounts, callback fanout, token registries or rendering machinery. Runtime changes remain pending the Menu owner's exact-pin/native proof and API disposition.

## Extended whole-body candidate checkpoint

The authorized seven-owner candidate was reread in full, including all sibling bodies in its six runtime modules. The extended conservative Original caller closure contains all 196 modules (including the initial 107); native reading covers the union of the initial 57 and extended caller 91, totaling 99 distinct modules. Independent readers covered complete additional Menu/ContextMenu/Separator/adjacent contexts, Composite/Button/direction/anchor/Floating hooks and types; this reviewer covered the remaining Popover stores/contexts/Positioner/types, popup viewport/resize and pure helper bodies. Large Original modules were read through complete type/comment-erased ESNext output and reopened raw for relevant interfaces or clipping. Graph inclusion still grants no execution or broad feature acceptance.

No new scoped source/native/maintainability blocker was found in the seven class conversions. AnchoredPopupScrollLock preserves the complete reset/measurement threshold body and canonical ScrollLocker composition. The unchanged forwarding helper remains function glue; captured-host API coordination is deferred pending Menu exact-pin/native proof and caller-owner disposition. No speculative repair or independent copy was introduced.

An inherited excluded positioning limitation is explicit: the native anchor-positioning effect writes position/top/left/right/bottom/transform/willChange/opacity to preserve middleware-owned available-size values. This requires separate canonical-owner scrutiny under the current style-ownership policy; full-body reading here does not accept or repair it. Composite/Button/Floating/Menu retained owners and historical parity limitations remain separately scoped.

This is a read-only prepublication checkpoint, not a ready or hosted-CI disposition. No reviewer tests were run. Exact final public SHA fetch/tree/hash binding, configured review, mandatory hosted execution and remaining resource-limited local gate records remain pending. All new supplements and divergent native expectations retain zero unchanged upstream assertion credit.
