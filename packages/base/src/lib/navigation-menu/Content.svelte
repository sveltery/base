<script lang="ts">
  // Original NavigationMenuContent presence, sizing-owner and relocation branches (MIT).
  import { getAllContexts } from 'svelte';
  import CompositeRoot from '../internals/composite/root/CompositeRoot.svelte';
  import { contains, getTarget } from '../floating-ui/utils/element.js';
  import { useFloatingPortalContent } from '../floating-ui/hooks/useFloatingPortalNode.svelte.js';
  import { useIsoLayoutEffect } from '../utils/useIsoLayoutEffect.svelte.js';
  import { useTransitionStatus } from '../internals/useTransitionStatus.svelte.js';
  import { useOpenChangeComplete } from '../internals/useOpenChangeComplete.svelte.js';
  import { transitionStatusMapping } from '../internals/stateAttributesMapping.js';
  import { popupStateMapping } from '../utils/popupStateMapping.js';
  import {
    useNavigationMenuRootContext,
    useNavigationMenuTreeContext,
  } from './root/NavigationMenuRootContext.js';
  import { useNavigationMenuItemContext } from './item/NavigationMenuItemContext.js';
  import ContentProvider from './content/ContentProvider.svelte';
  import * as NavigationMenuContentDataAttributes from './content/NavigationMenuContentDataAttributes.js';
  import type { NavigationMenuContentProps, NavigationMenuContentState } from './types.js';
  import type { StateAttributesMapping } from '../internals/getStateAttributesProps.js';
  import type { HTMLProps } from '../internals/types.js';
  let {
    // eslint-disable-next-line no-useless-assignment -- Native bind:ref publishes the host.
    ref = $bindable(null),
    render,
    class: classProp,
    style,
    children,
    keepMounted = false,
    ...elementProps
  }: NavigationMenuContentProps = $props();
  const root = useNavigationMenuRootContext();
  const item = useNavigationMenuItemContext();
  const nodeId = useNavigationMenuTreeContext();
  const open = $derived(root.mounted && root.value === item.value);
  let element = $state.raw<HTMLDivElement | null>(null);
  let hasMountedInPortal = $state(false);
  let focusInside = $state(false);
  const presence = useTransitionStatus(() => open);
  $effect.pre(() => {
    if (presence.mounted && !root.mounted) presence.setMounted(false);
  });
  useOpenChangeComplete({
    ref: {
      get current() {
        return element;
      },
    },
    get open() {
      return open;
    },
    onComplete() {
      if (!open) presence.setMounted(false);
    },
  });
  useIsoLayoutEffect(
    () => {
      if (open && element) root.currentContentRef.current = element;
    },
    () => [open, element],
  );
  const partState = $derived({
    open,
    transitionStatus: presence.transitionStatus,
    activationDirection: root.activationDirection,
  });
  const stateAttributesMapping: StateAttributesMapping<NavigationMenuContentState> = {
    ...popupStateMapping,
    ...transitionStatusMapping,
    activationDirection(value) {
      return value ? { [NavigationMenuContentDataAttributes.activationDirection]: value } : null;
    },
  };
  function handleCurrentContentRef(node: HTMLElement | null) {
    element = node as HTMLDivElement | null;
    ref = node;
    if (node && open) root.currentContentRef.current = node as HTMLDivElement;
  }
  const commonProps: HTMLProps = {
    onfocusin(event: FocusEvent) {
      const target = getTarget(event) as Element | null;
      if (!target?.hasAttribute('data-base-ui-focus-guard')) focusInside = true;
    },
    onfocusout(event: FocusEvent) {
      if (!contains(event.currentTarget as Element, event.relatedTarget as Element | null))
        focusInside = false;
    },
  };
  const defaultProps = $derived(
    !open && presence.mounted
      ? { style: { position: 'absolute', top: 0, left: 0 }, inert: !focusInside, ...commonProps }
      : commonProps,
  );
  const portalContainer = $derived(root.viewportTargetElement || root.viewportElement);
  const hidden = $derived(keepMounted && !presence.mounted);
  const shouldRenderInline = $derived(keepMounted && !portalContainer && !hasMountedInPortal);
  $effect.pre(() => {
    if (keepMounted && portalContainer && !hasMountedInPortal) hasMountedInPortal = true;
  });
  const shouldPortal = $derived(Boolean(portalContainer) && (presence.mounted || keepMounted));
  const refs = [handleCurrentContentRef];
  const inlineRefs = [
    (node: HTMLElement | null) => {
      ref = node;
    },
  ];
  // Captured logical context is the native replacement for React createPortal inheritance.
  useFloatingPortalContent(
    () => (shouldPortal ? portalContainer : null),
    () => portalContent,
    getAllContexts(),
  );
</script>
{#snippet portalContent()}
  {#if shouldPortal}
    <ContentProvider {nodeId}>
      <CompositeRoot {render} class={classProp} {style} state={partState} {refs} props={[defaultProps, hidden ? { hidden: true } : {}, elementProps]} {stateAttributesMapping} {children} />
    </ContentProvider>
  {/if}
{/snippet}
{#if shouldRenderInline}
  <CompositeRoot {render} class={classProp} {style} state={partState} refs={inlineRefs} props={[defaultProps, { hidden: true }, elementProps]} {stateAttributesMapping} {children} />
{/if}
