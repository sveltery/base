#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
direction_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-direction-consumer.XXXXXX")"
trap 'rm -rf "$direction_consumer"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$direction_consumer" > /dev/null
node --input-type=module - "$direction_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
pnpm --dir "$direction_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$direction_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
test -f "$direction_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cmp LICENSE "$direction_consumer/node_modules/@sveltery/base/LICENSE"
if [[ "${1:-}" == '--public' ]]; then
  cat > "$direction_consumer/imports.js" <<'JS'
export { DirectionProvider as First, useDirection as firstReader } from '@sveltery/base';
export { DirectionProvider as Second, useDirection as secondReader } from '@sveltery/base/direction-provider';
JS
  cat > "$direction_consumer/imports.d.ts" <<'TS'
export { DirectionProvider as First, useDirection as firstReader, type DirectionProviderProps, type TextDirection } from '@sveltery/base';
export { DirectionProvider as Second, useDirection as secondReader, type DirectionProviderProps as SubpathProps, type TextDirection as SubpathDirection } from '@sveltery/base/direction-provider';
TS
else
  cat > "$direction_consumer/imports.js" <<'JS'
export { DirectionProvider as First, DirectionProvider as Second, useDirection as firstReader, useDirection as secondReader } from './node_modules/@sveltery/base/dist/direction-provider/index.js';
JS
  cat > "$direction_consumer/imports.d.ts" <<'TS'
export { DirectionProvider as First, DirectionProvider as Second, useDirection as firstReader, useDirection as secondReader, type DirectionProviderProps, type DirectionProviderProps as SubpathProps, type TextDirection, type TextDirection as SubpathDirection } from './node_modules/@sveltery/base/dist/direction-provider/index.js';
TS
fi
cat > "$direction_consumer/Probe.svelte" <<'SVELTE'
<script lang="ts">
  import { firstReader, secondReader } from './imports.js';
  let { id }: { id: string } = $props();
  const first = firstReader(), second = secondReader();
  let matching = $derived(first() === second());
</script>
<span {id} data-matching={matching}>{first()}</span>
SVELTE
cat > "$direction_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { First, Second, type DirectionProviderProps } from './imports.js';
  import Probe from './Probe.svelte';
  const props: DirectionProviderProps = { direction: 'rtl' };
</script>
<Probe id="outside" />
<First {...props}><Probe id="outer" /><Second><Probe id="inner" /></Second></First>
SVELTE
cat > "$direction_consumer/types.ts" <<'TS'
import type { DirectionProviderProps, SubpathProps, TextDirection, SubpathDirection, firstReader } from './imports.js';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const equal: Equal<[DirectionProviderProps, TextDirection], [SubpathProps, SubpathDirection]> = true;
const callable: Equal<ReturnType<typeof firstReader>, () => TextDirection> = true;
const direction: Equal<DirectionProviderProps['direction'], TextDirection | undefined> = true;
// @ts-expect-error The pinned text direction union excludes vertical.
const invalid: DirectionProviderProps = { direction: 'vertical' };
// @ts-expect-error The provider has no native DOM host props.
const host: SubpathProps = { dir: 'rtl' };
void [equal, callable, direction, invalid, host];
TS
cat > "$direction_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import { First, Second, firstReader, secondReader } from './imports.js';
import Consumer from './Consumer.svelte';
assert.equal(First, Second); assert.equal(firstReader, secondReader);
const body = render(Consumer).body;
for (const [id, direction] of [['outside', 'ltr'], ['outer', 'rtl'], ['inner', 'ltr']]) assert.match(body, new RegExp(`<span id="${id}" data-matching="true">${direction}</span>`));
assert.equal((body.match(/<span /g) ?? []).length, 3);
assert.doesNotMatch(body, /<(?:div|section)| dir=/);
JS
cat > "$direction_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$direction_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$direction_consumer" --tsconfig ./tsconfig.json
if [[ "${1:-}" == '--public' ]]; then
  echo 'Isolated tarball DirectionProvider public root/subpath SSR and types: PASS'
else
  echo 'Isolated tarball DirectionProvider internal entry SSR and types: PASS (public mode is separate)'
fi
