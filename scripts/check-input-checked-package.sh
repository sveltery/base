#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
input_checked_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-input-checked-consumer.XXXXXX")"
trap 'rm -rf "$input_checked_consumer"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$input_checked_consumer" > /dev/null
node --input-type=module - "$input_checked_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
pnpm --dir "$input_checked_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$input_checked_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
test -f "$input_checked_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cmp LICENSE "$input_checked_consumer/node_modules/@sveltery/base/LICENSE"
node --input-type=module - "$input_checked_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md" "$sveltery_repo_root/parity/input/checked/REACT_LICENSE" <<'JS'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
assert(readFileSync(process.argv[2], 'utf8').includes(readFileSync(process.argv[3], 'utf8').trim()));
JS
cat > "$input_checked_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { Input, type InputProps, type InputChangeEventDetails } from '@sveltery/base';
  import { Input as SubpathInput, type InputProps as SubpathInputProps } from '@sveltery/base/input';
  const checkbox: InputProps = { type: 'checkbox', checked: true, defaultChecked: false, value: 'token', onValueChange(value: string, details: InputChangeEventDetails) { details.cancel(); void value; } };
  const radio: SubpathInputProps = { type: 'radio', checked: false, defaultChecked: true, name: 'choice', oninput(event) { const input: HTMLInputElement = event.currentTarget; event.preventBaseUIHandler(); void input; } };
  // @ts-expect-error The public checked property remains boolean, nullable or omitted.
  const invalid: InputProps = { checked: 'true' };
  void invalid;
</script>
<Input {...checkbox} /><SubpathInput {...radio} /><SubpathInput type="checkbox" defaultChecked />
SVELTE
cat > "$input_checked_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import { Input } from '@sveltery/base';
import { Input as SubpathInput } from '@sveltery/base/input';
import Consumer from './Consumer.svelte';
assert.equal(Input, SubpathInput);
const body = render(Consumer).body;
assert.equal((body.match(/<input/g) ?? []).length, 3);
assert.equal((body.match(/\schecked(?:\s|>|=)/g) ?? []).length, 2);
assert.match(body, /value="token"/);
const ids = [...body.matchAll(/ id="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, 3); assert.equal(new Set(ids).size, 3);
JS
cat > "$input_checked_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$input_checked_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$input_checked_consumer" --tsconfig ./tsconfig.json
echo 'Isolated tarball Input checked public root/subpath SSR and types: PASS'
