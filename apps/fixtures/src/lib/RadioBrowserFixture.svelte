<script lang="ts">
  import { onMount, untrack } from 'svelte';
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
  const initial = scenario.includes('empty') ? null : 'b';
  const controlled = scenario.startsWith('controlled');
  const ownerAccepts = !scenario.includes('reject');
  const cancel = scenario.includes('cancel');
  const disabled =
    scenario.includes('disabled') && !scenario.includes('first-disabled');
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
  let submissions = $state<unknown[]>([]);
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
    if (current.controlled && current.ownerAccepts && !details.isCanceled)
      owner = value;
  }
</script>
{#snippet content()}
  <Fieldset.Root disabled={current.fieldsetDisabled}>
    <Fieldset.Legend id="legend">Legend</Fieldset.Legend>
    <Field.Root name={current.fieldName} id="field" invalid={current.invalid}>
      {#if current.label}<Field.Label id="group-label">Group</Field.Label>{/if}
      {#if current.description}<Field.Description id="description">Description</Field.Description>{/if}
      <Group
        id="radio-group" defaultValue={current.initial}
        value={current.controlled ? owner : undefined}
        disabled={current.disabled} readOnly={current.readOnly} required={current.required}
        name={current.groupName} onValueChange={changed} {inputRef} {form}
      >
        {#each current.items as value (value)}
          <Field.Item>
            <Field.Label id={`label-${value}`}>{value}</Field.Label>
            <Radio.Root {value} id={`input-${value}`} data-testid={`radio-${value}`} nativeButton={current.nativeButton} disabled={current.disabledFirst && value === 'a'}>
              {#snippet render(props, _state, children)}
                {#if current.nativeButton}<button {...props as HTMLAttributes<HTMLButtonElement>}>{@render children?.()}</button>{:else}<span {...props as HTMLAttributes<HTMLSpanElement>}>{@render children?.()}</span>{/if}
              {/snippet}
              <Radio.Indicator data-testid={`indicator-${value}`} keepMounted={current.keepMounted} />
            </Radio.Root>
          </Field.Item>
        {/each}
      </Group>
      <Field.Error id="error" />
      <Field.Validity>{#snippet children(state)}<output id="validity">{JSON.stringify(state)}</output>{/snippet}</Field.Validity>
    </Field.Root>
  </Fieldset.Root>
{/snippet}
<main data-hydrated={hydrated} data-renderer="svelte5.57.1">
<DirectionProvider direction={current.rtl ? 'rtl' : 'ltr'}>
  {#if withForm}<Form id="form" onFormSubmit={values => onSubmit?.(values)}>{@render content()}<button type="submit" id="submit">Submit</button><button type="reset" id="reset">Reset</button></Form>{:else}{@render content()}{/if}
</DirectionProvider>

<button onclick={() => update({ items: ['c', 'a', 'b'] })}>Reorder</button>
<button onclick={() => update({ items: ['a', 'c'] })}>Remove selected</button>
<button onclick={() => update({ items: [] })}>Remove all</button>
<button onclick={() => setValue('c')}>Programmatic</button>
<output id="calls">{JSON.stringify(calls)}</output>
<output id="submissions">{JSON.stringify(submissions)}</output>
</main>
