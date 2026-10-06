import { onDestroy } from 'svelte';
// Mechanically ported from Base UI v1.8.0 field/root/useFieldValidation.ts.
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import { EMPTY_OBJECT } from '@sveltery/utils/empty';
import { Timeout } from '@sveltery/utils/useTimeout';

import {
  useLabelableContext,
  type LabelableContext,
} from '../../internals/labelable-provider/LabelableContext.js';
import { mergeProps } from '../../merge-props/index.js';
import { DEFAULT_VALIDITY_STATE } from '../../internals/field-constants/constants.js';
import { useFormContext, type FormContext } from '../../internals/form-context/FormContext.js';
import { getCombinedFieldValidityData } from '../utils/getCombinedFieldValidityData.js';
import type { FieldValidityData, FieldRootState } from '../types.js';
import type { FormValues, FormValidationMode } from '../../form/types.js';
type HTMLProps = Record<string, unknown>;
/** Native form controls share the constraint APIs used by the source validation body. */
export type NativeValidationControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
const validityKeys = Object.keys(DEFAULT_VALIDITY_STATE) as Array<keyof ValidityState>;

export type RegisteredInput = {
  controlRef: { current: HTMLElement | null };
  value: string | undefined;
};

export type RegisteredInputs = Map<NativeValidationControl, RegisteredInput>;

/**
 * Whether an input participates in the surrounding Base UI Form. Inputs that are effectively
 * disabled, or whose `form` attribute explicitly associates them with another form, are excluded.
 * DOM position only matters when it associates the input with a different form. Otherwise, field
 * registration is context-driven, so portaled inputs (for example inside a dialog) still belong to
 * the form for both validation and values projected into `onFormSubmit`.
 */
export function isEligibleInput(
  input: NativeValidationControl,
  formElement: HTMLFormElement | null,
) {
  if (input.matches(':disabled')) {
    return false;
  }

  if (!formElement || input.form === formElement) {
    return true;
  }

  // React context crosses portal boundaries. An unassociated portaled input still participates in
  // contextual validation, unless an explicit `form` attribute opts it out of the surrounding Form.
  return input.form === null && !input.hasAttribute('form');
}

/**
 * Picks the input whose native validity should represent a field that owns several inputs (such as a
 * checkbox or radio group). Prefers the first eligible currently-invalid input, where "first" follows
 * registration order (mount order), and otherwise returns the first eligible input.
 */
function findRepresentativeInput(
  inputs: RegisteredInputs,
  formElement: HTMLFormElement | null,
): NativeValidationControl | null {
  let fallback: NativeValidationControl | null = null;
  for (const input of inputs.keys()) {
    if (!isEligibleInput(input, formElement)) {
      continue;
    }
    if (!input.validity.valid) {
      return input;
    }
    fallback ??= input;
  }
  return fallback;
}

function makeState(customError: boolean): Record<keyof ValidityState, boolean> {
  return { ...DEFAULT_VALIDITY_STATE, valid: !customError, customError };
}

function getNativeErrors(element: NativeValidationControl | null): string[] {
  return element && element.validationMessage ? [element.validationMessage] : [];
}

