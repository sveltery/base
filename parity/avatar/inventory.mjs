// Immutable Avatar assertion trace. Derived assertions are MIT; see UPSTREAM_LICENSE.
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
const files = ['root/AvatarRoot.test.tsx', 'image/AvatarImage.test.tsx', 'fallback/AvatarFallback.test.tsx'].map(file => `packages/react/src/avatar/${file}`);
const dependencies = ['root/AvatarRoot.tsx', 'root/AvatarRootContext.ts', 'root/stateAttributesMapping.ts', 'image/AvatarImage.tsx', 'image/useImageLoadingStatus.ts', 'fallback/AvatarFallback.tsx', 'Avatar.spec.tsx', 'index.ts', 'index.parts.ts'].map(file => `packages/react/src/avatar/${file}`);
dependencies.push('packages/react/src/internals/useTransitionStatus.ts', 'packages/react/src/internals/useAnimationsFinished.ts', 'packages/react/src/internals/useOpenChangeComplete.tsx', 'packages/react/src/internals/useRenderElement.tsx', 'packages/utils/src/useTimeout.ts', 'packages/utils/src/useStableCallback.ts');
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

        const variants = [null];
        declarations.push({ id: `${source}:${line(node)}`, source, line: line(node), title: ts.isStringLiteralLike(title) ? title.text : raw(title), expression: raw(node.expression), variants, bodySha256: hash(raw(body.body)), assertions, scope: 'portable', status: 'unported', port: null });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
}
const output = JSON.stringify({ upstream: { repository: 'https://github.com/mui/base-ui', tag: 'v1.8.0', commit, license: 'MIT' }, scope: '44 ordinary declaration sites (Image 34 / Fallback 10 / Root 0) and 44 variants, with no parameterized declarations. Three conformance helper calls and six type assertions are separate and earn zero ordinary declaration credit. Supplemental cases have no ordinary credit. This source trace is not execution evidence.', sources, declarations, conformance, typeAssertions }, null, 2) + '\n';
const destination = new URL('./upstream-inventory.json', import.meta.url);
if (process.argv.includes('--check')) { if (readFileSync(destination, 'utf8') !== output) throw new Error('Avatar trace differs from pinned source'); }
else writeFileSync(destination, output);
console.log(`Avatar source trace: ${declarations.length} declarations / ${declarations.reduce((count, item) => count + item.variants.length, 0)} variants; ${conformance.length} conformance calls; ${typeAssertions.length} type assertions`);
