<script lang="ts">
  import { Toast } from '@sveltery/base';
  const manager = Toast.getToastManager();
</script>
<Toast.Viewport data-testid="viewport">
  {#each manager.toasts as toast (toast.id)}
    <Toast.Root {toast} swipeDirection={[]}><Toast.Title /><Toast.Close>Close toast</Toast.Close></Toast.Root>
  {/each}
</Toast.Viewport>
