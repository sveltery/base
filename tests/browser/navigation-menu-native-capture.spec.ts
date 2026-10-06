// Literal native DOM/context control; zero unchanged Original assertion credit.
import { expect, test } from '@playwright/test';
test('bare native SSR hydration preserves logical context while DOM relocation removes ancestor capture', async ({
  page,
  request,
}) => {
  const route = '/navigation-menu/native-capture';
  const response = await request.get(route);
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain('data-hydrated="false"');
  expect(html).toContain('data-context="initial"');
  const warnings: string[] = [];
  page.on('pageerror', (error) => warnings.push(error.message));
  page.on('console', (message) => {
    if (/hydration/i.test(message.text())) warnings.push(message.text());
  });
  await page.goto(route);
  await expect(page.getByTestId('bare-capture-witness')).toHaveAttribute('data-hydrated', 'true');
  const child = page.getByTestId('bare-capture-child');
  const host = page.getByTestId('bare-capture-child-host');
  const captured = await host.elementHandle();
  if (!captured) throw new Error('Actual hydrated child host is missing');
  await child.click();
  await expect(page.getByTestId('bare-capture-events').locator('li')).toHaveText([
    'capture:initial',
    'child:initial',
  ]);
  await page.getByTestId('bare-capture-move').click();
  await expect(page.getByTestId('bare-capture-witness')).toHaveAttribute('data-moved', 'true');
  expect(
    await captured.evaluate(
      (node) =>
        node.parentElement === document.body &&
        node === document.querySelector('[data-testid="bare-capture-child-host"]'),
    ),
  ).toBe(true);
  await child.click();
  await expect(page.getByTestId('bare-capture-events').locator('li')).toHaveText([
    'capture:initial',
    'child:initial',
    'child:initial',
  ]);
  await page.getByTestId('bare-capture-context').click();
  await expect(host).toHaveAttribute('data-context', 'updated');
  await child.click();
  await expect(page.getByTestId('bare-capture-events').locator('li')).toHaveText([
    'capture:initial',
    'child:initial',
    'child:initial',
    'child:updated',
  ]);
  expect(warnings).toEqual([]);
});
