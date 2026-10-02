<script lang="ts">
  import { onMount, mount } from 'svelte';
  import AccordionFixture from '../../lib/AccordionFixture.svelte';
  import AccordionSharedHostFixture from '../../lib/AccordionSharedHostFixture.svelte';
  import AccordionConformanceFixture from '../../lib/AccordionConformanceFixture.svelte';
  let { data } = $props(); let host = $state<HTMLDivElement>(), error = $state(''), contextReady = $state(false);
  onMount(() => {
    if (!data.scenario.startsWith('outside-') || !host) return;
    const target = host;
    void import('../../../../../packages/base/src/lib/accordion/index.js').then(({ Item, Header }) => { try { mount(data.scenario === 'outside-item' ? Item : Header, { target }); } catch (caught) { error = (caught as Error).message; } contextReady = true; });
  });
</script>
{#if data.scenario.startsWith('outside-')}<main data-hydrated={contextReady}><div bind:this={host}></div><output data-testid="context-error">{error}</output></main>{:else if data.scenario === 'shared-host'}<AccordionSharedHostFixture/>{:else if data.scenario === 'conformance'}<AccordionConformanceFixture part={data.part} mode={data.mode}/>{:else}<AccordionFixture scenario={data.scenario} />{/if}
