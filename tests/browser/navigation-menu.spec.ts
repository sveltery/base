// Source assertion candidates from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: parity/navigation-menu/UPSTREAM_LICENSE. The separate ledger owns declaration credit.
import { expect, test, type Page } from '@playwright/test';
type FixtureAPI = { snapshot(): { calls: { value: unknown; reason: string; type: string; canceled: boolean }[]; completions: boolean[] }; setValue(value: unknown): void; removeFirst(): void; removeRoot(): void; setContent(text: string): void; unmount(): void };
async function visit(page: Page, reference: boolean, scenario = 'default', query = '') {
  const failures: string[] = [];
  page.on('pageerror', error => failures.push(error.message));
  await page.goto(`/navigation-menu?case=${scenario}${reference ? '&reference' : ''}${query}`);
  await page.waitForFunction(() => Boolean((window as unknown as { navigationMenuFixture?: FixtureAPI }).navigationMenuFixture));
  expect(failures).toEqual([]);
}
async function snapshot(page: Page) {
  return page.evaluate(() => (window as unknown as { navigationMenuFixture: FixtureAPI }).navigationMenuFixture.snapshot());
}
async function owner(page: Page, value: unknown) {
  await page.evaluate(value => (window as unknown as { navigationMenuFixture: FixtureAPI }).navigationMenuFixture.setValue(value), value);
}
for (const reference of [false, true]) {
  test.describe(reference ? 'Original React' : 'native Svelte', () => {
    test('R:1034 does not apply aria-orientation to the top-level list or root', async ({ page }) => {
      await visit(page, reference);
      await expect(page.locator('#tested-root')).not.toHaveAttribute('aria-orientation');
      await expect(page.locator('#tested-list')).not.toHaveAttribute('aria-orientation');
    });
    test('R:1049 opens on hover with mouse input', async ({ page }) => {
      await visit(page, reference);
      await page.locator('#first-trigger').hover();
      await expect(page.locator('#tested-popup')).toBeVisible();
      await expect(page.locator('#first-trigger')).toHaveAttribute('aria-expanded', 'true');
    });
    test('R:1239 opens on click with mouse input', async ({ page }) => {
      await visit(page, reference);
      await page.locator('#first-trigger').click();
      await expect(page.locator('#tested-popup')).toBeVisible();
      await expect(page.locator('#first-trigger')).toHaveAttribute('aria-expanded', 'true');
    });
    test('R:1440 does not close the menu when clicking a different mouse trigger', async ({ page }) => {
      await visit(page, reference);
      await page.locator('#first-trigger').click();
      await expect(page.locator('#first-content')).toBeVisible();
      await page.locator('#second-trigger').click();
      await expect(page.locator('#second-trigger')).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('#second-content')).toBeVisible();
      await expect(page.locator('#tested-popup')).toBeVisible();
    });
    test('R:1603 respects defaultValue', async ({ page }) => {
      await visit(page, reference, 'open');
      await expect(page.locator('#first-trigger')).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('#tested-popup')).toBeVisible();
    });
    test('R:1657 calls onValueChange when value changes', async ({ page }) => {
      await visit(page, reference);
      await page.locator('#first-trigger').click();
      await expect.poll(async () => (await snapshot(page)).calls.map(call => call.value)).toEqual(['first']);
      await page.locator('#second-trigger').click();
      await expect.poll(async () => (await snapshot(page)).calls.map(call => call.value)).toEqual(['first', 'second']);
    });
    test('R:1674 cancellation prevents opening', async ({ page }) => {
      await visit(page, reference, 'cancel');
      await page.locator('#first-trigger').click();
      await expect(page.locator('#first-trigger')).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('#tested-popup')).toHaveCount(0);
      expect((await snapshot(page)).calls[0].canceled).toBe(true);
    });
    test('R:1690 keyboard switching emits no duplicate value callback', async ({ page }) => {
      await visit(page, reference);
      await page.locator('#first-trigger').click();
      await expect(page.locator('#first-content')).toBeVisible();
      expect((await snapshot(page)).calls.map(call => call.value)).toEqual(['first']);
      await page.locator('#first-trigger').focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#second-trigger')).toBeFocused();
      expect((await snapshot(page)).calls.filter(call => call.value === 'second')).toHaveLength(0);
      await page.keyboard.press('ArrowDown');
      await expect(page.locator('#second-content')).toBeVisible();
      expect((await snapshot(page)).calls.filter(call => call.value === 'second')).toHaveLength(1);
      await expect(page.locator('#second-trigger')).toHaveAttribute('aria-expanded', 'true');
    });
    for (const [scenario, value] of [['zero', 0], ['false', false], ['empty', '']] as const) {
      test(`R:1716 valid falsy value ${scenario}`, async ({ page }) => {
        await visit(page, reference, scenario);
        await page.locator('#first-trigger').click();
        await expect(page.locator('#first-trigger')).toHaveAttribute('aria-expanded', 'true');
        await expect(page.locator('#first-content')).toBeVisible();
        expect((await snapshot(page)).calls[0].value).toBe(value);
      });
    }
    test('R:1752 controlled value follows the owner', async ({ page }) => {
      await visit(page, reference, 'controlled');
      await owner(page, 'first');
      await expect(page.locator('#first-content')).toBeVisible();
      await owner(page, 'second');
      await expect(page.locator('#second-content')).toBeVisible();
      await owner(page, null);
      await expect(page.locator('#tested-popup')).toHaveCount(0);
    });
    test('R:1968 disabled trigger does not open on click', async ({ page }) => {
      await visit(page, reference, 'disabled');
      await page.locator('#first-trigger').click();
      await expect(page.locator('#tested-popup')).toHaveCount(0);
      expect((await snapshot(page)).calls).toEqual([]);
    });
    test('R:1996 disabled trigger does not open via keyboard', async ({ page }) => {
      await visit(page, reference, 'disabled');
      await page.locator('#first-trigger').focus();
      await page.keyboard.press('ArrowDown');
      await expect(page.locator('#tested-popup')).toHaveCount(0);
      expect((await snapshot(page)).calls).toEqual([]);
    });
    test('R:2016 action defers unmount until called', async ({ page }) => {
      await visit(page, reference, 'manual');
      await owner(page, null);
      await expect(page.locator('#first-trigger')).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('#tested-popup')).toHaveCount(1);
      expect((await snapshot(page)).completions).toEqual([]);
      await page.evaluate(() => (window as unknown as { navigationMenuFixture: FixtureAPI }).navigationMenuFixture.unmount());
      await expect(page.locator('#tested-popup')).toHaveCount(0);
      expect((await snapshot(page)).completions).toEqual([false]);
    });
    test('L:21 closeOnClick closes the menu', async ({ page }) => {
      await visit(page, reference, 'link-close');
      await page.locator('#first-trigger').click();
      await expect(page.locator('#tested-popup')).toBeVisible();
      await page.locator('#first-link').click();
      await expect(page.locator('#tested-popup')).toHaveCount(0);
      await expect(page.locator('#first-trigger')).toHaveAttribute('aria-expanded', 'false');
    });
    test('L:61 default Link click preserves the menu', async ({ page }) => {
      await visit(page, reference);
      await page.locator('#first-trigger').click();
      await page.locator('#first-link').click();
      await expect(page.locator('#tested-popup')).toBeVisible();
      await expect(page.locator('#first-trigger')).toHaveAttribute('aria-expanded', 'true');
    });
    test('L:103 active Link uses aria-current page', async ({ page }) => {
      await visit(page, reference, 'open');
      await expect(page.locator('#first-link')).toHaveAttribute('aria-current', 'page');
    });
    test('L:118 inactive Link omits aria-current', async ({ page }) => {
      await visit(page, reference, 'open');
      await expect(page.locator('#last-link')).not.toHaveAttribute('aria-current');
    });
    test('L:134 null relatedTarget preserves open', async ({ page }) => {
      await visit(page, reference, 'open');
      await page.locator('#first-link').focus();
      await page.locator('#first-link').evaluate(node => { (node as HTMLElement).blur(); });
      await expect(page.locator('#first-trigger')).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('#first-link')).toHaveCount(1);
    });
    for (const keep of [false, true]) {
      test(`C:${keep ? '30/81' : '55/107'} SSR and hydration preserve keepMounted=${keep}`, async ({ page, request }) => {
        const url = `/navigation-menu?case=${keep ? 'ssr-keep' : 'default'}${reference ? '&reference' : ''}`;
        const html = await (await request.get(url)).text();
        expect((html.match(/id="first-content"/g) ?? []).length).toBe(keep ? 1 : 0);
        await visit(page, reference, keep ? 'ssr-keep' : 'default');
        await expect(page.locator('#first-content')).toHaveCount(keep ? 1 : 0);
        if (keep) await expect(page.locator('#first-content')).toHaveAttribute('hidden');
      });
    }
    test('C:132 Content stays in Viewport when triggers switch', async ({ page }) => {
      await visit(page, reference, 'content-keep');
      await page.locator('#first-trigger').click();
      await expect(page.locator('#first-content')).toBeVisible();
      expect(await page.locator('#tested-viewport').evaluate(node => node.contains(document.getElementById('first-content')))).toBe(true);
      expect(await page.locator('#tested-list').evaluate(node => node.contains(document.getElementById('first-content')))).toBe(false);
      await page.locator('#second-trigger').click();
      await expect(page.locator('#second-content')).toBeVisible();
      expect(await page.locator('#tested-viewport').evaluate(node => node.contains(document.getElementById('first-content')) && node.contains(document.getElementById('second-content')))).toBe(true);
    });
    test('C:185 kept Portal retains hidden Content inside Viewport on close', async ({ page }) => {
      await visit(page, reference, 'keep');
      await page.locator('#first-trigger').click();
      await expect(page.locator('#first-content')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('#first-content')).toHaveAttribute('hidden');
      expect(await page.locator('#tested-viewport').evaluate(node => node.contains(document.getElementById('first-content')))).toBe(true);
    });
    test('R:2538 nested closeOnClick closes the parent', async ({ page }) => {
      await visit(page, reference, 'nested');
      await expect(page.locator('#sub-first-link')).toBeVisible();
      await page.locator('#sub-first-link').click();
      await expect(page.locator('#tested-popup')).toHaveCount(0);
      await expect(page.locator('#first-trigger')).toHaveAttribute('aria-expanded', 'false');
    });
    test('T:167 vertical RTL opens with mirrored arrow', async ({ page }) => {
      await visit(page, reference, 'default', '&orientation=vertical&direction=rtl');
      await page.locator('#first-trigger').focus();
      await page.keyboard.press('ArrowLeft');
      await expect(page.locator('#tested-popup')).toBeVisible();
      await expect(page.locator('#first-trigger')).toBeFocused();
    });
  });
}
