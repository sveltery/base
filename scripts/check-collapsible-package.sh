#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
collapsible_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-collapsible-consumer.XXXXXX")"
trap 'rm -rf "$collapsible_consumer"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$collapsible_consumer" > /dev/null
mkdir -p "$collapsible_consumer/node_modules/@sveltery/base"
tar -xzf "$collapsible_consumer"/*.tgz --strip-components=1 -C "$collapsible_consumer/node_modules/@sveltery/base"
ln -s "$sveltery_repo_root/packages/base/node_modules/svelte" "$collapsible_consumer/node_modules/svelte"
ln -s "$sveltery_repo_root/packages/base/node_modules/esm-env" "$collapsible_consumer/node_modules/esm-env"
test -f "$collapsible_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cmp LICENSE "$collapsible_consumer/node_modules/@sveltery/base/LICENSE"
if [[ "${1:-}" == '--public' ]]; then
  cat > "$collapsible_consumer/imports.js" <<'JS'
export { Collapsible as First } from '@sveltery/base';
export { Collapsible as Second } from '@sveltery/base/collapsible';
JS
  cat > "$collapsible_consumer/imports.d.ts" <<'TS'
export { Collapsible as First, type CollapsibleRootProps, type CollapsibleTriggerProps, type CollapsiblePanelProps } from '@sveltery/base';
export { Collapsible as Second } from '@sveltery/base/collapsible';
TS
else
  cat > "$collapsible_consumer/imports.js" <<'JS'
export { Collapsible as First, Collapsible as Second } from './node_modules/@sveltery/base/dist/collapsible/index.js';
JS
  cat > "$collapsible_consumer/imports.d.ts" <<'TS'
export { Collapsible as First, Collapsible as Second, type CollapsibleRootProps, type CollapsibleTriggerProps, type CollapsiblePanelProps } from './node_modules/@sveltery/base/dist/collapsible/index.js';
TS
fi
cat > "$collapsible_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { First, Second, type CollapsibleRootProps, type CollapsibleTriggerProps, type CollapsiblePanelProps } from './imports.js';
  const root: CollapsibleRootProps = { defaultOpen: true, onOpenChange: (_open, details) => details.cancel() };
  const trigger: CollapsibleTriggerProps = { type: 'submit', form: 'external', name: 'collapsible', value: 'sent' };
  const panel: CollapsiblePanelProps = { keepMounted: true };
</script>
<First.Root {...root}><First.Trigger {...trigger}>First</First.Trigger><First.Panel {...panel}>Open content</First.Panel></First.Root>
<Second.Root disabled><Second.Trigger disabled={false}>Second</Second.Trigger><Second.Panel hiddenUntilFound keepMounted={false}>Find content</Second.Panel></Second.Root>
SVELTE
cat > "$collapsible_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import Consumer from './Consumer.svelte';
import { First, Second } from './imports.js';
assert.equal(First, Second);
const body = render(Consumer).body;
assert.equal((body.match(/<button/g) ?? []).length, 2);
assert.match(body, /type="submit"/); assert.match(body, /form="external"/); assert.match(body, /value="sent"/);
assert.match(body, /aria-expanded="true"/); assert.match(body, /aria-expanded="false"/);
assert.match(body, /animation-name:none/); assert.match(body, /--collapsible-panel-height:auto/);
const ids = [...body.matchAll(/ id="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, 2); assert.equal(new Set(ids).size, 2); assert(ids.every(id => id.startsWith('base-ui-')));
assert(body.includes('Open content')); assert(body.includes('Find content'));
JS
cat > "$collapsible_consumer/package.json" <<'JSON'
{"private":true,"type":"module"}
JSON
cat > "$collapsible_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$collapsible_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$collapsible_consumer" --tsconfig ./tsconfig.json
if [[ "${1:-}" == '--public' ]]; then
  echo 'Isolated tarball Collapsible public root/subpath SSR and types: PASS'
else
  echo 'Isolated tarball Collapsible internal entry SSR and types: PASS (public entries await serialized integration)'
fi
