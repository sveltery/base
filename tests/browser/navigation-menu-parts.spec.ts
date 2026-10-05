// Exact selected Original part assertions at immutable 47b40521; MIT.
import { expect, test, type Page } from '@playwright/test';
import { fire, input, key, focus, advance, waitTransport } from './navigation-menu-transport.js';
import type { NavigationMenuTestTransport } from '../../apps/fixtures/src/lib/navigation-menu-test-transport.js';
type State = { navigationMenuTestTransport: NavigationMenuTestTransport; navigationMenuParts: { removeFirst(): void; navigate(): void } };
async function visit(page: Page, reference: boolean, scenario: string, hydrate = false) {
  if (['custom-list', 'arbitrary', 'no-viewport', 'icons'].includes(scenario)) await page.clock.install();
  await page.addInitScript(() => {
    (globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean }).BASE_UI_ANIMATIONS_DISABLED = true;
  });
  await page.goto(`/navigation-menu/parts?case=${scenario}${reference ? '&reference' : ''}${hydrate ? '&hydrate' : ''}`);
  await page.waitForFunction(() => Boolean((window as unknown as { navigationMenuParts?: unknown }).navigationMenuParts));
  await waitTransport(page);
}
const node = (page: Page, id: string) => page.getByTestId(id);
for (const reference of [false, true]) test.describe(`${reference ? 'Original React' : 'native Svelte'} exact parts`, () => {
  for (const [line, kept] of [[30, true], [55, false]] as const) test(`C:${line} actual SSR content count`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      await page.goto(`/navigation-menu/parts?case=content-${kept ? 'kept' : 'unkept'}&hydrate${reference ? '&reference' : ''}`);
      await expect(node(page, 'content-1')).toHaveCount(kept ? 1 : 0);
    } finally { await context.close(); }
  });
  for (const [line, kept] of [[81, true], [107, false]] as const) test(`C:${line} actual SSR hydration content count`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => { errors.push(error.message); });
    page.on('console', message => { if (message.type() === 'error' || /hydration/i.test(message.text())) errors.push(message.text()); });
    await visit(page, reference, `content-${kept ? 'kept' : 'unkept'}`, true);
    await expect(node(page, 'content-1')).toHaveCount(kept ? 1 : 0);
    if (kept) await expect(node(page, 'content-1')).toHaveAttribute('hidden');
    expect(errors).toEqual([]);
  });
  test('C:132 both moved contents remain in viewport', async ({ page }) => {
    await visit(page, reference, 'content-move'); await fire(page.getByRole('button', { name: 'Item 1' }), 'click');
    await expect(node(page, 'viewport')).toHaveCount(1);
    expect(await node(page, 'viewport').evaluate(n => n.contains(document.querySelector('[data-testid="content-1"]')))).toBe(true);
    expect(await node(page, 'list').evaluate(n => n.contains(document.querySelector('[data-testid="content-1"]')))).toBe(false);
    await fire(page.getByRole('button', { name: 'Item 2' }), 'click'); await expect(node(page, 'content-2')).toHaveCount(1);
    expect(await node(page, 'viewport').evaluate(n => ['content-1', 'content-2'].every(id => n.contains(document.querySelector(`[data-testid="${id}"]`))))).toBe(true);
  });
  test('C:185 kept portal retains hidden content inside viewport', async ({ page }) => {
    await visit(page, reference, 'content-close'); await input(page.getByRole('button', { name: 'Item 1' }), 'click');
    expect(await node(page, 'viewport').evaluate(n => n.contains(document.querySelector('[data-testid="content-1"]')))).toBe(true);
    await key(page, 'Escape'); await expect(node(page, 'content-1')).toHaveAttribute('hidden');
    expect(await node(page, 'viewport').evaluate(n => n.contains(document.querySelector('[data-testid="content-1"]')))).toBe(true);
  });
  for (const [line, close] of [[21, true], [61, false]] as const) test(`L:${line} Source DOM-only closeOnClick protocol browser candidate`, async ({ page }) => {
    await visit(page, reference, close ? 'link-close' : 'link-keep'); await input(node(page, 'trigger-1'), 'click');
    await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'true');
    await input(page.getByRole('link', { name: 'Link 1' }), 'click'); await expect(node(page, 'popup-1')).toHaveCount(close ? 0 : 1);
    await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', close ? 'false' : 'true');
  });
  for (const [line, active] of [[103, true], [118, false]] as const) test(`L:${line} active aria-current`, async ({ page }) => {
    await visit(page, reference, active ? 'link-active' : 'link-inactive');
    const link = page.getByRole('link', { name: active ? 'active' : 'inactive' });
    if (active) await expect(link).toHaveAttribute('aria-current', 'page'); else await expect(link).not.toHaveAttribute('aria-current');
  });
  test('L:134 null-related-target blur retains open content', async ({ page }) => {
    await visit(page, reference, 'link-blur'); const trigger = page.getByRole('button', { name: 'Item 1' }); await input(trigger, 'click');
    const link = page.getByRole('link', { name: 'Link 1' }); await expect(link).toHaveCount(1);
    await fire(link, 'focus'); await fire(link, 'blur', { relatedTarget: null });
    await expect(link).toHaveCount(1); await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
  test('List:29 selected vertical keys stop propagation', async ({ page }) => {
    await visit(page, reference, 'list-keys'); const trigger = page.getByRole('button', { name: 'Item', exact: true }); await focus(trigger);
    for (const key of ['ArrowUp', 'ArrowDown']) await fire(trigger, 'keydown', { key });
    const keys = () => page.evaluate(() => (window as unknown as { navigationMenuParts: { snapshot(): { keys: string[] } } }).navigationMenuParts.snapshot().keys);
    expect(await keys()).toHaveLength(0); await fire(trigger, 'keydown', { key: 'PageDown' }); expect(await keys()).toHaveLength(1);
  });
  test('R:1175 custom list scopes pointer lock to document', async ({ page }) => {
    await visit(page, reference, 'custom-list');
    const trigger = page.getByText('Trigger 1', { exact: true }); await fire(trigger, 'mouseenter'); await fire(trigger, 'mousemove'); await advance(page, 50);
    expect(await page.evaluate(() => document.body.style.pointerEvents)).toBe('none'); expect(await node(page, 'custom-list').evaluate(n => (n as HTMLElement).style.pointerEvents)).toBe('');
    await fire(trigger, 'pointerdown', { pointerType: 'mouse' }); expect(await page.evaluate(() => document.body.style.pointerEvents)).toBe('');
    const second = page.getByText('Trigger 2', { exact: true }); await fire(second, 'mouseenter'); await expect(second).toHaveAttribute('aria-expanded', 'true');
    expect(await page.evaluate(() => document.body.style.pointerEvents)).toBe('none'); await fire(second, 'pointerdown', { pointerType: 'mouse' }); expect(await page.evaluate(() => document.body.style.pointerEvents)).toBe('');
  });
  test('R:2192 arbitrary button tabbing closes after leaving', async ({ page }) => {
    await visit(page, reference, 'arbitrary'); const trigger = page.getByText('Trigger', { exact: true }); await focus(trigger); await fire(trigger, 'click');
    await key(page, 'Tab'); await expect(page.getByText('Action', { exact: true })).toBeFocused(); await key(page, 'Tab'); await expect(page.getByText('After menu', { exact: true })).toBeFocused();
    await expect(node(page, 'popup')).toHaveCount(0); await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
  test('R:2230 missing viewport guard restores trigger focus', async ({ page }) => {
    await visit(page, reference, 'no-viewport'); const trigger = page.getByText('Trigger', { exact: true }); await focus(trigger); await fire(trigger, 'click');
    await trigger.evaluate(n => (n.parentElement?.querySelectorAll('[data-base-ui-focus-guard]')[1] as HTMLElement).focus());
    await expect(trigger).toBeFocused(); await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
  test('R:2962 popup-open icon attribute follows active item', async ({ page }) => {
    await visit(page, reference, 'icons'); await expect(node(page, 'icon-1')).toHaveAttribute('data-popup-open'); await expect(node(page, 'icon-2')).not.toHaveAttribute('data-popup-open');
  });
  test('T:619 hover sweep releases lock without opening', async ({ page }) => {
    await visit(page, reference, 'sweep'); await input(page.getByRole('button', { name: 'A', exact: true }), 'pointer', { pointerEventsCheck: 0 }); await input(page.locator('body'), 'pointer', { pointerEventsCheck: 0 });
    await expect.poll(async () => node(page, 'list').evaluate(n => (n as HTMLElement).style.pointerEvents)).toBe(''); await expect(page.getByRole('link', { name: 'A link' })).toHaveCount(0);
  });
  test('List:77 item removal keeps navigation based on focused trigger', async ({ page }) => {
    await visit(page, reference, 'list-removal'); await focus(node(page, 'first'));
    await fire(node(page, 'first'), 'keydown', { key: 'ArrowRight' }); await fire(node(page, 'middle'), 'keydown', { key: 'ArrowRight' }); await expect(node(page, 'last')).toBeFocused();
    await page.evaluate(async () => { const state = window as unknown as State; await state.navigationMenuTestTransport.mutate(() => state.navigationMenuParts.removeFirst()); }); await expect(node(page, 'first')).toHaveCount(0);
    await fire(node(page, 'last'), 'keydown', { key: 'ArrowLeft' }); await expect(node(page, 'middle')).toBeFocused();
  });
  test('T:138 data-disabled only follows disabled state', async ({ page }) => {
    await visit(page, reference, 'trigger-enable'); await expect(node(page, 'trigger')).toHaveAttribute('data-disabled', '');
    await fire(page.getByText('enable', { exact: true }), 'click'); await expect(node(page, 'trigger')).not.toHaveAttribute('data-disabled');
  });
  test('T:580 dropping open trigger releases list pointer lock', async ({ page }) => {
    await visit(page, reference, 'drop-trigger'); await input(page.getByRole('button', { name: 'A', exact: true }), 'pointer', { pointerEventsCheck: 0 }); await expect(page.getByRole('link', { name: 'A link' })).toBeVisible();
    await expect.poll(async () => node(page, 'list').evaluate(n => (n as HTMLElement).style.pointerEvents)).toBe('none');
    await page.evaluate(async () => { const state = window as unknown as State; await state.navigationMenuTestTransport.mutate(() => state.navigationMenuParts.navigate()); });
    await expect.poll(async () => node(page, 'list').evaluate(n => (n as HTMLElement).style.pointerEvents)).toBe('');
  });
  test('R:1614 kept portal opening suppresses popup and arrow transitions', async ({ page }) => {
    await visit(page, reference, 'kept-transitions');
    const opening = await page.evaluate(async () => {
      const state = window as unknown as State;
      await state.navigationMenuTestTransport.fire(document.querySelector('[data-testid="trigger-1"]')!, 'click');
      return ['popup-root', 'arrow'].map(id => getComputedStyle(document.querySelector(`[data-testid="${id}"]`)!).transition);
    });
    expect(opening).toEqual(['none', 'none']);
    await expect.poll(async () => node(page, 'popup-root').evaluate(n => getComputedStyle(n).transition)).not.toBe('none');
    expect(await node(page, 'arrow').evaluate(n => getComputedStyle(n).transition)).not.toBe('none');
  });
  test('T:238 focus and positioner height follow switched content', async ({ page }) => {
    await visit(page, reference, 'trigger-height');
    const overview = page.getByRole('button', { name: 'Overview' });
    const handbook = page.getByRole('button', { name: 'Handbook' });
    const heightDifference = (expected: number) => node(page, 'positioner').evaluate((n, expected) => Math.abs(parseInt(getComputedStyle(n).getPropertyValue('--positioner-height'), 10) - expected), expected);
    await focus(overview); await key(page, 'ArrowDown');
    await expect.poll(() => heightDifference(18)).toBeLessThanOrEqual(1);
    await expect(overview).toBeFocused(); await key(page, 'Tab'); await expect(page.getByRole('link', { name: 'Quick Start' })).toBeFocused();
    await key(page, 'Shift+Tab'); await expect(overview).toBeFocused(); await key(page, 'ArrowRight'); await expect(handbook).toBeFocused();
    await key(page, 'ArrowDown'); await expect.poll(() => heightDifference(36)).toBeLessThanOrEqual(1); await expect(handbook).toBeFocused();
    await key(page, 'Tab'); await expect(page.getByRole('link', { name: 'Styling Base UI components' })).toBeFocused();
    await key(page, 'Shift+Tab'); await expect(handbook).toBeFocused(); await key(page, 'ArrowLeft'); await expect(overview).toBeFocused();
    await key(page, 'ArrowDown'); await expect.poll(() => heightDifference(18)).toBeLessThanOrEqual(1); await expect(overview).toBeFocused();
  });
  test('T:354 rapid pointer array retains exact positioner width', async ({ page }) => {
    await visit(page, reference, 'trigger-width');
    await page.evaluate(async () => {
      const buttons = [...document.querySelectorAll('button')];
      const noContentButton = buttons.find(n => n.textContent === 'noContent')!;
      const withContentButton = buttons.find(n => n.textContent === 'withContent')!;
      await (window as unknown as State).navigationMenuTestTransport.pointer([
        { target: withContentButton },
        { target: noContentButton, releasePrevious: true },
        { target: withContentButton, releasePrevious: true },
      ]);
    });
    await expect(page.getByRole('link', { name: 'Styling Base UI components' })).toBeVisible();
    await expect.poll(() => node(page, 'positioner').evaluate(n => Math.abs(parseInt(getComputedStyle(n).getPropertyValue('--positioner-width'), 10) - 183))).toBeLessThanOrEqual(1);
  });
  test('T:404 hover switch repositions beyond twenty pixels', async ({ page }) => {
    await visit(page, reference, 'trigger-reposition');
    await input(page.getByRole('button', { name: 'Overview' }), 'pointer', { pointerEventsCheck: 0 });
    await expect(page.getByRole('link', { name: 'Overview Link' })).toBeVisible();
    const firstLeft = await node(page, 'positioner').evaluate(n => n.getBoundingClientRect().left);
    await input(page.getByRole('button', { name: 'Handbook' }), 'pointer', { releasePrevious: true, pointerEventsCheck: 0 });
    await expect(page.getByRole('link', { name: 'Handbook Link' })).toBeVisible();
    await expect.poll(() => node(page, 'positioner').evaluate((n, firstLeft) => Math.abs(n.getBoundingClientRect().left - firstLeft), firstLeft)).toBeGreaterThan(20);
  });
});
