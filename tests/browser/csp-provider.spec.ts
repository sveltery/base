// Supplemental real-provider context probes. No CSPProvider.test.tsx ordinary declaration credit.
import { expect, test } from '@playwright/test';
for (const reference of [false, true]) {
  const framework = reference ? 'React' : 'Svelte';
  test(`CSP supplement ${framework}: wrapperless defaults, nested shadowing and live updates`, async ({ page }) => {
    await page.goto(`/csp-provider${reference ? '?reference' : ''}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const probe = (name: string) => page.getByTestId(name);
    await expect(probe('outside')).toHaveText('undefined|false');
    await expect(probe('outer')).toHaveText('outer-a|true');
    await expect(probe('inner-omitted')).toHaveText('undefined|undefined');
    await expect(probe('inner-explicit')).toHaveText('inner|false');
    await expect(probe('outer-sibling')).toHaveText('outer-a|true');
    await expect(probe('after')).toHaveText('undefined|false');
    expect(await page.locator('main').evaluate(node => [...node.children].map(child => child.tagName))).toEqual(['BUTTON', 'BUTTON', 'BUTTON', 'OUTPUT', 'OUTPUT', 'OUTPUT', 'OUTPUT', 'OUTPUT', 'OUTPUT']);
    await probe('outer').evaluate(node => { Object.assign(node, { identityWitness: 'retained' }); });
    await page.getByRole('button', { name: 'Update', exact: true }).click();
    await expect(probe('outer')).toHaveText('outer-b|false'); await expect(probe('outer-sibling')).toHaveText('outer-b|false');
    expect(await probe('outer').evaluate(node => (node as HTMLElement & { identityWitness?: string }).identityWitness)).toBe('retained');
    await expect(probe('inner-omitted')).toHaveText('undefined|undefined');
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    await expect(probe('outer')).toHaveText('undefined|undefined'); await expect(probe('inner-explicit')).toHaveText('inner|false');
    await expect(probe('outside')).toHaveText('undefined|false');
  });
  test(`CSP supplement ${framework}: teardown and remount preserve scope`, async ({ page }) => {
    await page.goto(`/csp-provider${reference ? '?reference' : ''}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await page.getByRole('button', { name: 'Toggle provider', exact: true }).click();
    await expect(page.getByTestId('outer')).toHaveCount(0); await expect(page.getByTestId('unwrapped')).toHaveText('undefined|false');
    await page.getByRole('button', { name: 'Update', exact: true }).click();
    await page.getByRole('button', { name: 'Toggle provider', exact: true }).click();
    await expect(page.getByTestId('unwrapped')).toHaveCount(0); await expect(page.getByTestId('outer')).toHaveText('outer-b|false');
    await expect(page.getByTestId('inner-omitted')).toHaveText('undefined|undefined'); await expect(page.getByTestId('after')).toHaveText('undefined|false');
  });
}
test('CSP supplement Svelte: hydration preserves SSR probe nodes and has no hydration errors', async ({ page }) => {
  await page.addInitScript(() => {
    const initial = new Map<string, Element>();
    const observer = new MutationObserver(() => { for (const node of document.querySelectorAll('[data-testid]')) { const name = node.getAttribute('data-testid')!; if (!initial.has(name)) initial.set(name, node); } });
    observer.observe(document, { subtree: true, childList: true });
    Object.assign(window, { cspInitialNodes: initial });
  });
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'warning' || message.type() === 'error') errors.push(message.text()); });
  const response = await page.goto('/csp-provider');
  const serverMarkup = await response!.text();
  for (const name of ['outside', 'outer', 'inner-omitted', 'inner-explicit', 'outer-sibling', 'after']) expect(serverMarkup).toContain(`data-testid="${name}"`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  expect(await page.evaluate(() => { const initial = (window as Window & { cspInitialNodes?: Map<string, Element> }).cspInitialNodes!; return initial.size === 6 && [...initial].every(([name, node]) => node === document.querySelector(`[data-testid="${name}"]`)); })).toBe(true);
  expect(errors.filter(message => /hydration/i.test(message))).toEqual([]);
});
