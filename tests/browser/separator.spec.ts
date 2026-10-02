import { expect, test, type Page } from '@playwright/test';
// Pinned Separator declarations and all 15 applicable helpers; MIT: parity/separator/UPSTREAM_LICENSE.
// Helper cases are separate evidence and earn zero ordinary declaration credit.
const helpers = [
  ['props-default', 'custom props to the default element'], ['props-function', 'custom props to a function replacement'],
  ['props-element', 'custom props to an element replacement'], ['props-style', 'component style'],
  ['props-style-function', 'function style'], ['props-style-element', 'element style'], ['ref', 'attaches the ref'],
  ['render-function', 'customized root with a function'], ['render-element', 'customized root with an element'],
  ['render-empty-element', 'customized root wrapper'], ['render-ref', 'ref to the custom component'],
  ['render-merge-ref', 'composes both refs'], ['render-class', 'composes both classes'],
  ['render-class-resolved', 'composes resolved classes'], ['class', 'string class'],
] as const;
type Refs = { present: boolean; instanceofDiv: boolean; renderPresent: boolean; tag?: string; testid?: string; renderTag?: string; renderTestid?: string; same: boolean; attached?: boolean; cleanups?: number };
async function readRefs(page: Page): Promise<Refs> {
  return page.getByTestId('refs').evaluate(node => (node as HTMLElement & { readSeparatorRefs?: () => Refs }).readSeparatorRefs?.() ?? JSON.parse(node.textContent!));
}
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  async function setup(page: Page, scenario: string) {
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/separator${reference ? '-reference' : ''}?case=${scenario}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true'); return errors;
  }
  // Ordinary immutable Separator.test.tsx:14/21. Orientation expands the original forEach in place.
  test(`Separator ordinary ${framework}: renders a div with the separator role [S:14]`, async ({ page }) => {
    const errors = await setup(page, 'default'); await expect(page.getByRole('separator')).toBeVisible();
    expect(await page.getByRole('separator').evaluate(node => node.tagName)).toBe('DIV'); expect(errors).toEqual([]);
  });
  for (const orientation of ['horizontal', 'vertical']) test(`Separator ordinary ${framework}: orientation ${orientation} [S:21]`, async ({ page }) => {
    const errors = await setup(page, orientation); await expect(page.getByRole('separator')).toHaveAttribute('aria-orientation', orientation); expect(errors).toEqual([]);
  });
  for (const [scenario, label] of helpers) test(`Separator conformance ${framework}: ${label}`, async ({ page }) => {
    const errors = await setup(page, scenario);
    const root = page.getByTestId(scenario === 'props-default' ? 'root' : scenario.startsWith('props-') ? 'custom-root' : scenario.includes('class') && scenario !== 'class' ? 'test-component' : 'wrapped');
    if (scenario.startsWith('props-') && !scenario.includes('style')) {
      await expect(root).toHaveAttribute('lang', 'fr'); await expect(root).toHaveAttribute('data-foobar', 'source-value');
    } else if (scenario.includes('style')) {
      await expect(root).toHaveAttribute('style'); expect(await root.getAttribute('style')).toContain('color: green');
    } else if (scenario === 'ref') {
      expect((await readRefs(page)).instanceofDiv).toBe(true);
    } else if (scenario === 'class') {
      expect(await page.locator('.test-class').count()).not.toBe(0);
    } else if (scenario.includes('class')) {
      expect(await root.evaluate(node => node.classList.contains('render-prop-classname'))).toBe(true);
      expect(await root.evaluate((node, value) => node.classList.contains(value), scenario.endsWith('resolved') ? 'conditional-component-classname' : 'component-classname')).toBe(true);
    } else if (scenario === 'render-ref' || scenario === 'render-merge-ref') {
      const refs = await readRefs(page); expect(refs.tag).toBe('DIV'); expect(refs.testid).toBe('wrapped');
      if (scenario === 'render-merge-ref') { expect(refs.present).toBe(true); expect(refs.renderPresent).toBe(true); expect(refs.renderTag).toBe('DIV'); expect(refs.renderTestid).toBe('wrapped'); }
    } else {
      expect(await page.getByTestId('base-ui-wrapper').count()).not.toBe(0);
      if (scenario !== 'render-empty-element') { expect(await root.count()).not.toBe(0); await expect(root).toHaveAttribute('data-test-value', 'source-value'); }
    }
    expect(errors).toEqual([]);
  });
  test(`supplement: Separator ${framework} reactive orientation/default/native props`, async ({ page }) => {
    const errors = await setup(page, 'reactive'); const root = page.getByTestId('root');
    await expect(root).toHaveAttribute('role', 'separator'); await expect(root).toHaveAttribute('aria-orientation', 'horizontal'); await expect(root).toHaveAttribute('data-orientation', 'horizontal');
    await expect(root).toContainClass('orientation-horizontal'); await expect(root).toHaveCSS('color', 'rgb(0, 128, 0)'); await expect(root).toHaveText('Separator content');
    await root.evaluate(node => { (window as Window & { separatorHost?: Element }).separatorHost = node; });
    await page.getByRole('button', { name: 'vertical', exact: true }).click();
    await expect(root).toHaveAttribute('aria-orientation', 'vertical'); await expect(root).toHaveAttribute('data-orientation', 'vertical'); await expect(root).toContainClass('orientation-vertical'); await expect(root).toHaveCSS('color', 'rgb(255, 0, 0)');
    expect(await root.evaluate(node => (window as Window & { separatorHost?: Element }).separatorHost === node)).toBe(true);
    await page.getByRole('button', { name: 'update props' }).click(); await expect(root).toHaveAttribute('id', 'updated-separator');
    await root.click(); await expect(page.getByTestId('events')).toHaveText('["updated-part"]'); expect(errors).toEqual([]);
  });
  for (const scenario of ['override', 'render-override']) test(`supplement: Separator ${framework} ${scenario} keeps consumer precedence`, async ({ page }) => {
    const errors = await setup(page, scenario); const root = page.getByTestId(scenario === 'override' ? 'root' : 'custom-root');
    await expect(root).toHaveAttribute('role', 'presentation'); await expect(root).toHaveAttribute('aria-orientation', 'vertical');
    await expect(root).toHaveAttribute('data-orientation', scenario === 'override' ? 'consumer' : 'replacement'); await expect(root).toContainClass('orientation-horizontal');
    await page.getByRole('button', { name: 'vertical', exact: true }).click(); await expect(root).toContainClass('orientation-vertical'); await expect(root).toHaveAttribute('aria-orientation', 'vertical'); expect(errors).toEqual([]);
  });
  for (const scenario of ['events', 'events-prevent']) test(`supplement: Separator ${framework} ${scenario} replacement event order`, async ({ page }) => {
    const errors = await setup(page, scenario); await page.getByTestId('custom-root').click();
    await expect(page.getByTestId('events')).toHaveText(scenario === 'events' ? '["render","part"]' : '["render"]'); expect(errors).toEqual([]);
  });
  test(`supplement: Separator ${framework} actual replacement host/ref cleanup`, async ({ page }) => {
    const errors = await setup(page, 'lifecycle'); const root = page.getByTestId('custom-root');
    await expect(root).toHaveText('Separator content'); const before = await readRefs(page); expect(before.tag).toBe('SECTION'); expect(before.same).toBe(true);
    if (!reference) expect(before.attached).toBe(true);
    await root.evaluate(node => { (window as Window & { separatorHost?: Element }).separatorHost = node; });
    await page.getByRole('button', { name: 'replace host' }).click(); expect((await readRefs(page)).tag).toBe('ARTICLE'); expect((await readRefs(page)).same).toBe(true);
    expect(await page.evaluate(() => (window as Window & { separatorHost?: Element }).separatorHost?.isConnected)).toBe(false);
    if (!reference) expect((await readRefs(page)).cleanups).toBe(1);
    await page.getByRole('button', { name: 'remove', exact: true }).click(); await expect(root).toHaveCount(0); expect((await readRefs(page)).present).toBe(false); expect((await readRefs(page)).renderPresent).toBe(false);
    if (!reference) expect((await readRefs(page)).cleanups).toBe(2);
    await page.getByRole('button', { name: 'restore' }).click(); await expect(root).toHaveCount(1); expect((await readRefs(page)).same).toBe(true); expect(errors).toEqual([]);
  });
}
test('supplement: Separator Svelte native ClassValue arrays/objects', async ({ page }) => {
  await page.goto('/separator?case=class-value'); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true'); await expect(page.getByTestId('root')).toHaveClass('array-class object-class');
});
