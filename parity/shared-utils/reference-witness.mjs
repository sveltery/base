import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
// Supplemental reproducer: run with the immutable upstream checkout and an
// installed React19.2.8/jsdom30.1.1 reference package directory. Zero parity credit.
const [originalDirectory, referenceDirectory] = process.argv.slice(2);
assert(originalDirectory && referenceDirectory, 'Pass upstream checkout and reference package paths.');
const reference = createRequire(path.resolve(referenceDirectory, 'package.json'));
const originalRoot = path.resolve(originalDirectory);
const graph = JSON.parse(fs.readFileSync(new URL('./source-graph.json', import.meta.url)));
for (const module of graph.modules) {
  const hash = createHash('sha256').update(fs.readFileSync(path.join(originalRoot, module.source))).digest('hex');
  assert.equal(hash, module.sha256, `Immutable source hash: ${module.source}`);
}
const ts = createRequire(new URL('../../packages/base/package.json', import.meta.url))('typescript');
const React = reference('react');
const { createRoot } = reference('react-dom/client');
const { renderToString } = reference('react-dom/server');
const { JSDOM } = reference('jsdom');
const sourceRoot = path.join(originalRoot, 'packages/utils/src');
assert.equal(React.version, '19.2.8');
const cache=new Map();
function loadSource(file) {
  const filename=path.resolve(sourceRoot, file);
  if(cache.has(filename))return cache.get(filename).exports;
  const module={exports:{}};cache.set(filename,module);
  const compiled=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  new Function('require','module','exports',compiled)((name)=>name.startsWith('.')?loadSource(path.resolve(path.dirname(filename),name+'.ts')):reference(name),module,module.exports);
  return module.exports;
}
const {useStableCallback}=loadSource('useStableCallback.ts');
const {useControlled}=loadSource('useControlled.ts');
const sourceErrors=[];
function RenderCall(){const cb=useStableCallback(()=>42);try{cb();sourceErrors.push('allowed')}catch(e){sourceErrors.push(e.message)}return null;}
renderToString(React.createElement(RenderCall));
const dom=new JSDOM('<div id="root"></div>');
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true});
const root=createRoot(document.querySelector('#root'));
const logs=[];let setOwner,callback;
function Child({stable}){React.useLayoutEffect(()=>{logs.push('child-layout:'+stable())},[stable]);return React.createElement('div',{ref:(node)=>{if(node)logs.push('ref:'+stable())}});}
function App(){const [value,setValue]=React.useState('old');setOwner=setValue;callback=useStableCallback(()=>value);React.useLayoutEffect(()=>{logs.push('parent-layout:'+callback())},[callback]);React.useEffect(()=>{logs.push('passive:'+callback())},[callback]);return React.createElement(Child,{stable:callback});}
await React.act(async()=>root.render(React.createElement(App)));
await React.act(async()=>{logs.push('event-before:'+callback());setOwner('new');logs.push('event-after:'+callback());});
logs.push('committed:'+callback());
let initialized=0,defaultValue;
function Controlled(){[defaultValue]=useControlled({controlled:undefined,default:()=>{initialized++;return 17},name:'CallableDefault'});return null;}
await React.act(async()=>root.render(React.createElement(Controlled)));
assert.deepEqual(sourceErrors, ['Base UI: Cannot call an event handler while rendering.']);
assert(logs.includes('ref:old') && logs.includes('child-layout:old') && logs.includes('parent-layout:old'));
assert(logs.indexOf('ref:old') < logs.indexOf('child-layout:old'));
assert(logs.includes('event-before:old') && logs.includes('event-after:old') && logs.includes('committed:new'));
assert.equal(initialized, 1);
assert.equal(defaultValue, 17);
console.log(JSON.stringify({pin:'47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c',react:React.version,ssrInitialRender:sourceErrors,lifecycle:logs,callableDefault:{initialized,value:defaultValue}},null,2));
await React.act(async()=>root.unmount());
