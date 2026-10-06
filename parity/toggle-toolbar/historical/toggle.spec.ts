// Direct Toggle assertion ports at Base UI 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: parity/toggle/UPSTREAM_LICENSE. Additional probes earn no declaration credit.
import { expect, test, type Page } from '@playwright/test';
async function setup(page: Page, scenario: string, reference: boolean) {
  await page.goto(`/toggle?case=${scenario}${reference ? '&reference' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  return page.locator('#tested-toggle');
}
async function calls(page: Page) { return JSON.parse(await page.getByTestId('calls').innerText()) as { pressed: boolean; reason: string; type: string; before: string; canceled: boolean; defaultPrevented: boolean; trigger: boolean }[]; }
async function order(page: Page) { return JSON.parse(await page.getByTestId('order').innerText()) as string[]; }
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  test(`T:19 ${framework} controlled`, async ({ page }) => {
    const button = await setup(page, 'controlled', reference);
    await expect(button).toHaveAttribute('aria-pressed', 'false'); // :34
    await page.getByRole('checkbox').evaluate((node: HTMLInputElement) => node.click());
    await expect(button).toHaveAttribute('aria-pressed', 'true'); // :39
    await page.getByRole('checkbox').evaluate((node: HTMLInputElement) => node.click());
    await expect(button).toHaveAttribute('aria-pressed', 'false'); // :45
  });
  test(`T:48 ${framework} uncontrolled`, async ({ page }) => {
    const button = await setup(page, 'uncontrolled', reference);
    await expect(button).toHaveAttribute('aria-pressed', 'false'); // :53
    await button.evaluate((node: HTMLButtonElement) => node.click());
    await expect(button).toHaveAttribute('aria-pressed', 'true'); // :58
    await button.evaluate((node: HTMLButtonElement) => node.click());
    await expect(button).toHaveAttribute('aria-pressed', 'false'); // :64
  });
  test(`T:69 ${framework} is called when the pressed state changes`, async ({ page }) => {
    const button = await setup(page, 'callback', reference);
    await button.evaluate((node: HTMLButtonElement) => node.click());
    expect((await calls(page)).length).toBe(1); // :80
    expect((await calls(page))[0].pressed).toBe(true); // :81
  });
  test(`T:84 ${framework} does not change the pressed state when the event is canceled`, async ({ page }) => {
    const button = await setup(page, 'cancel', reference);
    await button.evaluate((node: HTMLButtonElement) => node.click());
    await expect(button).toHaveAttribute('aria-pressed', 'false'); // :100
  });
  test(`T:130 ${framework} disables the component`, async ({ page }) => {
    const button = await setup(page, 'disabled', reference);
    await expect(button).toHaveAttribute('disabled'); // :136
    await expect(button).toHaveAttribute('data-disabled'); // :137
    await expect(button).toHaveAttribute('aria-pressed', 'false'); // :138
    await button.evaluate((node: HTMLButtonElement) => node.click());
    expect((await calls(page)).length).toBe(0); // :144
    await expect(button).toHaveAttribute('aria-pressed', 'false'); // :145
  });
  test(`supplement: ${framework} requests wait for controlled owner updates`, async ({ page }) => {
    const button = await setup(page, 'controlled', reference);
    await button.click(); await expect(button).toHaveAttribute('aria-pressed', 'false');
    expect((await calls(page))[0].pressed).toBe(true);
    await page.getByRole('checkbox').check(); await expect(button).toHaveAttribute('aria-pressed', 'true');
    await button.click(); await expect(button).toHaveAttribute('aria-pressed', 'true'); expect((await calls(page))[1].pressed).toBe(false);
    await setup(page, 'accept', reference); await page.locator('#tested-toggle').click(); await expect(page.locator('#tested-toggle')).toHaveAttribute('aria-pressed', 'true');
  });
  test(`supplement: ${framework} callback details and ordering precede commit`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    const button = await setup(page, 'callback', reference);
    await button.click();
    expect(await calls(page)).toEqual([{ pressed: true, reason: 'none', type: 'click', before: 'false', canceled: false, defaultPrevented: false, trigger: false }]);
    expect(await order(page)).toEqual(['consumer', 'change', 'ancestor']);
    await expect(button).toHaveAttribute('data-pressed'); await expect(button).toHaveClass('pressed-class');
    await expect(button).toHaveCSS('opacity', '1'); expect(errors).toEqual([]);
  });
  for (const scenario of ['cancel', 'click-cancel', 'click-default', 'render-cancel', 'render-order']) test(`supplement: ${framework} ${scenario} cancellation channels`, async ({ page }) => {
    const button = await setup(page, scenario, reference); await button.click();
    const canceled = ['cancel', 'click-cancel', 'render-cancel'].includes(scenario);
    await expect(button).toHaveAttribute('aria-pressed', String(!canceled));
    const suppressed = scenario === 'click-cancel' || scenario === 'render-cancel';
    expect((await calls(page)).length).toBe(suppressed ? 0 : 1);
    if (scenario === 'cancel') { expect((await calls(page))[0].canceled).toBe(true); expect((await calls(page))[0].defaultPrevented).toBe(false); }
    if (scenario === 'click-default') expect((await calls(page))[0].defaultPrevented).toBe(true);
    if (scenario === 'render-order') expect(await order(page)).toEqual(['render', 'consumer', 'change', 'ancestor']);
    expect((await order(page)).at(-1)).toBe('ancestor');
  });
  for (const scenario of ['uncontrolled', 'custom', 'link']) test(`supplement: ${framework} ${scenario} trusted keyboard activation`, async ({ page }) => {
    const button = await setup(page, scenario, reference); await button.focus(); await expect(button).toBeFocused();
    await page.keyboard.press('Enter'); await expect(button).toHaveAttribute('aria-pressed', 'true');
    if (scenario === 'link') expect(new URL(page.url()).hash).toBe('#target');
    // Native hash navigation can move focus away in both frameworks. Exercise
    // Space on the actual host, preserving navigation rather than canceling it.
    await button.focus(); await expect(button).toBeFocused();
    await page.keyboard.press('Space'); await expect(button).toHaveAttribute('aria-pressed', 'false');
    expect((await calls(page)).map(call => call.pressed)).toEqual([true, false]);
  });
  test(`supplement: ${framework} custom disabled and reactive disable`, async ({ page }) => {
    let button = await setup(page, 'custom-disabled', reference);
    await expect(button).toHaveAttribute('aria-disabled', 'true'); await expect(button).toHaveAttribute('tabindex', '-1');
    await expect(button).not.toHaveAttribute('disabled');
    await button.evaluate(node => { (node as HTMLElement).click(); node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); node.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true })); });
    expect(await calls(page)).toEqual([]);
    button = await setup(page, 'uncontrolled', reference); await button.click();
    await page.getByRole('button', { name: 'Change disabled', exact: true }).click();
    await expect(button).toHaveAttribute('disabled'); await expect(button).toHaveAttribute('data-pressed');
    await button.evaluate((node: HTMLButtonElement) => node.click()); expect((await calls(page)).length).toBe(1);
    await page.getByRole('button', { name: 'Change disabled', exact: true }).click(); await button.click(); await expect(button).toHaveAttribute('aria-pressed', 'false');
  });
  test(`supplement: ${framework} defaults and mode are initialized once`, async ({ page }) => {
    let button = await setup(page, 'default-true', reference); await expect(button).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Change default', exact: true }).click(); await expect(button).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('checkbox').check(); await button.click(); await expect(button).toHaveAttribute('aria-pressed', 'false');
    button = await setup(page, 'controlled-fallback', reference); await expect(button).toHaveAttribute('aria-pressed', 'false');
    await page.getByRole('button', { name: 'Clear controlled prop', exact: true }).click(); await expect(button).toHaveAttribute('aria-pressed', 'true');
    await button.click(); await expect(button).toHaveAttribute('aria-pressed', 'true');
  });
  for (const scenario of ['stripped-form', 'stripped-reset', 'non-native-default', 'non-native-stripped']) test(`supplement: ${framework} ${scenario} props and native reset`, async ({ page }) => {
    const button = await setup(page, scenario, reference);
    await expect(button).toHaveAttribute('type', 'button'); await expect(button).not.toHaveAttribute('form'); await expect(button).not.toHaveAttribute('value');
    await page.getByRole('textbox', { name: 'Reset field', exact: true }).fill('changed');
    await button.click(); await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('textbox', { name: 'Reset field', exact: true })).toHaveValue('changed');
    await expect(page.getByTestId('forms')).toHaveText('{"submitted":0,"reset":0}');
    await page.getByRole('button', { name: 'Native reset', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Reset field', exact: true })).toHaveValue('initial');
    await expect(button).toHaveAttribute('aria-pressed', 'true'); await expect(page.getByTestId('forms')).toHaveText('{"submitted":0,"reset":1}');
    if (scenario === 'stripped-form' || scenario === 'non-native-stripped') expect(await page.locator('#toggle-form').evaluate((node: HTMLFormElement) => new FormData(node).get('toggle'))).toBeNull();
  });
  test(`supplement: ${framework} descendant keys do not activate host`, async ({ page }) => {
    await setup(page, 'descendant', reference); await page.getByRole('textbox', { name: 'Inner input' }).focus();
    await page.keyboard.press('Enter'); await page.keyboard.press('Space'); expect(await calls(page)).toEqual([]);
  });
  for (const scenario of ['controlled-consumer', 'controlled-render']) test(`supplement: ${framework} ${scenario} preserves rendered pressed snapshot`, async ({ page }) => {
    const button = await setup(page, scenario, reference);
    await button.click(); await expect(button).toHaveAttribute('aria-pressed', 'true');
    expect((await calls(page)).map(call => call.pressed)).toEqual([true]);
    expect((await calls(page))[0].before).toBe('false');
    expect(await order(page)).toEqual(scenario === 'controlled-render' ? ['render', 'consumer', 'change', 'ancestor'] : ['consumer', 'change', 'ancestor']);
    // A committed owner update supplies a fresh handler snapshot for the next click.
    await button.click(); await expect(button).toHaveAttribute('aria-pressed', 'false');
    expect((await calls(page)).map(call => call.pressed)).toEqual([true, false]);
  });
  for (const scenario of ['callback-consumer', 'callback-render']) test(`supplement: ${framework} ${scenario} preserves rendered callback then refreshes`, async ({ page }) => {
    const button = await setup(page, scenario, reference);
    await button.click(); await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('callback-owners')).toHaveText('["old"]');
    await button.click(); await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('callback-owners')).toHaveText('["old","new"]');
    expect((await calls(page)).map(call => call.pressed)).toEqual([true, false]);
  });
  test(`supplement: ${framework} same-turn clicks share the rendered snapshot`, async ({ page }) => {
    const button = await setup(page, 'uncontrolled', reference);
    await button.evaluate((node: HTMLButtonElement) => { node.click(); node.click(); });
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    expect((await calls(page)).map(call => call.pressed)).toEqual([true, true]);
    await button.click(); await expect(button).toHaveAttribute('aria-pressed', 'false');
    expect((await calls(page)).map(call => call.pressed)).toEqual([true, true, false]);
  });
}
test('supplement: Svelte Toggle SSR hydrates with stable host and attachments clean up', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    const observer = new MutationObserver(() => {
      const node = document.getElementById('tested-toggle');
      if (node) { (window as Window & { serverToggle?: Element }).serverToggle = node; observer.disconnect(); }
    });
    observer.observe(document, { childList: true, subtree: true });
  });
  const button = await setup(page, 'attachment', false);
  expect(await button.evaluate(node => node === (window as Window & { serverToggle?: Element }).serverToggle)).toBe(true);
  await expect(button).toHaveAttribute('data-consumer-attached'); await expect(page.getByTestId('ref')).toHaveText('tested-toggle');
  await expect(page.getByTestId('attachments')).toHaveText('{"attached":1,"detached":0}');
  await button.evaluate(node => { (window as Window & { toggleHost?: Element }).toggleHost = node; });
  await button.click(); expect(await button.evaluate(node => node === (window as Window & { toggleHost?: Element }).toggleHost)).toBe(true);
  await page.getByRole('button', { name: 'Toggle mounting', exact: true }).click(); await expect(button).toHaveCount(0);
  await expect(page.getByTestId('ref')).toHaveText(''); await expect(page.getByTestId('attachments')).toHaveText('{"attached":1,"detached":1}');
  await page.getByRole('button', { name: 'Toggle mounting', exact: true }).click(); await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('attachments')).toHaveText('{"attached":2,"detached":1}'); expect(errors).toEqual([]);
});
// D-03 is an inherited intentional difference; this paired comparison has zero parity credit.
for (const reference of [false, true]) test(`supplement: ${reference ? 'React reference' : 'Svelte'} Toggle inherited disabled chorded mousedown`, async ({ page }) => {
  const button = await setup(page, 'custom-disabled', reference);
  await button.evaluate(node => {
    node.setAttribute('data-pointerdowns', '0');
    node.addEventListener('pointerdown', () => { node.setAttribute('data-pointerdowns', String(Number(node.getAttribute('data-pointerdowns')) + 1)); }, { capture: true });
    node.addEventListener('mousedown', event => {
      node.setAttribute('data-trusted', String(event.isTrusted));
      setTimeout(() => node.setAttribute('data-default-prevented', String(event.defaultPrevented)), 0);
    }, { capture: true });
  });
  const box = await button.boundingBox(); expect(box).not.toBeNull();
  await page.mouse.move(700, 500); await page.mouse.down({ button: 'right' });
  try {
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2); await page.mouse.down({ button: 'left' });
    await expect(button).toHaveAttribute('data-pointerdowns', '0'); await expect(button).toHaveAttribute('data-trusted', 'true');
    await expect(button).toHaveAttribute('data-default-prevented', String(!reference));
    if (reference) await expect(button).toBeFocused(); else await expect(button).not.toBeFocused();
    expect(await calls(page)).toEqual([]);
  } finally { await page.mouse.up({ button: 'left' }); await page.mouse.up({ button: 'right' }); }
});
