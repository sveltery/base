// Immutable useRender/public and useRenderElement/internal assertion trace. MIT: UPSTREAM_LICENSE.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const commit = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const root = resolve(process.argv[2] ?? '../base-ui-upstream');
const hash = text => createHash('sha256').update(text).digest('hex');
const files = ['packages/react/src/use-render/useRender.test.tsx', 'packages/react/src/internals/useRenderElement.test.tsx'];
const typeFile = 'packages/react/src/use-render/useRender.spec.tsx';
const dependencies = ['packages/react/src/use-render/useRender.ts', 'packages/react/src/use-render/index.ts', 'packages/react/src/internals/useRenderElement.tsx', 'packages/react/src/internals/getStateAttributesProps.ts', 'packages/react/src/internals/types.ts', 'packages/react/src/utils/resolveClassName.ts', 'packages/react/src/utils/resolveStyle.ts', 'packages/react/src/merge-props/mergeProps.ts', 'packages/react/src/merge-props/index.ts', 'packages/utils/src/useMergedRefs.ts', 'packages/utils/src/useRefWithInit.ts', 'packages/utils/src/getReactElementRef.ts', 'packages/utils/src/reactVersion.ts', 'packages/utils/src/mergeObjects.ts', 'packages/utils/src/empty.ts', 'packages/utils/src/warn.ts', 'packages/utils/src/createLogOnce.ts'];
const sources = [], declarations = [], types = [];
for (const source of [...files, typeFile, ...dependencies]) {
  const text = execFileSync('git', ['-C', root, 'show', `${commit}:${source}`], { encoding: 'utf8' });
  sources.push({ source, sha256: hash(text), url: `https://github.com/mui/base-ui/blob/${commit}/${source}` });
  if (!files.includes(source) && source !== typeFile) continue;
  const tree = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const raw = node => node.getText(tree), line = node => tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1;
  function visit(node) {
    if (ts.isCallExpression(node)) {
      let callee = node.expression;
      while (ts.isCallExpression(callee) || ts.isPropertyAccessExpression(callee)) callee = callee.expression;
      if (ts.isIdentifier(callee) && callee.text === 'expectType') types.push({ source, line: line(node), assertion: raw(node), status: 'divergent-unported', port: null });
      const body = node.arguments.find(arg => ts.isArrowFunction(arg) || ts.isFunctionExpression(arg));
      const title = node.arguments[0];
      if (ts.isIdentifier(callee) && callee.text === 'it' && body && ts.isStringLiteralLike(title)) {
        const assertions = [];
        function find(child) {
          if (ts.isCallExpression(child) && /^expect\(/.test(raw(child)) && !ts.isPropertyAccessExpression(child.parent)) assertions.push({ line: line(child), text: raw(child) });
          ts.forEachChild(child, find);
        }
        find(body.body);
        declarations.push({ id: `${source}:${line(node)}`, source, line: line(node), title: title.text, expression: raw(node.expression), bodySha256: hash(raw(body.body)), assertions, status: 'unported', port: null });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
}
const output = JSON.stringify({ upstream: { repository: 'https://github.com/mui/base-ui', tag: 'v1.8.0', commit, license: 'MIT' }, scope: 'Public useRender: 14 ordinary sites/14 variants; internal useRenderElement: 33 ordinary sites/36 variants (one four-row parameterization). No conformance calls. Seven ReactElement/null return assertions remain divergent/unported and earn zero unchanged type credit. Source trace is not execution evidence.', sources, declarations, typeAssertions: types }, null, 2) + '\n';
const destination = new URL('./upstream-inventory.json', import.meta.url);
if (process.argv.includes('--check')) { if (readFileSync(destination, 'utf8') !== output) throw new Error('useRender trace differs from pinned source'); }
else writeFileSync(destination, output);
console.log(`useRender source trace: ${declarations.length} declarations, ${types.length} divergent type assertions`);
