#!/usr/bin/env bash
# Compile the real contract route as an isolated packed-package consumer.
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
remote_contract_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-remote-contracts.XXXXXX")"
trap 'rm -rf "$remote_contract_consumer"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$remote_contract_consumer" > /dev/null
node --input-type=module - "$remote_contract_consumer" <<'JS'
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find((name) => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: {
  '@sveltery/base': `file:${join(destination, tarball)}`, '@sveltejs/kit': '2.70.3', '@sveltejs/adapter-auto': '7.0.1',
  '@sveltejs/vite-plugin-svelte': '7.3.1', svelte: '5.57.1', vite: '8.3.1', typescript: '5.9.3', 'svelte-check': '4.7.6',
} }));
mkdirSync(join(destination, 'src/routes'), { recursive: true });
for (const file of ['+page.svelte', 'contracts.remote.ts']) copyFileSync(join('apps/fixtures/src/routes/remote-api-contracts', file), join(destination, 'src/routes', file));
copyFileSync('apps/fixtures/src/app.html', join(destination, 'src/app.html'));
copyFileSync('apps/fixtures/vite.config.ts', join(destination, 'vite.config.ts'));
writeFileSync(join(destination, 'tsconfig.json'), JSON.stringify({ extends: './.svelte-kit/tsconfig.json', compilerOptions: {
  strict: true, exactOptionalPropertyTypes: true, skipLibCheck: true, moduleResolution: 'Bundler',
} }));
JS
pnpm --dir "$remote_contract_consumer" --ignore-workspace install --ignore-scripts > /dev/null
# Apply the shipped Kit correction explicitly, exactly as a consumer application does.
mkdir -p "$remote_contract_consumer/patches"
cp "$remote_contract_consumer/node_modules/@sveltery/base/patches/@sveltejs__kit@2.70.3.patch" "$remote_contract_consumer/patches/"
cat > "$remote_contract_consumer/pnpm-workspace.yaml" <<'YAML'
patchedDependencies:
  '@sveltejs/kit@2.70.3': patches/@sveltejs__kit@2.70.3.patch
YAML
pnpm --dir "$remote_contract_consumer" install --no-frozen-lockfile --ignore-scripts > /dev/null
pnpm --dir "$remote_contract_consumer" install --frozen-lockfile --ignore-scripts > /dev/null
pnpm --dir "$remote_contract_consumer" exec svelte-kit sync
pnpm --dir "$remote_contract_consumer" exec svelte-check --tsconfig ./tsconfig.json
pnpm --dir "$remote_contract_consumer" exec vite build > /dev/null
echo 'Isolated packed public remote contracts: exact optional types, real Kit 2.70.3 patch setup and production build PASS'
