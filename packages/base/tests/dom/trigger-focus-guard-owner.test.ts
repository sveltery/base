// Supplemental native detached focus-owner witnesses; zero unchanged Original assertion credit.
import { afterEach, expect, it, vi } from 'vitest';
import { TriggerFocusGuards } from '../../src/lib/utils/popups/useTriggerFocusGuards.svelte.js';
import { REASONS } from '../../src/lib/internals/reasons.js';

afterEach(() => document.body.replaceChildren());

it('uses the live pre-focus host and current store through a detached callback', () => {
  document.body.innerHTML =
    '<button id="first"></button><button id="old"></button><button id="second"></button><button id="current"></button>';
  const initial = {
    setOpen: vi.fn(),
    select: () => null,
    context: {
      beforeContentFocusGuardRef: { current: null },
      triggerFocusTargetRef: { current: null },
    },
  };
  const replacement = { ...initial, setOpen: vi.fn() };
  let store = initial;
  const owner = new TriggerFocusGuards(() => store, { current: null });
  const { handlePreFocusGuardFocus } = owner;
  owner.preFocusGuardRef.current = document.getElementById('old');
  handlePreFocusGuardFocus(new FocusEvent('focus'));
  expect(document.activeElement).toBe(document.getElementById('first'));
  owner.preFocusGuardRef.current = document.getElementById('current');
  store = replacement;
  const event = new FocusEvent('focus');
  handlePreFocusGuardFocus(event);
  expect(document.activeElement).toBe(document.getElementById('second'));
  expect(initial.setOpen).toHaveBeenCalledTimes(1);
  expect(replacement.setOpen).toHaveBeenCalledTimes(1);
  expect(replacement.setOpen.mock.calls[0][0]).toBe(false);
  expect(replacement.setOpen.mock.calls[0][1].reason).toBe(REASONS.focusOut);
  expect(replacement.setOpen.mock.calls[0][1].event).toBe(event);
});

it('retains outside-entry redirection through a detached focus-target handler', () => {
  document.body.innerHTML =
    '<div id="popup"><button id="guard"></button></div><button id="outside"></button>';
  const positioner = document.getElementById('popup')!;
  const guard = document.getElementById('guard')!;
  const setOpen = vi.fn();
  const owner = new TriggerFocusGuards(
    () => ({
      setOpen,
      select: () => positioner,
      context: {
        beforeContentFocusGuardRef: { current: guard },
        triggerFocusTargetRef: { current: null },
      },
    }),
    { current: null },
  );
  const { handleFocusTargetFocus } = owner;
  handleFocusTargetFocus(
    new FocusEvent('focus', { relatedTarget: document.getElementById('outside') }),
  );
  expect(document.activeElement).toBe(guard);
  expect(setOpen).not.toHaveBeenCalled();
});
