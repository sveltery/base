// Mechanically ported from mui/base-ui v1.8.0 useRenderElement.tsx at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import { createMergedRefs, type MergedRef, type MergedRefCallback } from '../utils/useMergedRefs.js';
import { mergeObjects } from '../utils/mergeObjects.js';
import { EMPTY_OBJECT } from '../utils/empty.js';
import { getStateAttributesProps, type StateAttributesMapping } from './getStateAttributesProps.js';
import { resolveClassName } from '../utils/resolveClassName.js';
import { resolveStyle } from '../utils/resolveStyle.js';
import { mergeProps, mergePropsN, mergeClassNames } from '../merge-props/index.js';
import { mergeNativeStyles, toNativeClass } from './nativeProps.js';
import type { BaseUIComponentProps, ComponentRenderFn, HTMLProps } from './types.js';

/** Native setup owner of the single merged-ref storage shared by both source ref branches. */
export function createRenderElement<Host extends Element = Element>() {
  const { useMergedRefs, useMergedRefsN } = createMergedRefs<Host>();

  function useRenderElement<State extends object>(
    element: string | undefined,
    componentProps: UseRenderElementComponentProps<State>,
    params: UseRenderElementParameters<State, Host> = {},
  ): NativeRenderDescriptor<State, Host> | null {
    // Snippets are native opaque render functions: React lazy/Flight unwrapping is unavailable.
    const renderProp = componentProps.render;
    const outProps = useRenderElementProps(componentProps, params, renderProp);

    if (params.enabled === false) {
      return null;
    }

    const state = params.state ?? (EMPTY_OBJECT as State);
    return evaluateRenderProp(element, renderProp, outProps, state);
  }

  /** Computes render element final props, preserving the pinned ordered stages. */
  function useRenderElementProps<State extends object>(
    componentProps: UseRenderElementComponentProps<State>,
    params: UseRenderElementParameters<State, Host>,
    _renderProp: UseRenderElementComponentProps<State>['render'],
  ): HTMLProps & { ref?: MergedRefCallback<Host> | null } {
    const { class: classNameProp, style: styleProp } = componentProps;
    const { state = EMPTY_OBJECT as State, ref, props, stateAttributesMapping, enabled = true } = params;
    const className = enabled ? resolveClassName(classNameProp, state) : undefined;
    const style = enabled ? resolveStyle(styleProp, state) : undefined;
    const stateProps = enabled ? getStateAttributesProps(state, stateAttributesMapping) : EMPTY_OBJECT;
    const resolvedProps = enabled && props ? resolveRenderFunctionProps(props) : undefined;

    // Like the source, the enabled stateProps branch always owns a fresh mutable object.
    const outProps: HTMLProps & { ref?: MergedRefCallback<Host> | null } = enabled
      ? (mergeObjects(stateProps, resolvedProps) ?? {})
      : EMPTY_OBJECT;

    if (typeof document !== 'undefined') {
      if (!enabled) {
        void useMergedRefs(null, null);
      } else if (Array.isArray(ref)) {
        outProps.ref = useMergedRefsN([outProps.ref, getNativeRenderRef(_renderProp), ...ref]);
      } else {
        outProps.ref = useMergedRefs(outProps.ref, getNativeRenderRef(_renderProp), ref as MergedRef<Host> | null | undefined);
      }
    }

    if (!enabled) {
      return EMPTY_OBJECT;
    }
    if (className !== undefined) {
      outProps.class = mergeClassNames(toNativeClass(outProps.class), toNativeClass(className));
    }
    if (style !== undefined) {
      outProps.style = typeof outProps.style === 'string' || typeof style === 'string'
        ? mergeNativeStyles(outProps.style, style)
        : mergeObjects(outProps.style as Record<string, unknown> | undefined, style);
    }
    return outProps;
  }

  return { useRenderElement };
}

function resolveRenderFunctionProps(props: NonNullable<UseRenderElementParameters<never, Element>['props']>): HTMLProps {
  if (Array.isArray(props)) {
    return mergePropsN(props);
  }
  return mergeProps(undefined, props as HTMLProps | ((props: HTMLProps) => HTMLProps));
}

/** Framework boundary: a snippet owns refs through native attachment props, not cloneable element metadata. */
function getNativeRenderRef(_render: unknown): null {
  return null;
}

function evaluateRenderProp<State, Host extends Element>(
  element: string | undefined,
  render: BaseUIComponentProps<State>['render'],
  props: HTMLProps & { ref?: MergedRefCallback<Host> | null },
  state: State,
): NativeRenderDescriptor<State, Host> {
  if (render) {
    if (typeof render === 'function') {
      // Svelte invokes opaque snippets in markup; the descriptor retains the source function branch.
      return { render, props, state };
    }
    // Native snippets have no cloneable React-element branch; invalid replacements still fail explicitly.
    throw new Error('Base UI: The `render` prop must be a native Svelte snippet.');
  }
  if (element) {
    if (typeof element === 'string') {
      return renderTag(element, props, state);
    }
  }
  throw new Error('Base UI: Render element or function are not defined.');
}

function renderTag<State, Host extends Element>(Tag: string, props: HTMLProps & { ref?: MergedRefCallback<Host> | null }, state: State): NativeRenderDescriptor<State, Host> {
  if (Tag === 'button') {
    return { tag: Tag, props: { type: 'button', ...props }, state };
  }
  if (Tag === 'img') {
    return { tag: Tag, props: { alt: '', ...props }, state };
  }
  return { tag: Tag, props, state };
}

export interface NativeRenderDescriptor<State, Host extends Element = Element> {
  tag?: string;
  render?: ComponentRenderFn<HTMLProps, State>;
  props: HTMLProps & { ref?: MergedRefCallback<Host> | null };
  state: State;
}
export type UseRenderElementParameters<State, Host extends Element = Element> = {
  enabled?: boolean;
  /** @deprecated Retained from the source declaration; the source does not use this field. */
  propGetter?: (externalProps: HTMLProps) => HTMLProps;
  ref?: MergedRef<Host> | readonly (MergedRef<Host> | null | undefined)[] | null;
  state?: State;
  props?: HTMLProps | ((props: HTMLProps) => HTMLProps) | readonly (HTMLProps | undefined | ((props: HTMLProps) => HTMLProps))[];
  stateAttributesMapping?: StateAttributesMapping<State>;
};
export type UseRenderElementComponentProps<State> = BaseUIComponentProps<State>;
