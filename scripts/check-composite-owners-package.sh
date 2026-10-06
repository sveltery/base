#!/usr/bin/env bash
# Supplemental native evidence: no unchanged upstream assertion credit.
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
composite_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-composite-consumer.XXXXXX")"
trap 'rm -rf "$composite_consumer"' EXIT
sveltery_pack_package @sveltery/base "$composite_consumer" > /dev/null
node --input-type=module - "$composite_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const directory = process.argv[2];
const tarball = readdirSync(directory).find(name => name.endsWith('.tgz'));
if (!tarball) throw new Error('Fresh Base tarball is missing');
writeFileSync(join(directory, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(directory, tarball)}`, svelte: '5.57.1' } }));
JS
sveltery_prepare_consumer "$composite_consumer"
pnpm --dir "$composite_consumer" install --ignore-scripts > /dev/null
pnpm --dir "$composite_consumer" install --frozen-lockfile --ignore-scripts > /dev/null
cmp LICENSE "$composite_consumer/node_modules/@sveltery/base/LICENSE"
cmp packages/base/THIRD_PARTY_NOTICES.md "$composite_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cmp packages/utils/THIRD_PARTY_NOTICES.md "$composite_consumer/node_modules/@sveltery/utils/THIRD_PARTY_NOTICES.md"
cp scripts/fixtures/composite-owners/* "$composite_consumer/"
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$composite_consumer/ssr-check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$composite_consumer" --tsconfig ./tsconfig.json
node --conditions=browser --import "$composite_consumer/client-loader.mjs" "$composite_consumer/hydration-check.mjs" "$sveltery_repo_root/packages/base/package.json"
echo 'Packed public Composite callers: strict declarations, SSR and same-host hydration/lifetime supplements: PASS'
