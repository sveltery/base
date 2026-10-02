// Independent checked/radio regression supplements. Zero ordinary Input declaration credit.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/InputCheckedFixture.svelte';
import { mountInputCheckedReference } from '../../../../apps/fixtures/src/lib/input-checked-reference.js';
const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); });
async function setup(reference: boolean, scenario: string) {
  const target = document.createElement('section'); document.body.append(target);
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
    expect(input.checked).toBe(initial); input.click(); await settle(reference);
    expect(input.checked).toBe(mode === 'accept' ? !initial : initial);
    const calls = JSON.parse(target.querySelector('[data-testid=calls]')!.textContent!);
    expect(calls).toHaveLength(mode === 'prevent-base' ? 0 : 1);
    if (calls.length) expect(calls[0]).toMatchObject({ value: 'token', checked: !initial, reason: 'none', canceled: mode === 'cancel-change' });
  });
  for (const mode of ['accept', 'reject', 'rewrite']) it(`${framework} controlled radio group ${mode}`, async () => {
    const { target, input } = await setup(reference, `radio-${mode}-off`);
    input.click(); await settle(reference);
    expect(input.checked).toBe(mode === 'accept');
    expect(target.querySelector<HTMLInputElement>('[data-testid=first]')!.checked).toBe(mode !== 'accept');
    expect(target.querySelector<HTMLInputElement>('[data-testid=other]')!.checked).toBe(true);
  });
  for (const scenario of ['checkbox-reject-on', 'checkbox-default-reject-off', 'checkbox-default-off-reject-on', 'checkbox-uncontrolled-default-off', 'radio-reject-off']) it(`${framework} checked defaults and native reset (${scenario})`, async () => {
    const { target, input, form } = await setup(reference, scenario);
    const initial = input.checked; const resetDefault = input.defaultChecked;
    input.checked = !initial; form.reset(); await settle(reference);
    expect(input.checked).toBe(resetDefault);
    expect(JSON.parse(target.querySelector('[data-testid=calls]')!.textContent!)).toEqual([]);
    // Characterization of the current main baseline, before the repair checkpoint.
    expect(resetDefault).toBe(reference ? initial : scenario.includes('default') && !scenario.includes('default-off'));
  });
}
