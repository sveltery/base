<script lang="ts">
  // Original MenuPositioner context/backdrop/node/list composition (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import InternalBackdrop from '../utils/InternalBackdrop.svelte';
  import { useMenuRootContext } from './root/MenuRootContext.js';
  import { createMenuPositioner } from './positioner/createMenuPositioner.svelte.js';
  import { provideMenuPositionerContext } from './positioner/MenuPositionerContext.js';
  import { provideFloatingNode } from '../floating-ui/components/FloatingTree.svelte.js';
  import { createCompositeList } from '../internals/composite/list/createCompositeList.svelte.js';
  import type { MenuPositionerProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
  let { ref = $bindable(null), ...props }: MenuPositionerProps = $props();
  const { store } = useMenuRootContext();
  const root = createMenuPositioner(
    () => props,
    store,
    (node) => {
      ref = node;
    },
  );
  const context = root.positioner.context;
  if (!context)
    throw new Error('Base UI: Menu.Positioner requires its actual floating root context.');
  provideMenuPositionerContext({
    get side() {
      return root.positioner.side;
    },
    get align() {
      return root.positioner.align;
    },
    arrowRef: root.positioner.arrowRef,
    get arrowUncentered() {
      return root.positioner.arrowUncentered;
    },
    get arrowStyles() {
      return root.positioner.arrowStyles;
    },
    context,
  });
  provideFloatingNode(() => store.select('floatingNodeId'));
  createCompositeList(() => ({
    elementsRef: store.context.itemDomElements,
    labelsRef: store.context.itemLabels,
  }));
</script>

{#if root.shouldRenderBackdrop}
  <InternalBackdrop
    ref={root.parent.type === 'context-menu' || root.parent.type === 'nested-context-menu'
      ? root.parent.context.internalBackdropRef
      : undefined}
    inert={!root.open}
    cutout={root.backdropCutout}
  />
{/if}
<RenderElement
  tag="div"
  componentProps={props}
  params={root.element.params}
  children={props.children}
/>
