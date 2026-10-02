// Derived from Base UI FieldRoot/useFieldValidation/control registration at the immutable v1.8.0 pin.
// MIT: THIRD_PARTY_NOTICES.md. React hook state is replaced by per-Root Svelte state.
import { untrack } from 'svelte';
import { getFormValues, type FormContext, type RegisteredField } from '../form/context.js';
import type { FieldContext, ControlRegistration } from './context.js';
import { DEFAULT_VALIDITY_STATE } from './state.js';
import type { FieldRootProps, FieldRootState, FieldValidityData } from './types.js';
export function createFieldController(props: () => Pick<FieldRootProps, 'name' | 'validate' | 'disabled' | 'invalid' | 'dirty' | 'touched' | 'validationMode' | 'validationDebounceTime'>, form: FormContext | undefined): FieldContext {
  let touched = $state(false), dirty = $state(false), filled = $state(false), focused = $state(false);
  let validityData = $state.raw<FieldValidityData>({ state: DEFAULT_VALIDITY_STATE, error: '', errors: [], value: null, initialValue: null });
  let registeredName = $state<string>();
  let input = $state<HTMLInputElement | null>(null);
  let markedDirty = untrack(() => props().dirty ?? false);
  let registration: ControlRegistration | null = null;
  let activeSource: symbol | null = null;
  let capturedInitial = false;
  let commitId = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let ownedValidity: [HTMLInputElement, string, string] | null = null;
  const name = $derived(props().name ?? registeredName);
  const validationMode = $derived(props().validationMode ?? form?.validationMode ?? 'onSubmit');
  const formError = $derived(name && form && Object.hasOwn(form.errors, name) ? form.errors[name] : null);
  const invalid = $derived(props().invalid === true || Boolean(Array.isArray(formError) ? formError.length : formError));
  const fieldState: FieldRootState = $derived({
    disabled: props().disabled ?? false, touched: props().touched ?? touched, dirty: props().dirty ?? dirty,
    filled, focused, valid: !invalid && (props().disabled ? null : validityData.state.valid),
  });
  const combinedValidityData = $derived({ ...validityData, state: { ...validityData.state, valid: !invalid && validityData.state.valid } });
  function shouldValidateOnChange() { return validationMode === 'onChange' || (validationMode === 'onSubmit' && (form?.submitCount ?? 0) > 0); }
  function clearTimer() { if (timer !== undefined) clearTimeout(timer); timer = undefined; }
  function clearOwnedValidity() {
    const record = ownedValidity;
    ownedValidity = null;
    if (record && (!record[0].willValidate || record[0].validationMessage === record[1])) record[0].setCustomValidity(record[2]);
  }
  function makeState(customError: boolean): FieldValidityData['state'] { return { ...DEFAULT_VALIDITY_STATE, valid: !customError, customError }; }
  function nativeErrors(element: HTMLInputElement | null) { return element?.validationMessage ? [element.validationMessage] : []; }
  function nativeState(element: HTMLInputElement | null): FieldValidityData['state'] {
    if (!element?.willValidate) return makeState(false);
    const next = Object.fromEntries(Object.keys(DEFAULT_VALIDITY_STATE).map(key => [key, element.validity[key as keyof ValidityState]])) as FieldValidityData['state'];
    const otherError = Object.keys(next).some(key => key !== 'valid' && key !== 'valueMissing' && next[key as keyof ValidityState]);
    if (next.valueMissing && !otherError && !markedDirty) { next.valid = true; next.valueMissing = false; }
    return next;
  }
  function publish(value: unknown, next: FieldValidityData['state'], messages: string[]) {
    const errors = next.valid === false ? messages : [];
    validityData = { value, state: next, error: errors[0] ?? '', errors, initialValue: validityData.initialValue };
  }
  async function commit(value: unknown, revalidate = false) {
    const version = ++commitId;
    let element = input;
    if (revalidate) {
      if (fieldState.valid !== false || !element) return;
      if (!element.validity.valueMissing) {
        clearOwnedValidity();
        const foreign = element.validity.customError ? nativeErrors(element) : [];
        publish(value, makeState(foreign.length > 0), foreign);
        // The reference updates the Form entry without stale external invalidity for this pass;
        // the Root's app-controlled invalidity remains independently visible.
        if (registration) entryValidityOverride = { data: validityData, invalid: false };
        return;
      }
      if (Object.keys(DEFAULT_VALIDITY_STATE).some(key => !['valid', 'valueMissing', 'customError'].includes(key) && element!.validity[key as keyof ValidityState])) return;
    }
    clearTimer();
    clearOwnedValidity();
    let next = nativeState(element);
    let errors = nativeErrors(element);
    if (errors.length === 0 || shouldValidateOnChange()) {
      const resultOrPromise = props().validate?.(value, getFormValues(form));
      let result: string | string[] | null | void;
      if (typeof resultOrPromise === 'object' && resultOrPromise !== null && 'then' in resultOrPromise) {
        if (next.valid === false) publish(value, next, errors);
        else if (validationMode === 'onSubmit' || !validityData.state.customError) { next.valid = null; publish(value, next, errors); }
        result = await resultOrPromise;
        if (version !== commitId) return;
        element = input;
        next = nativeState(element);
      } else result = resultOrPromise;
      errors = result ? ([] as string[]).concat(result).filter(Boolean) : [];
      if (errors.length) {
        next.valid = false;
        next.customError = true;
        if (element?.willValidate) {
          const displaced = element.validity.customError ? element.validationMessage : '';
          const message = errors.join('\n').replace(/\r\n?/g, '\n');
          element.setCustomValidity(message);
          ownedValidity = [element, message, displaced];
        }
      } else errors = nativeErrors(element);
    }
    publish(value, next, errors);
    entryValidityOverride = null;
  }
  function change(value: unknown, cancelPending = false) {
    clearTimer();
    commitId += 1;
    if (cancelPending) return;
    if (shouldValidateOnChange() && value !== '' && props().validationDebounceTime) timer = setTimeout(() => { void commit(value); }, props().validationDebounceTime);
    else void commit(value, !shouldValidateOnChange());
  }
  function getValue() { return registration?.getValue(); }
  function validate() {
    markedDirty = true;
    void commit(registration ? registration.value === undefined ? getValue() : registration.value : validityData.value);
  }
  let entryValidityOverride: { data: FieldValidityData; invalid: boolean } | null = null;
  const entry: RegisteredField = {
    get name() { return name; },
    get control() { return registration?.control ?? null; },
    get validityData() {
      const override = entryValidityOverride;
      const data = override?.data === validityData ? override.data : validityData;
      return { ...data, state: { ...data.state, valid: !(override?.data === validityData ? override.invalid : invalid) && data.state.valid } };
    },
    getValue, validate,
  };
  function registerControl(source: symbol, next: ControlRegistration | undefined) {
    if (!next) {
      if (activeSource !== source) return;
      activeSource = null;
      change(undefined, true);
      if (registration) form?.fields.delete(registration.id);
      registration = null;
      registeredName = undefined;
      return;
    }
    const previous = registration;
    if (activeSource && activeSource !== source) change(undefined, true);
    activeSource = source;
    registration = next;
    if (!props().name) registeredName = next.name;
    if (previous && previous.id !== next.id) form?.fields.delete(previous.id);
    if (!capturedInitial) {
      capturedInitial = true;
      const initialValue = next.value === undefined ? getValue() : next.value;
      if (validityData.initialValue !== initialValue) validityData = { ...validityData, initialValue };
    }
    if (next.id) form?.fields.set(next.id, entry);
    entryValidityOverride = null;
  }
  $effect(() => {
    const next = props().dirty;
    if (next !== undefined) markedDirty = next;
  });
  $effect(() => {
    const explicit = props().name;
    untrack(() => { if (registration) registeredName = explicit ? undefined : registration.name; });
  });
  $effect(() => {
    void validityData;
    void invalid;
    entryValidityOverride = null;
  });
  $effect(() => () => {
    clearTimer();
    commitId += 1;
    if (registration) form?.fields.delete(registration.id);
  });
  return {
    get state() { return fieldState; }, get name() { return name; }, get invalid() { return invalid; },
    get validityData() { return validityData; }, get combinedValidityData() { return combinedValidityData; },
    get formError() { return formError; }, get validationMode() { return validationMode; },
    get input() { return input; }, setInput(value) { input = value; },
    setTouched(value) { if (props().touched === undefined) touched = value; },
    setDirty(value) { if (props().dirty !== undefined) return; if (value) markedDirty = true; dirty = value; },
    setFilled(value) { filled = value; }, setFocused(value) { focused = value; },
    registerControl, validate, change, commit,
  };
}
