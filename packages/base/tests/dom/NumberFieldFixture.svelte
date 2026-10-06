<script lang="ts">
  import { untrack } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { NumberField } from '../../src/lib/number-field/index.js';
  import { Field } from '../../src/lib/field/index.js';
  import { Form } from '../../src/lib/form/index.js';
  import type {
    NumberFieldRootChangeEventDetails,
    NumberFieldRootCommitEventDetails,
    NumberFieldRootProps,
  } from '../../src/lib/number-field/types.js';
  import type { FormValidationMode } from '../../src/lib/form/types.js';
  let {
    initial = 2,
    controlled = false,
    reject = false,
    cancel = false,
    options = {},
    validationMode = 'onSubmit',
    validate,
    onChange,
    onCommit,
    preventInput = false,
    preventKey = false,
    preventStepper = false,
    replacement = false,
    withScrub = false,
  }: {
    initial?: number | undefined;
    controlled?: boolean;
    reject?: boolean;
    cancel?: boolean;
    options?: NumberFieldRootProps;
    validationMode?: FormValidationMode;
    validate?: (
      value: unknown,
      values: Record<string, unknown>,
    ) => string | null | Promise<string | null>;
    onChange?: (value: number | null, details: NumberFieldRootChangeEventDetails) => void;
    onCommit?: (value: number | null, details: NumberFieldRootCommitEventDetails) => void;
    preventInput?: boolean;
    preventKey?: boolean;
    preventStepper?: boolean;
    replacement?: boolean;
    withScrub?: boolean;
  } = $props();
  let owner = $state<number | null>(untrack(() => initial));
  let shown = $state(true);
  let hiddenInput = $state<HTMLInputElement | null>();
  let sourceRoot = $state<HTMLElement | null>();
  let sourceInput = $state<HTMLElement | null>();
  let hideInput = $state(false);
  let activeReplacement = $state(untrack(() => replacement));
  let traces = $state<unknown[]>([]);
  let submissions = $state<unknown[]>([]);
  function changed(value: number | null, details: NumberFieldRootChangeEventDetails) {
    traces.push({
      kind: 'change',
      value,
      reason: details.reason,
      direction: details.direction,
      type: details.event.type,
    });
    onChange?.(value, details);
    if (cancel) details.cancel();
    if (!details.isCanceled && controlled && !reject) owner = value;
  }
  function committed(value: number | null, details: NumberFieldRootCommitEventDetails) {
    traces.push({ kind: 'commit', value, reason: details.reason, type: details.event.type });
    onCommit?.(value, details);
  }
  export function setOwner(value: number | null) {
    owner = value;
  }
  export function toggleRoot() {
    shown = !shown;
  }
  export function toggleInput() {
    hideInput = !hideInput;
  }
  export function replaceInput() {
    activeReplacement = !activeReplacement;
  }
  export function refs() {
    return { root: sourceRoot, input: sourceInput, hidden: hiddenInput };
  }
</script>

<Form
  id="number-form"
  {validationMode}
  onFormSubmit={(values) => {
    submissions.push(values);
  }}
>
  <Field.Root name="amount" id="number-field" {validate}>
    <Field.Label id="amount-label">Amount</Field.Label>
    <Field.Description id="amount-description">A numeric amount</Field.Description>
    {#if shown}
      <NumberField.Root
        id="amount-input"
        name="ignored"
        {...options}
        defaultValue={initial}
        value={controlled ? owner : undefined}
        onValueChange={changed}
        onValueCommitted={committed}
        bind:inputRef={hiddenInput}
        bind:ref={sourceRoot}
      >
        <NumberField.Group id="number-group">
          <NumberField.Decrement
            id="decrease"
            onpointerdown={(event) => {
              if (preventStepper) event.preventBaseUIHandler();
            }}>Decrease</NumberField.Decrement
          >
          {#if !hideInput}
            <NumberField.Input
              data-testid="visible"
              oninput={(event) => {
                if (preventInput) event.preventBaseUIHandler();
              }}
              onkeydown={(event) => {
                if (preventKey) event.preventBaseUIHandler();
              }}
              bind:ref={sourceInput}
              render={activeReplacement ? customInput : undefined}
            />
          {/if}
          <NumberField.Increment
            id="increase"
            onpointerdown={(event) => {
              if (preventStepper) event.preventBaseUIHandler();
            }}>Increase</NumberField.Increment
          >
        </NumberField.Group>
        {#if withScrub}<NumberField.ScrubArea data-testid="scrub"
            ><NumberField.ScrubAreaCursor data-testid="cursor">Cursor</NumberField.ScrubAreaCursor
            >Scrub</NumberField.ScrubArea
          >{/if}
      </NumberField.Root>
    {/if}
    <Field.Error id="number-error" />
    <Field.Validity
      >{#snippet children(state)}<output id="validity">{JSON.stringify(state)}</output
        >{/snippet}</Field.Validity
    >
  </Field.Root>
  <button id="submit" type="submit">Submit</button>
</Form>
{#snippet customInput(props: HTMLInputAttributes)}<input
    {...props as HTMLInputAttributes}
    data-replacement="true"
  />{/snippet}
<output id="number-traces">{JSON.stringify(traces)}</output>
<output id="number-submissions">{JSON.stringify(submissions)}</output>
