<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Original MenuArrow positioned-context/state/render business (MIT).
  import { useMenuPositionerContext } from './positioner/MenuPositionerContext.js';
  import { useMenuRootContext } from './root/MenuRootContext.js';
  import { popupStateMapping } from '../utils/popupStateMapping.js';
  import type { MenuArrowProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
  let {
    render,
    class: className,
    style,
    children,
    ref = $bindable(null),
    ...elementProps
  }: MenuArrowProps = $props();
  const { store } = useMenuRootContext();
  const positioner = useMenuPositionerContext();
  const componentState = $derived({
    open: store.useState('open'),
    side: positioner.side,
    align: positioner.align,
    uncentered: positioner.arrowUncentered,
  });
  const setRef = (node: HTMLElement | null) => {
    ref = node;
  };

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      positioner.arrowRef.current = host;
      ref = host;
      return () =>
        untrack(() => {
          if (positioner.arrowRef.current === host)
            positioner.arrowRef.current = null;
          if (ref === host) ref = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      componentState,
      { class: className, style: style },
      { style: positioner.arrowStyles, 'aria-hidden': true, ...elementProps },
      popupStateMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, componentState, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
