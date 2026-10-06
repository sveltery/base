<script lang="ts">
  import { untrack } from 'svelte';
  import Form from '../../src/lib/form/Form.svelte';
  import CheckboxRoot from '../../src/lib/checkbox/root/CheckboxRoot.svelte';
  import CheckboxGroup from '../../src/lib/checkbox-group/CheckboxGroup.svelte';
  import RadioRoot from '../../src/lib/radio/root/RadioRoot.svelte';
  import RadioGroup from '../../src/lib/radio-group/RadioGroup.svelte';
  // @ts-expect-error Actual installed Kit helper has no declarations; test-only runtime probe.
  import { create_field_proxy } from '../../../../apps/fixtures/node_modules/@sveltejs/kit/src/runtime/form-utils.js';
  let {
    mode = 'boolean',
    initial = {},
    submitted,
    cancel = false,
  }: {
    mode?: 'boolean' | 'array' | 'group' | 'nested' | 'radio';
    initial?: Record<string, unknown>;
    submitted?: (values: Record<string, unknown>) => void;
    cancel?: boolean;
  } = $props();
  let input = $state.raw(untrack(() => initial));
  let phase = $state<unknown[]>([]),
    changes = $state<unknown[]>([]);
  const fields = create_field_proxy(
    {},
    () => input,
    (path: (string | number)[], value: unknown) => {
      input = { ...untrack(() => input), [path[0]]: value };
    },
    () => ({}),
  );
  const remote = { fields };
  export function ownerSet(values: Record<string, unknown>) {
    input = values;
  }
</script>

<Form
  {remote}
  onFormSubmit={submitted}
  oninput={(event) => {
    const node = event.target as HTMLInputElement;
    phase.push({
      value: node.value,
      checked: node.checked,
      successfulValues: [...new FormData(node.form!)],
    });
  }}
>
  {#snippet children(Field)}
    {#if mode === 'boolean'}
      <Field.Root name="enabled"><Field.Control {...fields.enabled.as('checkbox')} /></Field.Root>
    {:else if mode === 'array'}
      <Field.Root name="choices"
        ><Field.Control {...fields.choices.as('checkbox', 'a')} /></Field.Root
      >
    {:else if mode === 'group'}
      <Field.Root name="choices">
        <CheckboxGroup
          value={fields.choices.value() ?? []}
          onValueChange={(value, details) => {
            changes.push(value);
            if (cancel) details.cancel();
            else fields.choices.set(value);
          }}
        >
          <Field.Root name="choices" as="checkbox" value="a">
            <Field.Control>
              {#snippet render(props)}<CheckboxRoot {...props} data-option="a" />{/snippet}
            </Field.Control>
          </Field.Root>
        </CheckboxGroup>
      </Field.Root>
    {:else if mode === 'radio'}
      <Field.Root name="choice">
        <RadioGroup
          value={fields.choice.value() ?? null}
          onValueChange={(value) => {
            changes.push(value);
            fields.choice.set(value);
          }}
        >
          <Field.Control
            {...fields.choice.as('radio', 3)}
            name={fields.choice.as('number').name}
            defaultChecked={true}
          >
            {#snippet render(props, state)}
              <RadioRoot
                {...props}
                value={props.value}
                data-option="3"
                data-render-checked={String(state.checked)}
              />
            {/snippet}
          </Field.Control>
          <Field.Control {...fields.choice.as('radio', 4)} name={fields.choice.as('number').name}>
            {#snippet render(props)}<RadioRoot
                {...props}
                value={props.value}
                data-option="4"
              />{/snippet}
          </Field.Control>
        </RadioGroup>
      </Field.Root>
    {:else}
      <Field.Root name="choices" as="checkbox" value="a">
        <Field.Control>
          {#snippet render(props)}
            <CheckboxGroup
              value={fields.choices.value() ?? []}
              onValueChange={(value, details) => {
                changes.push(value);
                if (cancel) details.cancel();
                else fields.choices.set(value);
              }}
            >
              <CheckboxRoot {...props} data-option="a" />
            </CheckboxGroup>
          {/snippet}
        </Field.Control>
      </Field.Root>
    {/if}
  {/snippet}
</Form>
<output data-owner>{JSON.stringify(input)}</output><output data-phase
  >{JSON.stringify(phase)}</output
><output data-changes>{JSON.stringify(changes)}</output>
