// Paired native reset regressions, distinct from ordinary upstream conformance declarations.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/InputResetObservationFixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
afterEach(async () => {
  for (const component of mounted.splice(0)) await unmount(component);
  document.body.replaceChildren();
});
for (const scenario of [
  'reassociation',
  'stop-immediate',
  'unrelated-old',
  'attachment-bubble',
  'attachment-capture',
  'attachment-bubble-replacement',
  'attachment-capture-replacement',
  'render-attachment-bubble-before',
  'render-attachment-capture-before',
  'reassociation-during-reset',
  'reassociation-after-reset',
  'reassociation-into-reset',
  'reassociation-during-reset-stop',
  'reassociation-after-reset-stop',
  'reassociation-into-reset-stop',
])
  for (const canceled of [false, true])
    for (const native of [true, false]) {
      it(`native reset observation (${native ? 'native' : 'Input'}/${scenario}/canceled=${canceled})`, async () => {
        const target = document.createElement('section');
        document.body.append(target);
        mounted.push(mount(Fixture, { target, props: { native, scenario, canceled } }));
        await tick();
        const input = target.querySelector<HTMLInputElement>('input')!;
        input.value = 'edit';
        input.dispatchEvent(new InputEvent('input', { bubbles: true }));
        const reset =
          !canceled &&
          scenario !== 'unrelated-old' &&
          !scenario.startsWith('reassociation-during-reset');
        expect(input.value).toBe(reset ? 'seed' : 'edit');
        expect(input.form!.id).toBe(
          scenario === 'stop-immediate' ||
            scenario.includes('attachment-') ||
            scenario.startsWith('reassociation-into-reset')
            ? 'reset-first'
            : 'reset-second',
        );
        if (!native && scenario.endsWith('-replacement')) expect(input.dataset.merged).toBe('true');
        await tick();
        await tick();
        expect(input.value).toBe(reset ? 'seed' : 'edit');
      });
    }
it('native reset and sibling edits remain independent', async () => {
  const target = document.createElement('section');
  document.body.append(target);
  mounted.push(
    mount(Fixture, {
      target,
      props: { scenario: 'render-attachment-capture-before', sibling: true },
    }),
  );
  await tick();
  const input = target.querySelector<HTMLInputElement>('[data-testid=reset-input]')!;
  const sibling = target.querySelector<HTMLInputElement>('[data-testid=reset-sibling]')!;
  input.value = 'edit';
  input.dispatchEvent(new InputEvent('input', { bubbles: true }));
  // Each native host owns its actual input/reset behavior.
  sibling.value = 'sibling edit';
  sibling.dispatchEvent(new InputEvent('input', { bubbles: true }));
  await tick();
  await tick();
  expect(input.value).toBe('seed');
  expect(sibling.value).toBe('sibling edit');
});
for (const native of [true, false])
  it(`target attachment reset inside a shadow root (${native ? 'native' : 'Input'})`, async () => {
    const host = document.createElement('section');
    document.body.append(host);
    const target = host.attachShadow({ mode: 'open' });
    mounted.push(
      mount(Fixture, { target, props: { native, scenario: 'render-attachment-capture-before' } }),
    );
    await tick();
    const input = target.querySelector<HTMLInputElement>('input')!;
    input.value = 'edit';
    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    await tick();
    await tick();
    expect(input.value).toBe('seed');
  });
