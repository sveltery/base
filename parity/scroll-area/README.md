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

Execution:12 rendered native DOM bodies, library build, installed strict public
SSR/DOM/type/negative consumers and full local verify.sh/Standards have passed at
the frozen c07e product checkpoint (63 script,219 unit,1176 DOM). The
header-only successor preserves all56 product module bytes; its targeted fixture
checks and actual hosted full123-probe execution remain separately required. Hosted655601e executed82/92 probes; hostedb301446 executed113/115;
hostedc07e executed121/123. All failed gates are preserved in [execution history](execution-history.json), with
fixture/locator/simulation corrections and measured native styles recorded in
[native observations](native-observations.md). No failed gate is waived.
The environment's known official Chromium download403 is not bypassed. The scoped
Ubuntu22 workflow uses official Chromium153, chromiumSandbox:true, one worker,
retries0, actual React19.2.8/ReactDOM19.2.8/@base-ui/react1.8.0 and the native public
library. Browser pass claims await the executed host result at the exact head.


[Assertion ports](assertion-ports.json) map every95 original ordinary declaration
and the three parameterized variants to identified candidate business ports or
the explicit R:951 native context effect observation. Original bodies, IDs and
hashes are immutable; combined probes and native boundary observations receive
zero unchanged declaration credit pending independent scope acceptance.
[Conformance accounting](conformance-accounting.json) keeps the six calls and
15 helper declarations per call (90 expanded instances) separate. Native
six-part props/ref/class/style/replacement probes and canonical renderer/ref
checks do not claim unchanged JSX/React wrapper/ref conformance assertions.

[Correspondence](correspondence.json) records all56 actually used native runtime
and type modules and their full body/manual scope, including inherited renderer,
refs, merge-props, contexts, Timeout, platform and shadow helpers. Hash equality
is evidence for reuse, never manual acceptance. Root will assign a fresh whole
source/native/maintainability reviewer; accepted manual receipts remain empty.

Provenance timing disclosure: the pre-code561dd1f checkpoint archived129
component runtime/type modules and the full six ScrollArea test bodies. The
recursive #test-utils barrel/helper graph was missing there. Its conservative165
module [later inventory](test-helper-graph.json), full preserved source bodies,
and selected15 conformance helper declaration hashes were added after runtime
implementation. It earns no retroactive pre-code or unchanged conformance credit.
Unselected popup/temporal test-barrel bodies remain inventory only. No business
bug shared with the exact original has been established by the paired failures;
all repairs preserve the source business algorithms.
