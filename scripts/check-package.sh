#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
consumer_dir="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-consumer.XXXXXX")"
trap 'rm -rf "$consumer_dir"' EXIT
sveltery_pack_package @sveltery/base "$consumer_dir"
# Retain and validate every native workspace dependency artifact, without another pack.
node scripts/package-artifacts.mjs retain "$SVELTERY_PACKAGE_ARTIFACTS" .checks/npm-package
export SVELTERY_PACKAGE_ARTIFACTS="$sveltery_repo_root/.checks/npm-package/artifacts.json"
node scripts/package-artifacts.mjs entries "$SVELTERY_PACKAGE_ARTIFACTS" > "$consumer_dir/artifacts.tsv"
while IFS=$'\t' read -r package_name package_directory tarball; do
  extracted="$consumer_dir/node_modules/$package_name"
  mkdir -p "$extracted"
  tar -xzf ".checks/npm-package/$tarball" --strip-components=1 -C "$extracted"
  node scripts/check-package-artifact.mjs "$extracted" "$sveltery_repo_root/$package_directory" "$SVELTERY_PACKAGE_ARTIFACTS"
  pnpm exec publint ".checks/npm-package/$tarball" --strict
  node scripts/check-package-types.mjs ".checks/npm-package/$tarball" ".checks/npm-package/${tarball%.tgz}.attw.json" "$sveltery_repo_root/$package_directory"
done < "$consumer_dir/artifacts.tsv"
if [[ -f packages/utils/package.json ]]; then
  bash scripts/check-utils-package.sh
fi
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
# Install the packed runtime dependency closure and its Svelte peer in isolation.
node --input-type=module - "$consumer_dir" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
rm -rf "$consumer_dir/node_modules"
sveltery_prepare_consumer "$consumer_dir"
pnpm --dir "$consumer_dir" install --ignore-scripts > /dev/null
pnpm --dir "$consumer_dir" install --frozen-lockfile --ignore-scripts > /dev/null
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

cat > "$consumer_dir/InputConsumer.svelte" <<'SVELTE'
<script>
  import { Input, mergeProps } from '@sveltery/base';
  import { Input as SubpathInput } from '@sveltery/base/input';
</script>
<Input defaultValue="seed" /><SubpathInput value="owner" disabled />
<Input class={['array-class', { 'object-class': true }, ['nested-class']]}>
  {#snippet render(props)}<input {...mergeProps(props, { class: 'replacement' })} />{/snippet}
</Input>
SVELTE
cat > "$consumer_dir/input-check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import { Input } from '@sveltery/base';
import { Input as SubpathInput } from '@sveltery/base/input';
import Consumer from './InputConsumer.svelte';
assert.equal(Input, SubpathInput);
const html = render(Consumer).body;
assert.equal((html.match(/<input/g) ?? []).length, 3);
assert.match(html, /value="seed"/);
assert.match(html, /value="owner"/);
assert.match(html, /data-disabled/);
assert.doesNotMatch(html, /data-(?:invalid|valid|touched|dirty|filled|focused)/);
const ids = [...html.matchAll(/ id="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, 3);
assert.equal(new Set(ids).size, 3);
assert.match(html, /class="replacement array-class object-class nested-class"/);
assert(ids.every(id => id.startsWith('base-ui-')));
console.log('Isolated tarball Input root/subpath SSR consumer: PASS');
JS
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$consumer_dir/input-check.mjs"

bash "$sveltery_repo_root/scripts/check-progress-package.sh" --public

# Isolated public Collapsible root/subpath, SSR and component type consumer.
bash "$sveltery_repo_root/scripts/check-collapsible-package.sh" --public

bash "$sveltery_repo_root/scripts/check-meter-package.sh" --public

# Isolated public Avatar root/subpath, both SSR loading modes and seven type exports.
bash "$sveltery_repo_root/scripts/check-avatar-package.sh" --public

# Genuine installed public Accordion root/subpath SSR and type consumer.
bash "$sveltery_repo_root/scripts/check-accordion-package.sh" --public

# Isolated public DirectionProvider root/subpath, callable reader, SSR and namespace types.
bash "$sveltery_repo_root/scripts/check-direction-provider-package.sh" --public

# Shared CSP provider foundation: actual public root/subpath consumer, not a private-entry stand-in.
bash scripts/check-csp-provider-package.sh

# Installed real native snippet hosts, strict public types, SSR, DOM and retired API exclusions.
bash "$sveltery_repo_root/scripts/check-native-snippets-package.sh"

# Installed public Dialog nine parts, payload handles, SSR, native DOM and strict types.
bash scripts/check-dialog-handles-package.sh
# Installed public source Field/Form/Fieldset anatomy, SSR and 31 named types.
bash "$sveltery_repo_root/scripts/check-field-form-package.sh" --public

# Actual installed public Radio/RadioGroup source composition and typed consumer.
bash "$sveltery_repo_root/scripts/check-radio-package.sh"
# Real source checked families: public subpaths/types and SSR without browser globals.
bash "$sveltery_repo_root/scripts/check-boolean-controls-package.sh"

# Installed public schema-derived remote form types, including recursive/exact optional contracts.
bash "$sveltery_repo_root/scripts/check-remote-form-types.sh" --public

# Actual strict installed Menu/ContextMenu/Menubar anatomy, generics, native SSR and types.
bash "$sveltery_repo_root/scripts/check-menu-family-package.sh"

# Installed public Slider all-part/type, SSR, native DOM and strict invalid consumer.
bash "$sveltery_repo_root/scripts/check-slider-package.sh"
