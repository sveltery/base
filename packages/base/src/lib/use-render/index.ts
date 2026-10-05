import Component from './UseRender.svelte';
import type {
  UseRenderProps,
  UseRenderState,
  UseRenderParameters,
  UseRenderRenderProp,
  UseRenderElementProps,
  UseRenderComponentProps,
  UseRenderTagName,
} from './types.js';
import type { HTMLProps } from '../internals/types.js';

export const UseRender: typeof Component = Component;
// eslint-disable-next-line @typescript-eslint/no-namespace -- Preserve feasible pinned type-only aliases on the native component representation.
export namespace UseRender {
  export type Props<
    State extends Record<string, unknown> = Record<string, unknown>,
    Host extends Element = Element,
  > = UseRenderProps<State, Host>;
  export type State = UseRenderState;
  export type Parameters<
    State,
    Host extends Element = Element,
    Enabled extends boolean | undefined = boolean | undefined,
  > = UseRenderParameters<State, Host, Enabled>;
  export type RenderProp<State = Record<string, unknown>> = UseRenderRenderProp<State>;
  export type ElementProps<Tag extends UseRenderTagName> = UseRenderElementProps<Tag>;
  export type ComponentProps<
    Tag extends UseRenderTagName,
    State = UseRenderState,
    RenderFunctionProps = HTMLProps,
  > = UseRenderComponentProps<Tag, State, RenderFunctionProps>;
}
export type {
  UseRenderProps,
  UseRenderParameters,
  UseRenderState,
  UseRenderRef,
  UseRenderRefs,
  UseRenderRenderProp,
  UseRenderHostProps,
  UseRenderTagName,
  UseRenderStateAttributesMapping,
  UseRenderElementProps,
  UseRenderComponentProps,
} from './types.js';
export type { HTMLProps, ComponentRenderFn } from '../internals/types.js';
