<script lang="ts">
  import { Tabs } from '../../src/lib/tabs/index.js';
  import { CSPProvider } from '../../src/lib/csp-provider/index.js';
  let { scenario = 'default', nonce = 'tabs-nonce' }: { scenario?: string; nonce?: string } =
    $props();
</script>

<CSPProvider {nonce}>
  <Tabs.Root
    defaultValue={scenario === 'null' ? null : 0}
    orientation={scenario === 'vertical' ? 'vertical' : 'horizontal'}
  >
    <Tabs.List>
      <Tabs.Tab value={0} disabled={scenario === 'disabled'}>First</Tabs.Tab>
      <Tabs.Tab value={1}>Second</Tabs.Tab>
      <Tabs.Indicator renderBeforeHydration={scenario === 'script'} />
    </Tabs.List>
    <Tabs.Panel value={0}>First panel</Tabs.Panel>
    <Tabs.Panel value={1} keepMounted={scenario === 'keep'}>Second panel</Tabs.Panel>
  </Tabs.Root>
</CSPProvider>
