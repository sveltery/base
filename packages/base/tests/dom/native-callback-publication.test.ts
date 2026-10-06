// Native tracking regressions authored for PR76; zero ordinary Source parity credit.
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './NativeCallbackPublicationFixture.svelte';

const mounted: ReturnType<typeof mount>[] = [];
afterEach(async () => {
  await Promise.all(mounted.splice(0).map((component) => unmount(component)));
  document.body.replaceChildren();
});

function setup() {
  const target = document.createElement('div');
  document.body.append(target);
  const component = mount(Fixture, { target });
  mounted.push(component);
  flushSync();
  return component;
}

it('Avatar status callbacks may update reactive request logs without repeating delivery', () => {
  const component = setup();
  expect(component.snapshot().avatarRequests).toEqual(['error']);
  flushSync();
  expect(component.snapshot().avatarRequests).toEqual(['error']);
  component.setSource('next-avatar.png');
  flushSync();
  expect(component.snapshot().avatarRequests).toEqual(['error', 'loading']);
});

it('Tooltip disabled-close requests may update reactive logs and cancel controlled requests', () => {
  const component = setup();
  expect(component.snapshot().tooltipRequests).toEqual([false]);
  flushSync();
  expect(component.snapshot().tooltipRequests).toEqual([false]);
  component.setDisabled(false);
  flushSync();
  component.setDisabled(true);
  flushSync();
  expect(component.snapshot().tooltipRequests).toEqual([false, false]);
});

it('Composite disabled-index reconciliation may publish to a reactive request log', async () => {
  const component = setup();
  await tick();
  expect(component.snapshot().highlightedRequests).toEqual([]);
  component.setDisabledIndices([0]);
  flushSync();
  expect(component.snapshot().highlightedRequests).toEqual([1]);
  await tick();
  expect(component.snapshot().highlightedRequests).toEqual([1]);
});

it('RadioGroup representative input refs may publish to a reactive request log', () => {
  const component = setup();
  const requests = component.snapshot().representativeInputs;
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.at(-1)?.checked).toBe(true);
  flushSync();
  expect(component.snapshot().representativeInputs).toHaveLength(requests.length);
});
