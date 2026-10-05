<script lang="ts" generics="Value">
  import { untrack } from 'svelte';
  // Source-ordered port of Base UI v1.8.0 RadioGroup.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import CompositeRoot from '../internals/composite/root/CompositeRoot.svelte';
  import { SHIFT } from '../internals/composite/composite.js';
  import { Controlled } from '@sveltery/utils/Controlled';

  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { contains } from '@sveltery/utils/shadowDom';
  import { useFieldRootContext } from '../internals/field-root-context/FieldRootContext.js';
  import { useRegisterFieldControl } from '../internals/field-register-control/useRegisterFieldControl.svelte.js';
  import { fieldValidityMapping } from '../internals/field-constants/constants.js';
  import { isEligibleInput } from '../field/root/useFieldValidation.svelte.js';
  import { useFieldsetRootContext } from '../fieldset/root/FieldsetRootContext.js';
  import { useFormContext } from '../internals/form-context/FormContext.js';
  import { useLabelableContext } from '../internals/labelable-provider/LabelableContext.js';
  import { ValueChanged } from '../internals/ValueChanged.svelte.js';
  import { setRadioGroupContext } from './RadioGroupContext.js';
  import type {
    RadioGroupProps,
    RadioGroupState,
    RadioGroupChangeEventDetails,
  } from './types.js';
  import type { HTMLProps } from '../internals/types.js';
  const modifierKeys = [SHIFT];
  let {
    render,
    class: classProp,
    disabled: disabledProp,
    readOnly,
    required,
    onValueChange,
    value: externalValue,
    defaultValue,
    form,
    name: nameProp,
    inputRef = $bindable(),
    id: idProp,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: RadioGroupProps<Value> = $props();
  const field = useFieldRootContext();
  const labelable = useLabelableContext();
  const formContext = useFormContext();
  const fieldset = useFieldsetRootContext(true);
  const disabled = $derived(field.disabled || disabledProp);
  const name = $derived(field.name ?? nameProp);
  const nativeId = $props.id();
  const id = $derived(useBaseUiId(idProp ?? undefined, nativeId));
  const checkedValueState = new Controlled(
    () => externalValue,
    untrack(() => defaultValue),
  );
  const checkedValue = $derived(checkedValueState.value);
  let touched = $state(false);
  const setCheckedValue = (
    value: Value,
    details: RadioGroupChangeEventDetails,
  ) => {
    onValueChange?.(value, details);
    if (details.isCanceled) return;
    checkedValueState.set(value);
  };
  const controlRef = {
    get current() {
      return field.validation.getInputControl();
    },
  };
  const groupInputRef = { current: null as HTMLInputElement | null };
  const firstEnabledInputRef = { current: null as HTMLInputElement | null };
  function setInputRef(input: HTMLInputElement | null) {
    untrack(() => {
      inputRef = input;
    });
    groupInputRef.current = input;
  }
  const registerInputRef = (input: HTMLInputElement | null) => {
    if (!input || input.disabled) return;
    if (!firstEnabledInputRef.current) firstEnabledInputRef.current = input;
    const currentInput = groupInputRef.current;
    if (input.checked || currentInput == null || currentInput.disabled)
      setInputRef(input);
    return () => {
      if (firstEnabledInputRef.current === input)
        firstEnabledInputRef.current = null;
      if (groupInputRef.current === input) setInputRef(null);
    };
  };
  const getFormValue = () => {
    const formElement = formContext.elementRef.current;
    if (!formElement) return checkedValue ?? null;
    for (const input of field.validation.registeredInputs.keys()) {
      if (
        'checked' in input &&
        input.checked &&
        isEligibleInput(input, formElement)
      )
        return checkedValue ?? null;
    }
    return null;
  };
  useRegisterFieldControl(
    controlRef,
    () => id,
    () => checkedValue ?? null,
    getFormValue,
    () => !disabled,
    () => nameProp,
  );
  new ValueChanged(
    () => checkedValue,
    () => () => {
      formContext.clearErrors(name);
      field.setDirty(checkedValue !== field.validityData.initialValue);
      field.setFilled(checkedValue != null);
      field.validation.change(checkedValue);
      const fallbackInput = firstEnabledInputRef.current;
      if (checkedValue == null && fallbackInput && !fallbackInput.disabled)
        void setInputRef(fallbackInput);
    },
  );
  const ariaLabelledBy = $derived(labelable.labelId ?? fieldset?.legendId);
  const groupState: RadioGroupState = $derived({
    ...field.state,
    disabled: disabled ?? false,
    required: required ?? false,
    readOnly: readOnly ?? false,
  });
  setRadioGroupContext<Value>({
    get checkedValue() {
      return checkedValue;
    },
    get disabled() {
      return disabled;
    },
    get form() {
      return form;
    },
    validation: field.validation,
    get name() {
      return name;
    },
    get readOnly() {
      return readOnly;
    },
    registerInputRef,
    get required() {
      return required;
    },
    setCheckedValue,
    setTouched(value) {
      touched = value;
    },
    get touched() {
      return touched;
    },
  });
  const defaultProps = $derived({
    id: idProp,
    role: 'radiogroup',
    'aria-required': required || undefined,
    'aria-disabled': disabled || undefined,
    'aria-readonly': readOnly || undefined,
    'aria-labelledby': ariaLabelledBy,
    onfocusin() {
      field.setFocused(true);
    },
    onfocusout(event: FocusEvent) {
      if (
        !contains(
          event.currentTarget as Element,
          event.relatedTarget as Element | null,
        )
      ) {
        field.setTouched(true);
        field.setFocused(false);
        if (field.validationMode === 'onBlur')
          void field.validation.commit(checkedValue);
      }
    },
    onkeydowncapture(event: KeyboardEvent) {
      if (event.key.startsWith('Arrow')) {
        touched = true;
        field.setFocused(true);
      }
    },
  });
  const rendererProps = $derived([
    defaultProps,
    elementProps,
    (props: HTMLProps) =>
      field.validation.getValidationProps(disabled ?? false, props),
  ]);
</script>

<CompositeRoot
  {render}
  class={classProp}
  {style}
  state={groupState}
  props={rendererProps}
  bind:ref
  stateAttributesMapping={fieldValidityMapping}
  enableHomeAndEndKeys={false}
  {modifierKeys}
  {children}
/>
