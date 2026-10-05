<script lang="ts">
  // Original NavigationMenuBackdrop state/hidden/user-selection branches (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { useNavigationMenuRootContext } from './root/NavigationMenuRootContext.js';
  import { popupTransitionStateMapping } from '../utils/popupStateMapping.js';
  import type { NavigationMenuBackdropProps } from './types.js';
  let {
    // eslint-disable-next-line no-useless-assignment -- Native bind:ref publishes the host.
    ref = $bindable(null),
    render,
    class: classProp,
    style,
    children,
    ...elementProps
  }: NavigationMenuBackdropProps = $props();
  const root = useNavigationMenuRootContext();
  const state = $derived({ open: root.open, transitionStatus: root.transitionStatus });
  const componentProps = $derived({ render, class: classProp, style });
  const refs = [
    (node: HTMLElement | null) => {
      ref = node;
    },
  ];
  const params = $derived({
    state,
    ref: refs,
    props: [
      {
        role: 'presentation',
        hidden: !root.mounted,
        style: { userSelect: 'none', WebkitUserSelect: 'none' },
      },
      elementProps,
    ],
    stateAttributesMapping: popupTransitionStateMapping,
  });
</script>
<RenderElement tag="div" {componentProps} {params} {children} />
