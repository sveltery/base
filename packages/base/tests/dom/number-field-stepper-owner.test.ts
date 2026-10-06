// Native actual NumberField attachment owner lifetime supplements; zero upstream assertion credit.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import { reset } from '@sveltery/utils/error';
import Fixture from './NumberFieldStepperOwner.svelte';
let cleanup: (() => Promise<void>) | undefined;
afterEach(async () => {
  await cleanup?.();
  vi.restoreAllMocks();
  reset();
  document.body.replaceChildren();
});
it('actual NumberField stepper retains replacement host diagnostics after outgoing host disposal', () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  const target = document.createElement('div');
  document.body.append(target);
  const component = mount(Fixture, { target });
  cleanup = () => unmount(component);
  const diagnostics = () =>
    errors.mock.calls
      .map((args) => String(args[0]))
      .filter((message) => message.startsWith('Base UI: A component that acts as a button'));
  flushSync();
  console.log(
    'stage1',
    target.querySelectorAll('[data-host]').length,
    component.currentHost()?.dataset.host,
    diagnostics(),
  );
  expect(component.currentHost()?.dataset.host).toBe('A');
  component.publishReplacement();
  flushSync();
  console.log(
    'stage2',
    target.querySelectorAll('[data-host]').length,
    component.currentHost()?.dataset.host,
    diagnostics(),
  );
  expect(target.querySelectorAll('[data-host]')).toHaveLength(2);
  expect(component.currentHost()?.dataset.host).toBe('B');
  component.disposeOutgoing();
  flushSync();
  console.log(
    'stage3',
    target.querySelectorAll('[data-host]').length,
    component.currentHost()?.dataset.host,
    diagnostics(),
  );
  expect(target.querySelector('[data-host="A"]')).toBeNull();
  expect(component.currentHost()).toBe(target.querySelector('[data-host="B"]'));
  component.requireNonNativeHost();
  flushSync();
  console.log('stage4', component.currentHost()?.dataset.host, diagnostics());
  expect(diagnostics()).toHaveLength(1);
  expect(diagnostics()[0]).toContain('expected a non-<button>');
});

it('control actual replacement B emits host diagnostic before outgoing A disposal', () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  const target = document.createElement('div');
  document.body.append(target);
  const component = mount(Fixture, { target });
  cleanup = () => unmount(component);
  flushSync();
  component.publishReplacement();
  flushSync();
  expect(component.currentHost()?.dataset.host).toBe('B');
  component.requireNonNativeHost();
  flushSync();
  const diagnostics = errors.mock.calls
    .map((args) => String(args[0]))
    .filter((message) => message.startsWith('Base UI: A component that acts as a button'));
  console.log(
    'control before A disposal',
    target.querySelectorAll('[data-host]').length,
    component.currentHost()?.dataset.host,
    diagnostics,
  );
  expect(diagnostics).toHaveLength(1);
  expect(diagnostics[0]).toContain('expected a non-<button>');
});

it('actual NumberField stepper retains the same host through native prop updates', () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  const target = document.createElement('div');
  document.body.append(target);
  const component = mount(Fixture, { target });
  cleanup = () => unmount(component);
  flushSync();
  const host = target.querySelector('[data-host="A"]');
  component.requireNonNativeHost();
  flushSync();
  expect(component.currentHost()).toBe(host);
  expect(
    errors.mock.calls.filter((args) => String(args[0]).includes('expected a non-<button>')),
  ).toHaveLength(1);
  reset();
  errors.mockClear();
  component.requireNativeHost();
  flushSync();
  component.requireNonNativeHost();
  flushSync();
  expect(component.currentHost()).toBe(host);
  expect(target.querySelectorAll('[data-host]')).toHaveLength(1);
  expect(
    errors.mock.calls.filter((args) => String(args[0]).includes('expected a non-<button>')),
  ).toHaveLength(1);
});
