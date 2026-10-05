// Later test/helper closure supplement. Does not retroactively earn pre-code credit.
// Immutable Base UI1.8.0 sources and test assertions; MIT: UPSTREAM_LICENSE.
import ts from '../../packages/base/node_modules/typescript/lib/typescript.js';
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  statSync,
  readdirSync,
} from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const upstream = resolve(
  process.argv[2] ?? '/workspace/direction-provider-upstream',
);
if (
  execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: upstream,
    encoding: 'utf8',
  }).trim() !== pin
)
  throw Error('Wrong source');
const directory = import.meta.dirname;
const roots = [];
function walk(path) {
  for (const entry of readdirSync(resolve(upstream, path), {
    withFileTypes: true,
  })) {
    const file = `${path}/${entry.name}`;
    if (entry.isDirectory()) walk(file);
    else if (/test\.tsx$|spec\.tsx$/.test(file)) roots.push(file);
  }
}
walk('packages/react/src/scroll-area');
const queue = [...roots],
  records = new Map(),
  helperDeclarations = [];
function resolveImport(file, specifier) {
  const base =
    specifier === '#test-utils'
      ? resolve(upstream, 'packages/react/test/index')
      : specifier.startsWith('.')
        ? resolve(upstream, dirname(file), specifier)
        : specifier.startsWith('@base-ui/utils/')
          ? resolve(
              upstream,
              'packages/utils/src',
              specifier.slice('@base-ui/utils/'.length),
            )
          : specifier.startsWith('@base-ui/react/')
            ? resolve(
                upstream,
                'packages/react/src',
                specifier.slice('@base-ui/react/'.length),
              )
            : null;
  if (!base) return `external:${specifier}`;
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
  ])
    if (existsSync(candidate) && statSync(candidate).isFile())
      return relative(upstream, candidate);
  throw Error(`Unresolved ${file} -> ${specifier}`);
}
while (queue.length) {
  const source = queue.shift();
  if (records.has(source)) continue;
  const body = readFileSync(resolve(upstream, source), 'utf8'),
    imports = [];
  const ast = ts.createSourceFile(source, body, ts.ScriptTarget.Latest, true);
  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const resolved = resolveImport(source, node.moduleSpecifier.text);
      imports.push({ specifier: node.moduleSpecifier.text, resolved });
      if (!resolved.startsWith('external:')) queue.push(resolved);
    }
    if (
      source.includes('/test/conformanceTests/') &&
      ts.isCallExpression(node) &&
      node.expression.getText(ast) === 'it'
    ) {
      helperDeclarations.push({
        source,
        line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
        title: node.arguments[0]?.getText(ast),
        sha256: createHash('sha256').update(node.getText(ast)).digest('hex'),
        unchangedCredit: 0,
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  records.set(source, {
    source,
    sha256: createHash('sha256').update(body).digest('hex'),
    imports,
  });
  const saved = resolve(directory, 'upstream', source);
  mkdirSync(dirname(saved), { recursive: true });
  writeFileSync(saved, body);
}
writeFileSync(
  `${directory}/test-helper-graph.json`,
  JSON.stringify(
    {
      pin,
      roots,
      provenanceTiming:
        'Later post-runtime supplement. Pre-code561dd preserves129 component runtime/type modules and full six ScrollArea test bodies; this test-barrel/helper recursive inventory was missing there and earns no retroactive pre-code credit.',
      scope:
        'Conservative complete test/helper barrel closure. Selected describeConformance/createRenderer and15 conformance helper declarations are manual scope; unrelated popup/date test-barrel bodies are archived without acceptance credit. React/MUI/Vitest and other npm imports are external test machinery, replaced by actual paired Playwright/native Vitest fixtures, not copied component runtime.',
      records: [...records.values()].sort((a, b) =>
        a.source.localeCompare(b.source),
      ),
    },
    null,
    2,
  ) + '\n',
);
writeFileSync(
  `${directory}/conformance-accounting.json`,
  JSON.stringify(
    {
      pin,
      helperDeclarations: helperDeclarations.sort(
        (a, b) => a.source.localeCompare(b.source) || a.line - b.line,
      ),
      declarationsPerCall: helperDeclarations.length,
      calls: 6,
      expandedOrdinaryInstances: helperDeclarations.length * 6,
      unchangedCredit: 0,
      ports:
        'tests/browser/scroll-area.spec.ts native conformance six parts prop/ref/class/style forwarding: default, element and function reference modes; Svelte uses its actual snippet replacement for both reference modes.',
      limitations: [
        'React cloneElement/JSX rendering element API has no native element prop equivalent; native snippet and attachment behavior retains actual Svelte defaults and earns zero unchanged credit.',
        'Source wrapper nodes/key extraction and dual React rendering-element ref callbacks have native snippet/attachment correspondence; inherited canonical UseRender/ref tests cover shared implementation, while per-family live bindable ref/host/props/class/style bodies are executed separately. Full15-per-call unchanged assertion acceptance remains unclaimed.',
        'Developer inspected selected helper bodies at this later checkpoint; fresh whole source/native reviewer must evaluate full used helper scope and evidence.',
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `${records.size} conservative test/helper modules; ${helperDeclarations.length} conformance helper declarations per call`,
);
