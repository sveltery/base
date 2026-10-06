<script lang="ts">
  // Source-ordered port of Base UI v1.8.0 OTPFieldRoot.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { untrack } from 'svelte';
  import { DEV } from 'esm-env';
  import { Controlled } from '@sveltery/utils/Controlled';
  import { visuallyHidden, visuallyHiddenInput } from '@sveltery/utils/visuallyHidden';
  import { toNativeStyle } from '../../internals/nativeProps.js';
  import { createLogOnce } from '@sveltery/utils/createLogOnce';
  import { ownerDocument } from '@sveltery/utils/owner';
  import { contains } from '@sveltery/utils/shadowDom';
  import { createCompositeList } from '../../internals/composite/list/createCompositeList.svelte.js';
  import { useFieldRootContext } from '../../internals/field-root-context/FieldRootContext.js';
  import { useRegisterFieldControl } from '../../internals/field-register-control/useRegisterFieldControl.svelte.js';
  import { useFieldControlNativeName } from '../../internals/field-control-name/FieldControlNameContext.js';
  import { useFormContext } from '../../internals/form-context/FormContext.js';
  import { useLabelableContext } from '../../internals/labelable-provider/LabelableContext.js';
  import { useAriaLabelledBy } from '../../internals/labelable-provider/useAriaLabelledBy.svelte.js';
  import { useLabelableId } from '../../internals/labelable-provider/useLabelableId.svelte.js';
  import { useBaseUiId } from '../../internals/useBaseUiId.js';
  import type { HTMLProps } from '../../internals/types.js';
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { ValueChanged } from '../../internals/ValueChanged.svelte.js';
  import {
    createChangeEventDetails,
    createGenericEventDetails,
  } from '../../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../../internals/reasons.js';
  import { setOTPFieldRootContext } from './OTPFieldRootContext.js';
  import { rootStateAttributesMapping } from '../utils/stateAttributesMapping.js';
  import { listenInput } from '../utils/listenInput.js';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import {
    getOTPValidationConfig,
    normalizeOTPValue,
    normalizeOTPValueWithDetails,
  } from '../utils/otp.js';
  import type {
    OTPFieldRootProps,
    OTPFieldRootState,
    OTPFieldRootChangeEventDetails,
    OTPFieldRootCompleteEventDetails,
    OTPFieldRootInvalidEventDetails,
  } from '../types.js';
  let {
    'aria-describedby': ariaDescribedByProp,
    'aria-labelledby': ariaLabelledByProp,
    id: idProp,
    autoComplete = 'one-time-code',
    defaultValue = '',
    value: valueProp,
    onValueChange,
    onValueComplete: onValueCompleteProp,
    form,
    length,
    autoSubmit = false,
    mask = false,
    inputMode: inputModeProp,
    validationType = 'numeric',
    normalizeValue,
    disabled: disabledProp = false,
    readOnly = false,
    required = false,
    name: nameProp,
    onValueInvalid,
    render,
    class: classProp,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: OTPFieldRootProps = $props();
  const field = useFieldRootContext();
  const formContext = useFormContext();
  const labelable = useLabelableContext();
  const getNativeName = useFieldControlNativeName();
  const disabled = $derived(Boolean(field.disabled || disabledProp));
  const name = $derived(field.name ?? nameProp);
  const valueState = new Controlled(
    () => valueProp,
    untrack(() => defaultValue),
  );
  const rootRef = $state<{ current: HTMLElement | null }>({ current: null });
  const inputRefs = $state<{ current: Array<HTMLElement | null> }>({
    current: [],
  });
  const pendingFocusRef = {
    current: null as { index: number; value: string } | null,
  };
  const pendingCompleteValueRef = {
    current: null as {
      value: string;
      eventDetails: OTPFieldRootCompleteEventDetails;
    } | null,
  };
  const firstInputRef = {
    get current() {
      return (inputRefs.current[0] as HTMLInputElement | null) ?? null;
    },
  };
  const nativeId = $props.id();
  const getId = useLabelableId(() => ({ id: idProp }), useBaseUiId(undefined, nativeId));
  const id = $derived(getId());
  const getAriaLabelledBy = useAriaLabelledBy(() => ({
    explicitAriaLabelledBy: ariaLabelledByProp ?? undefined,
    labelId: labelable.labelId,
    labelSource: firstInputRef.current,
    enableFallback: true,
    generatedLabelId: `${id}-label`,
  }));
  const ariaLabelledBy = $derived(getAriaLabelledBy());
  const inputAriaLabelledBy = $derived(ariaLabelledByProp == null ? ariaLabelledBy : undefined);
  const fieldDescriptionProps = $derived(labelable.getDescriptionProps({}));
  const ariaDescribedBy = $derived(
    mergeAriaIds(
      ariaDescribedByProp ?? undefined,
      fieldDescriptionProps['aria-describedby'] as string | undefined,
    ),
  );
  const validationConfig = $derived(getOTPValidationConfig(validationType));
  const pattern = $derived(validationConfig?.slotPattern);
  const hiddenInputPattern = $derived(validationConfig?.getRootPattern(length));
  const inputMode = $derived(inputModeProp ?? validationConfig?.inputMode);
  const hasValidLength = $derived(Number.isInteger(length) && length > 0);
  const value = $derived(
    normalizeOTPValue(valueState.value, length, validationType, normalizeValue),
  );
  const filled = $derived(value !== '');
  let inputCount = $state(0);
  let focusedIndex = $state(untrack(() => Math.min(value.length, length - 1)));
  let focused = $state(false);
  const activeIndex = $derived(
    focused ? Math.min(focusedIndex, Math.max(length - 1, 0)) : Math.min(value.length, length - 1),
  );
  $effect(() => {
    const currentFilled = filled;
    untrack(() => field.setFilled(currentFilled));
  });
  const warn = createLogOnce('warn', 'Base UI');
  if (DEV) {
    $effect(() => {
      if (!Number.isInteger(length) || length <= 0 || inputCount === 0 || inputCount === length)
        return;
      warn(
        '<OTPField.Root> `length` must match the number of rendered ' +
          `<OTPField.Input /> parts. Received \`length={${length}}\` but rendered ` +
          `${inputCount} input${inputCount === 1 ? '' : 's'}.`,
      );
    });
    $effect(() => {
      if (Number.isInteger(length) && length > 0) return;
      warn(
        `<OTPField.Root> \`length\` must be a positive integer. Received \`length={${String(length)}}\`.`,
      );
    });
  }
  useRegisterFieldControl(
    firstInputRef,
    () => id,
    () => value,
    undefined,
    () => !disabled,
    () => nameProp,
  );
  const focusInput = (index: number) => {
    const targetIndex = Math.min(Math.max(index, 0), Math.max(inputRefs.current.length - 1, 0));
    const target = inputRefs.current[targetIndex] as HTMLInputElement | null;
    target?.focus();
    target?.select();
  };
  const queueFocusInput = (index: number, nextValue: string) => {
    pendingFocusRef.current = { index, value: nextValue };
  };
  function requestSubmit() {
    let formElement =
      field.validation.inputRef.current?.form ?? firstInputRef.current?.form ?? null;
    if (form) {
      const associatedElement = ownerDocument(rootRef.current).getElementById(form);
      if (associatedElement?.tagName === 'FORM') formElement = associatedElement as HTMLFormElement;
    }
    if (formElement && typeof formElement.requestSubmit === 'function') formElement.requestSubmit();
  }
  function completeValue(completedValue: string, eventDetails: OTPFieldRootCompleteEventDetails) {
    onValueCompleteProp?.(completedValue, eventDetails);
    if (autoSubmit) requestSubmit();
  }
  new ValueChanged(
    () => value,
    () => () => {
      formContext.clearErrors(name);
      field.setDirty(value !== field.validityData.initialValue);
      field.validation.change(value);
      const pendingFocus = pendingFocusRef.current;
      if (pendingFocus != null) {
        pendingFocusRef.current = null;
        if (pendingFocus.value === value) focusInput(pendingFocus.index);
      }
      const pendingCompleteValue = pendingCompleteValueRef.current;
      if (pendingCompleteValue != null) {
        pendingCompleteValueRef.current = null;
        if (pendingCompleteValue.value === value)
          completeValue(value, pendingCompleteValue.eventDetails);
      }
    },
  );
  const setValue = (nextValue: string, details: OTPFieldRootChangeEventDetails) => {
    const normalizedValue = normalizeOTPValue(nextValue, length, validationType, normalizeValue);
    const canComplete =
      details.reason === REASONS.inputChange || details.reason === REASONS.inputPaste;
    const completeEventDetails =
      canComplete &&
      normalizedValue.length === length &&
      (value.length !== length || details.reason === REASONS.inputPaste)
        ? createGenericEventDetails(
            details.reason as OTPFieldRootCompleteEventDetails['reason'],
            details.event,
          )
        : null;
    if (normalizedValue === value) {
      if (completeEventDetails != null) completeValue(normalizedValue, completeEventDetails);
      return null;
    }
    onValueChange?.(normalizedValue, details);
    if (details.isCanceled) return null;
    valueState.set(normalizedValue);
    if (completeEventDetails != null)
      pendingCompleteValueRef.current = {
        value: normalizedValue,
        eventDetails: completeEventDetails,
      };
    else if (normalizedValue.length !== length) pendingCompleteValueRef.current = null;
    return normalizedValue;
  };
  const reportValueInvalid = (invalidValue: string, details: OTPFieldRootInvalidEventDetails) =>
    onValueInvalid?.(invalidValue, details);
  const handleInputFocus = (index: number, event: FocusEvent) => {
    if (index > value.length) {
      focusInput(Math.min(value.length, length - 1));
      return;
    }
    focusedIndex = index;
    focused = true;
    field.setFocused(true);
    (event.currentTarget as HTMLInputElement).select();
  };
  const handleInputBlur = (event: FocusEvent) => {
    if (contains(rootRef.current, event.relatedTarget as Element | null)) return;
    field.setTouched(true);
    focused = false;
    field.setFocused(false);
    if (field.validationMode === 'onBlur') void field.validation.commit(value);
  };
  function getInputId(index: number) {
    return id == null ? undefined : index === 0 ? id : `${id}-${index + 1}`;
  }
  const otpState: OTPFieldRootState = $derived({
    ...field.state,
    complete: value.length === length,
    disabled,
    filled,
    focused,
    length,
    readOnly,
    required,
    value,
  });
  setOTPFieldRootContext({
    get autoComplete() {
      return autoComplete;
    },
    get activeIndex() {
      return activeIndex;
    },
    get disabled() {
      return disabled;
    },
    get form() {
      return form;
    },
    focusInput,
    queueFocusInput,
    getInputId,
    handleInputBlur,
    handleInputFocus,
    get inputMode() {
      return inputMode;
    },
    get inputAriaLabelledBy() {
      return inputAriaLabelledBy;
    },
    get invalid() {
      return field.invalid;
    },
    get length() {
      return length;
    },
    get mask() {
      return mask;
    },
    get pattern() {
      return pattern;
    },
    reportValueInvalid,
    get readOnly() {
      return readOnly;
    },
    get required() {
      return required;
    },
    get normalizeValue() {
      return normalizeValue;
    },
    setValue,
    get state() {
      return otpState;
    },
    get validationType() {
      return validationType;
    },
    get value() {
      return value;
    },
  });
  createCompositeList(() => ({
    elementsRef: inputRefs,
    onMapChange(newMap) {
      inputCount = newMap.size;
    },
  }));
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      rootRef.current = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          if (rootRef.current === host) rootRef.current = null;
        });
    });
  }
  const mergedProps: HTMLProps = $derived({
    ...mergeComponentProps(
      otpState,
      { class: classProp, style },
      [
        { role: 'group', 'aria-describedby': ariaDescribedBy, 'aria-labelledby': ariaLabelledBy },
        elementProps,
      ],
      rootStateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
  const hiddenAttachmentKey = createAttachmentKey();
  function attachHiddenInput(host: HTMLElement) {
    const validation = field.validation;
    return untrack(() => {
      validation.inputRef.current = host as HTMLInputElement;
      return () =>
        untrack(() => {
          if (validation.inputRef.current === host) validation.inputRef.current = null;
        });
    });
  }
  const hiddenInputProps: HTMLProps = $derived({
    [hiddenAttachmentKey]: attachHiddenInput,
    ...field.validation.getValidationProps(disabled, {
      onfocus() {
        focusInput(0);
      },
      oninput(event: Event) {
        if (event.defaultPrevented || disabled || readOnly) return;
        const rawValue = (event.currentTarget as HTMLInputElement).value;
        const [normalizedValue, didRejectCharacters] = normalizeOTPValueWithDetails(
          rawValue,
          length,
          validationType,
          normalizeValue,
        );
        if (didRejectCharacters)
          reportValueInvalid(rawValue, createGenericEventDetails(REASONS.inputChange, event));
        const committedValue = setValue(
          normalizedValue,
          createChangeEventDetails(REASONS.inputChange, event),
        );
        if (committedValue != null && committedValue !== '')
          queueFocusInput(committedValue.length - 1, committedValue);
      },
    }),
    type: 'text',
    id: id && name == null ? `${id}-hidden-input` : undefined,
    form,
    name: getNativeName(name),
    value,
    autocomplete: autoComplete,
    inputmode: inputMode,
    minlength: length,
    maxlength: length,
    pattern: hiddenInputPattern,
    disabled,
    readonly: readOnly,
    required,
    'aria-hidden': true,
    tabindex: -1,
    style: toNativeStyle(name ? visuallyHiddenInput : visuallyHidden),
  });
  function mergeAriaIds(...values: Array<string | undefined>) {
    const ids = values.flatMap((value) => value?.split(/\s+/).filter(Boolean) ?? []);
    return ids.length > 0 ? Array.from(new Set(ids)).join(' ') : undefined;
  }
</script>

{#if render}
  {@render render(mergedProps, otpState, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
{#if hasValidLength}
  <input
    {...{ ...hiddenInputProps, oninput: undefined } as HTMLInputAttributes}
    use:listenInput={() => hiddenInputProps.oninput}
    bind:value={() => hiddenInputProps.value as string, () => undefined}
  />
{/if}
