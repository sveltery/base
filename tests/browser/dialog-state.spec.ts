import { test, expect, type Page } from '@playwright/test';
// Complete source ports. MIT: parity/dialog/UPSTREAM_LICENSE. Mapping: state-ports.md.
const cases = [
  ['R', 239, 'ownership'], ['R', 431, 'missing'],
  ['C', 25, 'native'], ['C', 55, 'custom'], ['C', 89, 'undefined'],
  ['C', 118, 'prevent'], ['C', 137, 'closed'],
] as const;
async function control(page: Page, name: string) { await page.getByRole('button', { name, exact: true }).evaluate((button: HTMLButtonElement) => button.click()); }
async function calls(page: Page) { return JSON.parse(await page.getByTestId('calls').innerText()) as { open: boolean; reason: string; trigger: string | null; triggerIsUndefined: boolean }[]; }
for (const reference of [false, true]) {
  for (const [part, line, scenario] of cases) {
    // R:431 directly mounts one fixture; the enclosing three variants do not use TestDialog.
    for (const repetition of scenario === 'missing' ? [1, 2, 3] : [1]) {
      test(`${part}:${line} ${reference ? 'React reference' : 'Svelte'} state ${scenario} variant ${repetition}`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`/dialog-state?case=${scenario}${reference ? '&reference' : ''}`);
        await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
        const popup = page.getByRole('dialog');
        if (scenario === 'ownership') {
          const first = page.getByRole('button', { name: 'Trigger 1' });
          await first.click();
          await expect(popup).toBeVisible();
          const controls = await first.getAttribute('aria-controls');
          expect(controls).toBe(await popup.getAttribute('id')); // :264
          await page.getByRole('button', { name: 'Mount trigger 2' }).click();
          const second = page.getByRole('button', { name: 'Trigger 2', exact: true });
          await expect(first).toHaveAttribute('aria-expanded', 'true'); // :269
          expect(await first.getAttribute('aria-controls')).toBe(controls); // :270
          await expect(second).toHaveAttribute('aria-expanded', 'false'); // :271
          await expect(second).not.toHaveAttribute('aria-controls'); // :272
        } else if (scenario === 'missing') {
          await expect(popup).toBeVisible();
          await control(page, 'Imperative close');
          const requests = await calls(page);
          expect(requests).toHaveLength(1); // :453
          expect(requests[0].open).toBe(false); // :454
          expect(requests[0].reason).toBe('imperative-action'); // :455
          expect(requests[0].triggerIsUndefined).toBe(true); // :456 exact undefined check before serialization
        } else if (scenario === 'prevent') {
          await page.getByRole('button', { name: 'Close', exact: true }).click();
          await expect(popup).toBeVisible(); // :133
          expect(await calls(page)).toHaveLength(0); // :134
        } else if (scenario === 'closed') {
          // Source fireEvent.click on the hidden retained button; use the same synthetic channel.
          await page.getByRole('button', { name: 'Close', includeHidden: true }).evaluate(button => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));
          await expect(page.getByTestId('clicks')).toHaveText('1'); // :153
          expect(await calls(page)).toHaveLength(0); // :154
        } else {
          expect(await calls(page)).toHaveLength(0); // C:25 :39 / C:55 :71 / C:89 :103
          await page.getByRole('button', { name: 'Open', exact: true }).click();
          const opened = await calls(page);
          expect(opened).toHaveLength(1); // :44 / :76 / :108
          expect(opened[0].open).toBe(true); // :45 / :77 / :109
          const close = page.getByRole('button', { name: 'Close', exact: true });
          if (scenario === 'native' || scenario === 'custom') {
            if (scenario === 'native') await expect(close).toHaveAttribute('disabled'); // :48
            else await expect(close).not.toHaveAttribute('disabled'); // :80
            await expect(close).toHaveAttribute('data-disabled'); // :49 / :81
            if (scenario === 'custom') await expect(close).toHaveAttribute('aria-disabled', 'true'); // :82
            // Playwright rejects disabled user clicks. Real pointer input retains user.click semantics.
            const box = await close.boundingBox();
            expect(box).not.toBeNull();
            await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
            expect(await calls(page)).toHaveLength(1); // :52 / :85
          } else {
            await close.click();
            const closed = await calls(page);
            expect(closed).toHaveLength(2); // :114
            expect(closed[1].open).toBe(false); // :115
          }
        }
        expect(errors).toEqual([]);
      });
    }
  }
}

test('supplement: controlled external updates and callback order/reasons survive reopening', async ({ page }) => {
  await page.goto('/dialog-state?case=controlled');
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  const popup = page.getByRole('dialog');
  await expect(popup).toHaveCount(0);
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(popup).toHaveCount(0);
  await expect(page.getByTestId('owner')).toHaveText('false');
  await control(page, 'Owner open');
  await expect(popup).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(popup).toBeVisible();
  await expect(page.getByTestId('owner')).toHaveText('true');
  await control(page, 'Owner close');
  await expect(popup).toHaveCount(0);
  expect((await calls(page)).map(({ open, reason }) => [open, reason])).toEqual([[true, 'trigger-press'], [false, 'close-press']]);
  expect(JSON.parse(await page.getByTestId('order').innerText())).toEqual([
    { channel: 'consumer', open: true, before: 'false', reason: 'trigger-press', canceled: false },
    { channel: 'internal', open: true, before: 'false', reason: 'trigger-press', canceled: false },
    { channel: 'consumer', open: false, before: 'true', reason: 'close-press', canceled: false },
    { channel: 'internal', open: false, before: 'true', reason: 'close-press', canceled: false },
  ]);
  await control(page, 'Owner open');
  await expect(popup).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(popup).toBeVisible();
  expect((await calls(page)).at(-1)?.reason).toBe('escape-key');
  await control(page, 'Owner close');
  await expect(popup).toHaveCount(0);
});

for (const initiallyOpen of [false, true]) test(`supplement: canceled ${initiallyOpen ? 'close' : 'open'} preserves owner and internal state`, async ({ page }) => {
  await page.goto('/dialog-state?case=controlled');
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  const popup = page.getByRole('dialog');
  // Establish matching internal/owner state before testing cancellation.
  if (initiallyOpen) {
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await control(page, 'Owner open');
    await expect(popup).toBeVisible();
  }
  const beforeCalls = (await calls(page)).length;
  const beforeOrder = JSON.parse(await page.getByTestId('order').innerText()).length;
  await control(page, 'Toggle cancel');
  if (initiallyOpen) await page.keyboard.press('Escape');
  else await page.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.getByTestId('owner')).toHaveText(String(initiallyOpen));
  expect(await calls(page)).toHaveLength(beforeCalls + 1);
  expect(JSON.parse(await page.getByTestId('order').innerText()).slice(beforeOrder)).toEqual([
    { channel: 'consumer', open: !initiallyOpen, before: String(initiallyOpen), reason: initiallyOpen ? 'escape-key' : 'trigger-press', canceled: true },
  ]);
  // Releasing the held input exposes internal state; cancellation must not have changed it.
  await control(page, 'Release control');
  if (initiallyOpen) await expect(popup).toBeVisible();
  else await expect(popup).toHaveCount(0);
  await control(page, 'Toggle cancel');
  if (initiallyOpen) await page.keyboard.press('Escape');
  else await page.getByRole('button', { name: 'Open', exact: true }).click();
  if (initiallyOpen) await expect(popup).toHaveCount(0);
  else await expect(popup).toBeVisible();
  expect((await calls(page)).at(-1)?.open).toBe(!initiallyOpen);
});
