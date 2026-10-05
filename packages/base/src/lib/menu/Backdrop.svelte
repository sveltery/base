<script lang="ts">
  // Original MenuBackdrop complete transition/context-ref/render business (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
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
  const setRef = (node: HTMLElement | null) => {
    ref = node;
  };
</script>

<RenderElement
  tag="div"
  componentProps={{ render, class: className, style }}
  params={{
    state: componentState,
    stateAttributesMapping: popupTransitionStateMapping,
    ref: context?.backdropRef ? [setRef, context.backdropRef] : setRef,
    props: [
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
  }}
  {children}
/>
