// Adapted from Base UI v1.8.0 packages/react/src/internals/useValueChanged.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: parity/shared-utils/UPSTREAM_LICENSE.
import { untrack } from 'svelte';
import { useIsoLayoutEffect } from '../utils/useIsoLayoutEffect.svelte.js';
import { useStableCallback } from '../utils/useStableCallback.js';
import { useRefWithInit } from '../utils/useRefWithInit.js';

export function useValueChanged<T>(
  getValue: () => T,
  getOnChange: () => ((previousValue: T) => void) | undefined,
) {
  const valueRef = useRefWithInit(() => untrack(getValue));
  const onChangeCallback = useStableCallback((previousValue: T) => getOnChange()?.(previousValue));

  useIsoLayoutEffect(
    () => {
      const value = getValue();
      if (valueRef.current !== value) {
        onChangeCallback(valueRef.current);
      }

      valueRef.current = value;
    },
    () => [getValue(), onChangeCallback],
  );
}
