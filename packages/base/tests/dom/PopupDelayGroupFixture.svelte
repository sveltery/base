<script lang="ts">
  import FloatingDelayGroup from '../../src/lib/floating-ui/components/FloatingDelayGroup.svelte';
  import type { Delay } from '../../src/lib/floating-ui/types.js';
  import Consumer from './PopupDelayGroupConsumer.svelte';

  let {
    delay = { open: 1000, close: 200 },
    timeoutMs = 0,
    withProvider = true,
  }: {
    delay?: Delay | undefined;
    timeoutMs?: number | undefined;
    withProvider?: boolean | undefined;
  } = $props();

  let showFirst = $state(true);
  let showSecond = $state(true);
  let showThird = $state(true);
  let first = $state<ReturnType<typeof Consumer>>();
  let second = $state<ReturnType<typeof Consumer>>();
  let third = $state<ReturnType<typeof Consumer>>();
  const requests: { label: string; open: boolean; reason: string }[] = [];

  function onRequest(label: string, open: boolean, reason: string) {
    requests.push({ label, open, reason });
  }

  function consumer(label: 'one' | 'two' | 'three') {
    return label === 'one' ? first : label === 'two' ? second : third;
  }

  export function setOpen(label: 'one' | 'two' | 'three', open: boolean) {
    consumer(label)?.setOpen(open);
  }

  export function readState(label: 'one' | 'two' | 'three') {
    return consumer(label)?.readState();
  }

  export function readRequests() {
    return requests.slice();
  }

  export function show(label: 'one' | 'two' | 'three', visible: boolean) {
    if (label === 'one') showFirst = visible;
    else if (label === 'two') showSecond = visible;
    else showThird = visible;
  }

  export function setDelay(next: Delay) {
    delay = next;
  }

  export function setTimeoutMs(next: number) {
    timeoutMs = next;
  }
</script>

{#snippet consumers()}
  {#if showFirst}<Consumer label="one" {onRequest} bind:this={first} />{/if}
  {#if showSecond}<Consumer label="two" {onRequest} bind:this={second} />{/if}
  {#if showThird}<Consumer label="three" {onRequest} bind:this={third} />{/if}
{/snippet}

{#if withProvider}
  <FloatingDelayGroup {delay} {timeoutMs}>{@render consumers()}</FloatingDelayGroup>
{:else}
  {@render consumers()}
{/if}
