// Supplemental fidelity regressions; pinned effect closures retain their installed registration IDs.
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './FieldRegistrationIdsFixture.svelte';
import RegisteredLabelFixture from './RegisteredLabelIdLifecycleFixture.svelte';

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
});

for (const [firstError, secondError] of [
  [false, false],
  [false, true],
  [true, true],
]) {
  it(`replaces and removes simultaneous message IDs (${firstError}/${secondError})`, () => {
    const host = document.createElement('div');
    document.body.append(host);
    const component = mount(Fixture, { target: host, props: { firstError, secondError } });
    cleanups.push(() => unmount(component));
    flushSync();
    const input = host.querySelector('input')!;
    expect(input.getAttribute('aria-describedby')).toBe('first-a second-a');

    component.updateMessages();
    flushSync();
    expect(input.getAttribute('aria-describedby')).toBe('first-b second-b');
    component.hideMessages();
    flushSync();
    expect(input.getAttribute('aria-describedby')).toBeNull();

    component.showMessages();
    flushSync();
    expect(input.getAttribute('aria-describedby')).toBe('first-b second-b');
    component.hideMessages();
    flushSync();
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });
}

it('preserves the remaining legend when an earlier legend changes ID while unmounting', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const component = mount(Fixture, { target: host });
  cleanups.push(() => unmount(component));
  flushSync();
  const fieldset = host.querySelector('fieldset')!;
  expect(fieldset.getAttribute('aria-labelledby')).toBe('legend-second');
  component.changeAndRemoveFirstLegend();
  flushSync();
  expect(fieldset.getAttribute('aria-labelledby')).toBe('legend-second');
  component.removeSecondLegend();
  flushSync();
  expect(fieldset.getAttribute('aria-labelledby')).toBeNull();
});

it('releases the installed label ID before registering its replacement and on teardown', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const component = mount(RegisteredLabelFixture, { target: host });
  flushSync();
  expect(component.readRegistrations()).toEqual(['label-a']);
  component.replaceId();
  flushSync();
  expect(component.readRegistrations()).toEqual(['label-a', undefined, 'label-b']);
  expect(host.firstElementChild?.getAttribute('data-registered-label')).toBe('label-b');
  await unmount(component);
  expect(component.readRegistrations()).toEqual(['label-a', undefined, 'label-b', undefined]);
});
