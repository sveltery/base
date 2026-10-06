<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { fade } from 'svelte/transition';
  import type { HTMLAttributes } from 'svelte/elements';
  import { Toolbar } from '../../../../packages/base/src/lib/toolbar/index.js';
  import type { HTMLProps } from '../../../../packages/base/src/lib/internals/types.js';
  import type { ToolbarButtonState } from '../../../../packages/base/src/lib/toolbar/types.js';

  // A consumer replaces the actual Toolbar.Button host while the old host outros.
  // The bare binding uses the same native branch and transition lifetime.
  let replacement = $state(false);
  let disabled = $state(false);
  let hydrated = $state(false);
  let ref = $state<HTMLElement | null>();
  let bareRef = $state<HTMLButtonElement | null>();
  const calls: string[] = [];
  onMount(() => {
    hydrated = true;
  });
  function probe(host: HTMLElement) {
    Object.assign(host, {
      nativeButtonOutro: { snapshot: () => ({ ref, bareRef, calls: [...calls] }) },
    });
  }
</script>

{#snippet dynamicHost(props: HTMLProps, _state: ToolbarButtonState, children: Snippet | undefined)}
  {#if replacement}
    <button {...props as HTMLAttributes<HTMLButtonElement>} data-testid="current-toolbar-host">
      {@render children?.()}
    </button>
  {:else}
    <button
      {...props as HTMLAttributes<HTMLButtonElement>}
      data-testid="old-toolbar-host"
      out:fade={{ duration: 1000 }}
    >
      {@render children?.()}
    </button>
  {/if}
{/snippet}
<main data-hydrated={hydrated} {@attach probe}>
  <button type="button" onclick={() => (replacement = true)}>Replace toolbar host</button>
  <button type="button" onclick={() => (disabled = true)}>Disable toolbar button</button>
  <Toolbar.Root>
    <Toolbar.Button bind:ref {disabled} render={dynamicHost} onclick={() => calls.push('activate')}>
      Toolbar children
    </Toolbar.Button>
  </Toolbar.Root>
  {#if replacement}
    <button type="button" bind:this={bareRef} data-testid="current-bare-host">Bare children</button>
  {:else}
    <button
      type="button"
      bind:this={bareRef}
      data-testid="old-bare-host"
      out:fade={{ duration: 1000 }}>Bare children</button
    >
  {/if}
</main>
