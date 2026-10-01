<script lang="ts">
  import { Provider } from '../../src/lib/toast/index.js';
  import ToastRootList from './ToastRootList.svelte';
  import type { ToastProviderContext } from '../../src/lib/toast/context.js';
  let { capture, indexKeys = false, withContent = true }: { capture: (context: ToastProviderContext) => void; indexKeys?: boolean; withContent?: boolean } = $props();
  let showRoots = $state(true);
  export function hideRoots() { showRoots = false; }
</script>
<Provider timeout={0}><ToastRootList {capture} {indexKeys} {showRoots} {withContent}/></Provider>
