// Authored native owner supplements; zero unchanged upstream assertion credit.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import { FieldValidationOwner } from '../../src/lib/field/root/useFieldValidation.svelte.js';
import type { UseFieldValidationReturnValue } from '../../src/lib/field/root/useFieldValidation.svelte.js';
import type { FieldRootProps } from '../../src/lib/field/types.js';
import Fixture from './FieldValidationOwnerFixture.svelte';

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  vi.useRealTimers();
  document.body.replaceChildren();
});

function render(validate: FieldRootProps['validate'], validationDebounceTime = 0) {
  const host = document.createElement('div');
  document.body.append(host);
  let validation!: UseFieldValidationReturnValue;
  const component = mount(Fixture, {
    target: host,
    props: { validate, validationDebounceTime, capture: (owner) => (validation = owner) },
  });
  let mounted = true;
  const destroy = async () => {
    if (mounted) await unmount(component);
    mounted = false;
  };
  cleanups.push(destroy);
  flushSync();
  return { validation, input: host.querySelector('input')!, destroy };
}

it('provided Field roots own independent classes and detached validation services', async () => {
  const first = render(() => 'first error');
  const second = render(() => null);
  expect(first.validation).toBeInstanceOf(FieldValidationOwner);
  expect(second.validation).toBeInstanceOf(FieldValidationOwner);
  expect(first.validation).not.toBe(second.validation);
  const { commit } = first.validation;
  await commit('first');
  flushSync();
  expect(first.input.validationMessage).toBe('first error');
  expect(second.input.validationMessage).toBe('');
  const { getValidationProps } = first.validation;
  expect(getValidationProps(false)['aria-invalid']).toBe(true);
});

it('detached change cancels an obsolete asynchronous commit', async () => {
  let resolve!: (error: string) => void;
  const screen = render(() => new Promise<string>((done) => (resolve = done)));
  const { commit, change } = screen.validation;
  const pending = commit('obsolete');
  change(undefined, true);
  resolve('obsolete error');
  await pending;
  flushSync();
  expect(screen.input.validationMessage).toBe('');
  expect(screen.validation.getValidationProps(false)['aria-invalid']).toBeUndefined();
});

it('debounce replacement and teardown clear the real owner timeout', async () => {
  vi.useFakeTimers();
  const validate = vi.fn((_value: unknown) => null);
  const screen = render(validate, 25);
  validate.mockClear();
  const { change } = screen.validation;
  change('old');
  change('current');
  await vi.advanceTimersByTimeAsync(25);
  expect(validate.mock.calls.map(([value]) => value)).toEqual(['current']);
  change('removed');
  await screen.destroy();
  await vi.advanceTimersByTimeAsync(25);
  expect(validate.mock.calls.map(([value]) => value)).toEqual(['current']);
});
