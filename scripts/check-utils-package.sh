#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
consumer_dir="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-utils-consumer.XXXXXX")"
trap 'rm -rf "$consumer_dir"' EXIT
sveltery_pack_package @sveltery/utils "$consumer_dir"
node --input-type=module - "$consumer_dir" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const archive = readdirSync(destination).find((name) => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/utils': `file:${join(destination, archive)}`, svelte: '5.57.1' } }));
JS
sveltery_prepare_consumer "$consumer_dir"
pnpm --dir "$consumer_dir" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$consumer_dir" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
report="$consumer_dir/utils-entry-classification.json"
node scripts/check-utils-package.mjs classify "$consumer_dir" "$report"
node scripts/check-utils-package.mjs raw "$consumer_dir" "$report"
node scripts/check-utils-package.mjs compiled "$consumer_dir" "$report"
mkdir -p .checks/npm-package
cp "$report" .checks/npm-package/utils-entry-classification.json
