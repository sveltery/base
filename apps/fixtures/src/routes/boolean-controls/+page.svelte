<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/BooleanControlsBrowserFixture.svelte';
  import NativeResetFixture from '../../lib/NativeCheckboxResetFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLElement>();
  onMount(() => {
    if (!data.reference || !host) return;
    const node = host;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/boolean-controls-reference.js').then(
      ({ mountBooleanReference }) => {
        if (!disposed) cleanup = mountBooleanReference(node, data.family, data.scenario);
      },
    );
    return () => {
      disposed = true;
      cleanup?.();
    };
  });
</script>
{#if data.reference}<section bind:this={host}></section>
{:else if data.scenario === 'literal-bind-reset'}<NativeResetFixture />
{:else}<Fixture family={data.family} scenario={data.scenario} />{/if}

<style>
  :global([data-control]), :global([data-parent-control]), :global([data-child]) { display: inline-block; min-width: 40px; min-height: 30px; border: 1px solid; margin: 8px; }
  :global([data-part]) { display: block; width: 16px; height: 16px; }
</style>
