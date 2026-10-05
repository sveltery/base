// Base UI v1.8.0 ToggleGroupContext; native Svelte context. MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
import type { ToggleGroupChangeEventDetails } from './types.js';
export interface ToggleGroupContext<Value> {
  readonly value: readonly Value[];
  setGroupValue(value: Value, nextPressed: boolean, details: ToggleGroupChangeEventDetails): void;
  readonly disabled: boolean;
  readonly isValueInitialized: boolean;
}
const key = Symbol('base-ui-toggle-group');
export function setToggleGroupContext<Value>(context: ToggleGroupContext<Value>) {
  setContext(key, context);
}
export function useToggleGroupContext<Value>() {
  return getContext<ToggleGroupContext<Value> | undefined>(key);
}
