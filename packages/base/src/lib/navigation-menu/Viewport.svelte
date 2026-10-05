<script lang="ts">
  // Original NavigationMenuViewport registrations, focus/inert and Guards placement (MIT).
  import { createRefAttachment } from '../internals/nativeRefAttachment.js';
  import RenderElement from '../internals/RenderElement.svelte';
  import { useIsoLayoutEffect } from '../utils/useIsoLayoutEffect.svelte.js';
  import { useId } from '../utils/useId.js';
  import { contains } from '../floating-ui/utils/element.js';
  import { getEmptyRootContext } from '../floating-ui/utils/getEmptyRootContext.js';
  import { useNavigationMenuRootContext } from './root/NavigationMenuRootContext.js';
  import { useNavigationMenuPositionerContext } from './positioner/NavigationMenuPositionerContext.js';
  import Guards from './viewport/Guards.svelte';
  import type { NavigationMenuViewportProps } from './types.js';
  const EMPTY_ROOT_CONTEXT = getEmptyRootContext();
  let {
    // eslint-disable-next-line no-useless-assignment -- Native bind:ref publishes the host.
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
  useIsoLayoutEffect(
    () => {
      if (domReference) root.prevTriggerElementRef.current = domReference;
    },
    () => [domReference],
  );
  const targetRef = createRefAttachment<HTMLDivElement>(() => {});
  const targetAttachment = targetRef(root.setViewportTargetElement);
  const componentProps = $derived({ render, class: classProp, style });
  const refs = [
    (node: HTMLElement | null) => {
      ref = node;
      root.setViewportElement(node);
    },
  ];
  const params = $derived({
    ref: refs,
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
</script>
{#snippet innerChildren()}
  {#if hasPositioner}{@render children?.()}{:else}<Guards><div {@attach targetAttachment}>{@render children?.()}</div></Guards>{/if}
{/snippet}
{#snippet viewport()}
  <RenderElement tag="div" {componentProps} {params} children={innerChildren} />
{/snippet}
{#if hasPositioner}<Guards>{@render viewport()}</Guards>{:else}{@render viewport()}{/if}
