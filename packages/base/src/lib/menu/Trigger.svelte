<script lang="ts" generics="Payload = unknown">
  // Original MenuTrigger CompositeItem/FocusGuard/render composition (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import CompositeItem from '../internals/composite/item/CompositeItem.svelte';
  import FocusGuard from '../utils/FocusGuard.svelte';
  import { pressableTriggerOpenStateMapping } from '../utils/popupStateMapping.js';
  import { createMenuTrigger } from './trigger/createMenuTrigger.svelte.js';
  import type { MenuTriggerProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
  let { ref = $bindable(null), ...props }: MenuTriggerProps<Payload> = $props();
  const generatedId = $props.id();
  const root = createMenuTrigger(
    () => props,
    generatedId,
    (node) => {
      ref = node;
    },
  );
</script>

{#if root.isInMenubar}
  <CompositeItem
    tag="button"
    render={props.render}
    class={props.class}
    style={props.style}
    state={root.state}
    refs={root.ref}
    props={root.props}
    stateAttributesMapping={pressableTriggerOpenStateMapping}
    children={props.children}
  />
{:else}
  {#if root.isOpenedByThisTrigger}<FocusGuard
      ref={root.preFocusGuardRef}
      onfocusin={root.handlePreFocusGuardFocus}
    />{/if}
  <RenderElement
    tag="button"
    componentProps={props}
    params={{
      state: root.state,
      ref: root.ref,
      props: root.props,
      stateAttributesMapping: pressableTriggerOpenStateMapping,
    }}
    children={props.children}
  />
  {#if root.isOpenedByThisTrigger}<FocusGuard
      ref={root.store().context.triggerFocusTargetRef}
      onfocusin={root.handleFocusTargetFocus}
    />{/if}
{/if}
