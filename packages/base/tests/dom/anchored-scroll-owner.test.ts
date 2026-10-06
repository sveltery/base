// Authored native lifetime/width supplements at immutable Base UI v1.8.0
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; zero unchanged Original assertion credit.
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './AnchoredScrollOwnerFixture.svelte';

const cleanups: (() => Promise<void>)[] = [];
beforeEach(() => {
  vi.useFakeTimers();
  // Overlay-scrollbar host: canonical ScrollLocker takes its real body lock branch.
  vi.stubGlobal('innerWidth', 100);
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(100);
});
afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
  await tick();
  vi.runAllTimers();
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

async function settle() {
  await tick();
  vi.runAllTimers();
  await tick();
}

async function setup() {
  const target = document.createElement('div');
  document.body.append(target);
  const fixture = mount(Fixture, { target });
  let stopped = false;
  const stop = async () => {
    if (!stopped) {
      stopped = true;
      await unmount(fixture);
      await settle();
    }
  };
  cleanups.push(stop);
  await settle();
  return { fixture, stop };
}

function positioner(width: number) {
  const element = document.createElement('div');
  Object.defineProperty(element, 'offsetWidth', { value: width });
  document.body.append(element);
  return element;
}

// Expected boundaries come from the complete pinned helper predicate, not upstream tests.
for (const [viewport, popup, locks] of [
  [100, 79, false],
  [100, 80, true],
  [100, 100, true],
  [100, 0, false],
  [0, 100, false],
] as const) {
  it(`measures touch popup ${popup} against viewport ${viewport}: lock=${locks}`, async () => {
    const { fixture } = await setup();
    vi.mocked(
      Object.getOwnPropertyDescriptor(document.documentElement, 'clientWidth')!.get!,
    ).mockReturnValue(viewport);
    fixture.configure(true, true, positioner(popup));
    await settle();
    expect(document.body.style.overflowY === 'hidden').toBe(locks);
  });
}

it('releases on disabled/null transitions, retains non-touch locking, and cleans up its owner', async () => {
  const { fixture, stop } = await setup();
  const wide = positioner(80);
  const narrow = positioner(79);
  fixture.configure(true, true, wide);
  await settle();
  expect(document.body.style.overflowY).toBe('hidden');
  fixture.configure(false, true, wide);
  await settle();
  expect(document.body.style.overflowY).toBe('');
  fixture.configure(true, true, narrow);
  await settle();
  expect(document.body.style.overflowY).toBe('');
  fixture.configure(true, false, narrow);
  await settle();
  expect(document.body.style.overflowY).toBe('hidden');
  fixture.configure(true, true, null, narrow);
  await settle();
  expect(document.body.style.overflowY).toBe('');
  fixture.configure(true, true, wide);
  await settle();
  expect(document.body.style.overflowY).toBe('hidden');
  await stop();
  expect(document.body.style.overflowY).toBe('');
});
