// Native Svelte ClassValue substitution; MIT: THIRD_PARTY_NOTICES.md.
import type { ClassValue } from 'svelte/elements';
import type { ElementProps } from '../dialog/types.js';
export type NativeFieldProps<State, Native> = Omit<ElementProps<State, Native>, 'class'> & {
  class?: ClassValue | ((state: State) => ClassValue | undefined);
};
