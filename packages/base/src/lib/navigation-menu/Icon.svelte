<script lang="ts">
  // Original NavigationMenuIcon active Item state and default glyph (MIT).
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import { useNavigationMenuRootContext } from './root/NavigationMenuRootContext.js';
  import { useNavigationMenuItemContext } from './item/NavigationMenuItemContext.js';
  import { triggerOpenStateMapping } from '../utils/popupStateMapping.js';
  import type { NavigationMenuIconProps } from './types.js';
  let {
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
  const params = $derived({
    state,
    props: [{ 'aria-hidden': true }, elementProps],
    stateAttributesMapping: triggerOpenStateMapping,
  });
  const mergedProps = $derived({
    ...mergeComponentProps(
      state,
      { class: classProp, style },
      params.props,
      params.stateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#snippet defaultChildren()}▼{/snippet}
{#if render}{@render render(mergedProps, state, children ?? defaultChildren)}{:else}<span
    {...mergedProps}>{@render (children ?? defaultChildren)?.()}</span
  >{/if}
