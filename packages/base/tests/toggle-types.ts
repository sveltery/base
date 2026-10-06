// Local Svelte API assertions; no upstream declaration credit.
import type { ComponentProps, Snippet } from 'svelte';
import {
  Toggle,
  type ToggleProps,
  type ToggleState,
  type ToggleChangeEventDetails,
  type ToggleChangeEventReason,
} from '../src/lib/toggle/index.js';
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;
export type StateAssertion = Assert<Equal<ToggleState, { pressed: boolean; disabled: boolean }>>;
export type ReasonAssertion = Assert<Equal<ToggleChangeEventReason, 'none'>>;
export type ComponentAssertion = Assert<Equal<ComponentProps<typeof Toggle>, ToggleProps>>;
const children: Snippet = null as unknown as Snippet;
export const consumer: ToggleProps = {
  pressed: false,
  defaultPressed: true,
  disabled: false,
  nativeButton: true,
  children,
  form: 'accepted-but-stripped',
  type: 'reset',
  value: 'stripped',
  ref: undefined,
  class: (state) => (state.pressed ? 'pressed' : undefined),
  style: (state) => `opacity:${state.disabled ? 0.5 : 1}`,
  onclick: (event) => event.preventBaseUIHandler(),
  onPressedChange: (pressed: boolean, details: ToggleChangeEventDetails) => {
    if (pressed) details.cancel();
  },
};
// @ts-expect-error Toggle does not expose Button's focusableWhenDisabled option.
export const unsupported: ToggleProps = { focusableWhenDisabled: true };
// @ts-expect-error pressed is a boolean.
export const invalid: ToggleProps = { pressed: 'true' };
