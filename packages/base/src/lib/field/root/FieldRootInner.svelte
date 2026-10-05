<script lang="ts">
  // Ported from Base UI v1.8.0 FieldRootInner in field/root/FieldRoot.tsx.
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import { untrack } from 'svelte';
  import RenderElement from '../../internals/RenderElement.svelte';
  import { useIsoLayoutEffect } from '@sveltery/utils/useIsoLayoutEffect';
  import { useStableCallback } from '@sveltery/utils/useStableCallback';
  import {
    setFieldRootContext,
    type FieldRootContext,
  } from '../../internals/field-root-context/FieldRootContext.js';
  import {
    DEFAULT_VALIDITY_STATE,
    fieldValidityMapping,
  } from '../../internals/field-constants/constants.js';
  import { useFieldsetRootContext } from '../../fieldset/root/FieldsetRootContext.js';
  import { useFormContext } from '../../internals/form-context/FormContext.js';
  import { useFieldValidation } from './useFieldValidation.svelte.js';
  import { useFieldControlRegistration } from '../../internals/field-register-control/useFieldControlRegistration.svelte.js';
  import type {
    FieldRootActions,
    FieldRootProps,
    FieldRootState,
    FieldValidityData,
  } from '../types.js';
  const form = useFormContext();
  let {
    render,
    class: classProp,
    validate: validateProp,
    validationDebounceTime = 0,
    validationMode = form.validationMode,
    name,
    disabled: disabledProp = false,
    invalid: invalidProp,
    dirty: dirtyProp,
    touched: touchedProp,
    actionsRef,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: FieldRootProps = $props();
  const fieldset = useFieldsetRootContext(true);
  const validate = useStableCallback(
    (value: unknown, values: Parameters<NonNullable<FieldRootProps['validate']>>[1]) =>
      (validateProp || (() => null))(value, values),
  );
  const disabled = $derived(Boolean(fieldset?.disabled || disabledProp));
  let touchedState = $state(false);
  let dirtyState = $state(false);
  let filled = $state(false);
  let focused = $state(false);
  const dirty = $derived(dirtyProp ?? dirtyState);
  const touched = $derived(touchedProp ?? touchedState);
  const markedDirtyRef = { current: untrack(() => dirty) };
  const registeredFieldIdRef = { current: undefined as string | undefined };
  let registeredFieldName = $state<string>();
  const effectiveName = $derived(name ?? registeredFieldName);
  useIsoLayoutEffect(
    () => {
      if (dirtyProp !== undefined) markedDirtyRef.current = dirtyProp;
    },
    () => [dirtyProp],
  );
  const setDirty = useStableCallback((value: boolean) => {
    if (dirtyProp !== undefined) return;
    if (value) markedDirtyRef.current = true;
    dirtyState = value;
  });
  const setTouched = useStableCallback((value: boolean) => {
    if (touchedProp !== undefined) return;
    touchedState = value;
  });
  const shouldValidateOnChange = useStableCallback(
    () =>
      validationMode === 'onChange' ||
      (validationMode === 'onSubmit' && form.submitCountRef.current > 0),
  );
  const formError = $derived(
    effectiveName && Object.hasOwn(form.errors, effectiveName) ? form.errors[effectiveName] : null,
  );
  const hasFormError = $derived(Boolean(Array.isArray(formError) ? formError.length : formError));
  const invalid = $derived(invalidProp === true || hasFormError);
  let validityData = $state.raw<FieldValidityData>({
    state: DEFAULT_VALIDITY_STATE,
    error: '',
    errors: [],
    value: null,
    initialValue: null,
  });
  function setValidityData(
    value: FieldValidityData | ((previous: FieldValidityData) => FieldValidityData),
  ) {
    validityData = typeof value === 'function' ? value(validityData) : value;
  }
  const valid = $derived(!invalid && (disabled ? null : validityData.state.valid));
  const fieldRootState: FieldRootState = $derived({
    disabled,
    touched,
    dirty,
    valid,
    filled,
    focused,
  });
  const validation = useFieldValidation({
    setValidityData,
    validate,
    get validityData() {
      return validityData;
    },
    get validationDebounceTime() {
      return validationDebounceTime;
    },
    get invalid() {
      return invalid;
    },
    markedDirtyRef,
    get state() {
      return fieldRootState;
    },
    shouldValidateOnChange,
    get validationMode() {
      return validationMode;
    },
    registeredFieldIdRef,
  });
  const [validateFieldControl, registerFieldControl] = useFieldControlRegistration({
    change: validation.change,
    commit: validation.commit,
    get invalid() {
      return invalid;
    },
    markedDirtyRef,
    get name() {
      return name;
    },
    setRegisteredFieldName(value) {
      registeredFieldName = value;
    },
    registeredFieldIdRef,
    setValidityData,
    get validityData() {
      return validityData;
    },
  });
  const actions: FieldRootActions = { validate: validateFieldControl };
  useIsoLayoutEffect(
    () => {
      const target = actionsRef;
      if (!target) return;
      target.current = actions;
      return () => {
        if (target.current === actions) target.current = null;
      };
    },
    () => [actionsRef, validateFieldControl],
  );
  const contextValue: FieldRootContext = {
    get invalid() {
      return invalid;
    },
    get name() {
      return effectiveName;
    },
    get validityData() {
      return validityData;
    },
    setValidityData,
    get disabled() {
      return disabled;
    },
    setTouched,
    setDirty,
    setFilled(value) {
      filled = value;
    },
    setFocused(value) {
      focused = value;
    },
    get validationMode() {
      return validationMode;
    },
    shouldValidateOnChange,
    get state() {
      return fieldRootState;
    },
    registerFieldControl,
    validation,
  };
  setFieldRootContext(contextValue);
  const componentProps = $derived({ ...elementProps, render, class: classProp, style });
  const forwardedRef = {
    get current() {
      return ref ?? null;
    },
    set current(value: HTMLElement | null) {
      ref = value;
    },
  };
  const params = $derived({
    ref: forwardedRef,
    state: fieldRootState,
    props: elementProps,
    stateAttributesMapping: fieldValidityMapping,
  });
</script>

<RenderElement tag="div" {componentProps} {params} {children} />
