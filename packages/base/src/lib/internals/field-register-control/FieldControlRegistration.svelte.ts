// Registration business from Base UI v1.8.0 useFieldControlRegistration.ts.
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import { onDestroy } from 'svelte';
import { getCombinedFieldValidityData } from '../../field/utils/getCombinedFieldValidityData.js';
import {
  useFormContext,
  type FormContext,
} from '../form-context/FormContext.js';
import type { FieldValidityData } from '../../field/types.js';

export interface FieldControlRegistration {
  controlRef: { current: HTMLElement | null };
  id: string | undefined;
  name?: string | undefined;
  getValue?: (() => unknown) | undefined;
  value: unknown;
}

/** A Field owns the active control registration and its once-captured baseline. */
export class FieldControlRegistrationOwner {
  #params: FieldControlRegistrationParameters;
  #formRef: FormContext['formRef'];
  #activeSource: symbol | null = null;
  #registration = $state.raw<FieldControlRegistration | null>(null);
  #initialValueCaptured = false;

  constructor(params: FieldControlRegistrationParameters) {
    this.#params = params;
    this.#formRef = useFormContext().formRef;
    $effect(() => {
      const registration = this.#registration;
      if (!registration?.id) return;
      params.setRegisteredFieldName(
        params.name ? undefined : registration.name,
      );
      this.refreshRegistration();
    });
    const fields = this.#formRef.current.fields;
    onDestroy(() => {
      const id = this.#registration?.id;
      if (id) fields.delete(id);
    });
  }

  getValueForForm = () => {
    const registration = this.#registration;
    if (!registration) return undefined;
    return registration.getValue ? registration.getValue() : registration.value;
  };

  private getRegistrationValue(registration: FieldControlRegistration) {
    return registration.value === undefined
      ? this.getValueForForm()
      : registration.value;
  }

  validate = () => {
    const registration = this.#registration;
    this.#params.markedDirtyRef.current = true;
    if (!registration) {
      this.#params.commit(this.#params.validityData.value);
      return;
    }
    this.#params.commit(this.getRegistrationValue(registration));
  };

  private refreshRegistration() {
    const registration = this.#registration;
    if (!registration?.id) return;
    this.#formRef.current.fields.set(registration.id, {
      getValue: this.getValueForForm,
      name: this.#params.name ?? registration.name,
      controlRef: registration.controlRef,
      validityData: getCombinedFieldValidityData(
        this.#params.validityData,
        this.#params.invalid,
      ),
      validate: this.validate,
    });
  }

  private deleteRegistration(id = this.#registration?.id) {
    if (id) this.#formRef.current.fields.delete(id);
  }

  // The baseline belongs to the Field lifetime, including control swaps/remounts.
  private captureInitialValue(registration: FieldControlRegistration) {
    if (this.#initialValueCaptured) return;
    this.#initialValueCaptured = true;
    const initialValue = this.getRegistrationValue(registration);
    this.#params.setValidityData((previous) =>
      previous.initialValue === initialValue
        ? previous
        : { ...previous, initialValue },
    );
  }

  register = (
    source: symbol,
    registration: FieldControlRegistration | undefined,
  ) => {
    if (!registration) {
      if (this.#activeSource === source) {
        this.#activeSource = null;
        this.#params.change(undefined, true);
        this.deleteRegistration();
        this.#registration = null;
        this.#params.setRegisteredFieldName(undefined);
        this.#params.registeredFieldIdRef.current = undefined;
      }
      return;
    }
    const previousId = this.#registration?.id;
    const previousSource = this.#activeSource;
    // Cancel work owned by a replaced control, but not on first registration.
    if (previousSource && previousSource !== source)
      this.#params.change(undefined, true);
    this.#activeSource = source;
    this.#registration = registration;
    if (!this.#params.name)
      this.#params.setRegisteredFieldName(registration.name);
    this.#params.registeredFieldIdRef.current = registration.id;
    if (previousId && previousId !== registration.id)
      this.deleteRegistration(previousId);
    this.captureInitialValue(registration);
    this.refreshRegistration();
  };
}

export interface FieldControlRegistrationParameters {
  change(value: unknown, cancelPending?: boolean): void;
  commit(value: unknown): void;
  readonly invalid: boolean;
  markedDirtyRef: { current: boolean };
  readonly name: string | undefined;
  setRegisteredFieldName(name: string | undefined): void;
  registeredFieldIdRef: { current: string | undefined };
  setValidityData(
    data:
      FieldValidityData | ((previous: FieldValidityData) => FieldValidityData),
  ): void;
  readonly validityData: FieldValidityData;
}
