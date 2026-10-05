// Pure prop business from Base UI v1.8.0, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md. Rendering and attachments belong to each component.
import { mergeObjects } from '@sveltery/utils/mergeObjects';
import {
  mergeProps,
  mergePropsN,
  mergeClassNames,
} from '../merge-props/index.js';
import {
  getStateAttributesProps,
  type StateAttributesMapping,
} from './getStateAttributesProps.js';
import { resolveClassName } from '../utils/resolveClassName.js';
import { resolveStyle } from '../utils/resolveStyle.js';
import {
  mergeNativeStyles,
  toNativeClass,
  toNativeStyle,
} from './nativeProps.js';
import type { BaseUIComponentProps, HTMLProps } from './types.js';

export type PropSource =
  HTMLProps | ((previous: HTMLProps) => HTMLProps) | undefined;
export type PropSources = PropSource | readonly PropSource[];

/** State attributes, ordered event/prop composition, then component class and style. */
export function mergeComponentProps<State extends object>(
  state: State,
  appearance: Pick<BaseUIComponentProps<State>, 'class' | 'style'>,
  sources?: PropSources,
  mapping?: StateAttributesMapping<State> | false,
): HTMLProps {
  const className = resolveClassName(appearance.class, state);
  const style = resolveStyle(appearance.style, state);
  const stateProps =
    mapping === false ? {} : getStateAttributesProps(state, mapping);
  const props = Array.isArray(sources)
    ? mergePropsN(sources)
    : mergeProps(undefined, sources as PropSource);
  const merged = mergeObjects(stateProps, props) ?? {};
  if (className !== undefined)
    merged.class = mergeClassNames(
      toNativeClass(merged.class),
      toNativeClass(className),
    );
  if (style !== undefined)
    merged.style = mergeNativeStyles(merged.style, style);
  if (merged.style !== undefined) merged.style = toNativeStyle(merged.style);
  return merged;
}
