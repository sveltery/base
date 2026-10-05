<script lang="ts">
  // Native owner witness; zero unchanged Original assertion credit.
  import { untrack } from 'svelte';
  import { PreviousValue } from '@sveltery/utils/PreviousValue';

  let { initial = 0 }: { initial?: number } = $props();
  // A new container invalidates the getter even across Svelte's primitive zero equality.
  let current = $state.raw({ value: untrack(() => initial) });
  const previous = new PreviousValue(() => current.value);

  export function setValue(next: number) {
    current = { value: next };
  }
  export function snapshot() {
    return { current: current.value, previous: previous.value };
  }
</script>

<output data-previous>{String(previous.value)}</output>
<output data-current>{String(current.value)}</output>
