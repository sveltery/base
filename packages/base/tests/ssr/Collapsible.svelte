<script lang="ts">
  import * as Collapsible from '../../src/lib/collapsible/index.js';
  let { scenario = 'open' }: { scenario?: string } = $props();
</script>
<Collapsible.Root defaultOpen={scenario !== 'closed'}>
  <Collapsible.Trigger>Trigger</Collapsible.Trigger>
  <Collapsible.Panel data-testid="panel" class="animation-test-panel"
    style={scenario === 'inline' ? 'animation-duration:100ms;animation-name:panel-slide-down;animation-timing-function:linear' : undefined}>This is panel content</Collapsible.Panel>
</Collapsible.Root>
