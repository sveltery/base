<script lang="ts">
  // Original NavigationMenuViewport registrations, focus/inert and Guards placement (MIT).
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';

  import { useId } from '@sveltery/utils/useId';
  import { contains } from '../floating-ui/utils/element.js';
  import { getEmptyRootContext } from '../floating-ui/utils/getEmptyRootContext.js';
  import { useNavigationMenuRootContext } from './root/NavigationMenuRootContext.js';
  import { useNavigationMenuPositionerContext } from './positioner/NavigationMenuPositionerContext.js';
  import Guards from './viewport/Guards.svelte';
  import type { NavigationMenuViewportProps } from './types.js';
  const EMPTY_ROOT_CONTEXT = getEmptyRootContext();
  let {
    ref = $bindable(null),
    render,
    class: classProp,
    style,
    children,
    id: idProp,
    ...elementProps
  }: NavigationMenuViewportProps = $props();
  const nativeId = $props.id();
  const id = $derived(useId(idProp ?? undefined, undefined, nativeId));
  const root = useNavigationMenuRootContext();
  const hasPositioner = Boolean(useNavigationMenuPositionerContext(true));
  const domReference = $derived(
    (root.floatingRootContext || EMPTY_ROOT_CONTEXT).useState('domReferenceElement'),
  );
  $effect(() => {
    if (domReference) root.prevTriggerElementRef.current = domReference;
  });
  function attachTarget(host: HTMLDivElement) {
    root.setViewportTargetElement(host);
    return () => {
      if (root.viewportTargetElement === host) root.setViewportTargetElement(null);
    };
  }
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      root.setViewportElement(host);

      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          if (root.viewportElement === host) root.setViewportElement(null);
        });
    });
  }
  const params = $derived({
    props: [
      {
        id,
        onfocusout(event: FocusEvent) {
          const relatedTarget = event.relatedTarget as Element | null;
          if (
            relatedTarget &&
            !contains(event.currentTarget as Element, relatedTarget) &&
            relatedTarget !== domReference
          )
            root.setViewportInert(true);
        },
        ...(!hasPositioner && root.viewportInert && { inert: true }),
      },
      elementProps,
    ],
  });
  const mergedProps = $derived({
    ...mergeComponentProps({}, { class: classProp, style }, params.props, undefined),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#snippet innerChildren()}
  {#if hasPositioner}{@render children?.()}{:else}<Guards
      ><div {@attach attachTarget}>{@render children?.()}</div></Guards
    >{/if}
{/snippet}
{#snippet viewport()}
  {#if render}{@render render(mergedProps, {}, innerChildren)}{:else}<div {...mergedProps}
      >{@render innerChildren?.()}</div
    >{/if}
{/snippet}
{#if hasPositioner}<Guards>{@render viewport()}</Guards>{:else}{@render viewport()}{/if}
