// Source business port of Base UI v1.8.0 useCheckboxGroupParent.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT.
import { untrack } from 'svelte';
import { useStableCallback } from '../utils/useStableCallback.js';
import { EMPTY_ARRAY } from '../utils/empty.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
export interface UseCheckboxGroupParentParameters {
  allValues?: string[];
  value: string[];
  onValueChange?: (value: string[], details: BaseUIChangeEventDetails<'none'>) => void;
}
export function useCheckboxGroupParent(getParameters: () => UseCheckboxGroupParentParameters) {
  const uncontrolledStateRef = { current: untrack(() => getParameters().value) };
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- source imperative registry is read only by parent-selection callbacks
  const disabledStatesRef = { current: new Map<string, boolean>() };
  let status = $state<'on' | 'off' | 'mixed'>('mixed');
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- source registry publishes its own explicit revision below
  let childIdsState = $state.raw({ registry: new Map<string, readonly string[]>() });
  const onValueChange = useStableCallback(
    (value: string[], details: BaseUIChangeEventDetails<'none'>) =>
      getParameters().onValueChange?.(value, details),
  );
  const registerChildId = useStableCallback((childValue: string, childId: string) => {
    const childIds = childIdsState.registry;
    const ids = childIds.get(childValue);
    if (!ids?.includes(childId)) {
      childIds.set(childValue, ids ? ids.concat(childId) : [childId]);
      childIdsState = { registry: childIds };
    }
    return () => {
      const registeredIds = childIds.get(childValue);
      if (!registeredIds?.includes(childId)) return;
      const nextIds = registeredIds.filter((id) => id !== childId);
      if (nextIds.length === 0) childIds.delete(childValue);
      else childIds.set(childValue, nextIds);
      childIdsState = { registry: childIds };
    };
  });
  function getParentProps() {
    const { allValues = EMPTY_ARRAY, value } = getParameters();
    const checked = value.length === allValues.length;
    const indeterminate = value.length !== allValues.length && value.length > 0;
    const currentStatus = status;
    return {
      indeterminate,
      checked,
      'aria-controls':
        allValues.flatMap((v) => childIdsState.registry.get(v) ?? EMPTY_ARRAY).join(' ') ||
        undefined,
      onCheckedChange(_checked: boolean, details: BaseUIChangeEventDetails<'none'>) {
        const uncontrolledState = uncontrolledStateRef.current;
        const none = allValues.filter(
          (v) => disabledStatesRef.current.get(v) && uncontrolledState.includes(v),
        );
        const all = allValues.filter(
          (v) => !disabledStatesRef.current.get(v) || uncontrolledState.includes(v),
        );
        const allOnOrOff =
          uncontrolledState.length === all.length || uncontrolledState.length === 0;
        if (allOnOrOff) {
          onValueChange(value.length === all.length ? none : all, details);
          return;
        }
        let nextStatus: 'on' | 'off' | 'mixed' = 'mixed';
        let nextValue = uncontrolledState;
        if (currentStatus === 'mixed') {
          nextStatus = 'on';
          nextValue = all;
        } else if (currentStatus === 'on') {
          nextStatus = 'off';
          nextValue = none;
        }
        onValueChange(nextValue, details);
        if (!details.isCanceled) status = nextStatus;
      },
    };
  }
  function getChildProps(childValue: string) {
    const { value } = getParameters();
    return {
      checked: value.includes(childValue),
      onCheckedChange(nextChecked: boolean, details: BaseUIChangeEventDetails<'none'>) {
        const newValue = value.slice();
        if (nextChecked) newValue.push(childValue);
        else newValue.splice(newValue.indexOf(childValue), 1);
        onValueChange(newValue, details);
        if (!details.isCanceled) {
          uncontrolledStateRef.current = newValue;
          status = 'mixed';
        }
      },
    };
  }
  return { getParentProps, getChildProps, registerChildId, disabledStatesRef };
}
export type UseCheckboxGroupParentReturnValue = ReturnType<typeof useCheckboxGroupParent>;
