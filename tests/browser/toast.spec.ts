import { test, expect, type Page } from '@playwright/test';
// Complete pinned Base UI v1.8.0 leaves, adapted for real Chromium. MIT: parity/toast/UPSTREAM_LICENSE.
// Full source assertion/provenance mapping: parity/toast/rendering-ports.json and rendering-ports.md.
const cases = [
  ['M', 15, 'manager-add'], ['M', 63, 'manager-upsert'], ['U', 21, 'add'],
  ['U', 56, 'isolation'], ['U', 1697, 'close'], ['U', 1743, 'close-all'],
  ['U', 1794, 'timeout-sync'], ['U', 1853, 'limit'], ['U', 1878, 'unlimit'],
  ['U', 1907, 'limited-upsert'], ['U', 1965, 'limit-sync'], ['R', 97, 'offset'], ['R', 112, 'labels'],
] as const;
async function click(page: Page, name: string) {
  // Source fireEvent.click does not focus or move the pointer into Viewport. Preserve that event channel.
  await page.getByRole('button', { name, exact: true }).evaluate((button: HTMLButtonElement) => button.click());
}
async function advance(page: Page, milliseconds: number) {
  await page.clock.runFor(milliseconds);
  // Upstream JSdom fixtures remove immediately. Browser exit observers own one animation frame.
  if (await page.locator('[data-ending-style]').count()) await page.clock.runFor(32);
}
for (const reference of [false, true]) for (const [part, line, scenario] of cases) {
  test(`${part}:${line} ${reference ? 'React reference' : 'Svelte'} Toast ${scenario}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/${reference ? 'toast-reference' : 'toast'}?case=${scenario}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    // Install after hydration so framework scheduling remains real; source clock boundaries retain timer/Date behavior.
    const start = new Date('2026-01-01T00:00:00Z');
    await page.clock.install({ time: start });
    await page.clock.pauseAt(start);
    const root = page.getByTestId('root');
    const title = page.getByTestId('title');
    if (scenario === 'manager-add') {
      await expect(title).toHaveCount(0);
      await click(page, 'add');
      await expect(title).toHaveCount(1);
      await advance(page, 5000);
      await expect(title).toHaveCount(0);
    } else if (scenario === 'manager-upsert') {
      await click(page, 'add');
      await expect(title).toHaveText('Saving…');
      await expect(root).toHaveCount(1);
      await advance(page, 900);
      await click(page, 'upsert');
      const ids = JSON.parse(await page.getByTestId('ids').innerText());
      expect(ids[0]).toBe('save');
      expect(ids[1]).toBe(ids[0]);
      await expect(title).toHaveText('Saved');
      await expect(root).toHaveCount(1);
      await advance(page, 200);
      await expect(title).toHaveCount(1);
      await advance(page, 800);
      await expect(title).toHaveCount(0);
    } else if (scenario === 'isolation') {
      await click(page, 'add first'); await click(page, 'add second');
      await expect(page.getByText('First toast', { exact: true })).toHaveCount(1);
      await expect(page.getByText('Second toast', { exact: true })).toHaveCount(1);
      await click(page, 'update first');
      await expect(page.getByText('First toast updated', { exact: true })).toHaveCount(1);
      await expect(page.getByText('Second toast updated', { exact: true })).toHaveCount(0);
      await expect(page.getByText('Second toast', { exact: true })).toHaveCount(1);
    } else if (scenario === 'close' || scenario === 'close-all') {
      for (let index = 0; index < (scenario === 'close-all' ? 5 : 1); index += 1) await click(page, 'add');
      await expect(root).toHaveCount(scenario === 'close-all' ? 5 : 1);
      await click(page, 'close');
      await advance(page, 0);
      await expect(root).toHaveCount(0);
    } else if (scenario === 'timeout-sync') {
      await click(page, 'timeout 1000'); await click(page, 'add');
      await advance(page, 999);
      await expect(root).toHaveCount(1);
      await advance(page, 2);
      await expect(root).toHaveCount(0);
    } else if (scenario === 'limit' || scenario === 'unlimit') {
      await click(page, 'add');
      const first = page.getByTestId('toast-1');
      await expect(first).not.toHaveAttribute('data-limited');
      await click(page, 'add');
      await expect(page.getByTestId('toast-2')).not.toHaveAttribute('data-limited');
      await click(page, 'add');
      await expect(page.getByTestId('toast-3')).not.toHaveAttribute('data-limited');
      if (scenario === 'limit') await expect(first).toHaveAttribute('data-limited');
      else { await page.getByTestId('close-toast-3').evaluate((button: HTMLButtonElement) => button.click()); await advance(page, 0); await expect(first).not.toHaveAttribute('data-limited'); }
    } else if (scenario === 'limited-upsert') {
      await click(page, 'add save');
      await expect(page.getByTestId('Saving…')).not.toHaveAttribute('data-limited');
      await click(page, 'add other');
      await expect(page.getByTestId('Saving…')).toHaveAttribute('data-limited');
      await expect(page.getByTestId('Other toast')).not.toHaveAttribute('data-limited');
      await click(page, 'upsert save');
      await expect(page.getByTestId('Saved')).toHaveAttribute('data-limited');
      await expect(page.getByTestId('Other toast')).not.toHaveAttribute('data-limited');
    } else if (scenario === 'limit-sync') {
      await click(page, 'add'); await click(page, 'add');
      await expect(page.getByTestId('toast-2')).not.toHaveAttribute('data-limited');
      await expect(page.getByTestId('toast-1')).toHaveAttribute('data-limited');
      await click(page, 'limit 2');
      await expect(page.getByTestId('toast-1')).not.toHaveAttribute('data-limited');
      await click(page, 'limit 1');
      await expect(page.getByTestId('toast-1')).toHaveAttribute('data-limited');
    } else if (scenario === 'labels') {
      for (const mode of ['fallback', 'explicit', 'none', 'restore']) {
        if (mode !== 'fallback') await page.getByRole('button', { name: mode, exact: true }).click();
        if (mode === 'none') {
          await expect(root).not.toHaveAttribute('aria-labelledby'); await expect(root).not.toHaveAttribute('aria-describedby');
        } else {
          await expect(root).toHaveAttribute('aria-labelledby', (await title.getAttribute('id'))!);
          await expect(root).toHaveAttribute('aria-describedby', (await page.getByTestId('description').getAttribute('id'))!);
          if (mode !== 'fallback') {
            await expect(title).toHaveText(mode === 'explicit' ? 'Explicit title' : 'Toast title');
            await expect(page.getByTestId('description')).toHaveText(mode === 'explicit' ? 'Explicit description' : 'Toast description');
          }
        }
      }
    } else {
      if (scenario === 'offset') await page.getByRole('button', { name: 'add', exact: true }).click();
      else await click(page, 'add');
      if (scenario === 'offset') expect(await root.evaluate(node => (node as HTMLElement).style.getPropertyValue('--toast-offset-y'))).not.toBe('');
      else { await expect(root).toHaveCount(1); await advance(page, 5000); await expect(root).toHaveCount(0); }
    }
    expect(errors).toEqual([]);
  });
}

test('supplement: Toast SSR label IDs survive hydration and independent requests remain empty', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto('/toast?case=labels');
  const server = await response!.text();
  // Parse the actual server response, which predates hydration, without creating a second app request.
  const ids = await page.evaluate(html => {
    const document = new DOMParser().parseFromString(html, 'text/html');
    return ['title', 'description'].map(part => document.querySelector(`[data-testid="${part}"]`)?.id);
  }, server);
  expect(ids.every(id => typeof id === 'string' && id.length > 0)).toBe(true);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  await expect(page.getByTestId('title')).toHaveAttribute('id', ids[0]!);
  await expect(page.getByTestId('description')).toHaveAttribute('id', ids[1]!);
  await expect(page.getByTestId('root')).toHaveAttribute('aria-labelledby', ids[0]!);
  await expect(page.getByTestId('root')).toHaveAttribute('aria-describedby', ids[1]!);
  const responses = await Promise.all([request.get('/toast?case=add'), request.get('/toast?case=add')]);
  for (const result of responses) {
    expect(result.ok()).toBe(true);
    expect(await result.text()).not.toContain('data-testid="root"');
  }
  expect(errors).toEqual([]);
});

async function closeNow(page: Page, channel: string, id?: string) {
  await page.getByTestId('lifecycle').evaluate((node, args) => {
    (node as HTMLElement & { closeToastNow: (channel: string, id?: string) => void }).closeToastNow(args.channel, args.id);
  }, { channel, id });
}
for (const channel of ['manager', 'facade']) test(`supplement: ${channel} close-all finishes callbacks before synchronous focus transfer`, async ({ page }) => {
  await page.goto('/toast?case=lifecycle');
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  await page.locator('#outside').focus();
  await click(page, 'add three');
  await page.keyboard.press('F6');
  await page.keyboard.press('Tab');
  await expect(page.locator('#root-c')).toBeFocused();
  await closeNow(page, channel);
  expect(JSON.parse(await page.getByTestId('close-observations').innerText())).toEqual([
    { id: 'c', active: 'root-c', count: 3 }, { id: 'b', active: 'root-c', count: 3 }, { id: 'a', active: 'root-c', count: 3 },
  ]);
  await expect(page.getByTestId('synchronous-focus')).toHaveText('outside');
  await expect(page.locator('#outside')).toBeFocused();
});

test('supplement: timer close reads focus moved by onClose before returning', async ({ page }) => {
  await page.goto('/toast?case=lifecycle');
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  const start = new Date('2026-01-01T00:00:00Z');
  await page.clock.install({ time: start });
  await page.clock.pauseAt(start);
  await page.locator('#outside').focus();
  await click(page, 'add timer');
  await page.keyboard.press('F6');
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#outside')).toBeFocused();
  await page.clock.runFor(50);
  expect(JSON.parse(await page.getByTestId('close-observations').innerText())).toEqual([{ id: 'timer', active: 'root-timer', count: 1 }]);
  await expect(page.locator('#outside')).toBeFocused();
  await expect(page.locator('#root-timer')).toHaveAttribute('data-ending-style');
});

test('supplement: real exit animation retains removal order and cannot remove an ending-ID replacement', async ({ page }) => {
  await page.goto('/toast?case=lifecycle');
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  await click(page, 'add save');
  await closeNow(page, 'facade', 'save');
  await expect(page.locator('#root-save')).toHaveAttribute('data-ending-style');
  await expect.poll(() => page.locator('#root-save').evaluate(node => node.getAnimations().length)).toBe(1);
  await page.getByTestId('lifecycle').evaluate(node => {
    const host = node as HTMLElement & { capturedExit?: Animation[] };
    host.capturedExit = node.querySelector('#root-save')!.getAnimations();
  });
  await click(page, 'replace save');
  await expect(page.locator('#root-save h2')).toHaveText('Saved');
  await expect(page.locator('#root-save')).not.toHaveAttribute('data-ending-style');
  await page.getByTestId('lifecycle').evaluate(node => {
    const host = node as HTMLElement & { capturedExit?: Animation[] };
    host.capturedExit?.forEach(animation => { animation.finish(); });
    delete host.capturedExit;
  });
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect(page.locator('#root-save h2')).toHaveText('Saved');
  expect(JSON.parse(await page.getByTestId('remove-observations').innerText())).toEqual([]);
  await closeNow(page, 'manager', 'save');
  await expect(page.locator('#root-save')).toHaveAttribute('data-ending-style');
  await expect.poll(() => page.locator('#root-save').evaluate(node => node.getAnimations().length)).toBe(1);
  await page.locator('#root-save').evaluate(node => node.getAnimations().forEach(animation => animation.finish()));
  await expect(page.locator('#root-save')).toHaveCount(0);
  expect(JSON.parse(await page.getByTestId('remove-observations').innerText())).toEqual([{ id: 'save', present: true, title: 'Saved' }]);
});

for (const reference of [false, true]) test(`supplement: ${reference ? 'React reference' : 'Svelte'} native F6 and Tab traverse Roots and restore prior focus`, async ({ page }) => {
  await page.goto(`/${reference ? 'toast-reference' : 'toast'}?case=basic-parts`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  await click(page, 'add'); await click(page, 'add');
  const add = page.getByRole('button', { name: 'add', exact: true });
  await add.focus();
  await page.keyboard.press('F6');
  await expect(page.getByTestId('viewport')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('root').nth(0)).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(add).toBeFocused();
  await page.keyboard.press('F6'); await page.keyboard.press('Tab');
  await expect(page.getByTestId('root').nth(0)).toBeFocused();
  for (const index of [0, 1]) {
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('close').nth(index)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('action').nth(index)).toBeFocused();
    await page.keyboard.press('Tab');
    if (index === 0) await expect(page.getByTestId('root').nth(1)).toBeFocused();
    else await expect(add).toBeFocused();
  }
  await page.keyboard.press('F6'); await page.keyboard.press('Tab');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('root')).toHaveCount(1);
  await expect(page.getByTestId('root')).toBeFocused();
});

for (const reference of [false, true]) test(`supplement: ${reference ? 'React reference' : 'Svelte'} hover and blurred window retain timer remainder`, async ({ page }) => {
  await page.goto(`/${reference ? 'toast-reference' : 'toast'}?case=add`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  const start = new Date('2026-01-01T00:00:00Z');
  await page.clock.install({ time: start });
  await page.clock.pauseAt(start);
  await click(page, 'add');
  await page.clock.runFor(1000);
  await page.getByTestId('viewport').hover();
  await page.clock.runFor(5000);
  await expect(page.getByTestId('root')).toHaveCount(1);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await page.mouse.move(900, 700);
  await page.clock.runFor(5000);
  await expect(page.getByTestId('root')).toHaveCount(1);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await page.clock.runFor(3999);
  await expect(page.getByTestId('root')).toHaveCount(1);
  await page.clock.runFor(2);
  // The source JSdom fixture has no animation frame. Real browser exit observation owns one frame.
  await page.clock.runFor(32);
  await expect(page.getByTestId('root')).toHaveCount(0);
});

// Local regression only: no additional upstream declaration credit.
test('supplement: every close channel focuses a newly un-limited successor synchronously', async ({ page }) => {
  for (const channel of ['manager', 'facade', 'native', 'timer', 'no-animation']) {
    await page.goto('/toast?case=lifecycle-limit');
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    if (channel === 'timer') {
      const start = new Date('2026-01-01T00:00:00Z');
      await page.clock.install({ time: start }); await page.clock.pauseAt(start);
    }
    await page.locator('#outside').focus();
    await click(page, 'add save');
    if (channel === 'timer') await click(page, 'add timer');
    else await click(page, 'add three');
    const currentId = channel === 'timer' ? 'timer' : 'c';
    const successorId = channel === 'timer' ? 'save' : 'b';
    const successor = page.locator(`#root-${successorId}`);
    await expect(successor).toHaveAttribute('inert');
    await page.keyboard.press('F6'); await page.keyboard.press('Tab');
    await expect(page.locator(`#root-${currentId}`)).toBeFocused();
    if (channel === 'timer') {
      // Timer resumes outside; onClose puts focus in the closing Root.
      await page.keyboard.press('Shift+Tab');
      await expect(page.locator('#outside')).toBeFocused();
      await page.clock.runFor(50);
    } else if (channel === 'native') {
      await page.locator(`#root-${currentId} button`).evaluate((button: HTMLButtonElement) => {
        button.click();
        button.closest('section')!.setAttribute('data-focus-after-close', button.ownerDocument.activeElement?.id ?? '');
      });
      await expect(page.getByTestId('lifecycle')).toHaveAttribute('data-focus-after-close', `root-${successorId}`);
    } else {
      if (channel === 'no-animation') await page.locator(`#root-${currentId}`).evaluate(node => {
        Object.defineProperty(node, 'getAnimations', { value: undefined });
      });
      await closeNow(page, channel === 'no-animation' ? 'facade' : channel, currentId);
      await expect(page.getByTestId('synchronous-focus')).toHaveText(`root-${successorId}`);
    }
    await expect(successor).not.toHaveAttribute('inert');
    await expect(successor).toBeFocused();
    const observations = JSON.parse(await page.getByTestId('close-observations').innerText());
    expect(observations).toEqual([{ id: currentId, active: `root-${currentId}`, count: channel === 'timer' ? 2 : 4 }]);
  }
});

