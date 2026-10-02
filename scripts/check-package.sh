#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
consumer_dir="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-consumer.XXXXXX")"
trap 'rm -rf "$consumer_dir"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$consumer_dir"
mkdir -p "$consumer_dir/node_modules/@sveltery/base"
tar -xzf "$consumer_dir"/*.tgz --strip-components=1 -C "$consumer_dir/node_modules/@sveltery/base"
test -f "$consumer_dir/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cmp LICENSE "$consumer_dir/node_modules/@sveltery/base/LICENSE"
cat > "$consumer_dir/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createChangeEventDetails, Toast } from '@sveltery/base';
import { createToastManager, Portal } from '@sveltery/base/toast';
assert.equal(Toast.Portal, Portal);
assert.equal(Toast.createToastManager, createToastManager);
const toastManager = createToastManager();
assert.equal(toastManager.add({ id: 'tarball', data: { value: 1 } }), 'tarball');
const unattachedPromise = Promise.resolve('unchanged');
assert.equal(toastManager.promise(unattachedPromise, { loading: 'Loading', success: 'Done', error: 'Failed' }), unattachedPromise);
assert.equal('toasts' in toastManager, false);
import { mergeProps } from '@sveltery/base/merge-props';
assert.equal(mergeProps({ id: 'before' }, { id: 'after' }).id, 'after');
const details = createChangeEventDetails('none');
details.cancel();
assert.equal(details.isCanceled, true);
const metadata = JSON.parse(await readFile(new URL('./node_modules/@sveltery/base/package.json', import.meta.url), 'utf8'));
assert.equal(metadata.license, 'MIT');
console.log('Isolated tarball consumer: PASS');
JS
# Svelte is an actual package peer; resolve it without registry/publishing in this isolated consumer.
ln -s "$sveltery_repo_root/packages/base/node_modules/svelte" "$consumer_dir/node_modules/svelte"
cat > "$consumer_dir/DialogConsumer.svelte" <<'SVELTE'
<script>
  import { Dialog } from '@sveltery/base';
  import * as Parts from '@sveltery/base/dialog';
</script>
<Dialog.Root><Dialog.Trigger>First</Dialog.Trigger><Dialog.Title>First title</Dialog.Title><Dialog.Description>First description</Dialog.Description><Dialog.Portal><Dialog.Popup>Client portal</Dialog.Popup></Dialog.Portal></Dialog.Root>
<Parts.Root><Parts.Trigger>Second</Parts.Trigger><Parts.Title>Second title</Parts.Title></Parts.Root>
SVELTE
cat >> "$consumer_dir/check.mjs" <<'JS'
const { render } = await import('svelte/server');
const { default: Consumer } = await import('./DialogConsumer.svelte');
const output = render(Consumer);
assert.equal((output.body.match(/aria-haspopup="dialog"/g) ?? []).length, 2);
const ids = [...output.body.matchAll(/ id="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, 5);
assert.equal(new Set(ids).size, ids.length);
assert(ids.every(id => id.startsWith('base-ui-')));
assert(!output.body.includes('data-base-ui-portal'));
assert(!output.body.includes('role="dialog"'));
console.log('Isolated tarball Dialog SSR consumer / unique generated IDs: PASS');
JS
cat > "$consumer_dir/ToastConsumer.svelte" <<'SVELTE'
<script>
  import { Toast } from '@sveltery/base';
  import * as Parts from '@sveltery/base/toast';
</script>
<Toast.Provider><Toast.Viewport><Toast.Root toast={{ id: 'first', title: 'First', description: 'Details' }} swipeDirection={[]}><Toast.Content><Toast.Title/><Toast.Description/><Toast.Close>Close</Toast.Close></Toast.Content></Toast.Root></Toast.Viewport></Toast.Provider>
<Parts.Provider><Parts.Viewport><Parts.Root toast={{ id: 'second', title: 'Second' }} swipeDirection={[]}><Parts.Title/></Parts.Root></Parts.Viewport></Parts.Provider>
<Toast.Portal><span>Root portal child</span></Toast.Portal>
<Parts.Portal container={null}><span>Subpath portal child</span></Parts.Portal>
SVELTE
cat >> "$consumer_dir/check.mjs" <<'JS'
const { default: ToastConsumer } = await import('./ToastConsumer.svelte');
const toastOutput = render(ToastConsumer);
assert.equal((toastOutput.body.match(/role="region"/g) ?? []).length, 2);
assert.equal((toastOutput.body.match(/role="dialog"/g) ?? []).length, 2);
assert.equal((toastOutput.body.match(/aria-live="polite"/g) ?? []).length, 2);
const toastIds = [...toastOutput.body.matchAll(/ id="([^"]+)"/g)].map(match => match[1]);
assert.equal(toastIds.length, 3);
assert.equal(new Set(toastIds).size, 3);
assert(toastIds.every(id => id.startsWith('base-ui-')));
assert.equal(typeof Toast.getToastManager, 'function');
assert(!toastOutput.body.includes('data-base-ui-portal'));
assert(!toastOutput.body.includes('portal child'));
console.log('Isolated tarball Toast SSR consumer / both entries / unique label IDs: PASS');
JS
cat > "$consumer_dir/ButtonConsumer.svelte" <<'SVELTE'
<script>
  import { Button } from '@sveltery/base';
  import { Button as SubpathButton } from '@sveltery/base/button';
</script>
<Button>Action</Button><SubpathButton disabled focusableWhenDisabled type="submit">Submit</SubpathButton>
SVELTE
cat >> "$consumer_dir/check.mjs" <<'JS'
const { default: ButtonConsumer } = await import('./ButtonConsumer.svelte');
const buttons = render(ButtonConsumer).body;
assert.match(buttons, /type="button"/);
assert.match(buttons, /type="submit"/);
assert.match(buttons, /aria-disabled="true"/);
assert.match(buttons, /data-disabled/);
assert(!/<button[^>]* disabled/.test(buttons));
console.log('Isolated tarball Button root/subpath SSR consumer: PASS');
JS
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$consumer_dir/check.mjs"

cat > "$consumer_dir/SeparatorConsumer.svelte" <<'SVELTE'
<script>
  import { Separator, mergeProps } from '@sveltery/base';
  import { Separator as SubpathSeparator } from '@sveltery/base/separator';
</script>
<Separator /><SubpathSeparator orientation="vertical" role="presentation" aria-orientation="horizontal" />
<Separator class={['array-class', { 'object-class': true }, ['nested-class']]}>
  {#snippet render(props)}<div {...mergeProps(props, { class: 'replacement' })}></div>{/snippet}
</Separator>
SVELTE
cat > "$consumer_dir/separator-check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import { Separator } from '@sveltery/base';
import { Separator as SubpathSeparator } from '@sveltery/base/separator';
import Consumer from './SeparatorConsumer.svelte';
assert.equal(Separator, SubpathSeparator);
const html = render(Consumer).body;
assert.match(html, /role="separator"/);
assert.match(html, /role="presentation"/);
assert.match(html, /data-orientation="horizontal"/);
assert.match(html, /data-orientation="vertical"/);
assert.equal((html.match(/aria-orientation="horizontal"/g) ?? []).length, 3);
assert.match(html, /class="replacement array-class object-class nested-class"/);
console.log('Isolated tarball Separator root/subpath SSR consumer: PASS');
JS
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$consumer_dir/separator-check.mjs"

# Isolated public Toggle entry identity, SSR and component type consumer.
bash "$sveltery_repo_root/scripts/check-toggle-package.sh" --public

bash "$sveltery_repo_root/scripts/check-progress-package.sh" --public

# Isolated public Collapsible root/subpath, SSR and component type consumer.
bash "$sveltery_repo_root/scripts/check-collapsible-package.sh" --public
