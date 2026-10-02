// Actual Input copy plus detached-clone measurement. No production edits or ordinary parity credit.
import { afterAll, expect, it } from '/workspace/base/packages/base/node_modules/vitest/dist/index.js';
import { mount, tick, unmount } from '/workspace/base/packages/base/node_modules/svelte/src/index-client.js';
import { writeFileSync } from 'node:fs';
import Fixture from './CandidateFixture.svelte';
import { cases } from './inputValues.js';
const results: unknown[] = [];
afterAll(() => writeFileSync('/tmp/input-clone-reset-proof/candidate-results.json', JSON.stringify(results, null, 2) + '\n'));
for (const [type, seed, edit, owner] of cases.filter(([type]) => type !== 'textarea')) for (const move of ['out', 'in', 'after']) for (const stop of [false, true]) for (const cancel of [false, true]) for (const collision of [false, true]) for (const native of [true, false]) {
  it(`clone candidate ${type}/${move}/stop=${stop}/cancel=${cancel}/collision=${collision}/${native ? 'native' : 'Input'}`, async () => {
    const target = document.createElement('section'); document.body.append(target);
    const component = mount(Fixture, { target, props: { native, move, stop, cancel, type, seed, owner } }); await tick();
    try {
      const input = target.querySelector('input,textarea') as HTMLInputElement | HTMLTextAreaElement; input.value = collision ? seed : edit; input.dispatchEvent(new InputEvent('input', { bubbles: true }));
      const immediate = input.value; await tick(); await tick(); const settled = input.value;
      const successful = !cancel && move !== 'out'; const expected = successful ? seed : native ? collision ? seed : edit : owner;
      results.push({ type, move, stop, cancel, collision, native, immediate, settled, expected });
      expect(immediate).toBe(successful ? seed : collision ? seed : edit); expect(settled).toBe(expected);
    } finally { await unmount(component); target.remove(); }
  });
}
for (const decision of ['accept','rewrite']) for (const move of ['out','in','after']) for (const stop of [false,true]) for (const cancel of [false,true]) for (const native of [true,false]) it(`clone candidate owner ${decision}/${move}/stop=${stop}/cancel=${cancel}/${native ? 'native' : 'Input'}`, async () => {
  const target = document.createElement('section'); document.body.append(target); const callbacks: unknown[] = [];
  const component = mount(Fixture, { target, props: { native, decision, move, stop, cancel, record: (entry: unknown) => callbacks.push(entry) } }); await tick();
  try { const input = target.querySelector('input')!; input.value = 'edit'; input.dispatchEvent(new InputEvent('input', { bubbles: true })); await tick(); await tick();
    const next = !cancel && move !== 'out' ? 'seed' : 'edit'; expect(input.value).toBe(decision === 'rewrite' ? next.toUpperCase() : next); expect(callbacks).toEqual([{ callback: next }]);
  } finally { await unmount(component); target.remove(); }
});
