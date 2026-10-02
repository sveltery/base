// Immutable Accordion assertion trace. Derived assertions are MIT; see UPSTREAM_LICENSE.
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
const parts = ['root', 'item', 'header', 'trigger', 'panel'];
const files = parts.map(part => `packages/react/src/accordion/${part}/Accordion${part[0].toUpperCase() + part.slice(1)}.test.tsx`);
const dependencies = execFileSync('git', ['-C', root, 'ls-tree', '-r', '--name-only', commit, 'packages/react/src/accordion'], { encoding: 'utf8' }).trim().split('\n').filter(file => !files.includes(file));
dependencies.push('packages/react/src/collapsible/root/useCollapsibleRoot.ts', 'packages/react/src/collapsible/panel/useCollapsiblePanel.ts', 'packages/react/src/internals/useTransitionStatus.ts', 'packages/react/src/internals/useAnimationsFinished.ts', 'packages/react/src/internals/useOpenChangeComplete.tsx', 'packages/react/src/internals/use-button/useButton.ts', 'packages/react/src/internals/composite/list/CompositeList.tsx', 'packages/react/src/internals/composite/list/useCompositeListItem.ts', 'packages/react/src/internals/getStateAttributesProps.ts', 'packages/utils/src/empty.ts', 'packages/utils/src/useControlled.ts', 'packages/utils/src/useStableCallback.ts');
const sources = [], declarations = [], parameterized = [], conformance = [], typeAssertions = [], expectedErrors = [];
for (const source of [...files, ...dependencies]) {
  const text = execFileSync('git', ['-C', root, 'show', `${commit}:${source}`], { encoding: 'utf8' });
  sources.push({ source, sha256: hash(text), url: `https://github.com/mui/base-ui/blob/${commit}/${source}` });
  if (!files.includes(source) && !source.endsWith('.spec.tsx')) continue;
  const tree = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const raw = node => node.getText(tree);
  const line = node => tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1;
  for (const [index, value] of text.split('\n').entries()) if (value.includes('@ts-expect-error')) expectedErrors.push({ source, line: index + 1, text: value.trim(), assertion: text.split('\n')[index + 1].trim() });
  const visit = node => {
    if (ts.isCallExpression(node)) {
      let callee = node.expression;
      while (ts.isCallExpression(callee) || ts.isPropertyAccessExpression(callee)) callee = callee.expression;
      if (ts.isIdentifier(callee) && callee.text === 'describeConformance') conformance.push({ source, line: line(node), declarationSha256: hash(raw(node)) });
      if (ts.isIdentifier(callee) && callee.text === 'expectType') typeAssertions.push({ source, line: line(node), text: raw(node), assertionSha256: hash(raw(node)) });
      const body = node.arguments.find(arg => ts.isArrowFunction(arg) || ts.isFunctionExpression(arg));
      const title = node.arguments[0];
      if (ts.isIdentifier(callee) && callee.text === 'it' && body && (ts.isStringLiteralLike(title) || ts.isTemplateExpression(title))) {
        const assertions = [];
        const find = child => {
          if (ts.isCallExpression(child) && /^expect\(/.test(raw(child)) && !ts.isPropertyAccessExpression(child.parent)) assertions.push({ line: line(child), text: raw(child), assertionSha256: hash(raw(child)) });
          ts.forEachChild(child, find);
        };
        find(body.body);
        const deferred = source.endsWith('AccordionPanel.test.tsx') && line(node) === 201;
        const isParameterized = raw(node.expression).startsWith('it.each(');
        const variants = isParameterized ? ['root', 'item'] : source.endsWith('AccordionRoot.test.tsx') && line(node) === 496 ? [{ nativeButton: true, key: 'Enter' }, { nativeButton: true, key: 'Space' }, { nativeButton: false, key: 'Enter' }, { nativeButton: false, key: 'Space' }] : source.endsWith('AccordionRoot.test.tsx') && line(node) === 541 ? [{ nativeButton: true }, { nativeButton: false }] : [null];
        const record = { id: `${source}:${line(node)}`, source, line: line(node), title: ts.isStringLiteralLike(title) ? title.text : raw(title), expression: raw(node.expression), variants, bodySha256: hash(raw(body.body)), assertions, scope: deferred ? 'deferred-react-activity' : 'portable', status: 'unported', port: null };
        (isParameterized ? parameterized : declarations).push(record);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
}
const output = JSON.stringify({ upstream: { repository: 'https://github.com/mui/base-ui', tag: 'v1.8.0', commit, license: 'MIT' }, scope: '39 ordinary declaration sites / 43 variants. Portable scope: 38 sites / 42 variants. Panel:201 React.Activity is deferred. The disabled parameterized declaration has two variants, separate from ordinary counts. Five conformance helper calls, seven type assertions and one expected type error are separate and earn zero ordinary declaration credit. This immutable source trace is not execution evidence.', sources, declarations, parameterized, conformance, typeAssertions, expectedErrors }, null, 2) + '\n';
const destination = new URL('./upstream-inventory.json', import.meta.url);
if (process.argv.includes('--check')) { if (readFileSync(destination, 'utf8') !== output) throw new Error('Accordion trace differs from pinned source'); }
else writeFileSync(destination, output);
console.log(`Accordion source trace: ${declarations.length} declarations / ${declarations.reduce((count, item) => count + item.variants.length, 0)} variants; ${parameterized.length} parameterized declarations; ${conformance.length} conformance calls; ${typeAssertions.length} type assertions; ${expectedErrors.length} expected errors`);
