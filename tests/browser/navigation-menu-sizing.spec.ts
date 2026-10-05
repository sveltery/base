// Ordered immutable Original geometry/animation assertions at47b40521; MIT.
import { expect, test, type Page } from '@playwright/test';
import { fire, advance, waitTransport } from './navigation-menu-transport.js';
import type { NavigationMenuTestTransport } from '../../apps/fixtures/src/lib/navigation-menu-test-transport.js';
type Mocks = typeof import('../../apps/fixtures/src/lib/navigation-menu-source-mocks.js');
type State = { navigationMenuMocks: Mocks; navigationMenuAnimations: ReturnType<Mocks['mockAnimations']>; navigationMenuSize: { width: number; height: number }; navigationMenuSource: { setValue(value: unknown): void; unmount(): void }; navigationMenuTestTransport: NavigationMenuTestTransport };
async function visit(page: Page, reference: boolean, scenario: string, resize: 'none' | 'mock' | undefined = undefined) {
  await page.clock.install();
  await page.addInitScript(({ resize }) => {
    (globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean }).BASE_UI_ANIMATIONS_DISABLED = false;
    if (resize === 'none') globalThis.ResizeObserver = undefined as unknown as typeof ResizeObserver;
    if (resize === 'mock') globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;
  }, { resize });
  await page.goto(`/navigation-menu/source?case=${scenario}${reference ? '&reference' : ''}`);
  await page.waitForFunction(() => Boolean((window as unknown as State).navigationMenuSource));
  await waitTransport(page);
}
const node = (page: Page, id: string) => page.getByTestId(id);
async function open(page: Page) { await fire(node(page, 'trigger-1'), 'click'); await expect(node(page, 'popup-root')).toHaveCount(1); }
async function fixedSize(page: Page, width: number, height: number) {
  await page.evaluate(([width, height]) => {
    const state = window as unknown as State;
    state.navigationMenuSize = { width, height };
    const popup = document.querySelector('[data-testid="popup-root"]') as HTMLElement;
    Object.defineProperty(popup, 'offsetWidth', { configurable: true, get: () => state.navigationMenuSize.width });
    Object.defineProperty(popup, 'offsetHeight', { configurable: true, get: () => state.navigationMenuSize.height });
    state.navigationMenuAnimations = state.navigationMenuMocks.mockAnimations(popup);
  }, [width, height]);
}
async function finish(page: Page) { await page.evaluate(async () => { const state = window as unknown as State; await state.navigationMenuTestTransport.mutate(() => state.navigationMenuAnimations.finish()); }); }
async function values(page: Page, positioner = 'positioner') { return page.evaluate(positioner => {
  const popup = document.querySelector('[data-testid="popup-root"]') as HTMLElement;
  const element = document.querySelector(`[data-testid="${positioner}"]`) as HTMLElement;
  return { popupWidth: popup.style.getPropertyValue('--popup-width'), popupHeight: popup.style.getPropertyValue('--popup-height'), width: element.style.getPropertyValue('--positioner-width'), height: element.style.getPropertyValue('--positioner-height') };
}, positioner); }
const settled = { popupWidth: 'auto', popupHeight: 'auto', width: '250px', height: '220px' };
for (const reference of [false, true]) test.describe(`${reference ? 'Original React' : 'native Svelte'} exact sizing`, () => {
  for (const [line, scenario] of [[1854, 'controlled-owner'], [1858, 'controlled-kept']] as const) test(`R:${line} external close preserves measured size`, async ({ page }) => {
    await page.addInitScript(() => {
      const width = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth'); const height = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
      for (const [property, original, size] of [['offsetWidth', width, 675], ['offsetHeight', height, 220]] as const) Object.defineProperty(HTMLElement.prototype, property, { configurable: true, get() { return this.getAttribute('data-testid') === 'popup-root' ? document.querySelector('[data-testid="popup-1"]')?.hasAttribute('data-open') ? size : 0 : original?.get?.call(this) ?? 0; } });
    });
    await visit(page, reference, scenario); await expect(node(page, 'popup-root')).toHaveCount(1);
    await page.evaluate(async () => { const state = window as unknown as State; state.navigationMenuAnimations = state.navigationMenuMocks.mockAnimations(document.querySelector('[data-testid="popup-root"]') as HTMLElement); state.navigationMenuAnimations.start(); await state.navigationMenuTestTransport.mutate(() => state.navigationMenuSource.setValue(null)); });
    await expect(node(page, 'popup-root')).toHaveAttribute('data-ending-style');
    expect(await values(page, 'top-level-positioner')).toEqual({ popupWidth: '675px', popupHeight: '220px', width: '675px', height: '220px' }); await finish(page);
  });
  test('R:1862 external close clears activation direction', async ({ page }) => {
    await visit(page, reference, 'controlled-owner');
    await page.evaluate(async () => { const state = window as unknown as State; for (const [id, x] of [['trigger-1', 0], ['trigger-2', 120]] as const) state.navigationMenuMocks.mockBoundingClientRect(document.querySelector(`[data-testid="${id}"]`)!, { x, y: 0, width: 80, height: 32 }); });
    await fire(node(page, 'trigger-2'), 'click'); await page.evaluate(async () => { const state = window as unknown as State; await state.navigationMenuTestTransport.mutate(() => state.navigationMenuSource.setValue('item-2')); }); await expect(node(page, 'popup-2')).toHaveAttribute('data-activation-direction', 'right');
    await page.evaluate(async () => { const state = window as unknown as State; state.navigationMenuAnimations = state.navigationMenuMocks.mockAnimations(document.querySelector('[data-testid="popup-2"]') as HTMLElement); state.navigationMenuAnimations.start(); await state.navigationMenuTestTransport.mutate(() => state.navigationMenuSource.setValue(null)); });
    await expect(node(page, 'popup-2')).toHaveAttribute('data-ending-style'); await expect(node(page, 'popup-2')).not.toHaveAttribute('data-activation-direction'); await finish(page);
  });
  test('R:2042 manual action immediately unmounts in-flight close', async ({ page }) => {
    await visit(page, reference, 'manual');
    await page.evaluate(async () => { const state = window as unknown as State; state.navigationMenuAnimations = state.navigationMenuMocks.mockAnimations(document.querySelector('[data-testid="popup-root"]') as HTMLElement); state.navigationMenuAnimations.start(); await state.navigationMenuTestTransport.mutate(() => state.navigationMenuSource.setValue(null)); });
    await expect(node(page, 'popup-root')).toHaveAttribute('data-ending-style'); await page.evaluate(async () => { const state = window as unknown as State; await state.navigationMenuTestTransport.mutate(() => state.navigationMenuSource.unmount()); }); await expect(node(page, 'popup-root')).toHaveCount(0); await finish(page);
  });
  test('R:3135 inserting inline content updates and settles size', async ({ page }) => {
    await visit(page, reference, 'dynamic', 'none'); await open(page); await fixedSize(page, 250, 120);
    await page.evaluate(async () => { const state = window as unknown as State; state.navigationMenuSize.height = 220; state.navigationMenuAnimations.start(); });
    await fire(node(page, 'insert-content'), 'click'); await expect(node(page, 'extra-content')).toHaveCount(1);
    await expect.poll(async () => parseInt(await node(page, 'positioner').evaluate(n => getComputedStyle(n).getPropertyValue('--positioner-height')), 10)).toBe(220);
    await finish(page); await expect.poll(() => values(page)).toEqual(settled);
  });
  test('R:3370 hidden kept inline content updates mutation size', async ({ page }) => {
    await visit(page, reference, 'inline-keep', 'mock'); await open(page); await fixedSize(page, 250, 220);
    await page.evaluate(async () => { const state = window as unknown as State; const popup = document.querySelector('[data-testid="popup-root"]') as HTMLElement; const positioner = document.querySelector('[data-testid="positioner"]') as HTMLElement; state.navigationMenuMocks.primeOpenPopupSize(popup, positioner, 250, 220); state.navigationMenuSize.height = 300; document.querySelector('[data-testid="nested-popup-1"]')!.setAttribute('hidden', ''); });
    await expect.poll(async () => { const v = await values(page); return [v.width, v.height]; }).toEqual(['250px', '300px']);
  });
  test('R:3308 switching kept inline content settles new size', async ({ page }) => {
    await visit(page, reference, 'inline-keep', 'mock'); await open(page); await fixedSize(page, 250, 220);
    await page.evaluate(async () => { const state = window as unknown as State; state.navigationMenuMocks.primeOpenPopupSize(document.querySelector('[data-testid="popup-root"]') as HTMLElement, document.querySelector('[data-testid="positioner"]') as HTMLElement, 250, 220); state.navigationMenuSize.height = 300; state.navigationMenuAnimations.start(); });
    await fire(node(page, 'nested-trigger-2'), 'click'); await expect(node(page, 'nested-popup-2')).not.toHaveAttribute('hidden'); await expect(node(page, 'nested-popup-1')).toHaveAttribute('hidden');
    await expect.poll(async () => parseInt(await node(page, 'positioner').evaluate(n => getComputedStyle(n).getPropertyValue('--positioner-height')), 10)).toBe(300); await finish(page);
    await expect.poll(() => values(page)).toEqual({ ...settled, height: '300px' });
  });
  test('R:3536 window resize updates without transition', async ({ page }) => {
    await visit(page, reference, 'kept-content', 'mock'); await fixedSize(page, 675, 220);
    await page.evaluate(async () => { const state = window as unknown as State & { navigationMenuTestTransport: import('../../apps/fixtures/src/lib/navigation-menu-test-transport.js').NavigationMenuTestTransport }; state.navigationMenuMocks.primeOpenPopupSize(document.querySelector('[data-testid="popup-root"]') as HTMLElement, document.querySelector('[data-testid="positioner"]') as HTMLElement, 675, 220); state.navigationMenuSize = { width: 500, height: 180 }; await state.navigationMenuTestTransport.fire(window, 'resize'); });
    await expect(node(page, 'positioner')).toHaveAttribute('data-instant'); await advance(page, 0); await expect(node(page, 'positioner')).toHaveAttribute('data-instant'); await advance(page, 100); await expect(node(page, 'positioner')).not.toHaveAttribute('data-instant');
    await expect.poll(() => values(page)).toEqual({ popupWidth: 'auto', popupHeight: 'auto', width: '500px', height: '180px' });
  });
  test('R:3587 kept trigger switches sizing immediately', async ({ page }) => {
    await visit(page, reference, 'kept-content', 'mock'); await fixedSize(page, 675, 220);
    await page.evaluate(async () => { const state = window as unknown as State; state.navigationMenuMocks.primeOpenPopupSize(document.querySelector('[data-testid="popup-root"]') as HTMLElement, document.querySelector('[data-testid="positioner"]') as HTMLElement, 675, 220); state.navigationMenuSize = { width: 500, height: 180 }; state.navigationMenuAnimations.start(); });
    await fire(node(page, 'trigger-learn'), 'click'); const v = await values(page); expect([v.width, v.height]).toEqual(['500px', '180px']); await finish(page);
    await expect.poll(() => values(page)).toEqual({ popupWidth: 'auto', popupHeight: 'auto', width: '500px', height: '180px' });
  });
  test('R:3917 temporary zero close retains auto measured size', async ({ page }) => {
    await visit(page, reference, 'dynamic'); await open(page);
    await page.evaluate(async () => { const state = window as unknown as State; const popup = document.querySelector('[data-testid="popup-root"]') as HTMLElement; const positioner = document.querySelector('[data-testid="positioner"]') as HTMLElement; state.navigationMenuMocks.primeOpenPopupSize(popup, positioner, 250, 120);
      for (const [property, size] of [['offsetWidth', 250], ['offsetHeight', 120]] as const) { Object.defineProperty(popup, property, { configurable: true, get: () => document.querySelector('[data-testid="popup-1"]')?.hasAttribute('data-open') ? size : 0 }); Object.defineProperty(positioner, property, { configurable: true, get: () => 0 }); }
    });
    await node(page, 'trigger-1').evaluate(async n => { await (window as unknown as { navigationMenuTestTransport: import('../../apps/fixtures/src/lib/navigation-menu-test-transport.js').NavigationMenuTestTransport }).navigationMenuTestTransport.fire(n, 'blur', { relatedTarget: document.body }); });
    expect(await values(page)).toEqual({ popupWidth: '250px', popupHeight: '120px', width: '250px', height: '120px' });
  });
});
