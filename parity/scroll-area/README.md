# ScrollArea source family

Complete six-part source implementation: Root, Viewport, Content, Scrollbar,
Thumb, Corner. Source-first preimplementation checkpoint561dd1f recorded the
original Base UI1.8.0 immutable pin47b40521 and all129 conservatively recursive
module bodies/hashes before runtime code. [Plan](module-plan.md),
[original graph](source-graph.json), [original assertions](original-assertions.json)
and preserved MIT sources distinguish source evidence from execution.

The used native runtime preserves source state ownership, geometry formulas,
logical offsets, negative RTL scroll ranges, wheel edge chaining, pointer
capture/latch/missed release guards, snap save/restore ordering, overscroll
feedback, independent axis timeouts and observer/animation lifetimes. Native
runes/context/effects/attachments/snippets replace framework machinery. The one
canonical renderer/event/ref/helper implementation is reused.

95 ordinary original declarations, one parameterized declaration (three button
variants) and six conformance calls are separately inventoried. Browser ports,
private DOM supplements, native renderer observations, strict installed public
consumers and SSR are separate evidence. No unexecuted browser assertion earns
passed or unchanged credit. Current full conformance and exact-head independent
source/native/maintainability acceptance remain pending at this implementation
checkpoint; this is not a complete compatibility claim.

Development dependency: reviewed PUBLIC PR55 head
`a4fcfa0669f0dc8ea2adbcabdbe2ba801030fe63` is normally integrated only into this
isolated branch under the root's precise authorization. Its merge to actual main
is separately blocked by automatic approval review. This feature must not merge
until that prerequisite is genuinely accepted on actual main and final own-head
checks/review/PM approval pass. This PR does not authorize or substitute for PR55's
blocked main merge. Canonical clamp bytes are reused from PUBLIC37ce1f6 and the
canonical addEventListener bytes from PUBLIC17006204a66c9ddb77cade10f83605b51925569a.

Execution at the implementation checkpoint:11 rendered native DOM tests passed;
library build and strict installed type checks passed. Other gates are in progress.
The environment's known official Chromium download403 is not bypassed. The scoped
Ubuntu22 workflow uses official Chromium153, chromiumSandbox:true, one worker,
retries0, actual React19.2.8/ReactDOM19.2.8/@base-ui/react1.8.0 and the native public
library. Browser pass claims await the executed host result at the exact head.
