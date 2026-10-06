<script lang="ts">
  import { Accordion } from '../../src/lib/accordion/index.js';
  let { scenario = 'open' }: { scenario?: string } = $props();
</script>

<Accordion.Root defaultValue={scenario === 'closed' ? [] : [0]}>
  <Accordion.Item value={0}>
    <Accordion.Header><Accordion.Trigger>Trigger</Accordion.Trigger></Accordion.Header>
    <Accordion.Panel
      data-testid="panel"
      style={scenario === 'inline'
        ? 'animation-duration:100ms;animation-name:panel-slide-down;animation-timing-function:linear'
        : undefined}>This is panel content</Accordion.Panel
    >
  </Accordion.Item>
</Accordion.Root>
