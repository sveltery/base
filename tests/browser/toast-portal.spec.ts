import { expect, test, type Page } from '@playwright/test';
// Complete applicable conformance helper assertions invoked by ToastPortal.test.tsx at the pin.
// Helpers are separate evidence, zero ordinary leaf credit. MIT: parity/toast/UPSTREAM_LICENSE.
const helpers = [
  ['props-default', 'custom props to the default element'],
  ['props-function', 'custom props to a function replacement'],
  ['props-element', 'custom props to an element replacement'],
  ['props-style', 'component style'], ['props-style-function', 'function style'], ['props-style-element', 'element style'],
  ['ref', 'attaches the ref'], ['render-function', 'customized root with a function'],
  ['render-element', 'customized root with an element'], ['render-empty-element', 'customized root wrapper'],
  ['render-ref', 'ref to the custom component'], ['render-merge-ref', 'composes both refs'],
  ['render-class', 'composes both classes'], ['render-class-resolved', 'composes resolved classes'], ['class', 'string class'],
] as const;
async function click(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).evaluate((node: HTMLButtonElement) => node.click());
}
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  async function setup(page: Page, scenario: string) {
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/toast-portal${reference ? '-reference' : ''}?case=${scenario}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    return errors;
  }
  for (const [scenario, label] of helpers) test(`Toast Portal conformance ${framework}: ${label}`, async ({ page }) => {
    const errors = await setup(page, scenario);
    const root = page.getByTestId(scenario === 'props-default' ? 'root' : scenario.startsWith('props-') ? 'custom-root' : scenario.includes('class') && scenario !== 'class' ? 'test-component' : 'wrapped');
    if (scenario.startsWith('props-') && !scenario.includes('style')) {
      await expect(root).toHaveAttribute('lang', 'fr'); await expect(root).toHaveAttribute('data-foobar', 'source-value');
    } else if (scenario.includes('style')) {
      await expect(root).toHaveAttribute('style'); expect(await root.getAttribute('style')).toContain('color: green');
    } else if (scenario === 'ref') {
      await expect.poll(async () => JSON.parse(await page.getByTestId('refs').innerText()).tag).toBe('DIV');
    } else if (scenario === 'class') {
      await expect(page.locator('.test-class')).toHaveCount(1);
    } else if (scenario.includes('class')) {
      await expect(root).toHaveClass(new RegExp(scenario.endsWith('resolved') ? 'conditional-component-classname' : 'component-classname'));
      await expect(root).toHaveClass(/render-prop-classname/);
    } else if (scenario === 'render-ref' || scenario === 'render-merge-ref') {
      const refs = JSON.parse(await page.getByTestId('refs').innerText());
      expect(refs.tag).toBe('DIV'); expect(refs.testid).toBe('wrapped');
      if (scenario === 'render-merge-ref') { expect(refs.renderTag).toBe('DIV'); expect(refs.renderTestid).toBe('wrapped'); expect(refs.same).toBe(true); }
    } else {
      await expect(page.getByTestId('base-ui-wrapper')).toHaveCount(1);
      if (scenario !== 'render-empty-element') { await expect(root).toHaveCount(1); await expect(root).toHaveAttribute('data-test-value', 'source-value'); }
    }
    expect(errors).toEqual([]);
  });
  for (const scenario of ['default', 'null', 'ref-null', 'element', 'shadow']) test(`supplement: Toast Portal ${framework} ${scenario} placement/update/cleanup`, async ({ page }) => {
    const errors = await setup(page, scenario);
    const root = page.getByTestId('root');
    if (scenario === 'null') { await expect(root).toHaveCount(0); await click(page, 'target a'); }
    else if (scenario === 'element') await expect(root).toHaveJSProperty('parentElement', await page.locator('#target-a').evaluate(node => node));
    else {
      await expect(root).toHaveCount(1);
      expect(await root.evaluate(node => node.parentNode === (document.querySelector('#shadow-host')?.shadowRoot ?? document.body))).toBe(scenario === 'shadow');
      if (scenario !== 'shadow') expect(await root.evaluate(node => node.parentNode === document.body)).toBe(true);
    }
    await expect(root).toHaveAttribute('data-base-ui-portal', '');
    await click(page, 'add toast'); await expect(root.getByText('Portal toast', { exact: true })).toHaveCount(1);
    if (scenario !== 'shadow') {
      await root.evaluate(node => { (window as Window & { oldPortal?: Element }).oldPortal = node; });
      await click(page, 'target b');
      expect(await root.evaluate(node => node.parentElement?.id)).toBe('target-b');
      expect(await page.evaluate(() => (window as Window & { oldPortal?: Element }).oldPortal?.isConnected)).toBe(false);
      await click(page, 'wait'); await expect(root).toHaveCount(0);
      await click(page, 'default'); await expect(root).toHaveCount(1);
    }
    await click(page, 'update props'); await expect(root).toHaveAttribute('id', 'updated-portal');
    await click(page, 'remove'); await expect(root).toHaveCount(0); await expect(page.getByTestId('viewport')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
  test(`supplement: Toast Portal ${framework} ref resolution requires container identity change`, async ({ page }) => {
    const errors = await setup(page, 'ref-null');
    const root = page.getByTestId('root');
    expect(await root.evaluate(node => node.parentNode === document.body)).toBe(true);
    await click(page, 'mutate same ref'); expect(await root.evaluate(node => node.parentNode === document.body)).toBe(true);
    await click(page, 'resolve ref'); expect(await root.evaluate(node => node.parentElement?.id)).toBe('target-a');
    expect(errors).toEqual([]);
  });
  test(`supplement: Toast Portal ${framework} nested Lite portals do not establish parent context`, async ({ page }) => {
    const errors = await setup(page, 'nested');
    expect(await page.getByTestId('root').evaluate(node => node.parentNode === document.body)).toBe(true);
    expect(await page.getByTestId('nested').evaluate(node => node.parentNode === document.body)).toBe(true);
    expect(errors).toEqual([]);
  });
  for (const scenario of ['dialog', 'dialog-ref-null']) test(`supplement: Toast Portal ${framework} ${scenario} inherits parent without adding modal machinery`, async ({ page }) => {
    const errors = await setup(page, scenario);
    const portal = page.getByTestId('root');
    expect(await portal.evaluate(node => node.parentElement?.getAttribute('data-testid'))).toBe('dialog-portal');
    await expect(portal.locator('[data-base-ui-internal-backdrop], [data-base-ui-focus-guard]')).toHaveCount(0);
    await click(page, 'add toast'); await expect(portal.getByText('Portal toast', { exact: true })).toHaveCount(1);
    await page.getByRole('button', { name: 'Dialog control' }).focus();
    await page.keyboard.press('Tab');
    // Modal focus continues to belong to Dialog; Lite introduces no guards or isolation owner.
    await expect(page.getByRole('dialog', { name: 'Dialog title' })).toBeVisible();
    await page.keyboard.press('Escape'); await expect(page.getByTestId('dialog-portal')).toHaveCount(0);
    await click(page, 'remove'); await expect(portal).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
