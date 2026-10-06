<script lang="ts">
  import { onMount, untrack, type Snippet } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import type { HTMLInputAttributes, HTMLFormAttributes } from 'svelte/elements';
  import { Field } from '../../../../../packages/base/src/lib/field/index.js';
  import { Form } from '../../../../../packages/base/src/lib/form/index.js';
  import type { FormErrors } from '../../../../../packages/base/src/lib/form/types.js';
  import Input from '../../../../../packages/base/src/lib/input/Input.svelte';
  import { saveFieldForm, fieldFormEffectCount } from './field-form.remote.js';
  let { data } = $props();
  let hydrated = $state(false),
    resets = $state(0),
    nativeInvalid = $state(0),
    nativeSubmit = $state(0);
  let events = $state<unknown[]>([]);
  const effectCounter = fieldFormEffectCount();
  let observedEffects = $state<number>();
  let counterReads = $state(0);
  const observeKey = createAttachmentKey();
  function observeForm(node: HTMLFormElement) {
    const capture = (event: Event) =>
      untrack(() =>
        events.push({
          stage: 'capture',
          type: event.type,
          defaultPrevented: event.defaultPrevented,
          value: new FormData(node).get('email'),
        }),
      );
    const after = (event: Event) =>
      untrack(() =>
        events.push({
          stage: 'after-attachments',
          type: event.type,
          defaultPrevented: event.defaultPrevented,
          value: new FormData(node).get('email'),
          valid: node.querySelector('input')?.validity.valid,
          validationMessage: node.querySelector('input')?.validationMessage,
        }),
      );
    node.addEventListener('submit', capture, true);
    node.addEventListener('submit', after);
    return () => {
      node.removeEventListener('submit', capture, true);
      node.removeEventListener('submit', after);
    };
  }
  async function refreshCounter() {
    await effectCounter.refresh();
    observedEffects = await effectCounter;
    counterReads++;
  }
  onMount(() => {
    void refreshCounter().then(() => {
      hydrated = true;
    });
  });
  const errors = $derived.by((): FormErrors => {
    const issues = saveFieldForm.fields.email.issues();
    return issues?.length ? { email: issues.map((issue) => issue.message) } : {};
  });
</script>

{#snippet replacement(props: Record<string | symbol, unknown>)}<input
    {...props as HTMLInputAttributes}
  />{/snippet}
{#snippet replacementForm(
  props: Record<string | symbol, unknown>,
  _state: unknown,
  children: Snippet | undefined,
)}<form {...props as HTMLFormAttributes}>{@render children?.()}</form>{/snippet}
{#snippet content()}
  {#if data.native}
    <label for="remote-email">Email</label>
    <input
      id="remote-email"
      {...saveFieldForm.fields.email.as('email', 'seed@example.com')}
      required
      oninvalid={() => nativeInvalid++}
    />
  {:else}
    <Field.Root
      name="email"
      validate={(value) => (value === 'blocked@example.com' ? 'Blocked by Field' : null)}
    >
      <Field.Label>Email</Field.Label><Field.Description id="remote-description"
        >Field description</Field.Description
      >
      <Input
        id="remote-email"
        {...saveFieldForm.fields.email.as('email', 'seed@example.com')}
        required
        render={data.replacement ? replacement : undefined}
        oninvalid={() => nativeInvalid++}
        oninput={(event) =>
          events.push({
            stage: 'consumer-input',
            value: event.currentTarget.value,
            remote: saveFieldForm.fields.email.value(),
          })}
        onValueChange={(value, details) =>
          events.push({
            stage: 'value-change',
            value,
            remote: saveFieldForm.fields.email.value(),
            reason: details.reason,
          })}
      />
      <Field.Error id="remote-error" />
      <Field.Validity
        >{#snippet children(state)}<output id="field-validity">{JSON.stringify(state)}</output
          >{/snippet}</Field.Validity
      >
    </Field.Root>
  {/if}
  <button type="submit">Submit</button><button type="reset">Reset</button>
{/snippet}
<main data-hydrated={hydrated}>
  {#if data.native}
    <form
      id="remote-form"
      {...saveFieldForm}
      {...{ [observeKey]: observeForm }}
      onsubmit={(event) => {
        nativeSubmit++;
        if (data.canceledSubmit) event.preventDefault();
      }}
      onreset={(event) => {
        resets++;
        if (data.canceledReset) event.preventDefault();
      }}
    >
      {@render content()}
    </form>
  {:else}
    <Form
      id="remote-form"
      {...saveFieldForm}
      {...{ [observeKey]: observeForm }}
      {errors}
      render={data.formReplacement ? replacementForm : undefined}
      onsubmit={(event) => {
        nativeSubmit++;
        if (data.canceledSubmit) event.preventDefault();
      }}
      onreset={(event) => {
        resets++;
        if (data.canceledReset) event.preventDefault();
      }}
    >
      {@render content()}
    </Form>
  {/if}
  <button onclick={() => saveFieldForm.fields.email.set('programmatic@example.com')}
    >Programmatic</button
  >
  <button onclick={() => saveFieldForm.validate({ includeUntouched: true })}>Validate</button>
  <button onclick={refreshCounter}>Read server counter</button>
  <output id="remote-value">{saveFieldForm.fields.email.value() ?? ''}</output><output
    id="remote-issues">{JSON.stringify(saveFieldForm.fields.email.issues() ?? [])}</output
  >
  <output id="remote-result">{JSON.stringify(saveFieldForm.result ?? null)}</output><output
    id="remote-events">{JSON.stringify(events)}</output
  >
  <output id="remote-resets">{resets}</output><output id="remote-invalid">{nativeInvalid}</output
  ><output id="remote-native-submit">{nativeSubmit}</output>
  <output id="server-counter">{observedEffects ?? ''}</output><output id="counter-reads"
    >{counterReads}</output
  >
</main>
