<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  import { untrack } from 'svelte';
  // Source business port of Base UI v1.8.0 CheckboxGroup.tsx. MIT.
  import { Controlled } from '@sveltery/utils/Controlled';

  import { EMPTY_ARRAY } from '@sveltery/utils/empty';
  import { areArraysEqual } from '@sveltery/utils/areArraysEqual';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { setCheckboxGroupContext } from './CheckboxGroupContext.js';
  import { isEligibleInput } from '../field/root/useFieldValidation.svelte.js';
  import { useFieldRootContext } from '../internals/field-root-context/FieldRootContext.js';
  import { useRegisterFieldControl } from '../internals/field-register-control/useRegisterFieldControl.svelte.js';
  import { useLabelableContext } from '../internals/labelable-provider/LabelableContext.js';
  import { useLabelableId } from '../internals/labelable-provider/useLabelableId.svelte.js';
  import { fieldValidityMapping } from '../internals/field-constants/constants.js';
  import { useCheckboxGroupParent } from './useCheckboxGroupParent.svelte.js';
  import { useFormContext } from '../internals/form-context/FormContext.js';
  import { ValueChanged } from '../internals/ValueChanged.svelte.js';
  import type {
    CheckboxGroupProps,
    CheckboxGroupState,
    CheckboxGroupChangeEventDetails,
  } from './types.js';
  let {
    allValues,
    class: classProp,
    defaultValue: defaultValueProp,
    disabled: disabledProp = false,
    id: idProp,
    onValueChange,
    render,
    value: externalValue,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: CheckboxGroupProps = $props();
  const field = useFieldRootContext();
  const labelable = useLabelableContext();
  const form = useFormContext();
  const disabled = $derived(Boolean(field.disabled || disabledProp));
  const valueState = new Controlled(
    () => externalValue,
    untrack(() => defaultValueProp ?? (EMPTY_ARRAY as string[])),
  );
  const value = $derived(valueState.value);
  const setValue = (nextValue: string[], details: CheckboxGroupChangeEventDetails) => {
    onValueChange?.(nextValue, details);
    if (details.isCanceled) return;
    valueState.set(nextValue);
  };
  const parent = useCheckboxGroupParent(() => ({
    allValues,
    value,
    onValueChange: setValue,
  }));
  const instanceId = $props.id();
  useLabelableId(() => ({ id: null }), useBaseUiId(undefined, `${instanceId}-control`));
  const defaultId = useBaseUiId(undefined, instanceId);
  const id = $derived(idProp ?? defaultId);
  const controlRef = {
    get current() {
      return field.validation.getInputControl();
    },
  };
  const getFormValue = () => {
    const formElement = form.elementRef.current;
    if (!formElement) return value;
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- source snapshot collector is not reactive state
    const successfulValues = new Set<string>();
    for (const [input, registration] of field.validation.registeredInputs) {
      if (
        registration.value !== undefined &&
        'checked' in input &&
        input.checked &&
        isEligibleInput(input, formElement)
      )
        successfulValues.add(registration.value);
    }
    return value.filter((inputValue) => successfulValues.has(inputValue));
  };
  useRegisterFieldControl(
    controlRef,
    () => id,
    () => value,
    getFormValue,
    () => Boolean(field.name) && !disabled,
    () => field.name,
  );
  $effect(() => field.setFilled(value.length > 0));
  new ValueChanged(
    () => value,
    () => () => {
      if (field.name) form.clearErrors(field.name);
      const initialValue = Array.isArray(field.validityData.initialValue)
        ? (field.validityData.initialValue as readonly string[])
        : EMPTY_ARRAY;
      field.setDirty(!areArraysEqual(value, initialValue));
      field.validation.change(value);
    },
  );
  const groupState: CheckboxGroupState = $derived({ ...field.state, disabled });
  setCheckboxGroupContext({
    get allValues() {
      return allValues;
    },
    get value() {
      return value;
    },
    setValue,
    parent,
    get disabled() {
      return disabled;
    },
    validation: field.validation,
    registerControlId: labelable.registerControlId,
  });

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      groupState,
      { class: classProp, style: style },
      [
        { id: idProp, role: 'group', 'aria-labelledby': labelable.labelId },
        elementProps,
        labelable.getDescriptionProps,
      ],
      fieldValidityMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, groupState, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
