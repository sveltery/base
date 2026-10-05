<script lang="ts">
  // Original NavigationMenuIcon active Item state and default glyph (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { useNavigationMenuRootContext } from './root/NavigationMenuRootContext.js';
  import { useNavigationMenuItemContext } from './item/NavigationMenuItemContext.js';
  import { triggerOpenStateMapping } from '../utils/popupStateMapping.js';
  import type { NavigationMenuIconProps } from './types.js';
  let {
    // eslint-disable-next-line no-useless-assignment -- Native bind:ref publishes the host.
    ref = $bindable(null),
    render,
    class: classProp,
    style,
    children,
    ...elementProps
  }: NavigationMenuIconProps = $props();
  const item = useNavigationMenuItemContext();
  const root = useNavigationMenuRootContext();
  const state = $derived({ open: root.open && root.value === item.value });
  const componentProps = $derived({ render, class: classProp, style });
  const refs = [
    (node: HTMLElement | null) => {
      ref = node;
    },
  ];
  const params = $derived({
    state,
    ref: refs,
    props: [{ 'aria-hidden': true }, elementProps],
    stateAttributesMapping: triggerOpenStateMapping,
  });
</script>
{#snippet defaultChildren()}▼{/snippet}
<RenderElement tag="span" {componentProps} {params} children={children ?? defaultChildren} />
