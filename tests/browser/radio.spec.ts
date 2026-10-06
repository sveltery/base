// Exact pinned source-family witness and native supplements; MIT: parity/radio/UPSTREAM_LICENSE.
import { expect, test } from '@playwright/test';
for (const framework of ['react']) {
  test(`${framework} nested Composite shared host preserves outer metadata, repeated updates and navigation`, async ({
    page,
  }) => {
    await page.goto(`/composite-nested${framework === 'react' ? '?reference=react' : ''}`);
    await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
    if (framework === 'react') {
      await expect(page.locator('main')).toHaveAttribute('data-renderer', '19.2.8/19.2.8');
    }
    const snapshots: unknown[] = [];
    const readMap = async () =>
      JSON.parse(await page.locator('#nested-map').innerText()) as Record<string, unknown>[];
    const assertOuter = async (phase: string) => {
      await expect
        .poll(async () => (await readMap()).find((item) => item.testId === 'shared'))
        .toMatchObject({
          owner: 'outer',
          disabled: true,
          focusableWhenDisabled: true,
          index: 1,
        });
      await expect.poll(async () => (await readMap()).length).toBe(3);
      await page.getByTestId('first').focus();
      await page.getByTestId('first').press('ArrowRight');
      await expect(page.getByTestId('shared')).toBeFocused();
      snapshots.push({ phase, map: await readMap(), focused: 'shared' });
    };
    await assertOuter('mount');
    for (let revision = 1; revision <= 3; revision += 1) {
      await page.locator('#update-inner').click();
      await assertOuter(`inner-update-${revision}`);
    }
    await page.locator('#toggle-shared').click();
    await expect(page.getByTestId('shared')).toHaveCount(0);
    await expect.poll(async () => (await readMap()).length).toBe(2);
    snapshots.push({ phase: 'removed', map: await readMap() });
    await page.locator('#toggle-shared').click();
    await assertOuter('reinsert');
    await page.locator('#replace-host').click();
    await expect(page.getByTestId('shared')).toHaveJSProperty('tagName', 'SPAN');
    await assertOuter('replace-host');
    await test.info().attach('nested-composite-source-lifecycle', {
      body: JSON.stringify({ framework, snapshots }),
      contentType: 'application/json',
    });
  });
}

