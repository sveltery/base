<script lang="ts">
  // Original ContextMenuTrigger renderer composition (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { pressableTriggerOpenStateMapping } from '../utils/popupStateMapping.js';
  import { createContextMenuTrigger } from './trigger/createContextMenuTrigger.svelte.js';
  import type { ContextMenuTriggerProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
  let { ref = $bindable(null), ...props }: ContextMenuTriggerProps = $props();
  const trigger = createContextMenuTrigger(() => props);
  const setRef = (node: HTMLElement | null) => { ref = node; };
</script>
<RenderElement tag="div" componentProps={props} params={{ state: trigger.state, ref: [trigger.triggerRef, setRef], props: [trigger.props, trigger.elementProps], stateAttributesMapping: pressableTriggerOpenStateMapping }} children={props.children} />
