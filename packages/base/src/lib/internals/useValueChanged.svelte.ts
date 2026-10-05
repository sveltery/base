// Adapted from Base UI v1.8.0 packages/react/src/internals/useValueChanged.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: parity/shared-utils/UPSTREAM_LICENSE.
import { untrack } from 'svelte';



export function useValueChanged<T>(
  getValue: () => T,
  getOnChange: () => ((previousValue: T) => void) | undefined,
) {
  const valueRef = { current: untrack(getValue) };
  const onChangeCallback = (previousValue: T) => getOnChange()?.(previousValue);

  $effect(() => {
    const value = getValue();
    if (valueRef.current !== value) {
      // Notify the business observer without subscribing to its writes or reads.
      untrack(() => onChangeCallback(valueRef.current));
    }

    valueRef.current = value;
  });
}
