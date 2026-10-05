// Bounded exact Source-body proof; excludes framework wrappers and grants no parity credit.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const ts = createRequire(resolve(root, 'packages/base/package.json'))('typescript');
const upstream = resolve(process.argv[2] ?? '/workspace/direction-provider-upstream');
const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const hash = text => createHash('sha256').update(text).digest('hex');
const printer = ts.createPrinter({ removeComments: true });
const cases = [
  ['useAnimationFrame', ['Scheduler', 'resetAnimationFrameScheduler', 'AnimationFrame']],
  ['owner', ['ownerDocument']],
  ['formatNumber', ['getFormatter', 'formatNumber']],
  ['stringifyLocale', ['stringifyLocale']],
];
const framework = JSON.parse(readFileSync(resolve(root, 'parity/utils-package/native-framework-status.json'), 'utf8'));
if (!framework.sourceSuccessors?.some(record => record.from === 'packages/utils/src/lib/useAnimationFrame.ts' && record.currentOwners?.includes('packages/utils/src/lib/useAnimationFrame.ts'))) {
  throw new Error('Class-only frame proof requires an explicit native factory successor record.');
}
const records = [];
for (const [module, names] of cases) {
  const originalPath = `packages/utils/src/${module}.ts`;
  const localPath = `packages/utils/src/lib/${module}.ts`;
  const original = execFileSync('git', ['-C', upstream, 'show', `${pin}:${originalPath}`], { encoding: 'utf8' });
  const local = readFileSync(resolve(root, localPath), 'utf8');
  // The only permitted business-token substitution is the browser-safe development flag.
  const originalAst = ts.createSourceFile(originalPath, original.replace("process.env.NODE_ENV !== 'production'", 'DEV'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const localAst = ts.createSourceFile(localPath, local, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  for (const name of names) {
    const sourceNode = originalAst.statements.find(node => node.name?.text === name);
    const localNode = localAst.statements.find(node => node.name?.text === name);
    if (!sourceNode || !localNode) throw new Error(`Missing full Source body ${module}:${name}`);
    const sourcePrint = printer.printNode(ts.EmitHint.Unspecified, sourceNode, originalAst);
    const localPrint = printer.printNode(ts.EmitHint.Unspecified, localNode, localAst);
    if (sourcePrint !== localPrint) throw new Error(`Business body differs from immutable Source: ${module}:${name}`);
    records.push({ source: originalPath, local: localPath, symbol: name, sourceFileSha256: hash(original), localFileSha256: hash(local), sourceBodySha256: hash(sourceNode.getText(originalAst)), localBodySha256: hash(localNode.getText(localAst)), comparableAstSha256: hash(sourcePrint), equal: true });
  }
  if (module === 'owner' && !/export\s*\{\s*getWindow\s+as\s+ownerWindow\s*\}\s*from\s*['"]@floating-ui\/utils\/dom['"]/.test(local)) throw new Error('ownerWindow must reexport the actual Source dependency.');
}
const output = { immutableOriginalPin: pin, ordinaryDeclarationCredit: 0, method: 'Full named business declaration AST printing with comments removed; literal Source process.env development expression is replaced only by esm-env DEV. No statement, branch, identifier, type, callback, cancellation or normalization stripping is allowed. Removed setup factories are mapped separately to native class/lifecycle owners.', historicalProof: 'parity/native-framework/historical/utils-body-fidelity-pre-native.json', records, scope: 'Bounded Scheduler/reset/AnimationFrame/owner/format/locale equality only; not full moved-closure or feature acceptance.' };
writeFileSync(resolve(root,'parity/utils-package/body-fidelity.json'),JSON.stringify(output,null,2)+'\n');
console.log(`${records.length} complete pinned declarations retain exact comparable AST bodies.`);
