#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
toggle_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-toggle-consumer.XXXXXX")"
trap 'rm -rf "$toggle_consumer"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$toggle_consumer" > /dev/null
mkdir -p "$toggle_consumer/node_modules/@sveltery/base"
tar -xzf "$toggle_consumer"/*.tgz --strip-components=1 -C "$toggle_consumer/node_modules/@sveltery/base"
# Install the packed runtime dependency closure and its Svelte peer in isolation.
node --input-type=module - "$toggle_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
rm -rf "$toggle_consumer/node_modules"
pnpm --dir "$toggle_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$toggle_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
test -f "$toggle_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cmp LICENSE "$toggle_consumer/node_modules/@sveltery/base/LICENSE"
if [[ "${1:-}" == '--public' ]]; then
  cat > "$toggle_consumer/imports.js" <<'JS'
export { Toggle as First } from '@sveltery/base';
export { Toggle as Second } from '@sveltery/base/toggle';
JS
  cat > "$toggle_consumer/imports.d.ts" <<'TS'
export { Toggle as First, type ToggleProps } from '@sveltery/base';
export { Toggle as Second } from '@sveltery/base/toggle';
TS
else
  cat > "$toggle_consumer/imports.js" <<'JS'
export { Toggle as First, Toggle as Second } from './node_modules/@sveltery/base/dist/toggle/index.js';
JS
  cat > "$toggle_consumer/imports.d.ts" <<'TS'
export { Toggle as First, Toggle as Second, type ToggleProps } from './node_modules/@sveltery/base/dist/toggle/index.js';
TS
fi
cat > "$toggle_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { First, Second, type ToggleProps } from './imports.js';
  const props: ToggleProps = { defaultPressed: true, form: 'stripped', type: 'submit', value: 'stripped', onPressedChange: (_pressed, details) => details.cancel() };
</script>
<First {...props}/><Second pressed={false} defaultPressed disabled/>
SVELTE
cat > "$toggle_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import Consumer from './Consumer.svelte';
import { First, Second } from './imports.js';
assert.equal(First, Second);
const body = render(Consumer).body;
assert.equal((body.match(/<button/g) ?? []).length, 2);
assert.equal((body.match(/type="button"/g) ?? []).length, 2);
assert.equal((body.match(/data-pressed/g) ?? []).length, 1);
assert.match(body, /aria-pressed="true"/); assert.match(body, /aria-pressed="false"/);
assert.match(body, /data-disabled/); assert(!body.includes('form=')); assert(!body.includes('value='));
JS
cat > "$toggle_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$toggle_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$toggle_consumer" --tsconfig ./tsconfig.json
if [[ "${1:-}" == '--public' ]]; then
  echo 'Isolated tarball Toggle public root/subpath SSR and types: PASS'
else
  echo 'Isolated tarball Toggle internal entry SSR and types: PASS (internal mode; public root/subpath mode is separate)'
fi
