// Audit-only assertion site extraction at the immutable Source pin; MIT: ../UPSTREAM_LICENSE.
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const require=createRequire(resolve('packages/base/package.json'));
const ts=process.env.AVATAR_AUDIT_TYPESCRIPT ? require(process.env.AVATAR_AUDIT_TYPESCRIPT) : require('typescript');
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const hash=x=>createHash('sha256').update(x).digest('hex');
const local=resolve('.')+'/',source=(process.env.AVATAR_AUDIT_ORIGINAL ?? '/workspace/direction-provider-upstream')+'/';
function sites(root,path) {
 const raw=readFileSync(root+path,'utf8'),tree=ts.createSourceFile(path,raw,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),results=[];
 const walk=node=>{
  if(ts.isCallExpression(node)){
   let base=node.expression;while(ts.isCallExpression(base)||ts.isPropertyAccessExpression(base))base=base.expression;
   if(ts.isIdentifier(base)&&['it','test','describeConformance','expectType'].includes(base.text)){
    const body=node.arguments.find(x=>ts.isArrowFunction(x)||ts.isFunctionExpression(x));
    if(!['it','test'].includes(base.text)||body){
     const assertions=[];
     if(body){const assertionsWalk=x=>{if(ts.isCallExpression(x)&&/^expect\(/.test(x.getText(tree))&&!ts.isPropertyAccessExpression(x.parent))assertions.push({line:tree.getLineAndCharacterOfPosition(x.getStart(tree)).line+1,text:x.getText(tree),sha256:hash(x.getText(tree))});ts.forEachChild(x,assertionsWalk)};assertionsWalk(body.body)}
     const line=tree.getLineAndCharacterOfPosition(node.getStart(tree)).line+1;
     results.push({source:path,kind:base.text,line,title:node.arguments[0]?.getText(tree),declarationSha256:hash(node.getText(tree)),bodySha256:body?hash(body.body.getText(tree)):null,assertions});
    }
   }
  }
  ts.forEachChild(node,walk);
 };
 walk(tree);return results;
}
const primary=['root/AvatarRoot.test.tsx','image/AvatarImage.test.tsx','fallback/AvatarFallback.test.tsx','Avatar.spec.tsx'].map(x=>'packages/react/src/avatar/'+x);
const helpers=['propForwarding.tsx','refForwarding.tsx','renderProp.tsx','className.tsx'].map(x=>'packages/react/test/conformanceTests/'+x);
const out={primary:primary.flatMap(x=>sites(source,x)),conformanceHelpers:helpers.flatMap(x=>sites(source,x))};
writeFileSync(local+'parity/avatar/source-audit/assertion-sites.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({ordinary:out.primary.filter(x=>x.kind==='it').length,calls:out.primary.filter(x=>x.kind==='describeConformance').length,type:out.primary.filter(x=>x.kind==='expectType').length,helperDeclarations:out.conformanceHelpers.filter(x=>x.kind==='it').length,helperByFile:helpers.map(x=>[x,out.conformanceHelpers.filter(y=>y.source===x&&y.kind==='it').length])}));