/** One Field lifetime owns the shared validation state and bound services. */
export class FieldValidationOwner implements UseFieldValidationReturnValue {
  #params: UseFieldValidationParameters;
  #elementRef: FormContext['elementRef'];
  #formRef: FormContext['formRef'];
  #labelable: LabelableContext;
  #timeout: Timeout;
  inputRef = $state<{ current: HTMLInputElement | null }>({ current: null });
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- Source registration Map is imperative and does not subscribe rendering.
  registeredInputs: RegisteredInputs = new Map();
  #validationCommitIdRef = { current: 0 };
  // Tracks the message installed by Base UI and the custom message it displaced.
  #customValidityRef = {
    current: null as [element: NativeValidationControl, message: string, displaced: string] | null,
  };

  constructor(params: UseFieldValidationParameters) {
    this.#params = params;
    const { elementRef, formRef } = useFormContext();
    this.#elementRef = elementRef;
    this.#formRef = formRef;
    this.#labelable = useLabelableContext();
    this.#timeout = new Timeout();
    onDestroy(this.#timeout.clear);
  }

  // Groups register several inputs against a single field so focus, validation, and form-value
  // projection can use the same live controls. This also ensures a `required` checkbox can't be
  // satisfied by another input in the group, matching native per-checkbox behavior.
  registerInput = (element: NativeValidationControl, registration: RegisteredInput) => {
    const registeredInputs = this.registeredInputs;
    registeredInputs.set(element, registration);
    return () => {
      registeredInputs.delete(element);
    };
  };

  getInputControl = () => {
    const registeredInputs = this.registeredInputs;
    const elementRef = this.#elementRef;
    const element = findRepresentativeInput(registeredInputs, elementRef.current);
    return (element && registeredInputs.get(element)?.controlRef.current) || null;
  };

  commit = async (value: unknown, revalidate = false) => {
    const params = this.#params;
    const elementRef = this.#elementRef;
    const formRef = this.#formRef;
    const labelable = this.#labelable;
    const timeout = this.#timeout;
    const { inputRef, registeredInputs } = this;
    const validationCommitIdRef = this.#validationCommitIdRef;
    const customValidityRef = this.#customValidityRef;
    validationCommitIdRef.current += 1;
    const validationCommitId = validationCommitIdRef.current;

    function updateRegisteredFieldValidity(
      nextValidityData: FieldValidityData,
      externalInvalid = params.invalid,
    ) {
      const fieldId = params.registeredFieldIdRef.current ?? labelable.controlId;
      if (fieldId == null) {
        return;
      }

      const currentFieldData = formRef.current.fields.get(fieldId);
      if (!currentFieldData) {
        return;
      }

      const validityDataWithFormErrors = getCombinedFieldValidityData(
        nextValidityData,
        externalInvalid,
      );

      formRef.current.fields.set(fieldId, {
        ...currentFieldData,
        validityData: validityDataWithFormErrors,
      });
    }

    function makeValidityData(
      validityState: FieldValidityData['state'],
      errorMessages: string[],
    ): FieldValidityData {
      // `valueMissing` may be suppressed while the native message remains non-empty.
      const errors = validityState.valid === false ? errorMessages : [];
      return {
        value,
        state: validityState,
        error: errors[0] ?? '',
        errors,
        initialValue: params.validityData.initialValue,
      };
    }

    function setCustomValidity(element: NativeValidationControl, message: string) {
      // Never reinstall a native constraint message as custom validity.
      const displaced = element.validity.customError ? element.validationMessage : '';
      const ownedMessage = message.replace(/\r\n?/g, '\n');
      element.setCustomValidity(ownedMessage);
      customValidityRef.current = [element, ownedMessage, displaced];
    }

    function clearCustomValidity() {
      const record = customValidityRef.current;
      customValidityRef.current = null;
      // Replacement transfers ownership; barred controls hide `validationMessage`.
      if (record && (!record[0].willValidate || record[0].validationMessage === record[1])) {
        record[0].setCustomValidity(record[2]);
      }
    }

    function publish(
      validityState: FieldValidityData['state'],
      errorMessages: string[],
      externalInvalid?: boolean,
    ) {
      const nextValidityData = makeValidityData(validityState, errorMessages);
      updateRegisteredFieldValidity(nextValidityData, externalInvalid);
      params.setValidityData(nextValidityData);
    }

    function getState(el: NativeValidationControl) {
      const computedState = validityKeys.reduce(
        (acc, key) => {
          acc[key] = el.validity[key];
          return acc;
        },
        {} as Record<keyof ValidityState, boolean>,
      );

      let hasOnlyValueMissingError = false;

      for (const key of validityKeys) {
        if (key === 'valid') {
          continue;
        }
        if (key === 'valueMissing' && computedState[key]) {
          hasOnlyValueMissingError = true;
        } else if (computedState[key]) {
          return computedState;
        }
      }

      // Only make `valueMissing` mark the field invalid if it's been changed
      // to reduce error noise.
      if (hasOnlyValueMissingError && !params.markedDirtyRef.current) {
        computedState.valid = true;
        computedState.valueMissing = false;
      }
      return computedState;
    }

    // A field can own several inputs (such as a checkbox or radio group), but only the last-mounted
    // one wins the shared `inputRef`. Validate against the registry instead so every input counts;
    // `inputRef` is the fallback only when no inputs are registered.
    function resolveRepresentativeInput() {
      return registeredInputs.size > 0
        ? findRepresentativeInput(registeredInputs, elementRef.current)
        : inputRef.current;
    }

    // A field with no eligible input has no native constraint, but its custom validator still
    // applies to the logical value at the configured validation boundary.
    let element = resolveRepresentativeInput();

    function refreshState() {
      element = resolveRepresentativeInput();
      // Barred controls expose no usable native constraint state.
      return element?.willValidate ? getState(element) : makeState(false);
    }

    if (revalidate) {
      if (params.state.valid !== false || !element) {
        return;
      }

      if (!element.validity.valueMissing) {
        // The 'valueMissing' (required) condition has been resolved by the user typing.
        // Temporarily mark the field as valid for this onChange event.
        // Other native errors (e.g., typeMismatch) will be caught by full validation on blur or submit.
        // The required value is now present; ignore stale external invalid state for this pass.
        clearCustomValidity();
        // Clearing can make another registered input with a custom error representative.
        const currentElement = resolveRepresentativeInput();
        const foreign = currentElement?.validity.customError ? getNativeErrors(currentElement) : [];
        publish(makeState(foreign.length > 0), foreign, false);
        return;
      }

      // A stale custom error can coexist with valueMissing, but defer any other native errors.
      for (const key of validityKeys) {
        if (
          key !== 'valid' &&
          key !== 'valueMissing' &&
          key !== 'customError' &&
          element.validity[key]
        ) {
          return;
        }
      }

      // Value is still missing: publish the current native state so valueMissing and the changed
      // value are observable immediately. Full custom validation still waits for its boundary.
    }

    timeout.clear();

    // Do not read Base UI's previous message back as a native constraint.
    clearCustomValidity();

    let nextState: FieldValidityData['state'] = refreshState();
    let validationErrors = getNativeErrors(element);

    const isValidatingOnChange = params.shouldValidateOnChange();

    // Native or externally set errors take precedence outside onChange validation.
    if (validationErrors.length === 0 || isValidatingOnChange) {
      // call the validate function because either
      // - validating on change, or
      // - native constraint validations passed, custom validity check is next
      const formValues = Array.from(formRef.current.fields.values()).reduce((acc, field) => {
        if (field.name) {
          acc[field.name] = field.getValue();
        }
        return acc;
      }, {} as FormValues);

      const resultOrPromise = params.validate(value, formValues);
      let result: string | string[] | null | void;

      if (
        typeof resultOrPromise === 'object' &&
        resultOrPromise !== null &&
        'then' in resultOrPromise
      ) {
        // Validity is unknown while the validator runs, so go neutral, but keep what must block
        // submission synchronously: native failures, and a previous custom error outside onSubmit
        // mode. A previous native error is never kept, since `nextState` already carries the fresh
        // native verdict.
        if (nextState.valid === false) {
          publish(nextState, validationErrors);
        } else if (params.validationMode === 'onSubmit' || !params.validityData.state.customError) {
          nextState.valid = null;
          publish(nextState, validationErrors);
        }

        // A rejected validator keeps the previously published state, so a transient
        // failure can't retire an error and unblock submission.
        result = await resultOrPromise;

        if (validationCommitId !== validationCommitIdRef.current) {
          return;
        }
        nextState = refreshState();
      } else {
        result = resultOrPromise;
      }

      // Empty results and empty array entries are valid.
      validationErrors = result ? ([] as string[]).concat(result).filter(Boolean) : [];

      if (validationErrors.length > 0) {
        nextState.valid = false;
        nextState.customError = true;
        // Keep custom errors for barred controls in field state only.
        if (element?.willValidate) {
          setCustomValidity(element, validationErrors.join('\n'));
        }
      } else {
        validationErrors = getNativeErrors(element);
      }
    }

    publish(nextState, validationErrors);
  };

  change = (value: unknown, cancelPending = false) => {
    const params = this.#params;
    const timeout = this.#timeout;
    const validationCommitIdRef = this.#validationCommitIdRef;
    const commit = this.commit;
    timeout.clear();
    validationCommitIdRef.current += 1;
    if (cancelPending) {
      return;
    }

    const validateOnChange = params.shouldValidateOnChange();

    if (validateOnChange && value !== '' && params.validationDebounceTime) {
      timeout.start(params.validationDebounceTime, () => {
        commit(value);
      });
    } else {
      commit(value, !validateOnChange);
    }
  };

  getValidationProps = (disabled: boolean, externalProps: HTMLProps = EMPTY_OBJECT) =>
    mergeProps(
      this.#labelable.getDescriptionProps(externalProps),
      this.#params.state.valid === false && !this.#params.state.disabled && !disabled
        ? { 'aria-invalid': true }
        : EMPTY_OBJECT,
    );
}

export interface UseFieldValidationParameters {
  setValidityData: (
    data: FieldValidityData | ((previous: FieldValidityData) => FieldValidityData),
  ) => void;
  validate: (
    value: unknown,
    formValues: FormValues,
  ) => string | string[] | null | void | Promise<string | string[] | null | void>;
  readonly validityData: FieldValidityData;
  readonly validationDebounceTime: number;
  readonly invalid: boolean;
  markedDirtyRef: { current: boolean };
  readonly state: FieldRootState;
  shouldValidateOnChange(): boolean;
  readonly validationMode: FormValidationMode;
  registeredFieldIdRef: { current: string | undefined };
}
export interface UseFieldValidationReturnValue {
  getValidationProps(disabled: boolean, props?: HTMLProps): HTMLProps;
  inputRef: { current: HTMLInputElement | null };
  registeredInputs: RegisteredInputs;
  registerInput(
    element: NativeValidationControl,
    registration: RegisteredInput,
  ): void | (() => void);
  getInputControl(): HTMLElement | null;
  commit(value: unknown): Promise<void>;
  change(value: unknown, cancelPending?: boolean): void;
}
