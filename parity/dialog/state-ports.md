# Contained Dialog state ports

Pinned source: Base UI v1.8.0, `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. MIT attribution: [UPSTREAM_LICENSE](UPSTREAM_LICENSE). Baseline: main `f451bf305642f887cb8d4040006456220a38b8ca`.

Selected declarations: R:239/431 and C:25/55/89/118/137, where R is `packages/react/src/dialog/root/DialogRoot.test.tsx` and C is `packages/react/src/dialog/close/DialogClose.test.tsx`. All eighteen paired state-port executions and three supplements passed hosted secured Chromium in [CI run 36852954863](https://github.com/sveltery/base/actions/runs/36852954863), tested commit `82b420ecfc3bbdd1d337825b20814b25b4a9a5d5`, browser job 110338666844. Exact final-head independent review and all CI checks remain merge gates.

| Source | Complete fixture and ordered assertion mapping |
| --- | --- |
| R:239 | Nonmodal Root; Trigger 1; conditionally mounted Trigger 2; Portal/Popup with ordinary Mount trigger 2 button. Click Trigger 1; controls equals Popup ID (:264); mount Trigger 2; first expanded true (:269), controls unchanged (:270); second expanded false (:271), no controls (:272). |
| R:431 | Direct defaultOpen, defaultTriggerId=missing-trigger, nonmodal Root; actions, Portal/Popup; no Trigger. Close through actual actions; callback count 1 (:453), false (:454), imperative-action (:455), trigger exactly undefined (:456). Execute three fresh repetitions per framework: the enclosing contained/detached/multiple-detached parameters all use this identical direct fixture and never instantiate TestDialog. |
| C:25 | Uncontrolled modal Root; Trigger; Portal/Popup; native disabled Close. Initial callback count 0 (:39); user Open; count 1 (:44), true (:45); Close has disabled (:48) and data-disabled (:49); real pointer click Close; count stays 1 (:52). |
| C:55 | Same fixture with disabled custom span Close/nativeButton=false. Initial count 0 (:71); Open; count 1 (:76), true (:77); no disabled (:80), data-disabled (:81), aria-disabled=true (:82); real pointer click; count stays 1 (:85). |
| C:89 | Uncontrolled modal Root; Trigger; Portal/Popup; Close with explicit undefined onclick. Initial count 0 (:103); Open; count 1 (:108), true (:109); Close; count 2 (:114), false (:115). |
| C:118 | Default-open nonmodal Root without Trigger; Portal/Popup; Close calling preventBaseUIHandler. User Close; dialog remains (:133); callback count 0 (:134). |
| C:137 | Controlled open=false, nonmodal Root without Trigger; keepMounted Portal/Popup; Close with click observer. Synthetic click on hidden retained Close; click observer count 1 (:153); open callback count 0 (:154). |

[Browser ports](../../tests/browser/dialog-state.spec.ts) run against both [Svelte](../../apps/fixtures/src/lib/StateFixture.svelte) and real [React](../../apps/fixtures/src/lib/state-reference.ts) fixtures at `/dialog-state`. Seven declarations expand to nine candidate records because R:431 has three enclosing variants, yielding eighteen paired browser executions. The synthetic hidden click retains the source fireEvent channel; disabled clicks use real pointer coordinates because Playwright's locator.click refuses disabled controls. Other source user clicks remain ordinary Playwright user input. Awaited mounting and individual polling assertions adapt act/waitFor without removing intermediate observations. The imperative fixture exposes a cleanup-managed function on its main DOM host; the test directly invokes the actual Root actions, matching source act(actions.close) with no click/focus event or additional focusable control. It adds no Trigger and records the exact `details.trigger === undefined` comparison before JSON serialization. Callback arrays replace spies without changing counts or order. Custom Svelte span snippets spread native and symbol attachment props and render child content; the type cast only adapts HTML typing. Inert output nodes outside Root expose observations and are not focusable. Page errors must remain empty.

The [DOM companions](../../packages/base/tests/dom/state.test.ts) mount the same Svelte fixture for seven wiring cases plus two cancellation probes. They provide no browser parity credit. External owner/cancellation controls also use programmatic invocation to avoid unrelated outside-press/focus-out requests. Modal Popup adapters use relative positioning and z-index=1 to keep the actual Popup above the internal backdrop; source user input and all modal settings are retained. Controlled supplements hold an owner input through open and close requests, then update it externally, check consumer-before-internal order and trigger/close/Escape reasons, and reopen. Canceled open/close probes verify the owner input stays unchanged, the internal observer is suppressed, and releasing control exposes unchanged internal state; an accepted subsequent request verifies the controller remains usable. Root open remains an input, not a new bindable public API. These probes provide no credit for R:389/411/459/535/555/582, whose detached fixture variants remain unported.

[SSR supplement](../../scripts/tests/dialog-state-ssr.test.mjs) renders two actual Roots with all four defaultOpen combinations plus a repeated closed request, without browser globals. It checks each independent expanded state, controls presence, distinct popup relationships and title IDs, and absent Portal server DOM. The test-only SSR loader resolves source `.js` imports to their TypeScript source when no emitted file exists and transpiles rune modules before server compilation; packed imports keep using emitted files. This avoids requiring a previous build for the fresh-checkout script tests. SSR checks earn no source declaration credit.

Existing four initialFocus ports and all 37 prior supplemental browser executions remain intact. The complete browser suite now collects 66 tests: prior 45 + eighteen state port executions + three controlled/cancellation supplements. No disabled tests, runtime changes, new parts, detached handles, Viewport, dependencies, lockfile or security changes are introduced.

Current shared credit is **15 passing ports / 618 unported** out of 633; Dialog has **11 complete ports / 164 unported declarations** and **13 complete ports / 358 unported candidate records** out of 175/371. The seven new complete source mappings add seven declarations / nine expanded records and are traced centrally; the immutable Dialog trace retains its original provenance placeholders. The inventories overlap and must not be added together.

The first hosted run at `899d32e` exposed adapter errors: partial button-name matching, unpositioned modal popups underneath the internal backdrop, and pointer-based external fixture controls adding outside-press requests. The adapters now use an exact Trigger 2 locator, popup stacking CSS, and programmatic owner controls and direct action invocation. Source assertions and runtime behavior were retained.

The second hosted run passed 63/66 executions, revealing that React also routes synthetic external button clicks through outside dismissal. R:431 now invokes actions directly through a cleanup-managed host function in both adapters, with no synthetic event and no extra focusable button. The three source callback-count assertions remain unchanged.


Reproduce with Node 24.x and pinned pnpm 12.6.0:

```sh
bash scripts/bootstrap.sh
node parity/dialog/inventory.mjs /workspace/base-ui --check
node scripts/parity-inventory.mjs --upstream /workspace/base-ui --check
bash scripts/verify.sh
bash .github/standards/check.sh
# Hosted Ubuntu 22.04 job installs official Chromium; sandbox=true, retries=0.
# After sourcing scripts/toolchain.sh, run the browser suite with an available secured browser:
pnpm test:browser
```

Local verification passes 13 script/SSR/consistency tests, 19 runtime tests and 35 DOM tests, TypeScript/Svelte with zero errors/warnings, fixture SSR/client builds, runtime boundaries and isolated tarball consumption. Both source audits pass; the Dialog inventory remains byte-identical. Initial ports were committed in `899d32e` before adapter corrections; no runtime fixes were required. The exact reconciled head must pass all three hosted checks and independent Sol/high review before the authorized guarded merge. Remaining gaps include detached handles and their Root variants, Viewport, remaining focus/composition/nesting/presence/portal assertions, and all Drawer/Toast ports. No approved deviations are introduced. [PR #6](https://github.com/sveltery/base/pull/6) records final review and CI evidence.
