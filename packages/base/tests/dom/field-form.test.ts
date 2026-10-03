// Pinned assertion adapters and separate supplements. MIT: parity/field-form/UPSTREAM_LICENSE.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './FieldFormFixture.svelte';
import { Field } from '../../src/lib/field/index.js';
import { Fieldset } from '../../src/lib/fieldset/index.js';
import Input from '../../src/lib/input/Input.svelte';
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); });
function setup(props: Record<string, unknown> = {}) {
  const host = document.createElement('div'); document.body.append(host);
  const component = mount(Fixture, { target: host, props }); cleanups.push(() => unmount(component)); flushSync();
  const input = () => host.querySelector<HTMLInputElement>('input,textarea')!;
  const field = () => host.querySelector<HTMLElement>('#field')!;
  const validity = () => JSON.parse(host.querySelector('#validity')!.textContent!);
  const form = () => host.querySelector<HTMLFormElement>('#form')!;
  const edit = (value: string) => { input().value = value; input().dispatchEvent(new Event('input', { bubbles: true, cancelable: true })); flushSync(); };
  const submit = () => { const event = new Event('submit', { bubbles: true, cancelable: true }); form().dispatchEvent(event); flushSync(); return event; };
  return { host, component, input, field, validity, form, edit, submit };
}
it('supplement Field.Control and Input share exactly the same component', () => {
  // This is a composition dependency witness, not an ordinary source declaration.
  expect(Field.Control).toBe(Input);
});
for (const inputPart of [false, true]) it(`Root:152 label association, descriptions and explicit-id removal through ${inputPart ? 'Input' : 'Control'}`, () => {
  const { host, component, input } = setup({ inputPart });
  expect(host.querySelector('label')!.htmlFor).toBe('control-a');
  expect(input().getAttribute('aria-labelledby')).toBe('field-label');
  expect(input().getAttribute('aria-describedby')).toBe('external description');
  component.update({ controlId: 'control-b', secondDescription: true }); flushSync();
  expect(host.querySelector('label')!.htmlFor).toBe('control-b'); expect(input().id).toBe('control-b');
  expect(input().getAttribute('aria-describedby')).toBe('external description description-two');
  component.update({ controlId: undefined, description: false }); flushSync();
  expect(input().id.startsWith('base-ui-')).toBe(true); expect(host.querySelector('label')!.htmlFor).toBe(input().id);
  expect(input().getAttribute('aria-describedby')).toBe('external description-two');
});
it('Root:1230 uses Control name fallback and updates it when Root name is removed', () => {
  const onFormSubmit = vi.fn(), validate = vi.fn((_value: unknown, _values: Record<string, unknown>) => null);
  const { component, input, submit } = setup({ onFormSubmit, validate, initial: 'sent' });
  expect(input().name).toBe('email'); submit(); expect(onFormSubmit.mock.lastCall?.[0]).toEqual({ email: 'sent' });
  component.update({ fieldName: undefined }); flushSync(); expect(input().name).toBe('fallback'); submit();
  expect(onFormSubmit.mock.lastCall?.[0]).toEqual({ fallback: 'sent' }); expect(validate.mock.lastCall?.[1]).toEqual({ fallback: 'sent' });
  component.update({ controlName: 'changed' }); flushSync(); submit(); expect(onFormSubmit.mock.lastCall?.[0]).toEqual({ changed: 'sent' });
});
it('supplement an empty control id removes the previous Form registration but preserves the logical Field action', () => {
  const onFormSubmit = vi.fn(), validate = vi.fn(() => null); const { component, input, submit } = setup({ initial: 'seed', onFormSubmit, validate });
  component.update({ controlId: '' }); flushSync(); expect(input().id).toBe(''); submit();
  expect(onFormSubmit.mock.lastCall?.[0]).toEqual({}); expect(validate).not.toHaveBeenCalled();
  component.validateField(); flushSync(); expect(validate).toHaveBeenLastCalledWith('seed', {});
  component.update({ controlId: 'restored' }); flushSync(); submit();
  expect(onFormSubmit.mock.lastCall?.[0]).toEqual({ email: 'seed' }); expect(validate).toHaveBeenLastCalledWith('seed', { email: 'seed' });
});
it('Root:574 does not run a custom validator on ordinary changes outside Form by default', () => {
  const validate = vi.fn(() => 'error'); const { edit, validity } = setup({ noForm: true, validate });
  edit('value'); expect(validate).not.toHaveBeenCalled(); expect(validity().validity.valid).toBe(null);
});
it('Root:1436 validates on blur and suppresses pristine valueMissing without publishing errors', () => {
  const validate = vi.fn(() => null); const { component, input, field, validity, edit } = setup({ mode: 'onBlur', validate });
  component.update({ required: true }); flushSync(); input().dispatchEvent(new FocusEvent('blur')); flushSync();
  expect(validity().validity.valid).toBe(true); expect(validity().validity.valueMissing).toBe(false); expect(validity().errors).toEqual([]);
  edit('changed'); edit(''); input().dispatchEvent(new FocusEvent('blur')); flushSync();
  expect(validity().validity.valueMissing).toBe(true); expect(field().hasAttribute('data-invalid')).toBe(true);
  expect(input().getAttribute('aria-invalid')).toBe('true');
});
it('Root:1409 validates on change and passes contextual form values', () => {
  const validate = vi.fn(value => value === 'valid' ? null : ['first', 'second']); const { component, edit, host, validity } = setup({ mode: 'onChange', validate });
  component.update({ second: true }); flushSync(); edit('wrong');
  expect(validate).toHaveBeenLastCalledWith('wrong', { email: 'wrong', second: 'second' });
  expect(validity().errors).toEqual(['first', 'second']); expect(host.querySelectorAll('#error li')).toHaveLength(2);
  edit('valid'); expect(validity().validity.valid).toBe(true); expect(host.querySelector('#error')).toBe(null);
});
it('Form:28 blocks invalid submission and invokes native and consolidated callbacks only when valid', () => {
  const onsubmit = vi.fn(), onFormSubmit = vi.fn(); const { component, input, submit, edit } = setup({ onsubmit, onFormSubmit });
  component.update({ required: true }); flushSync(); expect(submit().defaultPrevented).toBe(true);
  expect(onsubmit).not.toHaveBeenCalled(); expect(onFormSubmit).not.toHaveBeenCalled(); expect(document.activeElement).toBe(input());
  edit('sent'); expect(submit().defaultPrevented).toBe(true); expect(onsubmit).toHaveBeenCalledTimes(1);
  expect(onFormSubmit).toHaveBeenCalledWith({ email: 'sent' }, expect.objectContaining({ reason: 'none' }));
});
it('Form:777 clears only changed own external errors, and disabling a computed-invalid field excludes values', () => {
  const onFormSubmit = vi.fn(); const { component, edit, input, field, submit, host } = setup({ initialErrors: { email: 'server', untouched: 'other' }, onFormSubmit });
  expect(input().getAttribute('aria-invalid')).toBe('true'); expect(host.querySelector('#error')!.textContent).toBe('server');
  edit('ok'); expect(input().hasAttribute('aria-invalid')).toBe(false);
  component.update({ fieldsetDisabled: true }); flushSync(); expect(input().disabled).toBe(true); expect(field().hasAttribute('data-disabled')).toBe(true);
  submit(); expect(onFormSubmit.mock.lastCall?.[0]).toEqual({});
  component.update({ fieldsetDisabled: false }); flushSync(); submit(); expect(onFormSubmit.mock.lastCall?.[0]).toEqual({ email: 'ok' });
});
it('supplement repeated external and custom error text renders every source list item without key collisions', () => {
  const { component, host } = setup({ initialErrors: { email: ['duplicate', 'duplicate'] } });
  expect([...host.querySelectorAll('#error li')].map(item => item.textContent)).toEqual(['duplicate', 'duplicate']);
  component.setErrors({ email: ['duplicate', 'new', 'duplicate'] }); flushSync();
  expect([...host.querySelectorAll('#error li')].map(item => item.textContent)).toEqual(['duplicate', 'new', 'duplicate']);
  const client = setup({ mode: 'onChange', validate: () => ['same', 'same'] }); client.edit('changed');
  expect([...client.host.querySelectorAll('#error li')].map(item => item.textContent)).toEqual(['same', 'same']);
});
it('Root:533 retains explicit invalidity while disabled and suppresses automatic Error/aria-invalid', () => {
  const { component, field, input, host } = setup(); component.update({ disabled: true, invalid: true }); flushSync();
  expect(field().hasAttribute('data-invalid')).toBe(true); expect(input().hasAttribute('data-invalid')).toBe(true);
  expect(input().hasAttribute('aria-invalid')).toBe(false); expect(host.querySelector('#error')).toBe(null);
  component.update({ errorMatch: true }); flushSync(); expect(host.querySelector('#error')).not.toBe(null);
});
it('Root:2509 touched/focused/dirty/filled follow native edits and externally controlled overrides', () => {
  const { component, input, field, edit } = setup(); input().dispatchEvent(new FocusEvent('focus')); flushSync(); expect(field().hasAttribute('data-focused')).toBe(true);
  edit('typed'); expect(field().hasAttribute('data-filled')).toBe(true); expect(field().hasAttribute('data-dirty')).toBe(true);
  input().dispatchEvent(new FocusEvent('blur')); flushSync(); expect(field().hasAttribute('data-touched')).toBe(true); expect(field().hasAttribute('data-focused')).toBe(false);
  edit(''); expect(field().hasAttribute('data-dirty')).toBe(false); expect(field().hasAttribute('data-filled')).toBe(false);
  component.update({ dirty: true, touched: false }); flushSync(); edit(''); input().dispatchEvent(new FocusEvent('blur')); flushSync();
  expect(field().hasAttribute('data-dirty')).toBe(true); expect(field().hasAttribute('data-touched')).toBe(false);
});
it('Control controlled rejected edits do not change field state; accepted programmatic values do', async () => {
  const validate = vi.fn(() => null), onValueChange = vi.fn(); const { component, edit, input, field } = setup({ controlled: true, initial: 'seed', mode: 'onChange', validate, onValueChange });
  edit('rejected'); await tick(); expect(input().value).toBe('rejected'); // Native Svelte DOM retains the edit; Field business state still follows owner.
  expect(field().hasAttribute('data-dirty')).toBe(false); expect(validate).not.toHaveBeenCalled();
  component.setValue('accepted'); flushSync(); expect(input().value).toBe('accepted'); expect(field().hasAttribute('data-dirty')).toBe(true);
  expect(validate).toHaveBeenLastCalledWith('accepted', { email: 'accepted' }); expect(onValueChange).toHaveBeenCalledTimes(1);
});
it('Control details cancellation changes dirty/filled but does not run validation; base prevention suppresses the internal handler', () => {
  const validate = vi.fn(() => 'error'), onValueChange = vi.fn(); const { component, edit, field } = setup({ mode: 'onChange', validate, onValueChange });
  component.update({ cancelValue: true }); flushSync(); edit('cancel'); expect(field().hasAttribute('data-dirty')).toBe(true); expect(validate).not.toHaveBeenCalled(); expect(onValueChange).toHaveBeenCalledTimes(1);
  component.update({ preventInput: true }); flushSync(); edit('prevented'); expect(onValueChange).toHaveBeenCalledTimes(1); expect(validate).not.toHaveBeenCalled();
});
it('Root:1547 ignores stale async validation and retires pending work on unmount', async () => {
  const resolvers: ((value: string | null) => void)[] = []; const validate = vi.fn(() => new Promise<string | null>(resolve => resolvers.push(resolve)));
  const { component, edit, validity } = setup({ mode: 'onChange', validate }); edit('first'); edit('second');
  expect(resolvers).toHaveLength(2);
  resolvers[0]('stale'); await tick(); expect(validity().errors).toEqual([]);
  resolvers[1]('current'); await tick(); flushSync(); expect(validity().errors).toEqual(['current']);
  edit('third'); component.update({ control: false }); flushSync(); resolvers[2]('unmounted'); await tick(); expect(validity().errors).toEqual(['current']);
});
it('Root:2269 clears only custom validity owned by Field and restores a displaced foreign message', () => {
  const validate = vi.fn(() => 'owned'); const { input, edit, validity } = setup({ mode: 'onChange', validate });
  input().setCustomValidity('foreign'); edit('first'); expect(input().validationMessage).toBe('owned');
  validate.mockReturnValue(null as unknown as string); edit('second'); expect(input().validationMessage).toBe('foreign'); expect(validity().errors).toEqual(['foreign']);
  input().setCustomValidity('replacement'); edit('third'); expect(input().validationMessage).toBe('replacement');
});
it('Form:1046 and Root:3024 actions validate current values and clean up the owned action reference', async () => {
  const validate = vi.fn(() => 'error'); const { component, input, validity } = setup({ validate });
  input().value = 'imperative'; component.validateField(); flushSync(); expect(validate).toHaveBeenLastCalledWith('imperative', { email: 'imperative' }); expect(validity().errors).toEqual(['error']);
  const before = component.getActions(); expect(before.every(Boolean)).toBe(true); component.update({ control: false }); flushSync();
  component.validateForm('email'); expect(validate).toHaveBeenCalledTimes(1);
  component.validateField(); flushSync(); expect(validate).toHaveBeenCalledTimes(2);
});
it('Fieldset legend registration and Item descriptions use independent scopes with inherited root messages', () => {
  const { component, host, input } = setup(); expect(host.querySelector('#fieldset')!.getAttribute('aria-labelledby')).toBe('legend');
  component.update({ item: true }); flushSync(); expect(host.querySelector('#item-label')!.getAttribute('for')).not.toBe(input().id);
  expect(host.querySelector('#item-label')!.hasAttribute('data-disabled')).toBe(true);
  expect(input().getAttribute('aria-describedby')).toBe('external description');
});
for (const [name, mountPart] of Object.entries({ Label: (target: HTMLElement) => mount(Field.Label, { target }), Description: (target: HTMLElement) => mount(Field.Description, { target }), Error: (target: HTMLElement) => mount(Field.Error, { target }), Item: (target: HTMLElement) => mount(Field.Item, { target }), Legend: (target: HTMLElement) => mount(Fieldset.Legend, { target }) })) it(`supplement ${name} rejects missing required context`, () => {
  const host = document.createElement('div'); expect(() => mountPart(host)).toThrow('is missing');
});
