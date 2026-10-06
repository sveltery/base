import type { ComponentProps } from 'svelte';
import { Button } from '../src/lib/button/index.js';
import type { ButtonProps, ButtonState } from '../src/lib/button/index.js';
import { expectType } from './expect-type.js';
type Props = ComponentProps<typeof Button>;
function equality(props: Props, state: ButtonState) {
  expectType<ButtonProps, Props>(props);
  expectType<boolean, ButtonState['disabled']>(state.disabled);
}
const props: Props = {
  disabled: true,
  focusableWhenDisabled: true,
  nativeButton: false,
  type: 'submit',
  name: 'intent',
  value: 'save',
  form: 'checkout',
  formaction: '/save',
  formmethod: 'post',
  formnovalidate: true,
  class: (state) => (state.disabled ? 'disabled' : undefined),
  style: (state) => `opacity:${state.disabled ? 0.5 : 1}`,
  onclick(event) {
    const button: HTMLButtonElement = event.currentTarget;
    event.preventBaseUIHandler();
    event.preventDefault();
    void button;
  },
  onpointerdown(event) {
    const pointer: PointerEvent = event;
    event.preventBaseUIHandler();
    void pointer;
  },
};
// @ts-expect-error Invalid native type must be rejected.
const invalidType: Props = { type: 'link' };
// @ts-expect-error Disabled is boolean.
const invalidDisabled: Props = { disabled: 'true' };
const nativeStyle: Props = { style: 'opacity:0.5', class: ['native', { disabled: true }] };
const invalidStyle: Props = {
  // @ts-expect-error A style callback receives ButtonState.
  style: (state: { active: boolean }) => `opacity:${state.active ? 1 : 0.5}`,
};
const invalidPointer: Props = {
  // @ts-expect-error Native event inference must remain intact.
  onpointerdown(event: KeyboardEvent) {
    void event;
  },
};
void [equality, props, invalidType, invalidDisabled, nativeStyle, invalidStyle, invalidPointer];
