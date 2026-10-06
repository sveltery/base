<!-- Authored native host/outro lifetime witness; zero unchanged Original assertion credit. -->
<script lang="ts">
  import { fade } from 'svelte/transition';
  import { Menu } from '@sveltery/base/menu';
  const handle = Menu.createHandle();
  let swapped = $state(false);
  let shown = $state(true);
  let host = $state.raw<HTMLElement | null>(null);
  let previousHost: HTMLElement | null = null;
  let oldOutroEnded = $state(false);

  export function swapHost() {
    previousHost = host;
    swapped = true;
  }
  export function removeTrigger() {
    shown = false;
  }
  export function snapshot() {
    const registered = handle.store.context.triggerElements.getById('host-overlap-trigger');
    return {
      boundHost: host?.dataset.host ?? null,
      registeredHost: (registered as HTMLElement | undefined)?.dataset.host ?? null,
      oldOutroEnded,
      beforeConnected: previousHost?.isConnected ?? false,
      currentConnected: host?.isConnected ?? false,
    };
  }
  export function boundHost() {
    return host;
  }
  export function triggerMap() {
    return handle.store.context.triggerElements;
  }
  export function didOldOutroEnd() {
    return oldOutroEnded;
  }
</script>

<Menu.Root {handle}>
  {#if shown}<Menu.Trigger id="host-overlap-trigger" nativeButton={false} bind:ref={host}>
      {#snippet render(props)}
        {#if swapped}
          <a {...props} href="#host-overlap" data-host="after">Open</a>
        {:else}
          <button
            {...props}
            type="button"
            data-host="before"
            out:fade={{ duration: 800 }}
            onoutroend={() => (oldOutroEnded = true)}>Open</button
          >
        {/if}
      {/snippet}
    </Menu.Trigger>{/if}
</Menu.Root>