test('svelte native nested Composite attachments refresh metadata and preserve eligible navigation', async ({
  page,
}) => {
  // Native counterpart of the complete acde /composite-nested measurement;
  // divergent renderer behavior receives zero unchanged Original credit.
  const snapshots: unknown[] = [];
  await page.goto('/composite-nested');
  await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
  const readMap = async () =>
    JSON.parse(await page.locator('#nested-map').innerText()) as Record<string, unknown>[];
  const assertMembership = async (members: string[]) => {
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const diagnostic = (
            window as Window & {
              compositeNestedDiagnostic: {
                read(): { publishedMap: [Element, { index: number }][] };
              };
            }
          ).compositeNestedDiagnostic.read();
          return diagnostic.publishedMap.map(([host, metadata]) => ({
            testId: host.getAttribute('data-testid'),
            index: metadata.index,
            connected: host.isConnected,
            sameDOM:
              host ===
              document.querySelector(`[data-testid="${host.getAttribute('data-testid')}"]`),
          }));
        }),
      )
      .toEqual(
        members.map((testId, index) => ({
          testId,
          index,
          connected: true,
          sameDOM: true,
        })),
      );
  };
  const navigateEligible = async () => {
    await page.getByTestId('first').focus();
    await page.getByTestId('first').press('ArrowRight');
    await expect(page.getByTestId('last')).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('first')).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByTestId('last')).toBeFocused();
  };
  const assertInner = async (phase: string, revision: number) => {
    await expect
      .poll(async () => (await readMap()).find((item) => item.testId === 'shared'))
      .toMatchObject({
        owner: 'inner',
        disabled: true,
        focusableWhenDisabled: false,
        revision,
        index: 1,
      });
    await expect.poll(async () => (await readMap()).length).toBe(3);
    await assertMembership(['first', 'shared', 'last']);
    await navigateEligible();
    snapshots.push({ phase, map: await readMap(), focused: 'last' });
  };
  await assertInner('mount', 0);
  await expect(page.getByTestId('shared')).toHaveJSProperty('tagName', 'BUTTON');
  const original = await page.getByTestId('shared').elementHandle();
  expect(original).not.toBeNull();
  for (let revision = 1; revision <= 3; revision += 1) {
    await page.locator('#update-inner').click();
    await assertInner(`inner-update-${revision}`, revision);
    expect(
      await original!.evaluate((host) => host === document.querySelector('[data-testid="shared"]')),
    ).toBe(true);
  }
  await page.locator('#toggle-shared').click();
  await expect(page.getByTestId('shared')).toHaveCount(0);
  await expect.poll(async () => (await readMap()).length).toBe(2);
  await assertMembership(['first', 'last']);
  await navigateEligible();
  expect(await original!.evaluate((host) => host.isConnected)).toBe(false);
  snapshots.push({ phase: 'removed', map: await readMap() });
  await page.locator('#toggle-shared').click();
  await assertInner('reinsert', 3);
  await expect(page.getByTestId('shared')).toHaveJSProperty('tagName', 'BUTTON');
  expect(
    await original!.evaluate((host) => host === document.querySelector('[data-testid="shared"]')),
  ).toBe(false);
  const replacement = await page.getByTestId('shared').elementHandle();
  expect(replacement).not.toBeNull();
  await page.locator('#replace-host').click();
  await expect(page.getByTestId('shared')).toHaveJSProperty('tagName', 'SPAN');
  await assertInner('replace-host', 3);
  expect(await replacement!.evaluate((host) => host.isConnected)).toBe(false);
  expect(
    await replacement!.evaluate(
      (host) => host === document.querySelector('[data-testid="shared"]'),
    ),
  ).toBe(false);
  await page.locator('#remove-root').click();
  await expect(page.locator('#nested-root, #literal-shared')).toHaveCount(0);
  await expect(page.getByTestId('first')).toHaveCount(0);
  await expect(page.getByTestId('shared')).toHaveCount(0);
  await expect(page.getByTestId('last')).toHaveCount(0);
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const actual = (
          window as Window & {
            compositeNestedDiagnostic: {
              read(): {
                publishedMap: [Element, Record<string, unknown>][];
                refs: Record<string, Element | null | undefined>;
                literal: { refs: Record<string, Element | null | undefined> };
              };
            };
          }
        ).compositeNestedDiagnostic.read();
        return {
          connectedMembers: actual.publishedMap.filter(([host]) => host.isConnected).length,
          refs: Object.values(actual.refs),
          literalRefs: Object.values(actual.literal.refs),
        };
      }),
    )
    .toEqual({
      connectedMembers: 0,
      refs: [null, null, null, null, null],
      literalRefs: [null, null, null],
    });
  snapshots.push({ phase: 'root-cleanup', map: await readMap() });
  await test.info().attach('native-nested-composite-lifecycle', {
    body: JSON.stringify({ framework: 'svelte', unchangedOriginalCredit: 0, snapshots }),
    contentType: 'application/json',
  });
  await original!.dispose();
  await replacement!.dispose();
});

