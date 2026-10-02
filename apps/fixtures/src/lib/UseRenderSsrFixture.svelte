<script lang="ts">
  import { onMount } from 'svelte';
  import UseRender from '../../../../packages/base/src/lib/use-render/UseRender.svelte';
  let hydrated = $state(false), active = $state(true), enabled = $state(true);
  let element = $state<Element | null | undefined>();
  onMount(() => { hydrated = true; });
</script>
<main data-hydrated={hydrated}>
  <button type="button" onclick={() => { active = false; enabled = false; }}>Remove</button>
  <UseRender defaultTagName="button" state={{ active }} props={{ id: 'ssr-render' }} {enabled} bind:element>SSR children</UseRender>
  <UseRender defaultTagName="svg" props={{ id: 'ssr-svg' }}><title>SVG children</title></UseRender>
  <output id="ssr-ref">{element?.tagName ?? 'none'}</output>
</main>
