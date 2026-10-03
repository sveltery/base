// Native type representations of pinned Base UI shared rendering types (MIT).
import type { Snippet } from 'svelte';
import type { ClassValue } from 'svelte/elements';
import type { PreventableEvent } from '../merge-props/index.js';
import type { NativeStyle } from './nativeProps.js';
export type HTMLProps = Record<string | symbol, unknown>;
export type ComponentRenderFn<Props, State> = Snippet<[Props, State, Snippet | undefined]>;
export type BaseUIEvent<E extends Event> = E & PreventableEvent;
type WithPreventBaseUIHandler<T> = T extends (event: infer E) => infer Return
  ? E extends Event ? (event: BaseUIEvent<E>) => Return : T : T;
export type WithBaseUIEvent<T> = { [Key in keyof T]: WithPreventBaseUIHandler<T[Key]> };
export interface BaseUIComponentProps<State> {
  class?: ClassValue | ((state: State) => ClassValue);
  style?: NativeStyle | ((state: State) => NativeStyle | undefined);
  render?: ComponentRenderFn<HTMLProps, State>;
}
