// Pinned useAnchorPositioning.test.tsx:64,71 (2 sites/3 variants); MIT: parity/anchor-positioning/UPSTREAM_LICENSE.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/AnchorPositioningFixture.svelte';
const shiftSpy = vi.hoisted(() => vi.fn());
vi.mock('@floating-ui/dom', async () => {
  const actual = await vi.importActual<typeof import('@floating-ui/dom')>('@floating-ui/dom');
  return { ...actual, shift: ((...args: Parameters<typeof actual.shift>) => {
    shiftSpy(...args); return actual.shift(...args);
  }) satisfies typeof actual.shift };
});
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); });
async function render(scenario = 'default') {
  const target = document.createElement('div'); document.body.append(target);
  const component = mount(Fixture, { target, props: { scenario } });
  cleanups.push(() => unmount(component)); flushSync();
  await new Promise<void>(resolve => queueMicrotask(resolve));
}
describe('useAnchorPositioning pinned middleware wiring', () => {
  beforeEach(() => shiftSpy.mockClear());
  it('uses the visual viewport for shift by default', async () => {
    await render();
    expect(shiftSpy).toHaveBeenCalled();
    expect(shiftSpy.mock.calls[0]?.[0].rootBoundary).toBe(undefined);
  });
  it.each([
    { shift: { rootBoundary: 'layoutViewport' } as const, crossAxis: false },
    { shift: { crossAxis: true, rootBoundary: 'layoutViewport' } as const, crossAxis: true },
  ])('uses the configured shift options', async ({ shift, crossAxis }) => {
    await render(shift.crossAxis ? 'cross-axis' : 'layout');
    expect(shiftSpy.mock.calls[0]?.[0].rootBoundary).toBe('layoutViewport');
    expect(shiftSpy.mock.calls[0]?.[0].crossAxis).toBe(crossAxis);
  });
});
