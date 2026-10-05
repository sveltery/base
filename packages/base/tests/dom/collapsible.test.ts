// Ordinary assertion ports from Base UI v1.8.0; see parity/collapsible/upstream-inventory.json.
// MIT attribution: parity/collapsible/UPSTREAM_LICENSE. Supplemental checks earn no ordinary declaration credit.
import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import * as Collapsible from '../../src/lib/collapsible/index.js';
import Fixture from './collapsible/Fixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
async function setup(scenario: string) {
  const target = document.createElement('section');
  document.body.append(target);
  const component = mount(Fixture, { target, props: { scenario } });
  mounted.push(component);
  await tick();
  return {
    component,
    trigger: document.getElementById('tested-trigger')! as HTMLButtonElement,
    root: document.getElementById('tested-root')!,
  };
}
function panel() {
  return document.querySelector('[data-testid=panel]') as HTMLElement | null;
}
async function frame() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await tick();
}
async function settle() {
  await tick();
  await frame();
  await frame();
}
afterEach(async () => {
  for (const component of mounted.splice(0)) await unmount(component);
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it('R:19 sets ARIA attributes', async () => {
  const { trigger } = await setup('aria');
  expect(trigger.hasAttribute('aria-expanded')).toBe(true);
  expect(trigger.hasAttribute('aria-controls')).toBe(true);
  expect(trigger.getAttribute('aria-controls')).toBe(panel()!.getAttribute('id'));
});
it('R:35 references manual panel id in trigger aria-controls', async () => {
  const { trigger } = await setup('manual-id');
  expect(trigger.getAttribute('aria-controls')).toBe('custom-panel-id');
  expect(panel()!.id).toBe('custom-panel-id');
});
it('R:50 unregisters and restores the generated panel id when the panel remounts', async () => {
  const { trigger, component } = await setup('remount-id');
  component.setPanelMounted(false);
  await tick();
  expect(trigger.hasAttribute('aria-controls')).toBe(false);
  component.setPanelMounted(true);
  await tick();
  expect(trigger.getAttribute('aria-controls')).toBe(panel()!.id);
});
it('R:74 disabled status', async () => {
  const { trigger } = await setup('disabled');
  expect(trigger.hasAttribute('data-disabled')).toBe(true);
});
it('R:87 does not toggle or call onOpenChange when clicked while disabled', async () => {
  const { trigger, component } = await setup('disabled');
  trigger.click();
  await tick();
  expect(component.snapshot().events).toHaveLength(0);
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(panel()).toBe(null);
});
it('R:108 calls onOpenChange with eventDetails', async () => {
  const { trigger, component } = await setup('default');
  trigger.click();
  await tick();
  const events = component.snapshot().events;
  expect(events).toHaveLength(1);
  const { open, details } = events[0];
  expect(open).toBe(true);
  expect(details).not.toBe(undefined);
  expect(details.reason).toBe('trigger-press');
  expect(details.event).toBeInstanceOf(MouseEvent);
  expect(details.isCanceled).toBe(false);
  expect(typeof details.cancel).toBe('function');
  expect(typeof details.allowPropagation).toBe('function');
});
it('R:132 eventDetails.cancel() prevents opening while uncontrolled', async () => {
  const { trigger, component } = await setup('cancel-open');
  trigger.click();
  await tick();
  expect(component.snapshot().events).toHaveLength(1);
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(panel()).toBe(null);
});
it('R:154 eventDetails.cancel() prevents closing while uncontrolled', async () => {
  const { trigger, component } = await setup('cancel-close');
  trigger.click();
  await tick();
  expect(component.snapshot().events).toHaveLength(1);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(panel()).not.toBe(null);
});
it('R:300 passes state to className and style callbacks', async () => {
  const { trigger, root } = await setup('callbacks');
  const content = panel()!;
  expect(root.classList.contains('root-closed')).toBe(true);
  expect(root.style.opacity).toBe('0.5');
  expect(trigger.classList.contains('trigger-closed')).toBe(true);
  expect(trigger.style.opacity).toBe('0.5');
  expect(content.classList.contains('panel-closed')).toBe(true);
  expect(content.style.opacity).toBe('0.5');
  trigger.click();
  await tick();
  expect(root.classList.contains('root-open')).toBe(true);
  expect(root.style.opacity).toBe('1');
  expect(trigger.classList.contains('trigger-open')).toBe(true);
  expect(trigger.style.opacity).toBe('1');
  expect(content.classList.contains('panel-open')).toBe(true);
  expect(content.style.opacity).toBe('1');
});
it('T:9 throws when rendered outside a Collapsible.Root', () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const target = document.createElement('section');
  document.body.append(target);
  try {
    expect(() => mount(Collapsible.Trigger, { target })).toThrow(
      'Base UI: CollapsibleRootContext is missing. Collapsible parts must be placed within <Collapsible.Root>.',
    );
  } finally {
    errorSpy.mockRestore();
  }
});
it('T:32 forwards the id prop', async () => {
  const { trigger } = await setup('default');
  expect(trigger.getAttribute('id')).toBe('tested-trigger');
});
it('P:55 warns when hiddenUntilFound overrides keepMounted={false}', async () => {
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  await setup('warning');
  expect(warnSpy).toHaveBeenCalledWith(
    'Base UI: The `keepMounted={false}` prop on `Collapsible.Panel` is ignored when `hiddenUntilFound` is enabled, since the panel must remain mounted while closed.',
  );
  expect(panel()!.getAttribute('hidden')).toBe('until-found');
});
it('P:77 does not unmount the panel when true', async () => {
  const { trigger } = await setup('keep');
  const content = panel()!;
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(panel()).not.toBe(null);
  expect(content.hidden).toBe(true);
  expect(content.hasAttribute('data-closed')).toBe(true);
  trigger.click();
  await settle();
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(trigger.getAttribute('aria-controls')).toBe(content.getAttribute('id'));
  expect(content.hidden).toBe(false);
  expect(content.hasAttribute('data-open')).toBe(true);
  expect(trigger.hasAttribute('data-panel-open')).toBe(true);
  trigger.click();
  await settle();
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(trigger.getAttribute('aria-controls')).toBe(null);
  expect(content.hidden).toBe(true);
  expect(content.hasAttribute('data-closed')).toBe(true);
});
it('P:164 unmounts a panel that mounts after the close has already entered the ending phase', async () => {
  const { trigger, component } = await setup('late-panel');
  trigger.click();
  await settle();
  expect(component.snapshot().statuses).toContain('ending');
  expect(panel()).toBe(null);
});
it('supplement: explicit panel ID changes, removal and remount update controls', async () => {
  const { trigger, component } = await setup('explicit-id');
  component.setPanelId('changed-panel-id');
  await tick();
  expect(panel()!.id).toBe('changed-panel-id');
  expect(trigger.getAttribute('aria-controls')).toBe('changed-panel-id');
  component.setPanelMounted(false);
  await tick();
  expect(trigger.hasAttribute('aria-controls')).toBe(false);
  component.setPanelMounted(true);
  await tick();
  expect(trigger.getAttribute('aria-controls')).toBe(panel()!.id);
  component.setPanelId(undefined);
  await tick();
  expect(panel()!.id).not.toBe('changed-panel-id');
  expect(trigger.getAttribute('aria-controls')).toBe(panel()!.id);
});
it('supplement: Trigger explicit disabled=false overrides the Root disabled prop', async () => {
  const { trigger, component } = await setup('disabled-override');
  expect(trigger.disabled).toBe(false);
  expect(trigger.getAttribute('aria-disabled')).toBe('false');
  trigger.click();
  await settle();
  expect(component.snapshot().events).toHaveLength(1);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
});
it('supplement: disabled Trigger remains focusable and suppresses activation', async () => {
  const { trigger, component } = await setup('disabled');
  expect(trigger.disabled).toBe(false);
  expect(trigger.getAttribute('aria-disabled')).toBe('true');
  trigger.focus();
  expect(document.activeElement).toBe(trigger);
  trigger.click();
  await tick();
  expect(component.snapshot().events).toHaveLength(0);
});
it('supplement: controlled requests observe rendered state and await owner acceptance', async () => {
  const { trigger, component } = await setup('controlled');
  trigger.click();
  await tick();
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(
    component.snapshot().events.map((event) => ({ open: event.open, before: event.before })),
  ).toEqual([{ open: true, before: 'false' }]);
  component.setOwnerOpen(true);
  await settle();
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
});
it('supplement: fixed control mode and changed default preserve development warnings', async () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const { component, trigger } = await setup('default');
  component.setDefaultOpen(true);
  await tick();
  expect(errorSpy).toHaveBeenCalledWith(
    'Base UI: A component is changing the default open state of an uncontrolled Collapsible after being initialized. To suppress this warning opt to use a controlled Collapsible.',
  );
  component.setOwnerOpen(true);
  await tick();
  expect(errorSpy).toHaveBeenCalledWith(
    "Base UI: A component is changing the uncontrolled open state of Collapsible to be controlled.\nElements should not switch from uncontrolled to controlled (or vice versa).\nDecide between using a controlled or uncontrolled Collapsible element for the lifetime of the component.\nThe nature of the state is determined during the first render. It's considered controlled if the value is not `undefined`.\nMore info: https://fb.me/react-controlled-components",
  );
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
});
it('supplement: initial uncontrolled mode and default remain fixed', async () => {
  const { trigger, component } = await setup('default');
  component.setDefaultOpen(true);
  component.setOwnerOpen(true);
  await tick();
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  trigger.click();
  await settle();
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
});
it('supplement: controlled undefined fallback preserves the initial default', async () => {
  const { trigger, component } = await setup('controlled');
  component.setDefaultOpen(true);
  component.setOwnerOpen(undefined);
  await tick();
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  trigger.click();
  await settle();
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
});
it('supplement: initially controlled false with a true default falls back when its value disappears', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const { trigger, component } = await setup('controlled-default');
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  component.setOwnerOpen(undefined);
  await settle();
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(panel()).not.toBe(null);
  trigger.click();
  await settle();
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(
    component.snapshot().events.map((event) => ({ open: event.open, before: event.before })),
  ).toEqual([{ open: false, before: 'true' }]);
});
it('supplement: missing animation API completes opening and closing', async () => {
  const { trigger } = await setup('default');
  trigger.click();
  await settle();
  expect(panel()).not.toBe(null);
  expect(panel()!.hasAttribute('data-starting-style')).toBe(false);
  trigger.click();
  await settle();
  expect(panel()).toBe(null);
});
it('supplement: same-turn uncontrolled clicks use the last rendered open snapshot', async () => {
  const { trigger, component } = await setup('default');
  trigger.click();
  trigger.click();
  await settle();
  expect(component.snapshot().events.map((event) => event.open)).toEqual([true, true]);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  trigger.click();
  await settle();
  expect(component.snapshot().events.map((event) => event.open)).toEqual([true, true, false]);
});
it('supplement: earlier consumer controlled write retains rendered change request', async () => {
  const { trigger, component } = await setup('controlled-consumer');
  trigger.click();
  await settle();
  expect(component.snapshot().events.map((event) => event.open)).toEqual([true]);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
});
it('supplement: rendered callback identity refreshes after the consumer callback prop write commits', async () => {
  const { trigger, component } = await setup('callback-snapshot');
  trigger.click();
  await settle();
  expect(component.snapshot().callbackOwners).toEqual(['old']);
  trigger.click();
  await settle();
  expect(component.snapshot().callbackOwners).toEqual(['old', 'new']);
});
it('supplement: Trigger render state remains Root disabled state when explicit false enables activation', async () => {
  const { trigger, component, root } = await setup('disabled-override');
  expect(root.hasAttribute('data-disabled')).toBe(true);
  expect(trigger.hasAttribute('data-disabled')).toBe(true);
  trigger.click();
  await settle();
  expect(component.snapshot().events).toHaveLength(1);
  expect(panel()!.hasAttribute('data-disabled')).toBe(true);
});
it('supplement: BASE_UI_ANIMATIONS_DISABLED bypasses available unfinished animation APIs', async () => {
  vi.stubGlobal('BASE_UI_ANIMATIONS_DISABLED', true);
  const { trigger } = await setup('motion-mock');
  trigger.click();
  await tick();
  const content = panel()!;
  const getAnimations = vi.fn(() => [
    { finished: new Promise<void>(() => {}), playState: 'running', pending: false },
  ]);
  Object.defineProperty(content, 'getAnimations', { configurable: true, value: getAnimations });
  await settle();
  trigger.click();
  await settle();
  expect(panel()).toBe(null);
  expect(getAnimations).not.toHaveBeenCalled();
});
it('supplement: reopening aborts the earlier close completion', async () => {
  const { trigger } = await setup('motion-mock');
  trigger.click();
  await settle();
  const content = panel()!;
  Object.defineProperty(content, 'scrollHeight', { configurable: true, value: 100 });
  Object.defineProperty(content, 'scrollWidth', { configurable: true, value: 100 });
  let finish!: () => void;
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  Object.defineProperty(content, 'getAnimations', {
    configurable: true,
    value: () => [{ finished, playState: 'running', pending: false }],
  });
  trigger.click();
  await settle();
  expect(content.hasAttribute('data-ending-style')).toBe(true);
  trigger.click();
  await settle();
  finish();
  await tick();
  await settle();
  expect(panel()).toBe(content);
  expect(content.hasAttribute('data-open')).toBe(true);
});
it('supplement: teardown aborts a pending close completion and attachment work', async () => {
  const { trigger, component } = await setup('motion-mock');
  trigger.click();
  await settle();
  const content = panel()!;
  Object.defineProperty(content, 'scrollHeight', { configurable: true, value: 100 });
  Object.defineProperty(content, 'scrollWidth', { configurable: true, value: 100 });
  let finish!: () => void;
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  Object.defineProperty(content, 'getAnimations', {
    configurable: true,
    value: () => [{ finished, playState: 'running', pending: false }],
  });
  trigger.click();
  await settle();
  component.setPanelMounted(false);
  await tick();
  finish();
  await settle();
  expect(panel()).toBe(null);
  expect(trigger.hasAttribute('aria-controls')).toBe(false);
  component.setOwnerOpen(undefined);
  trigger.click();
  await settle();
  component.setPanelMounted(true);
  await settle();
  expect(panel()).not.toBe(content);
});
it('supplement: measured variable writes preserve temporary inline alignment until its restore frame', async () => {
  const { trigger } = await setup('motion-layout');
  const content = panel()!;
  Object.defineProperty(content, 'getAnimations', {
    configurable: true,
    value: () => [{ finished: new Promise<void>(() => {}), playState: 'running', pending: false }],
  });
  trigger.click();
  await tick();
  expect(content.style.justifyContent).toBe('initial');
  expect(content.style.getPropertyPriority('justify-content')).toBe('important');
  await settle();
  expect(content.style.justifyContent).toBe('center');
  expect(content.style.getPropertyPriority('justify-content')).toBe('');
});
it('supplement: beforematch duration suppression survives rendered styles until close', async () => {
  const { trigger } = await setup('beforematch');
  const content = panel()!;
  content.dispatchEvent(new Event('beforematch', { bubbles: true }));
  await settle();
  expect(content.hasAttribute('data-open')).toBe(true);
  expect(content.style.transitionDuration).toBe('0s');
  trigger.click();
  await settle();
  expect(content.style.transitionDuration).toBe('123ms');
  expect(content.getAttribute('hidden')).toBe('until-found');
  trigger.click();
  await settle();
  expect(content.style.transitionDuration).toBe('123ms');
  expect(content.hasAttribute('data-open')).toBe(true);
});
it('supplement: canceled beforematch leaves the following trigger open animated', async () => {
  const { trigger, component } = await setup('beforematch-cancel');
  const content = panel()!;
  content.dispatchEvent(new Event('beforematch', { bubbles: true }));
  await tick();
  expect(component.snapshot().events).toHaveLength(1);
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(content.hasAttribute('data-closed')).toBe(true);
  trigger.click();
  await settle();
  expect(component.snapshot().events).toHaveLength(2);
  expect(content.hasAttribute('data-open')).toBe(true);
  expect(content.style.transitionDuration).toBe('123ms');
});
