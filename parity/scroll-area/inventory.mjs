// Immutable Base UI 1.8.0 graph and original assertion provenance; MIT.
import ts from '../../packages/base/node_modules/typescript/lib/typescript.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { resolve, relative, dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const upstream = resolve(process.argv[2] ?? '/workspace/direction-provider-upstream');
if (execFileSync('git', ['rev-parse', 'HEAD'], { cwd: upstream, encoding: 'utf8' }).trim() !== pin) throw Error('Wrong upstream');
const output = resolve(import.meta.dirname);
const sha = body => createHash('sha256').update(body).digest('hex');
const roots = ['packages/react/src/scroll-area/index.ts'];
const queue = roots.map(source => ({source, reachability:'runtime'}));
const modules = new Map();
function resolveImport(file, specifier) {
  const base = specifier.startsWith('.') ? resolve(upstream, dirname(file), specifier) : specifier.startsWith('@base-ui/utils/') ? resolve(upstream, 'packages/utils/src', specifier.slice('@base-ui/utils/'.length)) : null;
  if (!base) return `external:${specifier}`;
  for (const path of [base, base+'.ts', base+'.tsx', join(base,'index.ts'), join(base,'index.tsx')]) if(existsSync(path) && !path.endsWith('/src')) { try { readFileSync(path); return relative(upstream,path); } catch { /* directory */ } }
  throw Error(`Unresolved ${file} -> ${specifier}`);
}
while(queue.length) {
  const {source,reachability} = queue.shift();
  if (modules.has(source)) { if(reachability==='runtime') modules.get(source).reachability='runtime'; continue; }
  const body = readFileSync(resolve(upstream,source),'utf8');
  const ast = ts.createSourceFile(source,body,ts.ScriptTarget.Latest,true);
  const imports=[];
  function record(specifier,kind) { const resolved=resolveImport(source,specifier); imports.push({specifier,kind,resolved}); if(!resolved.startsWith('external:')) queue.push({source:resolved,reachability:reachability==='type'?'type':kind}); }
  function visit(node) {
    if(ts.isImportDeclaration(node)&&ts.isStringLiteral(node.moduleSpecifier)) {
      const clause=node.importClause;
      const names=clause?.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements : undefined;
      record(node.moduleSpecifier.text,clause?.isTypeOnly || (!clause?.name&&names?.length&&names.every(e=>e.isTypeOnly))?'type':'runtime');
    } else if(ts.isExportDeclaration(node)&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))record(node.moduleSpecifier.text,node.isTypeOnly?'type':'runtime');
    else if(ts.isImportTypeNode(node)&&ts.isLiteralTypeNode(node.argument)&&ts.isStringLiteral(node.argument.literal))record(node.argument.literal.text,'type');
    ts.forEachChild(node,visit);
  }
  visit(ast);
  modules.set(source,{source,sha256:sha(body),url:`https://github.com/mui/base-ui/blob/${pin}/${source}`,reachability,imports});
  const saved=resolve(output,'upstream',source); mkdirSync(dirname(saved),{recursive:true});writeFileSync(saved,body);
}
// Propagate stronger runtime reachability after cycles/type-first discovery.
const runtimeQueue=[...roots];const runtimeVisited=new Set();
while(runtimeQueue.length){const source=runtimeQueue.shift();if(runtimeVisited.has(source))continue;runtimeVisited.add(source);const record=modules.get(source);if(!record)continue;record.reachability='runtime';for(const edge of record.imports)if(edge.kind==='runtime'&&!edge.resolved.startsWith('external:'))runtimeQueue.push(edge.resolved);}
const assertions=[];
const files=[];
function walk(directory) { for(const name of readdirSync(resolve(upstream,directory),{withFileTypes:true})) {const file=join(directory,name.name);if(name.isDirectory())walk(file);else files.push(file);} }
walk('packages/react/src/scroll-area');
for(const source of files) {
  const body=readFileSync(resolve(upstream,source),'utf8');
  const saved=resolve(output,'upstream',source);mkdirSync(dirname(saved),{recursive:true});writeFileSync(saved,body);
  if(!/test\.tsx$|spec\.tsx$/.test(source))continue;
  const ast=ts.createSourceFile(source,body,ts.ScriptTarget.Latest,true);
  function visit(node) {
    if(ts.isCallExpression(node)) {
      const callee=node.expression.getText(ast);
      const isTest=/^(it|test)(\.|\[|$)/.test(callee);
      const helper=callee==='describeConformance';
      const first=node.arguments[0];
      if((isTest||helper)&&first&&(!isTest||ts.isStringLiteralLike(first))) {
        const line=ast.getLineAndCharacterOfPosition(node.getStart(ast)).line+1;
        const declaration=node.getText(ast);
        assertions.push({id:`${source}:${line}`,source,line,kind:helper?'conformance-call':callee.includes('.each')?'parameterized-declaration':'ordinary-declaration',title:isTest?first.text:'describeConformance',callee,sha256:sha(declaration),fileSha256:sha(body),status:'unported',unchangedCredit:0});
      }
    }
    ts.forEachChild(node,visit);
  } visit(ast);
}
copyFileSync(resolve(upstream,'LICENSE'),resolve(output,'UPSTREAM_LICENSE'));
writeFileSync(resolve(output,'source-graph.json'),JSON.stringify({pin,roots,note:'Conservative complete module graph follows barrel reexports and type imports. Used named-symbol business slice is recorded separately in module-plan.md; unrelated barrel exports earn no source acceptance.',modules:[...modules.values()].sort((a,b)=>a.source.localeCompare(b.source))},null,2)+'\n');
writeFileSync(resolve(output,'original-assertions.json'),JSON.stringify({pin,ordinary:assertions.filter(a=>a.kind==='ordinary-declaration').length,parameterizedDeclarations:assertions.filter(a=>a.kind==='parameterized-declaration').length,conformanceCalls:assertions.filter(a=>a.kind==='conformance-call').length,assertions},null,2)+'\n');
console.log(JSON.stringify({modules:modules.size,assertions:assertions.length,ordinary:assertions.filter(a=>a.kind==='ordinary-declaration').length,conformance:assertions.filter(a=>a.kind==='conformance-call').length}));
