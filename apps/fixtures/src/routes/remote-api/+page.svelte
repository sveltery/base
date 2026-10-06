<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Form, Switch } from '@sveltery/base';
  import { survey, surveyEffects } from './survey.remote.js';
  let hydrated = $state(false),
    cancelChecked = $state(false),
    cancelSubmit = $state(false);
  let changes = $state<unknown[]>([]),
    valueChanges = $state<unknown[]>([]),
    enhancement = $state<string[]>([]);
  let control = $state<HTMLElement | null>();
  let resetPhases = $state<unknown[]>([]);
  const effects = surveyEffects();
  const literal = survey.for('native-reset-oracle');
  function observeReset(event: Event) {
    const form = event.currentTarget as HTMLFormElement;
    const remote = form.id === 'literal-reset-form' ? literal : survey;
    const capture = (phase: string) => {
      const checkbox = form.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
      resetPhases.push({
        form: form.id,
        phase,
        checked: checkbox.checked,
        defaultChecked: checkbox.defaultChecked,
        values: [...new FormData(form)],
        owner: JSON.parse(JSON.stringify(remote.fields.value())),
      });
    };
    capture('listener');
    queueMicrotask(() => capture('microtask'));
    void tick().then(() => capture('tick'));
    setTimeout(() => capture('task'), 0);
  }
  onMount(() => {
    hydrated = true;
  });
</script>

<main data-hydrated={hydrated}>
  <Form
    id="survey-form"
    remote={survey}
    {...survey.enhance(async ({ submit, element }) => {
      enhancement.push('caller');
      if (await submit()) {
        await tick();
        HTMLFormElement.prototype.reset.call(element);
      }
      enhancement.push('settled');
    })}
    onreset={observeReset}
    onsubmit={(event) => {
      if (cancelSubmit) event.preventDefault();
    }}
  >
    {#snippet children(Field)}
      <Field.Root
        name="storageType"
        as="text"
        value="seed"
        validate={(value) => (value === 'blocked' ? 'Blocked storage' : null)}
      >
        <Field.Label>Storage type</Field.Label><Field.Description
          >Choose a storage type</Field.Description
        >
        <Field.Control required /><Field.Error id="storage-error" />
        <Field.Validity
          >{#snippet children(state)}<output id="storage-state">{JSON.stringify(state)}</output
            >{/snippet}</Field.Validity
        >
      </Field.Root>
      <Field.Root name="enabled" as="checkbox">
        <Field.Label>Enabled</Field.Label>
        <Field.Control
          bind:ref={control}
          onCheckedChange={(checked, details) => {
            changes.push({ checked, type: details.event.type });
            if (cancelChecked) details.cancel();
          }}
          onValueChange={(value, details) => valueChanges.push({ value, type: details.event.type })}
        >
          {#snippet render(props)}<Switch.Root
              {...props}
              style="display:inline-block;width:40px;height:24px;background:lightgray;border-radius:12px"
              ><Switch.Thumb
                style="display:block;width:18px;height:18px;background:black;border-radius:50%"
              /></Switch.Root
            >{/snippet}
        </Field.Control>
        <Field.Error id="enabled-error" />
        <Field.Validity
          >{#snippet children(state)}<output id="enabled-state">{JSON.stringify(state)}</output
            >{/snippet}</Field.Validity
        >
      </Field.Root>
      <button type="submit">Submit</button><button type="reset">Reset</button>
    {/snippet}
  </Form>
  <button
    onclick={() => {
      cancelChecked = !cancelChecked;
    }}>Toggle checked cancellation</button
  >
  <button
    onclick={() => {
      cancelSubmit = !cancelSubmit;
    }}>Toggle submit cancellation</button
  >
  <button onclick={() => survey.fields.enabled.set(true)}>Set enabled</button>
  <button onclick={() => survey.fields.set({ storageType: 'replacement', enabled: false })}
    >Replace values</button
  >
  <button
    onclick={() => {
      survey.fields.set({ storageType: 'seed', enabled: false });
    }}>Set initial values</button
  >
  <button onclick={() => survey.validate({ includeUntouched: true })}>Validate remote</button>
  <button onclick={() => effects.refresh()}>Read effects</button>
  <output id="owner">{JSON.stringify(survey.fields.value())}</output>
  <output id="changes">{JSON.stringify(changes)}</output><output id="value-changes"
    >{JSON.stringify(valueChanges)}</output
  ><output id="enhancement">{JSON.stringify(enhancement)}</output>
  <output id="result">{JSON.stringify(survey.result ?? null)}</output><output id="effects"
    >{effects.current ?? ''}</output
  >
  <output id="control-ref">{control?.getAttribute('role') ?? ''}</output>
  <!-- Actual Kit descriptors on literal Svelte inputs, with an independent instance. -->
  <form id="literal-reset-form" {...literal} onreset={observeReset}>
    <input id="literal-text" {...literal.fields.storageType.as('text', 'seed')} />
    <input id="literal-enabled" {...literal.fields.enabled.as('checkbox')} />
    <button type="reset">Literal reset</button>
  </form>
  <button onclick={() => literal.fields.set({ storageType: 'replacement', enabled: false })}
    >Literal replace values</button
  >
  <button onclick={() => literal.fields.enabled.set(true)}>Literal set enabled</button>
  <output id="literal-owner">{JSON.stringify(literal.fields.value())}</output>
  <output id="reset-phases">{JSON.stringify(resetPhases)}</output>
</main>
