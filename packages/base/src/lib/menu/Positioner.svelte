<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  // Original MenuPositioner context/backdrop/node/list composition (MIT).
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
  new createCompositeList(() => ({
    elementsRef: store.context.itemDomElements,
    labelsRef: store.context.itemLabels,
  }));

  const renderState = $derived(root.element.state);
  const renderSnippet = $derived(props.render);
  const mergedProps = $derived({
    ...mergeComponentProps(
      renderState,
      { class: props.class, style: props.style },
      root.element.props,
      root.element.stateAttributesMapping,
    ),
  });
  const backdropAttachmentKey = createAttachmentKey();
  const backdropProps = $derived({
    [backdropAttachmentKey]: (host: HTMLDivElement) => {
      const owner =
        root.parent.type === 'context-menu' || root.parent.type === 'nested-context-menu'
          ? root.parent.context.internalBackdropRef
          : undefined;
      if (owner) owner.current = host;
      return () => {
        if (owner?.current === host) owner.current = null;
      };
    },
  });
</script>

{#if root.shouldRenderBackdrop}
  <InternalBackdrop {...backdropProps} inert={!root.open} cutout={root.backdropCutout} />
{/if}
{#if renderSnippet}
  {@render renderSnippet(mergedProps, renderState, props.children)}
{:else}
  <div {...mergedProps}>{@render props.children?.()}</div>
{/if}
