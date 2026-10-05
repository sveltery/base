// Ported from Base UI v1.8.0 useRegisterFieldControl.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import { untrack } from 'svelte';

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
  const source = Symbol();
  $effect(() => {
    if (!enabled()) {
      untrack(() => registerFieldControl(source, undefined));
      return;
    }
    const registration: FieldControlRegistration = {
      controlRef,
      getValue: getFormValueOverride,
      id: id(),
      name: name?.(),
      value: value(),
    };
    // Registration captures and publishes Field state; it is an imperative boundary.
    untrack(() => registerFieldControl(source, registration));
  });
  $effect(() => {
    return () => registerFieldControl(source, undefined);
  });
}
