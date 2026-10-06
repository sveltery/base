// Native label/control association witnesses; zero unchanged Original assertion credit.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './NativeLabelRegistrationFixture.svelte';

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
});

function render() {
  const target = document.createElement('section');
  document.body.append(target);
  const component = mount(Fixture, { target });
  cleanups.push(() => unmount(component));
  return { component, target };
}

it('updates the actual label/control association and releases it when the owning label unmounts', async () => {
  const { component, target } = render();
  await tick();
  const input = target.querySelector('input')!;
  const label = target.querySelector('label')!;
  expect(label.control).toBe(input);
  expect(input.getAttribute('aria-labelledby')).toBe(label.id);
  expect(label.id).toBe('label-a');
  component.setId('label-b');
  await tick();
  expect(label.id).toBe('label-b');
  expect(label.control).toBe(input);
  expect(input.getAttribute('aria-labelledby')).toBe('label-b');
  component.removeLabel();
  await tick();
  expect(target.querySelector('label')).toBeNull();
  expect(input.getAttribute('aria-labelledby')).toBeNull();
  expect(input.labels).toHaveLength(0);
});

it('preserves a replacement DOM label association when the original owner unmounts', async () => {
  const { component, target } = render();
  await tick();
  const input = target.querySelector('input')!;
  component.replaceRegistration();
  await tick();
  const replacement = target.querySelector<HTMLLabelElement>('#other-owner')!;
  expect(input.getAttribute('aria-labelledby')).toBe(replacement.id);
  expect(replacement.control).toBe(input);
  component.removeLabel();
  await tick();
  expect(target.querySelector('#label-a')).toBeNull();
  expect(input.getAttribute('aria-labelledby')).toBe('other-owner');
  expect([...input.labels!]).toEqual([replacement]);
});
