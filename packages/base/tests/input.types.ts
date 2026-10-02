import type { ComponentProps } from 'svelte';
import { Input } from '../src/lib/input/index.js';
import type { InputProps, InputState, InputChangeEventDetails } from '../src/lib/input/index.js';
import { expectType } from './expect-type.js';
type Props = ComponentProps<typeof Input>;
function equality(props: Props, state: InputState, details: InputChangeEventDetails) {
  expectType<InputProps, Props>(props); expectType<boolean | null, InputState['valid']>(state.valid); expectType<'none', InputChangeEventDetails['reason']>(details.reason);
}
const props: Props = { value: 'owner', defaultValue: 'seed', disabled: true, required: true, name: 'email', type: 'email', form: 'form', autocomplete: 'email',
  class: state => ({ disabled: state.disabled }), style: state => `opacity:${state.disabled ? 0.5 : 1}`,
  oninput(event) { const input: HTMLInputElement = event.currentTarget; event.preventBaseUIHandler(); void input; },
  onValueChange(value, details) { expectType<string, typeof value>(value); details.cancel(); },
};
const checkable: Props = { type: 'checkbox', checked: false, defaultChecked: true, value: 'token', onValueChange(value, details) { expectType<string, typeof value>(value); expectType<Event, typeof details.event>(details.event); } };
const radio: Props = { type: 'radio', checked: null, defaultChecked: false, name: 'choice' };
// @ts-expect-error checked retains native boolean semantics.
const invalidChecked: Props = { checked: 'true' };
// @ts-expect-error Disabled retains boolean semantics.
const invalidDisabled: Props = { disabled: 'true' };
// @ts-expect-error React CSS objects are outside the accepted native CSS string API.
const invalidStyle: Props = { style: { opacity: 0.5 } };
// @ts-expect-error Value callbacks retain string value inference.
const invalidCallback: Props = { onValueChange(value: number) { void value; } };
void [equality, props, checkable, radio, invalidChecked, invalidDisabled, invalidStyle, invalidCallback];
