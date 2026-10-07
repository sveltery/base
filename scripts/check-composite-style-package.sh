#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
style_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-composite-style.XXXXXX")"
trap 'rm -rf "$style_consumer"' EXIT
sveltery_pack_package @sveltery/base "$style_consumer" > /dev/null
node --input-type=module - "$style_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const directory = process.argv[2];
const tarball = readdirSync(directory).find(name => name.endsWith('.tgz'));
writeFileSync(join(directory, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(directory, tarball)}`, svelte: '5.57.1' } }));
JS
sveltery_prepare_consumer "$style_consumer"
pnpm --dir "$style_consumer" install --ignore-scripts > /dev/null
pnpm --dir "$style_consumer" install --frozen-lockfile --ignore-scripts > /dev/null
cmp LICENSE "$style_consumer/node_modules/@sveltery/base/LICENSE"
cmp packages/utils/THIRD_PARTY_NOTICES.md "$style_consumer/node_modules/@sveltery/utils/THIRD_PARTY_NOTICES.md"
cat > "$style_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { RadioGroup, Radio } from '@sveltery/base';
  let calls = $state<string[]>([]);
  export function snapshot() { return [...calls]; }
</script>
<RadioGroup name="leaf-choice" defaultValue="a" onValueChange={(value: string) => calls.push(value)}>
  <Radio.Root value="a" id="leaf-a" data-testid="leaf-radio-a">A</Radio.Root>
  <Radio.Root value="b" id="leaf-b" data-testid="leaf-radio-b">B</Radio.Root>
</RadioGroup>
SVELTE
cat > "$style_consumer/types.ts" <<'TS'
import type { RadioGroupProps } from '@sveltery/base';
// @ts-expect-error Internal style repair adds no public helper export.
import type { getComputedStyle } from '@sveltery/base';
const props: RadioGroupProps<string> = { defaultValue: 'a' };
void props;
TS
cat > "$style_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"exactOptionalPropertyTypes":true,"skipLibCheck":false,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node packages/base/node_modules/svelte-check/bin/svelte-check --workspace "$style_consumer" --tsconfig ./tsconfig.json
cat > "$style_consumer/ssr.mjs" <<'JS'
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { render } from 'svelte/server';
import { RadioGroup as RootGroup } from '@sveltery/base';
import { RadioGroup as SubGroup } from '@sveltery/base/radio-group';
import Consumer from './Consumer.svelte';
assert.equal(RootGroup, SubGroup);
assert.equal(typeof document, 'undefined');
const result = render(Consumer);
assert.match(result.body, /role="radiogroup"/);
assert.match(result.body, /aria-checked="true"/);
writeFileSync(new URL('./server.html', import.meta.url), result.body);
console.log('Actual installed public root/subpath identity and no-browser SSR: PASS');
JS
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$style_consumer/ssr.mjs"
cat > "$style_consumer/client-loader.mjs" <<'JS'
import { registerHooks, createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('./package.json', import.meta.url));
const { compile, compileModule } = require('svelte/compiler');
registerHooks({ load(url, context, nextLoad) {
  if (url.endsWith('.svelte') || url.endsWith('.svelte.js')) {
    const source = readFileSync(fileURLToPath(url), 'utf8');
    const options = { filename: fileURLToPath(url), generate: 'client' };
    const result = url.endsWith('.svelte') ? compile(source, options) : compileModule(source, options);
    return { format: 'module', source: result.js.code, shortCircuit: true };
  }
  return nextLoad(url, context);
} });
JS
cat > "$style_consumer/hydrate.mjs" <<'JS'
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const { JSDOM } = createRequire(process.argv[2])('jsdom');
const dom = new JSDOM('<!doctype html><html><body><main></main></body></html>', { url: 'http://localhost', pretendToBeVisual: true });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLInputElement', 'HTMLFormElement', 'HTMLButtonElement', 'Element', 'SVGElement', 'Node', 'Text', 'Comment', 'Event', 'MouseEvent', 'KeyboardEvent', 'MutationObserver', 'getComputedStyle']) Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
const { hydrate, flushSync, unmount } = await import('svelte');
const { default: Consumer } = await import('./Consumer.svelte');
const target = document.querySelector('main');
target.innerHTML = readFileSync(new URL('./server.html', import.meta.url), 'utf8');
const firstInput = target.querySelector('#leaf-a');
const secondInput = target.querySelector('#leaf-b');
const first = target.querySelector('[role="radio"][data-testid="leaf-radio-a"]');
const second = target.querySelector('[role="radio"][data-testid="leaf-radio-b"]');
const app = hydrate(Consumer, { target }); flushSync();
assert.equal(target.querySelector('#leaf-a'), firstInput);
assert.equal(target.querySelector('#leaf-b'), secondInput);
assert.equal(target.querySelector('[role="radio"][data-testid="leaf-radio-a"]'), first);
assert.equal(target.querySelector('[role="radio"][data-testid="leaf-radio-b"]'), second);
assert.equal(first.getAttribute('role'), 'radio');
assert.equal(first.getAttribute('aria-checked'), 'true');
first.focus();
first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
await new Promise(resolve => requestAnimationFrame(resolve)); flushSync();
assert.equal(document.activeElement, second);
assert.equal(second.getAttribute('aria-checked'), 'true');
assert.deepEqual(app.snapshot(), ['b']);
await unmount(app);
assert.equal(target.childElementCount, 0);
dom.window.close();
console.log('Actual installed same-node hydration, Composite keyboard selection/callback and teardown: PASS');
JS
node --conditions=browser --import "$style_consumer/client-loader.mjs" "$style_consumer/hydrate.mjs" "$sveltery_repo_root/packages/base/package.json"
echo 'Composite style consumer: real dual tarballs, installed declarations skipLibCheck:false, negative export assertion, SSR/hydration: PASS'
