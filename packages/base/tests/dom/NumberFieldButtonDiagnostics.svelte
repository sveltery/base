<script lang="ts">
  // Actual NumberField caller of the one canonical useButton; zero ordinary credit.
  import type { HTMLAttributes } from 'svelte/elements';
  import { NumberField } from '../../src/lib/number-field/index.js';
  import { Field } from '../../src/lib/field/index.js';
  import { Form } from '../../src/lib/form/index.js';
  let { nativeButton, renderButton }: { nativeButton: boolean; renderButton: boolean } = $props();
</script>

<Form
  ><Field.Root name="amount"
    ><Field.Label>Amount</Field.Label>
    <NumberField.Root defaultValue={2} locale="en-US">
      <NumberField.Input />
      <NumberField.Increment {nativeButton} render={renderButton ? undefined : span}
        >Increase</NumberField.Increment
      >
    </NumberField.Root>
  </Field.Root></Form
>
{#snippet span(props: HTMLAttributes<HTMLSpanElement>)}<span {...props}>Increase</span>{/snippet}
