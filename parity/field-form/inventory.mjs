// Immutable Field/Form/Fieldset assertion trace. Upstream-derived assertions are MIT.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const commit = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const root = resolve(process.argv[2] ?? '../direction-provider-upstream');
const hash = value => createHash('sha256').update(value).digest('hex');
const familyFiles = execFileSync('git', ['-C', root, 'ls-tree', '-r', '--name-only', commit,
  'packages/react/src/field', 'packages/react/src/form', 'packages/react/src/fieldset'], { encoding: 'utf8' }).trim().split('\n');
const dependencyFiles = [
  'packages/react/src/input/Input.tsx',
  'packages/react/src/internals/field-root-context/FieldRootContext.ts',
  'packages/react/src/internals/field-constants/constants.ts',
  'packages/react/src/internals/field-register-control/useFieldControlRegistration.ts',
  'packages/react/src/internals/field-register-control/useRegisterFieldControl.ts',
  'packages/react/src/internals/form-context/FormContext.ts',
  'packages/react/src/internals/labelable-provider/LabelableContext.ts',
  'packages/react/src/internals/labelable-provider/LabelableProvider.tsx',
  'packages/react/src/internals/labelable-provider/useLabelableId.ts',
  'packages/react/src/internals/labelable-provider/useLabel.ts',
  'packages/react/src/internals/useRenderElement.tsx',
  'packages/react/src/internals/useTransitionStatus.ts',
  'packages/react/src/internals/useOpenChangeComplete.tsx',
  'packages/react/src/internals/useAnimationsFinished.ts',
  'packages/react/src/internals/useValueChanged.ts',
  'packages/react/src/utils/useRegisteredLabelId.ts',
  'packages/utils/src/useControlled.ts',
  'packages/utils/src/useTimeout.ts',
  'packages/utils/src/useStableCallback.ts',
];
const declarations = [], conformance = [], typeAssertions = [], sources = [], parameterizedFactories = [];
for (const source of [...familyFiles, ...dependencyFiles]) {
  const text = execFileSync('git', ['-C', root, 'show', `${commit}:${source}`], { encoding: 'utf8' });
  const tree = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const raw = node => node.getText(tree);
  const line = node => tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1;
  const imports = tree.statements.filter(ts.isImportDeclaration).map(node => node.moduleSpecifier.text);
  sources.push({ source, sha256: hash(text), url: `https://github.com/mui/base-ui/blob/${commit}/${source}`, imports });
  if (!/\.(test|spec)\.tsx$/.test(source)) continue;
  const visit = node => {
    if (ts.isCallExpression(node)) {
      let callee = node.expression;
      const parameterized = ts.isPropertyAccessExpression(callee) && ['each', 'for'].includes(callee.name.text);
      while (ts.isCallExpression(callee) || ts.isPropertyAccessExpression(callee)) callee = callee.expression;
      if (ts.isIdentifier(callee) && callee.text === 'describeConformance') conformance.push({ source, line: line(node), declarationSha256: hash(raw(node)), text: raw(node) });
      if (ts.isIdentifier(callee) && callee.text === 'expectType') typeAssertions.push({ source, line: line(node), text: raw(node), status: 'unported' });
      if (parameterized && ts.isIdentifier(callee) && ['it', 'test'].includes(callee.text)) parameterizedFactories.push({ source, line: line(node), text: raw(node) });
      const body = node.arguments.find(argument => ts.isArrowFunction(argument) || ts.isFunctionExpression(argument));
      const title = node.arguments[0];
      if (!parameterized && ts.isIdentifier(callee) && ['it', 'test'].includes(callee.text) && body && (ts.isStringLiteralLike(title) || ts.isTemplateExpression(title))) {
        const assertions = [];
        const find = child => {
          if (ts.isCallExpression(child) && /^expect\(/.test(raw(child)) && !ts.isPropertyAccessExpression(child.parent)) assertions.push({ line: line(child), text: raw(child) });
          ts.forEachChild(child, find);
        };
        find(body.body);
        declarations.push({ id: `${source}:${line(node)}`, source, line: line(node), title: ts.isStringLiteralLike(title) ? title.text : raw(title),
          expression: raw(node.expression), titleKind: ts.isTemplateExpression(title) ? 'template' : 'literal',
          bodySha256: hash(raw(body.body)), assertions, status: 'unported', port: null });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
}
const output = JSON.stringify({ upstream: { repository: 'https://github.com/mui/base-ui', tag: 'v1.8.0', commit, license: 'MIT' },
  scope: '209 ordinary declaration sites: Field main 159, separate React17 Field Root 4, Form 36, Fieldset 10. Nine conformance calls and three type assertions are separate. Template sites are sites, not parameterized execution totals. Selected runtime sources include direct import inventories; this is not a claim that every transitive React/Floating dependency is ported. All sites are unported in this immutable source trace; execution and deferral decisions belong in a separate ledger.',
  sources, declarations, conformance, typeAssertions, parameterizedFactories }, null, 2) + '\n';
const destination = new URL('./upstream-inventory.json', import.meta.url);
if (process.argv.includes('--check')) {
  if (readFileSync(destination, 'utf8') !== output) throw new Error('Field/Form source trace differs from immutable source');
} else writeFileSync(destination, output);
console.log(`Field/Form source trace: ${declarations.length} ordinary sites; ${conformance.length} conformance calls; ${typeAssertions.length} type assertions`);
