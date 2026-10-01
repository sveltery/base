<script lang="ts">
  // U:56 fixture adaptation. MIT: parity/toast/UPSTREAM_LICENSE.
  import { Toast } from '@sveltery/base';
  let { label, title }: { label: string; title: string } = $props();
  const manager = Toast.getToastManager();
  let id: string | undefined;
</script>
<Toast.Viewport>
  {#each manager.toasts as toast (toast.id)}
    <Toast.Root {toast} swipeDirection={[]}><Toast.Title>{toast.title}</Toast.Title></Toast.Root>
  {/each}
</Toast.Viewport>
<button onclick={() => { id = manager.add({ title }); }}>add {label}</button>
<button onclick={() => { if (id) manager.update(id, { title: `${title} updated` }); }}>update {label}</button>
