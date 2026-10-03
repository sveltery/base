<script lang="ts">
  import { onMount } from 'svelte';
  import { Form, Checkbox, CheckboxGroup, Radio, RadioGroup } from '@sveltery/base';
  import { nativeChoices, styledChoices, nativeRadio, styledRadio, selects, uploads, nested, isolated, enhanced, contractEffects } from './contracts.remote.js';
  let hydrated = $state(false), authoritative = $state(false);
  let nativeChanges = $state<unknown[]>([]), groupChanges = $state<unknown[]>([]), radioChanges = $state<unknown[]>([]);
  let enhancements = $state<string[]>([]);
  const effects = contractEffects();
  const first = isolated.for('first'), second = isolated.for('second');
  const manual = isolated.for('manual');
  const preflight = nested.preflight({ '~standard': { version: 1, vendor: 'nested-preflight', validate(value) {
    const issues: { message: string; path: (string | number)[] }[] = [];
    if (value && typeof value === 'object' && 'profile' in value && value.profile && typeof value.profile === 'object' && 'email' in value.profile && value.profile.email === 'preflight-reject') issues.push({ message: 'Preflight email error', path: ['profile', 'email'] });
    if (value && typeof value === 'object' && 'items' in value && Array.isArray(value.items) && value.items[0]?.label === 'preflight-reject') issues.push({ message: 'Preflight indexed error', path: ['items', 0, 'label'] });
    return issues.length ? { issues } : { value };
  } } });
  onMount(async () => { await effects; hydrated = true; });
</script>

