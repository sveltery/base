<script lang="ts">
  import { untrack } from 'svelte';
  import UseRender from '../../src/lib/use-render/UseRender.svelte';
  import type { UseRenderHostProps, UseRenderRef } from '../../src/lib/use-render/types.js';
  type Mode = 'default' | 'span' | 'section' | 'same-span';
  let { start = 'default', callback }: { start?: Mode; callback: UseRenderRef } = $props();
  let mode = $state(untrack(() => start));
  export function setMode(value: Mode) { mode = value; }
</script>
{#snippet span(supplied: UseRenderHostProps)}<span {...supplied}></span>{/snippet}
{#snippet section(supplied: UseRenderHostProps)}<section {...supplied}></section>{/snippet}
{#snippet sameSpan(supplied: UseRenderHostProps)}<span {...supplied}></span>{/snippet}
<UseRender ref={callback} props={{ class: 'before' }} render={mode === 'span' ? span : mode === 'section' ? section : mode === 'same-span' ? sameSpan : undefined} />
