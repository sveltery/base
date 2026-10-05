# Native public-contract execution plan

This plan supplements the immutable pre-code graph at `41b708601a8cbc72e74a46e550fc79b99da3d0ed`. It records implementation and consumer obligations, not installed APIs, passing type checks or assertion credit. Original is Base UI 1.8.0 at `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, MIT. The seven complete family type-spec bodies are archived under `upstream/packages/react/src/`; their hashes remain in the graph and assertion evidence.

Public exports retain the three separate namespaces, all 27 component parts, each generic `Handle` and each `createHandle`. The root package and each family subpath must expose the same component values and feasible erased part namespaces (`Props`, `State`, Root `Actions`, `ChangeEventReason`, `ChangeEventDetails`). Generic Root/Trigger/Handle relationships retain payload inference. Declarations and runtime entry points must contain no React or SvelteKit dependency.

| Complete Original type spec | Required native packed-consumer witness | Credit status |
| --- | --- | --- |
| `popover/root/PopoverRoot.spec.tsx` | `createHandle<number>()` selects Root's snippet payload as `number \| undefined`; plain children are permitted; Trigger accepts 42 and an omitted payload; a string payload with the numeric handle is rejected. | Unexecuted; two Source payload samples are positive contracts, one negative directive remains required. |
| `popover/positioner/PopoverPositioner.spec.tsx` | Root-package `Popover.Positioner` rejects `keepMounted`; mounting policy remains Portal-owned. | Unexecuted negative contract. |
| `preview-card/root/PreviewCardRoot.spec.tsx` | The equivalent numeric Handle, Root snippet and Trigger payload relationships remain independent of Popover. | Unexecuted; one negative directive remains required. |
| `preview-card/trigger/PreviewCardTrigger.spec.tsx` | Render snippet props expose native anchor attributes: `href` is native `string \| null \| undefined` (the pinned React contract is `string \| undefined`), and spreading props into an `<a>` compiles with the canonical attachment slot. | Unexecuted Source type assertion. A generic open record whose `href` is `unknown` does not satisfy this contract. |
| `preview-card/positioner/PreviewCardPositioner.spec.tsx` | Root-package `PreviewCard.Positioner` rejects `keepMounted`. | Unexecuted negative contract. |
| `tooltip/trigger/TooltipTrigger.spec.tsx` | Native render snippets can spread Tooltip's actual render props into both a `<button type="button">` and an `<input>` without `any`. | Unexecuted positive contract. |
| `tooltip/positioner/TooltipPositioner.spec.tsx` | Root-package `Tooltip.Positioner` rejects `keepMounted`. | Unexecuted negative contract. |

The three Source `expectType` calls and five Source negative directives remain distinct from ordinary runtime declarations. Native snippet syntax changes their representation; it does not weaken payload or anchor-prop relationships.

The shared canonical rendering contracts use Svelte `ClassValue`, CSS text, state-dependent class/style callbacks, and `ComponentRenderFn<Props, State>` snippets. Native event props accept the canonical `BaseUIEvent` prevention method. The actual rendered host receives the canonical attachment slot; forwarded native ref bindings receive that same host and clear on removal. Do not add a second ref or prop-merging algorithm to a family.

PreviewCard.Trigger needs its Source-selected anchor render-prop specialization, using native `HTMLAnchorAttributes` and the canonical attachment slot. Popover and Tooltip use Source's open host render-prop contract so native replacement hosts remain possible. This specialization belongs to the family type, not a rewrite of canonical rendering helpers.

Root actions use the existing native binding convention (`actions`, equivalent business methods `close()` and `unmount()`). Root children use a native snippet with `{ payload: Payload | undefined }`; a snippet may ignore this argument. Document these native public spellings beside the final implementation. Portal containers retain `HTMLElement | ShadowRoot | { current: HTMLElement | ShadowRoot | null } | null | undefined`, including explicit-null wait and undefined fallback. Popover Popup focus options retain boolean, native ref object and callback unions; callback results retain `null`, `undefined`, boolean and actual element distinctions.

Additional native packed-consumer checks are required for every part, not only these seven Original specs:

1. Build and install an actual tarball in an isolated consumer with `strict`, `exactOptionalPropertyTypes` and `skipLibCheck: false`. Import each namespace from the root package and the corresponding subpath; validate runtime exports separately from emitted declarations.
2. Supply `undefined` explicitly to each optional public business prop, callback, positioning option, ref and render/class/style prop. Source's explicit-undefined contracts must survive local type composition; do not rely on optional-property shorthand.
3. Use native array/object/conditional class values and CSS strings, including state callback results and explicit undefined. Read each state field with its actual Source union rather than widening to `string` or `any`; empty State interfaces remain assignable as Source defines them.
4. Bind actual native host refs; forward native attachment props through default and replacement hosts. Confirm the consumer attachment can observe mount, replacement and cleanup. Verify PreviewCard's native anchor attributes and button/nonbutton Popover rendering.
5. Exercise all three generic factories and Handle method signatures; infer Root/Trigger payloads across namespace and subpath imports. Reject mismatched payloads, invalid state fields, invalid positioning values, unsupported Positioner `keepMounted`, and unsupported family-specific props.
6. Validate Tooltip.Provider's children/delay/closeDelay/timeout contract independently of Tooltip.Root. Provider's timeout default 400 and the internal DelayGroup default 0 are runtime obligations, not a reason to widen their public types.
7. Verify SSR and hydration import execution without browser globals. Actual component IDs retain `base-ui-` with the native `$props.id()` suffix; portal IDs use their separate Source ownership. Explicit ID replacement, native null normalization and cleanup must be measured in runtime fixtures.

The consumer files will be added after the leased shared-helper gates and family implementations exist. Their actual outputs, installed tarball identity and frozen reviewed head must be recorded then. This plan adds no executed coverage or ordinary parity credit.

Native anchor boundary: Svelte 5.57.1 `HTMLAnchorAttributes.href` includes `null`. PreviewCard render props retain that actual native union; the adapted type witness must record this measured framework default with zero Original assertion credit.
