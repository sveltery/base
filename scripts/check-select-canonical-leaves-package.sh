#!/usr/bin/env bash
# Private installed-file diagnostics; these helpers remain unsupported package subpaths.
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
export TMPDIR="${TMPDIR:-$PWD/.checks/select-canonical-leaves-tmp}"
mkdir -p "$TMPDIR" .checks/select-canonical-leaves
consumer_dir="$(mktemp -d "$TMPDIR/consumer.XXXXXX")"
trap 'rm -rf "$consumer_dir"' EXIT
sveltery_pack_package @sveltery/base "$consumer_dir" > /dev/null
cp "$SVELTERY_PACKAGE_ARTIFACTS" .checks/select-canonical-leaves/artifacts.json
node scripts/select-canonical-leaves/prepare-consumer.mjs "$consumer_dir"
sveltery_prepare_consumer "$consumer_dir"
pnpm --dir "$consumer_dir" install --ignore-scripts
pnpm --dir "$consumer_dir" install --frozen-lockfile --ignore-scripts
cmp LICENSE "$consumer_dir/node_modules/@sveltery/base/LICENSE"
test -f "$consumer_dir/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
node --import ./scripts/svelte-ssr-loader.mjs "$consumer_dir/check.mjs"
node packages/base/node_modules/svelte-check/bin/svelte-check --workspace "$consumer_dir" --tsconfig ./tsconfig.json
NODE_OPTIONS=--max-old-space-size=768 node packages/base/node_modules/vitest/vitest.mjs run --config "$consumer_dir/vitest.config.mjs" --project server --project dom
# Deliberately mandatory: an unavailable secured host is an incomplete gate.
NODE_OPTIONS=--max-old-space-size=768 node packages/base/node_modules/vitest/vitest.mjs run --config "$consumer_dir/vitest.config.mjs" --project browser
