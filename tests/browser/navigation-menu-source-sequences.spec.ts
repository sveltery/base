// Actual Original Root assertion sequences at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT.
// Declaration identities and credit remain separately owned by the parity ledger.
import { expect, test, type Page } from '@playwright/test';
import { fire, input, key as keyboard, focus, advance, documentEvent, waitTransport } from './navigation-menu-transport.js';
import type { NavigationMenuTestTransport } from '../../apps/fixtures/src/lib/navigation-menu-test-transport.js';
type API = { snapshot(): { calls: { value: unknown; reason: string; type: string; canceled: boolean }[]; completions: boolean[]; actionType: string }; setValue(value: unknown): void; unmount(): void };
type State = { navigationMenuSource: API; navigationMenuTestTransport: NavigationMenuTestTransport };
async function visit(page: Page, reference: boolean, scenario = 'default', query = '') {
  if (scenario !== 'keyboard') await page.clock.install();
  await page.goto(`/navigation-menu/source?case=${scenario}${reference ? '&reference' : ''}${query}`);
  await page.waitForFunction(() => Boolean((window as unknown as { navigationMenuSource?: API }).navigationMenuSource));
  await waitTransport(page);
}
const node = (page: Page, id: string) => page.getByTestId(id);
async function dispatch(page: Page, id: string, event: string, options = {}) { await fire(node(page, id), event, options); }
async function enter(page: Page, id: string, tick = 50) { await dispatch(page, id, 'mouseenter'); await dispatch(page, id, 'mousemove'); if (tick) await advance(page, tick); }
async function styles(page: Page, id = 'trigger-1') { return node(page, id).evaluate(trigger => ({ list: (trigger.closest('ul') as HTMLElement).style.pointerEvents, body: document.body.style.pointerEvents, trigger: getComputedStyle(trigger).pointerEvents })); }
async function leaveTo(page: Page, from: string, to: string) { await fire(node(page, from), 'mouseleave', {}, to); }
async function snapshot(page: Page) { return page.evaluate(() => (window as unknown as { navigationMenuSource: API }).navigationMenuSource.snapshot()); }
for (const reference of [false, true]) test.describe(`${reference ? 'Original React' : 'native Svelte'} exact Root sequences`, () => {
  for (const [line, prefix] of [[1034, 'top-level'], [1041, 'nested']] as const) test(`R:${line} orientation attributes`, async ({ page }) => {
    await visit(page, reference, 'orientation');
    await expect(node(page, `${prefix}-root`)).not.toHaveAttribute('aria-orientation');
    await expect(node(page, `${prefix}-list`)).not.toHaveAttribute('aria-orientation');
  });
  test('R:1049 mouse hover', async ({ page }) => { await visit(page, reference); await enter(page, 'trigger-1'); await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'true'); });
  test('R:1062 top-level traversal pointer lock', async ({ page }) => {
    await visit(page, reference); await enter(page, 'trigger-1');
    await expect(node(page, 'popup-1')).toHaveCount(1);
    expect((await styles(page)).list).toBe('none'); expect((await styles(page)).body).toBe(''); expect((await styles(page, 'trigger-2')).trigger).toBe('none');
    await dispatch(page, 'top-level-positioner', 'mouseenter'); expect((await styles(page)).list).toBe('');
  });
  test('R:1084 reapply pointer lock after popup traversal and switch', async ({ page }) => {
    await visit(page, reference, 'top-link'); await enter(page, 'trigger-1');
    expect((await styles(page)).list).toBe('none'); expect((await styles(page)).body).toBe(''); expect(await node(page, 'top-level-link').evaluate(n => getComputedStyle(n).pointerEvents)).toBe('none');
    await dispatch(page, 'top-level-positioner', 'mouseenter'); expect((await styles(page)).list).toBe('');
    await leaveTo(page, 'top-level-positioner', 'trigger-1'); await enter(page, 'trigger-1', 0);
    expect((await styles(page)).list).toBe('none'); expect((await styles(page)).body).toBe(''); expect(await node(page, 'top-level-link').evaluate(n => getComputedStyle(n).pointerEvents)).toBe('none');
    await dispatch(page, 'top-level-positioner', 'mouseenter'); expect((await styles(page)).list).toBe('');
    await leaveTo(page, 'top-level-positioner', 'trigger-2'); await enter(page, 'trigger-2', 0);
    expect((await styles(page)).list).toBe('none'); expect((await styles(page)).body).toBe(''); expect(await node(page, 'top-level-link').evaluate(n => getComputedStyle(n).pointerEvents)).toBe('none');
    await expect(node(page, 'trigger-2')).toHaveAttribute('aria-expanded', 'true'); await expect(node(page, 'popup-2')).toHaveCount(1);
  });
  test('R:1133 direct hover switch pointer lock', async ({ page }) => {
    await visit(page, reference, 'top-link'); await enter(page, 'trigger-1'); await enter(page, 'trigger-2', 0);
    expect((await styles(page)).list).toBe('none'); expect((await styles(page)).body).toBe(''); expect((await styles(page)).trigger).toBe('none'); expect(await node(page, 'top-level-link').evaluate(n => getComputedStyle(n).pointerEvents)).toBe('none');
    await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'false'); await expect(node(page, 'trigger-2')).toHaveAttribute('aria-expanded', 'true'); await expect(node(page, 'popup-2')).toHaveCount(1);
  });
  test('R:1158 pointerdown releases top-level lock', async ({ page }) => { await visit(page, reference); await enter(page, 'trigger-1'); expect((await styles(page)).list).toBe('none'); await dispatch(page, 'trigger-1', 'pointerdown', { pointerType: 'mouse' }); expect((await styles(page)).list).toBe(''); });
  test('R:1221 real hover locks sibling trigger', async ({ page }) => { await visit(page, reference); await input(node(page, 'trigger-1'), 'hover'); await expect.poll(async () => (await styles(page)).list).toBe('none'); expect((await styles(page, 'trigger-2')).trigger).toBe('none'); });
  test('R:1239 dispatched mouse click', async ({ page }) => { await visit(page, reference); await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'true'); });
  test('R:1250 touch pointerenter blocks synthetic hover', async ({ page }) => { await visit(page, reference); await dispatch(page, 'trigger-1', 'pointerenter', { pointerType: 'touch' }); await enter(page, 'trigger-1'); await expect(node(page, 'popup-1')).toHaveCount(0); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'false'); });
  for (const [orientation, forward, backward] of [['horizontal', 'right', 'left'], ['vertical', 'down', 'up']] as const) test(`R:1264 ${orientation} activation directions`, async ({ page }) => {
    await visit(page, reference, 'default', `&orientation=${orientation}`);
    for (const [id, x, y] of [['trigger-1', 0, 0], ['trigger-2', orientation === 'horizontal' ? 120 : 0, orientation === 'vertical' ? 80 : 0]] as const) await node(page, id).evaluate((n, [x, y]) => { n.getBoundingClientRect = () => new DOMRect(x, y, 80, 32); }, [x, y]);
    await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'popup-1')).toHaveCount(1);
    await dispatch(page, 'trigger-2', 'click'); await expect(node(page, 'popup-2')).toHaveAttribute('data-activation-direction', forward);
    await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'popup-1')).toHaveAttribute('data-activation-direction', backward);
  });
  test('R:1303 touch click opens', async ({ page }) => { await visit(page, reference); await dispatch(page, 'trigger-1', 'pointerdown', { pointerType: 'touch' }); await dispatch(page, 'trigger-1', 'pointerup', { pointerType: 'touch' }); await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'true'); });
  for (const touch of [false, true]) test(`R:${touch ? 1460 : 1440} switch trigger ${touch ? 'touch' : 'mouse'}`, async ({ page }) => {
    await visit(page, reference); await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'true');
    if (touch) { await dispatch(page, 'trigger-2', 'pointerdown', { pointerType: 'touch' }); await dispatch(page, 'trigger-2', 'pointerup', { pointerType: 'touch' }); }
    await dispatch(page, 'trigger-2', 'click'); await expect(node(page, 'popup-1')).toHaveCount(0); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'false'); await expect(node(page, 'popup-2')).toHaveCount(1); await expect(node(page, 'trigger-2')).toHaveAttribute('aria-expanded', 'true');
  });
  test('R:1531 hover close leaves trigger unfocused', async ({ page }) => { await visit(page, reference); await enter(page, 'trigger-1'); await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'true'); await dispatch(page, 'trigger-1', 'mouseleave'); await dispatch(page, 'popup-1', 'mouseleave'); await advance(page, 50); await expect(node(page, 'popup-1')).toHaveCount(0); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'false'); await expect(node(page, 'trigger-1')).not.toBeFocused(); });
  test('R:1582 patient click threshold', async ({ page }) => { await visit(page, reference); await dispatch(page, 'trigger-1', 'click'); await advance(page, 50); await expect(node(page, 'popup-1')).toHaveCount(1); await advance(page, 500); await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'popup-1')).toHaveCount(0); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'false'); });
  test('R:1603 exact defaultValue', async ({ page }) => { await visit(page, reference, 'open'); await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'true'); });
  test('R:1657 exact callback sequence', async ({ page }) => { await visit(page, reference); await dispatch(page, 'trigger-1', 'click'); await expect.poll(async () => (await snapshot(page)).calls.map(c => c.value)).toEqual(['item-1']); await dispatch(page, 'trigger-2', 'click'); await expect.poll(async () => (await snapshot(page)).calls.map(c => c.value)).toEqual(['item-1', 'item-2']); });
  test('R:1674 canceled callback', async ({ page }) => { await visit(page, reference, 'cancel'); await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'popup-1')).toHaveCount(0); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'false'); expect((await snapshot(page)).calls).toHaveLength(1); });
  test('R:1904 custom open delay', async ({ page }) => { await visit(page, reference, 'delay'); await enter(page, 'trigger-1', 75); await expect(node(page, 'popup-1')).toHaveCount(0); await advance(page, 50); await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'true'); });
  test('R:1926 custom close delay', async ({ page }) => { await visit(page, reference, 'close-delay'); await enter(page, 'trigger-1', 50); await expect(node(page, 'popup-1')).toHaveCount(1); await dispatch(page, 'trigger-1', 'mouseleave'); await advance(page, 75); await expect(node(page, 'popup-1')).toHaveCount(1); await advance(page, 50); await expect(node(page, 'popup-1')).toHaveCount(0); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'false'); });
  for (const [line, method] of [[1953, 'hover'], [1968, 'click'], [1981, 'touch'], [1996, 'keyboard']] as const) test(`R:${line} disabled ${method}`, async ({ page }) => {
    await visit(page, reference, 'disabled');
    if (method === 'hover') await enter(page, 'trigger-1');
    else if (method === 'touch') { await dispatch(page, 'trigger-1', 'pointerdown', { pointerType: 'touch' }); await dispatch(page, 'trigger-1', 'pointerup', { pointerType: 'touch' }); await dispatch(page, 'trigger-1', 'click'); }
    else if (method === 'keyboard') { await focus(node(page, 'trigger-1')); await keyboard(page, 'ArrowDown'); }
    else await dispatch(page, 'trigger-1', 'click');
    await expect(node(page, 'popup-1')).toHaveCount(0); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'false'); expect((await snapshot(page)).calls).toEqual([]);
  });
  for (const [line, scenario] of [[2389, 'nested'], [2423, 'inline'], [2468, 'inline-closed']] as const) test(`R:${line} nested hover ownership`, async ({ page }) => {
    await visit(page, reference, scenario); await enter(page, 'trigger-1'); await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'true');
    if (scenario === 'inline-closed') await expect(node(page, 'nested-trigger-1')).toHaveAttribute('aria-expanded', 'false');
    await enter(page, 'nested-trigger-1'); await expect(node(page, 'nested-popup-1')).toHaveCount(1); await expect(node(page, 'nested-trigger-1')).toHaveAttribute('aria-expanded', 'true');
    if (scenario !== 'inline-closed') await enter(page, 'nested-popup-1', 0);
    await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'true'); await expect(node(page, 'nested-popup-1')).toHaveCount(1); await expect(node(page, 'nested-trigger-1')).toHaveAttribute('aria-expanded', 'true');
    if (scenario !== 'nested') { await enter(page, 'nested-trigger-2'); if (scenario === 'inline-closed') { await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'true'); } await expect(node(page, 'nested-popup-2')).toHaveCount(1); await expect(node(page, 'nested-trigger-2')).toHaveAttribute('aria-expanded', 'true'); if (scenario !== 'inline-closed') await expect(node(page, 'nested-trigger-1')).toHaveAttribute('aria-expanded', 'false'); }
  });
  test('R:2622 inline viewport default content', async ({ page }) => { await visit(page, reference, 'inline'); await enter(page, 'trigger-1'); await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'nested-trigger-1')).toHaveAttribute('aria-expanded', 'true'); await expect(node(page, 'nested-popup-1')).toHaveCount(1); await expect(page.getByText('Nested Link 1', { exact: true })).toHaveCount(1); });
  test('R:2642 inline viewport hover switches both directions', async ({ page }) => { await visit(page, reference, 'inline'); await enter(page, 'trigger-1'); await expect(node(page, 'nested-trigger-1')).toHaveAttribute('aria-expanded', 'true'); await expect(node(page, 'nested-popup-1')).toHaveCount(1); for (const [active, inactive] of [[2, 1], [1, 2]]) { await enter(page, `nested-trigger-${active}`); await expect(node(page, `nested-trigger-${active}`)).toHaveAttribute('aria-expanded', 'true'); await expect(node(page, `nested-trigger-${inactive}`)).toHaveAttribute('aria-expanded', 'false'); await expect(node(page, `nested-popup-${active}`)).toHaveCount(1); await expect(node(page, `nested-popup-${inactive}`)).toHaveCount(0); } });
  test('R:2869 inline viewport closes with parent', async ({ page }) => { await visit(page, reference, 'inline'); await enter(page, 'trigger-1'); await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'nested-trigger-1')).toHaveAttribute('aria-expanded', 'true'); await expect(node(page, 'nested-popup-1')).toHaveCount(1); await dispatch(page, 'trigger-1', 'mouseleave'); await dispatch(page, 'popup-1', 'mouseleave'); await advance(page, 50); await expect(node(page, 'popup-1')).toHaveCount(0); await expect(node(page, 'nested-popup-1')).toHaveCount(0); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'false'); });
  test('R:2895 inline viewport survives returning to active trigger', async ({ page }) => { await visit(page, reference, 'inline'); await enter(page, 'trigger-1'); await enter(page, 'nested-trigger-2'); await expect(node(page, 'nested-trigger-2')).toHaveAttribute('aria-expanded', 'true'); await expect(node(page, 'nested-popup-2')).toHaveCount(1); await enter(page, 'nested-popup-2', 0); await expect(node(page, 'nested-trigger-2')).toHaveAttribute('aria-expanded', 'true'); await expect(node(page, 'nested-popup-2')).toHaveCount(1); await enter(page, 'nested-trigger-2', 0); await expect(node(page, 'nested-trigger-2')).toHaveAttribute('aria-expanded', 'true'); await expect(node(page, 'nested-popup-2')).toHaveCount(1); });
  test('R:2931 inline click switching keeps active submenu open', async ({ page }) => { await visit(page, reference, 'inline'); await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'nested-trigger-1')).toHaveAttribute('aria-expanded', 'true'); for (let i = 0; i < 2; i++) { await dispatch(page, 'nested-trigger-2', 'click'); await expect(node(page, 'nested-trigger-2')).toHaveAttribute('aria-expanded', 'true'); await expect(node(page, 'nested-trigger-1')).toHaveAttribute('aria-expanded', 'false'); await expect(node(page, 'nested-popup-2')).toHaveCount(1); await expect(node(page, 'nested-popup-1')).toHaveCount(0); } });
  test('R:1690 keyboard switching callback ownership', async ({ page }) => {
    await visit(page, reference); await input(node(page, 'trigger-1'), 'click');
    expect((await snapshot(page)).calls.map(c => c.value)).toEqual(['item-1']);
    await focus(node(page, 'trigger-1')); await keyboard(page, 'ArrowRight'); await expect(node(page, 'trigger-2')).toBeFocused();
    expect((await snapshot(page)).calls.filter(c => c.value === 'item-2')).toHaveLength(0);
    await keyboard(page, 'ArrowDown'); expect((await snapshot(page)).calls.filter(c => c.value === 'item-2')).toHaveLength(1); await expect(node(page, 'trigger-2')).toHaveAttribute('aria-expanded', 'true');
  });
  for (const [label, value] of [['zero', 0], ['empty', ''], ['false', false]] as const) {
    test(`R:1716 falsy ${label}`, async ({ page }) => { await visit(page, reference, `falsy-${label}`); await dispatch(page, 'trigger-0', 'click'); expect((await snapshot(page)).calls.map(c => c.value)).toEqual([value]); await expect(node(page, 'trigger-0')).toHaveAttribute('aria-expanded', 'true'); await expect(node(page, 'popup-0')).toHaveCount(1); });
    test(`R:3000 inline falsy ${label}`, async ({ page }) => { await visit(page, reference, `inline-falsy-${label}`); await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'nested-trigger-1')).toHaveAttribute('aria-expanded', 'true'); await expect(node(page, 'nested-popup-1')).toHaveCount(1); await dispatch(page, 'nested-trigger-1', 'click'); await expect(node(page, 'nested-trigger-1')).toHaveAttribute('aria-expanded', 'true'); await expect(node(page, 'nested-popup-1')).toHaveCount(1); });
  }
  test('R:1482 Escape returns focus to trigger', async ({ page }) => { await visit(page, reference, 'focus'); await input(node(page, 'trigger-1'), 'click'); await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'trigger-1')).toBeFocused(); await keyboard(page, 'Escape'); await expect(node(page, 'popup-1')).toHaveCount(0); await expect(node(page, 'trigger-1')).toBeFocused(); });
  test('R:1506 outside click retains outside focus', async ({ page }) => { await visit(page, reference, 'focus'); await input(node(page, 'trigger-1'), 'click'); await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'trigger-1')).toBeFocused(); await input(node(page, 'last'), 'click'); await expect(node(page, 'popup-1')).toHaveCount(0); await expect(node(page, 'last')).toBeFocused(); });
  test('R:1553 focus outside stays outside', async ({ page }) => { await visit(page, reference, 'focus'); await focus(node(page, 'trigger-1')); await input(node(page, 'trigger-1'), 'click'); for (let i = 0; i < 4; i++) await keyboard(page, 'Tab'); await expect(node(page, 'popup-1')).toHaveCount(0); await expect(node(page, 'last')).toBeFocused(); await expect(node(page, 'trigger-1')).not.toBeFocused(); });
  test('R:2123 complete forward and reverse tab order', async ({ page }) => {
    await visit(page, reference, 'focus-first'); await focus(node(page, 'trigger-1')); await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'trigger-1')).toBeFocused();
    for (const text of ['Link 1', 'Link 2']) { await keyboard(page, 'Tab'); await expect(page.getByText(text, { exact: true })).toBeFocused(); }
    await keyboard(page, 'Tab'); await expect(node(page, 'trigger-2')).toBeFocused(); await dispatch(page, 'trigger-2', 'click'); await expect(node(page, 'popup-2')).toHaveCount(1);
    for (const text of ['Link 3', 'Link 4']) { await keyboard(page, 'Tab'); await expect(page.getByText(text, { exact: true })).toBeFocused(); }
    for (let i = 0; i < 3; i++) await keyboard(page, 'Shift+Tab'); await expect(node(page, 'trigger-1')).toBeFocused();
  });
  test('R:2167 tab forward out closes', async ({ page }) => { await visit(page, reference, 'focus'); await focus(node(page, 'trigger-1')); await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'trigger-1')).toBeFocused(); for (let i = 0; i < 4; i++) await keyboard(page, 'Tab'); await expect(node(page, 'popup-1')).toHaveCount(0); });
  test('R:2260 shift tab restores last submenu link', async ({ page }) => { await visit(page, reference, 'focus'); await focus(node(page, 'trigger-1')); await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'trigger-1')).toBeFocused(); for (const text of ['Link 1', 'Link 2']) { await keyboard(page, 'Tab'); await expect(page.getByText(text, { exact: true })).toBeFocused(); } await keyboard(page, 'Tab'); await expect(node(page, 'trigger-2')).toBeFocused(); await keyboard(page, 'Shift+Tab'); await expect(page.getByText('Link 2', { exact: true })).toBeFocused(); });
  test('R:2290 reverse tab out closes', async ({ page }) => { await visit(page, reference, 'focus-first'); await focus(node(page, 'trigger-1')); await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'popup-1')).toHaveCount(1); await expect(node(page, 'trigger-1')).toBeFocused(); await keyboard(page, 'Tab'); await expect(page.getByText('Link 1', { exact: true })).toBeFocused(); await keyboard(page, 'Shift+Tab'); await keyboard(page, 'Shift+Tab'); await expect(node(page, 'popup-1')).toHaveCount(0); });

  for (const [label, direction, side] of [['left in LTR', 'ltr', 'left'], ['inline-start in LTR', 'ltr', 'inline-start'], ['inline-end in RTL', 'rtl', 'inline-end']] as const) test(`R:2082 ${label} popup origin`, async ({ page }) => {
    await visit(page, reference, 'side', `&direction=${direction}&side=${side}`); await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'popup-root')).toHaveAttribute('data-side', side);
    expect(await node(page, 'popup-root').evaluate(n => { const style = (n as HTMLElement).style; return { position: style.position, top: style.top, right: style.right }; })).toEqual({ position: 'absolute', top: '0px', right: '0px' });
  });
  for (const key of ['ArrowDown', 'Enter', 'Space']) test(`T:200 ${key} keeps Trigger focus`, async ({ page }) => {
    await visit(page, reference, 'keyboard'); const trigger = page.getByRole('button', { name: 'Overview' }); await focus(trigger); await keyboard(page, key); await expect(page.getByRole('link', { name: 'Quick Start' })).toBeVisible(); await page.evaluate(() => new Promise(requestAnimationFrame)); await expect(trigger).toBeFocused();
  });
  for (const [placement, vx, vy, lx, ly, tx, ty] of [['right', 120, 0, 100, 50, 110, 50], ['left', -120, 0, 0, 50, -10, 50], ['bottom', 0, 120, 50, 100, 50, 110], ['top', 0, -120, 50, 0, 50, -10]] as const) test(`R:2719 inline traversal ${placement}`, async ({ page }) => {
    await visit(page, reference, 'inline-closed'); await enter(page, 'trigger-1');
    await node(page, 'nested-trigger-1').evaluate(n => { n.getBoundingClientRect = () => new DOMRect(0, 0, 100, 100); });
    await node(page, 'inline-nested-viewport').evaluate((n, [x, y]) => { n.getBoundingClientRect = () => new DOMRect(x, y, 100, 100); }, [vx, vy]);
    await enter(page, 'nested-trigger-1'); await expect(node(page, 'nested-trigger-1')).toHaveAttribute('aria-expanded', 'true'); expect(await node(page, 'inline-nested-list').evaluate(n => (n as HTMLElement).style.pointerEvents)).toBe('none');
    await dispatch(page, 'nested-trigger-1', 'mouseleave', { clientX: lx, clientY: ly });
    await documentEvent(page, 'mousemove', { clientX: tx, clientY: ty });
    expect(await node(page, 'inline-nested-list').evaluate(n => (n as HTMLElement).style.pointerEvents)).toBe('none'); await advance(page, 50);
    await expect(node(page, 'nested-trigger-1')).toHaveAttribute('aria-expanded', 'true'); await expect(node(page, 'nested-popup-1')).toHaveCount(1);
  });
  for (const [line, inside] of [[2679, true], [2782, false]] as const) test(`R:${line} inline pointer scope and exit`, async ({ page }) => {
    await visit(page, reference, 'inline'); await enter(page, 'trigger-1');
    await node(page, 'nested-trigger-1').evaluate(n => { n.getBoundingClientRect = () => new DOMRect(0, 40, 100, 40); });
    await node(page, 'inline-nested-viewport').evaluate(n => { n.getBoundingClientRect = () => new DOMRect(200, 0, 300, 300); });
    await dispatch(page, 'nested-trigger-1', 'mouseenter'); expect(await node(page, 'inline-nested-list').evaluate(n => (n as HTMLElement).style.pointerEvents)).toBe('none');
    await dispatch(page, 'nested-trigger-1', 'mouseleave', { clientX: 98, clientY: 60 }); expect(await node(page, 'inline-nested-list').evaluate(n => (n as HTMLElement).style.pointerEvents)).toBe('none');
    if (inside) expect(await page.evaluate(() => document.body.style.pointerEvents)).toBe('');
    await documentEvent(page, 'mousemove', inside ? { clientX: 150, clientY: 80 } : { clientX: 40, clientY: 220 });
    if (inside) expect(await node(page, 'inline-nested-list').evaluate(n => (n as HTMLElement).style.pointerEvents)).toBe('none');
    else expect(await node(page, 'inline-nested-list').evaluate(n => (n as HTMLElement).style.pointerEvents)).toBe('');
    await expect(node(page, 'nested-trigger-1')).toHaveAttribute('aria-expanded', 'true'); await expect(node(page, 'nested-popup-1')).toHaveCount(1);
    if (inside) { await dispatch(page, 'inline-nested-viewport', 'mouseenter'); expect(await node(page, 'inline-nested-list').evaluate(n => (n as HTMLElement).style.pointerEvents)).toBe(''); }
  });

  test('R:1316 hover returns after touch and outside close', async ({ page }) => {
    await visit(page, reference, 'touch-outside');
    for (const event of ['pointerenter', 'pointerdown', 'pointerup']) await dispatch(page, 'trigger-1', event, { pointerType: 'touch' });
    await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'popup-1')).toHaveCount(1);
    await input(node(page, 'outside'), 'click'); await expect(node(page, 'popup-1')).toHaveCount(0);
    await input(node(page, 'trigger-2'), 'hover'); await expect(node(page, 'popup-2')).toHaveCount(1);
  });
  test('R:1346 hover returns after nested touch and outside close', async ({ page }) => {
    await visit(page, reference, 'inline-outside');
    for (const id of ['trigger-1', 'nested-trigger-2']) {
      for (const event of ['pointerenter', 'pointerdown', 'pointerup']) await dispatch(page, id, event, { pointerType: 'touch' });
      await dispatch(page, id, 'click');
    }
    await expect(node(page, 'nested-popup-2')).toHaveCount(1);
    await input(node(page, 'outside'), 'click'); await expect(node(page, 'popup-1')).toHaveCount(0);
    await input(node(page, 'trigger-1'), 'hover'); await expect(node(page, 'popup-1')).toHaveCount(1);
  });
  test('R:1385 hover returns after quick click and switch', async ({ page }) => {
    await visit(page, reference); await input(node(page, 'trigger-1'), 'hover'); await expect(node(page, 'popup-1')).toHaveCount(1);
    await input(node(page, 'trigger-1'), 'click'); await input(node(page, 'trigger-2'), 'hover'); await expect(node(page, 'popup-2')).toHaveCount(1);
    await input(node(page, 'trigger-2'), 'unhover'); await expect(node(page, 'popup-2')).toHaveCount(0);
    await input(node(page, 'trigger-1'), 'hover'); await expect(node(page, 'popup-1')).toHaveCount(1);
  });
  test('R:1418 pointerdown on hover-open link then leave closes', async ({ page }) => {
    await visit(page, reference); await input(node(page, 'trigger-1'), 'hover'); await expect(node(page, 'popup-1')).toHaveCount(1);
    const link = page.getByRole('link', { name: 'Link 1', exact: true }); await input(link, 'hover');
    await fire(link, 'pointerdown', { pointerType: 'mouse' }); await input(link, 'unhover');
    await expect(node(page, 'popup-1')).toHaveCount(0);
  });
  test('R:1752 controlled owner selects active value', async ({ page }) => {
    await visit(page, reference, 'controlled-owner'); await enter(page, 'trigger-1');
    await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'true');
    await page.evaluate(async () => { const state = window as unknown as State; await state.navigationMenuTestTransport.mutate(() => state.navigationMenuSource.setValue('item-2')); });
    await dispatch(page, 'trigger-1', 'mouseleave'); await enter(page, 'trigger-2', 0);
    await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'false'); await expect(node(page, 'trigger-2')).toHaveAttribute('aria-expanded', 'true');
  });
  test('R:2016 actual action defers unmount', async ({ page }) => {
    await visit(page, reference, 'manual'); expect((await snapshot(page)).actionType).toBe('function'); await expect(node(page, 'popup-root')).toHaveCount(1);
    await page.evaluate(async () => { const state = window as unknown as State; await state.navigationMenuTestTransport.mutate(() => state.navigationMenuSource.setValue(null)); }); await expect(node(page, 'popup-root')).toHaveCount(1);
    await page.evaluate(async () => { const state = window as unknown as State; await state.navigationMenuTestTransport.mutate(() => state.navigationMenuSource.unmount()); }); await expect(node(page, 'popup-root')).toHaveCount(0);
  });
  test('R:2503 nested delayed hover close closes parent', async ({ page }) => {
    await visit(page, reference, 'nested-close-delay'); await enter(page, 'trigger-1'); await expect(node(page, 'popup-1')).toHaveCount(1);
    await enter(page, 'nested-trigger-1'); await expect(node(page, 'nested-popup-1')).toHaveCount(1);
    for (const id of ['nested-trigger-1', 'nested-positioner', 'top-level-positioner']) await dispatch(page, id, 'mouseleave');
    await advance(page, 200); await expect(node(page, 'nested-popup-1')).toHaveCount(0); await expect(node(page, 'popup-1')).toHaveCount(0); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'false');
  });
  for (const line of [2538, 2568]) test(`R:${line} nested closeOnClick propagation`, async ({ page }) => {
    await visit(page, reference, 'nested-close'); await input(node(page, 'trigger-1'), 'click'); await expect(node(page, 'popup-1')).toHaveCount(1);
    await enter(page, 'nested-trigger-1'); if (line === 2538) await expect(node(page, 'nested-popup-1')).toHaveCount(1);
    await input(node(page, 'nested-link-1'), 'click');
    if (line === 2568) await expect.poll(async () => (await snapshot(page)).calls.at(-1)?.value).toBe(null);
    else { await expect(node(page, 'nested-popup-1')).toHaveCount(0); await expect(node(page, 'popup-1')).toHaveCount(0); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'false'); }
  });
  test('R:2597 deep closeOnClick closes all levels', async ({ page }) => {
    await visit(page, reference, 'deep-close'); await input(node(page, 'trigger-1'), 'click'); await expect(node(page, 'content-1')).toHaveCount(1);
    await expect(node(page, 'level2-content-1')).toHaveCount(1); await expect(node(page, 'level3-content-1')).toHaveCount(1);
    await input(node(page, 'level3-link-1'), 'click'); for (const id of ['level3-content-1', 'level2-content-1', 'content-1']) await expect(node(page, id)).toHaveCount(0);
    await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'false');
  });
  test('R:2815 inline traversal restores original trigger lock', async ({ page }) => {
    await visit(page, reference, 'inline'); await enter(page, 'trigger-1');
    for (const [id, x, y, w, h] of [['nested-trigger-1', 0, 40, 100, 40], ['nested-trigger-2', 0, 100, 100, 40], ['inline-nested-viewport', 200, 0, 300, 300]] as const) await node(page, id).evaluate((n, [x, y, w, h]) => { n.getBoundingClientRect = () => new DOMRect(x, y, w, h); }, [x, y, w, h]);
    const traverse = async () => { await dispatch(page, 'nested-trigger-1', 'mouseleave', { clientX: 98, clientY: 60 }); await documentEvent(page, 'mousemove', { clientX: 150, clientY: 80 }); };
    await dispatch(page, 'nested-trigger-1', 'mouseenter'); await traverse(); await dispatch(page, 'inline-nested-viewport', 'mouseenter');
    await enter(page, 'nested-trigger-2'); await enter(page, 'nested-trigger-1');
    expect(await node(page, 'inline-nested-list').evaluate(n => (n as HTMLElement).style.pointerEvents)).toBe('none'); await traverse();
    expect(await node(page, 'inline-nested-list').evaluate(n => (n as HTMLElement).style.pointerEvents)).toBe('none');
    await expect(node(page, 'nested-trigger-1')).toHaveAttribute('aria-expanded', 'true'); await expect(node(page, 'nested-trigger-2')).toHaveAttribute('aria-expanded', 'false');
    await expect(node(page, 'nested-popup-1')).toHaveCount(1); await expect(node(page, 'nested-popup-2')).toHaveCount(0);
  });
  test('R:3027 falsy nested close propagates to parent', async ({ page }) => {
    await visit(page, reference, 'inline-falsy-close'); await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'nested-trigger-1')).toHaveAttribute('aria-expanded', 'true');
    await fire(page.getByRole('link', { name: 'Nested Link 1', exact: true }), 'click'); await expect(node(page, 'trigger-1')).toHaveAttribute('aria-expanded', 'false'); await expect(node(page, 'popup-1')).toHaveCount(0);
  });
  test('R:3051 arrow navigation across inline submenu triggers', async ({ page }) => {
    await visit(page, reference, 'inline'); await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'popup-1')).toHaveCount(1);
    const link = page.getByRole('link', { name: 'Link 1', exact: true }); await focus(link);
    for (const [key, target] of [['ArrowDown', node(page, 'nested-trigger-1')], ['ArrowDown', node(page, 'nested-trigger-2')], ['ArrowUp', node(page, 'nested-trigger-1')], ['ArrowUp', link]] as const) { await keyboard(page, key); await expect(target).toBeFocused(); }
  });
  test('R:3085 arrow navigation across three levels', async ({ page }) => {
    await visit(page, reference, 'deep'); await dispatch(page, 'trigger-1', 'click'); await expect(node(page, 'content-1')).toHaveCount(1);
    for (const [linkId, first, second] of [['link-1', 'level2-trigger-1', 'level2-trigger-2'], ['level2-link-1', 'level3-trigger-1', 'level3-trigger-2']]) {
      await focus(node(page, linkId));
      for (const [key, id] of [['ArrowDown', first], ['ArrowDown', second], ['ArrowUp', first], ['ArrowUp', linkId]]) { await keyboard(page, key); await expect(node(page, id)).toBeFocused(); }
    }
  });
  test('R:3955 tab leaves last inline panel for next top-level trigger', async ({ page }) => {
    await visit(page, reference, 'tab-boundary'); await input(node(page, 'trigger-1'), 'click'); await focus(node(page, 'nested-last-link')); await expect(node(page, 'nested-last-link')).toBeFocused();
    await keyboard(page, 'Tab'); await expect(node(page, 'trigger-2')).toBeFocused(); await expect(node(page, 'nested-popup-2')).toHaveCount(1); await expect(node(page, 'nested-trigger-2')).toHaveAttribute('aria-expanded', 'true');
  });
  test('R:3973 tab respects inactive inline panels', async ({ page }) => {
    await visit(page, reference, 'tab-flow'); await input(node(page, 'trigger-product'), 'click'); await focus(node(page, 'nested-trigger-developers')); await expect(node(page, 'nested-trigger-developers')).toBeFocused();
    for (const [key, id] of [['Tab', 'nested-link-get-started'], ['Shift+Tab', 'nested-trigger-developers'], ['Tab', 'nested-link-get-started'], ['Tab', 'nested-link-composition'], ['Tab', 'nested-trigger-design-systems']]) { await keyboard(page, key); await expect(node(page, id)).toBeFocused(); }
    await expect(node(page, 'nested-popup-design-systems')).toHaveCount(0); await keyboard(page, 'Tab'); await expect(page.getByText('Engineering Leads', { exact: true })).toBeFocused();
  });
  test('R:4004 reverse tab returns to last inline submenu link', async ({ page }) => {
    await visit(page, reference, 'tab-flow'); await input(node(page, 'trigger-product'), 'click');
    for (const id of ['nested-trigger-developers', 'nested-link-get-started', 'nested-link-composition', 'nested-trigger-design-systems']) { await keyboard(page, 'Tab'); await expect(node(page, id)).toBeFocused(); }
    await keyboard(page, 'Shift+Tab'); await expect(node(page, 'nested-link-composition')).toBeFocused();
  });
  test('T:167 vertical RTL mirrored activation key', async ({ page }) => {
    await visit(page, reference, 'keyboard', '&direction=rtl&orientation=vertical'); const trigger = page.getByRole('button', { name: 'Overview' }); await focus(trigger); await keyboard(page, 'ArrowLeft'); await expect(page.getByRole('link', { name: 'Quick Start' })).toBeVisible();
  });

});
