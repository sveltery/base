import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { createRequire, registerHooks } from 'node:module';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const [phase, consumerDirectory, reportPath] = process.argv.slice(2);
assert(['classify', 'raw', 'compiled'].includes(phase), 'Pass classify, raw or compiled');
assert(consumerDirectory && reportPath, 'Pass the installed consumer directory and report path');
const consumer = resolve(consumerDirectory);
const consumerRequire = createRequire(resolve(consumer, 'package.json'));
const metadataPath = resolve(consumer, 'node_modules/@sveltery/utils/package.json');
const packageDirectory = dirname(realpathSync(metadataPath));
const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
assert.equal(metadata.name, '@sveltery/utils');
const entries = Object.keys(metadata.exports);
assert(entries.length > 0 && entries.every((entry) => entry.startsWith('./')));
const artifacts = JSON.parse(readFileSync(process.env.SVELTERY_PACKAGE_ARTIFACTS, 'utf8'));
const artifact = artifacts.packages[metadata.name];
assert(artifact && artifact.version === metadata.version, 'Require the actual Utils artifact');

if (phase === 'classify') {
  const producerRequire = createRequire(new URL('../packages/base/package.json', import.meta.url));
  const ts = producerRequire('typescript');
  const runes = new Set([
    '$state',
    '$derived',
    '$effect',
    '$props',
    '$bindable',
    '$inspect',
    '$host',
  ]);
  const modules = new Map();

  function inspect(file) {
    if (modules.has(file)) return modules.get(file);
    const local = relative(packageDirectory, file);
    assert(
      !local.startsWith('..') && !isAbsolute(local),
      `Module escapes installed Utils: ${file}`,
    );
    assert(existsSync(file), `Missing installed module: ${local}`);
    const source = readFileSync(file, 'utf8');
    const syntax = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.JS,
    );
    assert.equal(syntax.parseDiagnostics.length, 0, `Invalid emitted JavaScript: ${local}`);
    const record = {
      file: local,
      sha256: createHash('sha256').update(source).digest('hex'),
      rune: false,
      imports: [],
    };
    modules.set(file, record);

    function dependency(specifier) {
      if (specifier.startsWith('.')) {
        record.imports.push(resolve(dirname(file), specifier));
      } else if (specifier.startsWith('@sveltery/')) {
        assert(
          specifier.startsWith('@sveltery/utils/'),
          `Unexpected reverse workspace edge: ${specifier}`,
        );
        record.imports.push(consumerRequire.resolve(specifier));
      }
    }

    function visit(node) {
      if (ts.isCallExpression(node)) {
        let callee = node.expression;
        while (ts.isPropertyAccessExpression(callee)) callee = callee.expression;
        if (ts.isIdentifier(callee) && runes.has(callee.text)) record.rune = true;
        if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
          assert.equal(node.arguments.length, 1, `Unsupported dynamic import: ${local}`);
          assert(ts.isStringLiteral(node.arguments[0]), `Nonliteral dynamic import: ${local}`);
          dependency(node.arguments[0].text);
        }
      }
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier && !node.isTypeOnly && !node.importClause?.isTypeOnly) {
          assert(ts.isStringLiteral(node.moduleSpecifier), `Nonliteral import: ${local}`);
          dependency(node.moduleSpecifier.text);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(syntax);
    for (const dependency of record.imports) inspect(dependency);
    return record;
  }

  function closure(file, visited = new Set()) {
    if (visited.has(file)) return visited;
    visited.add(file);
    for (const dependency of inspect(file).imports) closure(dependency, visited);
    return visited;
  }

  const classified = entries.map((entry) => {
    const specifier = metadata.name + entry.slice(1);
    const files = [...closure(consumerRequire.resolve(specifier))];
    const runeFiles = files.filter((file) => inspect(file).rune || file.endsWith('.svelte'));
    return {
      entry,
      specifier,
      profile: runeFiles.length ? 'Svelte compiler required' : 'plain ESM closure',
      runeFiles: runeFiles.map((file) => relative(packageDirectory, file)),
    };
  });
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        package: metadata.name,
        version: metadata.version,
        artifact: { tarball: artifact.tarball, sha256: artifact.sha256 },
        entries: classified,
        modules: [...modules.values()].map(({ imports, ...record }) => ({
          ...record,
          imports: imports.map((file) => relative(packageDirectory, file)),
        })),
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    `Classified all ${classified.length} actual installed Utils exports across ${modules.size} modules`,
  );
} else {
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  assert.equal(report.package, metadata.name);
  assert.deepEqual(report.artifact, { tarball: artifact.tarball, sha256: artifact.sha256 });
  assert.deepEqual(
    report.entries.map(({ entry }) => entry),
    entries,
    'Classification must cover the exact installed export set',
  );
  assert(
    report.entries.every(({ profile }) =>
      ['plain ESM closure', 'Svelte compiler required'].includes(profile),
    ),
    'Unknown runtime profile',
  );
  for (const { file, sha256 } of report.modules) {
    const bytes = readFileSync(resolve(packageDirectory, file));
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      sha256,
      `Installed module changed: ${file}`,
    );
  }
  const compiled = new Set();
  if (phase === 'compiled') {
    const { compile, compileModule } = consumerRequire('svelte/compiler');
    registerHooks({
      load(url, context, nextLoad) {
        if (url.endsWith('.svelte') || url.endsWith('.svelte.js')) {
          const filename = fileURLToPath(url);
          const source = readFileSync(filename, 'utf8');
          const options = { filename, generate: 'server' };
          const result = url.endsWith('.svelte')
            ? compile(source, options)
            : compileModule(source, options);
          compiled.add(relative(packageDirectory, filename));
          return { format: 'module', source: result.js.code, shortCircuit: true };
        }
        return nextLoad(url, context);
      },
    });
  }
  const profile = phase === 'raw' ? 'plain ESM closure' : 'Svelte compiler required';
  const selected = report.entries.filter((entry) => entry.profile === profile);
  for (const entry of selected) {
    const module = await import(pathToFileURL(consumerRequire.resolve(entry.specifier)).href);
    assert(Object.keys(module).length > 0, `No runtime exports: ${entry.specifier}`);
    if (phase === 'compiled') {
      assert(
        entry.runeFiles.every((file) => compiled.has(file)),
        `Rune closure was not compiled: ${entry.specifier}`,
      );
    }
  }
  if (phase === 'raw') {
    const { clamp } = await import(
      pathToFileURL(consumerRequire.resolve('@sveltery/utils/clamp')).href
    );
    assert.equal(clamp(12, 0, 10), 10);
    const { mergeCleanups } = await import(
      pathToFileURL(consumerRequire.resolve('@sveltery/utils/mergeCleanups')).href
    );
    const calls = [];
    mergeCleanups(
      () => calls.push('first'),
      () => calls.push('second'),
    )();
    assert.deepEqual(calls, ['first', 'second']);
  }
  console.log(`Installed Utils ${phase}: all ${selected.length} ${profile} entries PASS`);
}
