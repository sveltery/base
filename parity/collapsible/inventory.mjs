// Immutable Collapsible assertion trace. Derived assertions are MIT; see UPSTREAM_LICENSE.
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
const files = ['root/CollapsibleRoot.test.tsx', 'trigger/CollapsibleTrigger.test.tsx', 'panel/CollapsiblePanel.test.tsx'].map(file => `packages/react/src/collapsible/${file}`);
const dependencies = ['root/CollapsibleRoot.tsx', 'root/useCollapsibleRoot.ts', 'root/CollapsibleRootContext.ts', 'trigger/CollapsibleTrigger.tsx', 'panel/CollapsiblePanel.tsx', 'panel/useCollapsiblePanel.ts', 'root/CollapsibleRoot.spec.tsx'].map(file => `packages/react/src/collapsible/${file}`);
dependencies.push('packages/react/src/internals/useTransitionStatus.ts', 'packages/react/src/internals/useAnimationsFinished.ts', 'packages/react/src/internals/useOpenChangeComplete.tsx', 'packages/react/src/internals/use-button/useButton.ts', 'packages/utils/src/useControlled.ts', 'packages/utils/src/useStableCallback.ts', 'packages/utils/src/createLogOnce.ts');
const deferredLines = new Set([869, 932, 1003, 1063, 1130, 1413]);
const sources = [], declarations = [], conformance = [], typeAssertions = [];
for (const source of [...files, ...dependencies]) {
  const text = execFileSync('git', ['-C', root, 'show', `${commit}:${source}`], { encoding: 'utf8' });
  sources.push({ source, sha256: hash(text), url: `https://github.com/mui/base-ui/blob/${commit}/${source}` });
  if (!files.includes(source) && !source.endsWith('.spec.tsx')) continue;
  const tree = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const raw = node => node.getText(tree);
  const line = node => tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1;
  const visit = node => {
    if (ts.isCallExpression(node)) {
      let callee = node.expression;
      while (ts.isCallExpression(callee) || ts.isPropertyAccessExpression(callee)) callee = callee.expression;
      if (ts.isIdentifier(callee) && callee.text === 'describeConformance') conformance.push({ source, line: line(node), declarationSha256: hash(raw(node)) });
      if (ts.isIdentifier(callee) && callee.text === 'expectType') typeAssertions.push({ source, line: line(node), text: raw(node) });
      const body = node.arguments.find(arg => ts.isArrowFunction(arg) || ts.isFunctionExpression(arg));
      const title = node.arguments[0];
      if (ts.isIdentifier(callee) && callee.text === 'it' && body && (ts.isStringLiteralLike(title) || ts.isTemplateExpression(title))) {
        const assertions = [];
        const find = child => {
          if (ts.isCallExpression(child) && /^expect\(/.test(raw(child)) && !ts.isPropertyAccessExpression(child.parent)) assertions.push({ line: line(child), text: raw(child) });
          ts.forEachChild(child, find);
        };
        find(body.body);
        const deferred = source.endsWith('CollapsiblePanel.test.tsx') && deferredLines.has(line(node));
        const variants = ts.isTemplateExpression(title) ? ['Enter', 'Space'] : [null];
        declarations.push({ id: `${source}:${line(node)}`, source, line: line(node), title: ts.isStringLiteralLike(title) ? title.text : raw(title), expression: raw(node.expression), variants, bodySha256: hash(raw(body.body)), assertions, scope: deferred ? 'deferred-react-activity' : 'portable', status: 'unported', port: null });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
}
const output = JSON.stringify({ upstream: { repository: 'https://github.com/mui/base-ui', tag: 'v1.8.0', commit, license: 'MIT' }, scope: '47 ordinary declaration sites / 49 variants. Portable scope: 41 sites / 43 variants. Six React.Activity declarations are deferred, including Panel:1413. React-19 guarded beforematch declarations 1205/1287/1349/1474 are portable. Three conformance helper calls and ten type assertions are separate and earn zero ordinary declaration credit. This source trace is not execution evidence.', sources, declarations, conformance, typeAssertions }, null, 2) + '\n';
const destination = new URL('./upstream-inventory.json', import.meta.url);
if (process.argv.includes('--check')) { if (readFileSync(destination, 'utf8') !== output) throw new Error('Collapsible trace differs from pinned source'); }
else writeFileSync(destination, output);
console.log(`Collapsible source trace: ${declarations.length} declarations / ${declarations.reduce((count, item) => count + item.variants.length, 0)} variants; ${conformance.length} conformance calls; ${typeAssertions.length} type assertions`);
