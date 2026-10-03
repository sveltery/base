// Extract only actual typed Tabs public declarations; documentation consistency adds no parity.
import ts from '../../packages/base/node_modules/typescript/lib/typescript.js';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const parts = ['Root', 'List', 'Tab', 'Panel', 'Indicator'];
export function extractTabsApi() {
  const source = readFileSync(new URL('../../packages/base/src/lib/tabs/types.ts', import.meta.url), 'utf8');
  const tree = ts.createSourceFile('types.ts', source, ts.ScriptTarget.Latest, true);
  const declarations = parts.map(name => {
    const declaration = tree.statements.find(node => (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && node.name.text === `Tabs${name}Props`);
    if (!declaration) throw new Error(`Missing Tabs${name}Props`);
    return { name, signature: declaration.getText(tree) };
  });
  const index = readFileSync(new URL('../../packages/base/src/lib/tabs/index.parts.ts', import.meta.url), 'utf8');
  for (const part of parts) if (!index.includes(`Tabs${part} as ${part}`)) throw new Error(`Missing Source alias ${part}`);
  return { parts: declarations, types: source };
}
const output = new URL('./api.json', import.meta.url);
export function checkTabsApi() {
  if (readFileSync(output, 'utf8') !== JSON.stringify(extractTabsApi(), null, 2) + '\n') throw new Error('Tabs API snapshot is stale. Run node parity/tabs/docs-api.mjs');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) checkTabsApi();
  else writeFileSync(output, JSON.stringify(extractTabsApi(), null, 2) + '\n');
}
