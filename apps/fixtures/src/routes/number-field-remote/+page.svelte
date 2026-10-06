<script lang="ts">
  import { onMount } from 'svelte';
  import { Form, NumberField } from '@sveltery/base';
  import { numberSurvey } from './number.remote.js';
  let hydrated = $state(false),
    cancelChange = $state(false),
    cancelSubmit = $state(false);
  let enhancements = $state<string[]>([]),
    changes = $state<unknown[]>([]);
  onMount(() => {
    numberSurvey.fields.set({ amount: 2 });
    hydrated = true;
  });
</script>

<main data-hydrated={hydrated}>
  <Form
    id="remote-number-form"
    remote={numberSurvey}
    {...numberSurvey.enhance(async ({ submit }) => {
      enhancements.push('caller');
      await submit();
      enhancements.push('settled');
    })}
    onsubmit={(event) => {
      if (cancelSubmit) event.preventDefault();
    }}
  >
    {#snippet children(TypedField)}
      <TypedField.Root
        name="amount"
        as="number"
        validate={(value) => (value === 7 ? 'Seven unavailable locally' : null)}
      >
        <TypedField.Label id="remote-number-label">Amount</TypedField.Label>
        <TypedField.Description>Remote numeric field</TypedField.Description>
        <NumberField.Root
          id="remote-number-input"
          value={numberSurvey.fields.amount.value() ?? null}
          onValueChange={(value, details) => {
            changes.push({ value, reason: details.reason, type: details.event.type });
            if (cancelChange) details.cancel();
            if (!details.isCanceled && value !== null) numberSurvey.fields.amount.set(value);
          }}
        >
          <NumberField.Group
            ><NumberField.Decrement>Decrease</NumberField.Decrement><NumberField.Input
              data-testid="remote-number-visible"
            /><NumberField.Increment>Increase</NumberField.Increment></NumberField.Group
          >
        </NumberField.Root><TypedField.Error id="remote-number-error" />
        <TypedField.Validity
          >{#snippet children(state)}<output id="remote-number-validity"
              >{JSON.stringify(state)}</output
            >{/snippet}</TypedField.Validity
        >
      </TypedField.Root>
      <button id="remote-number-submit" type="submit">Submit</button>
    {/snippet}
  </Form>
  <button id="remote-number-owner" onclick={() => numberSurvey.fields.set({ amount: 4 })}
    >Set owner</button
  >
  <button
    id="remote-number-cancel-change"
    onclick={() => {
      cancelChange = !cancelChange;
    }}>Toggle change cancellation</button
  >
  <button
    id="remote-number-cancel-submit"
    onclick={() => {
      cancelSubmit = !cancelSubmit;
    }}>Toggle submit cancellation</button
  >
  <output id="remote-number-values">{JSON.stringify(numberSurvey.fields.value())}</output>
  <output id="remote-number-result">{JSON.stringify(numberSurvey.result ?? null)}</output>
  <output id="remote-number-enhancements">{JSON.stringify(enhancements)}</output>
  <output id="remote-number-changes">{JSON.stringify(changes)}</output>
</main>
