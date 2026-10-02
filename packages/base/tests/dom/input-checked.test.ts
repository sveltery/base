// Independent checked/radio regression supplements. Zero ordinary Input declaration credit.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/InputCheckedFixture.svelte';
import NativeFixture from '../../../../apps/fixtures/src/lib/NativeInputCheckedFixture.svelte';
import { mountInputCheckedReference } from '../../../../apps/fixtures/src/lib/input-checked-reference.js';
const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); });
async function setup(reference: boolean, scenario: string, shadow = false) {
  const target = document.createElement('section');
  if (shadow) { const host = document.createElement('div'); document.body.append(host); host.attachShadow({ mode: 'open' }).append(target); }
  else document.body.append(target);
  if (reference) cleanups.push(mountInputCheckedReference(target, scenario));
  else { const component = mount(Fixture, { target, props: { scenario } }); cleanups.push(() => unmount(component)); }
  await settle(reference);
  return { target, input: target.querySelector<HTMLInputElement>('[data-testid=input]')!, form: target.querySelector<HTMLFormElement>('form')! };
}
async function settle(reference: boolean) { if (reference) await new Promise(resolve => setTimeout(resolve, 25)); else { await tick(); await tick(); } }
for (const reference of [true, false]) {
  const framework = reference ? 'React' : 'Svelte';
  for (const initial of [false, true]) for (const mode of ['accept', 'reject', 'rewrite', 'cancel-change', 'prevent-base']) it(`${framework} controlled checkbox ${mode} from ${initial}`, async () => {
    const { target, input } = await setup(reference, `checkbox-${mode}-${initial ? 'on' : 'off'}`);
    expect(input.checked).toBe(initial); input.click();
    expect(input.checked).toBe(mode === 'accept' ? !initial : initial);
    await settle(reference);
    expect(input.checked).toBe(mode === 'accept' ? !initial : initial);
    const calls = JSON.parse(target.querySelector('[data-testid=calls]')!.textContent!);
    expect(calls).toHaveLength(mode === 'prevent-base' ? 0 : 1);
    if (calls.length) expect(calls[0]).toMatchObject({ value: 'token', checked: !initial, reason: 'none', canceled: mode === 'cancel-change' });
    if (calls.length) expect(calls[0].type).toBe('click');
    expect(JSON.parse(target.querySelector('[data-testid=order]')!.textContent!)).toEqual(mode === 'prevent-base' ? ['render', 'consumer'] : ['render', 'consumer', 'value']);
  });
  for (const mode of ['accept', 'reject', 'rewrite', 'cancel-change', 'prevent-base']) it(`${framework} controlled radio group ${mode}`, async () => {
    const { target, input } = await setup(reference, `radio-${mode}-off`);
    input.click(); expect(input.checked).toBe(mode === 'accept'); await settle(reference);
    expect(input.checked).toBe(mode === 'accept');
    expect(target.querySelector<HTMLInputElement>('[data-testid=first]')!.checked).toBe(mode !== 'accept');
    expect(target.querySelector<HTMLInputElement>('[data-testid=other]')!.checked).toBe(true);
  });
  for (const scenario of ['radio-uncontrolled-default-off', 'radio-first-uncontrolled-reject-off']) it(`${framework} mixed radio ownership (${scenario})`, async () => {
    const { target, input } = await setup(reference, scenario);
    input.click(); await settle(reference);
    expect(input.checked).toBe(false);
    expect(target.querySelector<HTMLInputElement>('[data-testid=first]')!.checked).toBe(!scenario.includes('first-uncontrolled'));
    expect(target.querySelector<HTMLInputElement>('[data-testid=other]')!.checked).toBe(true);
  });
  it(`${framework} checked-only owner restores without a value prop and retains the native on value`, async () => {
    const { input, target } = await setup(reference, 'checkbox-no-value-reject-off');
    input.click(); await settle(reference); expect(input.checked).toBe(false);
    expect(JSON.parse(target.querySelector('[data-testid=calls]')!.textContent!)[0].value).toBe('on');
  });
  for (const canceled of [false, true]) it(`${framework} live checked changes retain initial reset default (${canceled})`, async () => {
    const { input, form, target } = await setup(reference, `checkbox-${canceled ? 'cancel-reset-' : ''}reject-off`);
    target.querySelector<HTMLButtonElement>('button:not([type=reset])')!.click(); await settle(reference);
    expect(input.checked).toBe(true); expect(input.defaultChecked).toBe(false);
    form.reset(); await settle(reference); expect(input.checked).toBe(canceled);
    expect(JSON.parse(target.querySelector('[data-testid=calls]')!.textContent!)).toEqual([]);
  });
  for (const controlled of [false, true]) it(`${framework} live defaultChecked updates preserve current checked (${controlled})`, async () => {
    const { input, form, target } = await setup(reference, `checkbox-${controlled ? '' : 'uncontrolled-'}default-off-reject-off`);
    [...target.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === 'Defaults')!.click(); await settle(reference);
    expect(input.checked).toBe(false); expect(input.defaultChecked).toBe(!controlled);
    form.reset(); await settle(reference); expect(input.checked).toBe(!controlled);
  });
  for (const canceled of [false, true]) it(`${framework} checked restoration after reset inside the owner callback (${canceled})`, async () => {
    const { input, target } = await setup(reference, `checkbox-${canceled ? 'cancel-reset-' : ''}reset-in-input-reject-off`);
    [...target.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === 'Programmatic')!.click(); await settle(reference);
    expect(input.checked).toBe(true); expect(input.defaultChecked).toBe(false);
    input.click(); await settle(reference); expect(input.checked).toBe(true);
    expect(JSON.parse(target.querySelector('[data-testid=calls]')!.textContent!)).toHaveLength(1);
  });
  it(`${framework} replacement checked host starts with its current owner as reset default`, async () => {
    const { input, target } = await setup(reference, 'checkbox-reject-off');
    [...target.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === 'Programmatic')!.click(); await settle(reference);
    [...target.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === 'Replace')!.click(); await settle(reference);
    const replacement = target.querySelector<HTMLInputElement>('[data-testid=input]')!;
    expect(replacement).not.toBe(input); expect(replacement.checked).toBe(true); expect(replacement.defaultChecked).toBe(true);
  });
  it(`${framework} no-form radio restoration follows the actual shadow root`, async () => {
    const outside = await setup(reference, 'radio-no-form-reject-off');
    const inside = await setup(reference, 'radio-no-form-reject-off', true);
    inside.input.click(); await settle(reference);
    expect(inside.input.checked).toBe(false); expect(inside.target.querySelector<HTMLInputElement>('[data-testid=first]')!.checked).toBe(true);
    expect(outside.input.checked).toBe(false); expect(outside.target.querySelector<HTMLInputElement>('[data-testid=first]')!.checked).toBe(true);
  });
  it(`${framework} radio restoration follows final native form reassociation without observer rerenders`, async () => {
    const { input, target } = await setup(reference, 'radio-reassociate-reject-off');
    input.click(); await settle(reference);
    expect(input.checked).toBe(false); expect(input.form?.id).toBe('other-form');
    expect(target.querySelector<HTMLInputElement>('[data-testid=other]')!.checked).toBe(true);
    // The source's final-group query leaves the former controlled group member unchecked.
    expect(target.querySelector<HTMLInputElement>('[data-testid=first]')!.checked).toBe(false);
  });
  it(`${framework} canceled native checkbox click callback characterization`, async () => {
    const { input, target } = await setup(reference, 'checkbox-cancel-click-reject-off');
    // Controlled restoration before native activation rollback preserves the source quirk.
    input.click(); await settle(reference); expect(input.checked).toBe(true);
    const calls = JSON.parse(target.querySelector('[data-testid=calls]')!.textContent!);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ type: 'click', defaultPrevented: true });
  });
  it(`${framework} canceled native radio click retains its click-backed callback and group`, async () => {
    const { input, target } = await setup(reference, 'radio-cancel-click-reject-off');
    input.click(); expect(input.checked).toBe(false); await settle(reference);
    expect(target.querySelector<HTMLInputElement>('[data-testid=first]')!.checked).toBe(true);
    const calls = JSON.parse(target.querySelector('[data-testid=calls]')!.textContent!);
    expect(calls).toHaveLength(1); expect(calls[0]).toMatchObject({ type: 'click', defaultPrevented: true });
  });
  it(`${framework} an input event alone does not manufacture a checkable click request`, async () => {
    const { input, target } = await setup(reference, 'checkbox-reject-off');
    input.checked = true; input.dispatchEvent(new InputEvent('input', { bubbles: true })); await settle(reference);
    expect(input.checked).toBe(true); expect(JSON.parse(target.querySelector('[data-testid=calls]')!.textContent!)).toEqual([]);
  });
  it(`${framework} replacement callback can accept the native checked read after forwarding props`, async () => {
    const { input, target } = await setup(reference, 'checkbox-after-props-read-off');
    input.click(); expect(input.checked).toBe(true); await settle(reference); expect(input.checked).toBe(true);
    expect(JSON.parse(target.querySelector('[data-testid=order]')!.textContent!)).toEqual(['render', 'consumer', 'value', 'after']);
  });
  for (const scenario of ['checkbox-reject-on', 'checkbox-default-reject-off', 'checkbox-default-off-reject-on', 'checkbox-uncontrolled-default-off', 'radio-reject-off']) it(`${framework} checked defaults and native reset (${scenario})`, async () => {
    const { target, input, form } = await setup(reference, scenario);
    const initial = input.checked; const resetDefault = input.defaultChecked;
    input.checked = !initial; form.reset(); await settle(reference);
    expect(input.checked).toBe(resetDefault);
    expect(JSON.parse(target.querySelector('[data-testid=calls]')!.textContent!)).toEqual([]);
    expect(resetDefault).toBe(initial);
  });
}
it('direct native Svelte checked props expose native input events and retain separate reset defaults', async () => {
  const target = document.createElement('section'); document.body.append(target);
  const component = mount(NativeFixture, { target, props: { initial: true } }); cleanups.push(() => unmount(component)); await tick();
  const input = target.querySelector('input')!;
  expect(input.checked).toBe(true); expect(input.defaultChecked).toBe(false);
  input.click(); expect(input.checked).toBe(false); await tick(); expect(input.checked).toBe(false);
  expect(target.querySelector('output')!.textContent).toBe('["input"]');
  target.querySelector('form')!.reset(); await tick(); expect(input.checked).toBe(false);
});
it('Svelte checked restoration completes before teardown and leaves removed hosts unchanged', async () => {
  const { input, target } = await setup(false, 'radio-reject-off');
  const first = target.querySelector<HTMLInputElement>('[data-testid=first]')!;
  input.click(); expect(input.checked).toBe(false); expect(first.checked).toBe(true);
  await cleanups.pop()!(); await tick();
  expect(input.checked).toBe(false); expect(first.checked).toBe(true);
});
