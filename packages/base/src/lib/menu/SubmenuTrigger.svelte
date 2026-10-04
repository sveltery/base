<script lang="ts">
  // Original submenu-trigger renderer composition (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { triggerOpenStateMapping } from '../utils/popupStateMapping.js';
  import { createMenuSubmenuTrigger } from './submenu-trigger/createMenuSubmenuTrigger.svelte.js';
  import type { MenuSubmenuTriggerProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
  let { ref = $bindable(null), ...props }: MenuSubmenuTriggerProps = $props();
  const generatedId = $props.id();
  const root = createMenuSubmenuTrigger(() => props, generatedId, (node) => { ref = node; });
</script>
<RenderElement tag="div" componentProps={props} params={{ state: root.state, props: root.props, ref: root.refs, stateAttributesMapping: triggerOpenStateMapping }} children={props.children} />
