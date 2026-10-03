// Auditable static source and assertion inventory; does not award parity credit.
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, relative, join } from 'node:path';
import { createHash } from 'node:crypto';
import ts from '../../packages/base/node_modules/typescript/lib/typescript.js';
const upstream = resolve(process.argv[2] ?? '/workspace/direction-provider-upstream');
const output = dirname(new URL(import.meta.url).pathname);
const roots = ['packages/react/src/otp-field/index.ts','packages/react/src/otp-field/root/OTPFieldRoot.tsx','packages/react/src/otp-field/input/OTPFieldInput.tsx'];
const modules = new Map();
const boundaries = new Set();
const hash = content => createHash('sha256').update(content).digest('hex');
function resolveImport(path, specifier) {
  let base;
  if(specifier.startsWith('.')) base=resolve(dirname(path),specifier);
  else if(specifier.startsWith('@base-ui/utils/')) base=join(upstream,'packages/utils/src',specifier.slice('@base-ui/utils/'.length));
  else { boundaries.add(specifier); return undefined; }
  const found=[base,base+'.ts',base+'.tsx',join(base,'index.ts'),join(base,'index.tsx')].find(path => existsSync(path) && statSync(path).isFile());
  if(!found) throw new Error(`Unresolved source import ${relative(upstream,path)} → ${specifier}`);
  return found;
}
function visit(path) {
  const name=relative(upstream,path);
  if(modules.has(name))return;
  const content=readFileSync(path,'utf8');
  const file=ts.createSourceFile(path,content,ts.ScriptTarget.Latest,true);
  const imports=[];
  modules.set(name,{sha256:hash(content),imports});
  for(const statement of file.statements){
    if(!(ts.isImportDeclaration(statement)||ts.isExportDeclaration(statement))||!statement.moduleSpecifier)continue;
    const specifier=statement.moduleSpecifier.text;
    const target=resolveImport(path,specifier);
    const clause=ts.isImportDeclaration(statement)?statement.importClause:statement;
    const isType=Boolean(clause?.isTypeOnly);
    const bindings=ts.isImportDeclaration(statement)?clause?.namedBindings:statement.exportClause;
    const names=bindings&&'elements' in bindings?bindings.elements.map(item=>({name:item.propertyName?.text??item.name.text,kind:isType||item.isTypeOnly?'type':'runtime'})):[];
    imports.push({specifier,kind:isType?'type':'runtime-or-mixed',symbols:names,target:target?relative(upstream,target):'external:'+specifier});
    if(target)visit(target);
  }
}
for(const path of roots)visit(join(upstream,path));
const graph={sourcePin:'47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c',roots,modules:Object.fromEntries([...modules].sort(([a],[b])=>a.localeCompare(b))),externalBoundaries:[...boundaries].sort()};
writeFileSync(join(output,'source-graph.json'),JSON.stringify(graph,(key,value)=>value,0)+'\n');
const testPaths=['root/OTPFieldRoot.test.tsx','root/OTPFieldRoot.react17.test.tsx','input/OTPFieldInput.test.tsx','utils/otp.test.ts','root/OTPFieldRoot.spec.tsx','input/OTPFieldInput.spec.tsx'];
const tests=[];
for(const name of testPaths){
  const path='packages/react/src/otp-field/'+name;
  const content=readFileSync(join(upstream,path),'utf8');
  const file=ts.createSourceFile(path,content,ts.ScriptTarget.Latest,true);
  const declarations=[];
  let conformance=0;
  function walk(node){
    if(ts.isCallExpression(node)){
      const callee=node.expression.getText(file);
      if(callee==='describeConformance')conformance++;
      if(callee==='it'||callee==='test'||/^(it|test)\.each\(/.test(callee)){
        const title=node.arguments.find(ts.isStringLiteral)?.text;
        if(title){const start=node.getStart(file);const end=node.end;declarations.push({line:file.getLineAndCharacterOfPosition(start).line+1,title,kind:callee==='it'||callee==='test'?'ordinary':'parameterized-declaration',sha256:hash(content.slice(start,end))});}
      }
    }
    ts.forEachChild(node,walk);
  }
  walk(file);
  tests.push({path,sha256:hash(content),declarations,conformanceHelperCalls:conformance,typeExpectErrors:(content.match(/@ts-expect-error/g)??[]).length});
}
writeFileSync(join(output,'upstream-inventory.json'),JSON.stringify({sourcePin:'47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c',tests,credit:'Inventory only; no execution/acceptance credit.'},null,2)+'\n');
console.log(`OTP inventory: ${modules.size} source modules, ${tests.reduce((sum,file)=>sum+file.declarations.length,0)} assertion declarations; no credit awarded.`);
