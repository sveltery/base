import { expect, test } from '@playwright/test';
// Physical native/actual Source cross-family and shadow supplements, zero ordinary credit.
for (const reference of [true, false])
  for (const variant of ['dialog-parent', 'alert-parent', 'shadow'] as const)
    test(`${reference ? 'Actual React' : 'Native'} AlertDialog whole closure ${variant}`, async ({
      page,
    }) => {
      await page.goto(`/alert-dialog-closure?variant=${variant}${reference ? '&reference' : ''}`);
      await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
      await page.getByRole('button', { name: 'Open outer' }).click();
      const parent = page.getByTestId('closure-parent');
      await expect(parent).toBeVisible();
      await expect(parent).not.toHaveAttribute('data-nested');
      if (variant !== 'shadow') {
        expect(
          await parent.evaluate((node) =>
            getComputedStyle(node).getPropertyValue('--nested-dialogs'),
          ),
        ).toBe('0');
        await page.getByRole('button', { name: 'Open inner' }).click();
        const inner = page.getByTestId('closure-inner');
        await expect(inner).toBeVisible();
        await expect(inner).toHaveAttribute('data-nested', '');
        await expect(parent).toHaveAttribute('data-nested-dialog-open', '');
        await expect
          .poll(() =>
            parent.evaluate((node) => getComputedStyle(node).getPropertyValue('--nested-dialogs')),
          )
          .toBe('1');
        await expect(page.getByRole('button', { name: 'Close inner' })).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(inner).toHaveCount(0);
        await expect(parent).toBeVisible();
        await expect(page.getByRole('button', { name: 'Open inner' })).toBeFocused();
        await expect
          .poll(() =>
            parent.evaluate((node) => getComputedStyle(node).getPropertyValue('--nested-dialogs')),
          )
          .toBe('0');
        await expect(parent).not.toHaveAttribute('data-nested-dialog-open');
        await page.getByRole('button', { name: 'Open inner' }).click();
        await expect(inner).toBeVisible();
        await page.getByRole('button', { name: 'Close inner' }).click();
        await expect(inner).toHaveCount(0);
      } else {
        expect(await parent.evaluate((node) => node.getRootNode() instanceof ShadowRoot)).toBe(
          true,
        );
        await expect(page.getByRole('button', { name: 'Close outer' })).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(page.getByRole('button', { name: 'Close outer' })).toBeFocused();
        await page.mouse.click(600, 400);
        await expect(parent).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(parent).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Open outer' })).toBeFocused();
        await page.getByRole('button', { name: 'Open outer' }).click();
        await expect(parent).toBeVisible();
      }
      await page
        .locator('main')
        .evaluate((node) =>
          (node as HTMLElement & { removeAlertClosure(): void }).removeAlertClosure(),
        );
      await expect(page.getByTestId('closure-parent')).toHaveCount(0);
      await expect(page.getByTestId('closure-inner')).toHaveCount(0);
      await expect(page.locator('[data-base-ui-portal]')).toHaveCount(0);
      await expect(page.locator('[data-base-ui-focus-guard]')).toHaveCount(0);
      await expect(page.locator('#closure-outside')).not.toHaveAttribute('aria-hidden', 'true');
    });
