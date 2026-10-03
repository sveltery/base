<script lang="ts">
  // Original FloatingFocusManager composition; business body remains in its native setup helper (MIT).
  import type { Snippet } from 'svelte';
  import FocusGuard from '../../utils/FocusGuard.svelte';
  import { createFloatingFocusManager, type FloatingFocusManagerProps } from './createFloatingFocusManager.svelte.js';
  let { children, ...props }: FloatingFocusManagerProps & { children?: Snippet } = $props();
  const manager = createFloatingFocusManager(() => props);
</script>
<!-- Source onFocus delegates native focusin, after the Portal capture listener restores tabindex. -->
{#if manager.shouldRenderGuards}<FocusGuard data-type="inside" ref={manager.beforeRef} onfocusin={manager.onBeforeFocus}/>{/if}
{@render children?.()}
{#if manager.shouldRenderGuards}<FocusGuard data-type="inside" ref={manager.afterRef} onfocusin={manager.onAfterFocus}/>{/if}
