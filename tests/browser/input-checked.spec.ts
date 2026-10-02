// Independently authored actual-pin supplements; no ordinary Input assertion credit.
import { expect, test } from '@playwright/test';
for (const reference of [true, false]) {
  const framework = reference ? 'React' : 'Svelte';
  const suffix = reference ? '&reference' : '';
  for (const initial of [false, true]) for (const mode of ['accept', 'reject', 'rewrite', 'cancel-change', 'prevent-base']) test(`${framework} trusted checkbox ${mode} from ${initial}`, async ({ page }) => {
    await page.goto(`/input-checked?case=checkbox-${mode}-${initial ? 'on' : 'off'}${suffix}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const input = page.getByTestId('input');
    await input.click(); await expect(input).toBeChecked({ checked: mode === 'accept' ? !initial : initial });
    const calls = JSON.parse(await page.getByTestId('calls').textContent() ?? '[]');
    expect(calls).toHaveLength(mode === 'prevent-base' ? 0 : 1);
    if (calls.length) expect(calls[0]).toEqual({ value: 'token', checked: !initial, reason: 'none', type: 'click', canceled: mode === 'cancel-change', defaultPrevented: false, trusted: true });
    await expect(page.getByTestId('order')).toHaveText(mode === 'prevent-base' ? '["render","consumer"]' : '["render","consumer","value"]');
  });
  for (const mode of ['accept', 'reject', 'rewrite', 'cancel-change', 'prevent-base', 'uncontrolled-default', 'first-uncontrolled-reject']) test(`${framework} trusted same-form radio ownership ${mode}`, async ({ page }) => {
    await page.goto(`/input-checked?case=radio-${mode}-off${suffix}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await page.getByTestId('input').click();
    await expect(page.getByTestId('input')).toBeChecked({ checked: mode === 'accept' });
    await expect(page.getByTestId('first')).toBeChecked({ checked: mode !== 'accept' && mode !== 'first-uncontrolled-reject' });
    await expect(page.getByTestId('other')).toBeChecked();
  });
  for (const canceled of [false, true]) test(`${framework} checked prop update and ${canceled ? 'canceled' : 'native'} reset`, async ({ page }) => {
    await page.goto(`/input-checked?case=checkbox-${canceled ? 'cancel-reset-' : ''}reject-off${suffix}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const input = page.getByTestId('input'); await page.getByRole('button', { name: 'Programmatic', exact: true }).click();
    await expect(input).toBeChecked(); expect(await input.evaluate((node: HTMLInputElement) => node.defaultChecked)).toBe(false);
    await page.getByRole('button', { name: 'Reset', exact: true }).click(); await expect(input).toBeChecked({ checked: canceled });
    await expect(page.getByTestId('calls')).toHaveText('[]');
  });
  test(`${framework} rejected programmatic click immediate and settled checked observation`, async ({ page }) => {
    await page.goto(`/input-checked?case=checkbox-reject-off${suffix}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const input = page.getByTestId('input');
    const immediate = await input.evaluate((node: HTMLInputElement) => { node.click(); return node.checked; });
    expect(immediate).toBe(false); await expect(input).not.toBeChecked();
  });
  test(`${framework} trusted radio restoration follows final native form reassociation`, async ({ page }) => {
    await page.goto(`/input-checked?case=radio-reassociate-reject-off${suffix}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await page.getByTestId('input').click(); await expect(page.getByTestId('input')).not.toBeChecked();
    await expect(page.getByTestId('other')).toBeChecked(); await expect(page.getByTestId('first')).not.toBeChecked();
  });
  for (const canceled of [false, true]) test(`${framework} trusted checked restoration after ${canceled ? 'canceled' : 'native'} reset in callback`, async ({ page }) => {
    await page.goto(`/input-checked?case=checkbox-${canceled ? 'cancel-reset-' : ''}reset-in-input-reject-off${suffix}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await page.getByRole('button', { name: 'Programmatic', exact: true }).click(); await expect(page.getByTestId('input')).toBeChecked();
    await page.getByTestId('input').click(); await expect(page.getByTestId('input')).not.toBeChecked();
  });
  test(`${framework} trusted canceled checkbox click callback observation`, async ({ page }) => {
    await page.goto(`/input-checked?case=checkbox-cancel-click-reject-off${suffix}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await page.getByTestId('input').click(); await expect(page.getByTestId('input')).toBeChecked();
    const calls = JSON.parse(await page.getByTestId('calls').textContent() ?? '[]'); expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ type: 'click', defaultPrevented: true, trusted: true });
  });
  test(`${framework} trusted canceled radio click preserves its group and callback`, async ({ page }) => {
    await page.goto(`/input-checked?case=radio-cancel-click-reject-off${suffix}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await page.getByTestId('input').click(); await expect(page.getByTestId('input')).not.toBeChecked(); await expect(page.getByTestId('first')).toBeChecked();
    const calls = JSON.parse(await page.getByTestId('calls').textContent() ?? '[]'); expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ type: 'click', defaultPrevented: true, trusted: true });
  });
  test(`${framework} a native input event alone does not manufacture a checkable click request`, async ({ page }) => {
    await page.goto(`/input-checked?case=checkbox-reject-off${suffix}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await page.getByTestId('input').evaluate((node: HTMLInputElement) => { node.checked = true; node.dispatchEvent(new InputEvent('input', { bubbles: true })); });
    await expect(page.getByTestId('input')).toBeChecked(); await expect(page.getByTestId('calls')).toHaveText('[]');
  });
  test(`${framework} trusted replacement callback accepts a checked read after forwarding props`, async ({ page }) => {
    await page.goto(`/input-checked?case=checkbox-after-props-read-off${suffix}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await page.getByTestId('input').click(); await expect(page.getByTestId('input')).toBeChecked();
    await expect(page.getByTestId('order')).toHaveText('["render","consumer","value","after"]');
  });
}

// Independent exact-pin/native property tracking supplements; zero ordinary Input credit.
for (const reference of [true, false]) {
  const framework = reference ? 'React' : 'Svelte';
  async function open(page: import('@playwright/test').Page, scenario: string) {
    await page.goto(`/input-checked?case=${scenario}${reference ? '&reference' : ''}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  }
  test(`${framework} selected radio suppresses a second trusted change request`, async ({ page }) => {
    await open(page, 'radio-accept-off');
    await page.getByTestId('input').click(); await page.getByTestId('input').click();
    await expect(page.getByTestId('input')).toBeChecked();
    expect(JSON.parse(await page.getByTestId('calls').textContent() ?? '[]')).toHaveLength(1);
  });
  for (const radio of [false, true]) for (const canceled of [false, true]) test(`${framework} property tracking after programmatic props and reset radio=${radio} canceled=${canceled}`, async ({ page }) => {
    await open(page, `${radio ? 'radio' : 'checkbox'}-${canceled ? 'cancel-reset-' : ''}accept-off`);
    await page.getByRole('button', { name: 'Programmatic', exact: true }).click(); await expect(page.getByTestId('input')).toBeChecked();
    await page.getByTestId('input').evaluate((node: HTMLInputElement) => { node.form!.reset(); node.click(); });
    expect(JSON.parse(await page.getByTestId('calls').textContent() ?? '[]')).toHaveLength(radio || !canceled ? 0 : 1);
  });
  for (const radio of [false, true]) test(`${framework} imperative checked assignment updates native property tracking radio=${radio}`, async ({ page }) => {
    await open(page, `${radio ? 'radio' : 'checkbox'}-accept-off`);
    await page.getByTestId('input').evaluate((node: HTMLInputElement) => { node.checked = true; node.click(); });
    expect(JSON.parse(await page.getByTestId('calls').textContent() ?? '[]')).toHaveLength(radio ? 0 : 1);
  });
  test(`${framework} Chromium canceled checkbox rollback permits the next trusted request`, async ({ page }) => {
    await open(page, 'checkbox-cancel-click-reject-off');
    await page.getByTestId('input').click(); await expect(page.getByTestId('input')).not.toBeChecked();
    await page.getByTestId('input').click(); await expect(page.getByTestId('input')).not.toBeChecked();
    expect(JSON.parse(await page.getByTestId('calls').textContent() ?? '[]')).toHaveLength(2);
  });
}

// Independent same-pin checked completion supplements; source predicates stay unchanged.
for (const reference of [true, false]) {
  const framework = reference ? 'React' : 'Svelte';
  const suffix = reference ? '&reference' : '';
  for (const initial of [false, true]) for (const mode of ['accept', 'reject', 'rewrite']) for (const stop of ['none', 'propagation', 'immediate']) test(`${framework} canceled checkbox ${mode} initial=${initial} replacement stop=${stop}`, async ({ page }) => {
    const scenario = `checkbox-cancel-click-${stop === 'none' ? '' : `replacement-stop-${stop}-`}${mode}-${initial ? 'on' : 'off'}`;
    await page.goto(`/input-checked?case=${scenario}${suffix}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await page.getByTestId('input').click(); await expect(page.getByTestId('input')).toBeChecked({ checked: initial });
    const first = JSON.parse(await page.getByTestId('calls').textContent() ?? '[]');
    expect(first).toHaveLength(1); expect(first[0]).toMatchObject({ checked: !initial, type: 'click', defaultPrevented: true, trusted: true });
    await page.getByTestId('input').click(); await expect(page.getByTestId('input')).toBeChecked({ checked: initial });
    expect(JSON.parse(await page.getByTestId('calls').textContent() ?? '[]')).toHaveLength(mode === 'accept' ? 1 : 2);
  });
  test(`${framework} rejected checked ownership reaches later native click and input listeners`, async ({ page }) => {
    await page.goto(`/input-checked?case=checkbox-reject-off${suffix}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await page.getByTestId('input').evaluate((node: HTMLInputElement) => {
      const phases: string[] = [];
      (window as unknown as { checkedPhases: string[] }).checkedPhases = phases;
      node.addEventListener('input', () => phases.push(`input-target:${node.checked}`));
      node.form!.addEventListener('input', () => phases.push(`input-form:${node.checked}`));
      document.addEventListener('click', event => { if (event.target === node) phases.push(`click-document:${node.checked}`); });
    });
    await page.getByTestId('input').click(); await expect(page.getByTestId('input')).not.toBeChecked();
    const phases = await page.evaluate(() => (window as unknown as { checkedPhases: string[] }).checkedPhases);
    expect(phases).toEqual(['click-document:false', 'input-target:false', 'input-form:false']);
  });
}
