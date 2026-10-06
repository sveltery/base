// Supplemental exact-Source/native/canonical witnesses. Zero ordinary credit.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import { mountSourceBoundary } from '../../../../apps/fixtures/src/lib/CollapsibleSourceBoundaryReference.js';
import NativeControlBoundary from './collapsible/NativeControlBoundary.svelte';
import CollapsibleFixture from './collapsible/Fixture.svelte';
const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const dispose of cleanups.splice(0)) await dispose();
  document.body.replaceChildren();
});
async function observe(
  framework: 'Original' | 'bare Svelte' | 'canonical control' | 'Collapsible',
  scenario: string,
) {
  const target = document.createElement('section');
  document.body.append(target);
  let snapshot: () => { events: boolean[]; callbackOwners: string[] };
  if (framework === 'Original') {
    const source = mountSourceBoundary(target, scenario);
    cleanups.push(source.dispose);
    snapshot = source.snapshot;
  } else if (framework === 'Collapsible') {
    const component = mount(CollapsibleFixture, { target, props: { scenario } });
    cleanups.push(() => unmount(component));
    snapshot = () => ({
      events: component.snapshot().events.map((event) => event.open),
      callbackOwners: component.snapshot().callbackOwners,
    });
  } else {
    const component = mount(NativeControlBoundary, {
      target,
      props: { scenario, canonical: framework === 'canonical control' },
    });
    cleanups.push(() => unmount(component));
    snapshot = component.snapshot;
  }
  await tick();
  const trigger = target.querySelector('#tested-trigger')! as HTMLButtonElement;
  // Both clicks share the same JavaScript task and no renderer commit is forced.
  trigger.click();
  if (scenario === 'default') trigger.click();
  // React's native event commit is asynchronous; a task boundary flushes it.
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  await tick();
  const result = { ...snapshot(), expanded: trigger.getAttribute('aria-expanded') };
  const dispose = cleanups.pop()!;
  await dispose();
  target.remove();
  return result;
}
for (const scenario of ['default', 'controlled-consumer', 'callback-snapshot'])
  it(`native live control boundary: ${scenario}`, async () => {
    const observations: Record<string, Awaited<ReturnType<typeof observe>>> = {};
    for (const framework of [
      'Original',
      'bare Svelte',
      'canonical control',
      'Collapsible',
    ] as const) {
      observations[framework] = await observe(framework, scenario);
    }
    console.log(JSON.stringify({ scenario, observations }));
    const expectedNative =
      scenario === 'default'
        ? { events: [true, false], callbackOwners: ['old', 'old'], expanded: 'false' }
        : scenario === 'controlled-consumer'
          ? { events: [false], callbackOwners: ['old'], expanded: 'true' }
          : { events: [true], callbackOwners: ['new'], expanded: 'true' };
    // Collapsible's default/controlled fixture intentionally doesn't record callback-owner tags.
    expect(observations['bare Svelte']).toEqual(expectedNative);
    expect(observations['canonical control']).toEqual(expectedNative);
    expect(observations.Collapsible).toEqual({
      ...expectedNative,
      callbackOwners: scenario === 'callback-snapshot' ? ['new'] : [],
    });
    expect(observations.Original).toEqual(
      scenario === 'default'
        ? { events: [true, true], callbackOwners: ['old', 'old'], expanded: 'true' }
        : scenario === 'controlled-consumer'
          ? { events: [true], callbackOwners: ['old'], expanded: 'true' }
          : { events: [true], callbackOwners: ['old'], expanded: 'true' },
    );
  });
