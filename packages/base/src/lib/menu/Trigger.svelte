<script lang="ts" generics="Payload = unknown">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  // Original MenuTrigger CompositeItem/FocusGuard/render composition (MIT).
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

  const renderSnippet = $derived(props.render);
  const mergedProps = $derived({
    ...mergeComponentProps(
      root.state,
      { class: props.class, style: props.style },
      root.props,
      pressableTriggerOpenStateMapping,
    ),
  });
  const triggerFocusAttachmentKey = createAttachmentKey();
  const triggerFocusGuardProps = {
    [triggerFocusAttachmentKey]: (host: HTMLSpanElement) => {
      const owner = root.store().context.triggerFocusTargetRef;
      owner.current = host;
      return () => {
        if (owner.current === host) owner.current = null;
      };
    },
  };
</script>

{#if root.isInMenubar}
  <CompositeItem
    tag="button"
    render={props.render}
    class={props.class}
    style={props.style}
    state={root.state}
    props={root.props}
    stateAttributesMapping={pressableTriggerOpenStateMapping}
    children={props.children}
  />
{:else}
  {#if root.isOpenedByThisTrigger}<FocusGuard
      bind:ref={root.preFocusGuardRef.current}
      onfocusin={root.handlePreFocusGuardFocus}
    />{/if}
  {#if renderSnippet}
    {@render renderSnippet(mergedProps, root.state, props.children)}
  {:else}
    <button {...mergedProps}>{@render props.children?.()}</button>
  {/if}
  {#if root.isOpenedByThisTrigger}<FocusGuard
      {...triggerFocusGuardProps}
      onfocusin={root.handleFocusTargetFocus}
    />{/if}
{/if}
