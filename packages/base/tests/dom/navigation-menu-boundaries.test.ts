// Original Arrow:21, Icon:19, List:17 and Positioner:41/55 declarations; MIT.
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './NavigationMenuBoundaryFixture.svelte';
const positioned = vi.hoisted(() => vi.fn());
vi.mock(
  '../../src/lib/navigation-menu/utils/useNavigationMenuAnchorPositioning.svelte.js',
  async () => {
    const actual = await vi.importActual<
      typeof import('../../src/lib/navigation-menu/utils/useNavigationMenuAnchorPositioning.svelte.js')
    >('../../src/lib/navigation-menu/utils/useNavigationMenuAnchorPositioning.svelte.js');
    return {
      ...actual,
      useNavigationMenuAnchorPositioning: (
        ...args: Parameters<typeof actual.useNavigationMenuAnchorPositioning>
      ) => {
        positioned(...args);
        return actual.useNavigationMenuAnchorPositioning(...args);
      },
    };
  },
);
const mounted: ReturnType<typeof mount>[] = [];
async function setup(part: string) {
  const target = document.createElement('section');
  document.body.append(target);
  const component = mount(Fixture, { target, props: { part } });
  mounted.push(component);
  await tick();
  return component;
}
beforeEach(() => {
  positioned.mockClear();
});
afterEach(async () => {
  for (const component of mounted.splice(0)) await unmount(component);
  document.body.replaceChildren();
  vi.restoreAllMocks();
});
for (const [part, message] of [
  [
    'Arrow',
    'Base UI: NavigationMenuPositionerContext is missing. NavigationMenuPositioner parts must be placed within <NavigationMenu.Positioner>.',
  ],
  ['Icon', 'Base UI: NavigationMenuItem parts must be used within a <NavigationMenu.Item>.'],
  [
    'List',
    'Base UI: NavigationMenuRootContext is missing. Navigation Menu parts must be placed within <NavigationMenu.Root>.',
  ],
  ['Positioner', 'Base UI: <NavigationMenu.Portal> is missing.'],
])
  it(`Original ${part} required boundary error`, async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(setup(part)).rejects.toThrow(message);
    } finally {
      errorSpy.mockRestore();
    }
  });
it('Original Positioner:41 uses the layout viewport', async () => {
  await setup('layout-viewport');
  expect(positioned.mock.lastCall?.[0]().shift).toEqual({ rootBoundary: 'layoutViewport' });
});
