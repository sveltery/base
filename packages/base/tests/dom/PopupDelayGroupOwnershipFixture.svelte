<script lang="ts">
  import FloatingDelayGroup from '../../src/lib/floating-ui/components/FloatingDelayGroup.svelte';
  import Consumer from './PopupDelayGroupOwnershipConsumer.svelte';
  let { closedSecond = false }: { closedSecond?: boolean } = $props();
  let consumer = $state<ReturnType<typeof Consumer>>();
  export function changeId() { consumer?.changeId(); }
  export function switchStore() { consumer?.switchStore(); }
  export function closeFirst() { consumer?.closeFirst(); }
  export function reopenFirst() { consumer?.reopenFirst(); }
  export function read() { return consumer?.read(); }
</script>
<FloatingDelayGroup delay={{ open: 1000, close: 200 }} timeoutMs={500}>
  <Consumer {closedSecond} bind:this={consumer} />
</FloatingDelayGroup>
