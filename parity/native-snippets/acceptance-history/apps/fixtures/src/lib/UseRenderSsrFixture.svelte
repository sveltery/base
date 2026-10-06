<script lang="ts">
  import { onMount } from 'svelte';
  import UseRender from '../../../../packages/base/src/lib/use-render/UseRender.svelte';
  import type { UseRenderTagName } from '../../../../packages/base/src/lib/use-render/types.js';
  let hydrated = $state(false), active = $state(true), enabled = $state(true);
  let element = $state<Element | null | undefined>();
  onMount(() => { hydrated = true; });
  function probe(node: HTMLElement) {
    Object.assign(node, { renderRefProbe: () => element ? { tag: element.tagName, id: element.id, connected: element.isConnected, same: element === node.querySelector('#ssr-render') } : null });
  }
</script>
<main data-hydrated={hydrated} {@attach probe}>
  <button type="button" onclick={() => { active = false; enabled = false; }}>Remove</button>
  <UseRender defaultTagName="button" state={{ active }} props={{ id: 'ssr-render' }} {enabled} bind:element>SSR children</UseRender>
  <UseRender defaultTagName="svg" props={{ id: 'ssr-svg' }}><title>SVG children</title></UseRender>
  <UseRender defaultTagName={null as unknown as UseRenderTagName} props={{ id: 'ssr-null-tag' }} />
  <output id="ssr-ref">{element?.tagName ?? 'none'}</output>
</main>
