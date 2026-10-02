#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
render_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-use-render-consumer.XXXXXX")"
trap 'rm -rf "$render_consumer"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$render_consumer" > /dev/null
node --input-type=module - "$render_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const directory = process.argv[2];
const tarball = readdirSync(directory).find(name => name.endsWith('.tgz'));
writeFileSync(join(directory, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(directory, tarball)}`, svelte: '5.57.1' } }));
JS
pnpm --dir "$render_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$render_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
test -f "$render_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cmp LICENSE "$render_consumer/node_modules/@sveltery/base/LICENSE"
if [[ "${1:-}" == '--public' ]]; then
  cat > "$render_consumer/imports.js" <<'JS'
export { UseRender as First } from '@sveltery/base';
export { UseRender as Second } from '@sveltery/base/use-render';
JS
  cat > "$render_consumer/imports.d.ts" <<'TS'
export { UseRender as First, type UseRenderProps, type UseRenderRef, type UseRenderRefs, type UseRenderRenderProp, type UseRenderHostProps, type UseRenderTagName, type UseRenderStateAttributesMapping, type UseRenderElementProps, type UseRenderComponentProps } from '@sveltery/base';
export { UseRender as Second } from '@sveltery/base/use-render';
TS
else
  cat > "$render_consumer/imports.js" <<'JS'
export { UseRender as First, UseRender as Second } from './node_modules/@sveltery/base/dist/use-render/index.js';
JS
  cat > "$render_consumer/imports.d.ts" <<'TS'
export { UseRender as First, UseRender as Second, type UseRenderProps, type UseRenderRef, type UseRenderRefs, type UseRenderRenderProp, type UseRenderHostProps, type UseRenderTagName, type UseRenderStateAttributesMapping, type UseRenderElementProps, type UseRenderComponentProps } from './node_modules/@sveltery/base/dist/use-render/index.js';
TS
fi
cat > "$render_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { First, Second, type UseRenderProps, type UseRenderRef, type UseRenderStateAttributesMapping, type UseRenderElementProps, type UseRenderComponentProps, type UseRenderHostProps } from './imports.js';
  import { mergeProps } from '@sveltery/base/merge-props';
  let element = $state<SVGSVGElement | null>();
  const sourceState = { active: true, itemCount: 5 };
  const mapping: UseRenderStateAttributesMapping<typeof sourceState> = { itemCount: value => ({ 'data-item-count': String(value) }) };
  const refs: UseRenderRef<SVGSVGElement>[] = [{ current: null }, (_host) => () => {}];
  const native: UseRenderElementProps<'button'> = { type: 'button', onclick: event => event.preventBaseUIHandler() };
  const component: UseRenderComponentProps<'button', typeof sourceState> = native;
  const config: UseRenderProps<typeof sourceState, SVGSVGElement> = { state: sourceState, stateAttributesMapping: mapping, ref: refs, defaultTagName: 'svg' };
  void component;
  // @ts-expect-error Public props accepts an ordinary object, not private ordered sources.
  const privateSources: UseRenderProps = { props: [{}] };
  // @ts-expect-error No invented public renderProps parameter.
  const invented: UseRenderProps = { renderProps: {} };
  // @ts-expect-error State mapping callbacks receive the corresponding property's type.
  const badMap: UseRenderStateAttributesMapping<typeof sourceState> = { active: (value: number) => ({ 'data-active': String(value) }) };
  // @ts-expect-error React hook return-value types are intentionally not exported.
  import type { UseRenderReturnValue } from './imports.js';
  void [privateSources, invented, badMap];
</script>
<First defaultTagName="button" state={{ active: true }} props={{ id: 'packed-button' }}>Packed children</First>
<Second {...config} bind:element><title>Packed SVG</title></Second>
<First defaultTagName="img" props={{ id: 'packed-image' }}/>
<First props={{ id: 'packed-empty-class', class: '' }}/>
<Second enabled={false} props={{ id: 'disabled' }}/>
<First state={{ active: true }} props={{ class: 'base', id: 'replacement' }}>
  {#snippet render(supplied: UseRenderHostProps, currentState, children)}
    <span {...mergeProps(supplied, { class: 'owned' })} data-state={String(currentState.active)}>{@render children?.()}</span>
  {/snippet}
</First>
SVELTE
cat > "$render_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import Consumer from './Consumer.svelte';
import { First, Second } from './imports.js';
assert.equal(First, Second);
const body = render(Consumer).body;
assert.match(body, /type="button"/); assert.match(body, /Packed children/);
assert.match(body, /data-item-count="5"/); assert.match(body, /<svg/); assert.match(body, /Packed SVG/);
assert.match(body, /alt=""/); assert.doesNotMatch(body, /id="disabled"/);
assert.match(body, /id="packed-empty-class" class=""/);
assert.match(body, /class="owned base"/); assert.match(body, /data-state="true"/);
JS
cat > "$render_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$render_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$render_consumer" --tsconfig ./tsconfig.json
if [[ "${1:-}" == '--public' ]]; then
  echo 'Isolated tarball UseRender public root/subpath SSR and types: PASS'
else
  echo 'Isolated tarball UseRender internal entry SSR and types: PASS (public integration is a separate gate)'
fi
