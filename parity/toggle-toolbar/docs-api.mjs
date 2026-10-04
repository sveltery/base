// Adapt existing Accordion API extraction to actual owned exported types; consistency only, zero parity credit.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const ts = require('typescript');
export function extractNavigationApi() {
  const types = {};
  const parts = [];
  for (const module of ['toggle', 'toggle-group', 'toolbar']) {
    const source = readFileSync(new URL(`../../packages/base/src/lib/${module}/types.ts`, import.meta.url), 'utf8');
    types[module] = source;
    const ast = ts.createSourceFile('types.ts', source, ts.ScriptTarget.Latest, true);
    const exports = readFileSync(new URL(`../../packages/base/src/lib/${module}/${module === 'toolbar' ? 'index.parts.ts' : 'index.ts'}`, import.meta.url), 'utf8');
    const names = [...exports.matchAll(/export \{ default as (\w+) \}/g)].map(match => match[1]);
    for (const name of names) {
      const typeName = module === 'toolbar' ? `Toolbar${name}Props` : `${name}Props`;
      const declaration = ast.statements.find(node => (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) && node.name.text === typeName);
      if (!declaration) throw new Error(`Missing exported type ${typeName}`);
      parts.push({ module, name, signature: declaration.getText(ast) });
    }
  }
  return { parts, types };
}
const output = new URL('./api.json', import.meta.url);
export function checkNavigationApi() {
  if (readFileSync(output, 'utf8') !== JSON.stringify(extractNavigationApi(), null, 2) + '\n') throw new Error('Navigation API snapshot is stale. Run node parity/toggle-toolbar/docs-api.mjs');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) checkNavigationApi();
  else writeFileSync(output, JSON.stringify(extractNavigationApi(), null, 2) + '\n');
}
