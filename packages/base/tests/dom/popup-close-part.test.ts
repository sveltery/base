import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './PopupClosePartFixture.svelte';
import Child from './PopupClosePartChild.svelte';

const mounted: ReturnType<typeof mount>[] = [];

afterEach(async () => {
  await Promise.all(mounted.splice(0).map((component) => unmount(component)));
  document.body.replaceChildren();
});

async function setup() {
  const target = document.createElement('div');
  document.body.append(target);
  const component = mount(Fixture, { target });
  mounted.push(component);
  await tick();
  return { component, target };
}

it('keeps close-part eligibility until the last registered child unmounts', async () => {
  const { component, target } = await setup();
  expect(target.querySelector('output')?.textContent).toBe('false');

  component.setChildren(true, false);
  await tick();
  expect(target.querySelector('output')?.textContent).toBe('true');

  component.setChildren(true, true);
  await tick();
  component.setChildren(false, true);
  await tick();
  expect(target.querySelector('output')?.textContent).toBe('true');

  component.setChildren(false, false);
  await tick();
  expect(target.querySelector('output')?.textContent).toBe('false');
});

it('owns registrations per native context and retains the Source zero clamp', async () => {
  const first = await setup();
  const second = await setup();
  const cleanup = first.component.register();
  await tick();
  expect(first.component.hasClosePart()).toBe(true);
  expect(second.component.hasClosePart()).toBe(false);

  cleanup();
  cleanup();
  await tick();
  expect(first.component.hasClosePart()).toBe(false);

  const nextCleanup = first.component.register();
  await tick();
  expect(first.component.hasClosePart()).toBe(true);
  nextCleanup();
  await tick();
  expect(first.component.hasClosePart()).toBe(false);
});

it('permits a registration consumer without a provider', async () => {
  const target = document.createElement('div');
  document.body.append(target);
  const component = mount(Child, { target });
  mounted.push(component);
  await tick();
  expect(target.querySelector('button')?.textContent).toBe('Close-part lifecycle witness');
});
