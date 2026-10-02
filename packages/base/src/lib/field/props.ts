// Native Svelte ClassValue substitution; MIT: THIRD_PARTY_NOTICES.md.
import type { ClassValue } from 'svelte/elements';
import type { ElementProps } from '../dialog/types.js';
import { resolveClassValue } from '../internals/resolveClassValue.js';
export type NativeFieldProps<State, Native> = Omit<ElementProps<State, Native>, 'class'> & {
  class?: ClassValue | ((state: State) => ClassValue | undefined);
};
export function resolveFieldProps<Props extends object, State>(props: Props, state: State) {
  const classProp = (props as { class?: ClassValue | ((state: State) => ClassValue | undefined) }).class;
  const classValue = typeof classProp === 'function' ? classProp(state) : classProp;
  return { ...props, class: classValue == null ? undefined : resolveClassValue(classValue) };
}
