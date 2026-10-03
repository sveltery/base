<script lang="ts">
  // Source-ordered port of Base UI v1.8.0 OTPFieldRoot.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { untrack } from "svelte";
  import { DEV } from "esm-env";
  import { useControlled } from "../../utils/useControlled.svelte.js";
  import { useIsoLayoutEffect } from "../../utils/useIsoLayoutEffect.svelte.js";
  import { useStableCallback } from "../../utils/useStableCallback.js";
  import {
    visuallyHidden,
    visuallyHiddenInput,
  } from "../../utils/visuallyHidden.js";
  import { toNativeStyle } from "../../internals/nativeProps.js";
  import { createLogOnce } from "../../utils/createLogOnce.js";
  import { ownerDocument } from "../../utils/owner.js";
  import { contains } from "../../utils/shadowDom.js";
  import { createCompositeList } from "../../internals/composite/list/createCompositeList.svelte.js";
  import { useFieldRootContext } from "../../internals/field-root-context/FieldRootContext.js";
  import { useRegisterFieldControl } from "../../internals/field-register-control/useRegisterFieldControl.svelte.js";
  import { useFieldControlNativeName } from "../../internals/field-control-name/FieldControlNameContext.js";
  import { useFormContext } from "../../internals/form-context/FormContext.js";
  import { useLabelableContext } from "../../internals/labelable-provider/LabelableContext.js";
  import { useAriaLabelledBy } from "../../internals/labelable-provider/useAriaLabelledBy.svelte.js";
  import { useLabelableId } from "../../internals/labelable-provider/useLabelableId.svelte.js";
  import { useBaseUiId } from "../../internals/useBaseUiId.js";
  import RenderElement from "../../internals/RenderElement.svelte";
  import { useValueChanged } from "../../internals/useValueChanged.svelte.js";
  import {
    createChangeEventDetails,
    createGenericEventDetails,
  } from "../../internals/createBaseUIEventDetails.js";
  import { REASONS } from "../../internals/reasons.js";
  import { setOTPFieldRootContext } from "./OTPFieldRootContext.js";
  import { rootStateAttributesMapping } from "../utils/stateAttributesMapping.js";
  import {
    getOTPValidationConfig,
    normalizeOTPValue,
    normalizeOTPValueWithDetails,
  } from "../utils/otp.js";
  import type {
    OTPFieldRootProps,
    OTPFieldRootState,
    OTPFieldRootChangeEventDetails,
    OTPFieldRootCompleteEventDetails,
    OTPFieldRootInvalidEventDetails,
  } from "../types.js";
  let {
    "aria-describedby": ariaDescribedByProp,
    "aria-labelledby": ariaLabelledByProp,
    id: idProp,
    autoComplete = "one-time-code",
    defaultValue = "",
    value: valueProp,
    onValueChange,
    onValueComplete: onValueCompleteProp,
    form,
    length,
    autoSubmit = false,
    mask = false,
    inputMode: inputModeProp,
    validationType = "numeric",
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
  const [getValueUnwrapped, setValueUnwrapped] = useControlled(() => ({
    controlled: valueProp,
    default: defaultValue,
    name: "OTPField",
    state: "value",
  }));
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
  const getId = useLabelableId(
    () => ({ id: idProp }),
    useBaseUiId(undefined, nativeId),
  );
  const id = $derived(getId());
  const getAriaLabelledBy = useAriaLabelledBy(() => ({
    explicitAriaLabelledBy: ariaLabelledByProp ?? undefined,
    labelId: labelable.labelId,
    labelSource: firstInputRef.current,
    enableFallback: true,
    generatedLabelId: `${id}-label`,
  }));
  const ariaLabelledBy = $derived(getAriaLabelledBy());
  const inputAriaLabelledBy = $derived(
    ariaLabelledByProp == null ? ariaLabelledBy : undefined,
  );
  const fieldDescriptionProps = $derived(labelable.getDescriptionProps({}));
  const ariaDescribedBy = $derived(
    mergeAriaIds(
      ariaDescribedByProp ?? undefined,
      fieldDescriptionProps["aria-describedby"] as string | undefined,
    ),
  );
  const validationConfig = $derived(getOTPValidationConfig(validationType));
  const pattern = $derived(validationConfig?.slotPattern);
  const hiddenInputPattern = $derived(validationConfig?.getRootPattern(length));
  const inputMode = $derived(inputModeProp ?? validationConfig?.inputMode);
  const hasValidLength = $derived(Number.isInteger(length) && length > 0);
  const value = $derived(
    normalizeOTPValue(
      getValueUnwrapped(),
      length,
      validationType,
      normalizeValue,
    ),
  );
  const filled = $derived(value !== "");
  let inputCount = $state(0);
  let focusedIndex = $state(untrack(() => Math.min(value.length, length - 1)));
  let focused = $state(false);
  const activeIndex = $derived(
    focused
      ? Math.min(focusedIndex, Math.max(length - 1, 0))
      : Math.min(value.length, length - 1),
  );
  useIsoLayoutEffect(
    () => field.setFilled(filled),
    () => [filled, field.setFilled],
  );
  const warn = createLogOnce("warn", "Base UI");
  if (DEV) {
    $effect(() => {
      if (
        !Number.isInteger(length) ||
        length <= 0 ||
        inputCount === 0 ||
        inputCount === length
      )
        return;
      warn(
        "<OTPField.Root> `length` must match the number of rendered " +
          `<OTPField.Input /> parts. Received \`length={${length}}\` but rendered ` +
          `${inputCount} input${inputCount === 1 ? "" : "s"}.`,
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
  const focusInput = useStableCallback((index: number) => {
    const targetIndex = Math.min(
      Math.max(index, 0),
      Math.max(inputRefs.current.length - 1, 0),
    );
    const target = inputRefs.current[targetIndex] as HTMLInputElement | null;
    target?.focus();
    target?.select();
  });
  const queueFocusInput = useStableCallback(
    (index: number, nextValue: string) => {
      pendingFocusRef.current = { index, value: nextValue };
    },
  );
  function requestSubmit() {
    let formElement =
      field.validation.inputRef.current?.form ??
      firstInputRef.current?.form ??
      null;
    if (form) {
      const associatedElement = ownerDocument(rootRef.current).getElementById(
        form,
      );
      if (associatedElement?.tagName === "FORM")
        formElement = associatedElement as HTMLFormElement;
    }
    if (formElement && typeof formElement.requestSubmit === "function")
      formElement.requestSubmit();
  }
  function completeValue(
    completedValue: string,
    eventDetails: OTPFieldRootCompleteEventDetails,
  ) {
    onValueCompleteProp?.(completedValue, eventDetails);
    if (autoSubmit) requestSubmit();
  }
  useValueChanged(
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
  const setValue = useStableCallback(
    (nextValue: string, details: OTPFieldRootChangeEventDetails) => {
      const normalizedValue = normalizeOTPValue(
        nextValue,
        length,
        validationType,
        normalizeValue,
      );
      const canComplete =
        details.reason === REASONS.inputChange ||
        details.reason === REASONS.inputPaste;
      const completeEventDetails =
        canComplete &&
        normalizedValue.length === length &&
        (value.length !== length || details.reason === REASONS.inputPaste)
          ? createGenericEventDetails(
              details.reason as OTPFieldRootCompleteEventDetails["reason"],
              details.event,
            )
          : null;
      if (normalizedValue === value) {
        if (completeEventDetails != null)
          completeValue(normalizedValue, completeEventDetails);
        return null;
      }
      onValueChange?.(normalizedValue, details);
      if (details.isCanceled) return null;
      setValueUnwrapped(normalizedValue);
      if (completeEventDetails != null)
        pendingCompleteValueRef.current = {
          value: normalizedValue,
          eventDetails: completeEventDetails,
        };
      else if (normalizedValue.length !== length)
        pendingCompleteValueRef.current = null;
      return normalizedValue;
    },
  );
  const reportValueInvalid = useStableCallback(
    (invalidValue: string, details: OTPFieldRootInvalidEventDetails) =>
      onValueInvalid?.(invalidValue, details),
  );
  const handleInputFocus = useStableCallback(
    (index: number, event: FocusEvent) => {
      if (index > value.length) {
        focusInput(Math.min(value.length, length - 1));
        return;
      }
      focusedIndex = index;
      focused = true;
      field.setFocused(true);
      (event.currentTarget as HTMLInputElement).select();
    },
  );
  const handleInputBlur = useStableCallback((event: FocusEvent) => {
    if (contains(rootRef.current, event.relatedTarget as Element | null)) return;
    field.setTouched(true);
    focused = false;
    field.setFocused(false);
    if (field.validationMode === "onBlur") void field.validation.commit(value);
  });
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
  const forwardedRef = {
    get current() {
      return ref ?? null;
    },
    set current(value: HTMLElement | null) {
      ref = value;
    },
  };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({
    ref: [forwardedRef, rootRef],
    state: otpState,
    props: [
      {
        role: "group",
        "aria-describedby": ariaDescribedBy,
        "aria-labelledby": ariaLabelledBy,
      },
      elementProps,
    ],
    stateAttributesMapping: rootStateAttributesMapping,
  });
  const hiddenInputProps = $derived({
    ...field.validation.getValidationProps(disabled, {
      onfocus() {
        focusInput(0);
      },
      oninput(event: Event) {
        if (event.defaultPrevented || disabled || readOnly) return;
        const rawValue = (event.currentTarget as HTMLInputElement).value;
        const [normalizedValue, didRejectCharacters] =
          normalizeOTPValueWithDetails(
            rawValue,
            length,
            validationType,
            normalizeValue,
          );
        if (didRejectCharacters)
          reportValueInvalid(
            rawValue,
            createGenericEventDetails(REASONS.inputChange, event),
          );
        const committedValue = setValue(
          normalizedValue,
          createChangeEventDetails(REASONS.inputChange, event),
        );
        if (committedValue != null && committedValue !== "")
          queueFocusInput(committedValue.length - 1, committedValue);
      },
    }),
    type: "text",
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
    "aria-hidden": true,
    tabindex: -1,
    style: toNativeStyle(name ? visuallyHiddenInput : visuallyHidden),
  });
  function mergeAriaIds(...values: Array<string | undefined>) {
    const ids = values.flatMap(
      (value) => value?.split(/\s+/).filter(Boolean) ?? [],
    );
    return ids.length > 0 ? Array.from(new Set(ids)).join(" ") : undefined;
  }
</script>
<RenderElement tag="div" {componentProps} {params} {children} />
{#if hasValidLength}
  <RenderElement tag="input" params={{ ref: field.validation.inputRef, props: hiddenInputProps }} />
{/if}
