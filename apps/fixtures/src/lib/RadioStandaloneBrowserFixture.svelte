<script lang="ts">
  // Public-package native standalone source-contract supplement. MIT.
  import { Field } from '@sveltery/base/field';
  import { Radio } from '@sveltery/base/radio';
  let { value }: { value: string } = $props();
  let literalInput = $state<HTMLInputElement>();
  let literalCalls = $state(0);
</script>

<Field.Root id="standalone-field">
  <Radio.Root {value} id="standalone-input" data-testid="standalone-radio">Standalone</Radio.Root>
</Field.Root>
<section aria-label="Literal Svelte radio baseline">
  <button
    type="button"
    data-testid="literal-radio"
    onclick={(event) => {
      event.preventDefault();
      literalInput?.click();
    }}>Literal activation</button
  >
  <input
    id="literal-input"
    type="radio"
    value="a"
    checked={false}
    hidden
    bind:this={literalInput}
    onclick={(event) => event.stopPropagation()}
    onchange={() => (literalCalls += 1)}
  />
  <output id="literal-calls">{literalCalls}</output>
</section>
