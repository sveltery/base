// Immutable Meter trace. Derived assertions are MIT; see UPSTREAM_LICENSE.
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
const files = ['root', 'indicator', 'label', 'track', 'value'].map(part => `packages/react/src/meter/${part}/Meter${part[0].toUpperCase() + part.slice(1)}.test.tsx`);
const dependencies = files.map(file => file.replace('.test.tsx', '.tsx')).concat(['packages/react/src/meter/root/MeterRootContext.ts', 'packages/react/src/utils/useRegisteredLabelId.ts', 'packages/react/src/utils/valueToPercent.ts', 'packages/utils/src/clamp.ts', 'packages/utils/src/formatNumber.ts', 'packages/utils/src/stringifyLocale.ts', 'packages/utils/src/visuallyHidden.ts', 'packages/react/src/internals/useBaseUiId.ts', 'packages/react/src/internals/useRenderElement.tsx', 'packages/utils/src/useId.ts', 'packages/utils/src/safeReact.ts', 'packages/utils/src/useIsoLayoutEffect.ts', 'packages/react/src/internals/types.ts', 'packages/react/src/types/index.ts', 'packages/react/src/internals/createBaseUIEventDetails.ts', 'packages/react/src/internals/reasons.ts', 'packages/react/src/internals/reason-parts.ts', 'packages/react/src/internals/getStateAttributesProps.ts', 'packages/react/src/utils/resolveClassName.ts', 'packages/react/src/utils/resolveStyle.ts', 'packages/react/src/merge-props/index.ts', 'packages/react/src/merge-props/mergeProps.ts', 'packages/utils/src/useMergedRefs.ts', 'packages/utils/src/useRefWithInit.ts', 'packages/utils/src/getReactElementRef.ts', 'packages/utils/src/reactVersion.ts', 'packages/utils/src/mergeObjects.ts', 'packages/utils/src/warn.ts', 'packages/utils/src/createLogOnce.ts', 'packages/utils/src/empty.ts', 'packages/react/test/conformanceTests/utils.ts', 'packages/react/src/meter/index.ts', 'packages/react/src/meter/index.parts.ts', 'packages/react/test/describeConformance.tsx', ...['propForwarding', 'refForwarding', 'renderProp', 'className'].map(part => `packages/react/test/conformanceTests/${part}.tsx`)]);
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
const output = JSON.stringify({ upstream: { repository: 'https://github.com/mui/base-ui', tag: 'v1.8.0', commit, license: 'MIT' }, scope: 'Direct Meter source sites: 22 ordinary declarations and one parameterized site expanding to four variants. Shared describeConformance helpers are excluded from ordinary credit. This immutable source trace is not execution evidence; see ports.json and README.md.', sources, declarations }, null, 2) + '\n';
const destination = new URL('./upstream-inventory.json', import.meta.url);
if (process.argv.includes('--check')) { if (readFileSync(destination, 'utf8') !== output) throw new Error('Meter trace differs from pinned source'); }
else writeFileSync(destination, output);
console.log(`Meter source trace: ${declarations.length} declarations`);
