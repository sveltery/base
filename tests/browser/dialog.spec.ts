import { test, expect, type Page } from '@playwright/test';
// These are contained-first source-derived acceptance probes, not complete upstream leaf ports.
// Exact upstream cross-products remain untouched/unported in parity/dialog/upstream-inventory.json.
async function start(page: Page, path = '/dialog', query = '') {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(path + query);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  return errors;
}
async function logs(page: Page) { return JSON.parse(await page.getByTestId('log').innerText()) as { channel: string; open?: boolean; reason?: string; trigger?: string; event?: string }[]; }
async function consumer(page: Page) { return (await logs(page)).filter(entry => entry.channel === 'consumer'); }
for (const route of ['/dialog', '/reference']) {
  test(`${route}: uncontrolled reason sequence, focus entry, Escape and return`, async ({ page }) => {
    const errors = await start(page, route);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(await consumer(page)).toEqual([]);
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'first', exact: true })).toBeFocused();
    await expect(page.locator('#trigger')).toHaveAttribute('aria-expanded', 'true');
    const id = await page.getByRole('dialog').getAttribute('id');
    await expect(page.locator('#trigger')).toHaveAttribute('aria-controls', id!);
    expect(await consumer(page)).toEqual([{ channel: 'consumer', open: true, reason: 'trigger-press', trigger: 'trigger', event: 'click', ...(route === '/dialog' ? { before: false } : {}) }]);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('#trigger')).toBeFocused();
    expect((await consumer(page)).map(x => [x.open, x.reason, x.trigger, x.event])).toEqual([[true, 'trigger-press', 'trigger', 'click'], [false, 'escape-key', 'trigger', 'keydown']]);
    await page.locator('#trigger').click();
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect((await consumer(page)).at(-1)?.reason).toBe('close-press');
    expect(errors).toEqual([]);
  });
  for (const cancel of ['open', 'close']) {
    test(`${route}: canceled ${cancel} request`, async ({ page }) => {
      await start(page, route, `?cancel=${cancel}${cancel === 'close' ? '&initial' : ''}`);
      if (cancel === 'open') await page.locator('#trigger').click();
      else { await expect(page.getByRole('dialog')).toBeVisible(); await page.keyboard.press('Escape'); }
      if (cancel === 'open') await expect(page.getByRole('dialog')).toHaveCount(0);
      else await expect(page.getByRole('dialog')).toBeVisible();
      expect((await consumer(page)).map(x => [x.open, x.reason])).toEqual([[cancel === 'open', cancel === 'open' ? 'trigger-press' : 'escape-key']]);
      if (route === '/dialog') expect((await logs(page)).filter(x => x.channel === 'internal')).toEqual([]);
    });
  }
  test(`${route}: controlled requests await owner state`, async ({ page }) => {
    await start(page, route, '?mode=held');
    await page.locator('#trigger').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect((await consumer(page)).map(x => [x.open, x.reason])).toEqual([[true, 'trigger-press']]);
    await page.getByRole('button', { name: 'Owner toggle' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeVisible();
    expect((await consumer(page)).map(x => [x.open, x.reason])).toEqual([[true, 'trigger-press'], [false, 'escape-key']]);
    // Programmatic host control avoids an outside-press request while probing ownership.
    await page.getByRole('button', { name: 'Owner toggle', includeHidden: true }).evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
  test(`${route}: modal Tab wraps in both directions`, async ({ page }) => {
    await start(page, route);
    await page.locator('#trigger').click();
    await expect(page.getByRole('textbox', { name: 'first', exact: true })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('textbox', { name: 'first', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('textbox', { name: 'second', exact: true })).toBeFocused();
  });
  test(`${route}: outside press is click-timed and ignores right button`, async ({ page }) => {
    await start(page, route);
    await page.locator('#trigger').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.mouse.click(10, 400, { button: 'right' });
    await expect(page.getByRole('dialog')).toBeVisible();
    expect((await consumer(page)).length).toBe(1);
    await page.mouse.move(10, 400); await page.mouse.down();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect((await consumer(page)).length).toBe(1);
    await page.mouse.up();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect((await consumer(page)).map(x => [x.open, x.reason])).toEqual([[true, 'trigger-press'], [false, 'outside-press']]);
  });
  test(`${route}: keepMounted hides closed popup`, async ({ page }) => {
    await start(page, route, '?keep');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByTestId('popup')).toBeHidden();
    await page.locator('#trigger').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByTestId('popup')).toBeHidden();
    await expect(page.getByTestId('popup')).toHaveCount(1);
  });
}
test('Svelte composition invokes consumer before internal activation and can suppress it', async ({ page }) => {
  await start(page, '/dialog', '?prevent');
  await page.locator('#trigger').click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await logs(page)).toEqual([{ channel: 'click' }]);
});
test('Svelte accepted changes dispatch consumer then internal with native identity', async ({ page }) => {
  await start(page);
  await page.evaluate(() => {
    (window as any).lastClick = null;
    document.querySelector('#trigger')!.addEventListener('click', event => { (window as any).lastClick = event; });
  });
  await page.locator('#trigger').click();
  const sequence = (await logs(page)).filter(x => ['click', 'consumer', 'internal'].includes(x.channel));
  expect(sequence.map(x => x.channel)).toEqual(['click', 'consumer', 'internal']);
  expect((sequence[1] as any).before).toBe(false);
  // Runtime identity is recorded by the fixture rather than inferred from event.type.
  expect(await page.evaluate(() => (window as any).dialogEvent === (window as any).lastClick)).toBe(true);
});
for (const custom of [false, true]) {
  test(`Svelte disabled ${custom ? 'span' : 'button'} composition`, async ({ page }) => {
    await start(page, '/dialog', '?disabled' + (custom ? '&custom' : ''));
    await expect(page.locator('#trigger')).toHaveAttribute('data-disabled', '');
    if (custom) {
      await expect(page.locator('#trigger')).not.toHaveAttribute('disabled');
      await expect(page.locator('#trigger')).toHaveAttribute('aria-disabled', 'true');
      await page.locator('#trigger').click({ force: true });
      await page.locator('#trigger').focus(); await page.keyboard.press('Enter'); await page.keyboard.press('Space');
    } else await expect(page.locator('#trigger')).toBeDisabled();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(await consumer(page)).toEqual([]);
  });
}
test('Svelte custom snippet preserves keyboard activation and actual DOM reference', async ({ page }) => {
  await start(page, '/dialog', '?custom');
  await page.locator('#trigger').focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#trigger')).toHaveAttribute('data-custom-open', 'true');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#trigger')).toBeFocused();
});
for (const focus of ['second', 'conditional', 'false', 'final', 'false-final']) {
  test(`Svelte focus option ${focus}`, async ({ page }) => {
    await start(page, '/dialog', `?modal=false&focus=${focus}`);
    await page.locator('#trigger').click();
    if (focus === 'second') await expect(page.getByRole('textbox', { name: 'second', exact: true })).toBeFocused();
    else if (focus === 'conditional' || focus === 'false') await expect(page.locator('#trigger')).toBeFocused();
    else await expect(page.getByRole('textbox', { name: 'first', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    if (focus === 'final') await expect(page.getByRole('textbox', { name: 'final', exact: true })).toBeFocused();
    else if (focus === 'false-final') await expect(page.locator('#trigger')).not.toBeFocused();
    else await expect(page.locator('#trigger')).toBeFocused();
    if (focus === 'conditional') {
      await page.locator('#trigger').focus(); await page.keyboard.press('Enter');
      await expect(page.getByRole('textbox', { name: 'second', exact: true })).toBeFocused();
    }
  });
}
test('Svelte nested dialogs count descendants, dismiss topmost, retain parent scroll lock', async ({ page }) => {
  await start(page, '/dialog', '?nested');
  await page.locator('#trigger').click();
  const parent = page.getByTestId('popup');
  await expect(parent).toHaveCSS('--nested-dialogs', '0');
  await page.getByRole('button', { name: 'Child open' }).click();
  await expect(page.getByTestId('child-popup')).toBeVisible();
  await expect(parent).toHaveCSS('--nested-dialogs', '1');
  await page.getByRole('button', { name: 'Grandchild open' }).click();
  await expect(parent).toHaveCSS('--nested-dialogs', '2');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('grandchild-popup')).toHaveCount(0);
  await expect(parent).toHaveCSS('--nested-dialogs', '1');
  await expect(page.getByTestId('child-popup')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('child-popup')).toHaveCount(0);
  await expect(parent).toHaveCSS('--nested-dialogs', '0');
  await expect(parent).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
  await page.keyboard.press('Escape'); await expect(parent).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
});
test('Svelte nested outside click closes child only', async ({ page }) => {
  await start(page, '/dialog', '?nested');
  await page.locator('#trigger').click(); await page.getByRole('button', { name: 'Child open' }).click();
  await page.mouse.click(10, 400);
  await expect(page.getByTestId('child-popup')).toHaveCount(0);
  await expect(page.getByTestId('popup')).toBeVisible();
  expect((await consumer(page)).length).toBe(1);
});
test('Svelte cleanup removes portals, lock, labels and registrations across remount', async ({ page }) => {
  const errors = await start(page, '/dialog', '?nested');
  await page.locator('#trigger').click(); await page.getByRole('button', { name: 'Child open' }).click();
  await page.getByRole('button', { name: 'Mount toggle' }).evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.locator('[data-base-ui-portal]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
  await page.getByRole('button', { name: 'Mount toggle' }).click(); await page.locator('#trigger').click();
  await expect(page.getByTestId('popup')).toHaveCSS('--nested-dialogs', '0');
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
  expect((await consumer(page)).map(x => x.reason)).toEqual(['trigger-press', 'trigger-press', 'escape-key']);
  expect(errors).toEqual([]);
});
test('Svelte deferred unmount remains accessible until imperative action', async ({ page }) => {
  await start(page, '/dialog', '?cancel=defer');
  await page.locator('#trigger').click(); await page.locator('#trigger').evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByTestId('popup')).toHaveAttribute('data-closed', '');
  await page.getByRole('button', { name: 'Imperative unmount' }).evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('Svelte exit transition remains accessible, then hides; reopen cancels stale exit', async ({ page }) => {
  await start(page, '/dialog', '?keep&animate');
  await page.locator('#trigger').click(); await expect(page.getByRole('dialog')).toBeVisible();
  await page.waitForFunction(() => JSON.parse(document.querySelector('[data-testid=log]')!.textContent!).some((x: any) => x.channel === 'complete' && x.open));
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await expect(page.getByTestId('popup')).toHaveAttribute('data-ending-style', '');
  await expect(page.locator('#trigger')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('popup')).toHaveAttribute('data-open', '');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.waitForTimeout(250); // Past stale exit duration; observation is deliberately negative.
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByTestId('popup')).toBeHidden();
  expect((await logs(page)).filter(x => x.channel === 'complete' && x.open === false)).toHaveLength(1);
});
test('Svelte initial-open hydration and label lifecycle without console errors', async ({ page, request }) => {
  const response = await request.get('/dialog?initial');
  const html = await response.text();
  expect(response.ok()).toBe(true);
  expect(html).not.toContain('data-base-ui-portal');
  const serverId = html.match(/id="trigger"[^>]*aria-expanded="([^"]*)"/);
  expect(serverId?.[1]).toBe('false'); // No default owning trigger in this fixture.
  const errors = await start(page, '/dialog', '?initial');
  await expect(page.getByRole('dialog')).toBeVisible();
  const title = page.getByRole('heading', { name: 'Dialog title' });
  const id = await title.getAttribute('id');
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-labelledby', id!);
  await page.getByRole('button', { name: 'Title ID' }).evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'replacement-title');
  await page.getByRole('button', { name: 'Title toggle' }).evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByRole('dialog')).not.toHaveAttribute('aria-labelledby');
  expect(errors).toEqual([]);
});
test('Svelte two Roots preserve generated SSR IDs through hydration', async ({ page, request }) => {
  const response = await request.get('/dialog-ssr');
  expect(response.ok()).toBe(true);
  const html = await response.text();
  const ids = [...html.matchAll(/ id="(base-ui-[^"]+)"/g)].map(match => match[1]);
  expect(ids).toHaveLength(6);
  expect(new Set(ids).size).toBe(6);
  const errors = await start(page, '/dialog-ssr');
  expect(await page.locator('[id^="base-ui-"]').evaluateAll(nodes => nodes.map(node => node.id))).toEqual(ids);
  await page.getByRole('button', { name: 'First open' }).click();
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-labelledby', ids[1]);
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-describedby', ids[2]);
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Second open' }).click();
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-labelledby', ids[4]);
  expect(errors).toEqual([]);
});

test('audit: controlled owner reopen clears a previous deferred close', async ({ page }) => {
  await start(page, '/dialog', '?mode=held&cancel=defer');
  const owner = page.getByRole('button', { name: 'Owner toggle', includeHidden: true });
  await owner.evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByRole('dialog')).toBeVisible(); await page.keyboard.press('Escape');
  await owner.evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByTestId('popup')).toHaveAttribute('data-closed', '');
  await owner.evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByTestId('popup')).toHaveAttribute('data-open', '');
  await page.getByRole('button', { name: 'Stop deferring', includeHidden: true }).evaluate((button: HTMLButtonElement) => button.click());
  await page.keyboard.press('Escape'); await owner.evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect((await logs(page)).filter(x => x.channel === 'complete' && x.open === false)).toHaveLength(1);
});
test('audit: imperative unmount cancels a pending keepMounted exit completion', async ({ page }) => {
  await start(page, '/dialog', '?keep&animate&cancel=defer');
  await page.locator('#trigger').click(); await expect(page.getByRole('dialog')).toBeVisible();
  await page.waitForFunction(() => JSON.parse(document.querySelector('[data-testid=log]')!.textContent!).some((x: any) => x.channel === 'complete' && x.open));
  await page.keyboard.press('Escape'); await expect(page.getByTestId('popup')).toHaveAttribute('data-ending-style', '');
  await page.getByRole('button', { name: 'Imperative unmount' }).evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByTestId('popup')).toBeHidden(); await page.waitForTimeout(250);
  expect((await logs(page)).filter(x => x.channel === 'complete' && x.open === false)).toHaveLength(1);
});
test('audit: parent modality change preserves child Escape ownership', async ({ page }) => {
  await start(page, '/dialog', '?nested'); await page.locator('#trigger').click();
  await page.getByRole('button', { name: 'Child open' }).click();
  await page.getByRole('button', { name: 'Modality toggle' }).evaluate((button: HTMLButtonElement) => button.click());
  await page.keyboard.press('Escape'); await expect(page.getByTestId('child-popup')).toHaveCount(0);
  await expect(page.getByTestId('popup')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('audit: composing Escape leaves popup open without a close request', async ({ page }) => {
  await start(page); await page.locator('#trigger').click();
  await page.getByRole('textbox', { name: 'first', exact: true }).dispatchEvent('compositionstart');
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toBeVisible();
  expect(await consumer(page)).toHaveLength(1);
  await page.getByRole('textbox', { name: 'first', exact: true }).dispatchEvent('compositionend');
  await page.waitForTimeout(10); await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
});
for (const custom of [false, true]) test(`audit: consumer attachment cleanup and infinite descendant animation (${custom ? 'snippet' : 'native'})`, async ({ page }) => {
  await start(page, '/dialog', '?audit' + (custom ? '&custom' : ''));
  await expect(page.locator('#trigger')).toHaveAttribute('data-consumer-attached', '');
  await page.locator('#trigger').click(); await expect(page.getByTestId('spinner')).toBeVisible();
  await page.waitForFunction(() => JSON.parse(document.querySelector('[data-testid=log]')!.textContent!).some((x: any) => x.channel === 'complete' && x.open));
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
  expect((await logs(page)).filter(x => x.channel === 'complete' && x.open === false)).toHaveLength(1);
  expect((await logs(page)).filter(x => x.channel === 'attached')).toHaveLength(1);
  await page.getByRole('button', { name: 'Mount toggle' }).click();
  expect((await logs(page)).filter(x => x.channel === 'detached')).toHaveLength(1);
});
