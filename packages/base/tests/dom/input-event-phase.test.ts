// Native-default supplements after removal of the historical Input restore scheduler.
// Historical phase assertions remain in parity/input/native-defaults/historical/ with zero credit.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/InputFixture.svelte';
import NativeFixture from './InputNativeFixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
afterEach(async () => {
  for (const component of mounted.splice(0)) await unmount(component);
  document.body.replaceChildren();
});
for (const canceled of [false, true])
  it(`native input dispatch and same-turn reset match a literal Svelte host (canceled=${canceled})`, async () => {
    const portHost = document.createElement('section'),
      nativeHost = document.createElement('section');
    document.body.append(portHost, nativeHost);
    mounted.push(
      mount(Fixture, {
        target: portHost,
        props: { scenario: `controlled-default-reset-in-input${canceled ? '-cancel' : ''}` },
      }),
    );
    mounted.push(
      mount(NativeFixture, {
        target: nativeHost,
        props: { value: 'owner', defaultValue: 'seed', resetOnInput: true, canceled },
      }),
    );
    await tick();
    const input = portHost.querySelector<HTMLInputElement>('[data-testid=input]')!,
      baseline = nativeHost.querySelector('input')!;
    for (const node of [input, baseline]) {
      node.value = 'edit';
      node.dispatchEvent(new InputEvent('input', { bubbles: true }));
    }
    expect(input.value).toBe(baseline.value);
    await tick();
    await tick();
    expect(input.value).toBe(baseline.value);
  });
it('distinct owner writes use ordinary Svelte rendering after an unchanged rejected edit', async () => {
  const target = document.createElement('section');
  document.body.append(target);
  mounted.push(mount(Fixture, { target, props: { scenario: 'controlled-reject' } }));
  await tick();
  const input = target.querySelector<HTMLInputElement>('[data-testid=input]')!;
  input.value = 'edit';
  input.dispatchEvent(new InputEvent('input', { bubbles: true }));
  await tick();
  await tick();
  expect(input.value).toBe('edit');
  target.querySelector<HTMLButtonElement>('button:not([type])')!.click();
  await tick();
  expect(input.value).toBe('programmatic');
});
