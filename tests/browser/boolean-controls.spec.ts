// Actual pinned Base UI1.8/React19.2.8 and native Svelte checked-family witnesses.
// Supplemental contracts and explicit native boundaries; zero ordinary parity credit.
import { expect, test, type Page } from '@playwright/test';
async function setup(
  page: Page,
  family: 'switch' | 'checkbox',
  scenario: string,
  reference: boolean,
) {
  await page.goto(
    `/boolean-controls?family=${family}&case=${scenario}${reference ? '&reference' : ''}`,
  );
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  if (reference) {
    await expect(page.locator('main')).toHaveAttribute('data-reference-react', '19.2.8');
    await expect(page.locator('main')).toHaveAttribute('data-reference-react-dom', '19.2.8');
  }
  return page.locator('[data-control]');
}
async function json(page: Page, id: string) {
  return JSON.parse((await page.locator(`#${id}`).textContent()) ?? 'null');
}
async function data(page: Page, id = 'form') {
  return page
    .locator(`#${id}`)
    .evaluate((form) => [...new FormData(form as HTMLFormElement).entries()]);
}
for (const reference of [false, true])
  for (const family of ['switch', 'checkbox'] as const) {
    const prefix = `${reference ? 'React19.2.8' : 'Svelte'} ${family}`;
    test(`${prefix} native label association follows the control's actual shadow tree`, async ({
      page,
    }) => {
      const control = await setup(page, family, 'shadow-label', reference);
      await expect(page.locator('[data-shadow-host] input[type="checkbox"]')).toHaveCount(1);
      await expect(control).not.toHaveAttribute('aria-labelledby');
      await page.getByRole('button', { name: 'Mount label', exact: true }).click();
      await expect(control).toHaveAttribute('aria-labelledby', 'native-label-a');
      await page.getByRole('button', { name: 'Change label id', exact: true }).click();
      await expect(control).toHaveAttribute('aria-labelledby', 'native-label-b');
      await page.getByRole('button', { name: 'Unlink label', exact: true }).click();
      await expect(control).not.toHaveAttribute('aria-labelledby');
      await page.getByRole('button', { name: 'Link label', exact: true }).click();
      await expect(control).toHaveAttribute('aria-labelledby', 'native-label-b');
      await page.getByRole('button', { name: 'Clear label id', exact: true }).click();
      await expect(control).toHaveAttribute('aria-labelledby', 'label-control-label');
      await expect(page.locator('[data-shadow-host] label')).toHaveAttribute(
        'id',
        'label-control-label',
      );
      await page.getByRole('button', { name: 'Remove label', exact: true }).click();
      await expect(control).not.toHaveAttribute('aria-labelledby');
    });
    test(`${prefix} native click owns one checked Field, labels and successful controls`, async ({
      page,
    }) => {
      const control = await setup(page, family, 'default', reference);
      await expect(page.locator('#form input[type="checkbox"]')).toHaveCount(1);
      expect(
        await page.locator('#form input[type="checkbox"]').evaluate((input) => {
          const element = input as HTMLInputElement;
          const bounds = element.getBoundingClientRect();
          return {
            width: element.style.width,
            height: element.style.height,
            margin: element.style.margin,
            position: getComputedStyle(element).position,
            bounds: [bounds.width, bounds.height],
          };
        }),
      ).toEqual({
        width: '1px',
        height: '1px',
        margin: '-1px',
        position: 'absolute',
        bounds: [1, 1],
      });
      await expect(page.locator('#label')).toHaveAttribute('for', 'control-input');
      await expect(control).toHaveAttribute('aria-labelledby', 'label');
      await expect(control).toHaveAttribute('aria-describedby', 'description');
      expect(await data(page)).toEqual([['enabled', 'no']]);
      await control.click();
      await expect(control).toHaveAttribute('aria-checked', 'true');
      expect(await data(page)).toEqual([['enabled', 'yes']]);
      await page.locator('#submit').click();
      expect(await json(page, 'submissions')).toEqual([{ enabled: true }]);
      expect(await json(page, 'calls')).toEqual([{ checked: true, type: 'click', reason: 'none' }]);
    });
    test(`${prefix} canceled checked activation records the native input phase and Field state`, async ({
      page,
    }) => {
      const control = await setup(page, family, 'cancel', reference);
      await control.click();
      await expect(control).toHaveAttribute('aria-checked', 'false');
      await expect(page.locator('#form input[type="checkbox"]')).not.toBeChecked();
      await expect(control).not.toHaveAttribute('data-dirty');
      await expect(control).not.toHaveAttribute('data-filled');
      await expect(page.locator('#input-events')).toHaveText(reference ? '1' : '0');
      expect(await data(page)).toEqual([['enabled', 'no']]);
      await page.getByRole('button', { name: 'Toggle cancellation', exact: true }).click();
      await control.click();
      await expect(control).toHaveAttribute('aria-checked', 'true');
      await expect(page.locator('#input-events')).toHaveText(reference ? '2' : '1');
    });
    test(`${prefix} controlled owner and required validation preserve boolean registration`, async ({
      page,
    }) => {
      let control = await setup(page, family, 'controlled', reference);
      await control.click();
      await expect(control).toHaveAttribute('aria-checked', 'true');
      await page.getByRole('button', { name: 'Owner toggle', exact: true }).click();
      await expect(control).toHaveAttribute('aria-checked', 'false');
      await expect(page.locator('#form input[type="checkbox"]')).not.toBeChecked();
      control = await setup(page, family, 'required', reference);
      await page.locator('#submit').click();
      await expect(control).toBeFocused();
      await expect(control).toHaveAttribute('aria-invalid', 'true');
      expect(await json(page, 'submissions')).toEqual([]);
      await expect(page.locator('#error')).toHaveCount(1);
      await control.click();
      await expect(control).not.toHaveAttribute('aria-invalid');
      await page.locator('#submit').click();
      expect(await json(page, 'submissions')).toEqual([{ enabled: true }]);
    });
    test(`${prefix} source external errors clear on accepted checked change and registration cleans up`, async ({
      page,
    }) => {
      const control = await setup(page, family, 'default', reference);
      await page.getByRole('button', { name: 'Server error', exact: true }).click();
      await expect(page.locator('#error')).toHaveText('Server error');
      await expect(control).toHaveAttribute('aria-invalid', 'true');
      await control.click();
      await expect(page.locator('#error')).toHaveCount(0);
      await expect(control).not.toHaveAttribute('aria-invalid');
      await page.getByRole('button', { name: 'Unmount', exact: true }).click();
      await expect(control).toHaveCount(0);
      await expect(page.locator('#form input[type="checkbox"]')).toHaveCount(0);
      await page.locator('#submit').click();
      expect(await json(page, 'submissions')).toEqual([{}]);
    });
    test(`${prefix} keyboard Space checks root and Enter follows component semantics`, async ({
      page,
    }) => {
      const control = await setup(page, family, 'default', reference);
      await control.focus();
      await control.press('Space');
      await expect(control).toHaveAttribute('aria-checked', 'true');
      await control.press('Enter');
      if (family === 'switch') {
        await expect(control).toHaveAttribute('aria-checked', 'false');
        expect(await json(page, 'submissions')).toEqual([]);
      } else {
        await expect(control).toHaveAttribute('aria-checked', 'true');
        expect(await json(page, 'submissions')).toEqual([{ enabled: true }]);
      }
    });
    test(`${prefix} custom native button has one hidden input and keyboard activation`, async ({
      page,
    }) => {
      const control = await setup(page, family, 'native', reference);
      await expect(control).toHaveAttribute('id', 'control-input');
      expect(await control.evaluate((element) => element.tagName)).toBe('BUTTON');
      await expect(page.locator('#form input[type="checkbox"]')).toHaveCount(1);
      await control.focus();
      await control.press('Space');
      await expect(control).toHaveAttribute('aria-checked', 'true');
      await control.press('Enter');
      if (family === 'switch') await expect(control).toHaveAttribute('aria-checked', 'false');
      else {
        await expect(control).toHaveAttribute('aria-checked', 'true');
        expect(await json(page, 'submissions')).toEqual([{ enabled: true }]);
      }
    });
    test(`${prefix} readonly and disabled controls exclude checked changes`, async ({ page }) => {
      for (const scenario of ['readonly', 'disabled']) {
        const control = await setup(page, family, scenario, reference);
        await control.click({ force: true });
        await expect(control).toHaveAttribute('aria-checked', 'false');
        expect(await json(page, 'calls')).toEqual([]);
        if (scenario === 'disabled') expect(await data(page)).toEqual([]);
      }
    });
    test(`${prefix} authored native defaults and reset have an explicit framework boundary`, async ({
      page,
    }) => {
      for (const initial of [false, true]) {
        const control = await setup(page, family, initial ? 'reset-true' : 'default', reference);
        const input = page.locator('#form input[type="checkbox"]');
        expect(
          await input.evaluate((element) => (element as HTMLInputElement).defaultChecked),
        ).toBe(initial);
        await control.click();
        await expect(control).toHaveAttribute('aria-checked', String(!initial));
        await page.locator('#reset').click();
        expect(await input.isChecked()).toBe(initial);
        await expect(control).toHaveAttribute(
          'aria-checked',
          String(reference ? !initial : initial),
        );
        if (reference)
          expect(await data(page)).toEqual(
            initial
              ? [
                  ['enabled', 'no'],
                  ['enabled', 'yes'],
                ]
              : [],
          );
        else {
          expect(await data(page)).toEqual([['enabled', initial ? 'yes' : 'no']]);
          await expect(control).not.toHaveAttribute('data-dirty');
          await control.click();
          await expect(control).toHaveAttribute('aria-checked', String(!initial));
          expect(
            (await json(page, 'calls')).map((call: { checked: boolean }) => call.checked),
          ).toEqual([!initial, !initial]);
        }
      }
    });
    test(`${prefix} canceled form reset and rejected controlled owner are measured`, async ({
      page,
    }) => {
      let control = await setup(page, family, 'default', reference);
      await control.click();
      await page.locator('#form').evaluate((form) =>
        form.addEventListener('reset', (event) => event.preventDefault(), {
          once: true,
        }),
      );
      await page.locator('#reset').click();
      // Same canceled native reset-button result as the literal Svelte witness.
      await expect(control).toHaveAttribute('aria-checked', String(reference));
      expect(await page.locator('#form input[type="checkbox"]').isChecked()).toBe(reference);
      expect(await data(page)).toEqual([['enabled', reference ? 'yes' : 'no']]);
      control = await setup(page, family, 'controlled-reject', reference);
      await control.click();
      await expect(control).toHaveAttribute('aria-checked', 'false');
      expect(await page.locator('#form input[type="checkbox"]').isChecked()).toBe(!reference);
      expect(await data(page)).toEqual(
        reference
          ? [['enabled', 'no']]
          : [
              ['enabled', 'no'],
              ['enabled', 'yes'],
            ],
      );
      await page.locator('#submit').click();
      expect(await json(page, 'submissions')).toEqual([{ enabled: false }]);
    });
  }
