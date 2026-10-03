#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
anchor_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-anchor-consumer.XXXXXX")"
trap 'rm -rf "$anchor_consumer"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$anchor_consumer" > /dev/null
node --input-type=module - "$anchor_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' }, devDependencies: { '@sveltejs/vite-plugin-svelte': '7.3.1', vitest: '5.0.3', jsdom: '30.1.1' } }));
JS
pnpm --dir "$anchor_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$anchor_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
cat > "$anchor_consumer/private-types.ts" <<'TS'
import type { AnchorPositioningOptions, OffsetFunction, Boundary, Reference } from './node_modules/@sveltery/base/dist/internals/anchor-positioning/types.js';
import type { AnchorPositioningController } from './node_modules/@sveltery/base/dist/internals/anchor-positioning/controller.svelte.js';
const offset: OffsetFunction = data => data.anchor.width + data.positioner.height + (data.side === 'inline-start' ? 1 : 0);
const boundary: Boundary = 'clipping-ancestors';
const reference: Reference = { getBoundingClientRect: () => ({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0, toJSON: () => ({}) }) };
const options: AnchorPositioningOptions = { open: true, mounted: true, collisionAvoidance: { side: 'shift', align: 'shift' }, anchor: reference, collisionBoundary: boundary, sideOffset: offset };
const middleware: NonNullable<AnchorPositioningOptions['inline']> = { name: 'line-box', fn: () => ({}) };
const extended: AnchorPositioningOptions = { ...options, inline: middleware, adaptiveOrigin: middleware, lazyFlip: true };
// @ts-expect-error DOM engine platform override is not an adapter option.
const invalid: AnchorPositioningOptions = { ...options, platform: {} };
// @ts-expect-error React adapter options are not accepted.
const react: AnchorPositioningOptions = { ...options, rootContext: {} };
type Element = AnchorPositioningController['elements']['floating'];
const empty: Element = null;
void [options, extended, invalid, react, empty];
TS
cat > "$anchor_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"NodeNext","moduleResolution":"NodeNext","strict":true,"noEmit":true,"skipLibCheck":true},"files":["private-types.ts"]}
JSON
node "$sveltery_repo_root/packages/base/node_modules/typescript/bin/tsc" -p "$anchor_consumer/tsconfig.json"
cat > "$anchor_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as publicRoot from '@sveltery/base';
const require = createRequire(import.meta.url);
const metadata = JSON.parse(readFileSync(new URL('./node_modules/@sveltery/base/package.json', import.meta.url), 'utf8'));
assert.equal(metadata.dependencies['@floating-ui/dom'], '1.8.0'); assert.equal(metadata.dependencies['@floating-ui/utils'], '0.2.12');
assert.equal(metadata.exports['./anchor-positioning'], undefined);
for (const name of ['createAnchorPositioning', 'Menu', 'Popover', 'Tooltip', 'Select']) assert.equal(name in publicRoot, false);
const anchor = new URL('./node_modules/@sveltery/base/dist/internals/anchor-positioning/', import.meta.url);
for (const file of readdirSync(anchor)) {
  if (!/\.(?:js|ts)$/.test(file)) continue;
  assert.doesNotMatch(readFileSync(new URL(file, anchor), 'utf8'), /(?:from|import)\s*(?:\([^)]*)?['"](?:react(?:-dom)?|@floating-ui\/react[^'"]*)['"]/);
}
assert.throws(() => require.resolve('react'), { code: 'MODULE_NOT_FOUND' });
assert.throws(() => require.resolve('@floating-ui/react-dom'), { code: 'MODULE_NOT_FOUND' });
const policy = await import(new URL('policy.js', anchor));
assert.equal(policy.createPositioningPolicy({ open: true, mounted: true, collisionAvoidance: {} }, () => null, () => true).placement, 'bottom');
console.log('Isolated private anchor tarball dependency/type boundary: PASS');
JS
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$anchor_consumer/check.mjs"

cat > "$anchor_consumer/Consumer.svelte" <<'SVELTE'
<script>
  import { untrack } from 'svelte';
  import { useAnchorPositioning } from './node_modules/@sveltery/base/dist/internals/anchor-positioning/useAnchorPositioning.svelte.js';
  import { positioningAttachments } from './node_modules/@sveltery/base/dist/internals/anchor-positioning/attachments.js';
  let { ready = () => {} } = $props();
  let open = $state(false), mounted = $state(false);
  const position = useAnchorPositioning(() => ({ open, mounted, keepMounted: true, collisionAvoidance: {} }));
  const attach = positioningAttachments(position);
  untrack(() => ready(position));
  export function present(nextOpen, nextMounted) { open = nextOpen; mounted = nextMounted; }
</script>
<button {@attach attach.reference}>Anchor</button>
<div data-testid="floating" {@attach attach.floating} data-positioned={position.isPositioned}>Popup</div>
SVELTE
cat > "$anchor_consumer/ssr.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import Consumer from './Consumer.svelte';
assert.equal(typeof document, 'undefined');
const body = render(Consumer).body;
assert.match(body, /data-positioned="false"/); assert.doesNotMatch(body, /translate\(/);
console.log('Installed private anchor SSR consumer: PASS');
JS
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$anchor_consumer/ssr.mjs"
cat > "$anchor_consumer/vitest.config.js" <<'JS'
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
export default defineConfig({ plugins: [svelte()], resolve: { conditions: ['browser'] }, test: { environment: 'jsdom', include: ['consumer.test.js'] } });
JS
cat > "$anchor_consumer/consumer.test.js" <<'JS'
import { expect, test, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Consumer from './Consumer.svelte';
test('installed private geometry attaches, retains exit presence and tears down the real DOM engine', async () => {
  const target = document.createElement('main'); document.body.append(target);
  let position;
  const component = mount(Consumer, { target, props: { ready: value => position = value } });
  flushSync();
  expect(position.isPositioned).toBe(false); expect(position.elements.floating.style.opacity).toBe('0');
  expect(position.elements.domReference).toBe(target.querySelector('button'));
  component.present(true, true); flushSync();
  await vi.waitFor(() => expect(position.isPositioned).toBe(true));
  expect(position.error).toBe(null); expect(position.elements.floating.style.position).toBe('absolute');
  expect(position.elements.floating.style.getPropertyValue('--available-width')).toMatch(/px$/);
  component.present(false, true); flushSync();
  expect(position.isPositioned).toBe(true); expect(position.elements.floating.style.opacity).toBe('');
  component.present(false, false); flushSync();
  expect(position.isPositioned).toBe(false); expect(position.elements.floating.style.position).toBe('fixed');
  await unmount(component);
  expect(position.elements.floating).toBe(null); expect(position.elements.domReference).toBe(null);
  await position.update(); target.remove();
});
JS
pnpm --dir "$anchor_consumer" --ignore-workspace exec vitest run --config vitest.config.js
