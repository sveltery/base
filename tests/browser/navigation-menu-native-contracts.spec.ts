// Additive native boundary witnesses, zero unchanged Original assertion credit.
// Protocols: MIT Base UI 1.8.0 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c,
// Root R2339/R2538/R2568/R3917. Existing Source assertions remain unchanged.
// Source fixture SHA256 3ae0e6b058a1b88289bf5e49222a9f4f940008ba1d0c6753f9e5b41213b661db.
import { expect, test, type Page } from '@playwright/test';
import { advance, fire, input, waitTransport } from './navigation-menu-transport.js';
import type { NavigationMenuTestTransport } from '../../apps/fixtures/src/lib/navigation-menu-test-transport.js';
type Mocks = typeof import('../../apps/fixtures/src/lib/navigation-menu-source-mocks.js');
type State = {
  navigationMenuSource: {
    snapshot(): { calls: { value: unknown; reason: string; type: string; canceled: boolean }[] };
  };
  navigationMenuTestTransport: NavigationMenuTestTransport;
  navigationMenuMocks: Mocks;
};
const node = (page: Page, id: string) => page.getByTestId(id);
async function visit(page: Page, reference: boolean, scenario: string) {
  await page.clock.install();
  await page.addInitScript(() => {
    (
      globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean }
    ).BASE_UI_ANIMATIONS_DISABLED = true;
  });
  await page.goto(`/navigation-menu/source?case=${scenario}${reference ? '&reference' : ''}`);
  await page.waitForFunction(() => Boolean((window as unknown as State).navigationMenuSource));
  await waitTransport(page);
}
async function nestedHover(page: Page, reference: boolean) {
  await visit(page, reference, 'nested-close');
  await input(node(page, 'trigger-1'), 'click');
  await expect(node(page, 'popup-1')).toHaveCount(1);
  await fire(node(page, 'nested-trigger-1'), 'mouseenter');
  await fire(node(page, 'nested-trigger-1'), 'mousemove');
  await advance(page, 50);
  await expect(node(page, 'nested-popup-1')).toHaveCount(1);
}
async function pointerState(page: Page) {
  return page.evaluate(() => {
    const get = (id: string) => {
      const element = document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
      if (!element) throw new Error(`Missing actual host ${id}`);
      return {
        inline: element.style.pointerEvents,
        computed: getComputedStyle(element).pointerEvents,
      };
    };
    return {
      body: document.body.style.pointerEvents,
      reference: get('nested-trigger-1'),
      positioner: get('nested-positioner'),
      link: get('nested-link-1'),
    };
  });
}
for (const reference of [false, true])
  test.describe(`${reference ? 'Original React' : 'native Svelte'} boundary characterization (zero credit)`, () => {
    test('R2339 native DOM portal capture and actual dismissal callbacks', async ({ page }) => {
      await visit(page, reference, 'dialog');
      await input(node(page, 'trigger-1'), 'click');
      await input(node(page, 'dialog-trigger'), 'click');
      await expect(node(page, 'dialog-popup')).toHaveCount(1);
      const before = await page.evaluate(
        () => (window as unknown as State).navigationMenuSource.snapshot().calls,
      );
      await input(node(page, 'dialog-button'), 'click');
      await expect(node(page, 'trigger-1')).toHaveAttribute(
        'aria-expanded',
        reference ? 'true' : 'false',
      );
      await expect(node(page, 'popup-1')).toHaveCount(reference ? 1 : 0);
      const after = await page.evaluate(
        () => (window as unknown as State).navigationMenuSource.snapshot().calls,
      );
      expect(before.map((call) => call.value)).toEqual(['item-1']);
      expect(after.map((call) => call.value)).toEqual(reference ? ['item-1'] : ['item-1', null]);
      if (!reference)
        expect(after.at(-1)).toMatchObject({
          reason: 'outside-press',
          type: 'click',
          canceled: false,
        });
    });
    test('R2538/R2568 safePolygon mutation and native style replacement', async ({ page }) => {
      await nestedHover(page, reference);
      expect(await pointerState(page)).toEqual({
        body: 'none',
        reference: { inline: 'auto', computed: 'auto' },
        positioner: { inline: reference ? 'auto' : '', computed: reference ? 'auto' : 'none' },
        link: { inline: '', computed: reference ? 'auto' : 'none' },
      });
    });
    test('R2538/R2568 actual user pointer acceptance or precise rejection', async ({ page }) => {
      await nestedHover(page, reference);
      const result = await node(page, 'nested-link-1').evaluate(async (element) => {
        try {
          await (window as unknown as State).navigationMenuTestTransport.input('click', element);
          return { name: null, message: null };
        } catch (error) {
          if (!(error instanceof Error)) throw error;
          return { name: error.name, message: error.message };
        }
      });
      if (reference) {
        expect(result).toEqual({ name: null, message: null });
        await expect(node(page, 'popup-1')).toHaveCount(0);
      } else {
        expect(result.name).toBe('Error');
        expect(result.message).toMatch(/pointer-events:\s*none/);
        await expect(node(page, 'nested-popup-1')).toHaveCount(1);
        await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'true');
      }
    });
    test('consumer CSS pointer override follows actual native cascade', async ({ page }) => {
      await nestedHover(page, reference);
      // Consumer stylesheet control, independent of mutation/style ownership.
      await page.addStyleTag({
        content: '[data-testid="nested-positioner"] { pointer-events: auto !important; }',
      });
      expect((await pointerState(page)).link.computed).toBe('auto');
      await input(node(page, 'nested-link-1'), 'click');
      await expect(node(page, 'popup-1')).toHaveCount(0);
    });
    test('R3917 ordered captured-host temporary-zero size observation', async ({ page }) => {
      await visit(page, reference, 'dynamic');
      const observed = await page.evaluate(async () => {
        const state = window as unknown as State;
        const trigger = document.querySelector('[data-testid="trigger-1"]');
        if (!trigger) throw new Error('Missing actual trigger');
        await state.navigationMenuTestTransport.fire(trigger, 'click');
        const popup = document.querySelector('[data-testid="popup-root"]') as HTMLElement | null;
        const positioner = document.querySelector(
          '[data-testid="positioner"]',
        ) as HTMLElement | null;
        if (!popup || !positioner) throw new Error('Missing actual captured sizing hosts');
        state.navigationMenuMocks.primeOpenPopupSize(popup, positioner, 250, 120);
        for (const [property, size] of [
          ['offsetWidth', 250],
          ['offsetHeight', 120],
        ] as const) {
          Object.defineProperty(popup, property, {
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
        return {
          popupWidth: popup.style.getPropertyValue('--popup-width'),
          popupHeight: popup.style.getPropertyValue('--popup-height'),
          width: positioner.style.getPropertyValue('--positioner-width'),
          height: positioner.style.getPropertyValue('--positioner-height'),
        };
      });
      expect(observed).toEqual({
        popupWidth: reference ? '250px' : 'auto',
        popupHeight: reference ? '120px' : 'auto',
        width: '250px',
        height: '120px',
      });
    });
  });
