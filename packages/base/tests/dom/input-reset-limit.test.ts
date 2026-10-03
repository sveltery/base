// Native Svelte reassociation/cancellation comparison, zero ordinary source credit.
// The four historical expected-failure witnesses remain unchanged in
// parity/input/native-defaults/historical/input-reset-limit.test.ts at their old head.
import { expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './InputResetLimitFixture.svelte';
for (const move of ['out', 'in', 'after'] as const) for (const stop of [false, true, 'propagation'] as const) for (const cancel of [false, true]) {
  it(`Input retains native reset reassociation ${move}/stop=${stop}/cancel=${cancel}`, async () => {
    const observations: { immediate: string; settled: string; form: string }[] = [];
    for (const native of [false, true]) {
      const target = document.createElement('section'); document.body.append(target);
      const component = mount(Fixture, { target, props: { move, stop, cancel, native } }); await tick();
      try {
        const input = target.querySelector('input')!; input.value = 'edit'; input.dispatchEvent(new InputEvent('input', { bubbles: true }));
        const immediate = input.value; await tick(); await tick(); observations.push({ immediate, settled: input.value, form: input.form!.id });
      } finally { await unmount(component); target.remove(); }
    }
    expect(observations[0]).toEqual(observations[1]);
  });
}
