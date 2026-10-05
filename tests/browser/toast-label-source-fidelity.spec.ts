import { test, expect } from '@playwright/test';
// Supplemental same-ID/host tests against the real native and pinned Original components.
// Zero ordinary or unchanged Original assertion credit.
for (const reference of [false, true]) {
  for (const mode of ['same', 'distinct', 'render']) {
    test(`${reference ? 'Original' : 'native'} Toast title/description ID cleanup (${mode})`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const scenario = mode === 'same' ? 'label-fidelity' : `label-fidelity-${mode}`;
      await page.goto(`/${reference ? 'toast-reference' : 'toast'}?case=${scenario}`);
      await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
      const root = page.getByTestId('label-root');
      const click = async (name: string) =>
        page
          .getByRole('button', { name, exact: true })
          .evaluate((button: HTMLButtonElement) => button.click());
      for (const [part, attribute] of [
        ['title', 'aria-labelledby'],
        ['description', 'aria-describedby'],
      ]) {
        await expect(root).toHaveAttribute(
          attribute,
          mode === 'distinct' ? `old-${part}` : `shared-${part}`,
        );
      }
      if (mode === 'render') {
        await click('hide custom host');
        await expect(page.getByTestId('old-title')).toHaveCount(0);
        await expect(page.getByTestId('old-description')).toHaveCount(0);
        await expect(root).not.toHaveAttribute('aria-labelledby');
        await expect(root).not.toHaveAttribute('aria-describedby');
        await click('show custom host');
        await expect(root).toHaveAttribute('aria-labelledby', 'shared-title');
        await click('false older');
        await expect(page.getByTestId('old-title')).toHaveCount(0);
        await expect(root).not.toHaveAttribute('aria-labelledby');
        await expect(root).not.toHaveAttribute('aria-describedby');
        await click('fallback older');
        await expect(page.getByTestId('old-title')).toHaveText('Fallback title');
        await expect(page.getByTestId('old-description')).toHaveText('Fallback description');
        await expect(root).toHaveAttribute('aria-labelledby', 'shared-title');
        await expect(root).toHaveAttribute('aria-describedby', 'shared-description');
      } else {
        await click('show newer');
        await click('remove older');
        for (const [part, attribute] of [
          ['title', 'aria-labelledby'],
          ['description', 'aria-describedby'],
        ]) {
          await expect(page.getByTestId(`old-${part}`)).toHaveCount(0);
          await expect(page.getByTestId(`new-${part}`)).toHaveText('New label');
          if (mode === 'distinct') await expect(root).toHaveAttribute(attribute, `new-${part}`);
          else await expect(root).not.toHaveAttribute(attribute);
        }
        if (mode === 'same') {
          await click('change newer text');
          await expect(page.getByTestId('new-title')).toHaveText('Changed visible text');
          await expect(root).not.toHaveAttribute('aria-labelledby');
          await expect(root).not.toHaveAttribute('aria-describedby');
          await click('empty newer');
          await expect(page.getByTestId('new-title')).toHaveCount(0);
          await click('zero newer');
          await expect(page.getByTestId('new-title')).toHaveText('0');
          await expect(root).toHaveAttribute('aria-labelledby', 'shared-title');
          await expect(root).toHaveAttribute('aria-describedby', 'shared-description');
        } else {
          await click('restore older');
          await expect(root).toHaveAttribute('aria-labelledby', 'old-title');
          await click('remove older');
          await expect(root).not.toHaveAttribute('aria-labelledby');
          await expect(root).not.toHaveAttribute('aria-describedby');
        }
      }
      expect(errors).toEqual([]);
    });
  }
}
