// Paired pinned ordinary predicates and supplemental gates; MIT: parity/direction-provider/UPSTREAM_LICENSE.
import { expect, test, type Page } from '@playwright/test';

async function setup(page: Page, scenario: string, reference: boolean) {
  await page.goto(`/direction-provider?case=${scenario}${reference ? '&reference' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
}
async function nested(page: Page, outer: string, inner: string) {
  await expect(page.getByTestId('outer-before')).toHaveText(outer);
  await expect(page.getByTestId('inner')).toHaveText(inner);
  await expect(page.getByTestId('outer-after')).toHaveText(outer);
  await expect(page.getByTestId('outside')).toHaveText('ltr');
}

for (const reference of [false, true]) {
  const framework = reference ? 'React' : 'Svelte';
  test(`DirectionProvider:27 ${framework} defaults useDirection to ltr outside a provider`, async ({ page }) => {
    await setup(page, 'outside', reference);
    await expect(page.getByTestId('direction')).toContainText('ltr');
  });
  test(`DirectionProvider:33 ${framework} provides the configured direction to descendants`, async ({ page }) => {
    await setup(page, 'configured', reference);
    await expect(page.getByTestId('direction')).toContainText('rtl');
    await page.getByRole('button', { name: 'Set LTR', exact: true }).click();
    await expect(page.getByTestId('direction')).toContainText('ltr');
  });
  test(`supplement ${framework} omitted and cleared provider direction defaults to ltr`, async ({ page }) => {
    await setup(page, 'default', reference); await expect(page.getByTestId('direction')).toHaveText('ltr');
    await page.getByRole('button', { name: 'Set RTL', exact: true }).click(); await expect(page.getByTestId('direction')).toHaveText('rtl');
    await page.getByRole('button', { name: 'Clear direction', exact: true }).click(); await expect(page.getByTestId('direction')).toHaveText('ltr');
  });
  test(`supplement ${framework} nearest provider shadows outer updates and cleanup`, async ({ page }) => {
    await setup(page, 'nested', reference); await nested(page, 'rtl', 'ltr');
    await page.getByRole('button', { name: 'Set inner RTL', exact: true }).click(); await nested(page, 'rtl', 'rtl');
    await page.getByRole('button', { name: 'Set LTR', exact: true }).click(); await nested(page, 'ltr', 'rtl');
    await page.getByRole('button', { name: 'Clear inner direction', exact: true }).click(); await nested(page, 'ltr', 'ltr');
    await page.getByRole('button', { name: 'Toggle inner', exact: true }).click(); await expect(page.getByTestId('inner')).toHaveCount(0);
    await page.getByRole('button', { name: 'Set RTL', exact: true }).click();
    await page.getByRole('button', { name: 'Toggle inner', exact: true }).click(); await nested(page, 'rtl', 'ltr');
  });
  test(`supplement ${framework} updates retain descendant identity without adding host markup`, async ({ page }) => {
    await setup(page, 'configured', reference);
    await page.getByTestId('direction').evaluate(node => { (node as HTMLElement).dataset.retained = 'yes'; });
    await page.getByRole('button', { name: 'Set LTR', exact: true }).click();
    await expect(page.getByTestId('direction')).toHaveAttribute('data-retained', 'yes');
    expect(await page.getByTestId('provider-host').evaluate(node => [...node.children].map(child => child.tagName))).toEqual(['SPAN']);
    await expect(page.locator('main [dir]')).toHaveCount(0);
  });
  test(`supplement ${framework} SSR hydration retains nearest-provider defaults and reacts afterward`, async ({ page, request }) => {
    const url = `/direction-provider-ssr?case=nested${reference ? '&reference' : ''}`;
    const html = await (await request.get(url)).text();
    expect(html).toContain('data-hydrated="false"');
    for (const [id, direction] of [['outer-before', 'rtl'], ['inner', 'ltr'], ['outer-after', 'rtl'], ['outside', 'ltr']]) expect(html).toContain(`data-testid="${id}">${direction}</span>`);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' || message.text().includes('hydration_mismatch')) errors.push(message.text()); });
    await page.goto(url); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true'); await nested(page, 'rtl', 'ltr');
    await page.getByRole('button', { name: 'Set inner RTL', exact: true }).click(); await nested(page, 'rtl', 'rtl');
    await page.getByRole('button', { name: 'Set LTR', exact: true }).click(); await nested(page, 'ltr', 'rtl');
    expect(errors).toEqual([]);
  });
  test(`characterization ${framework} same-turn reader retains its declared framework API behavior`, async ({ page }) => {
    await setup(page, 'timing', reference);
    await page.getByRole('button', { name: 'Read across owner write', exact: true }).click();
    await expect(page.getByTestId('read-observation')).toHaveText(reference ? 'rtl|rtl' : 'rtl|ltr');
    await expect(page.getByTestId('direction')).toHaveText('ltr');
  });
}
