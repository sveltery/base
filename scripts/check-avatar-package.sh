#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
avatar_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-avatar-consumer.XXXXXX")"
trap 'rm -rf "$avatar_consumer"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$avatar_consumer" > /dev/null
node --input-type=module - "$avatar_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
pnpm --dir "$avatar_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$avatar_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
test -f "$avatar_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cmp LICENSE "$avatar_consumer/node_modules/@sveltery/base/LICENSE"
if [[ "${1:-}" == '--public' ]]; then
  cat > "$avatar_consumer/imports.js" <<'JS'
export { Avatar as First } from '@sveltery/base';
export { Avatar as Second } from '@sveltery/base/avatar';
JS
  cat > "$avatar_consumer/imports.d.ts" <<'TS'
export { Avatar as First, type AvatarRootProps, type AvatarImageProps, type AvatarFallbackProps } from '@sveltery/base';
export { Avatar as Second } from '@sveltery/base/avatar';
TS
  cat > "$avatar_consumer/PublicTypes.ts" <<'TS'
import type * as Root from '@sveltery/base';
import type * as Parts from '@sveltery/base/avatar';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
function exact<T extends true>(_value?: T) {}
exact<Equal<Root.AvatarRootProps, Parts.AvatarRootProps>>();
exact<Equal<Root.AvatarRootState, Parts.AvatarRootState>>();
exact<Equal<Root.AvatarImageProps, Parts.AvatarImageProps>>();
exact<Equal<Root.AvatarImageState, Parts.AvatarImageState>>();
exact<Equal<Root.AvatarFallbackProps, Parts.AvatarFallbackProps>>();
exact<Equal<Root.AvatarFallbackState, Parts.AvatarFallbackState>>();
exact<Equal<Root.ImageLoadingStatus, Parts.ImageLoadingStatus>>();
TS
else
  cat > "$avatar_consumer/imports.js" <<'JS'
export { Avatar as First, Avatar as Second } from './node_modules/@sveltery/base/dist/avatar/index.js';
JS
  cat > "$avatar_consumer/imports.d.ts" <<'TS'
export { Avatar as First, Avatar as Second, type AvatarRootProps, type AvatarImageProps, type AvatarFallbackProps } from './node_modules/@sveltery/base/dist/avatar/index.js';
TS
fi
cat > "$avatar_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { First, Second, type AvatarRootProps, type AvatarImageProps, type AvatarFallbackProps } from './imports.js';
  const root: AvatarRootProps = { title: 'Avatar', class: state => state.imageLoadingStatus };
  const image: AvatarImageProps = { keepMounted: true, loading: 'lazy', src: '/avatar.png', srcset: '/avatar.png 1x', sizes: '48px', crossorigin: 'anonymous', referrerpolicy: 'no-referrer', onLoadingStatusChange: _status => {} };
  const fallback: AvatarFallbackProps = { delay: 0 };
</script>
<First.Root {...root}><First.Image {...image} /><First.Fallback {...fallback}>JD</First.Fallback></First.Root>
<Second.Root><Second.Image src="/detached.png" /><Second.Fallback>AC</Second.Fallback></Second.Root>
SVELTE
cat > "$avatar_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import { writeFileSync } from 'node:fs';
import Consumer from './Consumer.svelte';
import { First, Second } from './imports.js';
assert.equal(First, Second);
assert.deepEqual(Object.keys(First).sort(), ['Fallback', 'Image', 'Root']);
const body = render(Consumer).body;
assert.equal((body.match(/<img/g) ?? []).length, 1);
assert.match(body, /src="\/avatar.png"/); assert.match(body, /srcset="\/avatar.png 1x"/);
assert.match(body, /alt=""/); assert.match(body, /aria-hidden="true"/);
assert.match(body, /loading="lazy"/); assert.match(body, /sizes="48px"/);
assert.match(body, /crossorigin="anonymous"/); assert.match(body, /referrerpolicy="no-referrer"/);
assert.match(body, /class="idle"/); assert(body.includes('JD')); assert(body.includes('AC'));
assert(!body.includes('src="/detached.png"'));
writeFileSync(new URL('./server.html', import.meta.url), body);
JS
cat > "$avatar_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"skipLibCheck":false,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$avatar_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$avatar_consumer" --tsconfig ./tsconfig.json
if [[ "${1:-}" == '--public' ]]; then
  cat > "$avatar_consumer/DOMConsumer.svelte" <<'SVELTE'
<script lang="ts">
  import { First, Second, type AvatarImageProps } from './imports.js';
  import type { HTMLImgAttributes } from 'svelte/elements';
  type ImageRenderProps = Parameters<NonNullable<AvatarImageProps['render']>>[0];
  let root = $state<HTMLElement | null>(), image = $state<HTMLElement | null>(), fallback = $state<HTMLElement | null>();
  let src = $state('/first.png'), replaced = $state(false), present = $state(true), canceled = $state(true);
  const calls: string[] = [];
  export function changeSource() { src = '/second.png'; }
  export function replace() { replaced = true; }
  export function remove() { present = false; }
  export function snapshot() { return { root, image, fallback, calls }; }
