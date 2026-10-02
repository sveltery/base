import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(new URL('../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const repo = fileURLToPath(new URL('../', import.meta.url));

/** Extract named declarations, independent of line breaks and conditional test decorators. */
export function extractTestDeclarations(source, text) {
  const tree = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true);
  const cases = [];
  function visit(node) {
    if (ts.isCallExpression(node) && node.arguments.length &&
        (ts.isStringLiteralLike(node.arguments[0]) || ts.isTemplateExpression(node.arguments[0]))) {
      let callee = node.expression;
      // These methods build a test factory; their arguments are not test names.
      let excluded = ts.isPropertyAccessExpression(callee) &&
        ['each', 'for', 'skipIf', 'runIf'].includes(callee.name.text);
      while (ts.isCallExpression(callee) || ts.isPropertyAccessExpression(callee) ||
             ts.isElementAccessExpression(callee)) {
        if (ts.isPropertyAccessExpression(callee) && ['each', 'for'].includes(callee.name.text)) excluded = true;
        callee = callee.expression;
      }
      if (!excluded && ts.isIdentifier(callee) && ['it', 'test'].includes(callee.text)) {
        const title = node.arguments[0];
        cases.push({ source, line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1,
          name: ts.isTemplateExpression(title) ? title.getText(tree).slice(1, -1) : title.text });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  return cases;
}

export function locateTypeAssertion(assertion, text) {
  const tree = ts.createSourceFile(assertion.source, text, ts.ScriptTarget.Latest, true);
  const matches = [];
  function visit(node) {
    if (ts.isCallExpression(node) && node.getText(tree) === assertion.expression) {
      matches.push({ source: assertion.source,
        line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1, name: assertion.name });
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  if (matches.length !== 1) throw new Error(`Expected one pinned type assertion: ${assertion.name}; found ${matches.length}`);
  return matches[0];
}

/** Explicitly inventory a dynamic test-name source site without counting its expansions. */
export function locateDynamicTestDeclaration(declaration, text) {
  const tree = ts.createSourceFile(declaration.source, text, ts.ScriptTarget.Latest, true);
  const matches = [];
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(tree) === declaration.callee &&
        node.arguments.length > 1 && ts.isIdentifier(node.arguments[0]) &&
        node.arguments[0].text === declaration.argument) {
      matches.push({ source: declaration.source,
        line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1, name: declaration.name });
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  if (matches.length !== 1) throw new Error(`Expected one pinned dynamic declaration: ${declaration.name}; found ${matches.length}`);
  return matches[0];
}

export function reconcileCases(previous, declarations) {
  const key = (item) => JSON.stringify([item.source, item.line, item.name]);
  const preserved = new Map(previous.map((item) => [key(item), item]));
  const seen = new Set();
  const cases = declarations.map((item) => {
    const id = key(item);
    if (seen.has(id)) throw new Error(`Duplicate declaration: ${id}`);
    seen.add(id);
    const existing = preserved.get(id);
    preserved.delete(id);
    return existing ?? { ...item, status: 'unported', port: null };
  });
  if (preserved.size) throw new Error(`Inventory would discard existing cases: ${[...preserved.keys()].join(', ')}`);
  return cases;
}

function main(args) {
  const upstreamIndex = args.indexOf('--upstream');
  const mode = args.includes('--write') ? '--write' : '--check';
  if (upstreamIndex < 0 || !args[upstreamIndex + 1] ||
      args.some((arg, index) => !['--upstream', '--write', '--check'].includes(arg) && index !== upstreamIndex + 1) ||
      (args.includes('--write') && args.includes('--check'))) {
    throw new Error('Usage: node scripts/parity-inventory.mjs --upstream <git-repository> [--check | --write]');
  }
  const upstream = resolve(args[upstreamIndex + 1]);
  const manifestPath = resolve(repo, 'parity/manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const sources = JSON.parse(readFileSync(resolve(repo, 'parity/sources.json'), 'utf8'));
  const pinned = manifest.upstream.commit;
  const resolved = execFileSync('git', ['-C', upstream, 'rev-parse', `${pinned}^{commit}`], { encoding: 'utf8' }).trim();
  if (resolved !== pinned) throw new Error('Upstream commit does not match the immutable manifest pin.');
  // Read immutable Git objects rather than the upstream working tree or current branch.
  const readSource = (source) => execFileSync('git', ['-C', upstream, 'show', `${pinned}:${source}`], { encoding: 'utf8' });
  const declarations = sources.testFiles.flatMap((source) => extractTestDeclarations(source, readSource(source)));
  declarations.push(...(sources.dynamicTestDeclarations ?? []).map((declaration) => locateDynamicTestDeclaration(declaration, readSource(declaration.source))));
  declarations.push(...sources.typeAssertions.map((assertion) => locateTypeAssertion(assertion, readSource(assertion.source))));
  manifest.cases = reconcileCases(manifest.cases, declarations);
  const output = `${JSON.stringify(manifest, null, 2)}\n`;
  if (mode === '--write') writeFileSync(manifestPath, output);
  else if (readFileSync(manifestPath, 'utf8') !== output) throw new Error('Parity inventory differs from pinned source; regenerate with --write.');
  const counts = {};
  for (const item of manifest.cases) counts[item.status] = (counts[item.status] ?? 0) + 1;
  console.log(`Pinned parity inventory ${mode}: ${manifest.cases.length} entries, ${JSON.stringify(counts)}, ${pinned}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
