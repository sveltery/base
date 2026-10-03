// Native observer/FormData timing characterization, separate and uncredited.
import { afterAll, expect, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { probeInputTiming } from '../../../../apps/fixtures/src/lib/input-timing/probe.js';
import type { TimingResult } from '../../../../apps/fixtures/src/lib/input-timing/types.js';
const expectedOwner = { accept: 'edit', reject: 'owner', rewrite: 'EDIT' } as const;
const observations: TimingResult[] = [];
afterAll(() => { if (process.env.INPUT_TIMING_RESULTS_PATH) writeFileSync(process.env.INPUT_TIMING_RESULTS_PATH, `${JSON.stringify(observations, null, 2)}\n`); });
for (const framework of ['react', 'input', 'native-value', 'native-bind', 'native-bind-accessor', 'input-final-wrapper', 'input-owned-final-wrapper'] as const) for (const decision of ['accept', 'reject', 'rewrite'] as const) {
  it(`same-dispatch native observers and FormData (${framework}/${decision})`, async () => {
    const target = document.createElement('section'); document.body.append(target);
    let result: TimingResult;
    try { result = await probeInputTiming(target, framework, decision); } finally { target.remove(); }
    observations.push(result);
    const callbackStages = ['callback:before-owner', 'callback:after-owner'];
    const stages = ['document:capture', 'root:capture', 'form:capture', 'target:capture', ...(framework === 'native-bind-accessor' ? callbackStages : []), 'target:bubble', 'form:bubble', 'root:before-delegation', ...(framework === 'native-bind-accessor' ? [] : callbackStages), 'root:after-delegation', 'document:before-registered-delegation', 'document:after-registered-delegation', 'dispatch:return'];
    expect(result.immediate.map(observation => observation.stage)).toEqual(stages);
    const owner = expectedOwner[decision];
    const synchronous = framework === 'react' || framework === 'input-final-wrapper' || framework === 'input-owned-final-wrapper';
    const immediateValue = synchronous ? owner : 'edit';
    for (const observation of result.immediate) {
      expect(observation.formData).toBe(observation.value);
      const afterReact = ['root:after-delegation', 'document:before-registered-delegation', 'document:after-registered-delegation', 'dispatch:return'].includes(observation.stage);
      expect(observation.value).toBe(synchronous && afterReact ? owner : 'edit');
    }
    expect(result.immediate.at(-1)!.value).toBe(immediateValue);
    expect(result.settled).toEqual([{ stage: 'after:tick', value: (framework === 'native-value' || framework === 'input') && decision === 'reject' ? 'edit' : owner, formData: (framework === 'native-value' || framework === 'input') && decision === 'reject' ? 'edit' : owner }]);
    expect(result.owner).toBe(owner);
  });
}
for (const framework of ['react', 'input', 'input-owned-final-wrapper'] as const) it(`consumer prevention and owned controlled prop (${framework})`, async () => {
  const target = document.createElement('section'); document.body.append(target);
  let result: TimingResult;
  try { result = await probeInputTiming(target, framework, 'reject', true); } finally { target.remove(); }
  observations.push(result); expect(result.owner).toBe('owner');
  expect(result.immediate.map(observation => observation.stage)).toEqual(['document:capture', 'root:capture', 'form:capture', 'target:capture', 'target:bubble', 'form:bubble', 'root:before-delegation', 'consumer:prevent-base', 'root:after-delegation', 'document:before-registered-delegation', 'document:after-registered-delegation', 'dispatch:return']);
  for (const observation of result.immediate) {
    const restored = ['root:after-delegation', 'document:before-registered-delegation', 'document:after-registered-delegation', 'dispatch:return'].includes(observation.stage);
    expect(observation.value).toBe(framework !== 'input' && restored ? 'owner' : 'edit'); expect(observation.formData).toBe(observation.value);
  }
  expect(result.settled).toEqual([{ stage: 'after:tick', value: framework === 'input' ? 'edit' : 'owner', formData: framework === 'input' ? 'edit' : 'owner' }]);
});
