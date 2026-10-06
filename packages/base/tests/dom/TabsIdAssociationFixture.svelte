<script lang="ts">
  import { untrack } from 'svelte';
  import { Tabs } from '../../src/lib/tabs/index.js';
  let { panelMode = 'omitted' }: { panelMode?: 'omitted' | 'authored' | 'undefined' | undefined } =
    $props();
  let tabId = $state<string | null | undefined>(undefined);
  const panelId = untrack(() => (panelMode === 'authored' ? 'authored-panel' : undefined));
  export function setTabId(next: string | null | undefined) {
    tabId = next;
  }
</script>

<Tabs.Root defaultValue={0}>
  <Tabs.List><Tabs.Tab value={0} id={tabId}>First</Tabs.Tab></Tabs.List>
  {#if panelMode === 'omitted'}<Tabs.Panel value={0}>Panel</Tabs.Panel>
  {:else}<Tabs.Panel value={0} id={panelId}>Panel</Tabs.Panel>{/if}
</Tabs.Root>
