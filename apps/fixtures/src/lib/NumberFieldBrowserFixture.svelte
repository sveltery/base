<script lang="ts">
  // Actual NumberField family witness; native framework supplements earn zero ordinary credit.
  import { onMount, untrack } from 'svelte';
  import NumberFieldStepperOwnerBrowserFixture from './NumberFieldStepperOwnerBrowserFixture.svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { NumberField } from '@sveltery/base/number-field';
  import { Field } from '@sveltery/base/field';
  import { Form } from '@sveltery/base/form';
  import type {
    NumberFieldRootProps,
    NumberFieldRootChangeEventDetails,
    NumberFieldRootCommitEventDetails,
  } from '@sveltery/base/number-field';
  let { scenario: scenarioProp = 'default' }: { scenario?: string } = $props();
  const scenario = untrack(() => scenarioProp);
  const initial = scenario.includes('empty')
    ? undefined
    : scenario.includes('rounding-blur')
      ? 1.234
      : scenario.includes('precision')
        ? 1.23456789
        : scenario === 'percent'
          ? 0.12
          : 2;
  const controlled = scenario.includes('controlled');
  let owner = $state<number | null>(initial ?? null);
  let hydrated = $state(false);
  let shown = $state(true);
  let replacement = $state(scenario.includes('replacement'));
  let traces = $state<unknown[]>([]);
  let submissions = $state<unknown[]>([]);
  let validationCalls = $state<unknown[]>([]);
  let rootRef = $state<HTMLElement | null>();
  let visibleRef = $state<HTMLElement | null>();
  let hiddenRef = $state<HTMLInputElement | null>(null);
  const options: NumberFieldRootProps = {
    locale: scenario === 'currency' ? 'de-DE' : 'en-US',
    allowWheelScrub: true,
    ...(scenario.includes('bounds') || scenario.includes('outofrange') ? { min: 0, max: 5 } : {}),
    ...(scenario.includes('outofrange') ? { allowOutOfRange: true } : {}),
    ...(scenario.includes('negative') ? { min: -10, max: -3 } : {}),
    ...(scenario.includes('precision') ? { step: 0.1 } : {}),
    ...(scenario.includes('rounding-blur')
      ? { step: 'any', format: { maximumFractionDigits: 2 } }
      : {}),
    ...(scenario === 'snap' ? { min: 0.3, step: 0.2, snapOnStep: true } : {}),
    ...(scenario === 'currency' ? { format: { style: 'currency', currency: 'EUR' } } : {}),
    ...(scenario === 'percent' ? { format: { style: 'percent' } } : {}),
    ...(scenario.includes('readonly') ? { readOnly: true } : {}),
    ...(scenario.includes('disabled') ? { disabled: true } : {}),
    ...(scenario.includes('required') ? { required: true } : {}),
    ...(scenario === 'external-form' ? { form: 'external-number-form' } : {}),
  };
  function changed(value: number | null, details: NumberFieldRootChangeEventDetails) {
    traces.push({
      kind: 'change',
      value,
      reason: details.reason,
      direction: details.direction,
      type: details.event.type,
    });
    if (scenario.includes('cancel')) details.cancel();
    if (controlled && !scenario.includes('reject') && !details.isCanceled) owner = value;
  }
  function committed(value: number | null, details: NumberFieldRootCommitEventDetails) {
    traces.push({ kind: 'commit', value, reason: details.reason, type: details.event.type });
  }
  function validate(value: unknown, values: Record<string, unknown>) {
    validationCalls.push({ value, values });
    if (scenario.includes('rounding-blur'))
      return scenario.includes('async')
        ? Promise.resolve('Rounded amount rejected')
        : 'Rounded amount rejected';
    return value === 7 ? 'Seven unavailable' : null;
  }
  onMount(() => {
    hydrated = true;
  });
</script>

<main data-hydrated={hydrated} data-renderer="svelte-5.57.1">
  {#if scenario.startsWith('stepper-owner')}
    <NumberFieldStepperOwnerBrowserFixture {scenario} />
  {/if}
  <Form
    id="number-form"
    validationMode={scenario === 'validation' || scenario.includes('rounding-blur')
      ? 'onBlur'
      : 'onSubmit'}
    onFormSubmit={(values) => {
      submissions.push(values);
    }}
  >
    <Field.Root
      name="amount"
      id="number-field"
      validate={scenario === 'validation' || scenario.includes('rounding-blur')
        ? validate
        : undefined}
    >
      <Field.Label id="amount-label">Amount</Field.Label>
      <Field.Description id="amount-description">A numeric amount</Field.Description>
      {#if shown}
        <NumberField.Root
          id="amount-input"
          {...options}
          defaultValue={initial}
          value={controlled ? owner : undefined}
          onValueChange={changed}
          onValueCommitted={committed}
          bind:inputRef={hiddenRef}
          bind:ref={rootRef}
        >
          <NumberField.Group id="number-group">
            <NumberField.Decrement id="decrease">Decrease</NumberField.Decrement>
            <NumberField.Input
              data-testid="visible"
              oninput={(event) => {
                if (scenario === 'prevent-input') event.preventBaseUIHandler();
              }}
              onkeydown={(event) => {
                if (scenario === 'prevent-key') event.preventBaseUIHandler();
              }}
              bind:ref={visibleRef}
              render={replacement ? inputReplacement : undefined}
            />
            <NumberField.Increment id="increase">Increase</NumberField.Increment>
          </NumberField.Group>
          <NumberField.ScrubArea data-testid="scrub"
            ><NumberField.ScrubAreaCursor data-testid="cursor">Cursor</NumberField.ScrubAreaCursor
            >Scrub</NumberField.ScrubArea
          >
        </NumberField.Root>
      {/if}
      <Field.Error id="number-error" />
      <Field.Validity
        >{#snippet children(state)}<output id="validity">{JSON.stringify(state)}</output
          >{/snippet}</Field.Validity
      >
    </Field.Root>
    <button id="submit" type="submit">Submit</button><button id="reset" type="reset">Reset</button>
  </Form>
  <form id="external-number-form"></form>
  <button id="outside">Outside</button>
  <button
    id="owner-update"
    onclick={() => {
      owner = 42;
    }}>Owner update</button
  >
  <button
    id="replace-input"
    onclick={() => {
      replacement = !replacement;
    }}>Replace input</button
  >
  <button
    id="toggle-root"
    onclick={() => {
      shown = !shown;
    }}>Toggle root</button
  >
  <output id="number-traces">{JSON.stringify(traces)}</output>
  <output id="number-submissions">{JSON.stringify(submissions)}</output>
  <output id="number-validation-calls">{JSON.stringify(validationCalls)}</output>
  <output id="ref-state"
    >{JSON.stringify({
      root: rootRef?.isConnected ?? false,
      visible: visibleRef?.isConnected ?? false,
      hidden: hiddenRef?.isConnected ?? false,
    })}</output
  >
</main>
{#snippet inputReplacement(props: HTMLInputAttributes)}<input
    {...props as HTMLInputAttributes}
    data-replacement="true"
  />{/snippet}
