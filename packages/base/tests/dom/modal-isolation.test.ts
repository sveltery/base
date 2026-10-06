import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/ModalIsolationFixture.svelte';
import { markOthers } from '../../src/lib/floating-ui/utils/markOthers.js';
import { mountModalIsolationReference } from '../../../../apps/fixtures/src/lib/modal-isolation-reference.js';
// Paired source-derived supplements: attribute/lifecycle diagnostics, not browser evidence.
const cleanup: (() => void | Promise<void>)[] = [];
async function settle() {
  await tick();
  await new Promise((resolve) => setTimeout(resolve, 60));
  await tick();
}
async function command(value: string) {
  (
    document.querySelector('main') as HTMLElement & { isolationCommand(command: string): void }
  ).isolationCommand(value);
  await settle();
}
function element(id: string) {
  return document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
}
function hidden(node: HTMLElement) {
  return !!node.closest('[aria-hidden]:not([aria-hidden="false"]),[inert]');
}
async function setup(reference: boolean, scenario = 'ordinary') {
  const target = document.createElement('section');
  document.body.append(target);
  if (reference) cleanup.push(mountModalIsolationReference(target, scenario));
  else {
    const component = mount(Fixture, { target, props: { scenario } });
    cleanup.push(() => unmount(component));
  }
  await settle();
  await command('open');
}
function restored() {
  expect(element('owned-hidden').getAttribute('aria-hidden')).toBe('true');
  expect(element('owned-inert').getAttribute('inert')).toBe('');
  expect(element('owned-empty').getAttribute('aria-hidden')).toBe('');
  expect(element('owned-false').getAttribute('aria-hidden')).toBeNull();
  expect(element('outside-wrapper').querySelector('button')!.hasAttribute('aria-hidden')).toBe(
    false,
  );
  expect(document.querySelectorAll('[data-base-ui-inert]')).toHaveLength(0);
  expect(hidden(element('live'))).toBe(false);
  expect(hidden(element('outside-wrapper').querySelector('button')!)).toBe(false);
}
afterEach(async () => {
  for (const stop of cleanup.splice(0)) await stop();
  expect(document.querySelectorAll('[data-base-ui-inert],[aria-hidden]')).toHaveLength(0);
  document.body.replaceChildren();
});
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  it(`${framework}: outside accessibility isolation preserves live regions and owned attributes`, async () => {
    await setup(reference);
    expect(hidden(element('outside-wrapper').querySelector('button')!)).toBe(true);
    expect(hidden(element('first'))).toBe(false);
    expect(hidden(element('live'))).toBe(false);
    expect(hidden(element('live-wrapper').querySelector('button')!)).toBe(true);
    expect(element('owned-hidden').getAttribute('aria-hidden')).toBe('true');
    expect(element('owned-inert').getAttribute('inert')).toBe('');
    expect(element('owned-false').getAttribute('aria-hidden')).toBe('true');
    expect(element('owned-empty').getAttribute('aria-hidden')).toBe('');
    expect(element('outside-wrapper').querySelector('button')!.hasAttribute('inert')).toBe(false);
    expect(!!element('outside-wrapper').closest('[data-base-ui-inert]')).toBe(true);
    await command('close');
    restored();
  });
  it(`${framework}: mode changes release only aria isolation and preserve open/focus`, async () => {
    await setup(reference);
    element('first').focus();
    for (const mode of ['false', 'trap-focus', 'true', 'false']) {
      await command(mode);
      expect(hidden(element('outside-wrapper').querySelector('button')!)).toBe(mode !== 'false');
      expect(hidden(element('live'))).toBe(false);
      expect(!!element('outside-wrapper').closest('[data-base-ui-inert]')).toBe(true);
      expect(element('first').hasAttribute('data-open')).toBe(true);
      expect(document.activeElement).toBe(element('first'));
    }
    await command('close');
    restored();
  });
  for (const removal of ['remove', 'remove-popup'])
    it(`${framework}: ${removal} while open releases DOM ownership`, async () => {
      await setup(reference);
      await command(removal);
      expect(document.querySelector('[data-testid=first]')).toBeNull();
      restored();
      expect(document.documentElement.style.overflow).toBe('');
    });
  for (const scenario of ['ordinary', 'nested-body', 'sibling']) {
    for (const order of ['child-first', 'parent-first'])
      it(`${framework}: ${scenario} overlapping ownership ${order}`, async () => {
        await setup(reference, scenario);
        await command('second');
        const removedPortal = element('first').closest('[data-base-ui-portal]')!;
        expect(hidden(element('outside-wrapper').querySelector('button')!)).toBe(true);
        expect(hidden(element('first'))).toBe(true);
        expect(hidden(element('second'))).toBe(false);
        expect(hidden(element('live'))).toBe(false);
        if (order === 'child-first') {
          await command('close-second');
          expect(hidden(element('first'))).toBe(false);
          expect(hidden(element('outside-wrapper').querySelector('button')!)).toBe(true);
          await command('close');
        } else {
          await command('remove');
          if (scenario === 'sibling') {
            expect(hidden(element('second'))).toBe(false);
            expect(hidden(element('outside-wrapper').querySelector('button')!)).toBe(true);
            await command('close-second');
          }
        }
        restored();
        if (order === 'parent-first') {
          expect(removedPortal.matches('[data-base-ui-inert],[aria-hidden]')).toBe(false);
          expect(removedPortal.querySelectorAll('[data-base-ui-inert],[aria-hidden]')).toHaveLength(
            0,
          );
        }
      });
  }
}

it('document ownership stays independent across a native iframe and releases detached nodes', () => {
  const iframe = document.createElement('iframe');
  document.body.append(iframe);
  const other = iframe.contentDocument!;
  const outside = document.createElement('button');
  const popup = document.createElement('div');
  document.body.append(outside, popup);
  const otherOutside = other.createElement('button');
  const otherPopup = other.createElement('div');
  other.body.append(otherOutside, otherPopup);
  const first = markOthers([popup], { ariaHidden: true });
  const second = markOthers([otherPopup], { ariaHidden: true });
  cleanup.push(first, second);
  expect(outside.getAttribute('aria-hidden')).toBe('true');
  expect(otherOutside.getAttribute('aria-hidden')).toBe('true');
  first();
  expect(outside.hasAttribute('aria-hidden')).toBe(false);
  expect(otherOutside.getAttribute('aria-hidden')).toBe('true');
  otherOutside.remove();
  second();
  expect(otherOutside.hasAttribute('aria-hidden')).toBe(false);
  expect(otherOutside.hasAttribute('data-base-ui-inert')).toBe(false);
});
