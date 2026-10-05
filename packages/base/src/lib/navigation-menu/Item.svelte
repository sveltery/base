<script lang="ts">
  // Original NavigationMenuItem with native nullish ID/context/rendering (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { provideNavigationMenuItemContext } from './item/NavigationMenuItemContext.js';
  import type { NavigationMenuItemProps } from './types.js';
  let {
    // eslint-disable-next-line no-useless-assignment -- Native bind:ref publishes the host.
    ref = $bindable(null),
    value: valueProp,
    render,
    class: classProp,
    style,
    children,
    ...elementProps
  }: NavigationMenuItemProps = $props();
  const id = $props.id();
  const fallbackValue = useBaseUiId(undefined, id);
  const value = $derived(valueProp ?? fallbackValue);
  provideNavigationMenuItemContext({
    get value() {
      return value;
    },
  });
  const componentProps = $derived({ render, class: classProp, style });
  const refs = [
    (node: HTMLElement | null) => {
      ref = node;
    },
  ];
  const params = $derived({ ref: refs, props: elementProps });
</script>
<RenderElement tag="li" {componentProps} {params} {children} />
