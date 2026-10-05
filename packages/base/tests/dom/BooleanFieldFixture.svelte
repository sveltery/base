<script lang="ts">
  import { Field } from '../../src/lib/field/index.js';
  import { Form } from '../../src/lib/form/index.js';
  import { Checkbox } from '../../src/lib/checkbox/index.js';
  import { CheckboxGroup } from '../../src/lib/checkbox-group/index.js';
  import { Switch } from '../../src/lib/switch/index.js';
  import type { CheckboxRootProps } from '../../src/lib/checkbox/types.js';
  import type { FormValues } from '../../src/lib/form/types.js';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';
  import type { SwitchRootProps } from '../../src/lib/switch/types.js';
  let {
    family = 'switch',
    scenario = 'field',
    rootProps = {},
    submit,
    canceled = false,
    validation,
    errors = {},
    observeInput,
  }: {
    family?: 'switch' | 'checkbox';
    scenario?: string;
    rootProps?: CheckboxRootProps;
    submit?: (values: FormValues) => void;
    canceled?: boolean;
    validation?: (value: unknown) => string | null;
    errors?: Record<string, string>;
    observeInput?: (input: HTMLInputElement | null | undefined) => void;
  } = $props();
  let visible = $state(true);
  let inputRef = $state<HTMLInputElement | null | undefined>();
  let hostRef = $state<HTMLElement | null | undefined>();
  export function getInput() {
    return inputRef;
  }
  export function getHost() {
    return hostRef;
  }
  function publishInput(input: HTMLInputElement | null | undefined) {
    inputRef = input;
    observeInput?.(input);
  }
  let controlledChecked = $state(false);
  let groupValue = $state<string[]>([]);
  let childValue = $state('a');
  export function hide() {
    visible = false;
  }
  export function setChecked(value: boolean) {
    controlledChecked = value;
  }
  export function setGroupValue(value: string[]) {
    groupValue = value;
  }
  export function setChildValue(value: string) {
    childValue = value;
  }
</script>

{#snippet nativeButton(
  props: Record<string | symbol, unknown>,
  _state: unknown,
  children: Snippet | undefined,
)}<button {...props as HTMLButtonAttributes}>{@render children?.()}</button
  >{/snippet}
{#snippet control(props: CheckboxRootProps)}
  {#if family === 'switch'}<Switch.Root
      {...props as SwitchRootProps}
      bind:inputRef={() => inputRef, publishInput}
      bind:ref={hostRef}><Switch.Thumb data-part /></Switch.Root
    >
  {:else}<Checkbox.Root
      {...props}
      bind:inputRef={() => inputRef, publishInput}
      bind:ref={hostRef}><Checkbox.Indicator data-part /></Checkbox.Root
    >{/if}
{/snippet}
{#if scenario === 'controlled'}
  {@render control({
    ...rootProps,
    checked: controlledChecked,
    onCheckedChange: (next, details) => {
      rootProps.onCheckedChange?.(next, details);
      if (!details.isCanceled) controlledChecked = next;
    },
  })}
{:else if scenario === 'group' || scenario === 'group-uncontrolled'}
  <Form onFormSubmit={(values) => submit?.(values)}>
    <Field.Root name="choices" validate={validation}>
      <Field.Label>Choices</Field.Label>
      <CheckboxGroup
        value={scenario === 'group' ? groupValue : undefined}
        defaultValue={['a']}
        allValues={['a', 'b']}
        onValueChange={(next, details) => {
          if (canceled) details.cancel();
          if (!details.isCanceled) groupValue = next;
        }}
      >
        <Checkbox.Root parent data-parent-control />
        <Field.Item
          ><Checkbox.Root value={childValue} id="child-a" /><Field.Label
            >A</Field.Label
          ></Field.Item
        >
        <Field.Item disabled={rootProps.disabled}
          ><Checkbox.Root value="b" id="child-b" /><Field.Label>B</Field.Label
          ></Field.Item
        >
      </CheckboxGroup>
      <Field.Error />
    </Field.Root>
    <button type="submit">Submit</button>
  </Form>
{:else if scenario === 'label'}
  <label>Wrapped{@render control(rootProps)}</label>
{:else if scenario === 'native'}
  {@render control({ ...rootProps, nativeButton: true, render: nativeButton })}
{:else}
  <Form {errors} onFormSubmit={(values) => submit?.(values)}>
    <Field.Root name="enabled" validate={validation} data-field>
      <Field.Label data-label>Enabled</Field.Label>
      {#if visible}{@render control(rootProps)}{/if}
      <Field.Description data-description>Description</Field.Description>
      <Field.Error />
    </Field.Root>
    <button type="submit">Submit</button><button type="reset">Reset</button>
  </Form>
{/if}
