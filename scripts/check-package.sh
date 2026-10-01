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
import { createChangeEventDetails } from '@sveltery/base';
import { mergeProps } from '@sveltery/base/merge-props';
assert.equal(mergeProps({ id: 'before' }, { id: 'after' }).id, 'after');
const details = createChangeEventDetails('none');
details.cancel();
assert.equal(details.isCanceled, true);
const metadata = JSON.parse(await readFile(new URL('./node_modules/@sveltery/base/package.json', import.meta.url), 'utf8'));
assert.equal(metadata.license, 'MIT');
console.log('Isolated tarball consumer: PASS');
JS
node "$consumer_dir/check.mjs"
