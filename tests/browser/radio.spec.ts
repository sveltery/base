// Exact pinned source-family witness and native supplements; MIT: parity/radio/UPSTREAM_LICENSE.
import { expect, test } from '@playwright/test';
for (const framework of ['react', 'svelte']) {
  const open = async (
    page: import('@playwright/test').Page,
    scenario = 'default',
  ) => {
    await page.goto(
      `/radio?scenario=${scenario}${framework === 'react' ? '&reference=react' : ''}`,
    );
    await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
    if (framework === 'react')
      await expect(page.locator('main')).toHaveAttribute(
        'data-renderer',
        '19.2.8/19.2.8',
      );
  };
  test(`${framework} native hidden input CSS preserves source one-pixel geometry`, async ({
    page,
  }) => {
    await open(page);
    const geometry = await page
      .locator('input[type="radio"]')
      .evaluateAll((inputs) =>
        inputs.map((element) => {
          const input = element as HTMLInputElement;
          const bounds = input.getBoundingClientRect();
          return {
            width: input.style.width,
            height: input.style.height,
            margin: input.style.margin,
            actualWidth: bounds.width,
            actualHeight: bounds.height,
          };
        }),
      );
    expect(geometry).toEqual(
      Array.from({ length: 3 }, () => ({
        width: '1px',
        height: '1px',
        margin: '-1px',
        actualWidth: 1,
        actualHeight: 1,
      })),
    );
  });
  test(`${framework} source RadioRoot:18 checked data attributes and hidden successful control`, async ({
    page,
  }) => {
    await open(page);
    await expect(page.getByTestId('radio-b')).toHaveAttribute(
      'data-checked',
      '',
    );
    await expect(page.getByTestId('radio-b')).not.toHaveAttribute(
      'data-unchecked',
    );
    await expect(page.getByTestId('radio-a')).toHaveAttribute(
      'data-unchecked',
      '',
    );
    await expect(page.getByTestId('radio-a')).not.toHaveAttribute(
      'data-checked',
    );
    expect(await page.locator('input[type="radio"]').count()).toBe(3);
    expect(
      await page
        .locator('#form')
        .evaluate((form) =>
          new FormData(form as HTMLFormElement).getAll('choice'),
        ),
    ).toEqual(['b']);
  });
  test(`${framework} source RadioGroup:38 one value callback and authored ancestor handler with native delegated observations`, async ({
    page,
  }) => {
    await open(page);
    await page.locator('#form').evaluate((form) => {
      form.setAttribute('data-click-events', '0');
      form.addEventListener('click', () =>
        form.setAttribute(
          'data-click-events',
          String(Number(form.getAttribute('data-click-events')) + 1),
        ),
      );
    });
    await page.getByTestId('radio-a').click();
    await expect(page.getByTestId('radio-a')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(page.locator('#calls')).toHaveText(
      '[{"value":"a","reason":"none","type":"click","shiftKey":false}]',
    );
    expect(
      await page.locator('input[type="radio"]:checked').getAttribute('value'),
    ).toBe('a');
    await expect(page.locator('#form')).toHaveAttribute(
      'data-click-events',
      '2',
    );
    await expect(page.locator('#ancestor-clicks')).toHaveText('1');
    await page.getByTestId('radio-a').click();
    await expect(page.locator('#form')).toHaveAttribute(
      'data-click-events',
      '4',
    );
    await expect(page.locator('#ancestor-clicks')).toHaveText('2');
    await expect(page.locator('#calls')).toHaveText(
      '[{"value":"a","reason":"none","type":"click","shiftKey":false}]',
    );
  });
  test(`${framework} source RadioGroup:73 Space selects on keyup and Enter does not select`, async ({
    page,
  }) => {
    await open(page);
    await page.getByTestId('radio-a').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#calls')).toHaveText('[]');
    await page.keyboard.down('Space');
    await expect(page.locator('#calls')).toHaveText('[]');
    await page.keyboard.up('Space');
    await expect(page.getByTestId('radio-a')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(
      JSON.parse((await page.locator('#calls').textContent()) ?? '[]'),
    ).toHaveLength(1);
  });
  for (const scenario of ['cancel', 'native-button-cancel'])
    test(`${framework} ${scenario} native cancellation preserves source value and characterizes input/change phase`, async ({
      page,
    }) => {
      await open(page, scenario);
      await page.locator('#form').evaluate((form) => {
        form.setAttribute('data-input-events', '0');
        const count = () =>
          form.setAttribute(
            'data-input-events',
            String(Number(form.getAttribute('data-input-events')) + 1),
          );
        form.addEventListener('input', count);
        form.addEventListener('change', count);
      });
      await page.getByTestId('radio-a').click();
      await expect(page.getByTestId('radio-b')).toHaveAttribute(
        'aria-checked',
        'true',
      );
      await expect(page.locator('#form')).toHaveAttribute(
        'data-input-events',
        framework === 'react' ? '2' : '0',
      );
      expect(
        await page
          .locator('#form')
          .evaluate((form) =>
            new FormData(form as HTMLFormElement).getAll('choice'),
          ),
      ).toEqual(['b']);
    });
  for (const scenario of ['default', 'rtl', 'first-disabled', 'native-button'])
    test(`${framework} ${scenario} Composite arrow selection, roving focus and looping`, async ({
      page,
    }) => {
      await open(page, scenario);
      await expect(page.getByTestId('radio-b')).toHaveAttribute(
        'tabindex',
        '0',
      );
      await page.getByTestId('radio-b').focus();
      await page.keyboard.press(
        scenario === 'rtl' ? 'ArrowLeft' : 'ArrowRight',
      );
      await expect(page.getByTestId('radio-c')).toBeFocused();
      await expect(page.getByTestId('radio-c')).toHaveAttribute(
        'aria-checked',
        'true',
      );
      await page.keyboard.press(
        scenario === 'rtl' ? 'ArrowLeft' : 'ArrowRight',
      );
      await expect(
        page.getByTestId(scenario === 'first-disabled' ? 'radio-b' : 'radio-a'),
      ).toBeFocused();
      expect(await page.locator('[role="radio"][tabindex="0"]').count()).toBe(
        1,
      );
    });
  for (const scenario of ['disabled', 'readonly'])
    test(`${framework} ${scenario} suppresses selection and source callback`, async ({
      page,
    }) => {
      await open(page, scenario);
      await page.getByTestId('radio-a').click({ force: true });
      await expect(page.getByTestId('radio-b')).toHaveAttribute(
        'aria-checked',
        'true',
      );
      await expect(page.locator('#calls')).toHaveText('[]');
    });
  test(`${framework} labels, Field registration and required Form validation`, async ({
    page,
  }) => {
    await open(page, 'empty-required');
    await expect(page.locator('#label-a')).toHaveAttribute('for', 'input-a');
    await expect(page.getByTestId('radio-a')).toHaveAttribute(
      'aria-labelledby',
      'label-a',
    );
    await expect(page.getByTestId('radio-a')).toHaveAttribute(
      'aria-describedby',
      'description',
    );
    await page.locator('#submit').click();
    await expect(page.locator('#submissions')).toHaveText('[]');
    await expect(page.locator('#field')).toHaveAttribute('data-invalid', '');
    await page.locator('#label-a').click();
    await expect(page.getByTestId('radio-a')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await page.locator('#submit').click();
    await expect(page.locator('#submissions')).toHaveText('[{"choice":"a"}]');
  });
  test(`${framework} complete Composite list reorder and removal retain one entry point`, async ({
    page,
  }) => {
    await open(page);
    await page.getByRole('button', { name: 'Reorder', exact: true }).click();
    await expect(page.getByTestId('radio-b')).toHaveAttribute('tabindex', '0');
    await page.getByTestId('radio-b').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('radio-c')).toBeFocused();
    await page
      .getByRole('button', { name: 'Remove selected', exact: true })
      .click();
    expect(await page.locator('[role="radio"][tabindex="0"]').count()).toBe(1);
    await page.getByRole('button', { name: 'Remove all', exact: true }).click();
    expect(await page.locator('input[type="radio"]').count()).toBe(0);
    await page.locator('#submit').click();
    await expect(page.locator('#submissions')).toHaveText('[{"choice":null}]');
  });
  test(`${framework} controlled accepted state and programmatic changes stay synchronized`, async ({
    page,
  }) => {
    await open(page, 'controlled');
    await page.getByTestId('radio-a').click();
    await expect(page.getByTestId('radio-a')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await page
      .getByRole('button', { name: 'Programmatic', exact: true })
      .click();
    await expect(page.getByTestId('radio-c')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(
      await page.locator('input[type="radio"]:checked').getAttribute('value'),
    ).toBe('c');
  });
  for (const scenario of ['default', 'controlled'])
    test(`${framework} ${scenario} native reset follows each renderer's checked defaults`, async ({
      page,
    }) => {
      await open(page, scenario);
      const initialDefaultValues = await page
        .locator('input[type="radio"]')
        .evaluateAll((inputs) =>
          inputs
            .filter((input) => (input as HTMLInputElement).defaultChecked)
            .map((input) => (input as HTMLInputElement).value),
        );
      await page.getByTestId('radio-a').click();
      await expect(page.getByTestId('radio-a')).toHaveAttribute(
        'aria-checked',
        'true',
      );
      const calls = await page.locator('#calls').textContent();
      const defaultValues = await page
        .locator('input[type="radio"]')
        .evaluateAll((inputs) =>
          inputs
            .filter((input) => (input as HTMLInputElement).defaultChecked)
            .map((input) => (input as HTMLInputElement).value),
        );
      await page.locator('#reset').click();
      expect(
        await page
          .locator('#form')
          .evaluate((form) =>
            new FormData(form as HTMLFormElement).getAll('choice'),
          ),
      ).toEqual(defaultValues);
      await expect(page.getByTestId('radio-a')).toHaveAttribute(
        'aria-checked',
        'true',
      );
      await expect(page.locator('#calls')).toHaveText(calls ?? '[]');
      await test.info().attach('native-reset-observation', {
        body: JSON.stringify({
          framework,
          scenario,
          initialDefaultValues,
          defaultValues,
        }),
        contentType: 'application/json',
      });
    });
  test(`${framework} source external form association projects null into the context owner Form`, async ({
    page,
  }) => {
    await open(page, 'external-form');
    expect(
      await page
        .locator('#form')
        .evaluate((form) =>
          new FormData(form as HTMLFormElement).getAll('choice'),
        ),
    ).toEqual([]);
    expect(
      await page
        .locator('#external-form')
        .evaluate((form) =>
          new FormData(form as HTMLFormElement).getAll('choice'),
        ),
    ).toEqual(['b']);
    await page.locator('#submit').click();
    await expect(page.locator('#submissions')).toHaveText('[{"choice":null}]');
  });
  test(`${framework} native controlled rejection characterization preserves framework defaults`, async ({
    page,
  }) => {
    await open(page, 'controlled-reject');
    await page.getByTestId('radio-a').click();
    await expect(page.getByTestId('radio-b')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    // Native framework characterization; divergent expectations receive zero source credit.
    expect(
      await page.locator('input[type="radio"]:checked').getAttribute('value'),
    ).toBe(framework === 'react' ? 'b' : 'a');
  });
}
test('Svelte SSR/no JavaScript radios preserve native initial successful input values', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/radio');
  expect(await page.locator('input[type="radio"]').count()).toBe(3);
  await expect(page.getByTestId('radio-b')).toHaveAttribute(
    'aria-checked',
    'true',
  );
  expect(
    await page.locator('input[type="radio"][checked]').getAttribute('value'),
  ).toBe('b');
  await context.close();
});

test('Svelte source SSR hydration preserves initial values without hydration warnings', async ({
  page,
}) => {
  const diagnostics: string[] = [];
  page.on('console', (message) => {
    if (/hydration/i.test(message.text())) diagnostics.push(message.text());
  });
  const response = await page.goto('/radio');
  expect(response).not.toBe(null);
  const serverMarkup = await response!.text();
  expect(serverMarkup).toMatch(/value="b"[^>]*checked/);
  await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
  expect(
    await page
      .locator('#form')
      .evaluate((form) =>
        new FormData(form as HTMLFormElement).getAll('choice'),
      ),
  ).toEqual(['b']);
  expect(diagnostics).toEqual([]);
});
