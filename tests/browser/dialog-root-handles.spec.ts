import { expect, test, type Locator, type Page } from '@playwright/test';
import type { RootFixtureApi } from '../../apps/fixtures/src/lib/dialog-root-cases.js';
// Complete ordered Root assertions; MIT: parity/dialog/UPSTREAM_LICENSE.
// Exact three source helper variants; source ordinary user.click uses DOM-dispatched input.
async function click(locator: Locator) {
  await locator.evaluate(element => {
    const node = element as HTMLElement;
    node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, pointerType: 'mouse', button: 0, buttons: 1 }));
    node.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true, button: 0, buttons: 1 }));
    node.focus();
    node.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true, pointerType: 'mouse', button: 0 }));
    node.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true, button: 0 }));
    node.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, cancelable: true, button: 0, detail: 1 }));
  });
}
const api = (page: Page) => page.locator('main').evaluate(node => (node as HTMLElement & { api: RootFixtureApi }).api);
for (const reference of [false, true]) for (const variant of ['contained', 'detached', 'multiple']) for (const line of [280,306,333,389,411,459,472,485,535,555,582,1319,1399]) {
  // R1399's duplicate callback predicate observes React renderer effect replay.
  // PM decision: retain its complete strict source body; native row remains individually unimplemented.
  if (!reference && line === 1399) continue;
  test(`R:${line} ${variant} ${reference ? 'React reference' : 'Svelte'} complete body`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/dialog-root-handles?line=${line}&variant=${variant}${reference ? '&reference' : ''}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const popup = page.getByRole('dialog'); const trigger = page.getByTestId('trigger');
    if (line === 280) {
      await click(trigger); await expect(popup).toHaveCount(1); await page.keyboard.press('Escape'); await expect(popup).toHaveCount(0);
      await click(trigger); await expect(popup).toHaveCount(1); await page.locator('body').evaluate(node => node.dispatchEvent(new MouseEvent('click', { bubbles: true }))); await expect(popup).toHaveCount(0);
    } else if (line === 306) {
      await expect(popup).toHaveCount(1); expect(await page.getByText('title text', { exact: true }).getAttribute('id')).toBe(await popup.getAttribute('aria-labelledby'));
      expect(await page.getByText('description text', { exact: true }).getAttribute('id')).toBe(await popup.getAttribute('aria-describedby'));
    } else if (line === 333) {
      const title1 = await page.getByText('Title 1', { exact: true }).getAttribute('id'); const description1 = await page.getByText('Description 1', { exact: true }).getAttribute('id');
      await expect(popup).toHaveAttribute('aria-labelledby', title1!); await expect(popup).toHaveAttribute('aria-describedby', description1!);
      await click(page.getByRole('button', { name: 'Change labels' }));
      const title2 = await page.getByText('Title 2', { exact: true }).getAttribute('id'); const description2 = await page.getByText('Description 2', { exact: true }).getAttribute('id');
      await expect(popup).toHaveAttribute('aria-labelledby', title2!); await expect(popup).toHaveAttribute('aria-describedby', description2!); expect(title2).not.toBe(title1); expect(description2).not.toBe(description1);
      await click(page.getByRole('button', { name: 'Change labels' })); await expect(popup).not.toHaveAttribute('aria-labelledby'); await expect(popup).not.toHaveAttribute('aria-describedby');
    } else if (line === 389 || line === 411) {
      if (line === 389) expect((await api(page)).calls).toHaveLength(0);
      await click(trigger); const first = (await api(page)).calls; expect(first).toHaveLength(1); if (line === 389) expect(first[0].open).toBe(true); else expect(first[0].reason).toBe('trigger-press');
      await click(page.getByRole('button', { name: 'Close', exact: true })); const second = (await api(page)).calls; expect(second).toHaveLength(2); if (line === 389) expect(second[1].open).toBe(false); else expect(second[1].reason).toBe('close-press');
    } else if ([459,472,485].includes(line)) {
      await expect(popup).toHaveCount(1);
      if (line === 459) await page.keyboard.press('Escape'); else if (line === 472) await click(page.getByRole('presentation', { includeHidden: true })); else await click(page.locator('body'));
      const calls = (await api(page)).calls; expect(calls).toHaveLength(1); expect(calls[0].reason).toBe(line === 459 ? 'escape-key' : 'outside-press');
    } else if (line === 535) {
      await click(trigger); await page.evaluate(() => Promise.resolve()); await expect(popup).toHaveCount(0);
    } else if (line === 555 || line === 582) {
      await expect(popup).toHaveCount(1); await page.keyboard.press('Escape'); await page.evaluate(() => Promise.resolve());
      const events = (await api(page)).events;
      if (line === 555) { expect(events).toHaveLength(1); expect(events[0]).toMatchObject({ open: false, reason: 'escape-key' }); }
      else { await expect(popup).toHaveCount(1); expect(events).toHaveLength(0); }
    } else if (line === 1319) {
      await click(page.getByRole('button', { name: 'Close externally', includeHidden: true })); await expect(page.getByTestId('dialog-popup')).toHaveCount(0);
      const completions = (await api(page)).completions; expect(completions[0]).toBe(true); expect(completions.at(-1)).toBe(false);
    } else if (line === 1399) {
      await click(page.getByRole('button', { name: 'Open externally' })); await expect(page.getByTestId('dialog-popup')).toHaveCount(1);
      await expect.poll(async () => (await api(page)).completions.length).toBe(2); expect((await api(page)).completions[0]).toBe(true);
    }
    expect(errors).toEqual([]); // Supplemental diagnostics do not replace original predicates.
  });
}
