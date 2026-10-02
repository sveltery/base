// Immutable DirectionProvider assertion trace. Derived assertions are MIT; see UPSTREAM_LICENSE.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const commit = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const root = resolve(process.argv[2] ?? '../direction-provider-upstream');
const hash = text => createHash('sha256').update(text).digest('hex');
const files = ['DirectionProvider.test.tsx', 'DirectionProvider.spec.tsx', 'DirectionProvider.tsx', 'index.ts', 'index.parts.ts'].map(file => `packages/react/src/direction-provider/${file}`);
files.push('packages/react/src/internals/direction-context/DirectionContext.tsx');
const sources = [], declarations = [], typeAssertions = [];
for (const source of files) {
  const text = execFileSync('git', ['-C', root, 'show', `${commit}:${source}`], { encoding: 'utf8' });
  sources.push({ source, sha256: hash(text), url: `https://github.com/mui/base-ui/blob/${commit}/${source}` });
  if (!source.endsWith('.test.tsx') && !source.endsWith('.spec.tsx')) continue;
  const tree = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const raw = node => node.getText(tree);
  const line = node => tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1;
  const visit = node => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (ts.isIdentifier(callee) && callee.text === 'expectType') typeAssertions.push({ id: `${source}:${line(node)}`, source, line: line(node), text: raw(node), status: 'unported', port: null });
      const body = node.arguments.find(arg => ts.isArrowFunction(arg) || ts.isFunctionExpression(arg));
      const title = node.arguments[0];
      if (ts.isIdentifier(callee) && callee.text === 'it' && body && ts.isStringLiteralLike(title)) {
        const assertions = [];
        const find = child => {
          if (ts.isCallExpression(child) && /^expect\(/.test(raw(child)) && !ts.isPropertyAccessExpression(child.parent)) assertions.push({ line: line(child), text: raw(child) });
          ts.forEachChild(child, find);
        };
        find(body.body);
        declarations.push({ id: `${source}:${line(node)}`, source, line: line(node), title: title.text, bodySha256: hash(raw(body.body)), assertions, status: 'unported', port: null });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
}
const output = JSON.stringify({ upstream: { repository: 'https://github.com/mui/base-ui', tag: 'v1.8.0', commit, license: 'MIT' }, scope: 'Two ordinary declarations, zero conformance calls, and two separate type assertions. The primitive useDirection return-type assertion diverges under the explicitly recorded Svelte callable-reader decision and earns no unchanged type parity credit. This immutable source trace is not execution evidence.', sources, declarations, typeAssertions }, null, 2) + '\n';
const destination = new URL('./upstream-inventory.json', import.meta.url);
if (process.argv.includes('--check')) {
  if (readFileSync(destination, 'utf8') !== output) throw new Error('DirectionProvider trace differs from pinned source');
} else writeFileSync(destination, output);
console.log(`DirectionProvider source trace: ${declarations.length} ordinary declarations / ${typeAssertions.length} separate type assertions`);
