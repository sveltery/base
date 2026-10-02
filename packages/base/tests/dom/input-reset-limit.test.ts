// Accepted unsupported boundary characterization. Zero ordinary Input/Field conformance credit.
import { writeFileSync } from 'node:fs';
import { afterAll, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './InputResetLimitFixture.svelte';

const results: {
  move: string;
  stop: false | true | 'propagation';
  cancel: boolean;
  native: boolean;
  approvedUnsupported: boolean;
  immediate: string;
  settled: string;
  expectedImmediate: string;
  expectedSettled: string;
  form: string;
}[] = [];
const cleanedCases: string[] = [];

for (const move of ['out', 'in', 'after'] as const) {
  for (const stop of [false, true, 'propagation'] as const) {
    for (const cancel of [false, true]) {
      for (const native of [false, true]) {
        const approvedUnsupported = !native && !cancel && move !== 'after' && stop !== false;
        const characterize = approvedUnsupported ? it.fails : it;
        characterize(`${approvedUnsupported ? 'approved unsupported' : 'supported/native'} imperative reset ${move}/stop=${stop}/cancel=${cancel}/native=${native}`, async () => {
          const target = document.createElement('section');
          document.body.append(target);
          const component = mount(Fixture, { target, props: { move, stop, cancel, native } });
          await tick();
          try {
            const input = target.querySelector('input')!;
            input.value = 'edit';
            input.dispatchEvent(new InputEvent('input', { bubbles: true }));
            const successful = !cancel && move !== 'out';
            const immediate = input.value;
            // Exact normative assertions retained from the historical independent 36-case probe.
            expect(input.value).toBe(successful ? 'seed' : 'edit');
            await tick();
            await tick();
            results.push({
              move, stop, cancel, native, approvedUnsupported, immediate,
              settled: input.value,
              expectedImmediate: successful ? 'seed' : 'edit',
              expectedSettled: successful ? 'seed' : native ? 'edit' : 'owner',
              form: input.form!.id,
            });
            expect(input.value).toBe(successful ? 'seed' : native ? 'edit' : 'owner');
            expect(input.form!.id).toBe(move === 'in' ? 'first' : 'second');
          } finally {
            await unmount(component);
            target.remove();
            cleanedCases.push(`${move}/${stop}/${cancel}/${native}`);
          }
        });
      }
    }
  }
}

afterAll(() => {
  const output = process.env.INPUT_RESET_LIMIT_RESULTS_PATH;
  if (output) writeFileSync(output, `${JSON.stringify(results, null, 2)}\n`);
  // Outside it.fails: unrelated setup, assertion or cleanup errors cannot stand in for the known limitation.
  expect(results).toHaveLength(36);
  expect(new Set(cleanedCases).size).toBe(36);
  const unsupported = results.filter(result => result.approvedUnsupported);
  expect(unsupported).toHaveLength(4);
  expect(unsupported.map(({ move, stop }) => `${move}/${stop}`).sort()).toEqual([
    'in/propagation', 'in/true', 'out/propagation', 'out/true',
  ]);
  for (const result of results) {
    expect(result.immediate).toBe(result.expectedImmediate);
    expect(result.form).toBe(result.move === 'in' ? 'first' : 'second');
    if (result.approvedUnsupported) {
      expect(result.native).toBe(false);
      expect(result.cancel).toBe(false);
      expect(result.settled).toBe(result.move === 'in' ? 'owner' : 'edit');
      expect(result.settled).not.toBe(result.expectedSettled);
    } else {
      expect(result.settled).toBe(result.expectedSettled);
    }
  }
});
