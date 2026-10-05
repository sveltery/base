// Evidence tooling: compare the maintained typed helpers with the frozen
// JavaScript checkpoint using this workspace's actual pinned TypeScript compiler.
// This runs no alternate parser/search implementation and needs no network.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const require = createRequire(resolve(root, 'apps/docs/package.json'));
const ts = require('typescript');
const baseline = 'fd4928c034be417fcdc0451f4214c34ddbc09510';
const highlight = 'apps/docs/src/lib/docs/highlight';
const historical = JSON.parse(
  readFileSync(
    resolve(root, 'docs/receipts/docs/parser-source-files.json'),
    'utf8',
  ),
);
const targets = [
  ...historical.map((entry) => ({
    ...entry,
    source: entry.target,
    target: entry.target.replace(/\.mjs$/, '.ts'),
  })),
  {
    source: 'apps/docs/src/lib/docs/search/engine.js',
    target: 'apps/docs/src/lib/docs/search/engine.ts',
    original: 'useSearch/useSearch.mjs',
    originalSha256:
      '342a13b974150122216ed5c85ccdfe86bdc7bda5eaf10774473886eadf4dd84d',
  },
];

function sha256(source) {
  return createHash('sha256').update(source).digest('hex');
}
function runtime(source, fileName) {
  const erased = ts.transpileModule(source, {
    fileName,
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      removeComments: true,
    },
  }).outputText;
  const ast = ts.createSourceFile(
    'runtime.js',
    erased,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  // Type assertions can leave parentheses, and a typed shorthand property may
  // spell `children: children`. Normalize only those equivalent AST forms.
  const transformed = ts.transform(ast, [
    (context) => {
      function visit(node) {
        if (
          ts.isStringLiteral(node) &&
          (ts.isImportDeclaration(node.parent) ||
            ts.isExportDeclaration(node.parent) ||
            (ts.isCallExpression(node.parent) &&
              node.parent.expression.kind === ts.SyntaxKind.ImportKeyword))
        )
          return ts.factory.createStringLiteral(
            node.text.replace(/\.mjs$/, '.js'),
          );
        if (ts.isParenthesizedExpression(node))
          return ts.visitNode(node.expression, visit);
        if (
          ts.isShorthandPropertyAssignment(node) &&
          !node.objectAssignmentInitializer
        )
          return ts.factory.createPropertyAssignment(node.name, node.name);
        return ts.visitEachChild(node, visit, context);
      }
      return (node) => ts.visitNode(node, visit);
    },
  ]);
  function shape(node) {
    const children = [];
    ts.forEachChild(node, (child) => {
      children.push(shape(child));
    });
    return {
      kind: ts.SyntaxKind[node.kind],
      ...(ts.isIdentifier(node) ||
      ts.isLiteralExpression(node) ||
      ts.isTemplateLiteralToken(node)
        ? { text: node.text }
        : {}),
      ...(ts.isTemplateLiteralToken(node)
        ? { rawText: node.rawText ?? node.getText(ast) }
        : {}),
      ...(ts.isVariableDeclarationList(node)
        ? { declaration: node.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const) }
        : {}),
      ...(ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)
        ? { operator: ts.SyntaxKind[node.operator] }
        : {}),
      children,
    };
  }
  const printed = JSON.stringify(shape(transformed.transformed[0]));
  transformed.dispose();
  return printed;
}
function imports(source, fileName) {
  const ast = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
  );
  const runtimeImports = [];
  const typeImports = [];
  function visit(node) {
    if (ts.isImportDeclaration(node))
      (node.importClause?.isTypeOnly ? typeImports : runtimeImports).push(
        node.moduleSpecifier.text,
      );
    else if (ts.isExportDeclaration(node) && node.moduleSpecifier)
      (node.isTypeOnly ? typeImports : runtimeImports).push(
        node.moduleSpecifier.text,
      );
    else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    )
      runtimeImports.push(node.arguments[0].text);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return { runtime: runtimeImports, typeOnly: typeImports };
}
function difference(before, after, path = 'runtime') {
  if (JSON.stringify(before) === JSON.stringify(after)) return undefined;
  if (
    !before ||
    !after ||
    typeof before !== 'object' ||
    typeof after !== 'object'
  )
    return `${path}: ${JSON.stringify(before)} -> ${JSON.stringify(after)}`;
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const changed = difference(before[key], after[key], `${path}.${key}`);
    if (changed) return changed;
  }
  return undefined;
}
const files = targets.map(({ source, target, original, originalSha256 }) => {
  const before = execFileSync('git', ['show', `${baseline}:${source}`], {
    cwd: root,
    encoding: 'utf8',
  });
  const after = readFileSync(resolve(root, target), 'utf8');
  const beforeRuntime = runtime(before, source);
  const afterRuntime = runtime(after, target);
  if (beforeRuntime !== afterRuntime)
    throw new Error(
      `Changed runtime AST: ${target}: ${difference(JSON.parse(beforeRuntime), JSON.parse(afterRuntime))}`,
    );
  if (
    /\bany\b/.test(
      after.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|'[^']*'|"[^"]*"/g, ''),
    ) ||
    /@ts-(?:nocheck|ignore|expect-error)/.test(after)
  )
    throw new Error(`Blanket typing escape in ${target}`);
  return {
    target,
    sourceAtBaseline: source,
    original,
    ...(originalSha256 ? { originalSha256 } : {}),
    baselineSha256: sha256(before),
    targetSha256: sha256(after),
    normalizedRuntimeSha256: sha256(afterRuntime),
    normalizedRuntimeMatchesBaseline: true,
    imports: imports(after, target),
  };
});
const report = {
  baseline,
  authority:
    '@mui/internal-docs-infra@0.12.1-canary.42 published JavaScript and declarations',
  compiler: ts.version,
  node: process.version,
  method:
    'TypeScript transpileModule ESNext erasure; normalize import .mjs to .js, parenthesized expressions and shorthand assignments; compare runtime AST node kinds, literal/identifier text, template raw spelling, const/let/var flags, unary operators and ordered child structures',
  runtimeModules: files.length,
  maintainedHighlightFiles: readdirSync(resolve(root, highlight)).sort(),
  files,
  sourceClosure: [
    `${highlight}/types.ts`,
    'apps/docs/src/lib/docs/search/types.ts',
    'apps/docs/src/lib/docs/search/sitemap.ts',
    'apps/docs/src/lib/docs/search/searchUtils.ts',
    'apps/docs/src/lib/docs/search/loader.ts',
    'apps/docs/src/lib/docs/CodeContent.svelte',
    'apps/docs/src/lib/docs/NativeSearch.svelte',
    'apps/docs/test/highlight.test.ts',
    'apps/docs/test/search.test.ts',
  ].map((target) => {
    const source = readFileSync(resolve(root, target), 'utf8');
    const script = target.endsWith('.svelte')
      ? source.match(/<script lang="ts">([\s\S]*?)<\/script>/)[1]
      : source;
    return {
      target,
      targetSha256: sha256(source),
      imports: imports(script, target),
    };
  }),
};
if (process.argv.includes('--write'))
  writeFileSync(
    resolve(root, 'docs/receipts/docs/typescript-source-files.json'),
    JSON.stringify(report, null, 2) + '\n',
  );
else if (
  readFileSync(
    resolve(root, 'docs/receipts/docs/typescript-source-files.json'),
    'utf8',
  ) !==
  JSON.stringify(report, null, 2) + '\n'
)
  throw new Error(
    'Typed source evidence is stale. Run node docs/receipts/docs/typescript-source-check.mjs --write',
  );
console.log(
  `Typed runtime AST matches frozen ${baseline.slice(0, 7)}: ${files.length}/${files.length} modules`,
);
