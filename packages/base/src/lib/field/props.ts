// Native Svelte ClassValue substitution; MIT: THIRD_PARTY_NOTICES.md.
import type { ClassValue } from 'svelte/elements';
import type { ElementProps } from '../dialog/types.js';
import type { BaseUIComponentProps } from '../internals/types.js';
export type NativeFieldProps<State, Native> = Omit<
  ElementProps<State, Native>,
  'class' | 'children' | 'render' | 'style' | 'ref'
> & {
  class?: ClassValue | ((state: State) => ClassValue | undefined) | undefined;
  children?: ElementProps<State, Native>['children'] | undefined;
  render?: BaseUIComponentProps<State>['render'];
  style?: ElementProps<State, Native>['style'] | undefined;
  ref?: ElementProps<State, Native>['ref'] | undefined;
};
