<script lang="ts">
  import { untrack } from 'svelte';
  // Pinned Radio/RadioGroup assertion fixture adapter; MIT: parity/radio/UPSTREAM_LICENSE.
  import { Radio } from '../../src/lib/radio/index.js';
  import { RadioGroup } from '../../src/lib/radio-group/index.js';
  import { Field } from '../../src/lib/field/index.js';
  import { Form } from '../../src/lib/form/index.js';
  import { Fieldset } from '../../src/lib/fieldset/index.js';
  import DirectionProvider from '../../src/lib/direction-provider/DirectionProvider.svelte';
  import type { RadioGroupChangeEventDetails } from '../../src/lib/radio-group/types.js';
  import type { HTMLAttributes } from 'svelte/elements';
  const Group = RadioGroup<string | null>;
  let {
    initial = 'b',
    controlled = false,
    ownerAccepts = true,
    cancel = false,
    disabled = false,
    readOnly = false,
    required = false,
    disabledFirst = false,
    items = ['a', 'b', 'c'],
    rtl = false,
    nativeButton = false,
    fieldName = 'choice',
    groupName = 'fallback',
    withForm = true,
    fieldsetDisabled = false,
    onChange,
    onSubmit,
    inputRef,
    invalid = false,
    label = true,
    description = true,
    keepMounted = false,
  }: {
    initial?: string | null;
    controlled?: boolean;
    ownerAccepts?: boolean;
    cancel?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    disabledFirst?: boolean;
    items?: string[];
    rtl?: boolean;
    nativeButton?: boolean;
    fieldName?: string;
    groupName?: string;
    withForm?: boolean;
    fieldsetDisabled?: boolean;
    onChange?: (
      value: string | null,
      details: RadioGroupChangeEventDetails,
    ) => void;
    onSubmit?: (values: Record<string, unknown>) => void;
    inputRef?: (input: HTMLInputElement | null) => void;
    invalid?: boolean;
    label?: boolean;
    description?: boolean;
    keepMounted?: boolean;
  } = $props();
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
        name={current.groupName} onValueChange={changed} {inputRef}
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
<DirectionProvider direction={current.rtl ? 'rtl' : 'ltr'}>
  {#if withForm}<Form id="form" onFormSubmit={values => onSubmit?.(values)}>{@render content()}<button type="submit" id="submit">Submit</button><button type="reset" id="reset">Reset</button></Form>{:else}{@render content()}{/if}
</DirectionProvider>