// Local regression only: window listeners must survive an empty Viewport.
test('supplement: empty Viewport tracks owner-window focus for subsequent timed toasts', async ({ page }) => {
  for (const previousToast of [false, true]) {
    await page.goto('/toast?case=close-all');
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const start = new Date('2026-01-01T00:00:00Z');
    await page.clock.install({ time: start }); await page.clock.pauseAt(start);
    if (previousToast) await click(page, 'add');
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    if (previousToast) { await click(page, 'close'); await page.clock.runFor(32); }
    await expect(page.getByTestId('root')).toHaveCount(0);
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    // Add before the delayed focus publication; its timer must also resume.
    await click(page, 'add');
    await page.clock.runFor(4999); await expect(page.getByTestId('root')).toHaveCount(1);
    await page.clock.runFor(2); await page.clock.runFor(32);
    await expect(page.getByTestId('root')).toHaveCount(0);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await click(page, 'add'); await page.clock.runFor(10000);
    await expect(page.getByTestId('root')).toHaveCount(1);
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await page.clock.runFor(4999); await expect(page.getByTestId('root')).toHaveCount(1);
    await page.clock.runFor(2); await page.clock.runFor(32);
    await expect(page.getByTestId('root')).toHaveCount(0);
  }
});

// Intentional upstream correction: overlapping pause conditions remain additive.
test('supplement: timers wait for both hover and keyboard focus to end', async ({ page }) => {
  for (const firstExit of ['hover', 'focus']) {
    await page.goto('/toast?case=add');
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const start = new Date('2026-01-01T00:00:00Z');
    await page.clock.install({ time: start }); await page.clock.pauseAt(start);
    await click(page, 'add'); await page.getByTestId('viewport').hover();
    await page.keyboard.press('F6'); await expect(page.getByTestId('viewport')).toBeFocused();
    await page.clock.runFor(1000);
    const add = page.getByRole('button', { name: 'add', exact: true });
    if (firstExit === 'hover') await page.mouse.move(900, 700); else await add.focus();
    await page.evaluate(() => { window.dispatchEvent(new Event('blur')); window.dispatchEvent(new Event('focus')); });
    await page.clock.runFor(10000); await expect(page.getByTestId('root')).toHaveCount(1);
    if (firstExit === 'hover') await add.focus(); else await page.mouse.move(900, 700);
    await page.clock.runFor(4999); await expect(page.getByTestId('root')).toHaveCount(1);
    await page.clock.runFor(2); await page.clock.runFor(32);
    await expect(page.getByTestId('root')).toHaveCount(0);
  }
});

