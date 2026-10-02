// Standalone paired-contract supplements. Input.test.tsx invokes helpers; zero ordinary leaf credits.
// Pinned source SHA and helper evidence: parity/input/. MIT: parity/input/UPSTREAM_LICENSE.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/InputFixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
afterEach(async () => { for (const component of mounted.splice(0)) await unmount(component); document.body.replaceChildren(); });
async function setup(scenario = 'default') {
  const target = document.createElement('section'); document.body.append(target);
  const component = mount(Fixture, { target, props: { scenario } }); mounted.push(component); await tick();
  return { input: target.querySelector('[data-testid=input]') as HTMLInputElement, form: target.querySelector('form')!, target, component };
}
async function edit(input: HTMLInputElement, next = 'edit') { input.value = next; input.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true })); await tick(); await tick(); }
function output(target: HTMLElement, name: string) { return JSON.parse(target.querySelector(`[data-testid=${name}]`)!.textContent!); }
it('standalone state stays exactly the default context through value, native invalidity, focus and blur', async () => {
  const { input } = await setup('required'); input.value = '';
  expect(input.checkValidity()).toBe(false); input.focus(); await edit(input); input.blur(); await tick();
  expect(JSON.parse(input.dataset.state!)).toEqual({ disabled: false, touched: false, dirty: false, filled: false, focused: false, valid: null });
  for (const key of ['invalid', 'valid', 'focused', 'filled', 'dirty', 'touched']) expect(input.hasAttribute(`data-${key}`)).toBe(false);
});
it('uncontrolled edit and cancellation preserve native value and emit none with native input event', async () => {
  const { input, target } = await setup('cancel'); await edit(input);
  expect(input.value).toBe('edit'); expect(output(target, 'calls')).toEqual([{ value: 'edit', reason: 'none', type: 'input', canceled: true, defaultPrevented: false }]);
  expect(output(target, 'order')).toEqual(['consumer', 'value']);
});
for (const [scenario, expected] of [['controlled-accept', 'edit'], ['controlled-reject', 'owner'], ['controlled-rewrite', 'EDIT'], ['controlled-default-accept', 'edit'], ['controlled-default-reject', 'owner'], ['controlled-default-rewrite', 'EDIT']] as const) it(`controlled owner ${scenario} resolves the native edit`, async () => {
  const { input, target } = await setup(scenario); await edit(input);
  expect(input.value).toBe(expected); expect(output(target, 'calls')[0].value).toBe('edit');
  target.querySelector<HTMLButtonElement>('button:not([type])')!.click(); await tick(); expect(input.value).toBe('programmatic');
});
for (const [scenario, count] of [['controlled-cancel', 1], ['controlled-prevent-base', 0]] as const) it(`controlled restoration survives callback cancellation and composition (${scenario})`, async () => {
  const { input, target } = await setup(scenario); input.value = 'edit';
  input.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true })); expect(input.value).toBe('edit'); await tick(); await tick();
  expect(input.value).toBe('owner'); expect(output(target, 'calls')).toHaveLength(count);
});
it('consumer prevention suppresses the Base callback separately from native preventDefault', async () => {
  const prevented = await setup('prevent-base'); await edit(prevented.input); expect(output(prevented.target, 'calls')).toEqual([]); expect(prevented.input.value).toBe('edit');
  const native = await setup('prevent-default'); await edit(native.input); expect(output(native.target, 'calls')[0].defaultPrevented).toBe(true); expect(native.input.value).toBe('edit');
});
it('render callback runs before consumer and internal callback', async () => {
  const { input, target } = await setup('render-order'); await edit(input); expect(output(target, 'order')).toEqual(['render', 'consumer', 'value']);
});
it('reactive ID, disabled, name, defaultValue, class/style preserve the host and focus', async () => {
  const { input, target } = await setup(); input.focus(); await edit(input);
  const originalId = input.id; target.querySelectorAll<HTMLButtonElement>('button')[2].click(); await tick();
  expect(target.querySelector('[data-testid=input]')).toBe(input); expect(input.id).not.toBe(originalId); expect(input.id).toMatch(/^base-ui-/);
  expect(input.disabled).toBe(true); expect(input.hasAttribute('data-disabled')).toBe(true); expect(input.name).toBe('renamed');
  expect(input.defaultValue).toBe('new-seed'); expect(input.value).toBe('edit'); expect(input.className).toBe('disabled-class'); expect(input.style.opacity).toBe('0.5');
});
it('attachments and bindable refs own host replacement and teardown', async () => {
  const { input, target, component } = await setup('attachment'); expect(input.dataset.consumerAttached).toBe(''); expect(target.querySelector('[data-testid=ref]')!.textContent).toBe('INPUT');
  target.querySelectorAll<HTMLButtonElement>('button')[3].click(); await tick();
  expect(target.querySelector('[data-testid=input]')!.tagName).toBe('TEXTAREA'); expect(target.querySelector('[data-testid=ref]')!.textContent).toBe('TEXTAREA');
  expect(component.snapshot().attached).toBe(2); expect(component.snapshot().detached).toBe(1);
  mounted.pop(); await unmount(component); expect(component.snapshot().ref).toBeNull(); expect(component.snapshot().detached).toBe(2);
});
for (const [scenario, expected] of [['controlled-reject', ''], ['controlled-default', 'seed'], ['default', 'seed'], ['reset-cancel', 'edit']] as const) it(`native reset baseline and zero value callback (${scenario})`, async () => {
  const { input, form, target } = await setup(scenario); await edit(input); const count = output(target, 'calls').length;
  form.reset(); await tick(); expect(input.value).toBe(expected); expect(output(target, 'calls')).toHaveLength(count);
});
