Source-only diagnosis of the actual native rendering warnings

The existing warnings do not establish a stale-ref, focus, portal lifetime, or lost-live-Menu-props defect. Three component bindings publish into real, nonreactive imperative node slots. Menu deliberately seeds its initial derived props once and subsequently synchronizes live props through a tracked getter. The proportionate proposal is to make the three actual node slots reactive at their owners and express the one-time Menu store publication through its existing `untrack` import. No runtime implementation was edited or executed for this diagnosis.

Immutable reviewed pins:

| Role | Exact commit |
| --- | --- |
| Published #77 source | `336062b3be2dfe90db5899714aed6457f78836ae` |
| #77 runtime preimage | `f2a99979a04a98c8bc60709a75d0db2397ec2470` |
| Published #78 narrow validation | `35272978a8602682ef7e548e1a669ea601e994b6` |
| Original Base UI 1.8.0 | `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c` |
| Diagnostic/primitives source | Installed Svelte `5.57.1`, frozen and SHA-256 recorded |

The observed #77 checkout was `c39271eaf4f893fc64131b22209dee50e74de657` with an empty working-tree status at intake; that successor was not substituted for the published pin. The acceptance checkout later observed `9236046fe5f742aa93cb5c06a38a0eb1dba7efc0`; it was likewise not substituted for #78. The source trees under `packages/base/src` are identical between f2 and #78 (`d0cb5ddb6148ebc9fe8f3948d4d85e7ed7c1d969`). #77 has tree `8d1f78c3181e0f46a723f762f52c489a37b79622`. Of the 38 warning-owner/caller native package bodies compared at all three pins, only popupStoreUtils differs between published #77 and f2/#78; that entire diff and the predecessor publication functions were reviewed. Warning owners and the live interaction synchronization closure are unchanged.

The copied raw log `dialog-five-focus.raw.log` is evidence from the existing #78 run. It reports two passed test files, five passed tests and seventeen skipped tests. It contains repeated `binding_property_non_reactive` warnings at Dialog Portal and FloatingPortal plus `state_referenced_locally` for the dist Menu root initial seed. This diagnosis does not suppress or accept warnings, infer a runtime root cause from them, or claim full native gate completion. No tests, build, typecheck, compiler, browser, install, publication, or runtime edit was performed. Root scripts, Original archives, and docs16362/port5178 were untouched.

The diagnostic means exactly that an effect reading a binding target property found no tracked dependency. In Svelte `validate.js:17-49`, `object[property]` runs in a render effect; `effect.deps === null` triggers the warning. The component compiler still generates both the property getter and assignment setter and places them after spreads (`shared/component.js:199-288`). The binding is not rejected. The underlying native `bind:this` implementation publishes the real element and clears it only if the target still identifies that element on teardown (`bindings/this.js`, whole body). No fake host value or stable placeholder is involved.

1. Dialog internal backdrop

`dialog/Portal.svelte:21` binds `InternalBackdrop` to `store.context.internalBackdropRef.current` when the dialog is mounted and modal. `DialogStore.svelte.ts:148` owns a plain `{ current: null }`; the context is not a deep Svelte proxy. `InternalBackdrop.svelte` exposes a bindable ref and uses native `<div bind:this={ref}>`, retaining its mounted/modal/inert business.

All same-instance readers were traced: `DialogInteractions.svelte:29-31` chooses the outside-press event from the current backdrop presence; `:43-57` resolves the real backdrop during the outside-press handler. `useDismiss.svelte.ts` invokes those functions at event time. These reads do not choose a setup-effect dependency from a cached backdrop value. The Original DialogPortal, DialogStore and useDialogRoot preserve the same conditional node, owner backdrop check, and imperative React ref readers. The warning is a correct reactivity diagnostic but is not source proof of stale event behavior or failed node publication.

Smallest proposed owner change: initialize only `internalBackdropRef` with `$state<{ current: HTMLDivElement | null }>({ current: null })`. Keep the existing actual-node component binding and every portal, mounted, modal, inert, owner-DOM and outside-press guard. Do not broadly convert unrelated context refs or introduce ref transport/React commit adapters.

2. FloatingPortal outside guards

`FloatingPortal.svelte:57-62` owns plain `beforeOutsideRef` and `afterOutsideRef`; `:145/:151` binds the actual FocusGuard spans. The native FocusGuard bindable prop and `bind:this` preserve real span publication and conditional teardown. These same ref objects are forwarded in FloatingPortalContext. The context's live portal-node getter reads the real native portal owner, retaining the existing lifetime correction.

