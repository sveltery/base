// Complete ordinary Popover Backdrop/Title/Description/Close assertion bodies adapted from Original v1.8.0.
// MIT: parity/popup-family/UPSTREAM_LICENSE; pin47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// Conformance helper calls are inventoried separately and are not credited by these cases.
import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount, type ComponentProps } from 'svelte';
import Fixture from './PopoverLeafSourceFixture.svelte';
const cleanup: (() => Promise<void>)[] = [];
async function settle() {
  await tick();
  await new Promise((resolve) => setTimeout(resolve, 70));
  await tick();
}
async function render(props: ComponentProps<typeof Fixture> = {}) {
  const target = document.createElement('main');
  document.body.append(target);
  const instance = mount(Fixture, { target, props });
  cleanup.push(() => unmount(instance));
  await settle();
  return instance;
}
const close = () => document.querySelector<HTMLElement>('[data-testid=close]')!;
const content = () =>
  [...document.querySelectorAll('div')].find(
    (node) =>
      [...node.childNodes]
        .filter((child) => child.nodeType === Node.TEXT_NODE)
        .map((child) => child.textContent)
        .join('')
        .trim() === 'Content',
  );
afterEach(async () => {
  for (const stop of cleanup.splice(0)) await stop();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});
it('PopoverBackdrop:16 sets `pointer-events: none` style on backdrop if opened by hover', async () => {
  await render({ kind: 'backdrop', delay: 0 });
  const trigger = document.getElementById('trigger-1')!;
  trigger.dispatchEvent(new MouseEvent('mouseenter'));
  trigger.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
  await settle();
  expect(document.querySelector<HTMLElement>('[data-testid=backdrop]')!.style.pointerEvents).toBe(
    'none',
  );
});
it('PopoverBackdrop:36 does not set `pointer-events: none` style on backdrop if opened by click', async () => {
  await render({ kind: 'backdrop' });
  document.getElementById('trigger-1')!.click();
  await settle();
  expect(
    document.querySelector<HTMLElement>('[data-testid=backdrop]')!.style.pointerEvents,
  ).not.toBe('none');
});
it('PopoverTitle:25 labels the popup element with its id', async () => {
  await render({ kind: 'title' });
  const id = document.querySelector('h2')?.id;
  expect(document.querySelector('[role=dialog]')!.getAttribute('aria-labelledby')).toBe(id);
});
it('PopoverDescription:25 describes the popup element with its id', async () => {
  await render({ kind: 'description' });
  const id = document.querySelector('p')?.id;
  expect(document.querySelector('[role=dialog]')!.getAttribute('aria-describedby')).toBe(id);
});
it('PopoverClose:46 renders when popover is closed', async () => {
  await render({ kind: 'closed-close' });
  expect(document.querySelector('button[aria-label="Close popover"]')).not.toBeNull();
});
it('PopoverClose:56 should close popover when clicked', async () => {
  await render();
  expect(content()).not.toBeUndefined();
  close().click();
  await settle();
  expect(content()).toBeUndefined();
});
it('PopoverClose:78 keeps the trigger when closing with a tooltip trigger close button', async () => {
  const handleOpenChange = vi.fn();
  await render({ kind: 'tooltip-close', onOpenChange: handleOpenChange });
  expect(content()).not.toBeUndefined();
  close().click();
  await settle();
  expect(content()).toBeUndefined();
  expect(handleOpenChange.mock.calls[0][0]).toBe(false);
  expect(handleOpenChange.mock.calls[0][1].reason).toBe('close-press');
  expect(handleOpenChange.mock.calls[0][1].trigger?.id).toBe('trigger-1');
});
it('PopoverClose:120 falls back to the active trigger element when the active trigger id is unregistered', async () => {
  const handleOpenChange = vi.fn();
  const app = await render({ kind: 'unregistered', onOpenChange: handleOpenChange });
  app.repoint();
  await settle();
  close().click();
  await settle();
  expect(handleOpenChange).toHaveBeenCalledTimes(1);
  expect(handleOpenChange.mock.calls[0][1].reason).toBe('close-press');
  expect(handleOpenChange.mock.calls[0][1].trigger).toBe(document.getElementById('trigger-1'));
});
it('PopoverClose:160 reports no trigger when the active trigger id has no mounted trigger', async () => {
  const handleOpenChange = vi.fn();
  await render({ kind: 'no-trigger', onOpenChange: handleOpenChange });
  close().click();
  await settle();
  expect(content()).toBeUndefined();
  expect(handleOpenChange).toHaveBeenCalledTimes(1);
  expect(handleOpenChange.mock.calls[0][1].reason).toBe('close-press');
  expect(handleOpenChange.mock.calls[0][1].trigger).toBe(undefined);
});
function isElementOrAncestorInert(element: HTMLElement) {
  let current: HTMLElement | null = element;
  while (current) {
    if (
      current.getAttribute('aria-hidden') === 'true' ||
      current.hasAttribute('inert') ||
      current.hasAttribute('data-base-ui-inert')
    )
      return true;
    current = current.parentElement;
  }
  return false;
}
for (const modal of [true, 'trap-focus'] as const)
  it(`PopoverClose:${modal === true ? 184 : 206} enables modal focus management when modal=${modal} and close is rendered`, async () => {
    await render({ kind: 'modal-close', modal });
    expect(
      isElementOrAncestorInert(document.querySelector<HTMLElement>('[data-testid=outside]')!),
    ).toBe(true);
  });
