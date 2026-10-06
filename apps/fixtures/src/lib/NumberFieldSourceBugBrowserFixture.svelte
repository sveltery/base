<script lang="ts">
  // Public native provider supplement; zero unchanged Original assertion credit.
  import { untrack } from 'svelte';
  import { NumberField } from '@sveltery/base/number-field';
  import { Field } from '@sveltery/base/field';
  import { Form } from '@sveltery/base/form';
  import type {
    NumberFieldRootProps,
    NumberFieldRootChangeEventDetails,
    NumberFieldRootCommitEventDetails,
  } from '@sveltery/base/number-field';
  import type { FormValidationMode } from '@sveltery/base/form';
  let {
    initial = 2,
    controlled = false,
    cancel = false,
    reject = false,
    options = {},
    validationMode = 'onSubmit',
    validate,
    onChange,
  }: {
    initial?: number;
    controlled?: boolean;
    cancel?: boolean;
    reject?: boolean;
    options?: NumberFieldRootProps;
    validationMode?: FormValidationMode;
    validate?: (value: unknown, values: Record<string, unknown>) => string | null;
    onChange?: (value: number | null, details: NumberFieldRootChangeEventDetails) => void;
  } = $props();
  let owner = $state<number | null>(untrack(() => initial));
  let traces = $state<unknown[]>([]);
  function changed(value: number | null, details: NumberFieldRootChangeEventDetails) {
    traces.push({ kind: 'change', value, reason: details.reason });
    onChange?.(value, details);
    if (cancel) details.cancel();
    if (!details.isCanceled && controlled && !reject) owner = value;
  }
  function committed(value: number | null, details: NumberFieldRootCommitEventDetails) {
    traces.push({ kind: 'commit', value, reason: details.reason });
  }
</script>

<Form {validationMode}>
  <Field.Root name="amount" {validate}>
    <NumberField.Root
      {...options}
      defaultValue={initial}
      value={controlled ? owner : undefined}
      onValueChange={changed}
      onValueCommitted={committed}
    >
      <NumberField.Input data-testid="visible" />
      <NumberField.Increment id="increase">Increase</NumberField.Increment>
      <NumberField.ScrubArea data-testid="scrub">Scrub</NumberField.ScrubArea>
    </NumberField.Root>
  </Field.Root>
</Form>
<button
  id="proof-owner"
  onclick={() => {
    owner = 42;
  }}>Owner42</button
>
<output id="number-traces">{JSON.stringify(traces)}</output>
