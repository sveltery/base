<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import StandaloneFixture from './RadioStandaloneBrowserFixture.svelte';
  // Pinned Radio/RadioGroup assertion fixture adapter; MIT: parity/radio/UPSTREAM_LICENSE.
  import { Radio } from '@sveltery/base/radio';
  import { RadioGroup } from '@sveltery/base/radio-group';
  import { Field } from '@sveltery/base/field';
  import { Form } from '@sveltery/base/form';
  import { Fieldset } from '@sveltery/base/fieldset';
  import { DirectionProvider } from '@sveltery/base/direction-provider';
  import type { RadioGroupChangeEventDetails } from '@sveltery/base/radio-group';
  import type { HTMLAttributes } from 'svelte/elements';
  const Group = RadioGroup<string | null>;
  let { scenario: scenarioProp = 'default' }: { scenario?: string } = $props();
  const scenario = untrack(() => scenarioProp);
  const groupFocusScenario = scenario.startsWith('focus-group');
  const itemFocusScenario = scenario.startsWith('focus-item');
  const initial = scenario.includes('empty') ? null : 'b';
  const controlled = scenario.startsWith('controlled');
  const ownerAccepts = !scenario.includes('reject');
  const cancel = scenario.includes('cancel');
  const disabled = scenario.includes('disabled') && !scenario.includes('first-disabled');
  const readOnly = scenario.includes('readonly');
  const required = scenario.includes('required');
  const disabledFirst = scenario.includes('first-disabled');
  const items = ['a', 'b', 'c'];
  const rtl = scenario.includes('rtl');
  const nativeButton = scenario.includes('native-button');
  const fieldName = 'choice';
  const groupName = 'fallback';
  const withForm = true;
  const fieldsetDisabled = false;
  const invalid = false;
  const label = true;
  const description = true;
  const keepMounted = scenario.includes('keep');
  const inputRef = undefined;
  const form = scenario === 'external-form' ? 'external-form' : undefined;
  let hydrated = $state(false);
  let calls = $state<unknown[]>([]);
  let ancestorClicks = $state(0);
  let submissions = $state<unknown[]>([]);
  let validationCalls = $state(0);
  let focusCalls = $state<unknown[]>([]);
  function groupFocus(phase: string, event: FocusEvent & { preventBaseUIHandler(): void }) {
    const host = event.currentTarget as HTMLElement;
    const textbox = event.target as HTMLInputElement;
    const field = document.querySelector('#field')!;
    focusCalls.push({
      phase,
      currentTarget: host.id,
      tag: host.tagName,
      focused: field.hasAttribute('data-focused'),
      touched: field.hasAttribute('data-touched'),
      selection: [textbox.selectionStart, textbox.selectionEnd],
    });
    if (scenario.includes('cancel')) event.preventBaseUIHandler();
  }
  function itemFocus(event: FocusEvent & { preventBaseUIHandler(): void }) {
    focusCalls.push((event.currentTarget as HTMLElement).getAttribute('data-testid'));
    if (scenario.includes('cancel')) event.preventBaseUIHandler();
  }
  function validate(value: unknown) {
    validationCalls += 1;
    return `Blur error: ${String(value)}`;
  }
  onMount(() => {
    hydrated = true;
  });
  function onChange(value: string | null, details: RadioGroupChangeEventDetails) {
    calls.push({
      value,
      reason: details.reason,
      type: details.event.type,
      shiftKey: (details.event as MouseEvent).shiftKey,
    });
  }
  function onSubmit(values: Record<string, unknown>) {
    submissions.push(values);
  }
  let owner = $state(untrack(() => initial));
  let current = $state.raw(
    untrack(() => ({
      initial,
      controlled,
      ownerAccepts,
      cancel,
      disabled,
      readOnly,
      required,
      disabledFirst,
      items,
      rtl,
      nativeButton,
      fieldName,
      groupName,
      fieldsetDisabled,
      invalid,
      label,
      description,
      keepMounted,
    })),
  );
  export function update(props: Partial<typeof current>) {
    current = { ...current, ...props };
  }
  export function setValue(value: string | null) {
    owner = value;
  }
  function changed(value: string | null, details: RadioGroupChangeEventDetails) {
    onChange?.(value, details);
    if (current.cancel) details.cancel();
    if (current.controlled && current.ownerAccepts && !details.isCanceled) owner = value;
  }
