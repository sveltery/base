// Selected complete Original useClick.test.tsx option protocols plus native lifetime guards.
// Base UI v1.8.0, immutable47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c, MIT.
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import type { ComponentProps } from 'svelte';
import Fixture from './UseClickFixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
async function setup(props: ComponentProps<typeof Fixture> = {}) {
  const target = document.createElement('section');
  document.body.append(target);
  const component = mount(Fixture, { target, props });
  mounted.push(component);
  await tick();
  return component;
}
const reference = () => document.querySelector('[data-testid="reference"]') as HTMLElement;
const tooltip = () => document.querySelector('[role="tooltip"]');
function mouse(type: string, options: MouseEventInit = {}) {
  return new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, ...options });
}
function pointer(type: string, pointerType: string) {
  const event = mouse(type);
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  return event;
}
async function click() {
  reference().dispatchEvent(mouse('click'));
  await tick();
}
async function pressMouse(pointerType = 'mouse') {
  const node = reference();
  node.dispatchEvent(pointer('pointerdown', pointerType));
  node.dispatchEvent(mouse('mousedown'));
  node.dispatchEvent(mouse('click'));
  await tick();
}
beforeEach(() => {
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callback(0);
    return 0;
  });
});
afterEach(async () => {
  for (const component of mounted.splice(0)) await unmount(component);
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
it('Source:92 opens and closes on repeated clicks', async () => {
  await setup();
  expect(tooltip()).toBeNull();
  await click();
  expect(tooltip()).not.toBeNull();
  await click();
  expect(tooltip()).toBeNull();
});
it('Source:106 keeps open when toggle is false', async () => {
  await setup({ options: { toggle: false } });
  await click();
  await click();
  expect(tooltip()).not.toBeNull();
});
it('Source:117 opens from mousedown', async () => {
  await setup({ options: { event: 'mousedown' } });
  await pressMouse();
  expect(tooltip()).not.toBeNull();
});
it('Source:127 closes from mousedown', async () => {
  await setup({ options: { event: 'mousedown' }, initialOpen: true });
  await pressMouse();
  expect(tooltip()).toBeNull();
});
it('Source:137 mousedown-only ignores click', async () => {
  await setup({ options: { event: 'mousedown-only' } });
  await pressMouse();
  expect(tooltip()).not.toBeNull();
  await click();
  expect(tooltip()).not.toBeNull();
});
it('Source:149 ignores mouse input', async () => {
  await setup({ options: { ignoreMouse: true } });
  reference().dispatchEvent(pointer('pointerdown', 'mouse'));
  await click();
  expect(tooltip()).toBeNull();
});
it('Source:160 delays touch opening', async () => {
  vi.useFakeTimers();
  await setup({ options: { touchOpenDelay: 100 } });
  reference().dispatchEvent(pointer('pointerdown', 'touch'));
  await click();
  expect(tooltip()).toBeNull();
  vi.advanceTimersByTime(100);
  await tick();
  expect(tooltip()).not.toBeNull();
});
it('Source:179 delays touch opening after deferred mousedown', async () => {
  vi.useFakeTimers();
  const callbacks: FrameRequestCallback[] = [];
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callbacks.push(callback);
    return callbacks.length;
  });
  await setup({ options: { event: 'mousedown', touchOpenDelay: 100 } });
  await pressMouse('touch');
  expect(tooltip()).toBeNull();
  callbacks.forEach((callback) => callback(0));
  await tick();
  expect(tooltip()).toBeNull();
  vi.advanceTimersByTime(100);
  await tick();
  expect(tooltip()).not.toBeNull();
});
it('Source:213 does not delay touch closing', async () => {
  vi.useFakeTimers();
  await setup({ initialOpen: true, options: { touchOpenDelay: 100 } });
  reference().dispatchEvent(pointer('pointerdown', 'touch'));
  await click();
  expect(tooltip()).toBeNull();
});
it('Source:226 uses the configured reason', async () => {
  const component = await setup({ options: { reason: 'input-press' }, typeable: true });
  await click();
  expect(component.snapshot()[0]).toMatchObject({ open: true, reason: 'input-press' });
});
for (const stickIfOpen of [true, false])
  it(`real RootStore hover request follows Source stickIfOpen=${stickIfOpen} branch`, async () => {
    const component = await setup({ options: { stickIfOpen } });
    component.requestHoverOpen(mouse('mouseenter'));
    await tick();
    expect(tooltip()).not.toBeNull();
    await click();
    expect(Boolean(tooltip())).toBe(stickIfOpen);
  });
it('native: enabled and selected options update the next attached callback', async () => {
  const component = await setup({ options: { enabled: false } });
  await click();
  expect(tooltip()).toBeNull();
  component.setOptions({ enabled: true, toggle: false, reason: 'input-press' });
  await tick();
  await click();
  await click();
  expect(tooltip()).not.toBeNull();
  expect(component.snapshot().map((change) => change.reason)).toEqual([
    'input-press',
    'input-press',
  ]);
});
it('native: keyboard entry clears remembered mouse input', async () => {
  await setup({ options: { ignoreMouse: true } });
  reference().dispatchEvent(pointer('pointerdown', 'mouse'));
  await click();
  expect(tooltip()).toBeNull();
  reference().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
  await click();
  expect(tooltip()).not.toBeNull();
});
it('native: cancellation stays owner-controlled', async () => {
  const component = await setup({ cancel: true });
  await click();
  expect(tooltip()).toBeNull();
  expect(component.snapshot()).toHaveLength(1);
});
it('native: unmount cancels delayed touch opening', async () => {
  vi.useFakeTimers();
  const component = await setup({ options: { touchOpenDelay: 100 } });
  reference().dispatchEvent(pointer('pointerdown', 'touch'));
  await click();
  await unmount(component);
  mounted.splice(mounted.indexOf(component), 1);
  vi.advanceTimersByTime(100);
  expect(component.snapshot()).toEqual([]);
});
it('native: unmount cancels owned mousedown frame', async () => {
  vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(37);
  const canceled = vi.spyOn(window, 'cancelAnimationFrame');
  const component = await setup({ options: { event: 'mousedown' } });
  await pressMouse();
  await unmount(component);
  mounted.splice(mounted.indexOf(component), 1);
  expect(canceled).toHaveBeenCalledWith(37);
  expect(component.snapshot()).toEqual([]);
});
it('native: selected reason/delay stay with the scheduled callback', async () => {
  vi.useFakeTimers();
  const component = await setup({ options: { touchOpenDelay: 100, reason: 'input-press' } });
  reference().dispatchEvent(pointer('pointerdown', 'touch'));
  await click();
  component.setOptions({ touchOpenDelay: 0, reason: 'trigger-press' });
  await tick();
  vi.advanceTimersByTime(100);
  await tick();
  expect(component.snapshot()[0]).toMatchObject({ open: true, reason: 'input-press' });
});
