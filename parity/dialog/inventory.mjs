// Dialog tracing only. No upstream code is executed by this inventory.
// Derived test excerpts retain the MIT notice in ./UPSTREAM_LICENSE.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import ts from '../../packages/base/node_modules/typescript/lib/typescript.js';

const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const root = path.resolve(process.argv[2] ?? '../base-ui-upstream');
if (execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim() !== pin) {
  throw new Error('Upstream checkout must be at the exact pinned commit.');
}
const hash = (text) => crypto.createHash('sha256').update(text).digest('hex');
const dialog = 'packages/react/src/dialog';
const files = fs.readdirSync(path.join(root, dialog), { recursive: true })
  .filter((file) => /\.(test|spec)\.tsx$/.test(file)).map((file) => `${dialog}/${file}`).sort();
files.push('packages/react/test/popupConformanceTests.tsx', ...['className', 'propForwarding', 'refForwarding', 'renderProp'].map((name) => `packages/react/test/conformanceTests/${name}.tsx`));
const parts = ['Backdrop', 'Close', 'Description', 'Popup', 'Portal', 'Title', 'Trigger', 'Viewport'];
const sources = [];
const declarations = [];
const conformanceCalls = [];
const supportDeclarations = [];

for (const source of files) {
  // Read committed bytes, not potentially modified working-tree files.
  const text = execFileSync('git', ['show', `${pin}:${source}`], { cwd: root, encoding: 'utf8' });
  const sf = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const line = (node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
  const raw = (node) => node.getText(sf);
  const value = (node) => {
    if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node)) return value(node.expression);
    if (ts.isArrayLiteralExpression(node)) return node.elements.map(value);
    if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map((p) => [raw(p.name).replace(/^['"]|['"]$/g, ''), value(p.initializer)]));
    if (ts.isStringLiteralLike(node)) return node.text;
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    // Keep function bodies/identifiers as source data; never evaluate them.
    return { source: raw(node) };
  };
  const info = (node) => {
    if (!ts.isCallExpression(node)) return null;
    const expression = raw(node.expression);
    if (!/^(it|test|describe)(?:\.|\()/.test(`${expression}(`)) return null;
    const title = node.arguments[0];
    if (!title || !(ts.isStringLiteralLike(title) || ts.isTemplateExpression(title))) return null;
    const callback = node.arguments.find((arg) => ts.isArrowFunction(arg) || ts.isFunctionExpression(arg));
    if (!callback) return null;
    return { kind: expression.startsWith('describe') ? 'suite' : 'test', title: ts.isStringLiteralLike(title) ? title.text : raw(title), callback, expression };
  };
  const walk = (node) => {
    if (ts.isCallExpression(node) && /^(describeConformance|popupConformanceTests)$/.test(raw(node.expression))) {
      conformanceCalls.push({ source, line: line(node), invocation: raw(node), status: 'unported' });
    }
    if (ts.isFunctionDeclaration(node)) {
      let inTest = false;
      for (let parent = node.parent; parent; parent = parent.parent) {
        if (info(parent)?.kind === 'test') inTest = true;
      }
      if (!inTest) supportDeclarations.push({ source, line: line(node), name: node.name?.text, text: raw(node) });
    }
    const current = info(node);
    if (current?.kind === 'test') {
      const suites = [];
      const parameterAxes = [];
      const conditions = [];
      const guards = [];
      for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
        const suite = info(ancestor);
        if (suite?.kind === 'suite') suites.unshift(suite.title);
        if (suite?.expression.includes('skipIf')) guards.unshift(suite.expression);
        if (ts.isIfStatement(ancestor)) conditions.unshift(raw(ancestor.expression));
        if (ts.isCallExpression(ancestor)) {
          const expr = ancestor.expression;
          if (ts.isPropertyAccessExpression(expr) && expr.name.text === 'forEach') {
            parameterAxes.unshift({ expression: raw(expr.expression), values: value(expr.expression) });
          }
          if (suite && ts.isCallExpression(expr) && ts.isPropertyAccessExpression(expr.expression) && ['for', 'each'].includes(expr.expression.name.text)) {
            parameterAxes.unshift({ expression: raw(expr.arguments[0]), values: value(expr.arguments[0]) });
          }
        }
      }
      if (current.expression.includes('skipIf')) guards.push(current.expression);
      const assertions = [];
      const fixtureCalls = [];
      const visitBody = (child) => {
        if (ts.isCallExpression(child) && /^expect\s*\(/.test(raw(child)) && !ts.isPropertyAccessExpression(child.parent)) assertions.push({ line: line(child), text: raw(child) });
        if (ts.isCallExpression(child)) {
          const expr = raw(child.expression);
          if (/^(render|renderToString|rerender|setProps|hydrate|user\.|fireEvent\.|handle\.|actionsRef\.)/.test(expr)) fixtureCalls.push({ line: line(child), text: raw(child) });
          if (expr === 'skip') {
            let conditional = false;
            for (let parent = child.parent; parent && parent !== current.callback.body; parent = parent.parent) {
              if (ts.isIfStatement(parent)) conditional = true;
            }
            guards.push(`${conditional ? 'conditional' : 'unconditional'} upstream skip() at ${line(child)}`);
          }
        }
        ts.forEachChild(child, visitBody);
      };
      visitBody(current.callback.body);
      const appliesTo = source.endsWith('popupConformanceTests.tsx') ? ['Root'] : source.includes('/conformanceTests/') ? parts : [source.split('/').at(-1).split('.')[0].replace(/^Dialog/, '')];
      // Each axis is explicitly expanded as data. Include source guards rather than pretending skipped upstream assertions ran.
      let variants = [{}];
      for (const axis of parameterAxes) {
        if (!Array.isArray(axis.values)) throw new Error(`Unexpanded parameter axis: ${source}:${line(node)}`);
        variants = variants.flatMap((previous) => axis.values.map((entry) => ({ ...previous, [axis.expression]: entry })));
      }
      const status = 'unported';
      declarations.push({ id: `${source}:${line(node)}`, source, line: line(node), endLine: sf.getLineAndCharacterOfPosition(node.end).line + 1, suites, title: current.title, parameterAxes, variants, appliesTo, sourceConditions: conditions, upstreamGuards: guards, assertions, fixtureCalls, bodySha256: hash(raw(current.callback.body)), status, port: null });
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  sources.push({ source, sha256: hash(text), url: `https://github.com/mui/base-ui/blob/${pin}/${source}` });
}
const output = {
  upstream: { repository: 'https://github.com/mui/base-ui', tag: 'v1.8.0', commit: pin, license: 'MIT', notice: 'UPSTREAM_LICENSE' },
  scope: 'All Dialog test.tsx leaf declarations and local shared helpers at this pin. Variants expand describe.for and forEach. Assertion statements and fixture calls are source excerpts, not executable Svelte tests. Source conditions/guards still apply. Public type assertions are traced separately in scenarios.md. No whole-library denominator.',
  sources, conformanceCalls, supportDeclarations, declarations,
};
const serialized = `${JSON.stringify(output, null, 2)}\n`;
const outputPath = new URL('./upstream-inventory.json', import.meta.url);
if (process.argv.includes('--check')) {
  if (fs.readFileSync(outputPath, 'utf8') !== serialized) throw new Error('Committed inventory differs from pinned source.');
} else fs.writeFileSync(outputPath, serialized);
console.log(`${declarations.length} leaf declarations; ${declarations.reduce((sum, item) => sum + item.variants.length * item.appliesTo.length, 0)} expanded variant/part records (source conditions and guards retained).`);
