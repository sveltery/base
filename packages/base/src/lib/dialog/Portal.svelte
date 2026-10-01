<script lang="ts">
  import { getContext, onMount, setContext } from 'svelte';
  import Element from './Element.svelte';
  import { PORTAL, root } from './context.js';
  import type { PortalContext } from './context.js';
  import type { ElementProps } from './types.js';
  let { children, render, keepMounted = false, container, ref = $bindable(null), ...props }: ElementProps & { keepMounted?: boolean; container?: HTMLElement | ShadowRoot | { current: HTMLElement | ShadowRoot | null } | null } = $props();
  const controller = root();
  const parent = getContext<PortalContext | undefined>(PORTAL);
  const context: PortalContext = { get keepMounted() { return keepMounted; }, node: null };
  setContext(PORTAL, context);
  // Portals produce no server DOM. The attachment preserves logical Svelte context.
  let client = $state(false);
  onMount(() => { client = true; });
  const target = $derived(container === undefined ? undefined : container && 'current' in container ? container.current : container);
  function attach(node: HTMLElement) {
    context.node = node;
    return $effect.root(() => {
      $effect(() => {
        const destination = target === undefined ? parent?.node ?? node.ownerDocument.body : target;
        if (destination) destination.appendChild(node);
        return () => { node.remove(); };
      });
      $effect(() => () => { context.node = null; });
    });
  }
  function internal(node: HTMLElement) { controller.internalBackdrop = node; return () => { if (controller.internalBackdrop === node) controller.internalBackdrop = null; }; }
</script>
{#if client && target !== null && (controller.mounted || keepMounted)}
  <Element internal={{ 'data-base-ui-portal': '' }} {props} {render} bind:ref {attach}>
    {#if controller.mounted && controller.modal === true}
      <div data-base-ui-internal-backdrop="" inert={!controller.open} style="position:fixed;inset:0;user-select:none" {@attach internal}></div>
    {/if}
    {@render children?.()}
  </Element>
{/if}
