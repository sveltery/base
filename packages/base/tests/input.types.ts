import type { ComponentProps } from 'svelte';
import { Input } from '../src/lib/input/index.js';
import type { InputProps, InputState, InputChangeEventDetails } from '../src/lib/input/index.js';
import { expectType } from './expect-type.js';
type Props = ComponentProps<typeof Input>;
function equality(props: Props, state: InputState, details: InputChangeEventDetails) {
  expectType<InputProps, Props>(props);
  expectType<boolean | null, InputState['valid']>(state.valid);
  expectType<'none', InputChangeEventDetails['reason']>(details.reason);
}
const props: Props = {
  value: 'owner',
  defaultValue: 'seed',
  disabled: true,
  required: true,
  name: 'email',
  type: 'email',
  form: 'form',
  autocomplete: 'email',
  class: (state) => ({ disabled: state.disabled }),
  style: (state) => `opacity:${state.disabled ? 0.5 : 1}`,
  oninput(event) {
    const input: HTMLInputElement = event.currentTarget;
    event.preventBaseUIHandler();
    void input;
  },
  onValueChange(value, details) {
    expectType<string, typeof value>(value);
    details.cancel();
  },
};
// @ts-expect-error Disabled retains boolean semantics.
const invalidDisabled: Props = { disabled: 'true' };
// @ts-expect-error React CSS objects are outside the accepted native CSS string API.
const invalidStyle: Props = { style: { opacity: 0.5 } };
const invalidCallback: Props = {
  // @ts-expect-error Value callbacks retain string value inference.
  onValueChange(value: number) {
    void value;
  },
};
void [equality, props, invalidDisabled, invalidStyle, invalidCallback];
