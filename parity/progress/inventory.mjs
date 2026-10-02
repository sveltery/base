// Immutable Progress trace. Derived assertions are MIT; see UPSTREAM_LICENSE.
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
const files = ['root', 'indicator', 'label', 'track', 'value'].map(part => `packages/react/src/progress/${part}/Progress${part[0].toUpperCase() + part.slice(1)}.test.tsx`);
const dependencies = files.map(file => file.replace('.test.tsx', '.tsx')).concat(['packages/react/src/progress/root/ProgressRootContext.tsx', 'packages/react/src/progress/root/stateAttributesMapping.ts', 'packages/react/src/utils/useRegisteredLabelId.ts', 'packages/react/src/utils/valueToPercent.ts', 'packages/utils/src/clamp.ts', 'packages/utils/src/formatNumber.ts', 'packages/utils/src/stringifyLocale.ts', 'packages/utils/src/visuallyHidden.ts', 'packages/react/src/internals/useBaseUiId.ts', 'packages/react/src/internals/useRenderElement.tsx', 'packages/utils/src/useId.ts', 'packages/react/src/progress/index.ts', 'packages/react/src/progress/index.parts.ts', ...['root', 'indicator', 'label', 'track', 'value'].map(part => `packages/react/src/progress/${part}/Progress${part[0].toUpperCase() + part.slice(1)}DataAttributes.ts`), 'packages/react/test/describeConformance.tsx', ...['propForwarding', 'refForwarding', 'renderProp', 'className'].map(part => `packages/react/test/conformanceTests/${part}.tsx`)]);
const sources = [], declarations = [];
for (const source of [...files, ...dependencies]) {
  const text = execFileSync('git', ['-C', root, 'show', `${commit}:${source}`], { encoding: 'utf8' });
  sources.push({ source, sha256: hash(text), url: `https://github.com/mui/base-ui/blob/${commit}/${source}` });
  if (!files.includes(source)) continue;
  const tree = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const raw = node => node.getText(tree);
  const line = node => tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1;
  const visit = node => {
    if (ts.isCallExpression(node)) {
      let callee = node.expression;
      while (ts.isCallExpression(callee) || ts.isPropertyAccessExpression(callee)) callee = callee.expression;
      const body = node.arguments.find(arg => ts.isArrowFunction(arg) || ts.isFunctionExpression(arg));
      const title = node.arguments[0];
      if (ts.isIdentifier(callee) && callee.text === 'it' && body && (ts.isStringLiteralLike(title) || ts.isTemplateExpression(title))) {
        const assertions = [];
        const find = child => {
          if (ts.isCallExpression(child) && /^expect\(/.test(raw(child)) && !ts.isPropertyAccessExpression(child.parent)) assertions.push({ line: line(child), text: raw(child) });
          ts.forEachChild(child, find);
        };
        find(body.body);
        declarations.push({ id: `${source}:${line(node)}`, source, line: line(node), title: ts.isStringLiteralLike(title) ? title.text : raw(title), expression: raw(node.expression), bodySha256: hash(raw(body.body)), assertions, status: 'unported', port: null });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
}
const output = JSON.stringify({ upstream: { repository: 'https://github.com/mui/base-ui', tag: 'v1.8.0', commit, license: 'MIT' }, scope: 'Direct Progress source sites: 20 ordinary declarations and three parameterized sites expanding to seven variants. Shared describeConformance helpers are excluded from ordinary credit. This immutable source trace is not execution evidence; see ports.json and README.md.', sources, declarations }, null, 2) + '\n';
const destination = new URL('./upstream-inventory.json', import.meta.url);
if (process.argv.includes('--check')) { if (readFileSync(destination, 'utf8') !== output) throw new Error('Progress trace differs from pinned source'); }
else writeFileSync(destination, output);
console.log(`Progress source trace: ${declarations.length} declarations`);
