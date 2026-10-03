// Source assertion selections at Base UI 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: parity/toggle-toolbar/UPSTREAM_LICENSE. Supplements/conformance are separately uncredited.
import { expect, test, type Page } from '@playwright/test';
import type { NavigationCall } from '../../apps/fixtures/src/lib/navigation-cases.js';
async function setup(page: Page, scenario: string, reference: boolean, direction = 'ltr', orientation = 'horizontal') {
  await page.goto(`/navigation?case=${scenario}&direction=${direction}&orientation=${orientation}${reference ? '&reference' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
}
async function calls(page: Page): Promise<NavigationCall[]> { return JSON.parse(await page.getByTestId('calls').innerText()); }
async function pressed(page: Page, expected: string[]) {
  for (const value of ['one', 'two', 'three']) await expect(page.locator(`#${value}`)).toHaveAttribute('aria-pressed', String(expected.includes(value)));
}
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  test(`TG Source ${framework} role, single selection, default and own/group callback order`, async ({ page }) => {
    await setup(page, 'group-default', reference);
    await expect(page.locator('#selection-group')).toHaveAttribute('role', 'group');
    await expect(page.locator('#selection-group')).not.toHaveAttribute('aria-orientation');
    await pressed(page, ['two']);
    await page.locator('#one').click(); await pressed(page, ['one']);
    expect((await calls(page)).map(x => [x.part, x.value, x.same, x.before])).toEqual([['toggle', true, true, 'false'], ['group', ['one'], true, 'false']]);
    await page.locator('#one').click(); await pressed(page, []);
    expect((await calls(page)).map(x => x.reason)).toEqual(['none', 'none', 'none', 'none']);
  });
  for (const scenario of ['group-cancel-own', 'group-cancel-group', 'group-prevent-handler', 'group-prevent-default']) test(`T:103/TG Source ${framework} ${scenario} cancellation`, async ({ page }) => {
    await setup(page, scenario, reference); await page.locator('#one').click();
    await pressed(page, scenario === 'group-prevent-default' ? ['one'] : []);
    const events = await calls(page);
    expect(events.length).toBe(scenario === 'group-prevent-handler' ? 0 : scenario === 'group-cancel-own' ? 1 : 2);
    if (events.length) expect(events[0]).toMatchObject({ part: 'toggle', value: true, type: 'click' });
    if (scenario === 'group-cancel-group') expect(events[1]).toMatchObject({ same: true, canceled: true, defaultPrevented: false });
    if (scenario === 'group-cancel-own') expect(events[0]).toMatchObject({ canceled: true, defaultPrevented: false });
    if (scenario === 'group-prevent-default') expect(events.every(x => x.defaultPrevented)).toBe(true);
  });
  for (const scenario of ['group-controlled', 'group-controlled-accept', 'toolbar-toggles-controlled-accept']) test(`TG Source ${framework} ${scenario} owner`, async ({ page }) => {
    await setup(page, scenario, reference); await pressed(page, ['two']);
    await page.locator('#one').click(); await pressed(page, scenario.includes('accept') ? ['one'] : ['two']);
    expect((await calls(page))[1].value).toEqual(['one']);
    await page.getByRole('button', { name: 'Change owner', exact: true }).click();
    await pressed(page, scenario.includes('accept') ? ['two'] : ['one']);
  });
  for (const scenario of ['group-multiple', 'toolbar-toggles-multiple']) test(`TG/Toolbar Source ${framework} ${scenario} multiple setter`, async ({ page }) => {
    await setup(page, scenario, reference); await pressed(page, ['one']);
    await expect(page.locator('#selection-group')).toHaveAttribute('data-multiple');
    await page.locator('#two').click(); await pressed(page, ['one', 'two']);
    expect((await calls(page))[1].value).toEqual(['one', 'two']);
    await page.locator('#one').click(); await pressed(page, ['two']);
    expect((await calls(page))[3].value).toEqual(['two']);
    await page.getByRole('button', { name: 'Change multiple', exact: true }).click();
    await expect(page.locator('#selection-group')).not.toHaveAttribute('data-multiple');
    await page.locator('#three').click(); await pressed(page, ['three']);
    await page.locator('#three').press('ArrowLeft'); await expect(page.locator('#two')).toBeFocused();
  });
  for (const scenario of ['group-omitted', 'group-omitted-multiple']) test(`TG Source ${framework} ${scenario} generated values`, async ({ page }) => {
    await setup(page, scenario, reference); await pressed(page, []);
    await page.locator('#one').click(); await pressed(page, ['one']);
    await page.locator('#two').click(); await pressed(page, scenario.includes('multiple') ? ['one', 'two'] : ['two']);
    const values = (await calls(page)).filter(x => x.part === 'group').map(x => x.value as string[]);
    expect(values[0][0]).toMatch(/^base-ui-/); expect(values[1].at(-1)).toMatch(/^base-ui-/);
    expect(values[0][0]).not.toBe(values[1].at(-1));
  });
  test(`TG Source ${framework} initialized omitted-value diagnostic`, async ({ page }) => {
    const messages: string[] = []; page.on('console', message => { if (message.type() === 'error') messages.push(message.text()); });
    await setup(page, 'group-warning', reference);
    await expect.poll(() => messages.filter(x => x.includes('has no explicit `value` prop.')).length).toBe(1);
    expect(messages.find(x => x.includes('has no explicit `value` prop.'))).toContain('Provide the `<Toggle>` with a `value` prop matching the `<ToggleGroup>` values prop type.');
  });
  for (const direction of ['ltr', 'rtl']) for (const orientation of ['horizontal', 'vertical']) {
    const next = orientation === 'vertical' ? 'ArrowDown' : direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const previous = orientation === 'vertical' ? 'ArrowUp' : direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    test(`TG Source ${framework} ${direction}/${orientation} roving, ignored axis and Home/End`, async ({ page }) => {
      await setup(page, 'group-single', reference, direction, orientation);
      await page.keyboard.press('Tab'); await expect(page.locator('#one')).toBeFocused();
      for (const id of ['two', 'three', 'one']) { await page.keyboard.press(next); await expect(page.locator(`#${id}`)).toBeFocused(); await expect(page.locator(`#${id}`)).toHaveAttribute('tabindex', '0'); }
      await page.keyboard.press(previous); await expect(page.locator('#three')).toBeFocused();
      await page.keyboard.press(orientation === 'horizontal' ? 'ArrowDown' : 'ArrowRight'); await expect(page.locator('#three')).toBeFocused();
      await page.keyboard.press('Home'); await expect(page.locator('#one')).toBeFocused();
      await page.keyboard.press('End'); await expect(page.locator('#three')).toBeFocused();
    });
    test(`Toolbar Root Source ${framework} ${direction}/${orientation} mixed real parts`, async ({ page }) => {
      await setup(page, 'toolbar-roving', reference, direction, orientation);
      await expect(page.locator('#toolbar')).toHaveAttribute('role', 'toolbar');
      await expect(page.locator('#toolbar')).toHaveAttribute('aria-orientation', orientation);
      await page.keyboard.press('Tab'); await expect(page.locator('#one')).toBeFocused();
      for (const id of ['link', 'two', 'three', 'tested-input', 'one']) { await page.keyboard.press(next); await expect(page.locator(`#${id}`)).toBeFocused(); }
      await page.keyboard.press(previous); await expect(page.locator('#tested-input')).toBeFocused();
      await page.keyboard.press(previous); await expect(page.locator('#three')).toBeFocused();
      // Toolbar retains CompositeRoot's default Home/End=false.
      await page.keyboard.press('Home'); await expect(page.locator('#three')).toBeFocused();
      await page.keyboard.press('End'); await expect(page.locator('#three')).toBeFocused();
      await expect(page.locator('#separator')).toHaveAttribute('aria-orientation', orientation === 'horizontal' ? 'vertical' : 'horizontal');
    });
  }
  for (const scenario of ['group-single-loop-off', 'toolbar-toggles-loop-off']) test(`TG/Toolbar Source ${framework} ${scenario} no loop`, async ({ page }) => {
    await setup(page, scenario, reference); await page.locator('#one').focus();
    if (!scenario.startsWith('toolbar')) { await page.keyboard.press('ArrowLeft'); await expect(page.locator('#one')).toBeFocused(); }
    await page.locator(scenario.startsWith('toolbar') ? '#after' : '#three').focus();
    await page.keyboard.press('ArrowRight'); await expect(page.locator(scenario.startsWith('toolbar') ? '#after' : '#three')).toBeFocused();
  });
  test(`Toolbar Source ${framework} direct Toggle disabled metadata changes and source cancellation`, async ({ page }) => {
    await setup(page, 'toolbar-toggles', reference);
    await page.locator('#before').focus(); await page.keyboard.press('ArrowRight'); await expect(page.locator('#one')).toBeFocused();
    await page.getByRole('button', { name: 'Change disabled', exact: true }).click();
    await expect(page.locator('#two')).toBeDisabled();
    await page.locator('#one').focus(); await page.keyboard.press('ArrowRight'); await expect(page.locator('#three')).toBeFocused();
    await page.keyboard.press('Enter'); await pressed(page, ['three']);
    await page.keyboard.press('ArrowRight'); await expect(page.locator('#after')).toBeFocused();
  });
  test(`Toolbar Source ${framework} direct ToggleGroup respects disabled Toolbar.Group`, async ({ page }) => {
    await setup(page, 'toolbar-toggles-group-disabled', reference);
    for (const id of ['one', 'two', 'three']) { await expect(page.locator(`#${id}`)).toBeDisabled(); await expect(page.locator(`#${id}`)).toHaveAttribute('data-disabled'); }
    await page.locator('#before').focus(); await page.keyboard.press('ArrowRight'); await expect(page.locator('#after')).toBeFocused();
  });
  for (const scenario of ['toolbar-wrapped-toggles', 'toolbar-wrapped-disabled']) test(`Toolbar Button/Toggle Source ${framework} ${scenario} shared host navigation`, async ({ page }) => {
    await setup(page, scenario, reference); await page.locator('#one').focus();
    if (scenario.endsWith('disabled')) {
      for (const id of ['one', 'two', 'three']) { await expect(page.locator(`#${id}`)).not.toHaveAttribute('disabled'); await expect(page.locator(`#${id}`)).toHaveAttribute('aria-disabled', 'true'); }
      await page.keyboard.press('Enter'); await page.keyboard.press('Space'); expect(await calls(page)).toEqual([]);
    } else { await page.keyboard.press('Enter'); await pressed(page, ['one']); }
    await page.keyboard.press('ArrowRight'); await expect(page.locator('#two')).toBeFocused();
    await page.keyboard.press('Space');
    if (!scenario.endsWith('disabled')) await pressed(page, ['two']);
    await page.keyboard.press('ArrowRight'); await expect(page.locator('#three')).toBeFocused();
  });
  test(`Toolbar Source ${framework} metadata chooses eligible initial item and updates focusability`, async ({ page }) => {
    await setup(page, 'toolbar-metadata', reference);
    await expect(page.locator('#one')).toBeDisabled(); await expect(page.locator('#one')).not.toHaveAttribute('tabindex', '0');
    await page.keyboard.press('Tab'); await expect(page.locator('#link')).toBeFocused();
    await page.keyboard.press('ArrowRight'); await expect(page.locator('#three')).toBeFocused();
    await page.getByRole('button', { name: 'Change focusable', exact: true }).click();
    await expect(page.locator('#one')).not.toHaveAttribute('disabled');
    await page.locator('#link').focus(); await page.keyboard.press('ArrowRight'); await expect(page.locator('#two')).toBeFocused();
    await expect(page.locator('#two')).toHaveAttribute('aria-disabled', 'true');
  });
  test(`Toolbar Source ${framework} disabled buttons stay hoverable and block activation handlers`, async ({ page }) => {
    await setup(page, 'toolbar-button-disabled', reference);
    await expect(page.locator('#two')).not.toHaveAttribute('disabled');
    await expect(page.locator('#two')).toHaveAttribute('aria-disabled', 'true');
    await page.locator('#two').hover();
    await expect.poll(async () => JSON.parse(await page.getByTestId('input-events').innerText()).hover).toBeGreaterThan(0);
    await page.locator('#two').click(); await page.locator('#two').focus(); await page.keyboard.press('Enter'); await page.keyboard.press('Space');
    expect(JSON.parse(await page.getByTestId('input-events').innerText())).toMatchObject({ clicks: 0, keydowns: 0 });
  });
  test(`Toolbar Source ${framework} custom button Enter and Space each dispatch one real click`, async ({ page }) => {
    await setup(page, 'toolbar-custom', reference); await page.locator('#two').focus();
    await page.keyboard.press('Enter'); await page.keyboard.press('Space');
    expect(JSON.parse(await page.getByTestId('input-events').innerText()).clicks).toBe(2);
  });
  for (const scenario of ['toolbar-disabled', 'toolbar-group-disabled']) test(`Toolbar Root/Group Source ${framework} ${scenario} links remain enabled`, async ({ page }) => {
    await setup(page, scenario, reference);
    await expect(page.locator('#two')).toHaveAttribute('aria-disabled', 'true');
    await expect(page.locator('#link')).not.toHaveAttribute('aria-disabled'); await expect(page.locator('#link')).not.toHaveAttribute('data-disabled');
    await page.locator('#link').click(); expect(new URL(page.url()).hash).toBe('#navigation-target');
  });
  test(`supplement ${framework} nested Toolbar.Group retains Source nearest-provider precedence`, async ({ page }) => {
    await setup(page, 'toolbar-nested-groups', reference);
    await expect(page.locator('#outer-button')).toHaveAttribute('aria-disabled', 'true');
    await expect(page.locator('#inner-button')).toHaveAttribute('aria-disabled', 'false');
    await expect(page.locator('#inner')).not.toHaveAttribute('data-disabled');
  });
  for (const direction of ['ltr', 'rtl']) test(`Toolbar Input Source ${framework} ${direction} caret and selection boundaries`, async ({ page }) => {
    await setup(page, 'toolbar-input-text', reference, direction);
    const next = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight'; const previous = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    await page.locator('#before').focus(); await page.keyboard.press(next); await expect(page.locator('#tested-input')).toBeFocused();
    expect(await page.locator('#tested-input').evaluate((input: HTMLInputElement) => [input.selectionStart, input.selectionEnd])).toEqual([0, 4]);
    await page.locator('#tested-input').evaluate((input: HTMLInputElement) => input.setSelectionRange(1, 3));
    await page.keyboard.press(next); await expect(page.locator('#tested-input')).toBeFocused();
    await page.locator('#tested-input').evaluate((input: HTMLInputElement) => input.setSelectionRange(2, 2));
    await page.keyboard.press(`Shift+${next}`); await expect(page.locator('#tested-input')).toBeFocused();
    await page.locator('#tested-input').evaluate((input: HTMLInputElement) => input.setSelectionRange(4, 4));
    await page.keyboard.press(next); await expect(page.locator('#after')).toBeFocused();
    await page.keyboard.press(previous); await expect(page.locator('#tested-input')).toBeFocused();
    await page.locator('#tested-input').evaluate((input: HTMLInputElement) => input.setSelectionRange(0, 0));
    await page.keyboard.press(previous); await expect(page.locator('#before')).toBeFocused();
  });
  test(`Toolbar Input Source ${framework} disabled pointer focus and checkbox defaults resume when enabled`, async ({ page }) => {
    await setup(page, 'toolbar-input-disabled', reference); await page.locator('#before').focus();
    await page.locator('#tested-input').click(); await expect(page.locator('#before')).toBeFocused();
    await page.getByRole('button', { name: 'Enable input', exact: true }).click(); await page.locator('#tested-input').click(); await expect(page.locator('#tested-input')).toBeFocused();
    await setup(page, 'toolbar-input-checkbox', reference); await page.locator('#tested-input').click(); await expect(page.locator('#tested-input')).not.toBeChecked();
    await page.getByRole('button', { name: 'Enable input', exact: true }).click(); await page.locator('#tested-input').click(); await expect(page.locator('#tested-input')).toBeChecked();
  });
  test(`Toolbar Input Source ${framework} disabled vertical arrows and Tab escape`, async ({ page }) => {
    await setup(page, 'toolbar-input-disabled', reference, 'ltr', 'vertical');
    await page.locator('#before').focus(); await page.keyboard.press('ArrowDown'); await expect(page.locator('#tested-input')).toBeFocused();
    await page.keyboard.press('ArrowDown'); await expect(page.locator('#after')).toBeFocused();
    await page.keyboard.press('ArrowUp'); await expect(page.locator('#tested-input')).toBeFocused();
    await page.keyboard.press('Tab'); await expect(page.locator('#outside')).toBeFocused();
    await page.keyboard.press('Shift+Tab'); await expect(page.locator('#tested-input')).toBeFocused();
  });
  test(`Toolbar Input Source ${framework} explicit nonfocusable metadata skips native input`, async ({ page }) => {
    await setup(page, 'toolbar-input-skip', reference); await page.locator('#before').focus(); await page.keyboard.press('ArrowRight'); await expect(page.locator('#after')).toBeFocused();
    await expect(page.locator('#tested-input')).not.toHaveAttribute('disabled');
  });
  test(`supplement ${framework} native Toolbar input reset uses actual defaultValue`, async ({ page }) => {
    await setup(page, 'toolbar-input-text', reference); await page.locator('#tested-input').fill('edited');
    await page.getByRole('button', { name: 'Reset native input', exact: true }).click(); await expect(page.locator('#tested-input')).toHaveValue('abcd');
  });
  test(`Toolbar Separator Source ${framework} caller orientation overrides opposite default`, async ({ page }) => {
    await setup(page, 'toolbar-separator-override', reference); await expect(page.locator('#separator')).toHaveAttribute('aria-orientation', 'horizontal');
  });
  test(`supplement ${framework} reorder and removal retain the focused item's identity`, async ({ page }) => {
    await setup(page, 'toolbar-toggles', reference); await page.locator('#two').focus();
    await page.getByRole('button', { name: 'Reorder items', exact: true }).click(); await page.locator('#two').focus();
    await page.keyboard.press('ArrowRight'); await expect(page.locator('#one')).toBeFocused();
    await page.getByRole('button', { name: 'Remove two', exact: true }).click(); await page.locator('#three').focus();
    await page.keyboard.press('ArrowRight'); await expect(page.locator('#one')).toBeFocused();
    await expect(page.locator('#two')).toHaveCount(0);
  });
}
test('native supplement Svelte SSR hydrates real Toolbar input host and attachments clean up', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    const observer = new MutationObserver(() => {
      const node = document.getElementById('tested-input');
      if (node) { (window as Window & { serverNavigation?: Element }).serverNavigation = node; observer.disconnect(); }
    });
    observer.observe(document, { childList: true, subtree: true });
  });
  await setup(page, 'toolbar-input-text', false);
  expect(await page.locator('#tested-input').evaluate(node => node === (window as Window & { serverNavigation?: Element }).serverNavigation)).toBe(true);
  await expect(page.getByTestId('host-ref')).toHaveText('tested-input');
  await expect(page.getByTestId('attachments')).toHaveText('{"attached":1,"detached":0}');
  await page.getByRole('button', { name: 'Toggle mount', exact: true }).click();
  await expect(page.getByTestId('host-ref')).toHaveText(''); await expect(page.getByTestId('attachments')).toHaveText('{"attached":1,"detached":1}');
  await page.getByRole('button', { name: 'Toggle mount', exact: true }).click(); await expect(page.locator('#tested-input')).toHaveValue('abcd');
  await expect(page.getByTestId('attachments')).toHaveText('{"attached":2,"detached":1}'); expect(errors).toEqual([]);
});
