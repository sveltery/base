#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
export TMPDIR="${TMPDIR:-$PWD/.checks/use-click-tmp}"
mkdir -p "$TMPDIR"
consumer_dir="$(mktemp -d "$TMPDIR/consumer.XXXXXX")"
trap 'rm -rf "$consumer_dir"' EXIT
sveltery_pack_package @sveltery/base "$consumer_dir" > /dev/null
node --input-type=module - "$consumer_dir" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
sveltery_prepare_consumer "$consumer_dir"
pnpm --dir "$consumer_dir" install --ignore-scripts > /dev/null
cat > "$consumer_dir/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { flushSync } from 'svelte';
  import { Button, mergeProps } from '@sveltery/base';
  // Installed-file diagnostic of a private helper, not a supported package subpath.
  import { useClick } from './node_modules/@sveltery/base/dist/floating-ui/hooks/useClick.svelte.js';
  import { FloatingRootStore } from './node_modules/@sveltery/base/dist/floating-ui/components/FloatingRootStore.svelte.js';
  import { PopupTriggerMap } from './node_modules/@sveltery/base/dist/utils/popups/popupTriggerMap.svelte.js';
  let reference = $state<HTMLElement | null>(null);
  let options = $state({ toggle: false });
  const changes: boolean[] = [];
  const store = new FloatingRootStore({
    open: true, transitionStatus: undefined, referenceElement: null, floatingElement: null,
    triggerElements: new PopupTriggerMap(), floatingId: 'packed-click', syncOnly: false, nested: false,
    onOpenChange(open, details) {
      changes.push(open);
      if (!details.isCanceled) store.update({ open });
    },
  });
  const open = $derived(store.useState('open'));
  $effect.pre(() => { store.update({ domReferenceElement: reference }); });
  const click = useClick(() => store, () => options);
  const props = $derived(mergeProps(click.reference, { onclick() { flushSync(() => { options = { toggle: true }; }); } }));
  export function snapshot() { return [...changes]; }
</script>
<Button {...props} bind:ref={reference}>Installed click</Button>
<output>{String(open)}</output>
SVELTE
cat > "$consumer_dir/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from 'svelte/server';
import * as Root from '@sveltery/base';
import { mergeProps } from '@sveltery/base/merge-props';
import Consumer from './Consumer.svelte';
assert.equal('useClick' in Root, false);
assert.equal(mergeProps({ id: 'old' }, { id: 'new' }).id, 'new');
const metadata = JSON.parse(readFileSync(new URL('./node_modules/@sveltery/base/package.json', import.meta.url)));
assert.equal(Object.keys(metadata.exports).some(key => /floating|use-click|store/.test(key)), false);
const output = render(Consumer).body;
assert.match(output, /Installed click/);
assert.match(output, /<output>true<\/output>/);
const dist = new URL('./node_modules/@sveltery/base/dist/', import.meta.url);
function scan(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) scan(file);
    else if (/\.(?:js|svelte)$/.test(entry.name)) {
      assert(!/from\s*['"](?:\$app\/|@sveltejs\/kit|react(?:\/|['"]))/u.test(readFileSync(file, 'utf8')), file);
    }
  }
}
scan(fileURLToPath(dist));
const click = readFileSync(new URL('floating-ui/hooks/useClick.svelte.js', dist), 'utf8');
assert(!/from\s*['"][^'"]*types\.js['"]/.test(click));
const element = readFileSync(new URL('floating-ui/utils/element.js', dist), 'utf8');
assert(!/from\s*['"][^'"]*popupTriggerMap\.svelte\.js['"]/.test(element));
const rootStore = readFileSync(new URL('floating-ui/components/FloatingRootStore.svelte.js', dist), 'utf8');
assert(!/from\s*['"][^'"]*(?:FloatingTreeStore|useHoverShared|safePolygon|nodes)\.js['"]/.test(rootStore));
assert.equal(readFileSync(new URL('floating-ui/types.js', dist), 'utf8').trim(), 'export {};');
console.log('Installed public root/subpath, private file diagnostic, no-browser SSR and emitted runtime boundary: PASS');
JS
node --import ./scripts/svelte-ssr-loader.mjs "$consumer_dir/check.mjs"
cat > "$consumer_dir/types.ts" <<'TS'
import { Button } from '@sveltery/base';
import { mergeProps } from '@sveltery/base/merge-props';
import { useClick, type UseClickProps } from './node_modules/@sveltery/base/dist/floating-ui/hooks/useClick.svelte.js';
import type { FloatingRootStore } from './node_modules/@sveltery/base/dist/floating-ui/components/FloatingRootStore.svelte.js';
const options: UseClickProps = { event: 'mousedown', touchOpenDelay: 100, reason: 'input-press' };
const select = (store: FloatingRootStore) => useClick(() => store, () => options);
void [Button, mergeProps, select];
// @ts-expect-error This private prerequisite adds no public helper export.
import { useClick as PublicUseClick } from '@sveltery/base';
void PublicUseClick;
TS
node packages/base/node_modules/typescript/bin/tsc --noEmit --strict --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler "$consumer_dir/types.ts"
cat > "$consumer_dir/consumer.test.ts" <<'TS'
import { expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Consumer from './Consumer.svelte';
it('installed private helper retains its selected callback through the public Button chain', async () => {
  const target = document.createElement('section');
  document.body.append(target);
  const component = mount(Consumer, { target });
  await tick();
  try {
    const button = target.querySelector('button')!;
    button.click();
    await tick();
    expect(component.snapshot()).toEqual([true]);
    expect(target.querySelector('output')!.textContent).toBe('true');
    button.click();
    await tick();
    expect(component.snapshot()).toEqual([true, false]);
    expect(target.querySelector('output')!.textContent).toBe('false');
  } finally {
    await unmount(component);
    target.remove();
  }
});
TS
cat > "$consumer_dir/vitest.config.mjs" <<JS
import { svelte } from '$PWD/packages/base/node_modules/@sveltejs/vite-plugin-svelte/src/index.js';
import { defineConfig } from '$PWD/packages/base/node_modules/vitest/dist/config.js';
export default defineConfig({ root: '$consumer_dir', plugins: [svelte()], resolve: { conditions: ['browser'], dedupe: ['svelte'] }, test: { environment: 'jsdom', include: ['consumer.test.ts'], maxWorkers: 1, fileParallelism: false } });
JS
NODE_OPTIONS=--max-old-space-size=768 node packages/base/node_modules/vitest/vitest.mjs run --config "$consumer_dir/vitest.config.mjs"
echo 'Installed useClick declaration and native public consumer: PASS'
