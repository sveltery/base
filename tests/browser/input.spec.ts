// Paired actual Base UI v1.8.0 Input/standalone Field.Control behavior supplements.
// Input.test.tsx has zero ordinary declarations. MIT: parity/input/UPSTREAM_LICENSE.
import { expect, test } from '@playwright/test';
for (const reference of [true, false]) {
  const framework = reference ? 'React' : 'Svelte';
  const suffix = reference ? '&reference' : '';
  for (const [scenario, expected] of [
    ['controlled-accept', 'edit'],
    ['controlled-reject', 'owner'],
    ['controlled-rewrite', 'EDIT'],
    ['controlled-default-accept', 'edit'],
    ['controlled-default-reject', 'owner'],
    ['controlled-default-rewrite', 'EDIT'],
  ] as const)
    test(`${framework} standalone controlled owner ${scenario}`, async ({ page }) => {
      await page.goto(`/input?case=${scenario}${suffix}`);
      await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
      const input = page.getByTestId('input');
      await expect(input).toHaveValue('owner');
      await input.fill('edit');
      await expect(input).toHaveValue(
        !reference && scenario.includes('reject') ? 'edit' : expected,
      );
      await expect(page.getByTestId('calls')).toHaveText(
        JSON.stringify([
          {
            value: 'edit',
            reason: 'none',
            type: 'input',
            canceled: false,
            defaultPrevented: false,
          },
        ]),
      );
      await expect(page.getByTestId('order')).toHaveText('["consumer","value"]');
      await page.getByRole('button', { name: 'Programmatic', exact: true }).click();
      await expect(input).toHaveValue('programmatic');
      await page.getByRole('button', { name: 'Reset', exact: true }).click();
      // Explicit user-directed native Svelte default/reset adaptation; no parity credit.
      await expect(input).toHaveValue(
        reference ? 'programmatic' : scenario.includes('default') ? 'seed' : '',
      );
      await expect(page.getByTestId('calls')).toHaveText(
        JSON.stringify([
          {
            value: 'edit',
            reason: 'none',
            type: 'input',
            canceled: false,
            defaultPrevented: false,
          },
        ]),
      );
    });
  for (const [scenario, calls, order] of [
    ['cancel', 1, '["consumer","value"]'],
    ['prevent-base', 0, '["consumer"]'],
    ['render-order', 1, '["render","consumer","value"]'],
  ] as const)
    test(`${framework} standalone native edit ordering and prevention ${scenario}`, async ({
      page,
    }) => {
      await page.goto(`/input?case=${scenario}${suffix}`);
      await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
      const input = page.getByTestId('input');
      await input.fill('edit');
      await expect(input).toHaveValue('edit');
      await expect(page.getByTestId('order')).toHaveText(order);
      expect(JSON.parse((await page.getByTestId('calls').textContent()) ?? '[]')).toHaveLength(
        calls,
      );
    });
  test(`${framework} standalone state and native validity stay distinct`, async ({ page }) => {
    await page.goto(`/input?case=required${suffix}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const input = page.getByTestId('input');
    await input.fill('');
    expect(await input.evaluate((node: HTMLInputElement) => node.checkValidity())).toBe(false);
    await input.focus();
    await input.press('Tab');
    expect(JSON.parse((await input.getAttribute('data-state')) ?? '{}')).toEqual({
      disabled: false,
      touched: false,
      dirty: false,
      filled: false,
      focused: false,
      valid: null,
    });
    for (const name of ['invalid', 'valid', 'dirty', 'touched', 'filled', 'focused'])
      await expect(input).not.toHaveAttribute(`data-${name}`);
  });
  test(`${framework} standalone canceled native reset preserves edit`, async ({ page }) => {
    await page.goto(`/input?case=reset-cancel${suffix}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const input = page.getByTestId('input');
    await input.fill('edit');
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(input).toHaveValue('edit');
  });
  test(`${framework} standalone native props, style, generated ID and replacement host`, async ({
    page,
  }) => {
    await page.goto(`/input?case=default${suffix}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const input = page.getByTestId('input');
    await input.fill('edit');
    await page.getByRole('button', { name: 'Props', exact: true }).click();
    await expect(input).toBeDisabled();
    await expect(input).toHaveAttribute('data-disabled', '');
    await expect(input).toHaveAttribute('name', 'renamed');
    await expect(input).toHaveAttribute('id', /^base-ui-/);
    await expect(input).toHaveClass('disabled-class');
    await expect(input).toHaveCSS('opacity', '0.5');
    await expect(input).toHaveValue('edit');
    await page.getByRole('button', { name: 'Replace', exact: true }).click();
    expect(await input.evaluate((node) => node.tagName)).toBe('TEXTAREA');
  });
  test(`${framework} controlled composition and prevention retain framework native value ownership`, async ({
    page,
  }) => {
    await page.goto(`/input?case=controlled-prevent-base${suffix}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const input = page.getByTestId('input');
    const immediate = await input.evaluate((node: HTMLInputElement) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(node, 'edit');
      node.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
      return node.value;
    });
    expect(immediate).toBe(reference ? 'owner' : 'edit');
    await expect(input).toHaveValue(reference ? 'owner' : 'edit');
    await expect(page.getByTestId('calls')).toHaveText('[]');
  });
  for (const [scenario, settled] of [
    ['controlled-accept', 'edit'],
    ['controlled-reject', 'owner'],
    ['controlled-rewrite', 'EDIT'],
  ] as const)
    test(`${framework} controlled native dispatch immediate and settled ${scenario}`, async ({
      page,
    }) => {
      await page.goto(`/input?case=${scenario}${suffix}`);
      await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
      const input = page.getByTestId('input');
      await expect(input).toHaveValue('owner');
      const immediate = await input.evaluate((node: HTMLInputElement) => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
          node,
          'edit',
        );
        node.dispatchEvent(new InputEvent('input', { bubbles: true }));
        return node.value;
      });
      // Explicit accepted I-03 native scheduling adaptation, never credited as parity.
      expect(immediate).toBe(reference ? settled : 'edit');
      await expect(input).toHaveValue(!reference && scenario.includes('reject') ? 'edit' : settled);
    });
}
test('Svelte Input IDs survive actual SSR hydration and remain unique', async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await request.get('/input?case=generated');
  const html = await response.text();
  expect(html).toContain('data-hydrated="false"');
  const serverIds = [...html.matchAll(/<input\b[^>]*\sid="([^"]+)"/g)].map((match) => match[1]);
  expect(serverIds).toHaveLength(3);
  expect(new Set(serverIds).size).toBe(3);
  await page.goto('/input?case=generated');
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  expect(await page.locator('input').evaluateAll((nodes) => nodes.map((node) => node.id))).toEqual(
    serverIds,
  );
  expect(errors).toEqual([]);
});
