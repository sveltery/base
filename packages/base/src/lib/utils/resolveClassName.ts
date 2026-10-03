// Ported from mui/base-ui v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
/**
 * If the provided className is a string, it will be returned as is.
 * Otherwise, the function will call the className function with the state as the first argument.
 *
 * @param className
 * @param state
 */
import type { ClassValue } from 'svelte/elements';

export function resolveClassName<State>(
  className: ClassValue | ((state: State) => ClassValue) | undefined,
  state: State,
) {
  return typeof className === 'function' ? className(state) : className;
}
