#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
remote_api_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-remote-api.XXXXXX")"
trap 'rm -rf "$remote_api_consumer"' EXIT
sveltery_pack_package @sveltery/base "$remote_api_consumer" > /dev/null
node --input-type=module - "$remote_api_consumer" "${1:-2.70.3}" <<'JS'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2], kit = process.argv[3];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: {
  '@sveltery/base': `file:${join(destination, tarball)}`, '@sveltejs/kit': kit, svelte: '5.57.1', '@types/node': '24.10.1'
} }));
for (const [source, name] of [['apps/fixtures/src/lib/RemoteFormApiTypeFixture.svelte', 'Positive.svelte'], ['scripts/fixtures/remote-form-api/NativeHosts.svelte', 'NativeHosts.svelte'], ['scripts/fixtures/remote-form-api/Negative.svelte', 'Negative.svelte']]) {
  let text = readFileSync(source, 'utf8');
  if (kit.startsWith('3.')) text = text.replace("from '@sveltejs/kit'", "from '$app/server'").replace('<script lang="ts">', '<script lang="ts">\n  import type {} from \'@sveltejs/kit\';');
  writeFileSync(join(destination, name), text);
}
const compilerOptions = { target: 'ESNext', lib: ['ESNext', 'DOM', 'DOM.Iterable'], module: 'ESNext', moduleResolution: 'Bundler', strict: true, exactOptionalPropertyTypes: true, skipLibCheck: false, allowJs: true, types: ['svelte', 'node'] };
for (const kind of ['positive', 'negative']) writeFileSync(join(destination, `tsconfig.${kind}.json`), JSON.stringify({ compilerOptions, include: kind === 'positive' ? ['Positive.svelte', 'NativeHosts.svelte'] : ['Negative.svelte'] }));
JS
sveltery_prepare_consumer "$remote_api_consumer"
pnpm --dir "$remote_api_consumer" install --ignore-scripts > /dev/null
pnpm --dir "$remote_api_consumer" install --frozen-lockfile --ignore-scripts > /dev/null
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$remote_api_consumer" --tsconfig ./tsconfig.positive.json
if node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$remote_api_consumer" --tsconfig ./tsconfig.negative.json --output machine > "$remote_api_consumer/negative.log"; then
  echo 'Invalid Form remote namespace consumers unexpectedly compiled.' >&2
  exit 1
fi
node --input-type=module - "$remote_api_consumer" <<'JS'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const log = readFileSync(join(destination, 'negative.log'), 'utf8');
const errors = [...log.matchAll(/ ERROR "([^"]+)" (\d+):(\d+) /g)];
assert(errors.every(error => error[1].endsWith('Negative.svelte')), `Unexpected diagnostics:\n${log}`);
const lines = readFileSync(join(destination, 'Negative.svelte'), 'utf8').split('\n');
let count = 0;
for (let index = 0; index < lines.length; index++) if (lines[index].includes('<!-- reject:')) {
  count++;
  assert(errors.some(error => Number(error[2]) === index + 2), `Missing error for ${lines[index]}:\n${log}`);
}
assert.equal(count, 7);
console.log(`All ${count} invalid actual Form namespace consumers rejected; ${errors.length} diagnostics.`);
JS
printf 'Installed actual Remote Form API with Kit %s: PASS\n' "${1:-2.70.3}"
