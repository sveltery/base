import { test, expect } from '@playwright/test';
import { docs } from '../../apps/fixtures/src/lib/docs/content';

test('docs routes render on the server with credits and no popup DOM', async ({
  request,
}) => {
  for (const doc of docs) {
    const response = await request.get(
      '/docs' + (doc.slug ? '/' + doc.slug : ''),
    );
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('Sveltery Base');
    expect(html).toContain('Experimental');
    expect(html).toContain('Independent &amp; unofficial');
    expect(html).toContain('https://base-ui.com/');
    expect(html).toContain('https://ui.shadcn.com/docs');
    expect(html).not.toContain('role="dialog"');
  }
  expect((await request.get('/docs/components/not-implemented')).status()).toBe(
    404,
  );
});

test('docs keyboard search, navigation and skip link', async ({ page }) => {
  await page.goto('/docs');
  await expect(page.locator('.sveltery-docs')).toHaveAttribute(
    'data-hydrated',
    'true',
  );
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#docs-content')).toBeFocused();
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('searchbox')).toBeFocused();
  await page.getByRole('searchbox').fill('Dialog');
  await expect(page.getByRole('status')).toHaveText('2 pages found');
  const results = page.getByRole('navigation', { name: 'Search results' });
  await expect(results.getByRole('link')).toHaveText(['Alert Dialog', 'Dialog']);
  await expect(results.getByRole('link', { name: 'Alert Dialog', exact: true }))
    .toHaveAttribute('href', '/docs/components/alert-dialog');
  await expect(results.getByRole('link', { name: 'Dialog', exact: true }))
    .toHaveAttribute('href', '/docs/components/dialog');
  await page.keyboard.press('Tab');
  await expect(results.getByRole('link', { name: 'Alert Dialog', exact: true }))
    .toBeFocused();
  await page.keyboard.press('Tab');
  await expect(results.getByRole('link', { name: 'Dialog', exact: true }))
    .toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/docs\/components\/dialog$/);
  await expect(
    page
      .getByRole('navigation', { name: 'Documentation' })
      .getByRole('link', { name: 'Dialog', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('searchbox')).toHaveValue('');
  await page.getByRole('searchbox').fill('Dialog');
  await expect(page.getByRole('status')).toHaveText('2 pages found');
  await page.keyboard.press('Tab');
  await expect(results.getByRole('link', { name: 'Alert Dialog', exact: true }))
    .toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/docs\/components\/alert-dialog$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Alert Dialog');
  await expect(
    page.getByRole('navigation', { name: 'Documentation' })
      .getByRole('link', { name: 'Alert Dialog', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Control+k');
  await page.getByRole('searchbox').fill('no-page-with-this-name');
  await expect(page.getByRole('status')).toContainText('0 pages found');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('searchbox')).toHaveValue('');
});

test('live Dialog retains naming, trapped keyboard focus and return focus', async ({
  page,
}) => {
  await page.goto('/docs/components/dialog');
  await expect(page.locator('.sveltery-docs')).toHaveAttribute(
    'data-hydrated',
    'true',
  );
  const trigger = page.getByRole('button', { name: 'Explore a dialog' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const popup = page.getByRole('dialog', { name: 'A little room to focus' });
  await expect(popup).toBeVisible();
  await expect(popup).toHaveAccessibleDescription(
    /experimental Sveltery Dialog/,
  );
  await expect(page.getByRole('textbox', { name: 'Your note' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(
    page.getByRole('button', { name: 'Done exploring' }),
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Your note' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(popup).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('responsive docs and visual smoke artifacts', async ({
  page,
}, testInfo) => {
  const faults: string[] = [];
  page.on('pageerror', (error) => faults.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/docs');
  await expect(page.locator('.sveltery-docs')).toHaveAttribute(
    'data-hydrated',
    'true',
  );
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Build on a thoughtful base.',
  );
  const desktop = testInfo.outputPath('docs-desktop.png');
  await page.screenshot({ path: desktop, fullPage: true });
  await testInfo.attach('docs-desktop', {
    path: desktop,
    contentType: 'image/png',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/docs/components/dialog');
  await expect(page.locator('.sveltery-docs')).toHaveAttribute(
    'data-hydrated',
    'true',
  );
  await expect(
    page.getByRole('navigation', { name: 'Documentation' }),
  ).not.toBeVisible();
  await page.getByRole('button', { name: 'Browse docs' }).click();
  await expect(
    page.getByRole('navigation', { name: 'Documentation' }),
  ).toBeVisible();
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('searchbox')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Browse docs' })).toBeFocused();
  await page.getByRole('button', { name: 'Explore a dialog' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const mobile = testInfo.outputPath('docs-mobile-dialog.png');
  await page.screenshot({ path: mobile });
  await testInfo.attach('docs-mobile-dialog', {
    path: mobile,
    contentType: 'image/png',
  });
  await page.getByRole('button', { name: 'Done exploring' }).click();
  expect(faults).toEqual([]);
});
