import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(resolve(root, 'packages/base/package.json'));
const ts = require('typescript');
export function extractTypeScript(component) {
  // Svelte attributes can contain quoted > characters (for example generic bounds).
  const tags = component.matchAll(/<script\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/script>/g);
  for (const [, attributes, script] of tags) {
    if (/\blang\s*=\s*(["'])ts\1/.test(attributes)) return script;
  }
  return undefined;
}
export function extractDialogApi() {
  const source = readFileSync(
    resolve(root, 'packages/base/src/lib/dialog/types.ts'),
    'utf8',
  );
  const ast = ts.createSourceFile(
    'types.ts',
    source,
    ts.ScriptTarget.Latest,
    true,
  );
  const rootProps = ast.statements.find(
    (node) => ts.isInterfaceDeclaration(node) && node.name.text === 'RootProps',
  );
  if (!rootProps) throw new Error('RootProps not found');
  const props = rootProps.members.map((node) => ({
    name: node.name.getText(ast),
    type: node.type.getText(ast),
    optional: !!node.questionToken,
  }));
  const parts = [
    'Root',
    'Trigger',
    'Portal',
    'Backdrop',
    'Viewport',
    'Popup',
    'Title',
    'Description',
    'Close',
  ].map((name) => {
    const component = readFileSync(
      resolve(root, `packages/base/src/lib/dialog/${name}.svelte`),
      'utf8',
    );
    const script = extractTypeScript(component);
    if (!script) throw new Error(`Missing script: ${name}`);
    const file = ts.createSourceFile(
      `${name}.ts`,
      script,
      ts.ScriptTarget.Latest,
      true,
    );
    let signature;
    function visit(node) {
      if (
        ts.isVariableDeclaration(node) &&
        node.initializer &&
        ts.isCallExpression(node.initializer) &&
        node.initializer.expression.getText(file) === '$props'
      )
        signature = node.type?.getText(file);
      ts.forEachChild(node, visit);
    }
    visit(file);
    if (!signature) throw new Error(`Missing public props: ${name}`);
    return { name, signature };
  });
  return { props, parts, types: source };
}
const output = resolve(root, 'apps/fixtures/src/lib/docs/dialog-api.json');
export function checkDialogApi() {
  if (
    readFileSync(output, 'utf8') !==
    JSON.stringify(extractDialogApi(), null, 2) + '\n'
  )
    throw new Error('Dialog docs API is stale. Run node scripts/docs-api.mjs');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) checkDialogApi();
  else
    writeFileSync(output, JSON.stringify(extractDialogApi(), null, 2) + '\n');
}
