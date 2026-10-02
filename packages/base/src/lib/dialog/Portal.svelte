<script lang="ts">
  import { getContext, onMount, setContext } from 'svelte';
  import Element from './Element.svelte';
  import { PORTAL, root } from './context.js';
  import type { PortalContext, PortalFocusManager } from './context.js';
  import { preserveTabOrder } from '../overlay/portal-focus.js';
  import type { ElementProps } from './types.js';
  let { children, render, keepMounted = false, container, ref = $bindable(), ...props }: ElementProps & { keepMounted?: boolean; container?: HTMLElement | ShadowRoot | { current: HTMLElement | ShadowRoot | null } | null } = $props();
  const controller = root();
  const parent = getContext<PortalContext | undefined>(PORTAL);
  let focusManager = $state.raw<PortalFocusManager | null>(null);
  const context: PortalContext = { get keepMounted() { return keepMounted; }, node: null,
    get focusManager() { return focusManager; }, set focusManager(value) { focusManager = value; } };
  setContext(PORTAL, context);
  // Portals produce no server DOM. The attachment preserves logical Svelte context.
  let client = $state(false);
  onMount(() => { client = true; });
  function isContainerNode(value: HTMLElement | ShadowRoot | { current: HTMLElement | ShadowRoot | null }): value is HTMLElement | ShadowRoot {
    return 'ownerDocument' in value && value instanceof (value.ownerDocument?.defaultView?.Node ?? Node);
  }
  // Explicit null waits; an empty ref falls back to the inherited Portal/body.
  const target = $derived(container === undefined ? undefined : container === null ? null : isContainerNode(container) ? container : container.current ?? undefined);
  function attach(node: HTMLElement) {
    context.node = node;
    const position = node.ownerDocument.createComment('Dialog.Portal');
    node.before(position);
    const stop = $effect.root(() => {
      $effect(() => {
        const destination = target === undefined ? parent?.node ?? node.ownerDocument.body : target;
        if (destination) destination.appendChild(node);
        return () => { node.remove(); };
      });
      $effect(() => {
        const manager = context.focusManager;
        if (controller.open && controller.modal === false && manager) return preserveTabOrder(node, position, manager);
      });
      $effect(() => () => { context.node = null; });
    });
    return () => { stop(); position.remove(); };
  }
  function internal(node: HTMLElement) { controller.internalBackdrop = node; return () => { if (controller.internalBackdrop === node) controller.internalBackdrop = null; }; }
</script>
{#if client && target !== null && (controller.mounted || keepMounted)}
  <Element internal={{ 'data-base-ui-portal': '' }} {props} {render} bind:ref {attach}>
    {#if controller.mounted && controller.modal === true}
      <div role="presentation" data-base-ui-inert="" data-base-ui-internal-backdrop="" inert={!controller.open} style="position:fixed;inset:0;user-select:none;-webkit-user-select:none" {@attach internal}></div>
    {/if}
    {@render children?.()}
  </Element>
{/if}
