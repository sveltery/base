# Button

`Button` is an action primitive backed by the pinned Base UI v1.8.0 Button composition and canonical source `useButton`/renderer helpers. Import it from `@sveltery/base` or `@sveltery/base/button`. The defaults remain `disabled=false`, `focusableWhenDisabled=false`, `nativeButton=true`; native buttons default to `type="button"`, while explicitly supplied `type={undefined}`/`null` retains native submit semantics.

```svelte
<script lang="ts">
  import { Button, type HTMLProps } from '@sveltery/base';
  import type { Snippet } from 'svelte';
  let host = $state<HTMLElement | null>();
</script>
<Button bind:ref={host} onclick={event => { console.log(event.currentTarget); }}>Save</Button>
<Button nativeButton={false} class={state => ['action', { disabled: state.disabled }]} style={{ opacity: 1 }}>
  {#snippet render(props: HTMLProps, state: { disabled: boolean }, children: Snippet | undefined)}
    <span {...props} data-render-disabled={state.disabled}>{@render children?.()}</span>
  {/snippet}
  Custom action
</Button>
```

The native API retains lowercase event props, `class`/`style` state callbacks, children/render snippets, enumerable Svelte attachments and `bind:ref`. The bindable ref starts undefined when omitted, publishes the actual default/replacement host, and publishes null on teardown. Public types now reuse canonical native ClassValue and CSS object/string style representations; existing string styles/classes remain supported. Numeric object style values are serialized as supplied; write CSS units explicitly where needed. Render snippets must spread the supplied props onto their real host. Use canonical `mergeProps(props, ownProps)` to compose replacement handlers while preserving source right-to-left callback order and `preventBaseUIHandler()` cancellation.

Button directly calls the accepted canonical `useButton` and renders through `internals/RenderElement.svelte`, with ordered props `[elementProps,getButtonProps]`, actual helper ref and source state attributes. It no longer consumes the legacy bespoke `button/props.ts` resolver or Dialog.Element suppression adapter. When placed in a real canonical Composite context, source Space activation occurs on keydown and native keyup does not synthesize a duplicate click. Source text-navigation roles honor default prevention; switch-like roles preserve the original composite activation behavior. Nested source helpers/snippets share the same native host/ref lifecycle. Composite internals are private and this repair adds no public Composite, ToggleGroup or Toolbar API.

Disabled behavior remains the pinned business contract: consumer click/pointer/key activation is suppressed; focusable-disabled hosts allow Tab escape, hover/focus/blur and retain focus. Pinned disabled mousedown suppresses the consumer callback but leaves default focus uncanceled when there is no preceding canceled pointerdown. This audit restores that source quirk, superseding the historical PR17 local mousedown correction for Button only. Toggle, Accordion.Trigger and Collapsible.Trigger still use the legacy resolver and require separate audits. Native React-only diagnostics, opaque render snippets and attachment timing remain explicit framework substitutions rather than unchanged assertion credit.

[Source graph and correspondence](../parity/button/source-correspondence.md), [immutable original assertions](../parity/button/upstream-inventory.json), [historical bounded assertion ports](../parity/button/ports.json) and the [execution ledger](../parity/button/verification.md) keep source fidelity, native differences, ordinary declaration credit and supplemental execution distinct. New source-composition probes earn zero additional ordinary credit. Full repository checks, immutable hash gates, strict isolated public consumers, secured paired browser execution and independent exact-head source/native/maintainability review are mandatory before accepting this audit. The older bounded test checkpoint does not clear the present source gate or establish complete useButton/framework conformance or whole-library parity.
