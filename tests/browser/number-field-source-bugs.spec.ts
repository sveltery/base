// Exact-pin/current public-provider supplements; zero unchanged Original assertion credit.
import { expect, test, type Page } from '@playwright/test';
test.beforeAll(async ({ browser }) => {
  expect(browser.version()).toMatch(/^153\./);
  console.log(`NumberField source-bug secured Chromium ${browser.version()}, workers=1, retries=0`);
});
const traces = async (page: Page) =>
  JSON.parse(await page.locator('#number-traces').innerText()) as {
    kind: string;
    value: number;
    reason: string;
  }[];
for (const framework of ['react', 'svelte']) {
  const open = async (page: Page, scenario: string) => {
    await page.goto(
      `/number-field-source-bugs?scenario=${scenario}${framework === 'react' ? '&reference=react' : ''}`,
    );
    await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
  };
  const owner = async (page: Page) => {
    // DOM activation deliberately preserves focused dirty input: no pointerdown/focus/blur.
    await page
      .locator(framework === 'react' ? '#owner-update' : '#proof-owner')
      .evaluate((node) => (node as HTMLButtonElement).click());
    await expect(page.locator('input[type="number"]')).toHaveValue('42');
  };
  test(`${framework} pin Increment L703 canceled dirty-sync preserves100 and [100,100,1]`, async ({
    page,
  }) => {
    await open(page, 'cancel');
    await page.getByTestId('visible').fill('100');
    await page.locator('#increase').evaluate((node) => (node as HTMLButtonElement).click());
    await expect
      .poll(async () =>
        (await traces(page)).filter((entry) => entry.kind === 'change').map((entry) => entry.value),
      )
      .toEqual([100, 100, 1]);
    expect((await traces(page)).filter((entry) => entry.kind === 'commit')).toEqual([]);
    await expect(page.getByTestId('visible')).toHaveValue('100');
    await expect(page.locator('input[type="number"]')).toHaveValue('0');
  });
  for (const method of ['keyboard', 'wheel', 'button'])
    test(`${framework} issue83 ${method} owner42 no-movement scrub commits stale3`, async ({
      page,
    }) => {
      await open(page, 'accept');
      await page.getByTestId('visible').focus();
      if (method === 'keyboard') await page.getByTestId('visible').press('ArrowUp');
      else if (method === 'wheel')
        await page.getByTestId('visible').dispatchEvent('wheel', { deltaY: -1 });
      else await page.locator('#increase').evaluate((node) => (node as HTMLButtonElement).click());
      await expect(page.locator('input[type="number"]')).toHaveValue('3');
      await owner(page);
      await expect(page.getByTestId('visible')).toHaveValue('42');
      const before = (await traces(page)).length;
      const box = await page.getByTestId('scrub').boundingBox();
      if (!box) throw new Error('Real scrub host missing');
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.up();
      await expect
        .poll(async () => (await traces(page)).slice(before))
        .toEqual([{ kind: 'commit', value: 3, reason: 'scrub' }]);
      await expect(page.getByTestId('visible')).toHaveValue('42');
      await expect(page.locator('input[type="number"]')).toHaveValue('42');
    });
  for (const scenario of ['accept', 'decline'])
    test(`${framework} issue84 ${scenario} no-blur owner42 then dirty2.7 commit`, async ({
      page,
    }) => {
      await open(page, scenario);
      await page.getByTestId('visible').fill('2.70');
      await owner(page);
      await expect(page.getByTestId('visible')).toBeFocused();
      await expect(page.getByTestId('visible')).toHaveValue('2.70');
      const before = (await traces(page)).length;
      await page.getByTestId('visible').evaluate((node) => (node as HTMLInputElement).blur());
      await expect
        .poll(async () => (await traces(page)).slice(before))
        .toEqual([
          { kind: 'change', value: 2.7, reason: 'input-blur' },
          { kind: 'commit', value: 2.7, reason: 'input-blur' },
        ]);
      await expect(page.getByTestId('visible')).toHaveValue(scenario === 'accept' ? '2.7' : '42');
      await expect(page.locator('input[type="number"]')).toHaveValue(
        scenario === 'accept' ? '2.7' : '42',
      );
    });
  for (const primed of [false, true])
    test(`${framework} issue85 ${primed ? 'primed3' : 'fresh8'} canceled hidden proposal validation`, async ({
      page,
    }) => {
      await open(page, 'validation');
      if (primed) {
        await page.getByTestId('visible').press('ArrowUp');
        await expect(page.locator('input[type="number"]')).toHaveValue('3');
        await expect
          .poll(
            async () =>
              JSON.parse(await page.locator('#number-validation-calls').innerText()).length,
          )
          .toBeGreaterThan(0);
      }
      await page
        .locator('#clear-validation')
        .evaluate((node) => (node as HTMLButtonElement).click());
      await expect(page.locator('#number-validation-calls')).toHaveText('[]');
      await page.locator('input[type="number"]').evaluate((node) => {
        const input = node as HTMLInputElement;
        // Browser autofill changes the DOM value independently of React's own setter.
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        if (!setter) throw new Error('Native input value setter missing');
        setter.call(input, '8');
        input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      });
      await expect
        .poll(async () => (await traces(page)).at(-1))
        .toEqual({ kind: 'change', value: 8, reason: 'none' });
      await expect
        .poll(async () =>
          JSON.parse(await page.locator('#number-validation-calls').innerText()).map(
            (entry: { value: number }) => entry.value,
          ),
        )
        .toEqual([primed ? 3 : 8]);
      await expect(page.getByTestId('visible')).toHaveValue(primed ? '3' : '2');
    });
}