</script>

{#snippet content()}
  {#snippet groupHost(
    props: Record<string | symbol, unknown>,
    _state: unknown,
    children: import('svelte').Snippet | undefined,
  )}
    <section {...props as HTMLAttributes<HTMLElement>}>{@render children?.()}</section>
  {/snippet}
  <Fieldset.Root disabled={current.fieldsetDisabled}>
    <Fieldset.Legend id="legend">Legend</Fieldset.Legend>
    <Field.Root
      name={current.fieldName}
      id="field"
      invalid={current.invalid}
      validationMode={scenario === 'onblur' || groupFocusScenario ? 'onBlur' : undefined}
      validate={scenario === 'onblur' || groupFocusScenario ? validate : undefined}
    >
      {#if current.label}<Field.Label id="group-label">Group</Field.Label>{/if}
      {#if current.description}<Field.Description id="description">Description</Field.Description
        >{/if}
      <Group
        id="radio-group"
        defaultValue={current.initial}
        value={current.controlled ? owner : undefined}
        disabled={current.disabled}
        readOnly={current.readOnly}
        required={current.required}
        name={current.groupName}
        onValueChange={changed}
        {inputRef}
        {form}
        render={scenario.startsWith('focus-group-render') ? groupHost : undefined}
        onfocusin={groupFocusScenario ? (event) => groupFocus('enter', event) : undefined}
        onfocusout={groupFocusScenario ? (event) => groupFocus('leave', event) : undefined}
      >
        {#each current.items as value (value)}
          <Field.Item>
            <Field.Label id={`label-${value}`}>{value}</Field.Label>
            <Radio.Root
              {value}
              id={`input-${value}`}
              data-testid={`radio-${value}`}
              nativeButton={current.nativeButton}
              disabled={current.disabledFirst && value === 'a'}
              onfocusin={itemFocusScenario ? itemFocus : undefined}
            >
              {#snippet render(props, _state, children)}
                {#if current.nativeButton}<button {...props as HTMLAttributes<HTMLButtonElement>}
                    >{@render children?.()}</button
                  >{:else}<span {...props as HTMLAttributes<HTMLSpanElement>}
                    >{@render children?.()}</span
                  >{/if}
              {/snippet}
              <Radio.Indicator
                data-testid={`indicator-${value}`}
                keepMounted={current.keepMounted}
              />
              {#if itemFocusScenario && value === 'c'}<input
                  id="focus-textbox"
                  type="text"
                  value="hello"
                />{/if}
            </Radio.Root>
          </Field.Item>
        {/each}
        {#if groupFocusScenario}<input id="focus-textbox" type="text" value="hello" />{/if}
      </Group>
      <Field.Error id="error" />
      <Field.Validity
        >{#snippet children(state)}<output id="validity">{JSON.stringify(state)}</output
          >{/snippet}</Field.Validity
      >
    </Field.Root>
  </Fieldset.Root>
{/snippet}
<form id="external-form"></form>
<main data-hydrated={hydrated} data-renderer="svelte5.57.1">
  {#if scenario.startsWith('standalone-')}
    <StandaloneFixture value={scenario === 'standalone-empty' ? '' : 'a'} />
  {:else}
    <DirectionProvider direction={current.rtl ? 'rtl' : 'ltr'}>
      {#if withForm}<Form
          id="form"
          onclick={() => (ancestorClicks += 1)}
          onFormSubmit={(values) => onSubmit?.(values)}
          >{@render content()}<button type="submit" id="submit">Submit</button><button
            type="reset"
            id="reset">Reset</button
          ></Form
        >{:else}{@render content()}{/if}
    </DirectionProvider>

    <button onclick={() => update({ items: ['c', 'a', 'b'] })}>Reorder</button>
    <button onclick={() => update({ items: ['a', 'c'] })}>Remove selected</button>
    <button onclick={() => update({ items: [] })}>Remove all</button>
    <button onclick={() => setValue('c')}>Programmatic</button>
    <output id="ancestor-clicks">{ancestorClicks}</output>
    <output id="calls">{JSON.stringify(calls)}</output>
    <output id="submissions">{JSON.stringify(submissions)}</output>
    <output id="validation-calls">{validationCalls}</output>
    <output id="focus-calls">{JSON.stringify(focusCalls)}</output>
  {/if}
</main>
