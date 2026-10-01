<script lang="ts">
  // Derived from Base UI 1.8.0 ToastPortal/FloatingPortalLite/useFloatingPortalNode
  // at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import { getAllContexts, getContext, mount, unmount, untrack } from 'svelte';
  import Element from '../dialog/Element.svelte';
  import { PORTAL, type PortalContext } from '../dialog/context.js';
  import RenderContent from './RenderContent.svelte';
  import type { ToastPortalProps, ToastPortalState } from './types.js';
  let { children, container, render, ref = $bindable(null), ...props }: ToastPortalProps = $props();
  const context = getAllContexts();
  const parent = getContext<PortalContext | undefined>(PORTAL);
  const generated = $props.id();
  let portalNode = $state.raw<HTMLElement | null>(null);
  function attach(node: HTMLElement) {
    portalNode = node;
    return () => { if (portalNode === node) portalNode = null; };
  }
  function isContainerNode(value: NonNullable<ToastPortalProps['container']>): value is HTMLElement | ShadowRoot {
    return 'ownerDocument' in value && value instanceof (value.ownerDocument.defaultView?.Node ?? Node);
  }
  // Like the pinned hook, resolve a ref only when its object (or parent) changes.
  // Explicit null waits; a null ref.current instead uses the parent/body fallback.
  // Effects do not execute during SSR. Mount the whole replacement subtree so
  // wrapping render snippets stay in the destination alongside the actual node.
  const destination = $derived.by(() => {
    const containerProp = container;
    const parentNode = parent?.node;
    if (containerProp === null) return null;
    return (containerProp && (isContainerNode(containerProp)
      ? containerProp : untrack(() => containerProp.current))) ?? parentNode ?? document.body;
  });
  $effect(() => {
    const target = destination;
    if (!target) return;
    const instance = untrack(() => mount(Element<ToastPortalState>, {
      target,
      context,
      props: {
        internal: { id: `base-ui-${generated}`, 'data-base-ui-portal': '' },
        get props() { return props; },
        get render() { return render; },
        get ref() { return ref; },
        set ref(value) { ref = value; },
        attach,
      },
    }));
    return () => { void unmount(instance); };
  });
  // FloatingPortalLite portals children into the actual rendered/ref element,
  // even when the replacement ignores the children argument or wraps that node.
  $effect(() => {
    const node = portalNode;
    if (!node) return;
    const instance = untrack(() => mount(RenderContent, {
      target: node, context, props: { get content() { return children; } },
    }));
    return () => { void unmount(instance); };
  });
</script>
