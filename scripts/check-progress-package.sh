#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
progress_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-progress-consumer.XXXXXX")"
trap 'rm -rf "$progress_consumer"' EXIT
sveltery_pack_package @sveltery/base "$progress_consumer" > /dev/null
mkdir -p "$progress_consumer/node_modules/@sveltery/base"
tar -xzf "$progress_consumer"/*.tgz --strip-components=1 -C "$progress_consumer/node_modules/@sveltery/base"
# Install the packed runtime dependency closure and its Svelte peer in isolation.
node --input-type=module - "$progress_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
rm -rf "$progress_consumer/node_modules"
sveltery_prepare_consumer "$progress_consumer"
pnpm --dir "$progress_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$progress_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
test -f "$progress_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cmp LICENSE "$progress_consumer/node_modules/@sveltery/base/LICENSE"
if [[ "${1:-}" == '--public' ]]; then
  cat > "$progress_consumer/imports.js" <<'JS'
export { Progress as First } from '@sveltery/base';
export { Progress as Second } from '@sveltery/base/progress';
JS
  cat > "$progress_consumer/imports.d.ts" <<'TS'
export { Progress as First, type ProgressRootProps, type ProgressStatus } from '@sveltery/base';
export { Progress as Second, type Status } from '@sveltery/base/progress';
TS
else
  cat > "$progress_consumer/imports.js" <<'JS'
export { Progress as First, Progress as Second } from './node_modules/@sveltery/base/dist/progress/index.js';
JS
  cat > "$progress_consumer/imports.d.ts" <<'TS'
export { Progress as First, Progress as Second, type ProgressRootProps, type ProgressStatus, type Status } from './node_modules/@sveltery/base/dist/progress/index.js';
TS
fi
cat > "$progress_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { First, Second, type ProgressRootProps, type ProgressStatus, type Status } from './imports.js';
  const props: ProgressRootProps = { value: 30, min: 20, max: 40 };
  const status: ProgressStatus = 'indeterminate';
  const namespaceStatus: First.Status = status;
  const subpathStatus: Status = namespaceStatus;
</script>
<First.Root {...props}><First.Label>Upload</First.Label><First.Value/><First.Track><First.Indicator/></First.Track></First.Root>
<Second.Root value={null} data-status={subpathStatus}><Second.Value/></Second.Root>
SVELTE
cat > "$progress_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import Consumer from './Consumer.svelte';
import { First, Second } from './imports.js';
assert.equal(First, Second);
for (const part of ['Root', 'Label', 'Track', 'Indicator', 'Value']) assert.equal(First[part], Second[part]);
const body = render(Consumer).body;
assert.equal((body.match(/role="progressbar"/g) ?? []).length, 2);
assert.equal((body.match(/>x<\/span>/g) ?? []).length, 2);
assert.match(body, /aria-valuenow="30"/); assert.match(body, /aria-valuetext="50%"/);
assert.match(body, /width:50%/); assert.match(body, /data-indeterminate/);
assert(!body.includes('aria-labelledby')); assert(!body.includes('name='));
JS
cat > "$progress_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$progress_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$progress_consumer" --tsconfig ./tsconfig.json
if [[ "${1:-}" == '--public' ]]; then
  echo 'Isolated tarball Progress public root/subpath SSR and types: PASS'
else
  echo 'Isolated tarball Progress internal entry SSR and types: PASS (internal mode; public root/subpath mode is separate)'
fi
