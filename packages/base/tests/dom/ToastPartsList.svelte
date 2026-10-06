<script lang="ts">
  // Native adaptation of pinned toast/utils/test-utils.tsx List and Button; MIT.
  import * as Toast from '../../src/lib/toast/index.js';
  import { untrack } from 'svelte';
  import type { PreventableEvent } from '../../src/lib/merge-props/index.js';
  import type { ToastManagerAddOptions, ToastManagerFacade } from '../../src/lib/toast/types.js';
  let {
    options,
    expose,
    onCloseClick,
  }: {
    options?: ToastManagerAddOptions<object>;
    expose: (manager: ToastManagerFacade) => void;
    onCloseClick?: (event: MouseEvent & PreventableEvent) => void;
  } = $props();
  const manager = Toast.getToastManager();
  untrack(() => expose(manager));
</script>

<Toast.Viewport data-testid="viewport">
  {#each manager.toasts as toast (toast.id)}
    <Toast.Root {toast} swipeDirection={[]} data-testid="root">
      <Toast.Title data-testid="title" />
      <Toast.Description data-testid="description" />
      <Toast.Close aria-label="close-press" onclick={onCloseClick} />
      <Toast.Action data-testid="action" />
    </Toast.Root>
  {/each}
</Toast.Viewport>
<button
  type="button"
  onclick={() =>
    manager.add(
      options ?? {
        title: 'title',
        description: 'description',
        actionProps: { id: 'action', children: 'action' },
      },
    )}>add</button
>
