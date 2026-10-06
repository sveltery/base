<script lang="ts">
  import { createAttachmentKey } from 'svelte/attachments';
  // Original Menubar and MenubarContent complete Composite/context/tree business (MIT).
  import CompositeRoot from '../internals/composite/root/CompositeRoot.svelte';
  import {
    provideFloatingTree,
    useFloatingNodeId,
    provideFloatingNode,
  } from '../floating-ui/components/FloatingTree.svelte.js';
  import { provideMenubarContext, type MenubarContext } from './MenubarContext.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';

  import { REASONS } from '../internals/reasons.js';
  import type { MenubarProps } from './types.js';
  import type { MenuRoot } from '../menu/types.js';
  let {
    orientation = 'horizontal',
    loopFocus = true,
    render,
    class: className,
    modal = true,
    disabled = false,
    id: idProp,
    style,
    children,
    // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
    ref = $bindable(null),
    ...elementProps
  }: MenubarProps = $props();
  let contentElement = $state.raw<HTMLElement | null>(null);
  let hasSubmenuOpen = $state(false);
  const generatedId = $props.id();
  const id = $derived(useBaseUiId(idProp ?? undefined, generatedId));
  const componentState = $derived({ orientation, modal, hasSubmenuOpen });
  const contentRef = { current: null as HTMLElement | null };
  const allowMouseUpTriggerRef = { current: false };
  const context: MenubarContext = {
    get contentElement() {
      return contentElement;
    },
    setContentElement(element) {
      contentElement = element;
    },
    get hasSubmenuOpen() {
      return hasSubmenuOpen;
    },
    setHasSubmenuOpen(open) {
      hasSubmenuOpen = open;
    },
    get modal() {
      return modal;
    },
    get disabled() {
      return disabled;
    },
    get orientation() {
      return orientation;
    },
    allowMouseUpTriggerRef,
    get rootId() {
      return id;
    },
  };
  provideMenubarContext(context);
  const tree = provideFloatingTree();
  const nodeId = useFloatingNodeId(`${generatedId}-node`, tree);
  provideFloatingNode(() => nodeId);
  $effect(() => {
    function onSubmenuOpenChange(details: {
      open: boolean;
      reason: MenuRoot.ChangeEventReason | null;
      nodeId: string | undefined;
      parentNodeId: string | null;
    }) {
      if (!details.nodeId || details.parentNodeId !== nodeId) return;
      if (details.open) {
        if (!context.hasSubmenuOpen) context.setHasSubmenuOpen(true);
      } else if (
        details.reason !== REASONS.siblingOpen &&
        details.reason !== REASONS.listNavigation
      ) {
        context.setHasSubmenuOpen(false);
      }
    }
    tree.events.on('menuopenchange', onSubmenuOpenChange);
    return () => {
      tree.events.off('menuopenchange', onSubmenuOpenChange);
    };
  });
  const stateAttributesMapping = {
    hasSubmenuOpen(value: boolean) {
      return value ? { 'data-has-submenu-open': '' } : null;
    },
  };
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    contentRef.current = host;
    context.setContentElement(host);
    return () => {
      context.setContentElement(null);
      if (contentRef.current === host) contentRef.current = null;
    };
  }
</script>

<CompositeRoot
  {render}
  class={className}
  {style}
  state={componentState}
  {stateAttributesMapping}
  bind:ref
  props={[
    { role: 'menubar', id, 'aria-orientation': orientation },
    elementProps,
    { [hostAttachmentKey]: attachHost },
  ]}
  {orientation}
  {loopFocus}
  enableHomeAndEndKeys={true}
  highlightItemOnHover={hasSubmenuOpen}
  {children}
/>
