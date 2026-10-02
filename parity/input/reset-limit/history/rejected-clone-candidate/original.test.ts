// Scratch native/Input diagnostic. No production edits and zero ordinary conformance credit.
import { afterAll, expect, it } from '/workspace/base/packages/base/node_modules/vitest/dist/index.js';
import { mount, tick, unmount } from '/workspace/base/packages/base/node_modules/svelte/src/index-client.js';
import { writeFileSync } from 'node:fs';
import Fixture from './OriginalImperativeFixture.svelte';
const results: unknown[] = [];
afterAll(() => writeFileSync('/tmp/input-clone-reset-proof/original-results.json', JSON.stringify(results, null, 2) + '\n'));
for (const move of ['out', 'in', 'after']) for (const stop of [false, true]) for (const cancel of [false, true]) for (const native of [true, false]) {
  it(`imperative native reset ${move}/stop=${stop}/cancel=${cancel}/${native ? 'native' : 'Input'}`, async () => {
    const observations: unknown[] = []; const target = document.createElement('section'); document.body.append(target);
    const component = mount(Fixture, { target, props: { native, move, stop, cancel, record: (observation: unknown) => observations.push(observation) } }); await tick();
    try {
      const input = target.querySelector('input')!; input.value = 'edit'; input.dispatchEvent(new InputEvent('input', { bubbles: true }));
      const immediate = input.value; await tick(); await tick(); const settled = input.value;
      const successful = !cancel && move !== 'out'; const expected = successful ? 'seed' : native ? 'edit' : 'owner';
      results.push({ move, stop, cancel, native, immediate, settled, expected, form: input.form?.id, observations });
      expect(immediate).toBe(successful ? 'seed' : 'edit'); expect(settled).toBe(expected); expect(input.form!.id).toBe(move === 'in' ? 'imperative-first' : 'imperative-second');
    } finally { await unmount(component); target.remove(); }
  });
}
