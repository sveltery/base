<script lang="ts">
  import Provider from '../../src/lib/toast/Provider.svelte';
  import Viewport from '../../src/lib/toast/Viewport.svelte';
  import List from './ToastViewportList.svelte';
  import Button from './ToastViewportControls.svelte';
  import type { ToastManager } from '../../src/lib/toast/createToastManager.js';
  let { toastManager, timeout = 5000, limit = 3, showFirstViewport = false }: { toastManager?: ToastManager; timeout?: number; limit?: number; showFirstViewport?: boolean } = $props();
  let firstViewportRemoved = $state(false);
  export function removeFirstViewport() { firstViewportRemoved = true; }
</script>
<Provider {toastManager} {timeout} {limit}>
  {#if showFirstViewport && !firstViewportRemoved}<Viewport data-testid="first-viewport" />{/if}
  <Viewport data-testid="viewport"><List /></Viewport>
  <Button />
</Provider>
