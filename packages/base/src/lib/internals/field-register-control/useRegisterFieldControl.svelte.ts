// Ported from Base UI v1.8.0 useRegisterFieldControl.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import { useIsoLayoutEffect } from '../../utils/useIsoLayoutEffect.svelte.js';
import { useRefWithInit } from '../../utils/useRefWithInit.js';
import { useFieldRootContext } from '../field-root-context/FieldRootContext.js';
import type { FieldControlRegistration } from './useFieldControlRegistration.svelte.js';
export function useRegisterFieldControl(
  controlRef: FieldControlRegistration['controlRef'],
  id: () => FieldControlRegistration['id'],
  value: () => FieldControlRegistration['value'],
  getFormValueOverride?: FieldControlRegistration['getValue'],
  enabled: () => boolean = () => true,
  name?: () => FieldControlRegistration['name'],
) {
  const { registerFieldControl } = useFieldRootContext();
  const sourceRef = useRefWithInit(() => Symbol());
  useIsoLayoutEffect(
    () => {
      const source = sourceRef.current;
      if (!enabled()) {
        registerFieldControl(source, undefined);
        return;
      }
      const registration: FieldControlRegistration = {
        controlRef,
        getValue: getFormValueOverride,
        id: id(),
        name: name?.(),
        value: value(),
      };
      registerFieldControl(source, registration);
    },
    () => [
      controlRef,
      enabled(),
      getFormValueOverride,
      id(),
      name?.(),
      registerFieldControl,
      sourceRef,
      value(),
    ],
  );
  useIsoLayoutEffect(
    () => {
      const source = sourceRef.current;
      return () => registerFieldControl(source, undefined);
    },
    () => [registerFieldControl, sourceRef],
  );
}
