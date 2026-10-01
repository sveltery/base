<script lang="ts">
  import { Provider } from '../../src/lib/toast/index.js';
  import ToastRootList from './ToastRootList.svelte';
  import type { ToastProviderContext } from '../../src/lib/toast/context.js';
  let { capture, indexKeys = false }: { capture: (context: ToastProviderContext) => void; indexKeys?: boolean } = $props();
</script>
<Provider timeout={0}><ToastRootList {capture} {indexKeys}/></Provider>
