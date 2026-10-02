// Native Svelte baseline; supplemental characterization, no upstream declaration credit.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './InputNativeFixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
afterEach(async () => { for (const component of mounted.splice(0)) await unmount(component); document.body.replaceChildren(); });
async function setup(props: { value?: string; defaultValue?: string; canceled?: boolean; resetOnInput?: boolean }) {
  const target = document.createElement('section'); document.body.append(target);
  mounted.push(mount(Fixture, { target, props })); await tick();
  return { input: target.querySelector('input')!, form: target.querySelector('form')! };
}
it('native spread: controlled value alone has no invented default, and reset changes DOM without callback', async () => {
  const { input, form } = await setup({ value: 'owner' });
  expect(input.value).toBe('owner'); expect(input.defaultValue).toBe('');
  input.value = 'edit'; form.reset(); await tick();
  expect(input.value).toBe(''); expect(input.defaultValue).toBe('');
});
for (const canceled of [false, true]) it(`native controlled spread preserves same-dispatch reset semantics (canceled=${canceled})`, async () => {
  const { input } = await setup({ value: 'owner', defaultValue: 'seed', resetOnInput: true, canceled });
  input.value = 'edit'; input.dispatchEvent(new InputEvent('input', { bubbles: true }));
  expect(input.value).toBe(canceled ? 'edit' : 'seed');
  await tick(); await tick(); expect(input.value).toBe(canceled ? 'edit' : 'seed');
});
it('native spread: explicit defaultValue remains the reset baseline alongside value', async () => {
  const { input, form } = await setup({ value: 'owner', defaultValue: 'seed' });
  expect(input.value).toBe('owner'); expect(input.defaultValue).toBe('seed');
  input.value = 'edit'; form.reset(); await tick(); expect(input.value).toBe('seed');
});
it('native spread: canceled reset preserves the edited native value', async () => {
  const { input, form } = await setup({ defaultValue: 'seed', canceled: true });
  input.value = 'edit'; form.reset(); await tick(); expect(input.value).toBe('edit'); expect(input.defaultValue).toBe('seed');
});
