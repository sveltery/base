// Ordered immutable Original geometry/animation assertions at47b40521; MIT.
import { expect, test, type Page } from '@playwright/test';
import { fire, advance, waitTransport } from './navigation-menu-transport.js';
import type { NavigationMenuTestTransport } from '../../apps/fixtures/src/lib/navigation-menu-test-transport.js';
type Mocks = typeof import('../../apps/fixtures/src/lib/navigation-menu-source-mocks.js');
type Animation = ReturnType<ReturnType<Mocks['mockAnimations']>['start']>;
type State = {
  navigationMenuMocks: Mocks;
  navigationMenuAnimations: ReturnType<Mocks['mockAnimations']>;
  navigationMenuSize: { width: number; height: number };
  navigationMenuSizeSpy: ReturnType<Mocks['spySetProperty']>;
  navigationMenuSource: {
    snapshot(): { completions: boolean[] };
    setValue(value: unknown): void;
    unmount(): void;
  };
  navigationMenuTestTransport: NavigationMenuTestTransport;
};
async function visit(
  page: Page,
  reference: boolean,
  scenario: string,
  resize: 'none' | 'mock' | undefined = undefined,
  animationsDisabled = false,
  fakeClock = true,
) {
  if (fakeClock) await page.clock.install();
  await page.addInitScript(
    ({ resize, animationsDisabled }) => {
      // Original setupVitest defaults to true; literal per-site animation opt-ins
      // remain false and default-site protocols explicitly select true below.
      (
        globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean }
      ).BASE_UI_ANIMATIONS_DISABLED = animationsDisabled;
      if (resize === 'none')
        globalThis.ResizeObserver = undefined as unknown as typeof ResizeObserver;
      if (resize === 'mock')
        globalThis.ResizeObserver = class {
          observe() {}
          unobserve() {}
          disconnect() {}
        } as unknown as typeof ResizeObserver;
    },
    { resize, animationsDisabled },
  );
  await page.goto(`/navigation-menu/source?case=${scenario}${reference ? '&reference' : ''}`);
  await page.waitForFunction(() => Boolean((window as unknown as State).navigationMenuSource));
  await waitTransport(page);
}
const node = (page: Page, id: string) => page.getByTestId(id);
async function open(page: Page) {
  await fire(node(page, 'trigger-1'), 'click');
  await expect(node(page, 'popup-root')).toHaveCount(1);
}
async function fixedSize(page: Page, width: number, height: number) {
  await page.evaluate(
    ([width, height]) => {
      const state = window as unknown as State;
      state.navigationMenuSize = { width, height };
      const popup = document.querySelector('[data-testid="popup-root"]') as HTMLElement;
      Object.defineProperty(popup, 'offsetWidth', {
        configurable: true,
        get: () => state.navigationMenuSize.width,
      });
      Object.defineProperty(popup, 'offsetHeight', {
        configurable: true,
        get: () => state.navigationMenuSize.height,
      });
      state.navigationMenuAnimations = state.navigationMenuMocks.mockAnimations(popup);
    },
    [width, height],
  );
}
async function finish(page: Page) {
  await page.evaluate(async () => {
    const state = window as unknown as State;
    await state.navigationMenuTestTransport.mutate(() => state.navigationMenuAnimations.finish());
  });
}
async function values(page: Page, positioner = 'positioner') {
  return page.evaluate((positioner) => {
    const popup = document.querySelector('[data-testid="popup-root"]') as HTMLElement;
    const element = document.querySelector(`[data-testid="${positioner}"]`) as HTMLElement;
    return {
      popupWidth: popup.style.getPropertyValue('--popup-width'),
      popupHeight: popup.style.getPropertyValue('--popup-height'),
      width: element.style.getPropertyValue('--positioner-width'),
      height: element.style.getPropertyValue('--positioner-height'),
    };
  }, positioner);
}
const settled = { popupWidth: 'auto', popupHeight: 'auto', width: '250px', height: '220px' };
for (const reference of [false, true])
  test.describe(`${reference ? 'Original React' : 'native Svelte'} exact sizing`, () => {
    for (const [line, scenario] of [
      [1854, 'controlled-owner'],
      [1858, 'controlled-kept'],
    ] as const)
      test(`R:${line} external close preserves measured size`, async ({ page }) => {
        await page.addInitScript(() => {
          const width = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
          const height = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
          for (const [property, original, size] of [
            ['offsetWidth', width, 675],
            ['offsetHeight', height, 220],
          ] as const)
            Object.defineProperty(HTMLElement.prototype, property, {
              configurable: true,
              get() {
                return this.getAttribute('data-testid') === 'popup-root'
                  ? document.querySelector('[data-testid="popup-1"]')?.hasAttribute('data-open')
                    ? size
                    : 0
                  : (original?.get?.call(this) ?? 0);
              },
            });
        });
        await visit(page, reference, scenario);
        await expect(node(page, 'popup-root')).toHaveCount(1);
        await page.evaluate(async () => {
          const state = window as unknown as State;
          state.navigationMenuAnimations = state.navigationMenuMocks.mockAnimations(
            document.querySelector('[data-testid="popup-root"]') as HTMLElement,
          );
          state.navigationMenuAnimations.start();
          await state.navigationMenuTestTransport.mutate(() =>
            state.navigationMenuSource.setValue(null),
          );
        });
        await expect(node(page, 'popup-root')).toHaveAttribute('data-ending-style');
        expect(await values(page, 'top-level-positioner')).toEqual({
          popupWidth: '675px',
          popupHeight: '220px',
          width: '675px',
          height: '220px',
        });
        await finish(page);
      });
    test('R:1862 external close clears activation direction', async ({ page }) => {
      await visit(page, reference, 'controlled-owner');
      await page.evaluate(async () => {
        const state = window as unknown as State;
        for (const [id, x] of [
          ['trigger-1', 0],
          ['trigger-2', 120],
        ] as const)
          state.navigationMenuMocks.mockBoundingClientRect(
            document.querySelector(`[data-testid="${id}"]`)!,
            { x, y: 0, width: 80, height: 32 },
          );
      });
      await fire(node(page, 'trigger-2'), 'click');
      await page.evaluate(async () => {
        const state = window as unknown as State;
        await state.navigationMenuTestTransport.mutate(() =>
          state.navigationMenuSource.setValue('item-2'),
        );
      });
      await expect(node(page, 'popup-2')).toHaveAttribute('data-activation-direction', 'right');
      // Original retains exitingContent itself: its parent may unmount while this
      // Content's mocked animation is still running. Assert the same object.
      const exitingContent = await node(page, 'popup-2').elementHandle();
      if (!exitingContent) throw new Error('Original exitingContent is missing');
      await exitingContent.evaluate(async (element) => {
        const state = window as unknown as State;
        state.navigationMenuAnimations = state.navigationMenuMocks.mockAnimations(
          element as HTMLElement,
        );
        state.navigationMenuAnimations.start();
        await state.navigationMenuTestTransport.mutate(() =>
          state.navigationMenuSource.setValue(null),
        );
      });
      expect(
        await exitingContent.evaluate((element) => element.hasAttribute('data-ending-style')),
      ).toBe(true);
      expect(
        await exitingContent.evaluate((element) =>
          element.hasAttribute('data-activation-direction'),
        ),
      ).toBe(false);
      await finish(page);
      await exitingContent.dispose();
    });
    test('R:2042 manual action immediately unmounts in-flight close', async ({ page }) => {
      await visit(page, reference, 'manual');
      await page.evaluate(async () => {
        const state = window as unknown as State;
        state.navigationMenuAnimations = state.navigationMenuMocks.mockAnimations(
          document.querySelector('[data-testid="popup-root"]') as HTMLElement,
        );
        state.navigationMenuAnimations.start();
        await state.navigationMenuTestTransport.mutate(() =>
          state.navigationMenuSource.setValue(null),
        );
      });
      await expect(node(page, 'popup-root')).toHaveAttribute('data-ending-style');
      await page.evaluate(async () => {
        const state = window as unknown as State;
        await state.navigationMenuTestTransport.mutate(() => state.navigationMenuSource.unmount());
      });
      await expect(node(page, 'popup-root')).toHaveCount(0);
      await finish(page);
    });
    test('R:3135 inserting inline content updates and settles size', async ({ page }) => {
      await visit(page, reference, 'dynamic', 'none');
      await open(page);
      await fixedSize(page, 250, 120);
      await page.evaluate(async () => {
        const state = window as unknown as State;
        state.navigationMenuSize.height = 220;
        state.navigationMenuAnimations.start();
      });
      await fire(node(page, 'insert-content'), 'click');
      await expect(node(page, 'extra-content')).toHaveCount(1);
      await expect
        .poll(async () =>
          parseInt(
            await node(page, 'positioner').evaluate((n) =>
              getComputedStyle(n).getPropertyValue('--positioner-height'),
            ),
            10,
          ),
        )
        .toBe(220);
      await finish(page);
      await expect.poll(() => values(page)).toEqual(settled);
    });
    test('R:3370 hidden kept inline content updates mutation size', async ({ page }) => {
      await visit(page, reference, 'inline-keep', 'mock');
      await open(page);
      await fixedSize(page, 250, 220);
      await page.evaluate(async () => {
        const state = window as unknown as State;
        const popup = document.querySelector('[data-testid="popup-root"]') as HTMLElement;
        const positioner = document.querySelector('[data-testid="positioner"]') as HTMLElement;
        state.navigationMenuMocks.primeOpenPopupSize(popup, positioner, 250, 220);
        state.navigationMenuSize.height = 300;
        document.querySelector('[data-testid="nested-popup-1"]')!.setAttribute('hidden', '');
      });
      await expect
        .poll(async () => {
          const v = await values(page);
          return [v.width, v.height];
        })
        .toEqual(['250px', '300px']);
    });
    test('R:3308 switching kept inline content settles new size', async ({ page }) => {
      await visit(page, reference, 'inline-keep', 'mock');
      await open(page);
      await fixedSize(page, 250, 220);
      await page.evaluate(async () => {
        const state = window as unknown as State;
        state.navigationMenuMocks.primeOpenPopupSize(
          document.querySelector('[data-testid="popup-root"]') as HTMLElement,
          document.querySelector('[data-testid="positioner"]') as HTMLElement,
          250,
          220,
        );
        state.navigationMenuSize.height = 300;
        state.navigationMenuAnimations.start();
      });
      await fire(node(page, 'nested-trigger-2'), 'click');
      await expect(node(page, 'nested-popup-2')).not.toHaveAttribute('hidden');
      await expect(node(page, 'nested-popup-1')).toHaveAttribute('hidden');
      await expect
        .poll(async () =>
          parseInt(
            await node(page, 'positioner').evaluate((n) =>
              getComputedStyle(n).getPropertyValue('--positioner-height'),
            ),
            10,
          ),
        )
        .toBe(300);
      await finish(page);
      await expect.poll(() => values(page)).toEqual({ ...settled, height: '300px' });
    });
    test('R:3536 window resize updates without transition', async ({ page }) => {
      await visit(page, reference, 'kept-content', 'mock', true);
      await fixedSize(page, 675, 220);
      await page.evaluate(async () => {
        const state = window as unknown as State & {
          navigationMenuTestTransport: import('../../apps/fixtures/src/lib/navigation-menu-test-transport.js').NavigationMenuTestTransport;
        };
        state.navigationMenuMocks.primeOpenPopupSize(
          document.querySelector('[data-testid="popup-root"]') as HTMLElement,
          document.querySelector('[data-testid="positioner"]') as HTMLElement,
          675,
          220,
        );
        state.navigationMenuSize = { width: 500, height: 180 };
        await state.navigationMenuTestTransport.fire(window, 'resize');
      });
      await expect(node(page, 'positioner')).toHaveAttribute('data-instant');
      await advance(page, 0);
      await expect(node(page, 'positioner')).toHaveAttribute('data-instant');
      await advance(page, 100);
      await expect(node(page, 'positioner')).not.toHaveAttribute('data-instant');
      await expect
        .poll(() => values(page))
        .toEqual({ popupWidth: 'auto', popupHeight: 'auto', width: '500px', height: '180px' });
    });
    test('R:3587 kept trigger switches sizing immediately', async ({ page }) => {
      await visit(page, reference, 'kept-content', 'mock');
      await fixedSize(page, 675, 220);
      await page.evaluate(async () => {
        const state = window as unknown as State;
        state.navigationMenuMocks.primeOpenPopupSize(
          document.querySelector('[data-testid="popup-root"]') as HTMLElement,
          document.querySelector('[data-testid="positioner"]') as HTMLElement,
          675,
          220,
        );
        state.navigationMenuSize = { width: 500, height: 180 };
        state.navigationMenuAnimations.start();
      });
      await fire(node(page, 'trigger-learn'), 'click');
      const v = await values(page);
      expect([v.width, v.height]).toEqual(['500px', '180px']);
      await finish(page);
      await expect
        .poll(() => values(page))
        .toEqual({ popupWidth: 'auto', popupHeight: 'auto', width: '500px', height: '180px' });
    });
    test('R:3917 temporary zero close retains auto measured size', async ({ page }) => {
      await visit(page, reference, 'dynamic', undefined, true);
      const capturedValues = await page.evaluate(async () => {
        const state = window as unknown as State;
        const trigger = document.querySelector('[data-testid="trigger-1"]');
        if (!trigger) throw new Error('Original trigger is missing');
        await state.navigationMenuTestTransport.fire(trigger, 'click');
        const popupRoot = document.querySelector(
          '[data-testid="popup-root"]',
        ) as HTMLElement | null;
        const positioner = document.querySelector(
          '[data-testid="positioner"]',
        ) as HTMLElement | null;
        if (!popupRoot || !positioner)
          throw new Error('Original captured sizing elements are missing');
        state.navigationMenuMocks.primeOpenPopupSize(popupRoot, positioner, 250, 120);
        for (const [property, size] of [
          ['offsetWidth', 250],
          ['offsetHeight', 120],
        ] as const) {
          Object.defineProperty(popupRoot, property, {
            configurable: true,
            get: () =>
              document.querySelector('[data-testid="popup-1"]')?.hasAttribute('data-open')
                ? size
                : 0,
          });
          Object.defineProperty(positioner, property, { configurable: true, get: () => 0 });
        }
        await state.navigationMenuTestTransport.fire(trigger, 'blur', {
          relatedTarget: document.body,
        });
        // Original retains these two objects through close. Keep its ordered DOM
        // setup/fire/flush/read flow together instead of re-querying after RPCs.
        return {
          popupWidth: popupRoot.style.getPropertyValue('--popup-width'),
          popupHeight: popupRoot.style.getPropertyValue('--popup-height'),
          width: positioner.style.getPropertyValue('--positioner-width'),
          height: positioner.style.getPropertyValue('--positioner-height'),
        };
      });
      expect(capturedValues).toEqual({
        popupWidth: '250px',
        popupHeight: '120px',
        width: '250px',
        height: '120px',
      });
    });
    for (const [line, kept] of [
      [3198, false],
      [3245, true],
    ] as const)
      test(`R:${line} nested opening avoids stale fixed heights`, async ({ page }) => {
        await visit(page, reference, kept ? 'inline-keep' : 'inline');
        await page.evaluate(async (kept) => {
          const state = window as unknown as State;
          const transport = state.navigationMenuTestTransport;
          transport.fireSync(document.querySelector('[data-testid="trigger-1"]')!, 'click');
          const popupRoot = document.querySelector('[data-testid="popup-root"]') as HTMLElement;
          if (kept) {
            state.navigationMenuSizeSpy = state.navigationMenuMocks.spySetProperty(popupRoot.style);
            transport.onDispose(state.navigationMenuSizeSpy.restore);
          }
          const popupHeightValues = [120, 220];
          const popupWidth = 250;
          let popupHeight = 220;
          Object.defineProperty(popupRoot, 'offsetWidth', {
            configurable: true,
            get: () => popupWidth,
          });
          Object.defineProperty(popupRoot, 'offsetHeight', {
            configurable: true,
            get: () => {
              const nextHeight = popupHeightValues.shift();
              if (nextHeight != null) popupHeight = nextHeight;
              return popupHeight;
            },
          });
          await transport.flush();
        }, kept);
        if (kept) await expect(node(page, 'nested-popup-1')).not.toHaveAttribute('hidden');
        else await expect(node(page, 'nested-popup-1')).toHaveCount(1);
        await expect.poll(() => values(page)).toEqual(settled);
        if (kept) {
          const fixedPopupHeightCalls = await page.evaluate(() =>
            (window as unknown as State).navigationMenuSizeSpy.calls
              .filter((call) => call[0] === '--popup-height')
              .map((call) => call[1])
              .filter((value) => value !== 'auto' && value !== '0px'),
          );
          expect(fixedPopupHeightCalls.length).toBeGreaterThan(0);
          expect(fixedPopupHeightCalls.every((value) => value === '220px')).toBe(true);
          await page.evaluate(() => (window as unknown as State).navigationMenuSizeSpy.restore());
        }
      });
    test('R:3418 interrupted mutation retains intermediate and final height writes', async ({
      page,
    }) => {
      await visit(page, reference, 'dynamic-initial');
      await open(page);
      await page.evaluate(async () => {
        const state = window as unknown as State;
        const popupRoot = document.querySelector('[data-testid="popup-root"]') as HTMLElement;
        const positioner = document.querySelector('[data-testid="positioner"]') as HTMLElement;
        state.navigationMenuAnimations = state.navigationMenuMocks.mockAnimations(popupRoot);
        const popupWidth = 250;
        const popupHeightValues = [190, 260];
        let popupHeight = 260;
        Object.defineProperty(popupRoot, 'offsetWidth', {
          configurable: true,
          get: () => popupWidth,
        });
        Object.defineProperty(popupRoot, 'offsetHeight', {
          configurable: true,
          get: () => {
            const nextHeight = popupHeightValues.shift();
            if (nextHeight != null) popupHeight = nextHeight;
            return popupHeight;
          },
        });
        popupRoot.style.setProperty('--popup-width', '250px');
        popupRoot.style.setProperty('--popup-height', '220px');
        positioner.style.setProperty('--positioner-width', '250px');
        positioner.style.setProperty('--positioner-height', '220px');
        state.navigationMenuSizeSpy = state.navigationMenuMocks.spySetProperty(positioner.style);
        state.navigationMenuTestTransport.onDispose(state.navigationMenuSizeSpy.restore);
        state.navigationMenuAnimations.start();
        state.navigationMenuTestTransport.fireSync(
          document.querySelector('[data-testid="insert-content"]')!,
          'click',
        );
        await state.navigationMenuTestTransport.flush();
      });
      await expect(node(page, 'extra-content-2')).toHaveCount(1);
      expect(
        await page.evaluate(() =>
          (window as unknown as State).navigationMenuSizeSpy.calls.some(
            (call) => call[0] === '--positioner-height' && call[1] === '190px',
          ),
        ),
      ).toBe(true);
      await finish(page);
      await expect
        .poll(async () => {
          const v = await values(page);
          return [v.height, v.popupHeight];
        })
        .toEqual(['260px', 'auto']);
      await page.evaluate(() => (window as unknown as State).navigationMenuSizeSpy.restore());
    });
    test('R:3489 zero mutation measurements preserve the previous size', async ({ page }) => {
      await visit(page, reference, 'dynamic-initial', 'none', true);
      await open(page);
      await page.evaluate(async () => {
        const state = window as unknown as State;
        const popupRoot = document.querySelector('[data-testid="popup-root"]') as HTMLElement;
        const positioner = document.querySelector('[data-testid="positioner"]') as HTMLElement;
        const popupWidths = [250, 0];
        const popupHeights = [220, 0];
        Object.defineProperty(popupRoot, 'offsetWidth', {
          configurable: true,
          get: () => popupWidths.shift() ?? 0,
        });
        Object.defineProperty(popupRoot, 'offsetHeight', {
          configurable: true,
          get: () => popupHeights.shift() ?? 0,
        });
        popupRoot.style.setProperty('--popup-width', '250px');
        popupRoot.style.setProperty('--popup-height', '220px');
        positioner.style.setProperty('--positioner-width', '250px');
        positioner.style.setProperty('--positioner-height', '220px');
        state.navigationMenuTestTransport.fireSync(
          document.querySelector('[data-testid="insert-content"]')!,
          'click',
        );
        await state.navigationMenuTestTransport.flush();
      });
      await expect
        .poll(async () => {
          const v = await values(page);
          return [v.popupWidth, v.popupHeight];
        })
        .toEqual(['auto', 'auto']);
      const v = await values(page);
      expect([v.width, v.height]).toEqual(['250px', '220px']);
    });
    test('R:3642 stale opening animation cannot reset the switched size', async ({ page }) => {
      await visit(page, reference, 'kept-content-closed', 'mock');
      await page.evaluate(async () => {
        const state = window as unknown as State & {
          navigationMenuOpenAnimation: Animation;
          navigationMenuSwitchAnimation: Animation;
        };
        const popupRoot = document.querySelector('[data-testid="popup-root"]') as HTMLElement;
        state.navigationMenuAnimations = state.navigationMenuMocks.mockAnimations(popupRoot);
        state.navigationMenuSize = { width: 675, height: 220 };
        Object.defineProperty(popupRoot, 'offsetWidth', {
          configurable: true,
          get: () => state.navigationMenuSize.width,
        });
        Object.defineProperty(popupRoot, 'offsetHeight', {
          configurable: true,
          get: () => state.navigationMenuSize.height,
        });
        const waitForAnimationFrame = () =>
          new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        const waitForSettledAnimations = () =>
          state.navigationMenuTestTransport.mutate(async () => {
            await state.navigationMenuTestTransport.flush();
            await waitForAnimationFrame();
            await waitForAnimationFrame();
          });
        state.navigationMenuOpenAnimation = state.navigationMenuAnimations.start();
        state.navigationMenuTestTransport.fireSync(
          document.querySelector('[data-testid="trigger-product"]')!,
          'click',
        );
        await waitForSettledAnimations();
        state.navigationMenuSize = { width: 500, height: 180 };
        state.navigationMenuSwitchAnimation = state.navigationMenuAnimations.start();
        state.navigationMenuTestTransport.fireSync(
          document.querySelector('[data-testid="trigger-learn"]')!,
          'click',
        );
        await waitForSettledAnimations();
      });
      await expect
        .poll(async () => {
          const v = await values(page);
          return [v.width, v.height];
        })
        .toEqual(['500px', '180px']);
      await page.evaluate(async () => {
        const state = window as unknown as State & { navigationMenuOpenAnimation: Animation };
        await state.navigationMenuTestTransport.mutate(async () => {
          await state.navigationMenuAnimations.finish(state.navigationMenuOpenAnimation);
          await state.navigationMenuTestTransport.flush();
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });
      });
      const v = await values(page);
      expect([v.popupWidth, v.popupHeight]).toEqual(['500px', '180px']);
      await page.evaluate(async () => {
        const state = window as unknown as State & { navigationMenuSwitchAnimation: Animation };
        await state.navigationMenuTestTransport.mutate(async () => {
          await state.navigationMenuAnimations.finish(state.navigationMenuSwitchAnimation);
          await state.navigationMenuTestTransport.flush();
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });
      });
      await expect
        .poll(async () => {
          const v = await values(page);
          return [v.popupWidth, v.popupHeight];
        })
        .toEqual(['auto', 'auto']);
    });
    test('R:3724 reopened panel seeds the captured exiting width first', async ({ page }) => {
      await visit(page, reference, 'scoped-top-link');
      await page.evaluate(() => {
        const state = window as unknown as State & { navigationMenuOpenAnimation: Animation };
        const popupRoot = document.querySelector('[data-testid="popup-root"]') as HTMLElement;
        state.navigationMenuAnimations = state.navigationMenuMocks.mockAnimations(popupRoot);
        state.navigationMenuSize = { width: 675, height: 220 };
        Object.defineProperty(popupRoot, 'offsetWidth', {
          configurable: true,
          get: () => {
            const fixedWidth = popupRoot.style.getPropertyValue('--popup-width');
            return fixedWidth && fixedWidth !== 'auto'
              ? parseInt(fixedWidth, 10)
              : state.navigationMenuSize.width;
          },
        });
        Object.defineProperty(popupRoot, 'offsetHeight', {
          configurable: true,
          get: () => {
            const fixedHeight = popupRoot.style.getPropertyValue('--popup-height');
            return fixedHeight && fixedHeight !== 'auto'
              ? parseInt(fixedHeight, 10)
              : state.navigationMenuSize.height;
          },
        });
        state.navigationMenuOpenAnimation = state.navigationMenuAnimations.start();
        state.navigationMenuTestTransport.fireSync(
          document.querySelector('[data-testid="trigger-product"]')!,
          'mouseenter',
        );
        state.navigationMenuTestTransport.fireSync(
          document.querySelector('[data-testid="trigger-product"]')!,
          'mousemove',
        );
      });
      await advance(page, 50);
      await page.evaluate(async () => {
        const state = window as unknown as State & { navigationMenuOpenAnimation: Animation };
        await state.navigationMenuTestTransport.mutate(async () => {
          await state.navigationMenuAnimations.finish(state.navigationMenuOpenAnimation);
          await state.navigationMenuTestTransport.flush();
        });
      });
      await expect(node(page, 'trigger-product')).toHaveAttribute('aria-expanded', 'true');
      await expect.poll(async () => (await values(page)).popupWidth).toBe('auto');
      await page.evaluate(() => {
        const state = window as unknown as State & {
          navigationMenuProductAnimations: ReturnType<Mocks['mockAnimations']>;
          navigationMenuProductCloseAnimation: Animation;
          navigationMenuCloseAnimation: Animation;
        };
        const productContent = state.navigationMenuTestTransport
          .getByText(document.body, 'Product panel')
          .closest('.test-navigation-menu-content') as HTMLElement;
        state.navigationMenuProductAnimations =
          state.navigationMenuMocks.mockAnimations(productContent);
        state.navigationMenuProductCloseAnimation = state.navigationMenuProductAnimations.start();
        state.navigationMenuCloseAnimation = state.navigationMenuAnimations.start();
        const topLevelLink = document.querySelector('[data-testid="top-level-link"]')!;
        state.navigationMenuTestTransport.fireSync(
          document.querySelector('[data-testid="trigger-product"]')!,
          'mouseleave',
          { relatedTarget: topLevelLink },
        );
        state.navigationMenuTestTransport.fireSync(topLevelLink, 'mouseenter');
        state.navigationMenuTestTransport.fireSync(topLevelLink, 'mousemove');
      });
      await advance(page, 50);
      await expect(node(page, 'trigger-product')).toHaveAttribute('aria-expanded', 'false');
      await page.evaluate(() => {
        const state = window as unknown as State & { navigationMenuReopenAnimation: Animation };
        state.navigationMenuSize = { width: 500, height: 180 };
        state.navigationMenuSizeSpy = state.navigationMenuMocks.spySetProperty(
          (document.querySelector('[data-testid="popup-root"]') as HTMLElement).style,
        );
        state.navigationMenuTestTransport.onDispose(state.navigationMenuSizeSpy.restore);
        state.navigationMenuReopenAnimation = state.navigationMenuAnimations.start();
        state.navigationMenuTestTransport.fireSync(
          document.querySelector('[data-testid="trigger-learn"]')!,
          'mouseenter',
        );
        state.navigationMenuTestTransport.fireSync(
          document.querySelector('[data-testid="trigger-learn"]')!,
          'mousemove',
        );
      });
      await advance(page, 50);
      await page.evaluate(async () => {
        const state = window as unknown as State;
        await state.navigationMenuTestTransport.mutate(async () => {
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
          await state.navigationMenuTestTransport.flush();
        });
      });
      const popupWidthCalls = await page.evaluate(() =>
        (window as unknown as State).navigationMenuSizeSpy.calls
          .filter((call) => call[0] === '--popup-width')
          .map((call) => call[1]),
      );
      const exitingWidthIndex = popupWidthCalls.indexOf('675px');
      const reopeningWidthIndex = popupWidthCalls.lastIndexOf('500px');
      await expect(node(page, 'trigger-learn')).toHaveAttribute('aria-expanded', 'true');
      expect((await values(page)).width).toBe('500px');
      expect(exitingWidthIndex).toBeGreaterThan(-1);
      expect(reopeningWidthIndex).toBeGreaterThan(exitingWidthIndex);
      await page.evaluate(async () => {
        const state = window as unknown as State & {
          navigationMenuProductAnimations: ReturnType<Mocks['mockAnimations']>;
          navigationMenuProductCloseAnimation: Animation;
          navigationMenuCloseAnimation: Animation;
          navigationMenuReopenAnimation: Animation;
        };
        await state.navigationMenuTestTransport.mutate(async () => {
          await state.navigationMenuProductAnimations.finish(
            state.navigationMenuProductCloseAnimation,
          );
          await state.navigationMenuAnimations.finish(state.navigationMenuCloseAnimation);
          await state.navigationMenuAnimations.finish(state.navigationMenuReopenAnimation);
          await state.navigationMenuTestTransport.flush();
        });
        state.navigationMenuSizeSpy.restore();
      });
    });
    test('R:3843 switched popup closes on the shorter animation path', async ({ page }) => {
      await visit(page, reference, 'scoped-exit');
      const result = await page.evaluate(async () => {
        const state = window as unknown as State;
        const transport = state.navigationMenuTestTransport;
        const triggerProduct = document.querySelector(
          '[data-testid="trigger-product"]',
        ) as HTMLElement;
        const triggerLearn = document.querySelector('[data-testid="trigger-learn"]') as HTMLElement;
        transport.fireSync(triggerProduct, 'click');
        await transport.flush();
        const productContent = transport
          .getByText(document.body, 'Product panel')
          .closest('.test-navigation-menu-content') as HTMLElement;
        const productContentAnimations = state.navigationMenuMocks.mockAnimations(productContent);
        const productContentCloseAnimation = productContentAnimations.start();
        transport.fireSync(triggerLearn, 'click');
        await transport.flush();
        let popupRoot: HTMLElement | null = null;
        await transport.waitFor(() => {
          popupRoot = document.querySelector('[data-testid="popup-root"]') as HTMLElement;
          if (
            !popupRoot ||
            triggerProduct.getAttribute('aria-expanded') !== 'false' ||
            triggerLearn.getAttribute('aria-expanded') !== 'true'
          )
            throw new Error('Source switch predicates are pending');
        });
        await transport.mutate(async () => {
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
          await transport.flush();
          await productContentAnimations.finish(productContentCloseAnimation);
          await transport.flush();
        });
        await transport.waitFor(() => {
          if (popupRoot!.getAnimations().some((animation) => animation.playState !== 'finished'))
            throw new Error('Source running animations are pending');
        });
        await transport.mutate(() => triggerLearn.focus());
        const closeStart = performance.now();
        transport.fireSync(triggerLearn, 'keydown', { key: 'Escape' });
        await transport.flush();
        await transport.waitFor(() => {
          const completions = state.navigationMenuSource.snapshot().completions;
          if (completions.length !== 1 || completions[0] !== false)
            throw new Error('Source exact close completion is pending');
        });
        return {
          completions: state.navigationMenuSource.snapshot().completions,
          elapsed: performance.now() - closeStart,
        };
      });
      expect(result.completions).toEqual([false]);
      expect(result.elapsed).toBeLessThan(325);
    });
    test('T:455 earlier hover cannot overwrite the later popup width', async ({ page }) => {
      await visit(page, reference, 'rapid-hover', undefined, true, false);
      const result = await page.evaluate(async () => {
        const state = window as unknown as State;
        const transport = state.navigationMenuTestTransport;
        const product = [...document.querySelectorAll('button')].find(
          (button) => button.textContent === 'Product',
        )!;
        const solutions = [...document.querySelectorAll('button')].find(
          (button) => button.textContent === 'Solutions',
        )!;
        await transport.input('hover', product, { pointerEventsCheck: 0 });
        const popupRoot = await transport.waitFor(() => {
          const popup = document.querySelector('[data-testid="popup-root"]') as HTMLElement | null;
          if (!popup) throw new Error('Source popup is pending');
          return popup;
        });
        const setPropertySpy = state.navigationMenuMocks.spySetProperty(popupRoot.style);
        transport.onDispose(setPropertySpy.restore);
        const getWidthCallsSince = (startIndex = 0) =>
          state.navigationMenuMocks.getPopupWidthCalls(
            setPropertySpy.calls.slice(startIndex) as Array<
              [property: string, value: string, priority?: string]
            >,
          );
        try {
          await transport.waitFor(() => {
            if (popupRoot.style.getPropertyValue('--popup-width') !== '700px')
              throw new Error('Source initial fixed width is pending');
          });
          const callsBeforeSolutionsHover = setPropertySpy.calls.length;
          await transport.input('hover', solutions, { pointerEventsCheck: 0 });
          await transport.waitFor(() => {
            if (!transport.isSourceVisible(transport.getByText(document.body, 'Solutions panel')))
              throw new Error('Source visible Solutions panel is pending');
          });
          await transport.waitFor(() => {
            const widths = getWidthCallsSince(callsBeforeSolutionsHover);
            const index = widths.indexOf('500px');
            if (index < 0 || widths.slice(index + 1).includes('700px'))
              throw new Error('Source post-switch width ordering is pending');
          });
          await transport.waitFor(() => {
            if (popupRoot.style.getPropertyValue('--popup-width') !== 'auto')
              throw new Error('Source width reset is pending');
          });
          return {
            widths: getWidthCallsSince(callsBeforeSolutionsHover),
            width: popupRoot.style.getPropertyValue('--popup-width'),
          };
        } finally {
          setPropertySpy.restore();
        }
      });
      const solutionsWidthIndex = result.widths.indexOf('500px');
      expect(solutionsWidthIndex).toBeGreaterThan(-1);
      expect(result.widths.slice(solutionsWidthIndex + 1)).not.toContain('700px');
      expect(result.width).toBe('auto');
    });
    test('T:501 interrupted resize cannot overwrite the later positioner width', async ({
      page,
    }) => {
      await visit(page, reference, 'rapid-hover', undefined, true, false);
      const result = await page.evaluate(async () => {
        const state = window as unknown as State;
        const transport = state.navigationMenuTestTransport;
        const product = [...document.querySelectorAll('button')].find(
          (button) => button.textContent === 'Product',
        )!;
        const solutions = [...document.querySelectorAll('button')].find(
          (button) => button.textContent === 'Solutions',
        )!;
        await transport.input('hover', product, { pointerEventsCheck: 0 });
        const popupRoot = await transport.waitFor(() => {
          const popup = document.querySelector('[data-testid="popup-root"]') as HTMLElement | null;
          if (!popup) throw new Error('Source popup is pending');
          return popup;
        });
        const positioner = popupRoot.parentElement as HTMLElement;
        const setPositionerPropertySpy = state.navigationMenuMocks.spySetProperty(positioner.style);
        transport.onDispose(setPositionerPropertySpy.restore);
        const getPositionerWidthCallsSince = (startIndex = 0) =>
          state.navigationMenuMocks.getPositionerWidthCalls(
            setPositionerPropertySpy.calls.slice(startIndex) as Array<
              [property: string, value: string, priority?: string]
            >,
          );
        try {
          await transport.waitFor(() => {
            if (popupRoot.style.getPropertyValue('--popup-width') !== '700px')
              throw new Error('Source initial fixed width is pending');
          });
          let popupWidth = 700;
          let popupHeight = 420;
          Object.defineProperty(popupRoot, 'offsetWidth', {
            configurable: true,
            get: () => popupWidth,
          });
          Object.defineProperty(popupRoot, 'offsetHeight', {
            configurable: true,
            get: () => popupHeight,
          });
          popupRoot.style.setProperty('--popup-width', '700px');
          popupRoot.style.setProperty('--popup-height', '420px');
          popupWidth = 760;
          popupHeight = 460;
          await transport.input(
            'click',
            [...document.querySelectorAll('button')].find(
              (button) => button.textContent === 'Expand Product',
            )!,
            { pointerEventsCheck: 0 },
          );
          await transport.waitFor(() => {
            if (
              !setPositionerPropertySpy.calls.some(
                (call) => call[0] === '--positioner-width' && call[1] === '760px',
              )
            )
              throw new Error('Source interrupted positioner width is pending');
          });
          popupWidth = 500;
          popupHeight = 320;
          const callsBeforeSolutionsHover = setPositionerPropertySpy.calls.length;
          await transport.input('hover', solutions, { pointerEventsCheck: 0 });
          await transport.waitFor(() => {
            if (!transport.isSourceVisible(transport.getByText(document.body, 'Solutions panel')))
              throw new Error('Source visible Solutions panel is pending');
          });
          await transport.waitFor(() => {
            const widths = getPositionerWidthCallsSince(callsBeforeSolutionsHover);
            const index = widths.indexOf('500px');
            if (index < 0 || widths.slice(index + 1).includes('760px'))
              throw new Error('Source post-switch width ordering is pending');
          });
          await transport.waitFor(() => {
            if (positioner.style.getPropertyValue('--positioner-width') !== '500px')
              throw new Error('Source settled positioner width is pending');
          });
          return {
            widths: getPositionerWidthCallsSince(callsBeforeSolutionsHover),
            width: positioner.style.getPropertyValue('--positioner-width'),
          };
        } finally {
          setPositionerPropertySpy.restore();
        }
      });
      const solutionsWidthIndex = result.widths.indexOf('500px');
      expect(solutionsWidthIndex).toBeGreaterThan(-1);
      expect(result.widths.slice(solutionsWidthIndex + 1)).not.toContain('760px');
      expect(result.width).toBe('500px');
    });
  });
