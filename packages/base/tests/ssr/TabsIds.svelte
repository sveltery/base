<script lang="ts">
  import { Tabs } from '../../src/lib/tabs/index.js';
  let { tabId }: { tabId?: string | null | undefined } = $props();
</script>

<Tabs.Root defaultValue={0}>
  <Tabs.List>
    <Tabs.Tab value={0} id={tabId}>First</Tabs.Tab>
    <Tabs.Tab value={1}>Second</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value={0}>First panel</Tabs.Panel>
</Tabs.Root>
