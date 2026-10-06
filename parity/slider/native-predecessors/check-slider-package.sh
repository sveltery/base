#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
slider_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-slider-consumer.XXXXXX")"
trap 'rm -rf "$slider_consumer"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$slider_consumer" > /dev/null
node --input-type=module - "$slider_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const directory = process.argv[2], tarball = readdirSync(directory).find(name => name.endsWith('.tgz'));
writeFileSync(join(directory, 'package.json'), JSON.stringify({private:true,type:'module',dependencies:{'@sveltery/base':`file:${join(directory,tarball)}`,svelte:'5.57.1'}}));
JS
pnpm --dir "$slider_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$slider_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
cmp LICENSE "$slider_consumer/node_modules/@sveltery/base/LICENSE"
cat > "$slider_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { Slider, Field, Form, CSPProvider } from '@sveltery/base';
  import { Slider as SubSlider } from '@sveltery/base/slider';
  import type { HTMLAttributes } from 'svelte/elements';
  const Range = Slider.Root<readonly [number, number]>;
</script>
<CSPProvider nonce="packed-nonce"><Form><Field.Root name="volume"><Field.Label>Volume</Field.Label>
  <Range defaultValue={[20,80]} thumbAlignment="edge" onValueChange={(values,details) => { const tuple: readonly [number,number] = values; const index: number = details.activeThumbIndex; details.cancel(); void [tuple,index]; }}>
    <SubSlider.Label>Range</SubSlider.Label><Slider.Control><Slider.Track><Slider.Indicator /></Slider.Track><Slider.Thumb index={0} inputRef={null}/><Slider.Thumb index={1} getAriaLabel={index => `Value ${index}`} /></Slider.Control><Slider.Value>{#snippet children(formatted, values)}{formatted.join('/')}/{values.join('/')}{/snippet}</Slider.Value>
  </Range>
</Field.Root></Form></CSPProvider>
<SubSlider.Root defaultValue={40}><SubSlider.Control><SubSlider.Thumb>{#snippet render(props, _state, children)}<span {...props as HTMLAttributes<HTMLSpanElement>}>{@render children?.()}</span>{/snippet}</SubSlider.Thumb></SubSlider.Control></SubSlider.Root>
SVELTE
cat > "$slider_consumer/PublicTypes.ts" <<'TS'
import {Slider} from '@sveltery/base';
import type {ComponentProps} from 'svelte';
import type * as Root from '@sveltery/base';
import type * as Sub from '@sveltery/base/slider';
type Equal<A,B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
function exact<A,B>(_value: Equal<A,B> extends true ? A : never) {}
declare const root: Sub.SliderRootProps; exact<Root.SliderRootProps,typeof root>(root);
declare const label: Sub.SliderLabelProps; exact<Root.SliderLabelProps,typeof label>(label);
declare const control: Sub.SliderControlProps; exact<Root.SliderControlProps,typeof control>(control);
declare const track: Sub.SliderTrackProps; exact<Root.SliderTrackProps,typeof track>(track);
declare const indicator: Sub.SliderIndicatorProps; exact<Root.SliderIndicatorProps,typeof indicator>(indicator);
declare const thumb: Sub.SliderThumbProps; exact<Root.SliderThumbProps,typeof thumb>(thumb);
declare const value: Sub.SliderValueProps; exact<Root.SliderValueProps,typeof value>(value);
declare const change: Sub.SliderRootChangeEventDetails; exact<Root.SliderRootChangeEventDetails,typeof change>(change);
declare const commit: Sub.SliderRootCommitEventDetails; exact<Root.SliderRootCommitEventDetails,typeof commit>(commit);
declare const rootState: Sub.SliderRootState; exact<Root.SliderRootState,typeof rootState>(rootState);
declare const labelState: Sub.SliderLabelState; exact<Root.SliderLabelState,typeof labelState>(labelState);
declare const controlState: Sub.SliderControlState; exact<Root.SliderControlState,typeof controlState>(controlState);
declare const trackState: Sub.SliderTrackState; exact<Root.SliderTrackState,typeof trackState>(trackState);
declare const indicatorState: Sub.SliderIndicatorState; exact<Root.SliderIndicatorState,typeof indicatorState>(indicatorState);
declare const thumbState: Sub.SliderThumbState; exact<Root.SliderThumbState,typeof thumbState>(thumbState);
declare const valueState: Sub.SliderValueState; exact<Root.SliderValueState,typeof valueState>(valueState);
declare const custom: Sub.SliderRootChangeEventCustomProperties; exact<Root.SliderRootChangeEventCustomProperties,typeof custom>(custom);
declare const changeReason: Sub.SliderRootChangeEventReason; exact<Root.SliderRootChangeEventReason,typeof changeReason>(changeReason);
declare const commitReason: Sub.SliderRootCommitEventReason; exact<Root.SliderRootCommitEventReason,typeof commitReason>(commitReason);
declare const metadata: Sub.ThumbMetadata; exact<Root.ThumbMetadata,typeof metadata>(metadata);
const scalar: ComponentProps<typeof Slider.Root<number>> = {value:40,onValueChange(value,details) {const number:number=value; const event:Event=details.event; details.cancel(); void [number,event];}};
const tuple: Sub.SliderRootProps<readonly [number,number]> = {defaultValue:[20,80],value:undefined,onValueCommitted(values,details) {const tuple:readonly [number,number]=values; const reason:Sub.SliderRootCommitEventReason=details.reason; void [tuple,reason];}};
const explicitUndefined: Sub.SliderRootProps = {defaultValue:undefined,value:undefined,disabled:undefined,format:undefined,locale:undefined,max:undefined,min:undefined,minStepsBetweenValues:undefined,name:undefined,form:undefined,orientation:undefined,step:undefined,largeStep:undefined,thumbAlignment:undefined,thumbCollisionBehavior:undefined,onValueChange:undefined,onValueCommitted:undefined,render:undefined,class:undefined,style:undefined,children:undefined,ref:undefined};
const nativeThumb: Sub.SliderThumbProps = {disabled:undefined,'aria-valuetext':undefined,getAriaLabel:null,getAriaValueText:null,index:undefined,inputRef:null,onblur:undefined,onfocus:undefined,onkeydown:undefined,tabindex:undefined};
const undefinedChildren: Sub.SliderValueProps = {children:null};
// @ts-expect-error Source numeric Slider rejects a string controlled value.
const invalidValue: ComponentProps<typeof Slider.Root<number>> = {value:'40'};
// @ts-expect-error Source range generic rejects scalar initial value.
const invalidRange: Sub.SliderRootProps<readonly number[]> = {defaultValue:40};
// @ts-expect-error Source scalar generic rejects array value.
const invalidScalar: Sub.SliderRootProps<number> = {value:[1,2]};
// @ts-expect-error Source step requires a number.
const invalidStep: Sub.SliderRootProps = {step:'1'};
// @ts-expect-error Source orientation rejects diagonal.
const invalidOrientation: Sub.SliderRootProps = {orientation:'diagonal'};
// @ts-expect-error Source alignment permits only its three variants.
const invalidAlignment: Sub.SliderRootProps = {thumbAlignment:'outside'};
// @ts-expect-error Source collision behavior excludes stop.
const invalidCollision: Sub.SliderRootProps = {thumbCollisionBehavior:'stop'};
// @ts-expect-error Source optional disabled allows undefined, not null.
const invalidFlag: Sub.SliderRootProps = {disabled:null};
// @ts-expect-error Source Label id is root-derived.
const invalidLabel: Sub.SliderLabelProps = {id:'custom'};
// @ts-expect-error Source Thumb index is numeric.
const invalidIndex: Sub.SliderThumbProps = {index:'1'};
// @ts-expect-error Thumb inputRef resolves to an input.
const invalidRef: Sub.SliderThumbProps = {inputRef:(node:HTMLButtonElement|null)=>void node};
// @ts-expect-error Commit details are generic and cannot be canceled.
commit.cancel();
// @ts-expect-error Active thumb metadata belongs to change details only.
commit.activeThumbIndex;
// @ts-expect-error React className is replaced by native class.
const invalidClass: Sub.SliderControlProps = {className:'react'};
void [scalar,tuple,explicitUndefined,nativeThumb,undefinedChildren,invalidValue,invalidRange,invalidScalar,invalidStep,invalidOrientation,invalidAlignment,invalidCollision,invalidFlag,invalidLabel,invalidIndex,invalidRef,invalidClass];
TS
cat > "$slider_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {render} from 'svelte/server';
import {Slider} from '@sveltery/base';
import {Slider as Sub} from '@sveltery/base/slider';
import Consumer from './Consumer.svelte';
assert.equal(Slider,Sub);assert.deepEqual(Object.keys(Slider).sort(),['Control','Indicator','Label','Root','Thumb','Track','Value']);
const body=render(Consumer).body;
assert.equal((body.match(/<input\b[^>]*type="range"/g)??[]).length,3);assert.match(body,/name="volume"/);assert.match(body,/value="20"/);assert.match(body,/value="80"/);assert.match(body,/nonce="packed-nonce"/);assert.match(body,/<script[^>]*>!function/);
for(const part of [Slider.Label,Slider.Value,Slider.Control,Slider.Track,Slider.Thumb,Slider.Indicator]) assert.throws(()=>render(part).body,/SliderRootContext is missing/);
assert(readFileSync(new URL('./node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md',import.meta.url),'utf8').includes('Slider Root, Label, Value, Control, Track, Thumb, Indicator'));
console.log('Isolated installed Slider root/subpath, all Source parts/types, SSR, immutable positioning script and MIT: PASS');
JS
cat > "$slider_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"exactOptionalPropertyTypes":true,"skipLibCheck":false,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$slider_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$slider_consumer" --tsconfig ./tsconfig.json
cat > "$slider_consumer/DOMConsumer.svelte" <<'SVELTE'
<script lang="ts">
  import {Slider,Field,Form} from '@sveltery/base';
  import {Slider as Sub} from '@sveltery/base/slider';
  let show=$state(true);let owner=$state(40);let calls=$state<unknown[]>([]);let commits=$state<unknown[]>([]);let refs=$state<string[]>([]);
  function inputRef(input:HTMLInputElement|null){if(input){refs.push('attach');return()=>refs.push('cleanup');}}
  export function hide(){show=false;} export function update(){owner=60;} export function snapshot(){return{calls,commits,refs};}
</script>
<Form id="packed-form"><Field.Root name="volume">{#if show}<Slider.Root value={owner} onValueChange={(value,details)=>{calls.push({value,reason:details.reason,index:details.activeThumbIndex});owner=value;}} onValueCommitted={(value,details)=>commits.push({value,reason:details.reason})}><Sub.Label>Volume</Sub.Label><Sub.Control><Sub.Track><Sub.Indicator/></Sub.Track><Sub.Thumb {inputRef}/></Sub.Control><Sub.Value id="packed-value"/></Slider.Root>{/if}</Field.Root></Form>
SVELTE
cat > "$slider_consumer/dom-loader.mjs" <<'JS'
import {registerHooks,createRequire} from 'node:module';import{readFileSync}from'node:fs';import{fileURLToPath}from'node:url';
const require=createRequire(new URL('./package.json',import.meta.url));const{compile,compileModule}=require('svelte/compiler');
registerHooks({load(url,context,next){if(url.endsWith('.svelte')||url.endsWith('.svelte.js')){const raw=readFileSync(fileURLToPath(url),'utf8'),options={filename:fileURLToPath(url),generate:'client'};const result=url.endsWith('.svelte')?compile(raw,options):compileModule(raw,options);return{format:'module',source:result.js.code,shortCircuit:true};}return next(url,context);}});
JS
cat > "$slider_consumer/dom-check.mjs" <<'JS'
import assert from 'node:assert/strict';import{createRequire}from'node:module';
const tooling=createRequire(process.argv[2]);const{JSDOM}=tooling('jsdom');const dom=new JSDOM('<!doctype html><html><body><main></main></body></html>',{url:'http://localhost'});
for(const key of ['window','document','navigator','HTMLElement','HTMLInputElement','HTMLFormElement','Element','Node','Text','Comment','Event','KeyboardEvent','FocusEvent','FormData','MutationObserver','getComputedStyle'])Object.defineProperty(globalThis,key,{configurable:true,value:dom.window[key]});
globalThis.requestAnimationFrame=(fn)=>setTimeout(fn,0);globalThis.cancelAnimationFrame=clearTimeout;
const{mount,flushSync,unmount}=await import('svelte');const{default:Consumer}=await import('./DOMConsumer.svelte');const app=mount(Consumer,{target:document.querySelector('main')});flushSync();
const input=document.querySelector('input[type="range"]');assert.equal(input.value,'40');assert.equal(new FormData(document.querySelector('form')).get('volume'),'40');
input.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));flushSync();assert.equal(input.value,'41');assert.equal(document.querySelector('#packed-value').textContent,'41');assert.deepEqual(app.snapshot().calls,[{value:41,reason:'keyboard',index:0}]);assert.deepEqual(app.snapshot().commits,[{value:41,reason:'keyboard'}]);
app.update();flushSync();assert.equal(input.value,'60');assert.equal(new FormData(document.querySelector('form')).get('volume'),'60');app.hide();flushSync();assert.equal(document.querySelector('input[type="range"]'),null);assert.deepEqual(app.snapshot().refs,['attach','cleanup']);await unmount(app);dom.window.close();
console.log('Isolated installed Slider real DOM source callbacks, controlled updates, FormData, output and inputRef cleanup: PASS');
JS
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$slider_consumer" --tsconfig ./tsconfig.json
cat > "$slider_consumer/Bad.svelte" <<'SVELTE'
<script lang="ts">
  import {Slider} from '@sveltery/base';
  import {Slider as Sub} from '@sveltery/base/slider';
  const Numeric=Slider.Root<number>;
</script>
<Numeric value="wrong"/><Sub.Thumb index="wrong"/><Sub.Root thumbCollisionBehavior="stop"/>
SVELTE
if node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$slider_consumer" --tsconfig ./tsconfig.json > "$slider_consumer/invalid.log" 2>&1; then
  echo 'Invalid native Slider markup unexpectedly passed' >&2; exit 1
fi
node --input-type=module - "$slider_consumer/invalid.log" <<'JS'
import assert from 'node:assert/strict';import{readFileSync}from'node:fs';const log=readFileSync(process.argv[2],'utf8');assert.match(log,/found 3 errors and 0 warnings/);assert.match(log,/Bad.svelte/);console.log('Isolated native Slider numeric value/index/collision markup: all 3 intended diagnostics verified');
JS
node --conditions=browser --import "$slider_consumer/dom-loader.mjs" "$slider_consumer/dom-check.mjs" "$sveltery_repo_root/packages/base/package.json"
