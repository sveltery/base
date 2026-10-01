// Toast-only read-only trace. Derived excerpts are MIT; see ./UPSTREAM_LICENSE.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const root = path.resolve(process.argv[2] ?? '../base-ui-upstream');
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
if (execFileSync('git', ['rev-parse', `${pin}^{commit}`], { cwd: root, encoding: 'utf8' }).trim() !== pin) throw new Error('Missing pinned upstream commit.');
const prefix = 'packages/react/src/toast/';
const support = ['packages/react/test/describeConformance.tsx', ...['className', 'propForwarding', 'refForwarding', 'renderProp'].map(name => `packages/react/test/conformanceTests/${name}.tsx`)];
const dependencies = ['packages/utils/src/generateId.ts', 'packages/utils/src/useTimeout.ts', 'packages/utils/src/store/ReactStore.ts', 'packages/react/src/internals/useOpenChangeComplete.tsx', 'packages/react/src/floating-ui-react/utils/markOthers.ts'];
const files = execFileSync('git', ['ls-tree', '-r', '--name-only', pin, prefix], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(file => /\.tsx?$/.test(file));
const sources = [], declarations = [], conformanceCalls = [], supportDeclarations = [], typeSpecs = [];
for (const source of [...files, ...support, ...dependencies]) {
  const text = execFileSync('git', ['show', `${pin}:${source}`], { cwd: root, encoding: 'utf8' });
  sources.push({ source, sha256: hash(text), url: `https://github.com/mui/base-ui/blob/${pin}/${source}` });
  if (!/\.(test|spec)\.tsx?$/.test(source) && !support.includes(source) && !source.endsWith('/utils/test-utils.tsx')) continue;
  const sf = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const raw = node => node.getText(sf);
  const line = node => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
  const info = node => {
    if (!ts.isCallExpression(node)) return null;
    let callee = node.expression;
    while (ts.isPropertyAccessExpression(callee) || ts.isCallExpression(callee)) callee = callee.expression;
    if (!ts.isIdentifier(callee) || !['it', 'test', 'describe'].includes(callee.text)) return null;
    const title = node.arguments[0], callback = node.arguments.find(arg => ts.isArrowFunction(arg) || ts.isFunctionExpression(arg));
    if (!title || !(ts.isStringLiteralLike(title) || ts.isTemplateExpression(title)) || !callback) return null;
    return { kind: callee.text === 'describe' ? 'suite' : 'test', title: ts.isStringLiteralLike(title) ? title.text : raw(title), expression: raw(node.expression), callback };
  };
  const value = node => {
    if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node)) return value(node.expression);
    if (ts.isArrayLiteralExpression(node)) return node.elements.map(value);
    if (ts.isStringLiteralLike(node)) return node.text;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    return { source: raw(node) };
  };
  const walk = node => {
    if (ts.isCallExpression(node) && raw(node.expression) === 'describeConformance') conformanceCalls.push({ source, line: line(node), invocation: raw(node), status: 'unported', note: 'Helper source guards/only/skip and part topology must be evaluated by a real mounting adapter; no inferred conformance credit.' });
    if (ts.isFunctionDeclaration(node)) {
      let inTest = false;
      for (let parent = node.parent; parent; parent = parent.parent) if (info(parent)?.kind === 'test') inTest = true;
      if (!inTest) supportDeclarations.push({ source, line: line(node), name: node.name?.text, text: raw(node) });
    }
    const current = info(node);
    if (current?.kind === 'test') {
      const suites = [], parameterAxes = [], conditions = [], guards = [], assertions = [], fixtureCalls = [];
      // Include the leaf itself: Toast Root's real-pointer it.each is a leaf factory.
      for (let ancestor = node; ancestor; ancestor = ancestor.parent) {
        const declaration = info(ancestor);
        if (declaration?.kind === 'suite') suites.unshift(declaration.title);
        if (declaration && /skip|runIf/.test(declaration.expression)) guards.unshift(declaration.expression);
        if (ts.isIfStatement(ancestor)) conditions.unshift(raw(ancestor.expression));
        if (ts.isCallExpression(ancestor)) {
          const expr = ancestor.expression;
          if (ts.isPropertyAccessExpression(expr) && expr.name.text === 'forEach') parameterAxes.unshift({ expression: raw(expr.expression), values: value(expr.expression) });
          if (declaration && ts.isCallExpression(expr) && ts.isPropertyAccessExpression(expr.expression) && ['for', 'each'].includes(expr.expression.name.text)) parameterAxes.unshift({ expression: raw(expr.arguments[0]), values: value(expr.arguments[0]) });
        }
      }
      const visit = child => {
        if (ts.isCallExpression(child) && /^expect\s*\(/.test(raw(child)) && !ts.isPropertyAccessExpression(child.parent)) assertions.push({ line: line(child), text: raw(child) });
        if (ts.isCallExpression(child)) {
          const expr = raw(child.expression);
          if (/^(render|renderToString|rerender|setProps|hydrate|user\.|fireEvent\.|clock\.|vi\.|store\.|toastManager\.|simulateSwipe|expectToastMetadataToMatchToasts)/.test(expr)) fixtureCalls.push({ line: line(child), text: raw(child) });
          if (expr === 'skip') guards.push(`upstream skip() at ${line(child)}; retain enclosing control flow in a port`);
        }
        ts.forEachChild(child, visit);
      };
      visit(current.callback.body);
      let variants = [{}];
      for (const axis of parameterAxes) {
        if (!Array.isArray(axis.values)) throw new Error(`Unresolved parameter axis at ${source}:${line(node)}`);
        variants = variants.flatMap(previous => axis.values.map(entry => ({ ...previous, [axis.expression]: entry })));
      }
      declarations.push({ id: `${source}:${line(node)}`, source, line: line(node), endLine: sf.getLineAndCharacterOfPosition(node.end).line + 1, suites, title: current.title, parameterAxes, variants, sourceConditions: conditions, upstreamGuards: guards, assertions, fixtureCalls, bodySha256: hash(raw(current.callback.body)), status: 'unported', port: null });
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  if (/\.spec\.tsx?$/.test(source)) typeSpecs.push({ source, sha256: hash(text), text, status: 'unported', port: null });
}
const primary = declarations.filter(item => item.source.startsWith(prefix));
const output = { upstream: { repository: 'https://github.com/mui/base-ui', tag: 'v1.8.0', commit: pin, license: 'MIT', notice: 'UPSTREAM_LICENSE' }, scope: 'Toast-only declarations/specs, including later anchored and gesture work as explicitly unported. Direct expect expressions are not called-helper coverage. Variants expand literal each/for/forEach axes, not loop iterations. Shared conformance helper declarations stay separate and are not multiplied by parts. All statuses are immutable source placeholders; see prerequisites.json for executed test-only evidence. No component or whole-library parity denominator.', sources, conformanceCalls, supportDeclarations, typeSpecs, declarations, totals: { toastDeclarations: primary.length, toastVariantRecords: primary.reduce((sum, item) => sum + item.variants.length, 0), conformanceHelperDeclarations: declarations.length - primary.length, typeSpecFiles: typeSpecs.length } };
const serialized = `${JSON.stringify(output, null, 2)}\n`;
const outputPath = new URL('./upstream-inventory.json', import.meta.url);
if (process.argv.includes('--check')) {
  if (fs.readFileSync(outputPath, 'utf8') !== serialized) throw new Error('Committed Toast inventory differs from pinned source.');
} else fs.writeFileSync(outputPath, serialized);
console.log(JSON.stringify(output.totals));
