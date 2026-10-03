<script lang="ts">
  import Element from './Element.svelte';
  import { root } from './context.js';
  import type { DialogBackdropProps, DialogBackdropState } from './types.js';
  let { children, render, forceRender = false, ref = $bindable(), ...props }: DialogBackdropProps = $props();
  const controller = root();
  const state: DialogBackdropState = $derived({ open: controller.open, transitionStatus: controller.state.transitionStatus });
  function attach(node: HTMLElement) { controller.backdrop = node; return () => { if (controller.backdrop === node) controller.backdrop = null; }; }
</script>
{#if !controller.parent || forceRender}
  <Element internal={{ role: 'presentation', hidden: !controller.mounted, style: { userSelect: 'none' }, 'data-open': controller.open ? '' : undefined, 'data-closed': !controller.open ? '' : undefined, 'data-starting-style': controller.starting ? '' : undefined, 'data-ending-style': controller.exiting ? '' : undefined }} {props} {state} {render} {children} bind:ref {attach}/>
{/if}
