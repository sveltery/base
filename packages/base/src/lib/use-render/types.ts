import type { Snippet } from 'svelte';
import type { ClassValue, SvelteHTMLElements } from 'svelte/elements';
import type { PreventableEvent } from '../merge-props/index.js';

export type UseRenderTagName = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;
export type UseRenderRef<Host extends Element = Element> =
  | { current: Host | null }
  | ((element: Host | null) => void | (() => void));
export type UseRenderRefs<Host extends Element = Element> =
  | UseRenderRef<Host>
  | readonly (UseRenderRef<Host> | null | undefined)[]
  | null;
export type UseRenderStateAttributesMapping<State> = {
  [Key in keyof State]?: (value: State[Key]) => Record<string, string> | null;
};
export type UseRenderHostProps = Record<string | symbol, unknown>;
export type UseRenderPropSource = UseRenderHostProps | ((previous: UseRenderHostProps) => UseRenderHostProps);
export type UseRenderPropSources = UseRenderPropSource | readonly (UseRenderPropSource | undefined)[];
export type UseRenderRenderProp<State = Record<string, unknown>> =
  Snippet<[UseRenderHostProps, State, Snippet | undefined]>;
type PreventableHandlers<Props> = {
  [Key in keyof Props]: Key extends `on:${string}` ? Props[Key] : Key extends `on${string}`
    ? NonNullable<Props[Key]> extends (event: infer E) => infer Result
      ? E extends Event ? ((event: E & PreventableEvent) => Result) | Extract<Props[Key], null | undefined> : Props[Key]
      : Props[Key]
    : Props[Key];
};
/** Native Svelte attributes for an intrinsic tag, with Base UI handler prevention. */
export type UseRenderElementProps<Tag extends UseRenderTagName> = PreventableHandlers<SvelteHTMLElements[Tag]>;
export type UseRenderComponentProps<Tag extends UseRenderTagName, State = Record<string, unknown>> =
  UseRenderElementProps<Tag> & { render?: UseRenderRenderProp<State> };

/** Native component adaptation of the pinned useRender hook; it renders markup, not a ReactElement. */
export interface UseRenderProps<State extends Record<string, unknown> = Record<string, unknown>, Host extends Element = Element> {
  defaultTagName?: UseRenderTagName;
  enabled?: boolean;
  state?: State;
  stateAttributesMapping?: UseRenderStateAttributesMapping<State>;
  props?: UseRenderHostProps;
  render?: UseRenderRenderProp<State>;
  ref?: UseRenderRefs<Host>;
  /** bind:element resolves the actual host, including an SVG or replacement host. */
  element?: Host | null;
  children?: Snippet;
}

/** Internal source closure; ordered getters and class/style callbacks are not public hook parameters. */
export interface RenderElementProps<State extends Record<string, unknown>, Host extends Element = Element> extends Omit<UseRenderProps<State, Host>, 'props'> {
  props?: UseRenderPropSources;
  class?: ClassValue | ((state: State) => ClassValue);
  style?: string | ((state: State) => string | undefined);
}