<main data-hydrated={hydrated}>
  <Form id="native-choices" remote={nativeChoices} {...nativeChoices}>
    {#snippet children(Field)}
      <Field.Root name="choices" as="checkbox" value="red"><Field.Label>Native red</Field.Label><Field.Control onValueChange={(value, details) => nativeChanges.push({ value, type: details.event.type })} /><Field.Error /></Field.Root>
      <Field.Root name="choices" as={['checkbox', 'blue']}><Field.Label>Native blue</Field.Label><Field.Control /></Field.Root>
      <button type="submit">Save native choices</button>
    {/snippet}
  </Form>
  <button onclick={() => nativeChoices.fields.choices.set(['blue'])}>Set native blue</button>
  <output id="native-choice-owner">{JSON.stringify(nativeChoices.fields.choices.value() ?? null)}</output>
  <output id="native-choice-changes">{JSON.stringify(nativeChanges)}</output>
  <output id="native-choice-result">{JSON.stringify(nativeChoices.result ?? null)}</output>

  <Form id="styled-choices" remote={styledChoices} {...styledChoices}>
    {#snippet children(Field)}
      <Field.Root name="choices">
        <Field.Label>Styled colors</Field.Label><Field.Description>Choose colors</Field.Description>
        <CheckboxGroup value={(styledChoices.fields.choices.value() ?? []).filter((value): value is string => value !== undefined)} onValueChange={(value, details) => { groupChanges.push({ value, type: details.event.type, reason: details.reason }); styledChoices.fields.choices.set(value); }}>
          <Field.Root name="choices" as="checkbox" value="red"><Field.Control>{#snippet render(props)}<Checkbox.Root {...props} aria-label="Styled red"><Checkbox.Indicator>Red</Checkbox.Indicator></Checkbox.Root>{/snippet}</Field.Control></Field.Root>
          <Field.Root name="choices" as="checkbox" value="blue"><Field.Control>{#snippet render(props)}<Checkbox.Root {...props} aria-label="Styled blue"><Checkbox.Indicator>Blue</Checkbox.Indicator></Checkbox.Root>{/snippet}</Field.Control></Field.Root>
        </CheckboxGroup>
        <Field.Error id="styled-choice-error" /><Field.Validity>{#snippet children(state)}<output id="styled-choice-state">{JSON.stringify(state)}</output>{/snippet}</Field.Validity>
      </Field.Root>
      <button type="submit">Save styled choices</button>
    {/snippet}
  </Form>
  <button onclick={() => styledChoices.fields.choices.set(['blue'])}>Set styled blue</button>
  <output id="styled-choice-owner">{JSON.stringify(styledChoices.fields.choices.value() ?? null)}</output>
  <output id="styled-choice-changes">{JSON.stringify(groupChanges)}</output>
  <output id="styled-choice-result">{JSON.stringify(styledChoices.result ?? null)}</output>

  <Form id="native-radio" remote={nativeRadio} {...nativeRadio}>
    {#snippet children(Field)}
      <Field.Root name="choice" as="radio" value="red"><Field.Label>Native radio red</Field.Label><Field.Control /></Field.Root>
      <Field.Root name="choice" as="radio" value="blue"><Field.Label>Native radio blue</Field.Label><Field.Control /></Field.Root>
      <button type="submit">Save native radio</button>
    {/snippet}
  </Form>
  <output id="native-radio-result">{JSON.stringify(nativeRadio.result ?? null)}</output>

  <Form id="styled-radio" remote={styledRadio} {...styledRadio}>
    {#snippet children(Field)}
      <Field.Root name="choice">
        <Field.Label>Styled radio colors</Field.Label>
        <RadioGroup value={styledRadio.fields.choice.value()} onValueChange={(value: string, details) => { radioChanges.push({ value, type: details.event.type }); styledRadio.fields.choice.set(value); }}>
          <Field.Root name="choice" as="radio" value="red"><Field.Control>{#snippet render(props)}<Radio.Root {...props} value="red" aria-label="Styled radio red"><Radio.Indicator>Red</Radio.Indicator></Radio.Root>{/snippet}</Field.Control></Field.Root>
          <Field.Root name="choice" as="radio" value="blue"><Field.Control>{#snippet render(props)}<Radio.Root {...props} value="blue" aria-label="Styled radio blue"><Radio.Indicator>Blue</Radio.Indicator></Radio.Root>{/snippet}</Field.Control></Field.Root>
        </RadioGroup>
        <Field.Error id="styled-radio-error" />
      </Field.Root>
      <button type="submit">Save styled radio</button>
    {/snippet}
  </Form>
  <output id="styled-radio-owner">{JSON.stringify(styledRadio.fields.choice.value() ?? null)}</output>
  <output id="styled-radio-changes">{JSON.stringify(radioChanges)}</output>
  <output id="styled-radio-result">{JSON.stringify(styledRadio.result ?? null)}</output>

  <Form id="selects" remote={selects} {...selects}>
    {#snippet children(Field)}
      <Field.Root name="single" as="select" value="red"><Field.Label>Single color</Field.Label><Field.Control><option value="red">Red</option><option value="blue">Blue</option></Field.Control></Field.Root>
      <Field.Root name="multiple" as="select multiple" value={['red']}><Field.Label>Multiple colors</Field.Label><Field.Control><option value="red">Red</option><option value="blue">Blue</option></Field.Control></Field.Root>
      <Field.Root name="custom" as="select" value="red"><Field.Label>Custom select</Field.Label><Field.Control>{#snippet render(props)}<select {...props}><option value="red">Red</option><option value="blue">Blue</option></select>{/snippet}</Field.Control></Field.Root>
      <button type="submit">Save selects</button>
    {/snippet}
  </Form>
  <button onclick={() => selects.fields.set({ single: 'blue', multiple: ['blue'], custom: 'blue' })}>Set selects blue</button>
  <output id="select-owner">{JSON.stringify(selects.fields.value())}</output><output id="select-result">{JSON.stringify(selects.result ?? null)}</output>

  <Form id="uploads" remote={uploads} {...uploads}>
    {#snippet children(Field)}
      <Field.Root name="file" as="file"><Field.Label>Single file</Field.Label><Field.Control /></Field.Root>
      <Field.Root name="files" as="file multiple"><Field.Label>Multiple files</Field.Label><Field.Control /></Field.Root>
      <button type="submit">Save uploads</button>
    {/snippet}
  </Form>
  <output id="upload-result">{JSON.stringify(uploads.result ?? null)}</output>

  <Form id="nested" remote={preflight} {...preflight} errors={authoritative ? {} : undefined}>
    {#snippet children(Field)}
      <Field.Root name="profile.email" as="text" value="seed@example.com"><Field.Label>Nested email</Field.Label><Field.Control id="manual-email" name="profile.email" /><Field.Error id="nested-email-error" /></Field.Root>
      <Field.Root name="items[00].label" as="text" value="seed"><Field.Label>Indexed label</Field.Label><Field.Control id="manual-index" name="items[0].label" /><Field.Error id="nested-index-error" /></Field.Root>
      <button type="submit">Save nested</button>
    {/snippet}
  </Form>
  <button onclick={() => preflight.validate({ includeUntouched: true, preflightOnly: true })}>Validate preflight</button>
  <button onclick={() => { authoritative = !authoritative; }}>Toggle authoritative errors</button>
  <output id="nested-issues">{JSON.stringify(preflight.fields.allIssues() ?? [])}</output><output id="nested-result">{JSON.stringify(preflight.result ?? null)}</output>

  {#each [first, second] as remote, index (remote)}
    <Form id={`isolated-${index}`} {remote} {...remote}>
      {#snippet children(Field)}
        <Field.Root name="message" as="text" value={index === 0 ? 'first-seed' : 'second-seed'}><Field.Label>Isolated {index}</Field.Label><Field.Control /><Field.Error id={`isolated-error-${index}`} /></Field.Root>
        <button type="submit">Save isolated {index}</button>
      {/snippet}
    </Form>
    <output id={`isolated-result-${index}`}>{JSON.stringify(remote.result ?? null)}</output>
  {/each}

  <Form id="manual" remote={manual} {...manual} errors={{ message: 'Manual logical field error' }}>
    {#snippet children(Field)}
      <Field.Root name="message" as="text" value="manual-seed"><Field.Label>Manual message</Field.Label><Field.Control id="authored-control-id" name="authored-native-name" /><Field.Error id="manual-error" /></Field.Root>
    {/snippet}
  </Form>
  <button onclick={() => manual.fields.message.set('manual-next')}>Set manual logical value</button>

  <Form id="enhanced" remote={enhanced} {...enhanced.enhance(async (remote) => { enhancements.push('caller'); await remote.submit().updates(effects); enhancements.push('updated'); remote.element.reset(); enhancements.push('custom-js'); })}>
    {#snippet children(Field)}
      <Field.Root name="message" as="text" value="enhanced-seed"><Field.Label>Enhanced message</Field.Label><Field.Control /></Field.Root>
      <button type="submit" name="intent" value="review">Review enhanced</button>
    {/snippet}
  </Form>
  <output id="enhanced-pending">{enhanced.pending}</output><output id="enhanced-result">{JSON.stringify(enhanced.result ?? null)}</output><output id="enhancement-events">{JSON.stringify(enhancements)}</output>
  <button onclick={() => effects.refresh()}>Read contract effects</button><output id="contract-effects">{JSON.stringify(effects.current ?? {})}</output>
</main>

<style>
  :global(#styled-choices [role='checkbox']), :global(#styled-radio [role='radio']) {
    display: inline-flex;
    min-width: 7rem;
    min-height: 2rem;
    align-items: center;
    border: 1px solid currentColor;
  }
</style>
