import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/MenuFamilyFixture.svelte';
import { mountMenuFamilyReference } from '../../../../apps/fixtures/src/lib/menu-family-reference.js';
// Authored actual Source/native DOM supplements, zero unchanged Original credit.
const cleanup: (() => void | Promise<void>)[] = [];
async function settle() {
  await tick();
  await new Promise((resolve) => setTimeout(resolve, 70));
  await tick();
}
async function setup(
  reference: boolean,
  options: Parameters<typeof mountMenuFamilyReference>[1] = {},
) {
  const target = document.createElement('section');
  document.body.append(target);
  const log: unknown[] = [];
  const props = {
    ...options,
    log: (kind: string, value: unknown, reason?: string) => log.push([kind, value, reason]),
  };
  const instance = reference
    ? mountMenuFamilyReference(target, props)
    : mount(Fixture, { target, props });
  cleanup.push(() =>
    reference
      ? (instance as ReturnType<typeof mountMenuFamilyReference>).stop()
      : unmount(instance),
  );
  await settle();
  return { log, instance };
}
const byId = (id: string) => document.getElementById(id)!;
function press(id: string) {
  const event = new MouseEvent('pointerdown', { bubbles: true, button: 0 });
  Object.defineProperties(event, {
    pointerType: { value: 'mouse' },
    width: { value: 1 },
    height: { value: 1 },
  });
  byId(id).dispatchEvent(event);
  byId(id).dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
}
function key(id: string, key: string) {
  byId(id).dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));
}
afterEach(async () => {
  for (const stop of cleanup.splice(0)) await stop();
  await settle();
  vi.restoreAllMocks();
  document.body.replaceChildren();
  document.body.removeAttribute('style');
  document.documentElement.removeAttribute('style');
});
for (const reference of [true, false]) {
  const framework = reference ? 'React Original' : 'Svelte';
  it(`${framework}: opens, labels groups, navigates disabled items and closes on selection`, async () => {
    const { log } = await setup(reference);
    byId('opener').click();
    await settle();
    expect(document.querySelector('[role=menu]')).not.toBeNull();
    expect(byId('group').getAttribute('aria-labelledby')).toBe('group-label');
    expect(byId('radio-group').getAttribute('aria-labelledby')).toBe('radio-label');
    expect(document.activeElement?.id).toBe('alpha');
    key('alpha', 'ArrowDown');
    await settle();
    expect(document.activeElement?.id).toBe('disabled');
    byId('disabled').click();
    await settle();
    expect(log).not.toContainEqual(['item', 'disabled', undefined]);
    key('disabled', 'b');
    await settle();
    expect(document.activeElement?.id).toBe('bravo');
    byId('bravo').click();
    await settle();
    expect(document.querySelector('[role=menu]')).toBeNull();
    expect(log).toContainEqual(['open', false, 'item-press']);
  });
  for (const cancel of ['', 'check', 'radio'])
    it(`${framework}: checkbox/radio selection and cancellation (${cancel || 'accepted'})`, async () => {
      await setup(reference, { defaultOpen: true, cancel });
      byId('check').click();
      await settle();
      expect(byId('check').getAttribute('aria-checked')).toBe(
        cancel === 'check' ? 'false' : 'true',
      );
      byId('two').click();
      await settle();
      expect(byId('two').getAttribute('aria-checked')).toBe(cancel === 'radio' ? 'false' : 'true');
      expect(document.querySelector('[role=menu]')).not.toBeNull();
    });
  for (const cancel of ['open', 'close'])
    it(`${framework}: canceled root ${cancel} keeps the existing logical state`, async () => {
      await setup(reference, { defaultOpen: cancel === 'close', cancel });
      byId('opener').click();
      await settle();
      expect(document.querySelector('[role=menu]') !== null).toBe(cancel === 'close');
    });
  it(`${framework}: detached handle opens another owner and closes imperatively`, async () => {
    const { instance } = await setup(reference, { mode: 'detached' });
    instance.command('open');
    await settle();
    expect(byId('opener').getAttribute('aria-expanded')).toBe('true');
    instance.command('second');
    await settle();
    expect(byId('second').getAttribute('aria-expanded')).toBe('true');
    expect(byId('opener').getAttribute('aria-expanded')).toBe('false');
    instance.command('close');
    await settle();
    expect(document.querySelector('[role=menu]')).toBeNull();
  });
  it(`${framework}: submenu arrow opening and Escape close only the nested menu`, async () => {
    await setup(reference, { mode: 'nested', defaultOpen: true });
    byId('sub').focus();
    key('sub', 'ArrowRight');
    await settle();
    expect(document.querySelector('[data-testid=sub-popup]')).not.toBeNull();
    expect(document.activeElement?.id).toBe('sub-first');
    key('sub-first', 'Escape');
    await settle();
    expect(document.querySelector('[data-testid=sub-popup]')).toBeNull();
    expect(document.querySelector('[data-testid=popup]')).not.toBeNull();
  });
  for (const direction of ['ltr', 'rtl'] as const)
    it(`${framework}: deep Escape returns focus to its still-mounted parent trigger (${direction})`, async () => {
      const warnings = vi.spyOn(console, 'warn');
      await setup(reference, { mode: 'nested', defaultOpen: true, direction });
      const openKey = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      byId('sub').focus();
      key('sub', openKey);
      await settle();
      expect(document.activeElement?.id).toBe('sub-first');
      key('sub-first', 'ArrowDown');
      await settle();
      expect(document.activeElement?.id).toBe('deep');
      key('deep', openKey);
      await settle();
      expect(document.activeElement?.id).toBe('deep-first');
      key('deep-first', 'Escape');
      await settle();
      expect(document.getElementById('deep-first')).toBeNull();
      expect(document.activeElement?.id).toBe('deep');
      expect(
        warnings.mock.calls.filter((args) =>
          args.some((value) => String(value).includes('derived_inert')),
        ),
      ).toEqual([]);
    });
  it(`${framework}: context pointer virtual anchor opens and Escape dismisses`, async () => {
    await setup(reference, { mode: 'context' });
    byId('opener').dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2,
        clientX: 120,
        clientY: 80,
      }),
    );
    await settle();
    expect(document.querySelector('[role=menu]')).not.toBeNull();
    key('alpha', 'Escape');
    await settle();
    expect(document.querySelector('[role=menu]')).toBeNull();
  });
  it(`${framework}: Menubar sibling opening keeps exactly one popup`, async () => {
    await setup(reference, { mode: 'menubar' });
    press('opener');
    await settle();
    press('second');
    await settle();
    expect(document.querySelector('[data-testid=popup]')).toBeNull();
    expect(document.querySelector('[data-testid=edit-popup]')).not.toBeNull();
    expect(byId('menubar').hasAttribute('data-has-submenu-open')).toBe(true);
  });
  it(`${framework}: RTL submenu and Home/End retain Source list navigation`, async () => {
    await setup(reference, { mode: 'nested', direction: 'rtl', defaultOpen: true });
    byId('sub').focus();
    key('sub', 'ArrowLeft');
    await settle();
    expect(document.activeElement?.id).toBe('sub-first');
    key('sub-first', 'ArrowRight');
    await settle();
    expect(document.querySelector('[data-testid=sub-popup]')).toBeNull();
    key('sub', 'Home');
    await settle();
    expect(document.activeElement?.id).toBe('alpha');
    key('alpha', 'End');
    await settle();
    expect(document.activeElement?.id).toBe('sub');
  });
  for (const gesture of ['move', 'multiple', 'long-press'])
    it(`${framework}: context touch ${gesture}`, async () => {
      await setup(reference, { mode: 'context' });
      function touch(type: string, touches: { clientX: number; clientY: number }[]) {
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.defineProperty(event, 'touches', { value: touches });
        byId('opener').dispatchEvent(event);
      }
      touch('touchstart', [{ clientX: 30, clientY: 40 }]);
      if (gesture === 'move') touch('touchmove', [{ clientX: 41, clientY: 40 }]);
      if (gesture === 'multiple')
        touch('touchmove', [
          { clientX: 30, clientY: 40 },
          { clientX: 31, clientY: 41 },
        ]);
      await new Promise((resolve) => setTimeout(resolve, 530));
      await settle();
      expect(document.querySelector('[role=menu]') !== null).toBe(gesture === 'long-press');
      touch('touchend', []);
    });
  it(`${framework}: delayed context mouse release outside cancels open`, async () => {
    const { log } = await setup(reference, { mode: 'context' });
    byId('opener').dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2,
        clientX: 30,
        clientY: 40,
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 530));
    await settle();
    expect(document.querySelector('[role=menu]')).not.toBeNull();
    byId('outside').dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 2 }));
    await settle();
    expect(document.querySelector('[role=menu]')).toBeNull();
    expect(log).toContainEqual(['open', false, 'cancel-open']);
  });
  it(`${framework}: viewport snapshots actual old DOM and remounts current payload`, async () => {
    let finish!: () => void;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'getAnimations');
    Object.defineProperty(HTMLElement.prototype, 'getAnimations', {
      configurable: true,
      value: () => [{ finished, pending: false, playState: 'running' }],
    });
    try {
      const { instance } = await setup(reference, { mode: 'viewport' });
      instance.command('open');
      await settle();
      const first = document.querySelector('[data-current]');
      expect(first?.textContent).toContain('7');
      instance.command('second');
      await settle();
      expect(document.querySelector('[data-current]')).not.toBe(first);
      expect(first?.isConnected).toBe(false);
      expect(document.querySelector('[data-current]')?.textContent).toContain('9');
      const previous = document.querySelector('[data-previous]');
      expect(previous?.textContent).toContain('7');
      expect(previous?.hasAttribute('inert')).toBe(true);
      finish();
      await settle();
      expect(document.querySelector('[data-previous]')).toBeNull();
      instance.command('close');
      await settle();
      expect(document.querySelector('[role=menu]')).toBeNull();
    } finally {
      finish();
      if (descriptor) Object.defineProperty(HTMLElement.prototype, 'getAnimations', descriptor);
      else Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
    }
  });
}
