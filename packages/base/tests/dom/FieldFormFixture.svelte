<script lang="ts">
  // Pinned Field/Form fixture adaptation; MIT: parity/field-form/UPSTREAM_LICENSE.
  import { Field } from '../../src/lib/field/index.js';
  import { Form } from '../../src/lib/form/index.js';
  import { Fieldset } from '../../src/lib/fieldset/index.js';
  import Input from '../../src/lib/input/Input.svelte';
  import { untrack } from 'svelte';
  import type { HTMLTextareaAttributes } from 'svelte/elements';
  import type { FieldRootProps, FieldRootActions } from '../../src/lib/field/types.js';
  import type { FormActions, FormErrors, FormValidationMode, FormSubmitEventDetails } from '../../src/lib/form/types.js';
  import type { InputChangeEventDetails } from '../../src/lib/input/types.js';
  let { validate, onFormSubmit, onsubmit, onValueChange, mode = 'onSubmit', initial = '', controlled = false, inputPart = false, noForm = false, initialErrors }: {
    validate?: FieldRootProps['validate']; onFormSubmit?: (values: Record<string, unknown>, details: FormSubmitEventDetails) => void;
    onsubmit?: (event: SubmitEvent) => void; onValueChange?: (value: string, details: InputChangeEventDetails) => void;
    mode?: FormValidationMode; initial?: string; controlled?: boolean; inputPart?: boolean; noForm?: boolean; initialErrors?: FormErrors;
  } = $props();
  let value = $state(untrack(() => initial)), secondValue = $state('second');
  let config = $state({ disabled: false, fieldsetDisabled: false, invalid: undefined as boolean | undefined,
    dirty: undefined as boolean | undefined, touched: undefined as boolean | undefined, fieldName: 'email' as string | undefined,
    controlName: 'fallback' as string | undefined, controlId: 'control-a' as string | undefined,
    description: true, secondDescription: false, label: true, item: false, nativeLabel: true,
    errorMatch: undefined as boolean | keyof ValidityState | undefined, second: false, secondFirst: false,
    control: true, field: true, fieldMode: undefined as FormValidationMode | undefined,
    debounce: 0, required: false, type: 'text', defaultValue: untrack(() => initial), externalForm: undefined as string | undefined,
    textarea: false, preventInput: false, cancelValue: false,
  });
  let errors = $state.raw<FormErrors | undefined>(untrack(() => initialErrors));
  let actions = $state.raw<{ current: FormActions | null }>({ current: null });
  let fieldActions = $state.raw<{ current: FieldRootActions | null }>({ current: null });
  export function update(options: Partial<typeof config>) { Object.assign(config, options); }
  export function setValue(next: string) { value = next; }
  export function setSecondValue(next: string) { secondValue = next; }
  export function setErrors(next: FormErrors | undefined) { errors = next; }
  export function validateForm(name?: string) { actions.current?.validate(name); }
  export function validateField() { fieldActions.current?.validate(); }
  export function getActions() { return [actions.current, fieldActions.current]; }
  function change(next: string, details: InputChangeEventDetails) {
    if (config.cancelValue) details.cancel();
    onValueChange?.(next, details);
  }
</script>
{#snippet replacement(nativeProps: Record<string | symbol, unknown>)}<textarea {...nativeProps as HTMLTextareaAttributes}></textarea>{/snippet}
{#snippet firstField()}
  {#if config.field}
    <Field.Root id="field" name={config.fieldName} disabled={config.disabled} invalid={config.invalid} dirty={config.dirty} touched={config.touched} {validate} validationMode={config.fieldMode} validationDebounceTime={config.debounce} actionsRef={fieldActions}>
      {#if config.label}<Field.Label id="field-label" nativeLabel={config.nativeLabel}>Email</Field.Label>{/if}
      {#if config.description}<Field.Description id="description">Description</Field.Description>{/if}
      {#if config.secondDescription}<Field.Description id="description-two">Second description</Field.Description>{/if}
      {#if config.control}
        {#if inputPart}<Input id={config.controlId} name={config.controlName} value={controlled ? value : undefined} defaultValue={config.defaultValue} required={config.required} type={config.type} form={config.externalForm} onValueChange={change} oninput={(event) => { if (config.preventInput) event.preventBaseUIHandler(); }} render={config.textarea ? replacement : undefined} aria-describedby="external external" />
        {:else}<Field.Control id={config.controlId} name={config.controlName} value={controlled ? value : undefined} defaultValue={config.defaultValue} required={config.required} type={config.type} form={config.externalForm} onValueChange={change} oninput={(event) => { if (config.preventInput) event.preventBaseUIHandler(); }} render={config.textarea ? replacement : undefined} aria-describedby="external external" />{/if}
      {/if}
      {#if config.item}<Field.Item id="item" disabled><Field.Label id="item-label">Item</Field.Label><Field.Description id="item-description">Item description</Field.Description></Field.Item>{/if}
      <Field.Error id="error" match={config.errorMatch} />
      <Field.Validity>{#snippet children(state)}<output id="validity">{JSON.stringify(state)}</output>{/snippet}</Field.Validity>
    </Field.Root>
  {/if}
{/snippet}
{#snippet secondField()}
  {#if config.second}<Field.Root id="second-field" name="second"><Field.Label>Second</Field.Label><Field.Control id="second-control" value={secondValue} required onValueChange={(next) => secondValue = next} /><Field.Error id="second-error" /></Field.Root>{/if}
{/snippet}
{#snippet contents()}
  <Fieldset.Root id="fieldset" disabled={config.fieldsetDisabled}>
    <Fieldset.Legend id="legend">Account</Fieldset.Legend>
    {#if config.secondFirst}{@render secondField()}{/if}
    {@render firstField()}
    {#if !config.secondFirst}{@render secondField()}{/if}
  </Fieldset.Root>
  <button type="submit" id="submit">Submit</button><button type="reset" id="reset">Reset</button>
{/snippet}
{#if noForm}{@render contents()}{:else}<Form id="form" validationMode={mode} {errors} {onsubmit} {onFormSubmit} actionsRef={actions}>{@render contents()}</Form>{/if}
<form id="other-form"></form>
