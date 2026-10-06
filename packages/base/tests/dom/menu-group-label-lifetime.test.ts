// Authored native registration/lifetime supplement; zero unchanged Original assertion credit.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './MenuGroupLabelLifetimeFixture.svelte';

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
  const group = target.querySelector<HTMLElement>('[data-testid="native-menu-group"]')!;
  expect(group.getAttribute('role')).toBe('group');
  expect(group.getAttribute('aria-labelledby')).toBe('initial-group-label');
  return { component, group, target };
}

it('updates the actual group association when its mounted label ID changes', async () => {
  const { component, group, target } = await setup();
  const label = target.querySelector('[data-testid="primary-label"]');
  component.setPrimaryId('updated-group-label');
  await tick();
  expect(target.querySelector('[data-testid="primary-label"]')).toBe(label);
  expect(label?.getAttribute('id')).toBe('updated-group-label');
  expect(group.getAttribute('aria-labelledby')).toBe('updated-group-label');
  component.hidePrimary();
  await tick();
  expect(target.querySelector('[data-testid="primary-label"]')).toBeNull();
  expect(group.hasAttribute('aria-labelledby')).toBe(false);
});

it('clears the installed association when ID change and label removal share one native update', async () => {
  const { component, group, target } = await setup();
  component.setPrimaryId('never-installed-group-label');
  component.hidePrimary();
  await tick();
  expect(target.querySelector('[data-testid="primary-label"]')).toBeNull();
  expect(group.hasAttribute('aria-labelledby')).toBe(false);
});

it('preserves a replacement label when the older label changes to its ID before removal', async () => {
  const { component, group, target } = await setup();
  component.showReplacement();
  await tick();
  const replacement = target.querySelector('[data-testid="replacement-label"]');
  expect(replacement?.getAttribute('id')).toBe('replacement-group-label');
  expect(group.getAttribute('aria-labelledby')).toBe('replacement-group-label');
  component.setPrimaryId('replacement-group-label');
  component.hidePrimary();
  await tick();
  expect(target.querySelector('[data-testid="primary-label"]')).toBeNull();
  expect(target.querySelector('[data-testid="replacement-label"]')).toBe(replacement);
  expect(group.getAttribute('aria-labelledby')).toBe('replacement-group-label');
});
