<script lang="ts">
  import { flushSync, onMount, untrack } from 'svelte';
  import { Checkbox, Switch, CheckboxGroup, Field, Form } from '@sveltery/base';
  import type { SwitchRootProps, CheckboxRootProps, FormValues } from '@sveltery/base';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';
  let { family, scenario }: { family: 'switch' | 'checkbox'; scenario: string } = $props();
  let hydrated = $state(false);
  let checked = $state(false);
  let groupValue = $state<string[]>([]);
  let errors = $state<Record<string, string>>({});
  let visible = $state(true);
  let late = $state(false);
  let calls = $state<unknown[]>([]);
  let submissions = $state<unknown[]>([]);
  let inputEvents = $state(0);
  let enterDefaultPrevented = $state<boolean | null>(null);
  let cancelChanges = $state(untrack(() => scenario === 'cancel'));
  const controlled = $derived(scenario.startsWith('controlled'));
  const native = $derived(scenario.startsWith('native'));
  const required = $derived(scenario === 'required');
  const disabled = $derived(scenario === 'disabled');
  const readOnly = $derived(scenario === 'readonly');
  function change(
    next: boolean,
    details: Parameters<NonNullable<SwitchRootProps['onCheckedChange']>>[1],
  ) {
    calls.push({ checked: next, type: details.event.type, reason: details.reason });
    if (cancelChanges) details.cancel();
    if (!details.isCanceled && controlled && scenario !== 'controlled-reject') checked = next;
  }
  function submit(values: FormValues) {
    submissions.push(values);
  }
  const rootProps: SwitchRootProps = $derived({
    id: 'control-input',
    name: 'fallback',
    checked: controlled ? checked : undefined,
    defaultChecked: scenario === 'reset-true',
    required,
    disabled,
    readOnly,
    value: 'yes',
    uncheckedValue: 'no',
    nativeButton: native,
    onCheckedChange: change,
    'data-control': '',
  });
  function ancestorEvents(element: HTMLDivElement) {
    const handler = (event: KeyboardEvent) => {
      if (scenario.includes('ancestor-prevent')) event.preventDefault();
      if (scenario.includes('ancestor-stop')) event.stopPropagation();
    };
    element.addEventListener('keydown', handler);
    return () => element.removeEventListener('keydown', handler);
  }
  let stopEnterUnmount = () => {};
  function armEnterUnmount() {
    // Armed after hydration/delegation. Teardown runs at document before the owned window listener.
    const handler = (event: KeyboardEvent) => {
      flushSync(() => (visible = false));
      queueMicrotask(() => (enterDefaultPrevented = event.defaultPrevented));
    };
    document.addEventListener('keydown', handler, { once: true });
    stopEnterUnmount = () => document.removeEventListener('keydown', handler);
  }
  const cancelLate = (event: KeyboardEvent) => event.preventDefault();
  function addLate() {
    if (!late) window.addEventListener('keydown', cancelLate);
    late = true;
  }
  onMount(() => {
    hydrated = true;
    return () => {
      window.removeEventListener('keydown', cancelLate);
      stopEnterUnmount();
    };
  });
</script>

{#snippet nativeButton(
  props: Record<string | symbol, unknown>,
  _state: unknown,
  children: Snippet | undefined,
)}
  <button {...props as HTMLButtonAttributes}>{@render children?.()}</button>
{/snippet}
{#snippet control()}
  {#if family === 'switch'}
    <Switch.Root {...rootProps} render={native ? nativeButton : undefined}
      ><Switch.Thumb data-part /></Switch.Root
    >
  {:else}
    <Checkbox.Root {...rootProps as CheckboxRootProps} render={native ? nativeButton : undefined}
      ><Checkbox.Indicator data-part /></Checkbox.Root
    >
  {/if}
{/snippet}
<main
  style="padding:20px"
  data-hydrated={hydrated}
  data-framework="svelte"
  data-reference-react="19.2.8"
  data-reference-react-dom="19.2.8"
>
  <Form
    id="form"
    {errors}
    oninput={() => inputEvents++}
    onsubmit={(event) => event.preventDefault()}
    onFormSubmit={submit}
  >
    <div {@attach ancestorEvents}>
      <Field.Root id="field" name="enabled">
        <Field.Label id="label">Enabled</Field.Label>
        {#if visible}{@render control()}{/if}
        <Field.Description id="description">A boolean field</Field.Description>
        <Field.Error id="error" />
      </Field.Root>
    </div>
    <button type="submit" id="submit" name="intent" value="save">Submit</button>
    <button type="reset" id="reset">Reset</button>
  </Form>
  {#if scenario === 'group'}
    <Form id="group-form" onsubmit={(event) => event.preventDefault()} onFormSubmit={submit}>
      <Field.Root name="choices">
        <Field.Label id="group-label">Choices</Field.Label>
        <CheckboxGroup
          allValues={['a', 'b']}
          value={groupValue}
          onValueChange={(next, details) => {
            if (cancelChanges) details.cancel();
            if (!details.isCanceled) groupValue = next;
          }}
        >
          <Checkbox.Root parent data-parent-control />
          <Field.Item
            ><Checkbox.Root value="a" data-child="a" /><Field.Label>A</Field.Label></Field.Item
          >
          <Field.Item
            ><Checkbox.Root value="b" data-child="b" /><Field.Label>B</Field.Label></Field.Item
          >
        </CheckboxGroup>
      </Field.Root>
      <button type="submit" id="group-submit">Submit group</button>
    </Form>
  {/if}
  <button onclick={() => (checked = !checked)}>Owner toggle</button>
  <button onclick={() => (errors = { enabled: 'Server error' })}>Server error</button>
  <button onclick={() => (visible = false)}>Unmount</button>
  <button onclick={() => (cancelChanges = !cancelChanges)}>Toggle cancellation</button>
  <button onclick={addLate}>Install late window cancellation</button>
  <button onclick={armEnterUnmount}>Arm Enter unmount after target</button>
  <output id="calls">{JSON.stringify(calls)}</output>
  <output id="submissions">{JSON.stringify(submissions)}</output>
  <output id="input-events">{inputEvents}</output>
  <output id="enter-default-prevented">{JSON.stringify(enterDefaultPrevented)}</output>
</main>

<style>
  :global([data-control]),
  :global([data-parent-control]),
  :global([data-child]) {
    display: inline-block;
    min-width: 40px;
    min-height: 30px;
    border: 1px solid;
    margin: 8px;
  }
  :global([data-part]) {
    display: block;
    width: 16px;
    height: 16px;
  }
</style>
