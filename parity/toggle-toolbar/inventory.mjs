// Immutable Base UI v1.8.0 source/test audit. MIT: UPSTREAM_LICENSE.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, posix, resolve } from 'node:path';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const upstream = resolve(process.argv.slice(2).find(argument => !argument.startsWith('--')) ?? '/workspace/direction-provider-upstream');
const sha = text => createHash('sha256').update(text).digest('hex');
const files = new Set(execFileSync('git', ['-C', upstream, 'ls-tree', '-r', '--name-only', pin], {encoding:'utf8'}).trim().split('\n'));
const roots = ['packages/react/src/toggle/index.ts','packages/react/src/toggle-group/index.ts','packages/react/src/toolbar/index.ts'];
const content = path => execFileSync('git',['-C',upstream,'show',`${pin}:${path}`],{encoding:'utf8'});
const tree = (path,text) => ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true,path.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
function resolveImport(source,specifier) {
  const raw = specifier.startsWith('.') ? posix.normalize(posix.join(dirname(source),specifier)) : specifier.startsWith('@base-ui/utils/') ? `packages/utils/src/${specifier.slice('@base-ui/utils/'.length)}` : null;
  if (raw === null) return `external:${specifier}`;
  for (const suffix of ['', '.ts','.tsx','/index.ts','/index.tsx']) if(files.has(raw+suffix)) return raw+suffix;
  throw new Error(`Unresolved ${source} -> ${specifier}`);
}
// Graph conservatively preserves every original import/export edge, including
// unselected barrel reexports; selected runtime business is recorded separately.
const modules = new Map();
function walk(source,reachability) {
  const known=modules.get(source);
  if(known){if(known.reachability==='type'&&reachability==='runtime'){known.reachability='runtime';for(const edge of known.imports) if(!edge.resolved.startsWith('external:'))walk(edge.resolved,edge.kind==='type'?'type':'runtime');}return;}
  const text=content(source), ast=tree(source,text), imports=[];
  for(const node of ast.statements){
    if(!((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteralLike(node.moduleSpecifier)))continue;
    const specifier=node.moduleSpecifier.text;
    const bindings=ts.isImportDeclaration(node)?node.importClause?.namedBindings:node.exportClause;
    const allBindingsType=bindings&&ts.isNamedImports(bindings)&&bindings.elements.length>0&&bindings.elements.every(x=>x.isTypeOnly);
    const kind=(node.isTypeOnly||node.importClause?.isTypeOnly||allBindingsType)?'type':'runtime';
    const symbols=bindings&&('elements' in bindings)?bindings.elements.map(x=>({imported:(x.propertyName??x.name).text,typeOnly:!!x.isTypeOnly})):[];
    imports.push({specifier,kind,resolved:resolveImport(source,specifier),symbols,edge:ts.isExportDeclaration(node)?'export':'import'});
  }
  const record={source,sha256:sha(text),url:`https://github.com/mui/base-ui/blob/${pin}/${source}`,reachability,imports};modules.set(source,record);
  for(const edge of imports)if(!edge.resolved.startsWith('external:'))walk(edge.resolved,reachability==='type'||edge.kind==='type'?'type':'runtime');
}
for(const root of roots)walk(root,'runtime');
const tests=[...files].filter(x=>/^packages\/react\/src\/(toggle|toggle-group|toolbar)\//.test(x)&&/\.(test|spec)\.tsx$/.test(x));
const testSources=[],declarations=[],conformance=[];
for(const source of tests){
 const text=content(source),ast=tree(source,text);testSources.push({source,sha256:sha(text),url:`https://github.com/mui/base-ui/blob/${pin}/${source}`});
 const line=node=>ast.getLineAndCharacterOfPosition(node.getStart(ast)).line+1;
 const visit=node=>{
  if(ts.isCallExpression(node)){
   let callee=node.expression;while(ts.isCallExpression(callee)||ts.isPropertyAccessExpression(callee))callee=callee.expression;
   const body=node.arguments.find(x=>ts.isArrowFunction(x)||ts.isFunctionExpression(x));const title=node.arguments[0];
   if(ts.isIdentifier(callee)&&['it','test'].includes(callee.text)&&body&&(ts.isStringLiteralLike(title)||ts.isTemplateExpression(title))){
    const assertions=[];const find=child=>{if(ts.isCallExpression(child)&&/^expect\(/.test(child.getText(ast))&&!ts.isPropertyAccessExpression(child.parent))assertions.push({line:line(child),text:child.getText(ast)});ts.forEachChild(child,find);};find(body.body);
    declarations.push({id:`${source}:${line(node)}`,source,line:line(node),title:ts.isStringLiteralLike(title)?title.text:title.getText(ast),expression:node.expression.getText(ast),bodySha256:sha(body.body.getText(ast)),assertions,status:'unported'});
   }
   if(ts.isIdentifier(callee)&&/^describe(Conformance|Composite)$/.test(callee.text))conformance.push({id:`${source}:${line(node)}`,expression:node.getText(ast),sha256:sha(node.getText(ast))});
  }
  ts.forEachChild(node,visit);
 };visit(ast);
}
const graph={pin,roots,scope:'Complete conservative original import/type graph. Barrel edges are retained as evidence; unselected exports are not required runtime consumers. Original non-type imports of type declarations retain their source syntax. See correspondence for selected functions.',modules:[...modules.values()].sort((a,b)=>a.source.localeCompare(b.source)),external:[...new Set([...modules.values()].flatMap(x=>x.imports.filter(y=>y.resolved.startsWith('external:')).map(y=>y.resolved)))].sort()};
const assertions={pin,ordinaryDeclarationCredit:0,scope:'Immutable declaration-site hashes and original expectations. Parameterized execution variants, shared conformance and authored supplements receive separate accounting; inventory and manual reads grant zero credit.',sources:testSources,declarations,conformance};
for(const [name,value] of [['source-graph.json',graph],['original-assertions.json',assertions]]){
 const path=new URL(`./${name}`,import.meta.url),serialized=JSON.stringify(value,null,2)+'\n';if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==serialized)throw new Error(`${name} differs from immutable source`);}else writeFileSync(path,serialized);
}
console.log(`Original graph: ${modules.size} modules, ${[...modules.values()].reduce((n,x)=>n+x.imports.length,0)} edges. Tests: ${testSources.length} files, ${declarations.length} declaration sites, ${conformance.length} helper calls. Credit 0.`);