Every current-slot reader in the complete 964-line native focus-manager business body was read: the queued focus-out guard-membership check (`createFloatingFocusManager.svelte.ts:487-488`), outside-guard focus callbacks (`:943/:952`), and the markOthers effect's inside-elements assembly (`:628-629`). Membership and callbacks resolve the current slots when they execute. The effect reads the slots once per effect run, which is the one genuinely nonreactive dependency edge to audit. However, the outside guards render only when the manager is open and nonmodal and the portal node is real (`FloatingPortal.svelte:72-74`). In that consistent state, the markOthers call passes `ariaHidden: false, mark: false` (`createFloatingFocusManager.svelte.ts:640-643`); its separate marker pass uses only the floating node and descendant portals (`:645-646`). The `isUntrappedTypeableCombobox` modal case has no outside guards. Reading markOthers' complete body confirms no outside-guard-dependent aria-hidden or marker mutation in the state where these slots exist. Original FloatingPortal and FloatingFocusManager retain the same imperative reads and markOthers composition, without a dependency on ref `.current` changes.

Thus no concrete lost focus or stale aria-hidden effect was established from these warnings. The minimal proposed native owner change is `$state<{ current: HTMLSpanElement | null }>({ current: null })` for these two outside slots. Leave inside-guard attachments, focusManagerState, portal node/body checks, open/disabled/real-node checks, owner-document resolution, event listeners, cancellation, initial/return focus, and cleanup business intact. This also gives the existing effect a true tracked slot dependency. Source-only inspection cannot prove its runtime timing is unchanged; bounded execution verification belongs to the integration task.

3. Menu initial prop seed

`createMenuRoot.svelte.ts:459-464` derives inactive trigger props from live navigation/dismiss getters and interaction handlers. `:465-467` intentionally calls `store.update({ inactiveTriggerProps })` once before triggers render. This is an initial store seed, not a returned initial snapshot. The compiler accurately sees an initial local read of a derived value (`Identifier.js:126-152`); it cannot use later application synchronization to decide that this initialization is intentional.

The complete live update edge remains: `createMenuRoot.svelte.ts:504-511` passes a getter returning inactive/active trigger, popup, item and floating-root props to `usePopupInteractionProps`. `popupStoreUtils.svelte.ts:405-422` forwards that getter to `store.useSyncedValues` and retains its destruction reset. `SvelteStore.svelte.ts:52-57` evaluates the getter inside `$effect` before invoking `untrack` only for the store mutation. The full Store update, subscriber bridge, Menu selectors and `createMenuTrigger.svelte.ts:200-202` were read: later changes flow to the trigger-props selection and native render closure. The native useListNavigation and useDismiss return live getters, including their enabled-dependent trigger props. Their full native and Original bodies were reviewed. No lost-live-props path was found in this calling closure.

Original MenuRoot uses `useRefWithInit(() => { store.update({ inactiveTriggerProps }); return null; })` for this exact once-only seed and separately installs live usePopupInteractionProps. The source-preserving minimum is `untrack(() => store.update({ inactiveTriggerProps }))` at the one-time seed only; `untrack` is already imported. This expresses the actual imperative initial publication boundary in a closure without changing the live getter. It must not wrap the derived construction or live synchronization getter, delete the seed, turn it into a returned snapshot, or add a warning-ignore directive.

These proposals use native Svelte state and preserve real node identity. `$state.raw({ current: null })` would not track property mutation and is not the proposed change. A scalar `$state.raw` node with explicit live getter/setter could satisfy the diagnostic but adds needless owner boilerplate here. There is no need for generic ref custody, stable-box fake values, function binding solely to bypass validation, React lifecycle emulation, dependency guards, a blanket untrack, or a broad custom-hook/class rewrite for this warning closure. Reusable custom-hook roles and the user's direct three-argument native snippet/intrinsic fallback remain governed by the source policy.

Complete evidence ledger:

- `body-ledger.json`: 150 frozen body entries with exact SHA-256, line counts and honest coverage mode. 43 #77 entries (including five whole guidance bodies), 38 f2, 38 #78, 23 Original, and eight Svelte entries. 147 have complete body coverage by direct read or exact byte equivalence plus distinct changed preimage functions. Three Svelte support modules are explicitly partial/unread and earn no entire-module acceptance: `effects.js` was merely frozen; `shared/component.js` was reviewed only for its complete binding branch; `shared/utils.js` only for complete build_bind_this/validate_binding bodies.
- `snapshot-body-comparisons.json`: every compared native body at f2/#78 with equality against published #77 and SHA-256, preserving divergent-source accounting.
- `warning-reader-edges.json`: the exact owner, publication, reader and minimal-proposal edges above.
- `snapshot-metadata.json`: pins, checkout observations, source trees, copied existing-log digest and limited run result.
- `native/`, `runtime-preimage-f2/`, `acceptance-352/`, `original/`, `svelte-5.57.1/`: immutable body copies, not edits to any runtime worktree.

The source conclusion is limited to the warning calling closures and their relevant whole business owners. It gives no blanket acceptance to unrelated source files or behavior gates. Any proposed cleanup remains unimplemented and unverified at runtime in this evidence packet.
