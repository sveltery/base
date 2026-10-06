<script lang="ts">
  // Public render/native boundary diagnostic; zero ordinary credit.
  import * as Collapsible from '../../../src/lib/collapsible/index.js';
  import type { Snippet } from 'svelte';
  let { bare = false }: { bare?: boolean } = $props();
</script>

{#snippet host(
  props: Record<string | symbol, unknown>,
  _state: unknown,
  children: Snippet | undefined,
)}
  <div {...props} style={`${props.style};--collapsible-panel-height:73px`}
    >{@render children?.()}</div
  >
{/snippet}
{#if bare}
  <div
    data-testid="dimension-boundary"
    style="--collapsible-panel-height:auto;--collapsible-panel-width:auto;--collapsible-panel-height:73px"
    >Native content</div
  >
{:else}
  <Collapsible.Root
    ><Collapsible.Panel data-testid="dimension-boundary" keepMounted render={host}
      >Native content</Collapsible.Panel
    ></Collapsible.Root
  >
{/if}
