import { test, expect, type Page } from '@playwright/test';
// Supplemental observations of pinned React 1.8.0 and the Svelte adaptation.
// These characterize shared limitations; they do not add declaration credit.
async function click(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).evaluate((button: HTMLButtonElement) => button.click());
}
async function close(page: Page, id: string) {
  await page.getByTestId('lifecycle').evaluate((node, id) => {
    (node as HTMLElement & { closeToastNow(channel: string, id: string): void }).closeToastNow('facade', id);
  }, id);
}
for (const reference of [false, true]) for (const indexKeys of [false, true]) {
  const label = `${reference ? 'React' : 'Svelte'}, index keys=${indexKeys}`;
  test(`baseline: nested close chooses outer successor (${label})`, async ({ page }) => {
    await page.goto(`/${reference ? 'toast-reference' : 'toast'}?case=${indexKeys ? 'lifecycle-index' : 'lifecycle'}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await click(page, 'add nested focused close'); await page.keyboard.press('F6'); await page.locator('#root-b').focus();
    await close(page, 'd');
    await expect(page.getByTestId('synchronous-focus')).toHaveText('root-c');
    await expect(page.locator('#root-c')).toBeFocused();
  });
  test(`baseline: same-ID Action removal relinquishes native focus (${label})`, async ({ page }) => {
    await page.goto(`/${reference ? 'toast-reference' : 'toast'}?case=${indexKeys ? 'lifecycle-index' : 'lifecycle'}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const start = new Date('2026-01-01T00:00:00Z'); await page.clock.install({ time: start }); await page.clock.pauseAt(start);
    await click(page, 'add descendant replacement'); await page.keyboard.press('F6'); await page.getByTestId('action').focus();
    await close(page, 'callback');
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    await expect(page.locator('#root-callback h2')).toHaveText('Fresh');
    await page.clock.runFor(75); await expect(page.locator('#root-callback')).toHaveAttribute('data-ending-style');
  });
}
for (const reference of [false, true]) test(`baseline: delayed index-slot removal loses oldest focus (${reference ? 'React' : 'Svelte'})`, async ({ page }) => {
  await page.goto(`/${reference ? 'toast-reference' : 'toast'}?case=lifecycle-index`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  await click(page, 'add nested focused close'); await page.keyboard.press('F6'); await page.locator('#root-b').focus();
  await close(page, 'd'); await expect(page.locator('#root-c')).toBeFocused(); await page.locator('#root-a').focus();
  await expect(page.locator('#root-a')).toBeFocused();
  const oldRoot = await page.locator('#root-a').elementHandle();
  if (!oldRoot) throw new Error('Expected oldest Root before physical exit.');
  await expect.poll(() => page.locator('#root-b').evaluate(node => node.getAnimations().length)).toBe(1);
  await page.locator('#root-b').evaluate(node => node.getAnimations().forEach(animation => animation.finish()));
  await expect(page.locator('#root-b')).toHaveCount(0); await expect(page.locator('#root-a')).toHaveCount(1);
  expect(await oldRoot.evaluate(node => node.isConnected)).toBe(false);
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
});
for (const reference of [false, true]) {
  const label = reference ? 'React' : 'Svelte';
  test(`baseline: live frontmost height follows ending array head (${label})`, async ({ page }) => {
    await page.goto(`/${reference ? 'toast-reference' : 'toast'}?case=lifecycle`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true'); await click(page, 'add three');
    await expect(page.getByTestId('viewport')).toHaveCSS('--toast-frontmost-height', await page.locator('#root-c').evaluate(node => `${(node as HTMLElement).offsetHeight}px`));
    await close(page, 'c'); await expect(page.locator('#root-c')).toHaveAttribute('data-ending-style');
    expect(await page.getByTestId('viewport').evaluate(node => (node as HTMLElement).style.getPropertyValue('--toast-frontmost-height'))).toBe('');
  });
  test(`baseline: public title update without Content retains measured height (${label})`, async ({ page }) => {
    await page.goto(`/${reference ? 'toast-reference' : 'toast'}?case=lifecycle-geometry`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true'); await click(page, 'add save');
    const root = page.locator('#root-save'); const before = await root.evaluate(node => (node as HTMLElement).offsetHeight);
    await click(page, 'update save layout');
    expect(await root.evaluate(node => (node as HTMLElement).offsetHeight)).toBeGreaterThan(before);
    await expect(root).toHaveCSS('--toast-height', `${before}px`);
  });
  for (const interaction of ['hover', 'focus']) test(`baseline: conditional Viewport removal retains interaction pause (${label}, ${interaction})`, async ({ page }) => {
    await page.goto(`/${reference ? 'toast-reference' : 'toast'}?case=lifecycle`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const start = new Date('2026-01-01T00:00:00Z'); await page.clock.install({ time: start }); await page.clock.pauseAt(start);
    await click(page, 'add timer');
    if (interaction === 'hover') await page.getByTestId('viewport').hover(); else await page.keyboard.press('F6');
    await click(page, 'hide viewport'); await expect(page.getByTestId('viewport')).toHaveCount(0);
    await click(page, 'add timer'); await page.clock.runFor(100);
    await expect(page.getByTestId('close-observations')).toHaveText('[]');
  });
  test(`baseline: inert successor close records native focus (${label})`, async ({ page }) => {
    await page.goto(`/${reference ? 'toast-reference' : 'toast'}?case=lifecycle-limit`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true'); await click(page, 'add three');
    await page.keyboard.press('F6'); await page.locator('#root-c').focus(); await expect(page.locator('#root-c')).toBeFocused();
    await click(page, 'disable exit animation');
    await close(page, 'c');
    console.info(`native inert close ${label}: synchronous=${await page.getByTestId('synchronous-focus').innerText()}; active=${await page.evaluate(() => document.activeElement?.id || 'BODY')}`);
    await expect(page.locator('#root-b')).not.toHaveAttribute('inert');
    await expect(page.locator('#root-c')).toHaveCount(0);
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  });
}

for (const reference of [false, true]) for (const detach of [false, true]) test(`adapter boundary: explicit Viewport blur followed by detach=${detach} (${reference ? 'React' : 'Svelte'})`, async ({ page }) => {
  await page.goto(`/${reference ? 'toast-reference' : 'toast'}?case=lifecycle`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  const start = new Date('2026-01-01T00:00:00Z'); await page.clock.install({ time: start }); await page.clock.pauseAt(start);
  await click(page, 'add timer'); await page.keyboard.press('F6'); await expect(page.getByTestId('viewport')).toBeFocused();
  await click(page, detach ? 'blur and hide viewport' : 'blur viewport');
  if (detach) await expect(page.getByTestId('viewport')).toHaveCount(0);
  await page.clock.runFor(100);
  // Explicitly documented, uncredited Svelte event-timing boundary. The common
  // connected-Viewport case still preserves pinned timer behavior.
  expect(JSON.parse(await page.getByTestId('close-observations').innerText())).toHaveLength(!reference && detach ? 0 : 1);
});

for (const reference of [false, true]) for (const interaction of ['hover', 'focus', 'replace']) test(`adapter ownership: committed blur then ${interaction} preserves the existing timer (${reference ? 'React' : 'Svelte'})`, async ({ page }) => {
  await page.goto(`/${reference ? 'toast-reference' : 'toast'}?case=lifecycle`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  const start = new Date('2026-01-01T00:00:00Z'); await page.clock.install({ time: start }); await page.clock.pauseAt(start);
  await click(page, 'add timer'); await page.keyboard.press('F6'); await expect(page.getByTestId('viewport')).toBeFocused();
  const oldViewport = await page.getByTestId('viewport').elementHandle();
  if (!oldViewport) throw new Error('Expected Viewport before interaction.');
  if (interaction === 'hover') await page.getByTestId('viewport').evaluate(node => {
    (node as HTMLElement).blur();
    // React synthesizes mouseenter from mouseover; Svelte owns native mouseenter.
    node.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: null }));
    node.dispatchEvent(new MouseEvent('mouseenter'));
  });
  else await click(page, interaction === 'focus' ? 'blur then focus root' : 'blur and replace viewport');
  if (interaction === 'focus') await expect(page.getByTestId('root')).toBeFocused();
  if (interaction === 'replace') {
    expect(await oldViewport.evaluate(node => node.isConnected)).toBe(false);
    await expect(page.getByTestId('viewport')).toBeFocused();
  }
  await page.clock.runFor(100); await expect(page.getByTestId('close-observations')).toHaveText('[]');
  await expect(page.getByTestId('root')).not.toHaveAttribute('data-ending-style');
});
