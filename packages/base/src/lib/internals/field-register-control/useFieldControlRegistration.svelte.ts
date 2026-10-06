// Mechanically ported from Base UI v1.8.0 useFieldControlRegistration.ts.
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import { useIsoLayoutEffect } from '@sveltery/utils/useIsoLayoutEffect';
import { useStableCallback } from '@sveltery/utils/useStableCallback';
import { getCombinedFieldValidityData } from '../../field/utils/getCombinedFieldValidityData.js';
import { useFormContext } from '../form-context/FormContext.js';
import type { FieldValidityData } from '../../field/types.js';
export interface FieldControlRegistration {
  controlRef: { current: HTMLElement | null };
  id: string | undefined;
  name?: string | undefined;
  getValue?: (() => unknown) | undefined;
  value: unknown;
}

export function useFieldControlRegistration(params: UseFieldControlRegistrationParameters) {
  const { formRef } = useFormContext();

  const activeFieldControlSourceRef = { current: null as symbol | null };
  const registrationRef = { current: null as FieldControlRegistration | null };
  const initialValueCapturedRef = { current: false };

  const getValueForForm = useStableCallback(() => {
    const registration = registrationRef.current;
    if (!registration) {
      return undefined;
    }

    if (registration.getValue) {
      return registration.getValue();
    }

    return registration.value;
  });

  function getRegistrationValue(registration: FieldControlRegistration) {
    return registration.value === undefined ? getValueForForm() : registration.value;
  }

  const validate = useStableCallback(() => {
    const registration = registrationRef.current;
    params.markedDirtyRef.current = true;

    if (!registration) {
      params.commit(params.validityData.value);
      return;
    }

    params.commit(getRegistrationValue(registration));
  });

  function refreshRegistration() {
    const registration = registrationRef.current;
    if (!registration || !registration.id) {
      return;
    }

    formRef.current.fields.set(registration.id, {
      getValue: getValueForForm,
      name: params.name ?? registration.name,
      controlRef: registration.controlRef,
      validityData: getCombinedFieldValidityData(params.validityData, params.invalid),
      validate,
    });
  }

  function deleteRegistration(id = registrationRef.current?.id) {
    if (id) {
      formRef.current.fields.delete(id);
    }
  }

  // The baseline belongs to the field, not to a control instance: registration re-runs on every
  // value change, and a control that unmounts and remounts (or is swapped for another one) comes
  // back as a brand new registration. Capturing more than once would turn whichever value the
  // control happens to hold at that point into the initial value, so a modified field would read
  // pristine and its real initial value would read dirty. Consumers that want a fresh baseline
  // remount or key `<Field.Root>` itself.
  function captureInitialValue(registration: FieldControlRegistration) {
    if (initialValueCapturedRef.current) {
      return;
    }

    initialValueCapturedRef.current = true;
    const initialValue = getRegistrationValue(registration);

    params.setValidityData((prev) =>
      prev.initialValue === initialValue ? prev : { ...prev, initialValue },
    );
  }

  useIsoLayoutEffect(
    () => {
      const registration = registrationRef.current;
      if (!registration || !registration.id) {
        return;
      }

      params.setRegisteredFieldName(params.name ? undefined : registration.name);

      formRef.current.fields.set(registration.id, {
        getValue: getValueForForm,
        name: params.name ?? registration.name,
        controlRef: registration.controlRef,
        validityData: getCombinedFieldValidityData(params.validityData, params.invalid),
        validate,
      });
    },
    () => [
      formRef,
      getValueForForm,
      params.invalid,
      params.name,
      params.setRegisteredFieldName,
      validate,
      params.validityData,
    ],
  );

  useIsoLayoutEffect(
    () => {
      const fields = formRef.current.fields;

      return () => {
        const id = registrationRef.current?.id;
        if (id) {
          fields.delete(id);
        }
      };
    },
    () => [formRef],
  );

  const register = useStableCallback(
    (source: symbol, registration: FieldControlRegistration | undefined) => {
      if (!registration) {
        if (activeFieldControlSourceRef.current === source) {
          activeFieldControlSourceRef.current = null;
          params.change(undefined, true);
          deleteRegistration();
          registrationRef.current = null;
          params.setRegisteredFieldName(undefined);
          params.registeredFieldIdRef.current = undefined;
        }
        return;
      }

      const previousId = registrationRef.current?.id;
      const previousSource = activeFieldControlSourceRef.current;

      // Drop work owned by a replaced control, but not on first registration.
      if (previousSource && previousSource !== source) {
        params.change(undefined, true);
      }

      activeFieldControlSourceRef.current = source;
      registrationRef.current = registration;
      if (!params.name) {
        params.setRegisteredFieldName(registration.name);
      }
      params.registeredFieldIdRef.current = registration.id;

      if (previousId && previousId !== registration.id) {
        deleteRegistration(previousId);
      }

      captureInitialValue(registration);
      refreshRegistration();
    },
  );

  return [validate, register] as const;
}

export interface UseFieldControlRegistrationParameters {
  change(value: unknown, cancelPending?: boolean): void;
  commit(value: unknown): void;
  readonly invalid: boolean;
  markedDirtyRef: { current: boolean };
  readonly name: string | undefined;
  setRegisteredFieldName(name: string | undefined): void;
  registeredFieldIdRef: { current: string | undefined };
  setValidityData(
    data: FieldValidityData | ((previous: FieldValidityData) => FieldValidityData),
  ): void;
  readonly validityData: FieldValidityData;
}