</script>
{#snippet replacement(props: ImageRenderProps)}
  {#if replaced}<img alt="" {...props as HTMLImgAttributes} data-replacement="next" />
  {:else}<img alt="" {...props as HTMLImgAttributes} data-replacement="first" />{/if}
{/snippet}
{#if present}
  <First.Root id="packed-avatar" bind:ref={root} class={state => state.imageLoadingStatus}>
    <Second.Image keepMounted {src} render={replacement} bind:ref={image}
      class={state => [state.imageLoadingStatus, { active: true }]}
      style={state => `opacity:${state.imageLoadingStatus === 'loaded' ? 1 : 0}`}
      onload={event => { calls.push('consumer'); if (canceled) { event.preventBaseUIHandler(); canceled = false; } }}
      onLoadingStatusChange={status => calls.push(`callback:${status}:${root?.className}`)} />
    <First.Fallback bind:ref={fallback}>JD</First.Fallback>
  </First.Root>
{/if}
SVELTE
  node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$avatar_consumer" --tsconfig ./tsconfig.json
  cat > "$avatar_consumer/dom-loader.mjs" <<'JS'
// Compile the installed package with its installed Svelte peer, using browser conditions.
import { registerHooks, createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('./package.json', import.meta.url));
const { compile, compileModule } = require('svelte/compiler');
registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith('.svelte') || url.endsWith('.svelte.js')) {
      const source = readFileSync(fileURLToPath(url), 'utf8');
      const options = { filename: fileURLToPath(url), generate: 'client' };
      const result = url.endsWith('.svelte') ? compile(source, options) : compileModule(source, options);
      return { format: 'module', source: result.js.code, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
JS
  cat > "$avatar_consumer/dom-check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const tooling = createRequire(process.argv[2]);
const { JSDOM } = tooling('jsdom');
const dom = new JSDOM('<!doctype html><html><body><main></main><aside></aside></body></html>', { url: 'http://localhost', pretendToBeVisual: true });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLImageElement', 'Element', 'Node', 'Text', 'Comment', 'Event', 'MouseEvent', 'MutationObserver', 'getComputedStyle']) {
  Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
}
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
const { mount, hydrate, flushSync, unmount } = await import('svelte');
const { default: Consumer } = await import('./DOMConsumer.svelte');
const target = document.querySelector('main');
const app = mount(Consumer, { target }); flushSync();
let image = target.querySelector('img');
assert.equal(app.snapshot().image, image); assert.equal(app.snapshot().fallback.textContent, 'JD');
assert.equal(image.getAttribute('src'), '/first.png'); assert.equal(image.getAttribute('alt'), '');
assert.equal(image.getAttribute('aria-hidden'), 'true'); assert.equal(image.className, 'loading active');
image.dispatchEvent(new Event('load')); flushSync();
assert.equal(image.getAttribute('aria-hidden'), 'true'); assert.equal(app.snapshot().root.className, 'loading');
assert.deepEqual(app.snapshot().calls.slice(-1), ['consumer']);
image.dispatchEvent(new Event('load')); flushSync();
assert.equal(image.style.opacity, '1'); assert.equal(image.hasAttribute('aria-hidden'), false);
assert.equal(app.snapshot().fallback, null); assert.equal(app.snapshot().root.className, 'loaded');
assert.deepEqual(app.snapshot().calls.slice(-2), ['consumer', 'callback:loaded:loading']);
app.changeSource(); flushSync();
assert.equal(image, target.querySelector('img')); assert.equal(image.getAttribute('src'), '/second.png');
assert.equal(image.getAttribute('aria-hidden'), 'true'); assert.equal(image.hasAttribute('data-ending-style'), false);
const previous = image; app.replace(); flushSync(); image = target.querySelector('img');
assert.notEqual(image, previous); assert.equal(previous.isConnected, false); assert.equal(app.snapshot().image, image);
assert.equal(image.dataset.replacement, 'next');
app.remove(); flushSync();
assert.equal(target.childElementCount, 0); assert.equal(app.snapshot().root, null); assert.equal(app.snapshot().image, null); assert.equal(app.snapshot().fallback, null);
await unmount(app);
// Real installed hydration, with an explicitly modeled preloaded image; browser paint evidence is separate.
Object.defineProperty(dom.window.HTMLImageElement.prototype, 'complete', { configurable: true, get() { return true; } });
Object.defineProperty(dom.window.HTMLImageElement.prototype, 'naturalWidth', { configurable: true, get() { return 100; } });
const hydrationTarget = document.querySelector('aside');
hydrationTarget.innerHTML = readFileSync(new URL('./server.html', import.meta.url), 'utf8');
const first = hydrationTarget.querySelector('img'); assert.equal(first.getAttribute('aria-hidden'), 'true');
const { default: SSRConsumer } = await import('./Consumer.svelte');
const hydrated = hydrate(SSRConsumer, { target: hydrationTarget }); flushSync();
assert.equal(hydrationTarget.querySelector('img'), first); assert.equal(first.hasAttribute('aria-hidden'), false);
assert.equal(first.hasAttribute('data-starting-style'), false); assert.equal(hydrationTarget.querySelectorAll('img').length, 2);
assert.equal(hydrationTarget.textContent.trim(), '');
await unmount(hydrated); assert.equal(hydrationTarget.childElementCount, 0);
dom.window.close();
console.log('Installed public Avatar DOM refs, render replacement, event cancellation, callback order and cached hydration model: PASS');
JS
  node --conditions=browser --import "$avatar_consumer/dom-loader.mjs" "$avatar_consumer/dom-check.mjs" "$sveltery_repo_root/packages/base/package.json"
fi
if [[ "${1:-}" == '--public' ]]; then
  echo 'Isolated tarball Avatar public root/subpath SSR, DOM, hydration model and strict declarations: PASS'
else
  echo 'Isolated tarball Avatar internal entry SSR and types: PASS (public entries await serialized integration)'
fi
