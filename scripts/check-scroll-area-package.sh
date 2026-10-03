#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export TMPDIR="${TMPDIR:-/workspace/sveltery-tmp}"
export NODE_COMPILE_CACHE="${NODE_COMPILE_CACHE:-/workspace/sveltery-node-compile-cache}"
source scripts/toolchain.sh
scroll_consumer="$(mktemp -d "${TMPDIR}/sveltery-scroll-area-consumer.XXXXXX")"
mkdir -p .checks/scroll-area
pnpm --filter @sveltery/base pack --pack-destination "$scroll_consumer" > /dev/null
node --input-type=module - "$scroll_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const directory=process.argv[2];const tarball=readdirSync(directory).find(name=>name.endsWith('.tgz'));
writeFileSync(join(directory,'package.json'),JSON.stringify({private:true,type:'module',dependencies:{'@sveltery/base':`file:${join(directory,tarball)}`,svelte:'5.57.1',jsdom:'30.1.1'}}));
JS
pnpm --dir "$scroll_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$scroll_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
cmp LICENSE "$scroll_consumer/node_modules/@sveltery/base/LICENSE"
cat > "$scroll_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { ScrollArea, ScrollAreaRoot, DirectionProvider, CSPProvider } from '@sveltery/base';
  import { ScrollArea as Sub } from '@sveltery/base/scroll-area';
  import type { HTMLAttributes } from 'svelte/elements';
  let viewport = $state<HTMLElement | null>(null);
