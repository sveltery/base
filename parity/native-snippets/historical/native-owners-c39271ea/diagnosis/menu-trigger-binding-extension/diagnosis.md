Additional actual Menu Trigger binding warning, source-only

The newer unsuppressed #78 log contains `bind:ref={root.preFocusGuardRef.current}` at Menu Trigger line 56. It publishes a real native FocusGuard span into a plain imperative slot owned by the shared trigger-focus helper. Its sole same-slot business reader resolves the current node in a synchronous focus handler. No source-confirmed stale-ref, failed binding publication or focus defect follows from this warning. The minimal cleanup proposal is to make only that helper's actual preFocusGuardRef slot reactive.

Actual source #77 is `c39271eaf4f893fc64131b22209dee50e74de657`; validation #78 is `9236046fe5f742aa93cb5c06a38a0eb1dba7efc0`. Preimages are `336062b3be2dfe90db5899714aed6457f78836ae` and `f2a99979a04a98c8bc60709a75d0db2397ec2470`. Original Base UI 1.8.0 is `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. Five of six focused native bodies are byte-identical across all four pins; createMenuTrigger has one actual preimage line difference documented in corrigendum.md. No divergent unchanged credit is awarded. The initial 150-entry packet and derived-inert 75-entry packet remain immutable.

Actual owner/publication/read chain:

- `useTriggerFocusGuards.svelte.ts:41` creates plain `{ current: null as HTMLElement | null }`.
- `createMenuTrigger.svelte.ts:203-204` receives the helper output, returning the same object at `:264`.
- `menu/Trigger.svelte:55-57` renders the pre-guard only for an opened trigger in the non-menubar branch and binds that object's `.current`.
- The whole native `FocusGuard.svelte` publishes a real bindable ref with native `<span bind:this={ref}>`, preserving platform role, tabindex and aria-hidden business.
- The only same-slot business read is `useTriggerFocusGuards.svelte.ts:51-53` during handlePreFocusGuardFocus, after canonical native flushSync close, immediately before selecting/focusing the previous tabbable. It does not key a setup effect or cache a snapshot.

The companion handleFocusTargetFocus reads positioner, before-content guard, trigger-focus target and triggerElementRef live during the event. It preserves outside-event checks, close-event forwarding, skipping positioner descendants and its same-element loop guard. It does not read preFocusGuardRef. The complete native tabbable body was already read; its null/not-found handling remains. Original whole useTriggerFocusGuards uses React.useRef with the same synchronous close and subsequent current-node read. The warning alone does not establish whether closing removes the guard too early; Original preserves that ordering too.

The second production caller is Popover Trigger. Both complete native and Original PopoverTrigger bodies were read. Native Popover binds the same helper pre-guard only when its trigger owns a mounted popup and focusManagerModal is false (`popover/Trigger.svelte:151-155`). Popover's post-guard points to a different store-context slot. This packet does not infer a Popover runtime warning from the Menu log or authorize changing that other slot.

The smallest native proposal is `const preFocusGuardRef = $state<{ current: HTMLElement | null }>({ current: null });` at the existing shared helper owner. It makes the actual node property reactive and preserves the passed object's identity for Menu and Popover. Retain all handlers, live store/trigger ownership, source close/focus ordering, guard-rendering predicates, host teardown, platform behavior and direct intrinsic/snippet rendering. `$state.raw({ current: null })` would not track mutation. No generic Ref class, broad context/class conversion, fake stable host value, function binding to bypass validation, lifecycle adapter or warning suppression is needed.

Svelte's already-reviewed diagnostic measures tracked getter dependencies; the compiler still generates the actual binding getter/setter. This plain-slot warning does not establish a runtime failure. It is separate from the derived_inert delayed-work opportunity and does not identify those occurrences.

No runtime/source edits, build, compiler, typecheck, test, browser, install or publication were performed. The existing validation remains seventeen passed and forty-six skipped across five files, with warnings. Root decides any further implementation authorization; developer's prior three-binding/initial-seed scope was not expanded here.

The additive body-ledger.json has 29 complete-body entries: six owner/caller/primitive bodies at four native pins, one exact #78-352 Trigger preimage needed for the corrigendum, and four whole Original owner/caller/primitive bodies. comparisons.json records equality and the actual divergence. metadata.json records pins, existing-log digest and immutable prior-packet digests. Coverage is direct whole-body or exact shared bytes plus the fully reviewed distinct predecessor attachHost function. This packet adds no broad Source or runtime acceptance.
