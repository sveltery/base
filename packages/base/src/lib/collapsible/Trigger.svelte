<script lang="ts">
  // Source composition from Base UI v1.8.0 CollapsibleTrigger.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
  import { triggerOpenStateMapping } from '../utils/collapsibleOpenStateMapping.js';
  import { transitionStatusMapping } from '../internals/stateAttributesMapping.js';
  import { useButton } from '../internals/use-button/useButton.svelte.js';
  import { getCollapsibleContext } from './context.js';
  import type { CollapsibleTriggerProps } from './types.js';

  const stateAttributesMapping = { ...triggerOpenStateMapping, ...transitionStatusMapping };
  let { children, class: className, disabled: disabledProp, render, nativeButton = true,
    style, ref = $bindable(), ...elementProps }: CollapsibleTriggerProps = $props();
  const context = getCollapsibleContext();
  const disabled = $derived(disabledProp ?? context.disabled);
  const { getButtonProps, buttonRef } = useButton(() => ({ disabled, focusableWhenDisabled: true, native: nativeButton }));
</script>
<RenderElement tag="button" componentProps={{ render, class: className, style }}
  params={{ state: context.state, ref: [buttonRef], props: [
    { 'aria-controls': context.open ? context.panelId : undefined, 'aria-expanded': context.open, onclick: context.handleTrigger },
    elementProps, getButtonProps,
  ], stateAttributesMapping }} {children} bind:element={ref} />
