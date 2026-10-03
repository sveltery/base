// Supplemental real-layout foundation witnesses, not family ordinary credit.
// Paired with actual Base UI 1.8.0; MIT: parity/anchor-positioning/UPSTREAM_LICENSE.
import { expect, test, type Page } from '@playwright/test';

async function setup(page: Page, scenario: string, reference: boolean) {
  await page.goto(`/anchor-positioning?case=${scenario}${reference ? '&reference' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  if (scenario !== 'closed') await positioned(page);
}
async function positioned(page: Page) {
  await expect(page.getByTestId('floating')).toHaveAttribute('data-positioned', 'true');
  await expect(page.getByTestId('floating')).toHaveCSS('opacity', '1');
}
async function geometry(page: Page) {
  return page.getByTestId('floating').evaluate(node => {
    const floating = node.getBoundingClientRect();
    const anchor = document.querySelector('[data-testid="anchor"]')!.getBoundingClientRect();
    const style = (node as HTMLElement).style;
    return { dx: floating.x - anchor.x, dy: floating.y - anchor.y, width: floating.width, height: floating.height,
      anchorWidth: style.getPropertyValue('--anchor-width'), anchorHeight: style.getPropertyValue('--anchor-height'),
      availableWidth: style.getPropertyValue('--available-width'), availableHeight: style.getPropertyValue('--available-height'),
      origin: style.getPropertyValue('--transform-origin'), transform: style.transform, top: style.top, left: style.left, position: style.position };
  });
}
async function offsets(page: Page, dx: number, dy: number) {
  await expect.poll(async () => {
    const measured = await geometry(page);
    return [Math.round(measured.dx * 100) / 100, Math.round(measured.dy * 100) / 100];
  }).toEqual([dx, dy]);
}

for (const reference of [false, true]) {
  const framework = reference ? 'React' : 'Svelte';
  for (const scenario of ['default', 'virtual', 'top-left']) {
    test(`anchor foundation ${framework} ${scenario} geometry and live numeric offsets`, async ({ page }) => {
      await setup(page, scenario, reference); await offsets(page, -30, 30);
      const initial = await geometry(page);
      expect(initial).toMatchObject({ width: 140, height: 70, anchorWidth: '80px', anchorHeight: '30px', position: 'absolute', origin: '70px 0px' });
      expect(initial.availableWidth).toMatch(/^\d+(?:\.\d+)?px$/);
      expect(initial.availableHeight).toMatch(/^\d+(?:\.\d+)?px$/);
      if (scenario === 'top-left') { expect(initial.transform).toBe(''); expect(initial.top).toBe('210px'); expect(initial.left).toBe('210px'); }
      else expect(initial.transform).toBe('translate(210px, 210px)');
      await page.getByRole('button', { name: 'Set offset', exact: true }).click(); await offsets(page, -30, 42);
      expect((await geometry(page)).origin).toBe('70px -12px');
    });
  }
  test(`anchor foundation ${framework} measured function offsets and native closure difference (zero parity credit)`, async ({ page }) => {
    await setup(page, 'function', reference); await offsets(page, -30, 45);
    await page.getByRole('button', { name: 'Set offset', exact: true }).click();
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await offsets(page, -30, 57);
    // react-dom 2.1.9 compares middleware functions by toString(), retaining the origin
    // closure while offset middleware reads its current ref. Native Svelte owns live closures.
    // Preserve both actual behaviors as a divergent supplement; no unchanged source credit.
    expect((await geometry(page)).origin).toBe(reference ? '70px -15px' : '70px -27px');
  });
  test(`anchor foundation ${framework} provider logical sides and DOM alignment direction`, async ({ page }) => {
    await setup(page, 'logical', reference); await offsets(page, 80, -20);
    await expect(page.getByTestId('floating')).toHaveAttribute('data-side', 'inline-start');
    await page.getByRole('button', { name: 'Toggle provider direction', exact: true }).click(); await offsets(page, -140, -20);
    await expect(page.getByTestId('floating')).toHaveAttribute('data-side', 'inline-start');
    await setup(page, 'mismatch', reference); await offsets(page, -60, 30);
    expect((await geometry(page)).origin).toBe('100% 0px');
    await page.getByRole('button', { name: 'Toggle DOM direction', exact: true }).click();
    // A native direction change is observed on the next external update, as in the source.
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await offsets(page, 0, 30); expect((await geometry(page)).origin).toBe('0% 0px');
  });
  test(`anchor foundation ${framework} clipping collisions flip with the same padding policy`, async ({ page }) => {
    await setup(page, 'collision', reference); await expect(page.getByTestId('floating')).toHaveAttribute('data-side', 'top');
    await offsets(page, -30, -70); expect((await geometry(page)).origin).toBe('70px calc(100% + 0px)');
  });
  test(`anchor foundation ${framework} replacement resize scroll hiding and teardown`, async ({ page }) => {
    await setup(page, 'default', reference);
    await page.getByRole('button', { name: 'Replace anchor', exact: true }).click(); await offsets(page, -30, 30);
    expect((await geometry(page)).transform).toBe('translate(310px, 270px)');
    await page.getByRole('button', { name: 'Resize anchor', exact: true }).click(); await offsets(page, -15, 30);
    await expect.poll(async () => (await geometry(page)).anchorWidth).toBe('110px');
    await page.getByTestId('board').evaluate(node => { node.scrollTop = 300; });
    await expect(page.getByTestId('floating')).toHaveAttribute('data-hidden', 'true');
    await page.getByRole('button', { name: 'Toggle foundation', exact: true }).click(); await expect(page.getByTestId('floating')).toHaveCount(0);
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await page.getByRole('button', { name: 'Toggle foundation', exact: true }).click(); await positioned(page); await offsets(page, -15, 30);
  });
  test(`anchor foundation ${framework} disabled tracking retains ancestor resize updates`, async ({ page }) => {
    await setup(page, 'disabled', reference);
    await page.getByRole('button', { name: 'Resize anchor', exact: true }).click();
    await page.getByTestId('board').evaluate(node => { node.scrollTop = 230; });
    await page.waitForTimeout(100);
    expect((await geometry(page)).anchorWidth).toBe('80px');
    await expect(page.getByTestId('floating')).toHaveAttribute('data-hidden', 'false');
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await expect.poll(async () => (await geometry(page)).anchorWidth).toBe('110px');
    await expect(page.getByTestId('floating')).toHaveAttribute('data-hidden', 'true');
  });
  test(`anchor foundation ${framework} initially closed keepMounted ignores stale coordinates on reopen`, async ({ page }) => {
    await setup(page, 'closed', reference);
    await expect(page.getByTestId('floating')).toHaveAttribute('data-positioned', 'false');
    expect(await geometry(page)).toMatchObject({ position: 'fixed', top: '0px', left: '0px', transform: '' });
    await page.getByRole('button', { name: 'Toggle open', exact: true }).click(); await positioned(page); await offsets(page, -30, 30);
    await page.getByRole('button', { name: 'Toggle open', exact: true }).click();
    await expect(page.getByTestId('floating')).toHaveAttribute('data-positioned', 'false');
    expect(await geometry(page)).toMatchObject({ position: 'fixed', top: '0px', left: '0px', transform: '' });
    await page.getByRole('button', { name: 'Replace anchor', exact: true }).click();
    await page.getByRole('button', { name: 'Toggle open', exact: true }).click(); await positioned(page); await offsets(page, -30, 30);
    expect((await geometry(page)).transform).toBe('translate(310px, 270px)');
  });
  test(`anchor foundation ${framework} real and fake arrows preserve origin geometry`, async ({ page }) => {
    await setup(page, 'arrow', reference); await offsets(page, -30, 30);
    await expect(page.getByTestId('arrow')).toHaveCSS('left', '65px');
    expect((await geometry(page)).origin).toBe('70px 0px');
    await page.getByRole('button', { name: 'Toggle arrow', exact: true }).click();
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await expect(page.getByTestId('arrow')).toHaveCount(0); expect((await geometry(page)).origin).toBe('70px 0px');
    await setup(page, 'start', reference); await offsets(page, 0, 30); expect((await geometry(page)).origin).toBe('0% 0px');
  });
  test(`anchor foundation ${framework} measures and rounds through the actual owner window`, async ({ page }) => {
    await page.goto(`/anchor-positioning?owner-window${reference ? '&reference' : ''}`);
    const frame = page.frameLocator('iframe'); await expect(frame.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const floating = frame.getByTestId('floating'); await expect(floating).toHaveAttribute('data-positioned', 'true');
    await expect.poll(() => floating.evaluate(node => {
      const anchor = node.ownerDocument.querySelector('[data-testid="anchor"]')!.getBoundingClientRect();
      const rect = node.getBoundingClientRect(), style = (node as HTMLElement).style;
      return { dx: rect.x - anchor.x, dy: rect.y - anchor.y, width: style.getPropertyValue('--anchor-width'), height: style.getPropertyValue('--anchor-height'), willChange: style.willChange, ownerDpr: node.ownerDocument.defaultView!.devicePixelRatio, topDpr: window.top!.devicePixelRatio };
    })).toEqual({ dx: -29.75, dy: 30.25, width: '80px', height: '30px', willChange: 'transform', ownerDpr: 2, topDpr: 1 });
    await frame.getByRole('button', { name: 'Toggle foundation', exact: true }).click();
    await expect(floating).toHaveCount(0);
  });
}

test('anchor foundation Svelte SSR hydration starts without browser measurement', async ({ page, request }) => {
  const body = await (await request.get('/anchor-positioning?case=closed')).text();
  expect(body).toContain('data-hydrated="false"'); expect(body).toContain('data-positioned="false"');
  expect(body).not.toContain('translate(');
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' || message.text().includes('hydration_mismatch')) errors.push(message.text()); });
  await setup(page, 'closed', false); await page.getByRole('button', { name: 'Toggle open', exact: true }).click(); await positioned(page);
  expect(errors).toEqual([]);
});
