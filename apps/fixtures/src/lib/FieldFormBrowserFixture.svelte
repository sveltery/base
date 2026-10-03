<script lang="ts">
  // Actual Svelte browser fixture; source contracts at Base UI 47b40521; MIT.
  import { onMount, tick, untrack } from 'svelte';
  import Fixture from '../../../../packages/base/tests/dom/FieldFormFixture.svelte';
  import type { FieldRootProps } from '../../../../packages/base/src/lib/field/types.js';
  let { scenario }: { scenario: string } = $props();
  let api = $state<ReturnType<typeof Fixture>>();
  let hydrated = $state(false);
  let calls = $state<unknown[]>([]), submissions = $state<unknown[]>([]), validations = $state<unknown[]>([]);
  const mode = $derived(scenario.includes('onChange') ? 'onChange' : scenario.includes('onBlur') ? 'onBlur' : 'onSubmit');
  const controlled = $derived(scenario.startsWith('controlled'));
  const custom = $derived(scenario.includes('custom') || scenario.includes('async') || scenario.includes('debounce'));
  const validate: NonNullable<FieldRootProps['validate']> = (value, values) => {
    untrack(() => validations.push({ value, values }));
    const result = scenario.includes('duplicates') ? ['same', 'same'] : value === 'valid' || value === 'second' ? null : 'custom error';
    return scenario.includes('async') ? new Promise(resolve => setTimeout(() => resolve(result), value === 'slow' ? 180 : 30)) : result;
  };
  onMount(() => {
    api?.update({ required: true, type: scenario === 'email' ? 'email' : 'text', debounce: scenario.includes('debounce') ? 80 : 0, second: scenario === 'two-fields', textarea: scenario.includes('replacement') });
    void tick().then(() => { hydrated = true; });
  });
</script>
<main data-hydrated={hydrated}>
  <Fixture bind:this={api} {controlled} {mode} initial={controlled ? 'seed' : ''} inputPart={scenario.includes('input')} validate={custom ? validate : undefined}
    onsubmit={event => { event.preventDefault(); submissions.push('native'); }}
    onFormSubmit={(values, details) => submissions.push({ values, reason: details.reason })}
    onValueChange={(next, details) => { calls.push({ value: next, reason: details.reason, type: details.event.type }); if (scenario.includes('accept')) api?.setValue(next); else if (scenario.includes('rewrite')) api?.setValue(next.toUpperCase()); }} />
  <button onclick={() => api?.setValue('programmatic')}>Programmatic</button>
  <button onclick={() => api?.update({ fieldsetDisabled: true })}>Disable</button>
  <button onclick={() => api?.update({ fieldsetDisabled: false })}>Enable</button>
  <button onclick={() => api?.setErrors({ email: 'server error' })}>Server errors</button>
  <button onclick={() => api?.setErrors({ email: ['duplicate', 'duplicate'] })}>Server duplicates</button>
  <button onclick={() => api?.setErrors({ email: [] })}>Empty errors</button>
  <button onclick={() => api?.update({ controlId: 'control-b' })}>Change id</button>
  <button onclick={() => api?.update({ controlId: undefined })}>Remove id</button>
  <button onclick={() => api?.update({ controlId: '' })}>Empty id</button>
  <button onclick={() => api?.update({ fieldName: undefined, controlName: 'fallback' })}>Rename</button>
  <button onclick={() => api?.update({ description: false })}>Hide description</button>
  <button onclick={() => api?.update({ control: false })}>Remove control</button>
  <button onclick={() => api?.update({ control: true })}>Show control</button>
  <button onclick={() => api?.update({ textarea: true })}>Textarea</button>
  <button onclick={() => api?.update({ secondFirst: true })}>Reorder</button>
  <button onclick={() => api?.update({ externalForm: 'other-form' })}>Reassociate</button>
  <button onclick={() => api?.validateForm()}>Validate form</button>
  <button onclick={() => api?.validateField()}>Validate field</button>
  <output id="calls">{JSON.stringify(calls)}</output><output id="submissions">{JSON.stringify(submissions)}</output><output id="validations">{JSON.stringify(validations)}</output>
</main>