for (const reference of [false, true]) {
  const prefix = reference ? 'React19.2.8' : 'Svelte';
  test(`${prefix} CheckboxGroup retains owned selection while native reset changes successful values`, async ({
    page,
  }) => {
    await setup(page, 'checkbox', 'group', reference);
    const child = page.locator('[data-child="a"]');
    await child.click();
    await expect(child).toHaveAttribute('aria-checked', 'true');
    await page.locator('#group-form').evaluate((form) => (form as HTMLFormElement).reset());
    await expect(page.locator('#group-form input[type="checkbox"]').nth(1)).not.toBeChecked();
    await expect(child).toHaveAttribute('aria-checked', 'true');
    await expect(child).toHaveAttribute('data-filled', '');
    expect(await data(page, 'group-form')).toEqual([]);
    await page.locator('#group-submit').click();
    expect(await json(page, 'submissions')).toEqual([{ choices: reference ? ['a'] : [] }]);
  });
  test(`${prefix} CheckboxGroup parent and children share one array Field registration`, async ({
    page,
  }) => {
    await setup(page, 'checkbox', 'group', reference);
    const parent = page.locator('[data-parent-control]'),
      a = page.locator('[data-child="a"]'),
      b = page.locator('[data-child="b"]');
    await a.click();
    await expect(parent).toHaveAttribute('aria-checked', 'mixed');
    expect(await parent.getAttribute('aria-controls')).toBe(
      `${await a.getAttribute('id')} ${await b.getAttribute('id')}`,
    );
    await page.locator('#group-submit').click();
    expect(await json(page, 'submissions')).toEqual([{ choices: ['a'] }]);
    expect(await data(page, 'group-form')).toEqual([['choices', 'a']]);
    await parent.click();
    await expect(a).toHaveAttribute('aria-checked', 'true');
    await expect(b).toHaveAttribute('aria-checked', 'true');
  });
  test(`${prefix} ancestor default prevention cancels Checkbox Enter submission`, async ({
    page,
  }) => {
    for (const scenario of ['ancestor-prevent', 'native-ancestor-prevent']) {
      const control = await setup(page, 'checkbox', scenario, reference);
      await control.focus();
      await control.press('Enter');
      await expect(control).toHaveAttribute('aria-checked', 'false');
      expect(await json(page, 'submissions')).toEqual([]);
      expect(await json(page, 'calls')).toEqual([]);
    }
  });
  test(`${prefix} actual stopPropagation native boundary is recorded separately`, async ({
    page,
  }) => {
    let control = await setup(page, 'checkbox', 'ancestor-stop', reference);
    await control.focus();
    await control.press('Enter');
    await expect(control).toHaveAttribute('aria-checked', 'false');
    expect(await json(page, 'submissions')).toEqual(reference ? [{ enabled: false }] : []);
    control = await setup(page, 'checkbox', 'native-ancestor-stop', reference);
    await control.focus();
    await control.press('Enter');
    await expect(control).toHaveAttribute('aria-checked', reference ? 'false' : 'true');
    expect(await json(page, 'submissions')).toEqual(reference ? [{ enabled: false }] : []);
  });
  test(`${prefix} later native window handler cannot retroactively change Svelte submission`, async ({
    page,
  }) => {
    const control = await setup(page, 'checkbox', 'default', reference);
    await page
      .getByRole('button', { name: 'Install late window cancellation', exact: true })
      .click();
    await control.focus();
    await control.press('Enter');
    await expect(control).toHaveAttribute('aria-checked', 'false');
    expect(await json(page, 'submissions')).toEqual([{ enabled: false }]);
  });
}
// Authored native lifetime supplement; no unchanged React assertion credit.
test('native Checkbox unmount after target delegation releases its marked-event window listener', async ({
  page,
}) => {
  const control = await setup(page, 'checkbox', 'default', false);
  await page.getByRole('button', { name: 'Arm Enter unmount after target', exact: true }).click();
  await control.focus();
  await control.press('Enter');
  await expect(control).toHaveCount(0);
  await expect(page.locator('#enter-default-prevented')).toHaveText('false');
  expect(await json(page, 'submissions')).toEqual([]);
  expect(await json(page, 'calls')).toEqual([]);
});
test('literal Svelte binding measures canceled native reset button separately from imperative reset', async ({
  page,
}) => {
  await setup(page, 'checkbox', 'literal-bind-reset', false);
  const input = page.locator('#form input[type="checkbox"]');
  await input.click();
  await expect(page.locator('#owner')).toHaveText('true');
  await page
    .locator('#form')
    .evaluate((form) =>
      form.addEventListener('reset', (event) => event.preventDefault(), { once: true }),
    );
  await page.locator('#reset').click();
  await expect(page.locator('#owner')).toHaveText('false');
  await expect(input).not.toBeChecked();
  await input.click();
  await expect(page.locator('#owner')).toHaveText('true');
  await page.locator('#form').evaluate((form) => {
    form.addEventListener('reset', (event) => event.preventDefault(), { once: true });
    HTMLFormElement.prototype.reset.call(form);
  });
  await expect(page.locator('#owner')).toHaveText('true');
  await expect(input).toBeChecked();
});
