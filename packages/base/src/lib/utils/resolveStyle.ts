// Ported from mui/base-ui v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import type { NativeStyle } from '../internals/nativeProps.js';

/** Resolve a component style value or call its state-dependent function. */
export function resolveStyle<State>(
  style: NativeStyle | ((state: State) => NativeStyle | undefined) | undefined,
  state: State,
) {
  return typeof style === 'function' ? style(state) : style;
}
