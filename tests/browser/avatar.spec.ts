// Assertion ports from Base UI 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: parity/avatar/UPSTREAM_LICENSE. Ordinary Image 34 / Fallback 10 / Root 0;
// three conformance declarations and six type assertions are separate categories.
// New supplements receive zero ordinary declaration credit.
import { expect, test, type Page, type Route } from '@playwright/test';
import { avatarDataUri, avatarMockSource, avatarFallbackMockSource, type AvatarDomSnapshot } from '../../apps/fixtures/src/lib/avatar-harness.js';
const png = Buffer.from(avatarDataUri.split(',')[1], 'base64');
async function setup(page: Page, scenario: string, reference: boolean) {
  await page.goto(`/avatar?case=${scenario}${reference ? '&reference' : ''}`);
  await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
  return page.getByTestId('image');
}
async function read(page: Page) { return page.evaluate(() => {
  const value = window.avatarHarness;
  return { statuses: value.statuses, callbacks: value.callbacks, events: value.events, constructed: value.constructed, animationReads: value.animationReads, probes: value.probes.map(({ src, srcset, sizes, crossOrigin, referrerPolicy, writes }) => ({ src, srcset, sizes, crossOrigin, referrerPolicy, writes })), firstPaint: value.firstPaint };
}); }
async function probe(page: Page, status: 'load' | 'error', index = -1) { await page.evaluate(({ status, index }) => { const value = window.avatarHarness.probes.at(index); if (!value) throw new Error('No detached Image probe'); (status === 'load' ? value.onload : value.onerror)?.(); }, { status, index }); }
async function rendered(page: Page, event: 'load' | 'error') { await page.getByTestId('image').dispatchEvent(event); }
async function button(page: Page, name: string) { await page.getByRole('button', { name, exact: true }).click(); }
// Pause before the Avatar mount. The initial clock positioning happens on an
// empty page; delay assertions never advance time except F:105's exact tick.
async function freezeDelayClock(page: Page) {
  const epoch = new Date('2026-10-02T00:00:00Z');
  await page.clock.install({ time: epoch });
  await page.clock.pauseAt(new Date(epoch.getTime() + 60_000));
}
async function mountSnapshot(page: Page) { return page.evaluate(() => {
  if (!window.avatarMountSnapshot) throw new Error('Avatar mount snapshot is missing');
  return window.avatarMountSnapshot;
}); }
async function commit(page: Page, action?: string) { return page.evaluate(name => {
  if (!window.avatarCommit) throw new Error('Avatar commit adapter is missing');
  return window.avatarCommit(name);
}, action); }
// Frozen DOM captures the exact synchronous hydration commit, before any load or
// frame can repair it. Playwright's role engine checks the complete host subtree;
// the actual-page full ancestor state guards external CSS/ancestors. Role queries
// do not require positive pixel dimensions (the source cached mock is JSDOM-only).
async function frozenHydrationWitness(page: Page, snapshot: AvatarDomSnapshot) {
  expect(snapshot.imageAncestorHidden).toBe(false);
  const witness = await page.context().newPage(); await witness.setContent(snapshot.html);
  return witness;
}
async function gate(page: Page) {
  const requests: Route[] = []; let settled: boolean | undefined;
  const respond = (route: Route, error: boolean) => route.fulfill({ status: error ? 404 : 200, contentType: error ? 'text/plain' : 'image/png', body: error ? 'missing' : png, headers: { 'access-control-allow-origin': '*', 'cache-control': 'max-age=3600' } });
  await page.route('https://avatar.test/**', route => { if (settled !== undefined) return respond(route, settled); requests.push(route); });
  return { requests, async resolve(error = false) { await expect.poll(() => requests.length).toBeGreaterThan(0); settled = error; const pending = requests.splice(0); for (const route of pending) await respond(route, error); } };
}
async function prepareSsr(page: Page, reference: boolean, keepMounted: boolean) {
  await page.goto(`/avatar-ssr?${reference ? 'reference&' : ''}${keepMounted ? 'keep' : ''}`);
  await expect(page.getByTestId('ssr-host')).toHaveAttribute('data-ready', 'true');
}
async function hydrateSsr(page: Page) { return page.evaluate(() => { if (!window.avatarHydrate) throw new Error('SSR hydrator is not ready'); return window.avatarHydrate(); }); }
async function ssr(page: Page, reference: boolean, keepMounted: boolean) {
  await prepareSsr(page, reference, keepMounted);
  const snapshot = await hydrateSsr(page);
  await expect(page.getByTestId('ssr-host')).toHaveAttribute('data-first-paint', 'true');
  return snapshot;
}
for (const reference of [false, true]) {
  const framework = reference ? 'React' : 'Svelte';
  test(`Image:102 ${framework} native image props`, async ({ page }) => {
    const image = await setup(page, 'native', reference); await expect(image).toHaveAttribute('crossorigin', 'anonymous'); await expect(image).toHaveAttribute('referrerpolicy', 'no-referrer'); await expect(image).toHaveAttribute('sizes', '48px'); await expect(image).toHaveAttribute('srcset', `${avatarMockSource} 1x, /avatar-assets/mock-2x.png 2x`);
  });
  test(`Image:123 ${framework} srcSet without src`, async ({ page }) => { const image = await setup(page, 'srcset', reference); await expect(image).toHaveAttribute('srcset', `${avatarMockSource} 1x`); await expect(page.getByTestId('fallback')).toHaveCount(0); });
  test(`Image:135 ${framework} responsive detached probe props`, async ({ page }) => {
    await setup(page, 'probe-responsive', reference); const first = (await read(page)).probes[0];
    expect(first.sizes).toBe('48px');
    expect(first.srcset).toBe(`${avatarMockSource} 1x, /avatar-assets/mock-2x.png 2x`);
    expect(first.src).toBe(avatarFallbackMockSource);
  });
  for (const [line, event, status] of [[150, 'load', 'loaded'], [176, 'error', 'error']] as const) test(`Image:${line} ${framework} detached probe ${event} callback order`, async ({ page }) => { await setup(page, 'pending', reference); await expect.poll(async () => (await read(page)).statuses).toEqual(['loading']); await probe(page, event); await expect.poll(async () => (await read(page)).statuses).toEqual(['loading', status]); });
  test(`Image:202 ${framework} cached error has no idle callback`, async ({ page }) => { await setup(page, 'cached-error', reference); await expect.poll(async () => (await read(page)).statuses).toEqual(['error']); });
  test(`Image:221 ${framework} keepMounted mounts without preload`, async ({ page }) => { const image = await setup(page, 'keep', reference); await expect(image).toHaveAttribute('src', avatarMockSource); await expect(page.getByTestId('fallback')).toHaveText('JD'); expect((await read(page)).constructed).toBe(0); });
  test(`Image:236 ${framework} rendered load derives status`, async ({ page }) => { await setup(page, 'keep', reference); await rendered(page, 'load'); await expect(page.getByTestId('fallback')).toHaveCount(0); expect((await read(page)).statuses).toEqual(['loading', 'loaded']); });
  test(`Image:262 ${framework} rendered error keeps image mounted`, async ({ page }) => { const image = await setup(page, 'keep', reference); await rendered(page, 'error'); await expect.poll(async () => (await read(page)).statuses).toEqual(['loading', 'error']); await expect(image).toHaveCount(1); await expect(page.getByTestId('fallback')).toHaveText('JD'); });
  for (const [line, event] of [[290, 'error'], [308, 'load']] as const) test(`Image:${line} ${framework} user on${event}`, async ({ page }) => { await setup(page, 'keep', reference); await rendered(page, event); await expect.poll(async () => (await read(page)).events).toEqual([event]); await expect(page.getByTestId('fallback')).toHaveCount(event === 'load' ? 0 : 1); });
  test(`Image:328 ${framework} user suppresses status update`, async ({ page }) => { const image = await setup(page, 'keep-prevent', reference); await rendered(page, 'load'); await expect(image).toHaveAttribute('data-loading'); await expect(page.getByTestId('fallback')).toHaveText('JD'); expect((await read(page)).statuses).toEqual(['loading']); });
  for (const [line, scenario] of [[351, 'keep-render-source'], [395, 'keep']] as const) test(`Image:${line} ${framework} reset ${scenario} source`, async ({ page }) => { await setup(page, scenario, reference); await rendered(page, 'load'); await expect(page.getByTestId('fallback')).toHaveCount(0); await page.evaluate(() => { window.avatarHarness.statuses.length = 0; }); await button(page, 'Set source'); await expect.poll(async () => (await read(page)).statuses).toEqual(['loading']); await expect(page.getByTestId('fallback')).toHaveText('JD'); if (line === 351) { await rendered(page, 'load'); await expect(page.getByTestId('fallback')).toHaveCount(0); expect((await read(page)).statuses).toEqual(['loading', 'loaded']); } });
  test(`Image:429 ${framework} server rendered cached keepMounted hydration`, async ({ page, request }) => {
    const html = await (await request.get(`/avatar-ssr?keep${reference ? '&reference' : ''}`)).text();
    expect(html).toContain('data-testid="image"'); expect(html).toContain('aria-hidden="true"'); expect(html).toContain('JD');
    await prepareSsr(page, reference, true); const image = page.getByTestId('image');
    await expect(image).toHaveAttribute('src', avatarDataUri); await expect(image).toHaveAttribute('aria-hidden', 'true');
    await expect(page.getByRole('img')).toHaveCount(0); await expect(page.getByTestId('fallback')).toBeVisible(); await expect(image).toHaveJSProperty('complete', true);
    const synchronous = await hydrateSsr(page); const witness = await frozenHydrationWitness(page, synchronous);
    try {
      await expect(witness.getByRole('img', { name: 'Jane Doe', exact: true })).toHaveAttribute('src', avatarDataUri);
      await expect(witness.getByTestId('image')).not.toHaveAttribute('aria-hidden');
      await expect(witness.getByTestId('fallback')).toHaveCount(0);
    } finally { await witness.close(); }
  });
  test(`Image:480 ${framework} real keepMounted has no detached preload`, async ({ page }) => { const controlled = await gate(page); const image = await setup(page, 'real-keep', reference); await controlled.resolve(); await expect(page.getByTestId('fallback')).toHaveCount(0); await expect(image).toHaveAttribute('src', 'https://avatar.test/avatar-a.png'); expect((await read(page)).constructed).toBe(0); });
  test(`Image:515 ${framework} sourceless real keepMounted reports error`, async ({ page }) => { await setup(page, 'no-source-keep', reference); expect((await read(page)).statuses).toEqual(['error']); await expect(page.getByTestId('fallback')).toHaveText('JD'); });
  test(`Image:537 ${framework} loaded rendered image survives replacement prop change`, async ({ page }) => { const image = await setup(page, 'real-keep-replacement', reference); await expect(page.getByTestId('fallback')).toHaveCount(0); await page.evaluate(() => { window.avatarHarness.statuses.length = 0; }); await button(page, 'Update props'); await expect(image).toContainClass('updated'); expect((await read(page)).statuses).toEqual([]); });
  test(`Image:575 ${framework} accessible image appears after load`, async ({ page }) => { const image = await setup(page, 'keep', reference); await expect(image).toHaveAttribute('aria-hidden', 'true'); await expect(page.getByRole('img')).toHaveCount(0); await rendered(page, 'load'); await expect(image).not.toHaveAttribute('aria-hidden'); await expect(page.getByRole('img', { name: 'Jane Doe' })).toHaveCount(1); });
  test(`Image:595 ${framework} errored rendered image stays aria hidden`, async ({ page }) => { const image = await setup(page, 'keep', reference); await rendered(page, 'error'); await expect(image).toHaveAttribute('data-error'); await expect(image).toHaveAttribute('aria-hidden', 'true'); await expect(page.getByTestId('fallback')).toHaveText('JD'); });
  test(`Image:615 ${framework} source change restores aria hidden`, async ({ page }) => { const image = await setup(page, 'keep', reference); await rendered(page, 'load'); await expect(image).not.toHaveAttribute('aria-hidden'); await button(page, 'Set source'); await expect(image).toHaveAttribute('aria-hidden', 'true'); });
  test(`Image:643 ${framework} aria-hidden consumer override`, async ({ page }) => { const image = await setup(page, 'keep-aria-override', reference); await expect(image).toHaveAttribute('aria-hidden', 'false'); await rendered(page, 'load'); await expect(page.getByTestId('fallback')).toHaveCount(0); await expect(image).toHaveAttribute('aria-hidden', 'false'); });
  test(`Image:667 ${framework} loading and error attributes`, async ({ page }) => { const image = await setup(page, 'keep', reference); await expect(image).toHaveAttribute('data-loading'); await rendered(page, 'load'); await expect(image).not.toHaveAttribute('data-loading'); await expect(image).not.toHaveAttribute('data-error'); await rendered(page, 'error'); await expect(image).toHaveAttribute('data-error'); });
  test(`Image:691 ${framework} source-less callback preserves render source`, async ({ page }) => { const image = await setup(page, 'keep-callback-source', reference); await expect(image).toHaveAttribute('sizes', '48px'); await expect(image).toHaveAttribute('src', avatarMockSource); await expect(image).toHaveAttribute('srcset', `${avatarMockSource} 1x`); });
  test(`Image:717 ${framework} request settings precede source props`, async ({ page }) => { const image = await setup(page, 'keep-order', reference); const keys = (await image.getAttribute('data-source-keys'))!.split(','); for (const key of ['loading', 'sizes', reference ? 'srcSet' : 'srcset']) expect(keys.indexOf('src')).toBeGreaterThan(keys.indexOf(key)); });
  test(`Image:747 ${framework} image wrapper may drop element ref`, async ({ page }) => { const image = await setup(page, 'dropped-ref', reference); await expect(page.getByTestId('fallback')).toHaveCount(0); await button(page, 'Update props'); await expect(image).toContainClass('updated'); await expect(page.getByTestId('fallback')).toHaveCount(0); expect((await read(page)).statuses).toEqual(['loaded']); });
  test(`Image:797 ${framework} real source change reports loading then error`, async ({ page }) => { const controlled = await gate(page); const image = await setup(page, 'real-keep-cached', reference); await expect(page.getByTestId('fallback')).toHaveCount(0); await button(page, 'Set source'); await expect(image).toHaveAttribute('data-loading'); await controlled.resolve(true); await expect(image).toHaveAttribute('data-error'); expect((await read(page)).statuses).toEqual(['loaded', 'loading', 'error']); });
  test(`Image:846 ${framework} image mount runs enter transition`, async ({ page }) => { await setup(page, 'animation-enter', reference); await expect(page.getByTestId('image')).toHaveCount(0); await button(page, 'Show image'); await expect.poll(async () => (await read(page)).events).toContain('transitionend'); await expect(page.getByTestId('image')).toHaveCount(1); expect((await read(page)).animationReads).toBe(0); });
  test(`Image:911 ${framework} exit retains image until animation finishes`, async ({ page }) => { const image = await setup(page, 'animation', reference); await expect(image).toHaveCount(1); await button(page, 'Clear source'); await expect(image).toHaveAttribute('data-ending-style'); await expect(image).toHaveCount(0); });
  test(`Image:965 ${framework} detached mode exit has no loading/error attributes`, async ({ page }) => { const image = await setup(page, 'animation', reference); await button(page, 'Clear source'); await expect(image).toHaveAttribute('data-ending-style'); await expect(image).not.toHaveAttribute('data-error'); await expect(image).not.toHaveAttribute('data-loading'); });
  test(`Image:1017 ${framework} keepMounted suppresses ending state`, async ({ page }) => { await gate(page); const image = await setup(page, 'real-keep-cached', reference); await expect(image).not.toHaveAttribute('data-loading'); await button(page, 'Set source'); await expect(image).not.toHaveAttribute('data-ending-style'); await expect(image).toHaveAttribute('data-loading'); });
  test(`Image:1065 ${framework} cached hydration does not replay enter`, async ({ page }) => { await prepareSsr(page, reference, true); await expect(page.getByTestId('image')).toHaveJSProperty('complete', true); const snapshot = await hydrateSsr(page); expect(snapshot.starting).toBe(false); await expect(page.getByTestId('image')).not.toHaveAttribute('data-starting-style'); });
  test(`Image:1100 ${framework} detached cached hydration removes fallback before paint`, async ({ page, request }) => {
    const html = await (await request.get(`/avatar-ssr${reference ? '?reference' : ''}`)).text(); expect(html).toContain('JD'); expect(html).not.toContain('data-testid="image"');
    await prepareSsr(page, reference, false); await expect(page.getByTestId('fallback')).toBeVisible(); await expect(page.getByRole('img')).toHaveCount(0);
    const synchronous = await hydrateSsr(page); const witness = await frozenHydrationWitness(page, synchronous);
    try {
      await expect(witness.getByRole('img')).toHaveAttribute('src', avatarDataUri);
      await expect(witness.getByTestId('fallback')).toHaveCount(0);
    } finally { await witness.close(); }
  });
  test(`Image:1136 ${framework} cached src immediately displays image`, async ({ page }) => {
    await setup(page, 'cached', reference); const witness = await frozenHydrationWitness(page, await mountSnapshot(page));
    try {
      await expect(witness.getByRole('img')).toHaveAttribute('src', avatarMockSource);
      await expect(witness.getByTestId('fallback')).toHaveCount(0);
    } finally { await witness.close(); }
  });
  test(`Fallback:38 ${framework} loaded image hides fallback`, async ({ page }) => { await setup(page, 'fallback-loaded', reference); await expect(page.getByTestId('fallback')).toHaveCount(0); });
  test(`Fallback:53 ${framework} failed image shows fallback`, async ({ page }) => { await setup(page, 'fallback-error', reference); await expect(page.getByTestId('fallback')).toHaveText('JD'); });
  test(`Fallback:68 ${framework} image unmount restores fallback`, async ({ page }) => { const image = await setup(page, 'remove-loaded', reference); await expect(page.getByTestId('fallback')).toHaveCount(0); await expect(image).toHaveCount(1); await button(page, 'Remove image'); await expect(page.getByTestId('fallback')).toHaveText('JD'); await expect(image).toHaveCount(0); });
  test(`Fallback:105 ${framework} elapsed delay shows fallback`, async ({ page }) => {
    await freezeDelayClock(page); await setup(page, 'delay-idle', reference); const initial = await mountSnapshot(page);
    expect(initial.rootClass).toBe('root-idle'); expect(initial.fallbackText).toBe(null);
    await page.clock.runFor(100); const after = await commit(page);
    expect(after.fallbackText).toBe('JD'); expect(after.time).toBe(initial.time + 100);
  });
  test(`Fallback:120 ${framework} zero delay shows fallback immediately`, async ({ page }) => {
    await freezeDelayClock(page); await setup(page, 'delay-zero', reference); const initial = await mountSnapshot(page);
    expect(initial.rootClass).toBe('root-error'); expect(initial.fallbackText).toBe('JD');
    expect((await commit(page)).time).toBe(initial.time);
  });
  test(`Fallback:134 ${framework} positive to zero delay`, async ({ page }) => {
    await freezeDelayClock(page); await setup(page, 'delay-error', reference); const initial = await mountSnapshot(page);
    expect(initial.rootClass).toBe('root-error'); expect(initial.fallbackText).toBe(null);
    const after = await commit(page, 'Delay zero'); expect(after.fallbackText).toBe('JD'); expect(after.time).toBe(initial.time);
  });
  test(`Fallback:155 ${framework} undefined to number preserves shown fallback`, async ({ page }) => {
    await freezeDelayClock(page); await setup(page, 'delay-undefined', reference); const initial = await mountSnapshot(page);
    expect(initial.rootClass).toBe('root-error'); expect(initial.fallbackText).toBe('JD');
    const after = await commit(page, 'Delay number'); expect(after.fallbackText).toBe('JD'); expect(after.time).toBe(initial.time);
  });
  test(`Fallback:176 ${framework} number undefined number keeps shown fallback`, async ({ page }) => {
    await freezeDelayClock(page); await setup(page, 'delay-error', reference); const initial = await mountSnapshot(page);
    expect(initial.rootClass).toBe('root-error'); expect(initial.fallbackText).toBe(null);
    const withoutDelay = await commit(page, 'Delay undefined'); expect(withoutDelay.fallbackText).toBe('JD'); expect(withoutDelay.time).toBe(initial.time);
    const restored = await commit(page, 'Delay number'); expect(restored.fallbackText).toBe('JD'); expect(restored.time).toBe(initial.time);
  });
  test(`Fallback:203 ${framework} loading keeps fallback and no image`, async ({ page }) => { const image = await setup(page, 'empty', reference); await expect(image).toHaveCount(0); await expect(page.getByTestId('fallback')).toHaveText('JD'); await button(page, 'Show image'); await expect(image).toHaveCount(0); await expect(page.getByTestId('fallback')).toHaveText('JD'); });
  test(`Fallback:245 ${framework} switch to loaded image removes fallback immediately`, async ({ page }) => { const image = await setup(page, 'empty', reference); await expect(image).toHaveCount(0); await expect(page.getByTestId('fallback')).toHaveText('JD'); await button(page, 'Show image'); await probe(page, 'load'); await expect(image).toHaveCount(1); await expect(page.getByTestId('fallback')).toHaveCount(0); });
  for (const part of ['Root', 'Image', 'Fallback']) for (const mode of ['default', 'function', 'element', 'style', 'function-style', 'element-style', 'class', 'wrapper-function', 'wrapper-element', 'wrapper-empty', 'ref-function', 'refs-element', 'merged-class', 'resolved-class']) test(`conformance ${framework} ${part} ${mode}`, async ({ page }) => {
    await page.goto(`/avatar?case=conformance&part=${part}&mode=${mode}${reference ? '&reference' : ''}`); await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    const node = page.getByTestId('conformance'); await expect(node).toHaveAttribute('lang', 'fr'); await expect(node).toHaveAttribute('data-foobar', 'foobar');
    if (mode.includes('style')) await expect(node).toHaveCSS('color', 'rgb(0, 128, 0)');
    if (!['default', 'style', 'class', 'wrapper-empty'].includes(mode)) await expect(node).toHaveAttribute('data-test-value', 'test-value');
    if (mode.startsWith('wrapper')) await expect(page.getByTestId('wrapper')).toHaveCount(1);
    if (mode === 'class') await expect(node).toContainClass('test-class');
    if (mode.includes('class') && mode !== 'class') { await expect(node).toContainClass('render-prop-classname'); await expect(node).toContainClass(mode === 'resolved-class' ? 'conditional-component-classname' : 'component-classname'); }
    const tag = ['default', 'style', 'class'].includes(mode) ? part === 'Image' ? 'IMG' : 'SPAN' : 'DIV'; await expect(node).toHaveJSProperty('tagName', tag);
    if (reference) { await expect(node).toHaveAttribute('data-ref', tag); await expect(node).toHaveAttribute('data-ref-id', 'conformance'); if (mode === 'refs-element') { await expect(node).toHaveAttribute('data-render-ref', tag); await expect(node).toHaveAttribute('data-render-ref-id', 'conformance'); } }
    else { await expect(page.getByTestId('ref')).toHaveText(tag); await expect(page.getByTestId('ref-id')).toHaveText('conformance'); if (mode === 'refs-element') { await expect(page.getByTestId('render-ref')).toHaveText(tag); await expect(page.getByTestId('ref-identity')).toHaveText('true'); } }
  });
  test(`supplement ${framework} detached probe ordering and security options`, async ({ page }) => { await setup(page, 'probe-responsive', reference); expect((await read(page)).probes[0]).toMatchObject({ crossOrigin: 'anonymous', referrerPolicy: 'no-referrer', writes: ['referrerPolicy', 'crossOrigin', 'sizes', 'srcset', 'src'] }); });
  test(`supplement ${framework} native default prevention preserves status update`, async ({ page }) => { await setup(page, 'keep-default-prevent', reference); await rendered(page, 'load'); await expect(page.getByTestId('fallback')).toHaveCount(0); expect((await read(page)).statuses).toEqual(['loading', 'loaded']); });
  test(`supplement ${framework} obsolete probe completions are suppressed`, async ({ page }) => { await setup(page, 'pending', reference); await button(page, 'Set source'); await probe(page, 'load', 0); expect((await read(page)).statuses).toEqual(['loading']); await expect(page.getByTestId('image')).toHaveCount(0); await probe(page, 'load'); await expect(page.getByTestId('fallback')).toHaveCount(0); });
  test(`supplement ${framework} callback replacement is live and does not replay status`, async ({ page }) => { await setup(page, 'pending', reference); await button(page, 'Replace callback'); expect((await read(page)).callbacks).toEqual(['initial:loading']); await probe(page, 'load'); await expect.poll(async () => (await read(page)).callbacks).toEqual(['initial:loading', 'updated:loaded']); });
  test(`supplement ${framework} removed image ignores detached completion`, async ({ page }) => { await setup(page, 'pending', reference); await button(page, 'Remove image'); await probe(page, 'load'); await expect(page.getByTestId('fallback')).toHaveText('JD'); expect((await read(page)).statuses).toEqual(['loading']); await expect(page.getByTestId('root')).toContainClass('root-idle'); });
  for (const keep of [false, true]) for (const error of [false, true]) test(`supplement ${framework} real ${keep ? 'rendered' : 'detached'} ${error ? 'error' : 'load'} lifecycle`, async ({ page }) => { const controlled = await gate(page); const image = await setup(page, keep ? 'real-keep' : 'real', reference); await expect(page.getByTestId('fallback')).toHaveText('JD'); await expect(image).toHaveCount(keep ? 1 : 0); await controlled.resolve(error); await expect.poll(async () => (await read(page)).statuses).toEqual(['loading', error ? 'error' : 'loaded']); await expect(image).toHaveCount(keep || !error ? 1 : 0); await expect(page.getByTestId('fallback')).toHaveCount(error ? 1 : 0); if (keep) expect((await read(page)).constructed).toBe(0); });
  for (const keep of [false, true]) test(`supplement ${framework} real ${keep ? 'rendered' : 'detached'} responsive request uses CORS and no referrer`, async ({ page }) => {
    const controlled = await gate(page); const image = await setup(page, keep ? 'real-keep-responsive' : 'real-responsive', reference);
    await expect.poll(() => controlled.requests.length).toBeGreaterThan(0);
    const headers = await controlled.requests[0].request().allHeaders(); expect(headers.referer).toBeUndefined(); expect(headers.origin).toBe('http://127.0.0.1:5173');
    await controlled.resolve(); await expect(page.getByTestId('fallback')).toHaveCount(0);
    await expect(image).toHaveAttribute('sizes', '48px'); await expect(image).toHaveAttribute('srcset', 'https://avatar.test/avatar-a.png 1x, https://avatar.test/avatar-b.png 2x');
    await expect(image).toHaveAttribute('crossorigin', 'anonymous'); await expect(image).toHaveAttribute('referrerpolicy', 'no-referrer');
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.currentSrc)).toBe('https://avatar.test/avatar-a.png');
    await expect(image).toHaveJSProperty('naturalWidth', 1);
  });
  test(`supplement ${framework} exit animation cancellation permits removal`, async ({ page }) => { const image = await setup(page, 'animation', reference); await button(page, 'Clear source'); await expect(image).toHaveAttribute('data-ending-style'); await image.evaluate((node: HTMLElement) => node.getAnimations().forEach(animation => animation.cancel())); await expect(image).toHaveCount(0); });
  test(`supplement ${framework} loading again aborts stale exit completion`, async ({ page }) => { const image = await setup(page, 'animation', reference); await button(page, 'Clear source'); await expect(image).toHaveAttribute('data-ending-style'); await button(page, 'Show image'); await expect(image).toHaveCount(1); await expect(image).not.toHaveAttribute('data-ending-style'); await page.waitForTimeout(450); await expect(image).toHaveCount(1); await expect(page.getByTestId('fallback')).toHaveCount(0); });
  test(`supplement ${framework} replacement host rechecks cached real image`, async ({ page }) => { const image = await setup(page, 'real-keep-replacement', reference); await expect(page.getByTestId('fallback')).toHaveCount(0); const old = await image.elementHandle(); await button(page, 'Replace host'); await expect(image).toHaveCount(1); expect(await old!.evaluate(node => node.isConnected)).toBe(false); await expect(page.getByTestId('fallback')).toHaveCount(0); });
  // Pinned Image:91 suppresses the cached enter phase only with keepMounted. The
  // detached probe enters synchronously; React may commit its rAF state update
  // after this fixture's first frame observer. Fallback/accessibility stay resolved.
  for (const keep of [false, true]) test(`supplement ${framework} ${keep ? 'rendered' : 'detached'} first hydrated frame has no fallback flash`, async ({ page }) => { const errors: string[] = []; page.on('pageerror', error => errors.push(error.message)); page.on('console', message => { if (message.type() === 'error' || message.text().includes('hydration_mismatch')) errors.push(message.text()); }); const synchronous = await ssr(page, reference, keep); expect(synchronous).toMatchObject({ fallback: false, image: true, starting: !keep, hidden: null }); const firstFrame = (await read(page)).firstPaint; expect(firstFrame).toMatchObject({ fallback: false, image: true, hidden: null }); if (keep) expect(firstFrame?.starting).toBe(false); await expect(page.getByTestId('image')).not.toHaveAttribute('data-starting-style'); expect(errors).toEqual([]); });
}