for (const framework of ['react', 'svelte']) {
  const open = async (page: import('@playwright/test').Page, scenario = 'default') => {
    await page.goto(
      `/radio?scenario=${scenario}${framework === 'react' ? '&reference=react' : ''}`,
    );
    await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
    if (framework === 'react')
      await expect(page.locator('main')).toHaveAttribute('data-renderer', '19.2.8/19.2.8');
  };
  test(`${framework} group descendant focus and containment preserve onBlur validation`, async ({
    page,
  }) => {
    await open(page, 'onblur');
    const field = page.locator('#field');
    await expect(field).not.toHaveAttribute('data-focused');
    await expect(field).not.toHaveAttribute('data-touched');
    await expect(page.locator('#validation-calls')).toHaveText('0');
    await page.getByTestId('radio-b').focus();
    await expect(field).toHaveAttribute('data-focused', '');
    await expect(field).not.toHaveAttribute('data-touched');
    await page.getByTestId('radio-c').focus();
    await expect(field).toHaveAttribute('data-focused', '');
    await expect(field).not.toHaveAttribute('data-touched');
    await expect(page.locator('#validation-calls')).toHaveText('0');
    await expect(page.getByTestId('radio-b')).toHaveAttribute('aria-checked', 'true');
    await page.locator('#submit').focus();
    await expect(field).not.toHaveAttribute('data-focused');
    await expect(field).toHaveAttribute('data-touched', '');
    await expect(page.locator('#validation-calls')).toHaveText('1');
    await expect(page.locator('#error')).toHaveText('Blur error: b');
  });
  for (const renderOverride of [false, true]) {
    test(`${framework} group ${renderOverride ? 'rendered' : 'default'} focus consumer order, cancellation and currentTarget`, async ({
      page,
    }) => {
      for (const prevent of [false, true]) {
        await open(
          page,
          `focus-group-${renderOverride ? 'render' : 'default'}${prevent ? '-cancel' : ''}`,
        );
        const field = page.locator('#field');
        const textbox = page.locator('#focus-textbox');
        await textbox.evaluate((element) => (element as HTMLInputElement).setSelectionRange(5, 5));
        await textbox.focus();
        await expect(page.locator('#focus-calls')).toHaveText(
          JSON.stringify([
            {
              phase: 'enter',
              currentTarget: 'radio-group',
              tag: renderOverride ? 'SECTION' : 'DIV',
              focused: false,
              touched: false,
              selection: [5, 5],
            },
          ]),
        );
        if (prevent) await expect(field).not.toHaveAttribute('data-focused');
        else await expect(field).toHaveAttribute('data-focused', '');
        expect(
          await textbox.evaluate((element) => {
            const input = element as HTMLInputElement;
            return [input.selectionStart, input.selectionEnd];
          }),
        ).toEqual(prevent ? [5, 5] : [0, 5]);
        await page.locator('#submit').focus();
        await expect(page.locator('#focus-calls')).toHaveText(
          JSON.stringify([
            {
              phase: 'enter',
              currentTarget: 'radio-group',
              tag: renderOverride ? 'SECTION' : 'DIV',
              focused: false,
              touched: false,
              selection: [5, 5],
            },
            {
              phase: 'leave',
              currentTarget: 'radio-group',
              tag: renderOverride ? 'SECTION' : 'DIV',
              focused: !prevent,
              touched: false,
              selection: prevent ? [5, 5] : [0, 5],
            },
          ]),
        );
        await expect(field).not.toHaveAttribute('data-focused');
        if (prevent) await expect(field).not.toHaveAttribute('data-touched');
        else await expect(field).toHaveAttribute('data-touched', '');
        await expect(page.locator('#validation-calls')).toHaveText(prevent ? '0' : '1');
        await test.info().attach(`group-focus-${prevent ? 'canceled' : 'accepted'}`, {
          body: JSON.stringify(
            {
              framework,
              renderOverride,
              prevent,
              callbacks: JSON.parse((await page.locator('#focus-calls').textContent()) ?? '[]'),
              validationCalls: Number(await page.locator('#validation-calls').textContent()),
            },
            null,
            2,
          ),
          contentType: 'application/json',
        });
      }
    });
  }
  for (const mode of ['focus', 'arrow', 'cancel', 'disabled', 'readonly']) {
    test(`${framework} nested textbox ${mode} focus preserves source roving and activation guards`, async ({
      page,
    }) => {
      await open(page, `focus-item-${mode}`);
      const field = page.locator('#field');
      const textbox = page.locator('#focus-textbox');
      await textbox.evaluate((element) => (element as HTMLInputElement).setSelectionRange(5, 5));
      if (mode !== 'focus') {
        await page.getByTestId('radio-b').dispatchEvent('keydown', {
          key: 'ArrowRight',
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });
        await expect(field).toHaveAttribute('data-focused', '');
      }
      await textbox.focus();
      await expect(page.locator('#focus-calls')).toHaveText('["radio-c"]');
      await expect(page.getByTestId('radio-c')).toHaveAttribute(
        'tabindex',
        mode === 'cancel' ? '-1' : '0',
      );
      await expect(page.getByTestId('radio-b')).toHaveAttribute(
        'tabindex',
        mode === 'cancel' ? '0' : '-1',
      );
      expect(
        await textbox.evaluate((element) => {
          const input = element as HTMLInputElement;
          return [input.selectionStart, input.selectionEnd];
        }),
      ).toEqual(mode === 'cancel' ? [5, 5] : [0, 5]);
      await expect(page.getByTestId(mode === 'arrow' ? 'radio-c' : 'radio-b')).toHaveAttribute(
        'aria-checked',
        'true',
      );
      if (mode === 'arrow') await expect(field).toHaveAttribute('data-touched', '');
      else await expect(field).not.toHaveAttribute('data-touched');
      const calls = await page.locator('#calls').textContent();
      expect(JSON.parse(calls ?? '[]')).toHaveLength(mode === 'arrow' ? 1 : 0);
      await test.info().attach('nested-focus-source-observations', {
        body: JSON.stringify(
          {
            framework,
            mode,
            selection: await textbox.evaluate((element) => {
              const input = element as HTMLInputElement;
              return [input.selectionStart, input.selectionEnd];
            }),
            bTabindex: await page.getByTestId('radio-b').getAttribute('tabindex'),
            cTabindex: await page.getByTestId('radio-c').getAttribute('tabindex'),
            checked: mode === 'arrow' ? 'c' : 'b',
            touched: await field.evaluate((element) => element.hasAttribute('data-touched')),
            calls: JSON.parse(calls ?? '[]'),
          },
          null,
          2,
        ),
        contentType: 'application/json',
      });
    });
  }
  for (const scenario of ['standalone-empty', 'standalone-nonempty']) {
    for (const action of ['visible', 'hidden']) {
      test(`${framework} ${scenario} ${action} activation preserves source Field touch contract`, async ({
        page,
      }) => {
        await open(page, scenario);
        const field = page.locator('#standalone-field');
        const radio = page.getByTestId('standalone-radio');
        const input = page.locator('#standalone-input');
        const selected = scenario === 'standalone-empty';
        await expect(radio).toHaveAttribute('aria-checked', String(selected));
        await expect(field).not.toHaveAttribute('data-touched');
        expect(await input.isChecked()).toBe(selected);
        expect(await field.evaluate((element) => element.hasAttribute('data-filled'))).toBe(
          selected,
        );
        await input.evaluate((element) => {
          const input = element as HTMLInputElement;
          input.dataset.nativeEvents = '[]';
          for (const type of ['input', 'change']) {
            input.addEventListener(type, () => {
              input.dataset.nativeEvents = JSON.stringify([
                ...JSON.parse(input.dataset.nativeEvents ?? '[]'),
                type,
              ]);
            });
          }
        });
        if (action === 'visible') await radio.click();
        else await input.evaluate((element) => (element as HTMLInputElement).click());
        await expect(radio).toHaveAttribute('aria-checked', String(selected));
        if (selected) await expect(field).not.toHaveAttribute('data-touched');
        else await expect(field).toHaveAttribute('data-touched', '');
        expect(await input.isChecked()).toBe(selected || framework === 'svelte');
        expect(await field.evaluate((element) => element.hasAttribute('data-filled'))).toBe(
          selected,
        );
        const observations = {
          framework,
          scenario,
          action,
          checked: await input.isChecked(),
          ariaChecked: await radio.getAttribute('aria-checked'),
          touched: await field.evaluate((element) => element.hasAttribute('data-touched')),
          nativeEvents: JSON.parse((await input.getAttribute('data-native-events')) ?? '[]'),
        };
        await test.info().attach('standalone-native-observations', {
          body: JSON.stringify(observations, null, 2),
          contentType: 'application/json',
        });
        expect(observations.nativeEvents).toEqual(
          selected || (framework === 'react' && action === 'hidden') ? [] : ['input', 'change'],
        );
      });
    }
  }
  for (const action of ['visible', 'hidden']) {
    test(`${framework} literal controlled-false radio ${action} activation records native phase`, async ({
      page,
    }) => {
      await open(page, 'standalone-nonempty');
      const input = page.locator('#literal-input');
      expect(await input.isChecked()).toBe(false);
      await input.evaluate((element) => {
        const input = element as HTMLInputElement;
        input.dataset.nativeEvents = '[]';
        for (const type of ['input', 'change']) {
          input.addEventListener(type, () => {
            input.dataset.nativeEvents = JSON.stringify([
              ...JSON.parse(input.dataset.nativeEvents ?? '[]'),
              type,
            ]);
          });
        }
      });
      if (action === 'visible') await page.getByTestId('literal-radio').click();
      else await input.evaluate((element) => (element as HTMLInputElement).click());
      await expect(page.locator('#literal-calls')).toHaveText('1');
      const observations = {
        framework,
        action,
        checked: await input.isChecked(),
        changeCallbacks: Number(await page.locator('#literal-calls').textContent()),
        nativeEvents: JSON.parse((await input.getAttribute('data-native-events')) ?? '[]'),
      };
      await test.info().attach('literal-radio-native-observations', {
        body: JSON.stringify(observations, null, 2),
        contentType: 'application/json',
      });
      expect(observations.checked).toBe(framework === 'svelte');
      // Measured before assigning the same native observer expectation to the
      // source component: React's direct controlled-false activation differs.
      expect(observations.nativeEvents).toEqual(
        framework === 'react' && action === 'hidden' ? [] : ['input', 'change'],
      );
    });
  }
  test(`${framework} native hidden input CSS preserves source one-pixel geometry`, async ({
    page,
  }) => {
    await open(page);
    const geometry = await page.locator('input[type="radio"]').evaluateAll((inputs) =>
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
    await expect(page.getByTestId('radio-b')).toHaveAttribute('data-checked', '');
    await expect(page.getByTestId('radio-b')).not.toHaveAttribute('data-unchecked');
    await expect(page.getByTestId('radio-a')).toHaveAttribute('data-unchecked', '');
    await expect(page.getByTestId('radio-a')).not.toHaveAttribute('data-checked');
    expect(await page.locator('input[type="radio"]').count()).toBe(3);
    expect(
      await page
        .locator('#form')
        .evaluate((form) => new FormData(form as HTMLFormElement).getAll('choice')),
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
    await expect(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('#calls')).toHaveText(
      '[{"value":"a","reason":"none","type":"click","shiftKey":false}]',
    );
    expect(await page.locator('input[type="radio"]:checked').getAttribute('value')).toBe('a');
    await expect(page.locator('#form')).toHaveAttribute('data-click-events', '2');
    await expect(page.locator('#ancestor-clicks')).toHaveText('1');
    await page.getByTestId('radio-a').click();
    await expect(page.locator('#form')).toHaveAttribute('data-click-events', '4');
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
    await expect(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'true');
    expect(JSON.parse((await page.locator('#calls').textContent()) ?? '[]')).toHaveLength(1);
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
      await expect(page.getByTestId('radio-b')).toHaveAttribute('aria-checked', 'true');
      await expect(page.locator('#form')).toHaveAttribute(
        'data-input-events',
        framework === 'react' ? '2' : '0',
      );
      expect(
        await page
          .locator('#form')
          .evaluate((form) => new FormData(form as HTMLFormElement).getAll('choice')),
      ).toEqual(['b']);
    });
  for (const scenario of ['default', 'rtl', 'first-disabled', 'native-button'])
    test(`${framework} ${scenario} Composite arrow selection, roving focus and looping`, async ({
      page,
    }) => {
      await open(page, scenario);
      await expect(page.getByTestId('radio-b')).toHaveAttribute('tabindex', '0');
      await page.getByTestId('radio-b').focus();
      await page.keyboard.press(scenario === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
      await expect(page.getByTestId('radio-c')).toBeFocused();
      await expect(page.getByTestId('radio-c')).toHaveAttribute('aria-checked', 'true');
      await page.keyboard.press(scenario === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
      await expect(
        page.getByTestId(scenario === 'first-disabled' ? 'radio-b' : 'radio-a'),
      ).toBeFocused();
      expect(await page.locator('[role="radio"][tabindex="0"]').count()).toBe(1);
    });
  for (const scenario of ['disabled', 'readonly'])
    test(`${framework} ${scenario} suppresses selection and source callback`, async ({ page }) => {
      await open(page, scenario);
      await page.getByTestId('radio-a').click({ force: true });
      await expect(page.getByTestId('radio-b')).toHaveAttribute('aria-checked', 'true');
      await expect(page.locator('#calls')).toHaveText('[]');
    });
  test(`${framework} labels, Field registration and required Form validation`, async ({ page }) => {
    await open(page, 'empty-required');
    await expect(page.locator('#label-a')).toHaveAttribute('for', 'input-a');
    await expect(page.getByTestId('radio-a')).toHaveAttribute('aria-labelledby', 'label-a');
    await expect(page.getByTestId('radio-a')).toHaveAttribute('aria-describedby', 'description');
    await page.locator('#submit').click();
    await expect(page.locator('#submissions')).toHaveText('[]');
    await expect(page.locator('#field')).toHaveAttribute('data-invalid', '');
    await page.locator('#label-a').click();
    await expect(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'true');
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
    await page.getByRole('button', { name: 'Remove selected', exact: true }).click();
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
    await expect(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'true');
    await page.getByRole('button', { name: 'Programmatic', exact: true }).click();
    await expect(page.getByTestId('radio-c')).toHaveAttribute('aria-checked', 'true');
    expect(await page.locator('input[type="radio"]:checked').getAttribute('value')).toBe('c');
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
      await expect(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'true');
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
          .evaluate((form) => new FormData(form as HTMLFormElement).getAll('choice')),
      ).toEqual(defaultValues);
      await expect(page.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'true');
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
        .evaluate((form) => new FormData(form as HTMLFormElement).getAll('choice')),
    ).toEqual([]);
    expect(
      await page
        .locator('#external-form')
        .evaluate((form) => new FormData(form as HTMLFormElement).getAll('choice')),
    ).toEqual(['b']);
    await page.locator('#submit').click();
    await expect(page.locator('#submissions')).toHaveText('[{"choice":null}]');
  });
  test(`${framework} native controlled rejection characterization preserves framework defaults`, async ({
    page,
  }) => {
    await open(page, 'controlled-reject');
    await page.getByTestId('radio-a').click();
    await expect(page.getByTestId('radio-b')).toHaveAttribute('aria-checked', 'true');
    // Native framework characterization; divergent expectations receive zero source credit.
    expect(await page.locator('input[type="radio"]:checked').getAttribute('value')).toBe(
      framework === 'react' ? 'b' : 'a',
    );
  });
}
test('Svelte SSR/no JavaScript radios preserve native initial successful input values', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/radio');
  expect(await page.locator('input[type="radio"]').count()).toBe(3);
  await expect(page.getByTestId('radio-b')).toHaveAttribute('aria-checked', 'true');
  expect(await page.locator('input[type="radio"][checked]').getAttribute('value')).toBe('b');
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
      .evaluate((form) => new FormData(form as HTMLFormElement).getAll('choice')),
  ).toEqual(['b']);
  expect(diagnostics).toEqual([]);
});
