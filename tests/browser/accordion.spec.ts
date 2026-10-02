// Assertion ports from Base UI 1.8.0 immutable pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: parity/accordion/UPSTREAM_LICENSE. Supplemental assertions earn no ordinary credit.
import { test, expect, type Page, type Locator } from '@playwright/test';
type Call = { value: (number | string)[]; reason: string; type: string; before: string; canceled: boolean; defaultPrevented: boolean };
type ItemCall = { open: boolean; reason: string; type: string; canceled: boolean };
async function setup(page: Page, scenario: string, reference: boolean) {
  await page.goto(`/accordion${reference ? '-reference' : ''}?case=${scenario}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  return { trigger: page.getByTestId('trigger-1'), trigger2: page.getByTestId('trigger-2'), panel: page.getByTestId('panel-1'), panel2: page.getByTestId('panel-2') };
}
async function calls(page: Page): Promise<Call[]> { return JSON.parse(await page.getByTestId('calls').innerText()); }
async function itemCalls(page: Page): Promise<ItemCall[]> { return JSON.parse(await page.getByTestId('item-calls').innerText()); }
async function opened(trigger: Locator, panel: Locator) {
  await expect(trigger).toHaveAttribute('aria-expanded', 'true'); await expect(trigger).toHaveAttribute('data-panel-open');
  await expect(panel).toHaveCount(1); await expect(panel).toBeVisible(); await expect(panel).toHaveAttribute('data-open');
}
async function closed(trigger: Locator, panel: Locator) { await expect(trigger).toHaveAttribute('aria-expanded', 'false'); await expect(panel).toHaveCount(0); }
for (const reference of [false, true]) {
  const framework = reference ? 'React reference' : 'Svelte';
  test(`R:19 ${framework} warns when hiddenUntilFound overrides keepMounted=false`, async ({ page }) => {
    const warnings: string[] = []; page.on('console', message => { if (message.type() === 'warning') warnings.push(message.text()); });
    const { panel } = await setup(page, 'root-warning', reference);
    expect(warnings).toContain('Base UI: The `keepMounted={false}` prop on `Accordion.Root` is ignored when `hiddenUntilFound` is enabled, since panels must remain mounted while closed.'); await expect(panel).toHaveAttribute('hidden', 'until-found');
  });
  test(`R:41 ${framework} renders correct ARIA attributes`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'aria', reference);
    await expect(trigger).toHaveAttribute('aria-controls'); expect(await panel.getAttribute('id')).toBe(await trigger.getAttribute('aria-controls')); await expect(panel).toHaveAttribute('role', 'region'); expect(await trigger.getAttribute('id')).toBe(await panel.getAttribute('aria-labelledby'));
  });
  test(`R:62 ${framework} references manual panel id`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'manual-panel', reference); await expect(trigger).toHaveAttribute('aria-controls', 'custom-panel-id'); await expect(panel).toHaveAttribute('id', 'custom-panel-id');
  });
  test(`R:81 ${framework} references manual trigger id`, async ({ page }) => {
    const { panel } = await setup(page, 'manual-trigger', reference); await expect(panel).toHaveAttribute('aria-labelledby', 'custom-trigger-id');
  });
  test(`R:98 ${framework} updates labeling when trigger id is added or changed`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'trigger-change', reference); await expect(trigger).toHaveAttribute('id'); await expect(panel).toHaveAttribute('aria-labelledby', (await trigger.getAttribute('id'))!);
    await page.getByRole('button', { name: 'Set id 1', exact: true }).click(); await expect(trigger).toHaveAttribute('id', 'custom-trigger-id-1'); await expect(panel).toHaveAttribute('aria-labelledby', 'custom-trigger-id-1');
    await page.getByRole('button', { name: 'Set id 2', exact: true }).click(); await expect(trigger).toHaveAttribute('id', 'custom-trigger-id-2'); await expect(panel).toHaveAttribute('aria-labelledby', 'custom-trigger-id-2');
  });
  test(`R:145 ${framework} restores labeling when manual trigger id is removed`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'trigger-remove', reference); await expect(panel).toHaveAttribute('aria-labelledby', 'custom-trigger-id'); await page.getByRole('button', { name: 'Remove id', exact: true }).click();
    await expect(trigger).toHaveAttribute('id'); await expect(trigger).not.toHaveAttribute('id', 'custom-trigger-id'); await expect(panel).toHaveAttribute('aria-labelledby', (await trigger.getAttribute('id'))!);
  });
  test(`R:182 ${framework} unregisters generated part ids when parts unmount`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'parts', reference); await page.getByRole('button', { name: 'Toggle trigger', exact: true }).click(); await expect(panel).not.toHaveAttribute('aria-labelledby');
    await page.getByRole('button', { name: 'Toggle trigger', exact: true }).click(); await expect(panel).toHaveAttribute('aria-labelledby', (await trigger.getAttribute('id'))!);
    await page.getByRole('button', { name: 'Toggle panel', exact: true }).click(); await expect(trigger).not.toHaveAttribute('aria-controls');
    await page.getByRole('button', { name: 'Toggle panel', exact: true }).click(); await expect(trigger).toHaveAttribute('aria-controls', (await panel.getAttribute('id'))!);
  });
  test(`R:219 ${framework} preserves generated part associations during hydration`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message)); page.on('console', message => { if (message.type() === 'error' && /hydrat/i.test(message.text())) errors.push(message.text()); });
    await page.addInitScript(() => { const observer = new MutationObserver(() => { const panel = document.querySelector('[data-testid="panel-1"]'); if (panel) { (window as Window & { serverAccordionPanel?: Element; serverAccordionBefore?: boolean }).serverAccordionPanel = panel; (window as Window & { serverAccordionBefore?: boolean }).serverAccordionBefore = document.querySelector('main')?.getAttribute('data-hydrated') === 'false'; observer.disconnect(); } }); observer.observe(document, { childList: true, subtree: true }); });
    const response = await page.goto(`/accordion-ssr?case=hydration${reference ? '&reference' : ''}`);
    const server = await page.evaluate(markup => { const document = new DOMParser().parseFromString(markup, 'text/html'); const trigger = document.querySelector('[data-testid="trigger-1"]'), panel = document.querySelector('[data-testid="panel-1"]'); return { trigger: trigger?.id, panel: panel?.id, controls: trigger?.getAttribute('aria-controls'), label: panel?.getAttribute('aria-labelledby') }; }, await response!.text());
    expect(server.controls).toBe(server.panel); expect(server.label).toBe(server.trigger);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true'); const trigger = page.getByTestId('trigger-1'), panel = page.getByTestId('panel-1');
    await expect(trigger).toHaveAttribute('aria-controls', (await panel.getAttribute('id'))!); await expect(panel).toHaveAttribute('aria-labelledby', (await trigger.getAttribute('id'))!);
    expect(await panel.getAttribute('id')).toBe(server.panel); expect(await trigger.getAttribute('id')).toBe(server.trigger);
    expect(await panel.evaluate(node => node === (window as Window & { serverAccordionPanel?: Element }).serverAccordionPanel)).toBe(true); expect(await page.evaluate(() => (window as Window & { serverAccordionBefore?: boolean }).serverAccordionBefore)).toBe(true); expect(errors).toEqual([]);
  });
  test(`R:250 ${framework} uncontrolled open state`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'uncontrolled', reference); await closed(trigger, panel); await trigger.click(); await opened(trigger, panel); await trigger.click(); await closed(trigger, panel);
  });
  test(`R:282 ${framework} defaultValue custom item value`, async ({ page }) => {
    const { panel, panel2 } = await setup(page, 'default-custom', reference); await expect(panel).toHaveCount(1); await expect(panel).toBeVisible(); await expect(panel).toHaveAttribute('data-open'); await expect(panel2).toHaveCount(0);
  });
  test(`R:310 ${framework} controlled open state`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'controlled', reference); await closed(trigger, panel); await page.getByRole('button', { name: 'toggle externally', exact: true }).click(); await opened(trigger, panel); await page.getByRole('button', { name: 'toggle externally', exact: true }).click(); await closed(trigger, panel);
  });
  test(`R:342 ${framework} value custom item value`, async ({ page }) => {
    const { panel, panel2 } = await setup(page, 'controlled-custom', reference); await expect(panel).toHaveCount(1); await expect(panel).toBeVisible(); await expect(panel).toHaveAttribute('data-open'); await expect(panel2).toHaveCount(0);
  });
  test(`R:370 ${framework} can disable the whole accordion`, async ({ page }) => {
    await setup(page, 'disabled-root-state', reference); for (const id of ['item-1', 'header-1', 'trigger-1', 'panel-1', 'item-2', 'header-2', 'trigger-2']) await expect(page.getByTestId(id)).toHaveAttribute('data-disabled');
  });
  test(`R:399 ${framework} can disable one item`, async ({ page }) => {
    await setup(page, 'disabled-item-state', reference); for (const id of ['item-1', 'header-1', 'trigger-1', 'panel-1']) await expect(page.getByTestId(id)).toHaveAttribute('data-disabled'); for (const id of ['item-2', 'header-2', 'trigger-2']) await expect(page.getByTestId(id)).not.toHaveAttribute('data-disabled');
  });
  for (const disabledPart of ['root', 'item']) test(`R:431 ${framework} does not toggle or fire callbacks when ${disabledPart} disabled`, async ({ page }) => {
    const { trigger, panel } = await setup(page, `disabled-${disabledPart}`, reference);
    // Upstream user.pointer sends the click to this aria-disabled, focusable host.
    // Bypass Playwright's enabled check while preserving trusted browser input.
    await trigger.click({ force: true }); await trigger.focus(); await page.keyboard.press('Space'); await page.keyboard.press('Enter'); await closed(trigger, panel); expect(await calls(page)).toHaveLength(0); expect(await itemCalls(page)).toHaveLength(0);
  });
  test(`R:473 ${framework} mouseup allows preventBaseUIHandler`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message)); const { trigger } = await setup(page, 'mouseup', reference); await trigger.dispatchEvent('mouseup'); expect(errors).toEqual([]);
  });
  for (const native of [true, false]) for (const key of ['Enter', 'Space']) test(`R:496 ${framework} ${native ? 'native' : 'custom'} ${key} toggles`, async ({ page }) => {
    const { trigger, panel } = await setup(page, native ? 'keyboard-native' : 'keyboard-custom', reference); await closed(trigger, panel); await page.keyboard.press('Tab'); await expect(trigger).toBeFocused(); await page.keyboard.press(key); await opened(trigger, panel); await page.keyboard.press(key); await closed(trigger, panel);
  });
  for (const native of [true, false]) test(`R:541 ${framework} ${native ? 'native' : 'custom'} opens and closes on Space keyup`, async ({ page }) => {
    const { trigger, panel } = await setup(page, native ? 'timing-native' : 'timing-custom', reference); await page.keyboard.press('Tab'); await expect(trigger).toBeFocused();
    await page.keyboard.down('Space'); await closed(trigger, panel); expect(await itemCalls(page)).toHaveLength(0);
    await page.keyboard.up('Space'); await expect(trigger).toHaveAttribute('aria-expanded', 'true'); await expect(panel).toHaveCount(1); expect(await itemCalls(page)).toHaveLength(1); expect((await itemCalls(page)).at(-1)?.open).toBe(true);
    await page.keyboard.down('Space'); await expect(trigger).toHaveAttribute('aria-expanded', 'true'); await expect(panel).toHaveCount(1); expect(await itemCalls(page)).toHaveLength(1);
    await page.keyboard.up('Space'); await closed(trigger, panel); expect(await itemCalls(page)).toHaveLength(2); expect((await itemCalls(page)).at(-1)?.open).toBe(false);
  });
  test(`R:593 ${framework} item cancel prevents uncontrolled opening`, async ({ page }) => { const { trigger, panel } = await setup(page, 'cancel-item', reference); await trigger.dispatchEvent('click'); await closed(trigger, panel); expect(await calls(page)).toHaveLength(0); });
  test(`R:623 ${framework} root cancel prevents uncontrolled opening`, async ({ page }) => { const { trigger, panel } = await setup(page, 'cancel-root', reference); await trigger.dispatchEvent('click'); await closed(trigger, panel); expect(await calls(page)).toHaveLength(1); });
  test(`R:648 ${framework} root cancel prevents uncontrolled closing`, async ({ page }) => { const { trigger, panel } = await setup(page, 'cancel-root-close', reference); await trigger.dispatchEvent('click'); await expect(trigger).toHaveAttribute('aria-expanded', 'true'); await expect(panel).toHaveAttribute('data-open'); expect(await calls(page)).toHaveLength(1); expect((await calls(page)).at(-1)?.value).toEqual([]); });
  test(`R:674 ${framework} item cancel prevents controlled root callback`, async ({ page }) => { const { trigger, panel } = await setup(page, 'cancel-item-controlled', reference); await trigger.dispatchEvent('click'); await closed(trigger, panel); expect(await calls(page)).toHaveLength(0); });
  test(`R:704 ${framework} root cancel prevents controlled opening`, async ({ page }) => { const { trigger, panel } = await setup(page, 'cancel-root-controlled', reference); await trigger.dispatchEvent('click'); await closed(trigger, panel); expect(await calls(page)).toHaveLength(1); });
  test(`R:742 ${framework} root cancel prevents multiple opening`, async ({ page }) => { const { trigger, panel } = await setup(page, 'cancel-multiple-open', reference); await trigger.dispatchEvent('click'); await closed(trigger, panel); expect(await calls(page)).toHaveLength(1); });
  test(`R:767 ${framework} root cancel prevents multiple closing`, async ({ page }) => { const { trigger, panel } = await setup(page, 'cancel-multiple-close', reference); await trigger.dispatchEvent('click'); await expect(trigger).toHaveAttribute('aria-expanded', 'true'); await expect(panel).toHaveAttribute('data-open'); expect(await calls(page)).toHaveLength(1); });
  test(`R:794 ${framework} multiple items can be open`, async ({ page }) => {
    const { trigger, trigger2, panel, panel2 } = await setup(page, 'multiple', reference); await expect(trigger).not.toHaveAttribute('data-panel-open'); await expect(trigger2).not.toHaveAttribute('data-panel-open'); await expect(panel).toHaveCount(0); await expect(panel2).toHaveCount(0); await trigger.click(); await trigger2.click(); await expect(panel).toHaveAttribute('data-open'); await expect(panel2).toHaveAttribute('data-open'); await expect(trigger).toHaveAttribute('data-panel-open'); await expect(trigger2).toHaveAttribute('data-panel-open'); await trigger.click(); await expect(panel).toHaveCount(0); await expect(panel2).toHaveAttribute('data-open'); await expect(trigger).not.toHaveAttribute('data-panel-open'); await expect(trigger2).toHaveAttribute('data-panel-open');
  });
  test(`R:835 ${framework} only one item opens when multiple=false`, async ({ page }) => {
    const { trigger, trigger2, panel, panel2 } = await setup(page, 'single', reference); await expect(panel).toHaveCount(0); await expect(panel2).toHaveCount(0); await expect(trigger).not.toHaveAttribute('data-panel-open'); await expect(trigger2).not.toHaveAttribute('data-panel-open'); await trigger.click(); await expect(panel).toHaveAttribute('data-open'); await expect(trigger).toHaveAttribute('data-panel-open'); await trigger2.click(); await expect(panel2).toHaveAttribute('data-open'); await expect(trigger2).toHaveAttribute('data-panel-open'); await expect(panel).toHaveCount(0); await expect(trigger).not.toHaveAttribute('data-panel-open');
  });
  test(`R:875 ${framework} onValueChange default item values`, async ({ page }) => {
    const { trigger, trigger2 } = await setup(page, 'values-default', reference); expect(await calls(page)).toHaveLength(0); await trigger.click(); expect(await calls(page)).toHaveLength(1); expect((await calls(page)).at(-1)?.value).toEqual([0]); expect((await calls(page)).at(-1)?.reason).toBe('trigger-press'); expect((await calls(page)).at(-1)?.type).not.toBe('base-ui'); await trigger2.focus(); await page.keyboard.press('Space'); expect(await calls(page)).toHaveLength(2); expect((await calls(page)).at(-1)?.value).toEqual([0, 1]); expect((await calls(page)).at(-1)?.reason).toBe('trigger-press'); expect((await calls(page)).at(-1)?.type).not.toBe('base-ui');
  });
  test(`R:915 ${framework} onValueChange custom item values`, async ({ page }) => {
    const { trigger, trigger2 } = await setup(page, 'values-custom', reference); expect(await calls(page)).toHaveLength(0); await trigger2.click(); expect(await calls(page)).toHaveLength(1); expect((await calls(page))[0].value).toEqual(['two']); await trigger.click(); expect(await calls(page)).toHaveLength(2); expect((await calls(page))[1].value).toEqual(['two', 'one']);
  });
  test(`R:950 ${framework} onValueChange multiple=false`, async ({ page }) => {
    const { trigger, trigger2 } = await setup(page, 'values-single', reference); expect(await calls(page)).toHaveLength(0); await trigger.click(); expect(await calls(page)).toHaveLength(1); expect((await calls(page))[0].value).toEqual(['one']); await trigger2.click(); expect(await calls(page)).toHaveLength(2); expect((await calls(page))[1].value).toEqual(['two']);
  });
  test(`I:9 ${framework} throws outside Accordion.Root`, async ({ page }) => {
    // The pinned rejects.toThrow(string) checks a message substring.
    await setup(page, 'outside-item', reference); await expect(page.getByTestId('context-error')).toContainText('Base UI: AccordionRootContext is missing. Accordion parts must be placed within <Accordion.Root>.');
  });
  test(`H:8 ${framework} throws outside Accordion.Item`, async ({ page }) => {
    // Preserve Svelte's appended development component trace in the fixture.
    await setup(page, 'outside-header', reference); await expect(page.getByTestId('context-error')).toContainText('Base UI: AccordionItemContext is missing. Accordion parts must be placed within <Accordion.Item>.');
  });
  test(`I:29 ${framework} never reports hidden=true after opening starts`, async ({ page }) => {
    const { trigger } = await setup(page, 'item-state', reference); await trigger.click(); expect(await page.evaluate(() => (window as Window & { accordionStates: { open: boolean; hidden: boolean }[] }).accordionStates.some(state => state.open && state.hidden))).toBe(false);
  });
  test(`T:21 ${framework} non-native trigger remains tabbable`, async ({ page }) => { const { trigger } = await setup(page, 'custom', reference); await expect(trigger).toHaveAttribute('tabindex', '0'); });
  test(`P:31 ${framework} warns when panel hiddenUntilFound overrides keepMounted=false`, async ({ page }) => {
    const warnings: string[] = []; page.on('console', message => { if (message.type() === 'warning') warnings.push(message.text()); }); const { panel } = await setup(page, 'panel-warning', reference); expect(warnings).toContain('Base UI: The `keepMounted={false}` prop on an `Accordion.Panel` is ignored when `hiddenUntilFound` is enabled on the panel or root, since the panel must remain mounted while closed.'); await expect(panel).toHaveAttribute('hidden', 'until-found');
  });
  test(`P:55 ${framework} SSR suppresses initial inline keyframe animation`, async ({ page }) => {
    const response = await page.goto(`/accordion-ssr?case=ssr-inline${reference ? '&reference' : ''}`); const style = await page.evaluate(markup => { const panel = new DOMParser().parseFromString(markup, 'text/html').querySelector('[data-testid="panel-1"]') as HTMLElement; return { name: panel.style.animationName, duration: panel.style.animationDuration }; }, await response!.text()); expect(style.name).toBe('none'); expect(style.duration).toBe('100ms');
  });
  test(`P:97 ${framework} passes root keepMounted to closed panels`, async ({ page }) => { const { panel } = await setup(page, 'root-keep', reference); await expect(panel).toHaveAttribute('hidden'); });
  test(`P:112 ${framework} root hiddenUntilFound allows panel overrides`, async ({ page }) => { const { panel, panel2 } = await setup(page, 'root-hidden', reference); await expect(panel).toHaveAttribute('hidden', 'until-found'); await expect(panel2).toHaveCount(0); });
  test(`P:137 ${framework} switching retains closing panel until exit transition completes`, async ({ page }) => {
    const { trigger2, panel, panel2 } = await setup(page, 'switch', reference); await expect(panel).toHaveAttribute('data-open'); await expect.poll(() => panel.evaluate((node: HTMLElement) => node.style.getPropertyValue('--accordion-panel-height'))).toBe('auto'); await trigger2.click(); await expect(panel).toHaveAttribute('data-ending-style'); await expect(panel).not.toHaveAttribute('hidden'); expect(await panel.evaluate((node: HTMLElement) => node.style.getPropertyValue('--accordion-panel-height'))).toMatch(/px$/); await expect(panel2).toHaveAttribute('data-open'); await expect(panel).toHaveAttribute('hidden'); await expect(panel2).not.toHaveAttribute('hidden');
  });
  for (const part of ['Root', 'Item', 'Header', 'Trigger', 'Panel']) for (const mode of ['default', 'function', 'element', 'style', 'function-style', 'element-style', 'class', 'wrapper-function', 'wrapper-element', 'wrapper-empty', 'ref-function', 'refs-element', 'merged-class', 'resolved-class']) test(`conformance ${framework} ${part} ${mode}`, async ({ page }) => {
    await page.goto(`/accordion${reference ? '-reference' : ''}?case=conformance&part=${part}&mode=${mode}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const node = page.getByTestId('conformance'); await expect(node).toHaveAttribute('lang', 'fr'); await expect(node).toHaveAttribute('data-foobar', 'foobar');
    if (['style', 'function-style', 'element-style'].includes(mode)) { await expect(node).toHaveAttribute('style', /color: green/); await expect(node).toHaveCSS('color', 'rgb(0, 128, 0)'); }
    if (!['default', 'style', 'class', 'wrapper-empty'].includes(mode)) await expect(node).toHaveAttribute('data-test-value', 'test-value');
    const tag = ['default', 'style', 'class'].includes(mode) ? part === 'Header' ? 'H3' : part === 'Trigger' ? 'BUTTON' : 'DIV' : 'DIV';
    expect(await node.evaluate(element => element.tagName)).toBe(tag);
    if (mode.startsWith('wrapper')) await expect(page.getByTestId('wrapper')).toHaveCount(1);
    if (mode === 'class') await expect(node).toHaveClass('test-class');
    if (mode === 'merged-class' || mode === 'resolved-class') {
      expect(await node.evaluate((element, token) => element.classList.contains(token), mode === 'resolved-class' ? 'conditional-component-classname' : 'component-classname')).toBe(true);
      expect(await node.evaluate(element => element.classList.contains('render-prop-classname'))).toBe(true);
    }
    if (reference) { await expect(node).toHaveAttribute('data-ref-instance', 'true'); await expect(node).toHaveAttribute('data-ref', tag); await expect(node).toHaveAttribute('data-ref-id', 'conformance'); if (mode === 'refs-element') { await expect(node).toHaveAttribute('data-render-ref', tag); await expect(node).toHaveAttribute('data-render-ref-id', 'conformance'); } }
    else { await expect(page.getByTestId('ref-instance')).toHaveText('true'); await expect(page.getByTestId('ref')).toHaveText(tag); await expect(page.getByTestId('ref-id')).toHaveText('conformance'); if (mode === 'refs-element') { await expect(page.getByTestId('render-ref')).toHaveText(tag); await expect(page.getByTestId('render-ref-id')).toHaveText('conformance'); await expect(page.getByTestId('ref-identity')).toHaveText('true'); } }
  });
  test(`supplement: ${framework} callback order and controlled owner acceptance`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'controlled-accept', reference); await trigger.click(); await opened(trigger, panel); expect(await page.getByTestId('order').innerText()).toBe('["item","root"]'); expect((await calls(page))[0].before).toBe('false'); await trigger.click(); await closed(trigger, panel); expect((await itemCalls(page)).map(call => call.open)).toEqual([true, false]); expect((await calls(page)).map(call => call.value)).toEqual([[0], []]);
  });
  test(`supplement: ${framework} cancellation details preserve native defaults`, async ({ page }) => {
    const { trigger } = await setup(page, 'cancel-root', reference); await trigger.click(); expect(await page.getByTestId('order').innerText()).toBe('["item","root"]'); expect((await calls(page))[0]).toMatchObject({ canceled: true, defaultPrevented: false, before: 'false' });
  });
  test(`supplement: ${framework} indexes follow DOM order and item removal`, async ({ page }) => {
    await setup(page, 'indexes', reference); await expect(page.getByTestId('item-1')).toHaveClass('item-0'); await expect(page.getByTestId('item-2')).toHaveClass('item-1'); await page.getByRole('button', { name: 'Reverse items', exact: true }).click(); await expect(page.getByTestId('item-1')).toHaveClass('item-1'); await expect(page.getByTestId('item-2')).toHaveClass('item-0'); await page.getByRole('button', { name: 'Toggle first item', exact: true }).click(); await expect(page.getByTestId('item-2')).toHaveClass('item-0'); await page.getByRole('button', { name: 'Toggle first item', exact: true }).click(); await expect(page.getByTestId('item-1')).toHaveClass('item-1');
  });
  test(`supplement: ${framework} panel IDs track explicit changes and host replacement`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'ids', reference); await expect(trigger).toHaveAttribute('aria-controls', (await panel.getAttribute('id'))!); await page.getByRole('button', { name: 'Change panel ID', exact: true }).click(); await expect(panel).toHaveAttribute('id', 'manual-panel'); await expect(trigger).toHaveAttribute('aria-controls', 'manual-panel'); await page.getByRole('button', { name: 'Replace host', exact: true }).click(); expect(await panel.evaluate(node => node.tagName)).toBe('SECTION'); await expect(trigger).toHaveAttribute('aria-controls', 'manual-panel'); await page.getByRole('button', { name: 'Change panel ID', exact: true }).click(); await expect(trigger).toHaveAttribute('aria-controls', (await panel.getAttribute('id'))!); await expect(panel).toHaveAttribute('aria-labelledby', (await trigger.getAttribute('id'))!);
  });
  test(`supplement: ${framework} beforematch opens with none reason and callback order`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'beforematch', reference); await expect(panel).toHaveAttribute('hidden', 'until-found'); await panel.dispatchEvent('beforematch'); await opened(trigger, panel); expect((await calls(page))[0]).toMatchObject({ value: [0], reason: 'none', type: 'beforematch' }); expect((await itemCalls(page))[0]).toMatchObject({ open: true, reason: 'none', type: 'beforematch' }); await expect(page.getByTestId('order')).toHaveText('["item","root"]');
  });
  test(`supplement: ${framework} inherited issue30 loses authored important alignment priority`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'important', reference); expect(await panel.evaluate((node: HTMLElement) => node.style.getPropertyPriority('justify-content'))).toBe('important'); await trigger.click(); await expect(panel).toHaveAttribute('data-open'); await page.evaluate(async () => { await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))); }); expect(await panel.evaluate((node: HTMLElement) => ({ value: node.style.justifyContent, priority: node.style.getPropertyPriority('justify-content') }))).toEqual({ value: 'center', priority: '' });
  });
  test(`supplement: ${framework} inherited issue31 beforematch listener stays on original host`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'replaced-host', reference); await panel.evaluate(node => { (window as Window & { originalAccordionPanel?: Element }).originalAccordionPanel = node; }); await page.getByRole('button', { name: 'Replace host', exact: true }).click(); expect(await panel.evaluate(node => node === (window as Window & { originalAccordionPanel?: Element }).originalAccordionPanel)).toBe(false); await panel.dispatchEvent('beforematch'); await expect(trigger).toHaveAttribute('aria-expanded', 'false'); expect(await calls(page)).toHaveLength(0);
  });
  test(`supplement: ${framework} inherited issue33 no-motion retained panel keeps idle status`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'no-motion-status', reference); await expect(panel).toHaveAttribute('data-open'); await trigger.click(); await expect(panel).toHaveAttribute('hidden'); await page.evaluate(async () => { await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))); }); await expect(panel).toHaveAttribute('data-status', 'idle'); await expect(panel).not.toHaveAttribute('data-ending-style'); await expect(trigger).toHaveAttribute('aria-expanded', 'false'); await expect(trigger).not.toHaveAttribute('aria-controls');
  });
  test(`supplement: ${framework} inherited issue34 removed panel host retains ending status`, async ({ page }) => {
    const { trigger, panel } = await setup(page, 'remove-close', reference); await expect(panel).toHaveAttribute('data-open'); await expect(panel).toHaveCSS('transition-duration', '0.3s'); await trigger.click(); await expect(panel).toHaveCount(0); await page.evaluate(async () => { await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))); }); expect(await page.evaluate(() => (window as Window & { accordionPanelStatuses: string[] }).accordionPanelStatuses.at(-1))).toBe('ending'); await expect(trigger).toHaveAttribute('aria-expanded', 'false'); await expect(trigger).not.toHaveAttribute('aria-controls');
  });
  test(`supplement: ${framework} inherited D03 disabled chorded mousedown focus difference`, async ({ page }) => {
    const { trigger } = await setup(page, 'disabled-root-state', reference);
    await trigger.evaluate(node => {
      node.setAttribute('data-pointerdowns', '0'); node.addEventListener('pointerdown', () => { node.setAttribute('data-pointerdowns', String(Number(node.getAttribute('data-pointerdowns')) + 1)); }, { capture: true });
      node.addEventListener('mousedown', event => { node.setAttribute('data-mousedown-trusted', String(event.isTrusted)); node.setAttribute('data-mousedown-button', String(event.button)); setTimeout(() => node.setAttribute('data-mousedown-prevented', String(event.defaultPrevented)), 0); }, { capture: true });
    });
    const box = await trigger.boundingBox(); expect(box).not.toBeNull(); await page.mouse.move(700, 500); await page.mouse.down({ button: 'right' });
    try {
      await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2); await page.mouse.down({ button: 'left' }); await expect(trigger).toHaveAttribute('data-pointerdowns', '0'); await expect(trigger).toHaveAttribute('data-mousedown-trusted', 'true'); await expect(trigger).toHaveAttribute('data-mousedown-button', '0');
      // Existing inherited difference: this characterization earns no parity credit.
      if (reference) await expect(trigger).toBeFocused(); else await expect(trigger).not.toBeFocused(); await expect(trigger).toHaveAttribute('data-mousedown-prevented', String(!reference)); expect(await calls(page)).toHaveLength(0); expect(await itemCalls(page)).toHaveLength(0);
    } finally { await page.mouse.up({ button: 'left' }); await page.mouse.up({ button: 'right' }); }
  });
  test(`supplement: ${framework} Item subscribers share one replacement host index`, async ({ page }) => {
    await setup(page, 'shared-host', reference); await expect.poll(() => page.evaluate(() => (window as Window & { accordionSharedIndexes: { outer: number; inner: number; sibling: number } }).accordionSharedIndexes)).toEqual({ outer: 0, inner: 0, sibling: 1 }); await expect(page.getByTestId('shared-host')).toHaveAttribute('data-index', '0'); await expect(page.getByTestId('sibling-host')).toHaveAttribute('data-index', '1');
  });
  test(`supplement: ${framework} deprecated orientation and loopFocus do not navigate focus`, async ({ page }) => {
    const { trigger, trigger2 } = await setup(page, 'no-roving', reference); await trigger.focus(); await page.keyboard.press('ArrowRight'); await expect(trigger).toBeFocused(); await page.keyboard.press('ArrowDown'); await expect(trigger).toBeFocused(); await page.keyboard.press('End'); await expect(trigger).toBeFocused(); await page.keyboard.press('Tab'); await expect(trigger2).toBeFocused();
  });
}
