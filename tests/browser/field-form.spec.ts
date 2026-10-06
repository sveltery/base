// Actual exact-pin React/Svelte text-input witnesses. Supplements add zero ordinary site credit.
import { expect, test, type Page } from '@playwright/test';
async function setup(page: Page, scenario: string, reference: boolean) {
  await page.goto(`/field-form?case=${scenario}${reference ? '&reference' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  return page.locator('#field').locator('input,textarea');
}
async function read(page: Page, id: string) {
  return JSON.parse((await page.locator(`#${id}`).textContent()) ?? 'null');
}
for (const reference of [false, true]) {
  const framework = reference ? 'React' : 'Svelte';
  test(`${framework} label/control associations and message cleanup follow changed and removed explicit ids`, async ({
    page,
  }) => {
    const input = await setup(page, 'native', reference);
    await expect(page.locator('#field-label')).toHaveAttribute('for', 'control-a');
    await expect(input).toHaveAttribute('aria-labelledby', 'field-label');
    await expect(input).toHaveAttribute('aria-describedby', 'external description');
    await page.getByRole('button', { name: 'Change id', exact: true }).click();
    await expect(input).toHaveAttribute('id', 'control-b');
    await expect(page.locator('#field-label')).toHaveAttribute('for', 'control-b');
    await page.getByRole('button', { name: 'Remove id', exact: true }).click();
    await expect(input).toHaveAttribute('id', /^base-ui-/);
    expect(await page.locator('#field-label').getAttribute('for')).toBe(
      await input.getAttribute('id'),
    );
    await page.getByRole('button', { name: 'Hide description', exact: true }).click();
    await expect(input).toHaveAttribute('aria-describedby', 'external');
  });
  test(`${framework} required submit blocks callbacks, focuses/selects the invalid control and revalidates on change`, async ({
    page,
  }) => {
    const input = await setup(page, 'native', reference);
    await expect(page.locator('#error')).toHaveCount(0);
    await page.locator('#submit').click();
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(await read(page, 'submissions')).toEqual([]);
    await input.fill('valid');
    await expect(input).not.toHaveAttribute('aria-invalid');
    await expect(page.locator('#error')).toHaveCount(0);
    await page.locator('#submit').click();
    expect(await read(page, 'submissions')).toEqual([
      'native',
      { values: { email: 'valid' }, reason: 'none' },
    ]);
  });
  test(`${framework} empty control id excludes consolidated registration and restores it after a valid id returns`, async ({
    page,
  }) => {
    const input = await setup(page, 'custom-onSubmit', reference);
    await input.fill('valid');
    await page.getByRole('button', { name: 'Empty id', exact: true }).click();
    await expect(input).toHaveAttribute('id', '');
    await page.locator('#submit').click();
    expect(await read(page, 'submissions')).toEqual(['native', { values: {}, reason: 'none' }]);
    expect(await read(page, 'validations')).toEqual([]);
    await page.getByRole('button', { name: 'Change id', exact: true }).click();
    await page.locator('#submit').click();
    expect((await read(page, 'submissions')).at(-1)).toEqual({
      values: { email: 'valid' },
      reason: 'none',
    });
    expect((await read(page, 'validations')).at(-1)).toEqual({
      value: 'valid',
      values: { email: 'valid' },
    });
  });
  for (const mode of ['onBlur', 'onChange', 'onSubmit'])
    test(`${framework} custom validation boundary ${mode} and visible messages`, async ({
      page,
    }) => {
      const input = await setup(page, `custom-${mode}`, reference);
      await input.fill('wrong');
      if (mode === 'onBlur') {
        expect(await read(page, 'validations')).toEqual([]);
        await input.blur();
      } else if (mode === 'onSubmit') {
        expect(await read(page, 'validations')).toEqual([]);
        await page.locator('#submit').click();
      }
      await expect(page.locator('#error')).toHaveText('custom error');
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await input.fill('valid');
      if (mode === 'onBlur') await input.blur();
      await expect(page.locator('#error')).toHaveCount(0);
      await expect(input).not.toHaveAttribute('aria-invalid');
      expect((await read(page, 'validations')).at(-1)).toEqual({
        value: 'valid',
        values: { email: 'valid' },
      });
    });
  test(`${framework} async validation publishes neutral pending state and ignores superseded results`, async ({
    page,
  }) => {
    const input = await setup(page, 'async-onChange', reference);
    await input.fill('slow');
    await expect.poll(async () => (await read(page, 'validity')).validity.valid).toBe(null);
    await input.fill('valid');
    await expect.poll(async () => (await read(page, 'validity')).validity.valid).toBe(true);
    await page.waitForTimeout(220);
    await expect(page.locator('#error')).toHaveCount(0);
    expect((await read(page, 'validity')).value).toBe('valid');
  });
  test(`${framework} debounce is canceled when the actual control disappears`, async ({ page }) => {
    const input = await setup(page, 'debounce-onChange', reference);
    await input.fill('wrong');
    await page.getByRole('button', { name: 'Remove control', exact: true }).click();
    await page.waitForTimeout(130);
    expect(await read(page, 'validations')).toEqual([]);
    await expect(page.locator('#error')).toHaveCount(0);
  });
  test(`${framework} Form external errors are visible and cleared by native edits; empty arrays do not invalidate`, async ({
    page,
  }) => {
    const input = await setup(page, 'native', reference);
    await page.getByRole('button', { name: 'Server errors', exact: true }).click();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#error')).toHaveText('server error');
    await input.fill('edited');
    await expect(input).not.toHaveAttribute('aria-invalid');
    await page.getByRole('button', { name: 'Empty errors', exact: true }).click();
    await expect(page.locator('#error')).toHaveCount(0);
  });
  test(`${framework} disabled Fieldset excludes controls from consolidated values and reenabling keeps baseline`, async ({
    page,
  }) => {
    const input = await setup(page, 'native', reference);
    await input.fill('value');
    await page.getByRole('button', { name: 'Disable', exact: true }).click();
    await expect(input).toBeDisabled();
    await expect(page.locator('#field')).toHaveAttribute('data-disabled', '');
    await page.locator('#submit').click();
    expect((await read(page, 'submissions')).at(-1)).toEqual({ values: {}, reason: 'none' });
    await page.getByRole('button', { name: 'Enable', exact: true }).click();
    await page.locator('#submit').click();
    expect((await read(page, 'submissions')).at(-1)).toEqual({
      values: { email: 'value' },
      reason: 'none',
    });
  });
  for (const scenario of [
    'controlled-reject',
    'controlled-accept',
    'controlled-rewrite',
    'controlled-input-accept',
    'controlled-replacement-accept',
  ])
    test(`${framework} ${scenario} only owner values update Field`, async ({ page }) => {
      const input = await setup(page, scenario, reference);
      await input.fill('edit');
      const expected = scenario.includes('accept')
        ? 'edit'
        : scenario.includes('rewrite')
          ? 'EDIT'
          : 'seed';
      await expect(input).toHaveValue(
        !reference && scenario.includes('reject') ? 'edit' : expected,
      );
      if (scenario.includes('reject'))
        await expect(page.locator('#field')).not.toHaveAttribute('data-dirty');
      else await expect(page.locator('#field')).toHaveAttribute('data-dirty', '');
      await page.getByRole('button', { name: 'Programmatic', exact: true }).click();
      await expect(input).toHaveValue('programmatic');
      await expect(page.locator('#field')).toHaveAttribute('data-filled', '');
    });
  test(`${framework} textarea replacement and named actions validate the current DOM value`, async ({
    page,
  }) => {
    await setup(page, 'custom-onSubmit', reference);
    await page.getByRole('button', { name: 'Textarea', exact: true }).click();
    const textarea = page.locator('#field textarea');
    await textarea.fill('wrong');
    await page.getByRole('button', { name: 'Validate field', exact: true }).click();
    await expect(page.locator('#error')).toHaveText('custom error');
    expect((await read(page, 'validations')).at(-1)).toEqual({
      value: 'wrong',
      values: { email: 'wrong' },
    });
    await textarea.fill('valid');
    await page.getByRole('button', { name: 'Validate form', exact: true }).click();
    await expect(page.locator('#error')).toHaveCount(0);
  });
  test(`${framework} native reset restores an uncontrolled default without fabricating a change callback or clearing Field state`, async ({
    page,
  }) => {
    const input = await setup(page, 'native', reference);
    await input.fill('edit');
    const before = await read(page, 'calls');
    await page.locator('#reset').click();
    await expect(input).toHaveValue('');
    expect(await read(page, 'calls')).toEqual(before);
    await expect(page.locator('#field')).toHaveAttribute('data-dirty', '');
  });
  test(`${framework} native FormData ownership and contextual onFormSubmit projection remain distinct after reassociation`, async ({
    page,
  }) => {
    const input = await setup(page, 'native', reference);
    await input.fill('value');
    await page.getByRole('button', { name: 'Reassociate', exact: true }).click();
    expect(
      await page
        .locator('#form')
        .evaluate((node: HTMLFormElement) => new FormData(node).get('email')),
    ).toBe(null);
    expect(
      await page
        .locator('#other-form')
        .evaluate((node: HTMLFormElement) => new FormData(node).get('email')),
    ).toBe('value');
    await page.locator('#submit').click();
    expect((await read(page, 'submissions')).at(-1)).toEqual({
      values: { email: 'value' },
      reason: 'none',
    });
  });
}
for (const initialClient of [false, true])
  test(`supplement Field.Error messages follow a literal Svelte list with initialClient=${initialClient}`, async ({
    page,
    browser,
  }, testInfo) => {
    const reference = await browser.newPage();
    const nativeList = await browser.newPage();
    const observations: {
      stage: string;
      selectedMessages: string[];
      fieldRows: string[];
      literalRows: string[];
      reactRows: string[];
      unchangedParityCredit: number;
    }[] = [];
    try {
      const nativeInput = await setup(page, 'duplicates-custom-onChange', false),
        referenceInput = await setup(reference, 'duplicates-custom-onChange', true);
      await nativeList.goto('/field-error-native');
      await expect(nativeList.locator('main')).toHaveAttribute('data-hydrated', 'true');
      const check = async (stage: string, selectedMessages: string[], reactRows: string[]) => {
        await expect(page.locator('#error li')).toHaveText(selectedMessages);
        await expect(nativeList.locator('#native-error li')).toHaveText(selectedMessages);
        await expect(reference.locator('#error li')).toHaveText(reactRows);
        observations.push({
          stage,
          selectedMessages,
          fieldRows: await page.locator('#error li').allTextContents(),
          literalRows: await nativeList.locator('#native-error li').allTextContents(),
          reactRows: await reference.locator('#error li').allTextContents(),
          unchangedParityCredit: 0,
        });
      };
      if (initialClient) {
        await referenceInput.fill('first');
        await nativeInput.fill('first');
        await expect(reference.locator('#validity')).toContainText('"value":"first"');
        await expect(page.locator('#validity')).toContainText('"value":"first"');
        await nativeList.getByRole('button', { name: 'Client messages', exact: true }).click();
        await check('initial-client', ['same', 'same'], ['same', 'same']);
      }
      await reference.getByRole('button', { name: 'Server duplicates', exact: true }).click();
      await page.getByRole('button', { name: 'Server duplicates', exact: true }).click();
      await nativeList.getByRole('button', { name: 'Server messages', exact: true }).click();
      await check(
        'server',
        ['duplicate', 'duplicate'],
        initialClient ? ['same', 'duplicate', 'duplicate'] : ['duplicate', 'duplicate'],
      );
      const clientReactRows = initialClient
        ? ['same', 'duplicate', 'same', 'same']
        : ['duplicate', 'same', 'same'];
      for (const value of ['changed', 'again']) {
        await referenceInput.fill(value);
        await nativeInput.fill(value);
        await expect(reference.locator('#validity')).toContainText(`"value":"${value}"`);
        await expect(page.locator('#validity')).toContainText(`"value":"${value}"`);
        await nativeList.getByRole('button', { name: 'Client messages', exact: true }).click();
        await check(value, ['same', 'same'], clientReactRows);
        expect((await read(page, 'validity')).errors).toEqual(['same', 'same']);
        expect((await read(reference, 'validity')).errors).toEqual(['same', 'same']);
      }
      await reference.getByRole('button', { name: 'Empty errors', exact: true }).click();
      await page.getByRole('button', { name: 'Empty errors', exact: true }).click();
      await check('empty-external', ['same', 'same'], clientReactRows);
    } finally {
      await testInfo.attach('native-error-message-observations', {
        body: JSON.stringify(
          { sourcePin: '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c', initialClient, observations },
          null,
          2,
        ),
        contentType: 'application/json',
      });
      await reference.close();
      await nativeList.close();
    }
  });
