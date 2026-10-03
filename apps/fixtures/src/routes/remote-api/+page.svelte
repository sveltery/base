<script lang="ts">
  import { onMount } from 'svelte';
  import { Form, Switch } from '@sveltery/base';
  import { survey, surveyEffects } from './survey.remote.js';
  let hydrated = $state(false), cancelChecked = $state(false), cancelSubmit = $state(false);
  let changes = $state<unknown[]>([]), enhancement = $state<string[]>([]);
  let control = $state<HTMLElement | null>();
  const effects = surveyEffects();
  onMount(() => { hydrated = true; });
</script>
<main data-hydrated={hydrated}>
  <Form id="survey-form" remote={survey} {...survey.enhance(async ({ submit }) => { enhancement.push('caller'); await submit(); enhancement.push('settled'); })}
    onsubmit={(event) => { if (cancelSubmit) event.preventDefault(); }}>
    {#snippet children(Field)}
      <Field.Root name="storageType" as="text" value="seed" validate={(value) => value === 'blocked' ? 'Blocked storage' : null}>
        <Field.Label>Storage type</Field.Label><Field.Description>Choose a storage type</Field.Description>
        <Field.Control required /><Field.Error id="storage-error" />
        <Field.Validity>{#snippet children(state)}<output id="storage-state">{JSON.stringify(state)}</output>{/snippet}</Field.Validity>
      </Field.Root>
      <Field.Root name="enabled" as="checkbox" value={false}>
        <Field.Label>Enabled</Field.Label>
        <Field.Control bind:ref={control} onCheckedChange={(checked, details) => { changes.push({ checked, type: details.event.type }); if (cancelChecked) details.cancel(); }}>
          {#snippet render(props)}<Switch.Root {...props}><Switch.Thumb /></Switch.Root>{/snippet}
        </Field.Control>
        <Field.Error id="enabled-error" />
        <Field.Validity>{#snippet children(state)}<output id="enabled-state">{JSON.stringify(state)}</output>{/snippet}</Field.Validity>
      </Field.Root>
      <button type="submit">Submit</button><button type="reset">Reset</button>
    {/snippet}
  </Form>
  <button onclick={() => { cancelChecked = !cancelChecked; }}>Toggle checked cancellation</button>
  <button onclick={() => { cancelSubmit = !cancelSubmit; }}>Toggle submit cancellation</button>
  <button onclick={() => survey.fields.enabled.set(true)}>Set enabled</button>
  <button onclick={() => survey.fields.set({ storageType: 'replacement', enabled: false })}>Replace values</button>
  <button onclick={() => { survey.fields.set({ storageType: 'seed', enabled: false }); }}>Set initial values</button>
  <button onclick={() => survey.validate({ includeUntouched: true })}>Validate remote</button>
  <button onclick={() => effects.refresh()}>Read effects</button>
  <output id="owner">{JSON.stringify(survey.fields.value())}</output>
  <output id="changes">{JSON.stringify(changes)}</output><output id="enhancement">{JSON.stringify(enhancement)}</output>
  <output id="result">{JSON.stringify(survey.result ?? null)}</output><output id="effects">{effects.current ?? ''}</output>
  <output id="control-ref">{control?.getAttribute('role') ?? ''}</output>
</main>
