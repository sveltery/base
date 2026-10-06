# Preliminary independent bounded Toast closure review

Native graph checkpoint: `b5477dd5b9d5f9760be65ef429c87a1c009d3137`.
Original: Base UI 1.8.0 immutable `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, MIT.
This report is a fresh source/native/maintainability reading record, not final-head
acceptance, an execution receipt, or a transfer of historical review credit.

The [actual graph](closure-audit-b547.json) records 71 native modules, 138728
source bytes, and 149 conservatively reachable Original modules, 646509 source
bytes. All Original archive bodies were verified against the immutable Git tree's
blob object identity. Imports and reexports are followed recursively; explicit
type-only edges are separate, and runtime-or-mixed imports are conservative.
There are no unresolved local edges. The earlier 95-module native trace belonged
to the pre-integration Toast Portal type's Dialog dependency; this checkpoint
uses its own Toast element contract and does not depend on that Dialog type graph.

The reviewer read all 71 current native module bodies. Two independent reading
agents supplied additional Original Utils/internals and Floating/portal review.
The graph includes their per-module Utils mappings. Original Toast Store,
manager, Provider/context, useToastManager/types, Root/context/CSS/state markers,
Viewport/CSS, Content, Title, Description, Action, Close, Portal, label/content,
focus and promise bodies were independently read in full. Original
useSwipeDismiss, getElementTransform, getElementAtPoint, scrollable,
useFocusableWhenDisabled and dispatchClickWithModifiers were also read; gesture
and scroll arbitration remain deferred.

Source FloatingPortal, FloatingPortalLite, FocusGuard, floating utils/index/types,
element/event/tabbable/composite/nodes/event-emitter/constants/attribute helpers,
owner/shadow DOM and all eight platform modules were read. The source graph also
reaches unused sibling exports through Floating and popup barrels, plus anchored
Positioner/type dependencies. Unused interaction, full focus-manager, popup
controller and positioning algorithms are classified as source-only/deferred;
their presence in a conservative graph grants no bounded runtime acceptance.
Unread unrelated sibling bodies are not represented as manually reviewed.

| Original role | Actual native owner | Review result |
| --- | --- | --- |
| Store snapshot, no-change and recursive notification delivery | Utils Store; SvelteStore selected reads | Plain authoritative state, synchronous snapshot arguments, reference suppression and updateTick interruption remain recognizable. Native createSubscriber supplies reactive reads without an extra state engine. |
| Toast metadata, limit, add/update/remove/close/promise/timers | ToastStore | Source branches and publication order remain. Ending-ID replacement removes then adds; callbacks precede physical removal; timer work follows state publication. No terminal disposal, removal token or promise policy is added. |
| generateId and imperative manager | Utils generateId; createToastManager | One module counter, random fragment per allocation, truthy-ID bypass, Set emit order and synchronous promise handoff remain. |
| Provider and context manager | Provider setup, native effects/onDestroy, context and facade | One store per Provider, captured manager subscription cleanup, native selected reads and timer-only destruction. No React snapshot/replay implementation. |
| Root initialization, dimensions and completion | Root, canonical useOpenChangeComplete/useAnimationsFinished | Measured host/ID initialization, Source height business and ending-write rejection remain. Native host changes cancel the captured watcher. The helper remains shared rather than copied privately. |
| Label content and ID registration | Title/Description, content/RenderContent, Root ID setters | Nullish fallback, empty/boolean gate, native generated or explicit ID, actual host acquisition and ID-value cleanup. Positive content changes preserve registration while renderability/host/ID remain stable. Native snippets replace React element inspection. |
| Focus/touch ownership and viewport shortcuts | Store, Viewport, canonical shadowDom/owner/matchesFocusVisible/FocusGuard | Source callback-before-focus ordering, next/previous scan, previous-element return, containment, F6, Shift+Tab, hover/touch/window timer order and captured listener cleanup remain. Native removal focusout stays explicit. |
| Action/Close button business | Actual parts plus canonical useButton/useFocusableWhenDisabled/dispatchClickWithModifiers | Source prop/callback order and disabled/native/composite branches are reused. Native intrinsic fallback's literal type=button precedes spread; authored consumer type still overrides. |
| Element props and types | Direct snippets, attachments, mergeComponentProps/mergeProps/nativeProps | Pure ordered events, class/style and state-attribute composition stays shared. Native host refs, style strings, ClassValue conversion and preventable native events replace React representation. |
| Toast Portal | FloatingPortalLite, canonical node/content helpers, PortalHost/PortalContent | Source null-wait, explicit container/ref then parent portal then body fallback, target invalidation and Lite composition remain. Native host/content mounts capture separate contexts and actual cleanup owners. Lite installs no FullPortal focus provider. |
| Shared platform/timers/scheduler/diagnostics | Canonical Utils modules | Native runtime remains React-/SvelteKit-free. Source Scheduler/reset, Timeout, platform branches and helper reuse remain; no private parallel timer/scheduler is present. |
| Anchored positioning and swipe | Omitted Positioner/Arrow and Root gesture lease | Explicitly incomplete. No constant swiping state is represented as completed gesture business; the bounded Root requires swipeDirection={[]}. |

External runtime leaves were inspected: installed `@floating-ui/utils` 0.2.12's
whole DOM module, including used getWindow/isNode/isShadowRoot and their
dependencies, and `esm-env` 1.2.2's export conditions/DEV fallback/constants.
`@floating-ui/dom` occurs only in the conservative Original positioning/type
closure, not this checkpoint's native closure. Svelte 5.57.1 provides native
framework primitives and public types; no wholesale framework-runtime source
acceptance is claimed.

No confirmed defect was found in the bounded store/ID/label business. Dead private
Toast animation/focus predecessors are deleted after integration and no longer
appear in the actual graph. The old absolute review-report reference is not
portable source evidence; this fresh graph and reading record replace that
reference as the current bounded reading evidence without changing its history.

Two inherited candidates stay outside this disposition: Content's direct
owner-document observer lookup may skip a document with no window (the owner is
preparing an exact-pin paired reproducer); useButton's tag-name predicates omit
Source isHTMLElement checks. A later [exact-pin predicate observation](use-button-namespace-observation.json)
confirms the uppercase SVG BUTTON predicate difference while ordinary HTML
button/link cases agree. This extracted-helper jsdom probe is outside the declared
HTMLElement host contract and establishes no supported public component/browser
defect. Neither candidate is accepted as parity or repaired speculatively.

During reading, HEAD advanced to `253f1343459974e88ac834829271deee5532cde6`.
The entire Toast/Utils closure diff from this graph checkpoint consists of
Title/Description `state` to `componentState` local renaming; those complete diffs
were read. A fresh exact stable pushed-SHA disposition is still required after
implementation and mandatory checks. Browser, strict types, SSR/hydration,
installed dual-package consumers, hosted final-head CI and team-lead acceptance
remain independent gates. This report grants zero new ordinary upstream assertion
credit and no complete Toast/API/VoiceOver acceptance.
