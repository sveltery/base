<script lang="ts" generics="Value">
  // Source-ordered port of Base UI v1.8.0 RadioGroup.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import CompositeRoot from '../internals/composite/root/CompositeRoot.svelte';
  import { SHIFT } from '../internals/composite/composite.js';
  import { useControlled } from '../utils/useControlled.svelte.js';
  import { useStableCallback } from '../utils/useStableCallback.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { contains } from '../utils/shadowDom.js';
  import { useFieldRootContext } from '../internals/field-root-context/FieldRootContext.js';
  import { useRegisterFieldControl } from '../internals/field-register-control/useRegisterFieldControl.svelte.js';
  import { fieldValidityMapping } from '../internals/field-constants/constants.js';
  import { isEligibleInput } from '../field/root/useFieldValidation.svelte.js';
  import { useFieldsetRootContext } from '../fieldset/root/FieldsetRootContext.js';
  import { useFormContext } from '../internals/form-context/FormContext.js';
  import { useLabelableContext } from '../internals/labelable-provider/LabelableContext.js';
  import { useValueChanged } from '../internals/useValueChanged.svelte.js';
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
    inputRef,
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
  const [getCheckedValue, setCheckedValueUnwrapped] = useControlled(() => ({
    controlled: externalValue,
    default: defaultValue,
    name: 'RadioGroup',
    state: 'value',
  }));
  const checkedValue = $derived(getCheckedValue());
  let touched = $state(false);
  const setCheckedValue = useStableCallback(
    (value: Value, details: RadioGroupChangeEventDetails) => {
      onValueChange?.(value, details);
      if (details.isCanceled) return;
      setCheckedValueUnwrapped(value);
    },
  );
  const controlRef = {
    get current() {
      return field.validation.getInputControl();
    },
  };
  const groupInputRef = { current: null as HTMLInputElement | null };
  const firstEnabledInputRef = { current: null as HTMLInputElement | null };
  function setInputRef(input: HTMLInputElement | null) {
    let cleanup: void | (() => void) = undefined;
    if (typeof inputRef === 'function') cleanup = inputRef(input);
    else if (inputRef) inputRef.current = input;
    groupInputRef.current = input;
    return cleanup;
  }
  const registerInputRef = useStableCallback((input: HTMLInputElement | null) => {
    if (!input || input.disabled) return;
    if (!firstEnabledInputRef.current) firstEnabledInputRef.current = input;
    const currentInput = groupInputRef.current;
    const cleanup =
      input.checked || currentInput == null || currentInput.disabled
        ? setInputRef(input)
        : undefined;
    return () => {
      if (firstEnabledInputRef.current === input)
        firstEnabledInputRef.current = null;
      if (groupInputRef.current === input) {
        if (cleanup) {
          cleanup();
          groupInputRef.current = null;
        } else void setInputRef(null);
      } else cleanup?.();
    };
  });
  const getFormValue = useStableCallback(() => {
    const formElement = formContext.elementRef.current;
    if (!formElement) return checkedValue ?? null;
    for (const input of field.validation.registeredInputs.keys()) {
      if (input.checked && isEligibleInput(input, formElement))
        return checkedValue ?? null;
    }
    return null;
  });
  useRegisterFieldControl(
    controlRef,
    () => id,
    () => checkedValue ?? null,
    getFormValue,
    () => !disabled,
    () => nameProp,
  );
  useValueChanged(
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
    onfocus() {
      field.setFocused(true);
    },
    onblur(event: FocusEvent) {
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
  const forwardedRef = {
    get current() {
      return ref ?? null;
    },
    set current(value: HTMLElement | null) {
      ref = value;
    },
  };
  const rendererProps = $derived([
    defaultProps,
    elementProps,
    (props: HTMLProps) =>
      field.validation.getValidationProps(disabled ?? false, props),
  ]);
</script>
<CompositeRoot {render} class={classProp} {style} state={groupState} props={rendererProps} refs={[forwardedRef]} stateAttributesMapping={fieldValidityMapping} enableHomeAndEndKeys={false} {modifierKeys} {children} />
