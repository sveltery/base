import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/FocusOwnershipFixture.svelte';
import { mountFocusOwnershipReference } from '../../../../apps/fixtures/src/lib/focus-ownership-reference.js';
import { tabbable as tabbables } from '../../src/lib/floating-ui/utils/tabbable.js';
// Supplemental actual-component diagnostics. Hosted Chromium supplies trusted browser evidence.
interface Commands extends HTMLElement {
  removeDialogPart(): void;
  closeDialog(): void;
  closeAndRemove(): void;
}
const cleanup: (() => void | Promise<void>)[] = [];
async function settle() {
  await tick();
  await new Promise((resolve) => setTimeout(resolve, 60));
  await tick();
}
async function setup(scenario: string, reference: boolean) {
  const target = document.createElement('section');
  document.body.append(target);
  if (reference) cleanup.push(mountFocusOwnershipReference(target, scenario));
  else {
    const component = mount(Fixture, { target, props: { scenario } });
    cleanup.push(() => unmount(component));
  }
  await settle();
  const trigger = document.getElementById('focus-a')!;
  trigger.focus();
  trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  await settle();
  return document.querySelector('main') as Commands;
}
function popup() {
  return document.querySelector<HTMLElement>('[role=dialog]');
}
function requests() {
  return JSON.parse(document.querySelector('[data-testid=requests]')!.textContent!) as {
    open: boolean;
    reason: string;
    trigger: string | null;
  }[];
}
function returns() {
  return Number(document.querySelector('[data-testid=returns]')!.textContent);
}
afterEach(async () => {
  for (const stop of cleanup.splice(0)) await stop();
  document.body.replaceChildren();
});
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  it(`${framework}: every contained Trigger is an inside focus and mouse target`, async () => {
    await setup('triggers', reference);
    popup()!.focus();
    document.getElementById('focus-b')!.focus();
    await settle();
    expect(popup()).not.toBeNull();
    expect(requests()).toEqual([{ open: true, reason: 'trigger-press', trigger: 'focus-a' }]);
    const child = document.querySelector('#focus-b span')!;
    child.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
    child.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }));
    child.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0, detail: 1 }));
    await settle();
    expect(requests()).toEqual([
      { open: true, reason: 'trigger-press', trigger: 'focus-a' },
      { open: true, reason: 'trigger-press', trigger: 'focus-b' },
    ]);
    expect(popup()).not.toBeNull();
  });
  for (const scenario of ['detach', 'popup-detach', 'close-and-detach'])
    it(`${framework}: ${scenario} restores final focus once`, async () => {
      const host = await setup(scenario, reference);
      popup()!.focus();
      if (scenario === 'close-and-detach') host.closeAndRemove();
      else host.removeDialogPart();
      await settle();
      expect(popup()).toBeNull();
      expect(returns()).toBe(1);
      expect(document.activeElement).toBe(document.getElementById('focus-a'));
      expect(document.documentElement.style.overflow).toBe('');
    });
  it(`${framework}: ordinary close followed by teardown never repeats final focus`, async () => {
    const host = await setup('close', reference);
    popup()!.focus();
    host.closeDialog();
    await settle();
    expect(popup()).toBeNull();
    expect(returns()).toBe(1);
    expect(document.activeElement).toBe(document.getElementById('focus-a'));
    host.removeDialogPart();
    await settle();
    expect(returns()).toBe(1);
  });
  for (const scenario of ['final-false', 'final-none'])
    it(`${framework}: removal honors ${scenario}`, async () => {
      const host = await setup(scenario, reference);
      popup()!.focus();
      host.removeDialogPart();
      await settle();
      expect(returns()).toBe(1);
      expect(document.activeElement).toBe(document.body);
    });
  it(`${framework}: default return restores focus after open Portal removal`, async () => {
    const host = await setup('default-detach', reference);
    popup()!.focus();
    host.removeDialogPart();
    await settle();
    expect(popup()).toBeNull();
    expect(document.activeElement).toBe(document.getElementById('focus-a'));
    expect(returns()).toBe(0);
  });
  for (const scenario of ['external-focus', 'boolean-external-focus', 'explicit-external-focus'])
    it(`${framework}: ${scenario} respects the final-focus ownership policy`, async () => {
      const host = await setup(scenario, reference);
      popup()!.focus();
      const outside = document.getElementById('outside')!;
      outside.focus();
      await settle();
      expect(popup()).not.toBeNull();
      expect(requests()).toHaveLength(1);
      host.removeDialogPart();
      await settle();
      expect(popup()).toBeNull();
      expect(document.activeElement).toBe(
        scenario === 'explicit-external-focus' ? document.getElementById('focus-a') : outside,
      );
      expect(returns()).toBe(scenario === 'explicit-external-focus' ? 1 : 0);
    });
}
it('Svelte: checked radio is the sole group stop and forward Tab is contained', async () => {
  const prior = HTMLElement.prototype.getClientRects;
  HTMLElement.prototype.getClientRects = function () {
    return [{ width: 20, height: 20 }] as unknown as DOMRectList;
  };
  try {
    await setup('radio', false);
    const first = document.getElementById('radio-first')!;
    first.focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    first.dispatchEvent(event);
    // With tabbable content, source guards own wrapping after the browser's native Tab default.
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(first);
    expect(tabbables(popup()!)).toEqual([first]);
    (document.getElementById('radio-second') as HTMLInputElement).checked = true;
    expect(tabbables(popup()!)).toEqual([document.getElementById('radio-second')]);
  } finally {
    HTMLElement.prototype.getClientRects = prior;
  }
});
it('radio discovery separates forms and unnamed radios and chooses first only when unchecked', () => {
  const host = document.createElement('div');
  document.body.append(host);
  host.innerHTML =
    '<form><input id="a" type="radio" name="group"><input id="b" type="radio" name="group"></form><form><input id="c" type="radio" name="group" checked><input id="d" type="radio" name="group"></form><input id="e" type="radio"><input id="f" type="radio">';
  for (const input of host.querySelectorAll('input'))
    input.getClientRects = () => [{ width: 20, height: 20 }] as unknown as DOMRectList;
  expect(tabbables(host).map((input) => input.id)).toEqual(['a', 'c', 'e', 'f']);
  host.querySelector<HTMLInputElement>('#b')!.checked = true;
  expect(tabbables(host).map((input) => input.id)).toEqual(['b', 'c', 'e', 'f']);
  host.querySelector<HTMLInputElement>('#b')!.tabIndex = -1;
  expect(tabbables(host).map((input) => input.id)).toEqual(['c', 'e', 'f']);
  host.querySelector<HTMLInputElement>('#b')!.checked = false;
  host.querySelector<HTMLInputElement>('#a')!.tabIndex = -1;
  expect(tabbables(host).map((input) => input.id)).toEqual(['c', 'e', 'f']);
});
