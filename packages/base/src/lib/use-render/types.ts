import type { Snippet } from 'svelte';
import type { ClassValue, SvelteHTMLElements } from 'svelte/elements';
import type { StateAttributesMapping } from '../internals/getStateAttributesProps.js';
import type { MergedRef } from '../utils/useMergedRefs.js';
import type { ComponentRenderFn, HTMLProps, WithBaseUIEvent } from '../internals/types.js';

export type UseRenderTagName = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;
export type UseRenderRef<Host extends Element = Element> = MergedRef<Host>;
export type UseRenderRefs<Host extends Element = Element> =
  | UseRenderRef<Host>
  | readonly (UseRenderRef<Host> | null | undefined)[]
  | null;
export type UseRenderStateAttributesMapping<State> = StateAttributesMapping<State>;
export type UseRenderHostProps = HTMLProps;
export type UseRenderPropSource = UseRenderHostProps | ((previous: UseRenderHostProps) => UseRenderHostProps);
export type UseRenderPropSources = UseRenderPropSource | readonly (UseRenderPropSource | undefined)[];
export type UseRenderRenderProp<State = Record<string, unknown>> = ComponentRenderFn<UseRenderHostProps, State>;
/** Native Svelte attributes for an intrinsic tag, with Base UI handler prevention. */
export type UseRenderElementProps<Tag extends UseRenderTagName> = WithBaseUIEvent<SvelteHTMLElements[Tag]>;
export type UseRenderComponentProps<Tag extends UseRenderTagName, State = UseRenderState, RenderFunctionProps = HTMLProps> =
  UseRenderElementProps<Tag> & { render?: ComponentRenderFn<RenderFunctionProps, State> | undefined };

export type UseRenderState = Record<never, never>;

/** Pinned parameter relationships, with native snippets and host refs. */
export interface UseRenderParameters<State, Host extends Element = Element, Enabled extends boolean | undefined = boolean | undefined> {
  defaultTagName?: UseRenderTagName | undefined;
  enabled?: Enabled | undefined;
  state?: State | undefined;
  stateAttributesMapping?: UseRenderStateAttributesMapping<State> | undefined;
  props?: UseRenderHostProps | undefined;
  render?: UseRenderRenderProp<State> | undefined;
  ref?: UseRenderRefs<Host> | undefined;
}

/** Native component adaptation of the pinned useRender hook; it renders markup, not a ReactElement. */
export interface UseRenderProps<State extends Record<string, unknown> = Record<string, unknown>, Host extends Element = Element> extends UseRenderParameters<State, Host> {
  /** bind:element resolves the actual host, including an SVG or replacement host. */
  element?: Host | null | undefined;
  children?: Snippet | undefined;
}

/** Internal source closure; ordered getters and class/style callbacks are not public hook parameters. */
export interface RenderElementProps<State extends Record<string, unknown>, Host extends Element = Element> extends Omit<UseRenderProps<State, Host>, 'props'> {
  props?: UseRenderPropSources;
  class?: ClassValue | ((state: State) => ClassValue);
  style?: string | ((state: State) => string | undefined);
}
