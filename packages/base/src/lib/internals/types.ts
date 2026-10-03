// Native type representations of pinned Base UI shared rendering types (MIT).
import type { Snippet } from 'svelte';
import type { ClassValue, HTMLAttributes } from 'svelte/elements';
import type { PreventableEvent } from '../merge-props/index.js';
import type { NativeStyle } from './nativeProps.js';
// A render snippet chooses its own native host. Reuse Svelte's attachment slot
// while leaving arbitrary string props unknown, as in the source open record.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Svelte's unknown-host attachment slot accepts the snippet's actual element type.
export type HTMLProps = Record<string, unknown> & { [key: symbol]: HTMLAttributes<any>[symbol] };
export type ComponentRenderFn<Props, State> = Snippet<[Props, State, Snippet | undefined]>;
export type BaseUIEvent<E extends Event> = E & PreventableEvent;
type WithPreventBaseUIHandler<T> = T extends (event: infer E) => infer Return
  ? E extends Event ? (event: BaseUIEvent<E>) => Return : T : T;
export type WithBaseUIEvent<T> = { [Key in keyof T]: WithPreventBaseUIHandler<T[Key]> };
export interface BaseUIComponentProps<State> {
  class?: ClassValue | ((state: State) => ClassValue | undefined) | undefined;
  style?: NativeStyle | ((state: State) => NativeStyle | undefined) | undefined;
  render?: ComponentRenderFn<HTMLProps, State> | undefined;
}
