// API snapshot consistency only; this does not establish upstream parity.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const parts = ['Root', 'Item', 'Header', 'Trigger', 'Panel'];
export function extractAccordionApi() {
  const source = readFileSync(new URL('../../packages/base/src/lib/accordion/types.ts', import.meta.url), 'utf8');
  const tree = ts.createSourceFile('types.ts', source, ts.ScriptTarget.Latest, true);
  const declarations = parts.map(name => {
    const declaration = tree.statements.find(node => (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && node.name.text === `Accordion${name}Props`);
    if (!declaration) throw new Error(`Missing Accordion${name}Props`);
    return { name, signature: declaration.getText(tree) };
  });
  const index = readFileSync(new URL('../../packages/base/src/lib/accordion/index.parts.ts', import.meta.url), 'utf8');
  for (const part of parts) if (!new RegExp(`export \\{ default as ${part} \\}`).test(index)) throw new Error(`Missing named part ${part}`);
  return { parts: declarations, types: source };
}
const output = new URL('./api.json', import.meta.url);
export function checkAccordionApi() {
  if (readFileSync(output, 'utf8') !== JSON.stringify(extractAccordionApi(), null, 2) + '\n') throw new Error('Accordion API snapshot is stale. Run node parity/accordion/docs-api.mjs');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) checkAccordionApi();
  else writeFileSync(output, JSON.stringify(extractAccordionApi(), null, 2) + '\n');
}
