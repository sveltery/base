<script lang="ts">
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  // Ported from Base UI v1.8.0 FieldRootInner in field/root/FieldRoot.tsx.
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import { untrack } from 'svelte';

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
  import { FieldValidationOwner } from './useFieldValidation.svelte.js';
  import { FieldControlRegistrationOwner } from '../../internals/field-register-control/FieldControlRegistration.svelte.js';
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
  const validate = (
    value: unknown,
    values: Parameters<NonNullable<FieldRootProps['validate']>>[1],
  ) => (validateProp || (() => null))(value, values);
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
  $effect(() => {
    if (dirtyProp !== undefined) markedDirtyRef.current = dirtyProp;
  });
  const setDirty = (value: boolean) => {
    if (dirtyProp !== undefined) return;
    if (value) markedDirtyRef.current = true;
    dirtyState = value;
  };
  const setTouched = (value: boolean) => {
    if (touchedProp !== undefined) return;
    touchedState = value;
  };
  const shouldValidateOnChange = () =>
    validationMode === 'onChange' ||
    (validationMode === 'onSubmit' && form.submitCountRef.current > 0);
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
  const validation = new FieldValidationOwner({
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
  const registration = new FieldControlRegistrationOwner({
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
  const actions: FieldRootActions = { validate: registration.validate };
  $effect(() => {
    const target = actionsRef;
    if (!target) return;
    target.current = actions;
    return () => {
      if (target.current === actions) target.current = null;
    };
  });
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
    registerFieldControl: registration.register,
    validation,
  };
  setFieldRootContext(contextValue);

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
      fieldRootState,
      { class: classProp, style: style },
      elementProps,
      fieldValidityMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, fieldRootState, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
