// Assertion ports from immutable Base UI v1.8.0 useRender/useRenderElement tests (MIT).
// Public ordinary, private ordinary and supplements stay separate; no conformance/type credit.
import { expect, test, type Page } from '@playwright/test';
import { publicCases, internalCases } from '../../apps/fixtures/src/lib/use-render-cases.js';
type HostRef = { tag: string; id: string; connected: boolean } | null;
type Snapshot = { calls: string[]; renders: { props: { class: unknown; style: unknown; 'data-testid': unknown }; state: Record<string, unknown> }[]; refs: HostRef[]; publicRefs?: HostRef[]; renderer?: { strict: boolean; strictEffects: boolean; reactVersion: string; animationsDisabled: boolean }; element: HostRef };
async function setup(page: Page, scenario: string, reference: boolean) {
  await page.goto(`/use-render?case=${scenario}${reference ? '&reference' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  return ['public-default', 'public-tag', 'public-replacement', 'minimal-class', 'minimal-style'].includes(scenario) ? page.locator('main > :not(button)') : page.locator('#tested-render, #submit-btn');
}
for (const reference of [false, true]) test(`supplement ${reference ? 'React' : 'Svelte'} SSR hydration actual host refs SVG children and removal`, async ({ page, request }) => {
  const url = `/use-render-ssr${reference ? '?reference' : ''}`; const response = await request.get(url); const markup = await response.text();
  expect(markup).toMatch(/<button[^>]*type="button"[^>]*id="ssr-render"|<button[^>]*id="ssr-render"[^>]*type="button"/); expect(markup).toContain('data-active=""'); expect(markup).toContain('SSR children'); expect(markup).toContain('SVG children');
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message)); page.on('console', message => { if (message.type() === 'error' || message.text().includes('hydration_mismatch')) errors.push(message.text()); });
  const actualRef = () => page.locator('main').evaluate(node => (node as HTMLElement & { renderRefProbe(): { tag: string; id: string; connected: boolean; same: boolean } | null }).renderRefProbe());
  await page.goto(url); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true'); await expect(page.locator('#ssr-render')).toHaveText('SSR children'); expect(await actualRef()).toEqual({ tag: 'BUTTON', id: 'ssr-render', connected: true, same: true });
  expect(await page.locator('#ssr-svg').evaluate(node => node instanceof SVGElement)).toBe(true); await expect(page.locator('#ssr-svg title')).toHaveText('SVG children');
  await page.getByRole('button', { name: 'Remove', exact: true }).click(); await expect(page.locator('#ssr-render')).toHaveCount(0); expect(await actualRef()).toBeNull(); expect(errors).toEqual([]);
});
async function probe(page: Page): Promise<Snapshot> { return page.locator('main').evaluate(node => (node as HTMLElement & { renderProbe(): Snapshot }).renderProbe()); }
for (const reference of [false, true]) {
  const framework = reference ? 'React' : 'Svelte';
  for (const scenario of [...publicCases, ...internalCases]) test(`${publicCases.includes(scenario) ? 'public ordinary' : 'internal ordinary'} ${framework} ${scenario}`, async ({ page }) => {
    const pageErrors: string[] = []; page.on('pageerror', error => pageErrors.push(error.message));
    const host = await setup(page, scenario, reference);
    if (reference) expect((await probe(page)).renderer).toEqual({ strict: true, strictEffects: true, reactVersion: '19.3.0', animationsDisabled: true });
    if (scenario === 'disabled-getter') { await expect(host).toHaveCount(0); expect((await probe(page)).calls).toEqual([]); return; }
    if (scenario === 'enabled-toggle') {
      await expect(host).toHaveCount(0); expect((await probe(page)).refs[0]).toBeNull();
      await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveCount(1); expect((await probe(page)).refs[0]).toEqual({ tag: 'DIV', id: 'tested-render', connected: true });
      await host.dispatchEvent('click'); expect((await probe(page)).calls).toEqual(['click']);
      await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveCount(0); expect((await probe(page)).refs[0]).toBeNull(); return;
    }
    await expect(host).toHaveCount(1);
    if (scenario === 'public-class') await expect(host).toHaveAttribute('class', 'my-span ');
    if (scenario === 'public-refs') { const refs = (await probe(page)).publicRefs!; expect(refs).toHaveLength(2); expect(refs).toEqual([{ tag: 'SPAN', id: 'tested-render', connected: true }, { tag: 'SPAN', id: 'tested-render', connected: true }]); }
    if (scenario === 'public-default') await expect(host).toHaveJSProperty('tagName', 'DIV');
    if (scenario === 'public-tag') { await expect(host).toHaveJSProperty('tagName', 'DIV'); await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveJSProperty('tagName', 'SPAN'); }
    if (scenario === 'public-replacement') { await expect(host).toHaveJSProperty('tagName', 'SPAN'); await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveJSProperty('tagName', 'SPAN'); }
    if (scenario === 'state-auto') { await expect(host).toHaveAttribute('data-active', ''); await expect(host).toHaveAttribute('data-index', '42'); }
    if (scenario === 'state-undefined-value') { await expect(host).toHaveAttribute('data-defined', 'value'); await expect(host).not.toHaveAttribute('data-notdefined'); }
    if (scenario === 'state-merged') { await expect(host).toHaveAttribute('data-form', 'login'); await expect(host).toHaveAttribute('class', 'btn-primary'); await expect(host).toHaveAttribute('id', 'submit-btn'); await expect(host).toHaveAttribute('data-existing', 'prop'); }
    if (scenario === 'state-override') await expect(host).toHaveAttribute('data-active', 'false');
    if (scenario === 'state-empty') { await expect(host).toHaveAttribute('class', 'test-class'); expect(await host.evaluate(node => node.getAttributeNames().filter(name => name.startsWith('data-')))).toEqual([]); }
    if (scenario === 'state-undefined') { await expect(host).toHaveAttribute('class', 'test-class'); await expect(host).toHaveAttribute('data-from-props', 'value'); }
    if (scenario === 'state-boolean') { await expect(host).toHaveAttribute('data-active', ''); await expect(host).not.toHaveAttribute('data-disabled'); }
    if (scenario === 'state-number') { await expect(host).not.toHaveAttribute('data-count'); await expect(host).toHaveAttribute('data-index', '42'); await expect(host).toHaveAttribute('data-percentage', '99.9'); }
    if (scenario === 'state-map') { await expect(host).toHaveAttribute('data-is-active', ''); await expect(host).toHaveAttribute('data-item-count', '5'); await expect(host).toHaveAttribute('data-user-name', 'John'); }
    if (scenario === 'class-function') await expect(host).toHaveAttribute('class', 'active-class test-component');
    if (scenario === 'class-undefined') await expect(host).toHaveAttribute('class', 'test-component');
    if (scenario === 'style-function' || scenario === 'style-undefined') await expect(host).toHaveAttribute('style', scenario === 'style-function' ? 'padding: 10px; color: rgb(255, 0, 0);' : 'padding: 10px;');
    if (scenario.startsWith('prevent-')) { await host.dispatchEvent(scenario.endsWith('contextmenu') ? 'contextmenu' : 'mousedown'); expect(pageErrors).toEqual([]); expect((await probe(page)).calls).toEqual(['prevent']); }
    if (scenario === 'ref-shape') {
      let snapshot = await probe(page); expect(snapshot.refs[0]).toEqual({ tag: 'DIV', id: 'tested-render', connected: true }); expect(snapshot.refs[1]).toBeNull();
      await page.getByRole('button', { name: 'Advance' }).click(); snapshot = await probe(page); expect(snapshot.refs[0]).toEqual(snapshot.refs[1]); expect(snapshot.refs[0]).toEqual({ tag: 'DIV', id: 'tested-render', connected: true });
      await host.dispatchEvent('click'); expect((await probe(page)).calls).toEqual(['second']);
      await page.getByRole('button', { name: 'Advance' }).click(); snapshot = await probe(page); expect(snapshot.refs[0]).toBeNull(); expect(snapshot.refs[1]).toEqual({ tag: 'DIV', id: 'tested-render', connected: true });
    }
    if (scenario === 'render-function' || scenario === 'clone-props') {
      await expect(host).toHaveJSProperty('tagName', 'SPAN'); await expect(host).toHaveAttribute('data-testid', 'custom'); await expect(host).toHaveAttribute('data-active', 'true');
      if (scenario === 'render-function') expect((await probe(page)).renders[0]).toEqual({ props: { class: 'test-component', style: 'padding:10px', 'data-testid': 'custom' }, state: { active: true } });
    }
    if (scenario === 'forward-ref') expect((await probe(page)).refs[0]).toEqual({ tag: 'DIV', id: 'tested-render', connected: true });
    if (scenario === 'clone-class' || scenario === 'clone-class-function') await expect(host).toHaveClass(scenario === 'clone-class' ? 'render-class component-class test-component' : 'render-class active-class test-component');
    if (scenario === 'clone-style' || scenario === 'clone-style-function') { await expect(host).toHaveCSS('padding', '10px'); await expect(host).toHaveCSS('color', 'rgb(255, 0, 0)'); await expect(host).toHaveCSS('font-size', '16px'); }
    if (scenario === 'clone-refs') { const snapshot = await probe(page); expect(snapshot.refs[0]).toEqual({ tag: 'DIV', id: 'tested-render', connected: true }); expect(snapshot.refs[2]).toEqual(snapshot.refs[0]); }
    if (scenario === 'minimal-class') await expect(host).toHaveAttribute('class', 'test-class');
    if (scenario === 'minimal-style') await expect(host).toHaveCSS('color', 'rgb(255, 0, 0)');
  });
  test(`supplement ${framework} stable ref callbacks cleanup SVG swap and teardown`, async ({ page }) => {
    const host = await setup(page, 'ref-cleanup', reference); expect((await probe(page)).calls).toEqual(['cleanup-attach:DIV', 'legacy-attach:DIV']);
    await page.getByRole('button', { name: 'Advance' }).click(); expect((await probe(page)).calls).toEqual(['cleanup-attach:DIV', 'legacy-attach:DIV']);
    await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveJSProperty('tagName', 'svg'); expect((await probe(page)).calls).toEqual(['cleanup-attach:DIV', 'legacy-attach:DIV', 'cleanup', 'legacy-null', 'cleanup-attach:svg', 'legacy-attach:svg']);
    await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveCount(0); expect((await probe(page)).refs[0]).toBeNull(); expect((await probe(page)).calls).toEqual(['cleanup-attach:DIV', 'legacy-attach:DIV', 'cleanup', 'legacy-null', 'cleanup-attach:svg', 'legacy-attach:svg', 'cleanup', 'legacy-null']);
  });
  test(`supplement ${framework} ref empty-slot and fixed-versus-array memoization`, async ({ page }) => {
    await setup(page, 'ref-slots', reference); expect((await probe(page)).calls).toEqual(['cleanup-attach:DIV']);
    await page.getByRole('button', { name: 'Advance' }).click(); expect((await probe(page)).calls).toEqual(['cleanup-attach:DIV', 'cleanup', 'cleanup-attach:DIV']);
    await page.getByRole('button', { name: 'Advance' }).click(); expect((await probe(page)).calls).toEqual(['cleanup-attach:DIV', 'cleanup', 'cleanup-attach:DIV', 'cleanup', 'cleanup-attach:DIV']);
    await page.getByRole('button', { name: 'Advance' }).click(); expect((await probe(page)).calls).toEqual(['cleanup-attach:DIV', 'cleanup', 'cleanup-attach:DIV', 'cleanup', 'cleanup-attach:DIV']);
  });
  test(`supplement ${framework} source state attributes stay live`, async ({ page }) => {
    const host = await setup(page, 'live-state', reference); await expect(host).toHaveAttribute('data-camelcase', ''); await expect(host).toHaveAttribute('data-inheritedname', 'yes');
    for (const key of ['zero', 'blank', 'no']) await expect(host).not.toHaveAttribute(`data-${key}`);
    await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).not.toHaveAttribute('data-camelcase'); await expect(host).toHaveAttribute('data-inheritedname', 'changed');
  });
  test(`supplement ${framework} getter owns raw handlers through later props class and style`, async ({ page }) => {
    const host = await setup(page, 'getter-raw', reference); await host.dispatchEvent('mousedown'); expect((await probe(page)).calls).toEqual(['raw-native:undefined']);
  });
  test(`supplement ${framework} later ordinary objects retain inherited enumerable props`, async ({ page }) => {
    const host = await setup(page, 'inherited-props', reference); await expect(host).toHaveAttribute('data-native', 'yes');
    await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveAttribute('data-native', 'yes');
  });
  test(`supplement ${framework} native empty-class normalization on the actual host`, async ({ page }) => {
    const host = await setup(page, 'literal-props', reference); if (reference) await expect(host).toHaveAttribute('class', ''); else await expect(host).not.toHaveAttribute('class');
    await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveAttribute('class', 'active');
    await page.getByRole('button', { name: 'Advance' }).click(); if (reference) await expect(host).toHaveAttribute('class', ''); else await expect(host).not.toHaveAttribute('class');
    await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).not.toHaveAttribute('class'); expect((await probe(page)).calls).toEqual([reference ? 'empty-attach:DIV:' : 'empty-attach:DIV:null']);
    await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveJSProperty('tagName', 'svg'); if (reference) await expect(host).toHaveAttribute('class', ''); else await expect(host).not.toHaveAttribute('class');
    expect((await probe(page)).calls).toEqual([reference ? 'empty-attach:DIV:' : 'empty-attach:DIV:null', 'empty-cleanup:DIV:null', reference ? 'empty-attach:svg:' : 'empty-attach:svg:null']);
    await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveCount(0);
    expect((await probe(page)).calls).toEqual([reference ? 'empty-attach:DIV:' : 'empty-attach:DIV:null', 'empty-cleanup:DIV:null', reference ? 'empty-attach:svg:' : 'empty-attach:svg:null', reference ? 'empty-cleanup:svg:' : 'empty-cleanup:svg:null']);
  });
  for (const scenario of ['ref-update-empty', 'ref-update-to-empty', 'ref-update-remove', 'ref-update-restore']) test(`supplement characterization ${framework} ${scenario} uses actual native ref timing`, async ({ page }) => {
    const before = scenario === 'ref-update-empty' ? '' : 'before';
    const after = scenario === 'ref-update-to-empty' ? '' : scenario === 'ref-update-remove' ? null : 'changed';
    const host = await setup(page, scenario, reference);
    const initialClass = reference ? before : before || null;
    const observedAfter = reference ? after : scenario === 'ref-update-restore' ? before : after || null;
    const cleanupClass = reference ? before : after || null;
    expect((await probe(page)).calls).toEqual([`first-attach:${String(initialClass)}`]);
    await host.evaluate(node => { Object.assign(document.querySelector('main')!, { originalHost: node }); });
    await page.getByRole('button', { name: 'Advance' }).click();
    expect(await host.evaluate(node => node === (document.querySelector('main') as HTMLElement & { originalHost: Element }).originalHost)).toBe(true);
    expect(await host.getAttribute('class')).toBe(observedAfter);
    expect((await probe(page)).calls).toEqual([`first-attach:${String(initialClass)}`, `first-cleanup:${String(cleanupClass)}`, `second-attach:${String(observedAfter)}`]);
    await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveCount(0);
    expect((await probe(page)).calls).toEqual([`first-attach:${String(initialClass)}`, `first-cleanup:${String(cleanupClass)}`, `second-attach:${String(observedAfter)}`, `second-cleanup:${String(observedAfter)}`]);
  });
  for (const scenario of ['ref-observation-unmount', 'ref-observation-snippet', 'ref-observation-default']) test(`supplement characterization ${framework} ${scenario} observes actual host connection`, async ({ page }) => {
    const host = await setup(page, scenario, reference);
    const connectionCalls = async () => (await probe(page)).calls.filter(value => value.startsWith('connection-'));
    expect(await connectionCalls()).toEqual(['connection-attach:DIV:true']);
    await page.getByRole('button', { name: 'Advance' }).click();
    // Explicit native attachment teardown difference: it supplies no ordinary declaration credit.
    const connected = reference;
    if (scenario === 'ref-observation-unmount') {
      await expect(host).toHaveCount(0);
      expect(await connectionCalls()).toEqual([`connection-attach:DIV:true`, `connection-cleanup:DIV:${connected}`]);
    } else {
      await expect(host).toHaveJSProperty('tagName', 'svg');
      expect(await connectionCalls()).toEqual(['connection-attach:DIV:true', `connection-cleanup:DIV:${connected}`, 'connection-attach:svg:true']);
      await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveCount(0);
      expect(await connectionCalls()).toEqual(['connection-attach:DIV:true', `connection-cleanup:DIV:${connected}`, 'connection-attach:svg:true', `connection-cleanup:svg:${reference}`]);
    }
  });
  for (const scenario of ['ref-outer-default', 'ref-outer-reverse', 'ref-outer-change', 'ref-outer-reuse', 'ref-outer-stable']) test(`supplement characterization ${framework} ${scenario} observes known render transitions`, async ({ page }) => {
    const before = scenario === 'ref-outer-default' ? 'DIV' : 'SPAN';
    const after = scenario === 'ref-outer-reverse' ? 'DIV' : scenario === 'ref-outer-change' ? 'SECTION' : 'SPAN';
    const host = await setup(page, scenario, reference);
    const connectionCalls = async () => (await probe(page)).calls.filter(value => value.startsWith('connection-'));
    expect(await connectionCalls()).toEqual([`connection-attach:${before}:true`]);
    await host.evaluate(node => { Object.assign(document.querySelector('main')!, { originalHost: node }); });
    await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveJSProperty('tagName', after);
    const retainsHost = scenario === 'ref-outer-stable' || reference && scenario === 'ref-outer-reuse';
    expect(await host.evaluate(node => node === (document.querySelector('main') as HTMLElement & { originalHost: Element }).originalHost)).toBe(retainsHost);
    const observations = retainsHost ? [`connection-attach:${before}:true`] : [`connection-attach:${before}:true`, `connection-cleanup:${before}:${reference}`, `connection-attach:${after}:true`];
    expect(await connectionCalls()).toEqual(observations); await expect(host).toHaveAttribute('class', scenario === 'ref-outer-stable' ? 'changed' : 'before');
    if (scenario === 'ref-outer-stable') await expect(host).toHaveAttribute('data-active', '');
    await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveCount(0);
    expect(await connectionCalls()).toEqual([...observations, `connection-cleanup:${after}:${reference}`]);
    // Same-tag identity reuse is an explicit native snippet characterization with zero unchanged credit.
  });
  test(`supplement ${framework} host spread drops inherited refs`, async ({ page }) => {
    await setup(page, 'inherited-ref', reference); expect((await probe(page)).refs).toEqual([null, null, null]);
  });
  test(`supplement ${framework} host ref accessor resolves once and tears down without rereading`, async ({ page }) => {
    const host = await setup(page, 'accessor-ref', reference); const observed = await probe(page);
    expect(observed.refs).toEqual([{ tag: 'DIV', id: 'tested-render', connected: true }, null, null]);
    expect(observed.calls.length).toBeGreaterThan(0); expect(observed.calls.every(value => value === 'ref-get:1')).toBe(true);
    await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveCount(0);
    expect((await probe(page)).refs).toEqual([null, null, null]); expect((await probe(page)).calls).toEqual(observed.calls);
  });
  test(`supplement ${framework} primitive state-mapped ref is ignored on attach and detach`, async ({ page }) => {
    const host = await setup(page, 'primitive-ref', reference); await expect(host).toHaveAttribute('data-active', '');
    await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveCount(0);
  });
  for (const scenario of ['default-button', 'default-img', 'replacement-default']) test(`supplement ${framework} intrinsic default ${scenario}`, async ({ page }) => {
    const host = await setup(page, scenario, reference); if (scenario === 'default-button') await expect(host).toHaveAttribute('type', 'button'); if (scenario === 'default-img') await expect(host).toHaveAttribute('alt', ''); if (scenario === 'replacement-default') await expect(host).not.toHaveAttribute('type');
  });
  for (const scenario of ['native-default', 'native-base']) test(`supplement ${framework} independent prevention ${scenario}`, async ({ page }) => {
    const host = await setup(page, scenario, reference);
    const prevented = await host.evaluate(node => { const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true }); node.dispatchEvent(event); return event.defaultPrevented; });
    expect(prevented).toBe(scenario === 'native-default'); expect((await probe(page)).calls).toEqual(scenario === 'native-default' ? ['consumer', 'internal'] : ['consumer']);
  });
  test(`supplement ${framework} disabled gates every callback and tears down existing refs`, async ({ page }) => {
    const host = await setup(page, 'all-gating', reference); await expect(host).toHaveCount(0); expect((await probe(page)).calls).toEqual([]);
    await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveCount(1); const enabledCalls = (await probe(page)).calls; expect(enabledCalls).toContain('getter:empty'); expect(enabledCalls).toContain('class'); expect(enabledCalls).toContain('style'); expect(enabledCalls).toContain('mapping'); expect(enabledCalls).toContain('legacy-attach:SPAN');
    await page.getByRole('button', { name: 'Advance' }).click(); await expect(host).toHaveCount(0); expect((await probe(page)).calls).toEqual([...enabledCalls, 'legacy-null']);
  });
}