// Real alternate owner document starts unfocused; no prior blur event is sent.
test('supplement: an already unfocused owner document pauses its first toast', async ({ page }) => {
  await page.goto('/toast?case=add');
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  await page.getByRole('button', { name: 'add', exact: true }).focus();
  const start = new Date('2026-01-01T00:00:00Z');
  await page.clock.install({ time: start }); await page.clock.pauseAt(start);
  await page.evaluate(() => {
    const iframe = document.createElement('iframe');
    iframe.id = 'toast-owner-frame'; iframe.src = '/toast?case=add'; document.body.appendChild(iframe);
  });
  const frame = page.frameLocator('#toast-owner-frame');
  await expect(frame.locator('main')).toHaveAttribute('data-hydrated', 'true');
  expect(await frame.locator('body').evaluate(node => node.ownerDocument.hasFocus())).toBe(false);
  await frame.getByRole('button', { name: 'add', exact: true }).evaluate((button: HTMLButtonElement) => button.click());
  await page.clock.runFor(10000); await expect(frame.getByTestId('root')).toHaveCount(1);
  await frame.getByRole('button', { name: 'add', exact: true }).focus();
  expect(await frame.locator('body').evaluate(node => node.ownerDocument.hasFocus())).toBe(true);
  await page.clock.runFor(4999); await expect(frame.getByTestId('root')).toHaveCount(1);
  await page.clock.runFor(2); await page.clock.runFor(32);
  await expect(frame.getByTestId('root')).toHaveCount(0);
});
