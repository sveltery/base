<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Original MenuBackdrop complete transition/context-ref/render business (MIT).
  import { useMenuRootContext } from './root/MenuRootContext.js';
  import { popupTransitionStateMapping } from '../utils/popupStateMapping.js';
  import { useContextMenuRootContext } from '../context-menu/root/ContextMenuRootContext.js';
  import { REASONS } from '../internals/reasons.js';
  import type { MenuBackdropProps } from './types.js';
  let {
    render,
    class: className,
    style,
    children,
    // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
    ref = $bindable(null),
    ...elementProps
  }: MenuBackdropProps = $props();
  const { store } = useMenuRootContext();
  const open = $derived(store.useState('open'));
  const mounted = $derived(store.useState('mounted'));
  const transitionStatus = $derived(store.useState('transitionStatus'));
  const lastOpenChangeReason = $derived(store.useState('lastOpenChangeReason'));
  const context = useContextMenuRootContext();
  const componentState = $derived({ open, transitionStatus });

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      const backdropRef = context?.backdropRef;
      if (backdropRef) backdropRef.current = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          if (backdropRef?.current === host) backdropRef.current = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      componentState,
      { class: className, style: style },
      [
        {
          role: 'presentation',
          hidden: !mounted,
          style: {
            pointerEvents: lastOpenChangeReason === REASONS.triggerHover ? 'none' : undefined,
            userSelect: 'none',
            WebkitUserSelect: 'none',
          },
        },
        elementProps,
      ],
      popupTransitionStateMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, componentState, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