</script>
<DirectionProvider direction="rtl"><CSPProvider nonce="public-nonce">
  <ScrollArea.Root overflowEdgeThreshold={{ xStart: 20 }} class={state=>state.hasOverflowX ? ['overflow'] : undefined} style={state=>state.scrolling ? { opacity: 0.5 } : undefined}>
    <ScrollArea.Viewport bind:ref={viewport} onscroll={event=>{ const e: Event = event; event.preventBaseUIHandler(); void e; }}><ScrollArea.Content>public content</ScrollArea.Content></ScrollArea.Viewport>
    <Sub.Scrollbar orientation="horizontal" keepMounted><Sub.Thumb /></Sub.Scrollbar><Sub.Corner />
  </ScrollArea.Root>
  <ScrollAreaRoot overflowEdgeThreshold={undefined} ref={undefined} class={undefined} style={undefined} render={undefined}>
    <Sub.Viewport><Sub.Content /></Sub.Viewport><Sub.Scrollbar keepMounted={undefined} orientation={undefined}><Sub.Thumb /></Sub.Scrollbar>
  </ScrollAreaRoot>
  <Sub.Root>
    {#snippet render(props, _state, children)}<section {...props as HTMLAttributes<HTMLElement>}>{@render children?.()}</section>{/snippet}
    <Sub.Viewport><Sub.Content /></Sub.Viewport>
  </Sub.Root>
</CSPProvider></DirectionProvider>
SVELTE
cat > "$scroll_consumer/PublicTypes.ts" <<'TS'
import { ScrollArea, ScrollAreaRoot, ScrollAreaViewport, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaCorner } from '@sveltery/base';
import type * as Root from '@sveltery/base';
import type * as Sub from '@sveltery/base/scroll-area';
import type { ComponentProps } from 'svelte';
type Exact<A,B> = (<T>()=>T extends A ? 1 : 2) extends (<T>()=>T extends B ? 1 : 2) ? true : false;
function exact<T extends true>(_value:T) {}
exact<Exact<Root.ScrollAreaRootProps,Sub.ScrollAreaRootProps>>(true);
exact<Exact<Root.ScrollAreaRootState,Sub.ScrollAreaRootState>>(true);
exact<Exact<Root.ScrollAreaViewportProps,Sub.ScrollAreaViewportProps>>(true);
exact<Exact<Root.ScrollAreaViewportState,Sub.ScrollAreaViewportState>>(true);
exact<Exact<Root.ScrollAreaContentProps,Sub.ScrollAreaContentProps>>(true);
exact<Exact<Root.ScrollAreaContentState,Sub.ScrollAreaContentState>>(true);
exact<Exact<Root.ScrollAreaScrollbarProps,Sub.ScrollAreaScrollbarProps>>(true);
exact<Exact<Root.ScrollAreaScrollbarState,Sub.ScrollAreaScrollbarState>>(true);
exact<Exact<Root.ScrollAreaThumbProps,Sub.ScrollAreaThumbProps>>(true);
exact<Exact<Root.ScrollAreaThumbState,Sub.ScrollAreaThumbState>>(true);
exact<Exact<Root.ScrollAreaCornerProps,Sub.ScrollAreaCornerProps>>(true);
exact<Exact<Root.ScrollAreaCornerState,Sub.ScrollAreaCornerState>>(true);
const root:ComponentProps<typeof ScrollArea.Root>={overflowEdgeThreshold:{xEnd:5,yStart:undefined},class:s=>s.scrolling?'active':undefined,ref:null};
// Partial source threshold uses numbers, including exactOptional: explicit undefined per nested field is not allowed.
void root;
const aliases:[typeof ScrollArea.Root,typeof ScrollArea.Viewport,typeof ScrollArea.Content,typeof ScrollArea.Scrollbar,typeof ScrollArea.Thumb,typeof ScrollArea.Corner]=[ScrollAreaRoot,ScrollAreaViewport,ScrollAreaContent,ScrollAreaScrollbar,ScrollAreaThumb,ScrollAreaCorner];void aliases;
const explicitUndefined:Sub.ScrollAreaScrollbarProps={keepMounted:undefined,orientation:undefined,ref:undefined,children:undefined,class:undefined,style:undefined,render:undefined};void explicitUndefined;
const events:Sub.ScrollAreaThumbProps={onpointerdown:event=>{const native:PointerEvent=event;const host:HTMLDivElement=event.currentTarget;event.preventBaseUIHandler();void[native,host];}};void events;
// @ts-expect-error Source orientation has only two string choices.
const invalidOrientation:Sub.ScrollAreaScrollbarProps={orientation:'diagonal'};
// @ts-expect-error Threshold must be numbers.
const invalidThreshold:Sub.ScrollAreaRootProps={overflowEdgeThreshold:{xStart:'5'}};
// @ts-expect-error Source Root has no controlled scrolling business prop.
const invalidState:Sub.ScrollAreaRootProps={scrolling:true};
// @ts-expect-error Refs are actual native hosts.
const invalidRef:Sub.ScrollAreaViewportProps={ref:5};
// @ts-expect-error Native render replacement is a snippet.
const invalidRender:Sub.ScrollAreaThumbProps={render:'div'};
void [invalidOrientation,invalidThreshold,invalidState,invalidRef,invalidRender];
TS
# Keep the valid nested optional example exact, then exercise its invalid counterpart explicitly.
python3 - "$scroll_consumer/PublicTypes.ts" <<'PY'
import sys
p=sys.argv[1];s=open(p).read().replace('xEnd:5,yStart:undefined','xEnd:5');open(p,'w').write(s)
PY
cat > "$scroll_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"exactOptionalPropertyTypes":true,"noUncheckedIndexedAccess":true,"skipLibCheck":false,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$scroll_consumer" --tsconfig ./tsconfig.json | tee .checks/scroll-area/public-types.log
cat > "$scroll_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import { ScrollArea, ScrollAreaRoot, ScrollAreaViewport, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaCorner } from '@sveltery/base';
import { ScrollArea as Sub } from '@sveltery/base/scroll-area';
import Consumer from './Consumer.svelte';
assert.equal(ScrollArea,Sub);assert.deepEqual(Object.keys(ScrollArea).sort(),['Content','Corner','Root','Scrollbar','Thumb','Viewport']);
for(const [part,alias] of Object.entries({Root:ScrollAreaRoot,Viewport:ScrollAreaViewport,Content:ScrollAreaContent,Scrollbar:ScrollAreaScrollbar,Thumb:ScrollAreaThumb,Corner:ScrollAreaCorner}))assert.equal(ScrollArea[part],alias);
const body=render(Consumer).body;assert.match(body,/public content/);assert.match(body,/nonce="public-nonce"/);assert.match(body,/base-ui-disable-scrollbar/);assert.match(body,/tabindex="-1"/);assert.match(body,/data-orientation="horizontal"/);assert.match(body,/<section/);
assert.throws(()=>render(ScrollAreaViewport).body,/ScrollAreaRootContext is missing/);
console.log('Installed public root/subpath aliases,12 type exports, strict exactOptional/noUnchecked/skipLibCheck:false, SSR and native snippet host: PASS');
JS
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$scroll_consumer/check.mjs" | tee .checks/scroll-area/public-ssr.log
# Compile this actual installed consumer for DOM execution and use only its installed package.
node --input-type=module - "$scroll_consumer" <<'JS'
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';import {join} from 'node:path';import {createRequire} from 'node:module';
const directory=process.argv[2];const require=createRequire(join(directory,'package.json'));const {compile,compileModule}=require('svelte/compiler');
const packageRoot=join(directory,'node_modules/@sveltery/base');
function visit(path){for(const name of readdirSync(path,{withFileTypes:true})){const file=join(path,name.name);if(name.isDirectory())visit(file);else if(file.endsWith('.svelte'))writeFileSync(file+'.js',compile(readFileSync(file,'utf8'),{filename:file,generate:'client'}).js.code);else if(file.endsWith('.svelte.js'))writeFileSync(file,compileModule(readFileSync(file,'utf8'),{filename:file,generate:'client'}).js.code);}}
visit(join(packageRoot,'dist'));writeFileSync(join(directory,'Consumer.js'),compile(readFileSync(join(directory,'Consumer.svelte'),'utf8'),{filename:join(directory,'Consumer.svelte'),generate:'client'}).js.code);
const loader=`import {registerHooks} from 'node:module'; registerHooks({resolve(specifier,context,nextResolve){return nextResolve(specifier.endsWith('.svelte')?specifier+'.js':specifier,context);}});`;writeFileSync(join(directory,'loader.mjs'),loader);
JS
cat > "$scroll_consumer/dom.mjs" <<'JS'
import assert from 'node:assert/strict';import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><div id="target"></div>',{url:'http://localhost'});
for(const key of ['window','document','navigator','Element','HTMLElement','HTMLDivElement','Node','Text','Comment','Event','CustomEvent','HTMLInputElement','HTMLFormElement','MutationObserver','getComputedStyle'])Object.defineProperty(globalThis,key,{configurable:true,value:typeof dom.window[key]==='function'&&key==='getComputedStyle'?dom.window[key].bind(dom.window):dom.window[key]});
const {mount,unmount,flushSync}=await import('svelte');const {default:Consumer}=await import('./Consumer.js');const instance=mount(Consumer,{target:document.querySelector('#target')});flushSync();
assert.match(document.body.textContent,/public content/);assert.equal(document.querySelectorAll('.base-ui-disable-scrollbar').length,3);assert.equal(document.querySelector('style').nonce,'public-nonce');
await unmount(instance);assert.equal(document.querySelector('#target').children.length,0);console.log('Installed public DOM consumer mounts real six-part composition and cleans up: PASS');
JS
node --conditions=browser --import "$scroll_consumer/loader.mjs" "$scroll_consumer/dom.mjs" | tee .checks/scroll-area/public-dom.log
# Meaningful intended native negative diagnostics without relying on @ts-expect-error suppression.
cat > "$scroll_consumer/Negative.svelte" <<'SVELTE'
<script lang="ts">import { ScrollArea } from '@sveltery/base/scroll-area';</script>
<ScrollArea.Scrollbar orientation="diagonal" />
<ScrollArea.Root overflowEdgeThreshold={{ xStart: 'wrong' }} />
<ScrollArea.Thumb render="div" />
<ScrollArea.Viewport ref={42} />
SVELTE
if node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$scroll_consumer" --tsconfig ./tsconfig.json > .checks/scroll-area/public-negative.log 2>&1; then
  echo 'Negative native consumers unexpectedly passed' >&2; exit 1
fi
node --input-type=module - .checks/scroll-area/public-negative.log <<'JS'
import assert from 'node:assert/strict';import{readFileSync}from'node:fs';const text=readFileSync(process.argv[2],'utf8');assert.match(text,/found 4 errors and 0 warnings/);for(const marker of ['diagonal','wrong','render="div"','ref={42}'])assert.ok(text.includes(marker));console.log('Four intended installed native negative diagnostics: PASS');
JS
printf '%s\n' "$scroll_consumer" > .checks/scroll-area/public-consumer-path.txt
