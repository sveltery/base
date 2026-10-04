// API snapshot from the actual local declarations and public aliases; zero parity credit.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const ts = require('typescript');
export function extractAlertDialogApi() {
  const own = readFileSync(new URL('../../packages/base/src/lib/alert-dialog/types.ts', import.meta.url), 'utf8');
  const shared = readFileSync(new URL('../../packages/base/src/lib/dialog/types.ts', import.meta.url), 'utf8');
  const index = readFileSync(new URL('../../packages/base/src/lib/alert-dialog/index.parts.ts', import.meta.url), 'utf8');
  const ownTree = ts.createSourceFile('alert-types.ts', own, ts.ScriptTarget.Latest, true);
  const sharedTree = ts.createSourceFile('dialog-types.ts', shared, ts.ScriptTarget.Latest, true);
  const parts = [...index.matchAll(/export const (\w+)(?::[^=\n]+)?\s*=/g)].map(match => match[1]).map(name => {
    const tree = name === 'Root' || name === 'Trigger' ? ownTree : sharedTree;
    const declarationName = `${tree === ownTree ? 'AlertDialog' : 'Dialog'}${name}Props`;
    const declaration = tree.statements.find(node => (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) && node.name.text === declarationName);
    if (!declaration) throw new Error(`Missing ${declarationName}`);
    return { name, signature: declaration.getText(tree), ...(tree === sharedTree ? { shared: `Dialog.${name}` } : {}) };
  });
  return { parts, types: own, sharedTypes: shared };
}
const output = new URL('./api.json', import.meta.url);
export function checkAlertDialogApi() {
  if (readFileSync(output, 'utf8') !== JSON.stringify(extractAlertDialogApi(), null, 2) + '\n') throw new Error('AlertDialog API is stale. Run node parity/alert-dialog/docs-api.mjs');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) checkAlertDialogApi();
  else writeFileSync(output, JSON.stringify(extractAlertDialogApi(), null, 2) + '\n');
}
