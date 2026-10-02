#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
avatar_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-avatar-consumer.XXXXXX")"
trap 'rm -rf "$avatar_consumer"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$avatar_consumer" > /dev/null
node --input-type=module - "$avatar_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
pnpm --dir "$avatar_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$avatar_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
test -f "$avatar_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cmp LICENSE "$avatar_consumer/node_modules/@sveltery/base/LICENSE"
if [[ "${1:-}" == '--public' ]]; then
  cat > "$avatar_consumer/imports.js" <<'JS'
export { Avatar as First } from '@sveltery/base';
export { Avatar as Second } from '@sveltery/base/avatar';
JS
  cat > "$avatar_consumer/imports.d.ts" <<'TS'
export { Avatar as First, type AvatarRootProps, type AvatarImageProps, type AvatarFallbackProps } from '@sveltery/base';
export { Avatar as Second } from '@sveltery/base/avatar';
TS
  cat > "$avatar_consumer/PublicTypes.ts" <<'TS'
import type * as Root from '@sveltery/base';
import type * as Parts from '@sveltery/base/avatar';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
function exact<T extends true>(_value?: T) {}
exact<Equal<Root.AvatarRootProps, Parts.AvatarRootProps>>();
exact<Equal<Root.AvatarRootState, Parts.AvatarRootState>>();
exact<Equal<Root.AvatarImageProps, Parts.AvatarImageProps>>();
exact<Equal<Root.AvatarImageState, Parts.AvatarImageState>>();
exact<Equal<Root.AvatarFallbackProps, Parts.AvatarFallbackProps>>();
exact<Equal<Root.AvatarFallbackState, Parts.AvatarFallbackState>>();
exact<Equal<Root.ImageLoadingStatus, Parts.ImageLoadingStatus>>();
TS
else
  cat > "$avatar_consumer/imports.js" <<'JS'
export { Avatar as First, Avatar as Second } from './node_modules/@sveltery/base/dist/avatar/index.js';
JS
  cat > "$avatar_consumer/imports.d.ts" <<'TS'
export { Avatar as First, Avatar as Second, type AvatarRootProps, type AvatarImageProps, type AvatarFallbackProps } from './node_modules/@sveltery/base/dist/avatar/index.js';
TS
fi
cat > "$avatar_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { First, Second, type AvatarRootProps, type AvatarImageProps, type AvatarFallbackProps } from './imports.js';
  const root: AvatarRootProps = { title: 'Avatar', class: state => state.imageLoadingStatus };
  const image: AvatarImageProps = { keepMounted: true, loading: 'lazy', src: '/avatar.png', srcset: '/avatar.png 1x', sizes: '48px', crossorigin: 'anonymous', referrerpolicy: 'no-referrer', onLoadingStatusChange: _status => {} };
  const fallback: AvatarFallbackProps = { delay: 0 };
</script>
<First.Root {...root}><First.Image {...image} /><First.Fallback {...fallback}>JD</First.Fallback></First.Root>
<Second.Root><Second.Image src="/detached.png" /><Second.Fallback>AC</Second.Fallback></Second.Root>
SVELTE
cat > "$avatar_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import Consumer from './Consumer.svelte';
import { First, Second } from './imports.js';
assert.equal(First, Second);
assert.deepEqual(Object.keys(First).sort(), ['Fallback', 'Image', 'Root']);
const body = render(Consumer).body;
assert.equal((body.match(/<img/g) ?? []).length, 1);
assert.match(body, /src="\/avatar.png"/); assert.match(body, /srcset="\/avatar.png 1x"/);
assert.match(body, /alt=""/); assert.match(body, /aria-hidden="true"/);
assert.match(body, /loading="lazy"/); assert.match(body, /sizes="48px"/);
assert.match(body, /crossorigin="anonymous"/); assert.match(body, /referrerpolicy="no-referrer"/);
assert.match(body, /class="idle"/); assert(body.includes('JD')); assert(body.includes('AC'));
assert(!body.includes('src="/detached.png"'));
JS
cat > "$avatar_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$avatar_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$avatar_consumer" --tsconfig ./tsconfig.json
if [[ "${1:-}" == '--public' ]]; then
  echo 'Isolated tarball Avatar public root/subpath SSR and all seven type exports: PASS'
else
  echo 'Isolated tarball Avatar internal entry SSR and types: PASS (public entries await serialized integration)'
fi
