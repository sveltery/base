<script lang="ts">
  // Original NavigationMenuItem with native nullish ID/context/rendering (MIT).
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { provideNavigationMenuItemContext } from './item/NavigationMenuItemContext.js';
  import type { NavigationMenuItemProps } from './types.js';
  let {
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
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;

      return () =>
        untrack(() => {
          if (ref === host) ref = null;
        });
    });
  }
  const params = $derived({ props: elementProps });
  const mergedProps = $derived({
    ...mergeComponentProps({}, { class: classProp, style }, params.props, undefined),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}{@render render(mergedProps, {}, children)}{:else}<li {...mergedProps}
    >{@render children?.()}</li
  >{/if}
