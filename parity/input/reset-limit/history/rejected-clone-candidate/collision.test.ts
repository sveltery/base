import { afterAll, expect, it } from '/workspace/base/packages/base/node_modules/vitest/dist/index.js';
import { mount, tick, unmount } from '/workspace/base/packages/base/node_modules/svelte/src/index-client.js';
import { writeFileSync } from 'node:fs';
import Fixture from './CollisionFixture.svelte';
import { readNativeInputDirtyValue } from './readNativeDirtyValue.js';
const results: { kind: string; move: string; collision: boolean; actual: string; expected: string; metadata: unknown }[] = [];
afterAll(() => {
  writeFileSync('/tmp/input-clone-reset-proof/collision-results.json', JSON.stringify(results, null, 2) + '\n');
  const out = results.find(result => result.kind === 'native' && result.move === 'out' && result.collision)!;
  const after = results.find(result => result.kind === 'native' && result.move === 'after' && result.collision)!;
  expect(out.metadata).toEqual(after.metadata);
});
for (const kind of ['native', 'current', 'candidate']) for (const move of ['out', 'after']) for (const collision of [false, true]) it(`native reset boundary collision (${kind}/${move}/collision=${collision})`, async () => {
  const target = document.createElement('section'); document.body.append(target); const component = mount(Fixture, { target, props: { kind, move, collision } }); await tick();
  const input = target.querySelector('input')!; let resetEvent: Event; const events: unknown[] = []; const mutations: unknown[] = [];
  const snapshot = (stage: string) => ({ stage, value: input.value, defaultValue: input.defaultValue, form: input.form?.id, flag: readNativeInputDirtyValue(input), phase: resetEvent?.eventPhase, canceled: resetEvent?.defaultPrevented });
  const capture = (event: Event) => { resetEvent = event; events.push(snapshot('capture')); queueMicrotask(() => events.push(snapshot('queued'))); };
  const bubble = () => events.push(snapshot('bubble'));
  document.addEventListener('reset', capture, true); document.addEventListener('reset', bubble);
  const observer = new MutationObserver(records => mutations.push(...records.map(record => ({ old: record.oldValue, current: input.getAttribute('form'), phase: resetEvent.eventPhase }))));
  observer.observe(input, { attributes: true, attributeFilter: ['form'], attributeOldValue: true });
  try {
    input.value = 'edit'; input.dispatchEvent(new InputEvent('input', { bubbles: true })); await tick(); await tick();
    const actual = input.value; const expected = move === 'after' ? collision ? 'edit' : 'seed' : kind === 'native' ? 'edit' : 'owner';
    results.push({ kind, move, collision, actual, expected, metadata: { events, mutations, settled: snapshot('settled') } });
    expect(actual).toBe(expected);
  } finally { observer.disconnect(); document.removeEventListener('reset', capture, true); document.removeEventListener('reset', bubble); await unmount(component); target.remove(); }
});
