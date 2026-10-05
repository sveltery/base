// Actual native publication, default hosts and cleanup; zero divergent React ref API credit.
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './NativeRadioBindingFixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
afterEach(async () => { for (const app of mounted.splice(0)) await unmount(app); document.body.replaceChildren(); });
for (const [initial, disabledFirst, selected] of [['b', false, 'b'], [null, false, 'a'], [null, true, 'b']] as const)
  it(`publishes the selected/enabled native input for ${String(initial)}, disabled-first=${disabledFirst}`, async () => {
    const target = document.createElement('main'); document.body.append(target);
    const app = mount(Fixture, { target, props: { initial, disabledFirst } }); mounted.push(app); flushSync(); await tick(); flushSync();
    const first = target.querySelector<HTMLElement>('[data-radio=a]')!;
    const second = target.querySelector<HTMLElement>('[data-radio=b]')!;
    expect(first.tagName).toBe('SPAN'); expect(second.tagName).toBe('SPAN');
    const inputs = target.querySelectorAll<HTMLInputElement>('input[type=radio]');
    expect(app.snapshot().firstInput).toBe(inputs[0]); expect(app.snapshot().secondInput).toBe(inputs[1]);
    expect(app.snapshot().groupInput).toBe(selected === 'a' ? inputs[0] : inputs[1]);
    second.click(); flushSync(); await tick(); flushSync();
    expect(app.snapshot().groupInput).toBe(inputs[1]); expect(inputs[1]!.checked).toBe(true);
    app.hide(); flushSync(); await tick();
    expect(app.snapshot()).toEqual({ groupInput: null, firstInput: null, secondInput: null });
  });
