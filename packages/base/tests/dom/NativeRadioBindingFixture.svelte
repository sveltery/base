<script lang="ts">
  import { Radio } from '../../src/lib/radio/index.js';
  import RadioGroup from '../../src/lib/radio-group/RadioGroup.svelte';
  let {
    initial = 'b',
    disabledFirst = false,
  }: { initial?: string | null; disabledFirst?: boolean } = $props();
  let groupInput = $state<HTMLInputElement | null | undefined>();
  let firstInput = $state<HTMLInputElement | null | undefined>();
  let secondInput = $state<HTMLInputElement | null | undefined>();
  let visible = $state(true);
  export function hide() {
    visible = false;
  }
  export function snapshot() {
    return { groupInput, firstInput, secondInput };
  }
</script>

{#if visible}
  <RadioGroup defaultValue={initial} bind:inputRef={groupInput}>
    <Radio.Root value="a" disabled={disabledFirst} bind:inputRef={firstInput} data-radio="a"
      >A</Radio.Root
    >
    <Radio.Root value="b" bind:inputRef={secondInput} data-radio="b">B</Radio.Root>
  </RadioGroup>
{/if}
