// Authored actual Original/native regression; zero unchanged Original declaration credit.
import { expect, test, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Consumer from './fixtures/MenuAnchorInstalled.svelte';
import type { AnchorPositioningController } from '../../src/lib/internals/anchor-positioning/controller.svelte.js';
test('installed private geometry attaches, retains exit presence and tears down the real DOM engine', async () => {
  const warnings = vi.spyOn(console, 'warn');
  const target = document.createElement('main');
  document.body.append(target);
  let position!: AnchorPositioningController;
  const component = mount(Consumer, { target, props: { ready: (value) => (position = value) } });
  flushSync();
  expect(position.isPositioned).toBe(false);
  expect(position.elements.floating!.style.opacity).toBe('0');
  expect(position.elements.domReference).toBe(target.querySelector('button'));
  component.present(true, true);
  flushSync();
  await vi.waitFor(() => expect(position.isPositioned).toBe(true));
  expect(position.error).toBe(null);
  expect(position.elements.floating!.style.position).toBe('absolute');
  expect(position.elements.floating!.style.getPropertyValue('--available-width')).toMatch(/px$/);
  component.present(false, true);
  flushSync();
  expect(position.isPositioned).toBe(true);
  expect(position.elements.floating!.style.opacity).toBe('');
  component.present(false, false);
  flushSync();
  expect(position.isPositioned).toBe(false);
  expect(position.elements.floating!.style.position).toBe('fixed');
  await unmount(component);
  expect(position.elements.floating).toBe(null);
  expect(position.elements.domReference).toBe(null);
  await position.update();
  target.remove();
  expect(
    warnings.mock.calls.filter((args) =>
      args.some((value) => String(value).includes('derived_inert')),
    ),
  ).toEqual([]);
  warnings.mockRestore();
});
