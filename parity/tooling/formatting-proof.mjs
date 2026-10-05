import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
const require = createRequire(resolve('packages/base/package.json'));
const prettier = require('prettier');
const { parsers: cssParsers } = require('prettier/plugins/postcss');
const ts = require('typescript');
const { compile } = require('svelte/compiler');
const baseline = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);
const hash = (value) => createHash('sha256').update(value).digest('hex');
const candidates = [];
const records = [];
const formatFlags =
  ts.NodeFlags.Let |
  ts.NodeFlags.Const |
  ts.NodeFlags.Using |
  ts.NodeFlags.AwaitUsing |
  ts.NodeFlags.Namespace |
  ts.NodeFlags.NestedNamespace |
  ts.NodeFlags.GlobalAugmentation |
  ts.NodeFlags.OptionalChain;
function syntax(text, file = 'proof.ts') {
  const tree = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  assert.equal(tree.parseDiagnostics.length, 0, `${file}: valid parsed syntax required`);
  function nodeData(node) {
    if (ts.isParenthesizedExpression(node)) {
      let inner = node.expression;
      while (ts.isParenthesizedExpression(inner)) inner = inner.expression;
      if (!(ts.isStringLiteral(inner) && ts.isExpressionStatement(node.parent)))
        return nodeData(node.expression);
    }
    if (ts.isParenthesizedTypeNode(node)) return nodeData(node.type);
    if (
      ts.isBinaryExpression(node) &&
      [
        ts.SyntaxKind.BarBarToken,
        ts.SyntaxKind.AmpersandAmpersandToken,
        ts.SyntaxKind.QuestionQuestionToken,
      ].includes(node.operatorToken.kind)
    ) {
      const operands = [];
      function collect(part) {
        if (ts.isParenthesizedExpression(part)) return collect(part.expression);
        if (ts.isBinaryExpression(part) && part.operatorToken.kind === node.operatorToken.kind) {
          collect(part.left);
          collect(part.right);
        } else operands.push(nodeData(part));
      }
      collect(node);
      return { kind: 'LogicalChain', operator: ts.SyntaxKind[node.operatorToken.kind], operands };
    }
    const result = { kind: ts.SyntaxKind[node.kind] };
    if (node.flags & formatFlags) result.flags = node.flags & formatFlags;
    for (const key of [
      'text',
      'rawText',
      'isTypeOnly',
      'operator',
      'isExportEquals',
      'isPostfix',
      'multiLine',
    ]) {
      if (key in node && key !== 'multiLine' && !(key === 'text' && ts.isSourceFile(node)))
        result[key] = node[key];
    }
    if (ts.isTemplateLiteralToken(node)) result.rawTemplate = node.getText(tree);
    const children = [];
    ts.forEachChild(node, (child) => {
      children.push(nodeData(child));
    });
    if (children.length) result.children = children;
    return result;
  }
  const directives = [
    ...text.matchAll(/(?:\/\/|\/\*)\s*(@ts-(?:expect-error|ignore|check|nocheck)\b[^\n]*)/g),
  ].map((match) => match[1].trim());
  return { ast: nodeData(tree), directives };
}
function css(text) {
  const tree = cssParsers.css.parse(text);
  function data(value) {
    if (Array.isArray(value)) return value.map(data);
    if (!value || typeof value !== 'object') return value;
    const result = {};
    for (const [key, item] of Object.entries(value)) {
      if (
        [
          'source',
          'sourceIndex',
          'start',
          'end',
          'startOffset',
          'endOffset',
          'parent',
          'spaces',
        ].includes(key)
      )
        continue;
      if (key === 'text' && value.type === 'value-root' && value.group) continue;
      if (key === 'value' && value.type === 'value-number') {
        result.value = item.replace(/^(-?)\./, (_, sign) => sign + '0.');
        continue;
      }
      if (
        key === 'value' &&
        value.type === 'selector-attribute' &&
        typeof value.raws?.unquoted === 'string'
      ) {
        result.value = value.raws.unquoted;
        continue;
      }
      if (key === 'quoted' && value.type === 'selector-attribute') continue;
      if (key === 'raws') {
        const remaining = Object.fromEntries(
          Object.entries(item).filter(
            ([raw]) =>
              !['before', 'after', 'between', 'semicolon'].includes(raw) &&
              !(raw === 'quote' && value.type === 'value-string') &&
              !(raw === 'selector' && typeof value.selector === 'object') &&
              !(raw === 'value' && typeof value.value === 'object'),
          ),
        );
        if (Object.keys(remaining).length) result.raws = data(remaining);
        continue;
      }
      result[key] = data(item);
    }
    return result;
  }
  return data(tree);
}
function svelte(text, file) {
  const result = {};
  for (const generate of ['client', 'server']) {
    const compiled = compile(text, {
      filename: resolve(file),
      generate,
      dev: false,
      css: 'external',
      cssHash: () => 'svelte-formatting-proof',
    });
    result[generate] = syntax(compiled.js.code, `${file}.${generate}.js`);
    result[`${generate}CSS`] = compiled.css ? css(compiled.css.code) : null;
  }
  return result;
}
// Negative controls establish sensitivity to the data formatting must retain.
assert.notDeepEqual(syntax('const x = String.raw`a\\nb`;'), syntax('const x = String.raw`a\nb`;'));
assert.notDeepEqual(syntax('const x = "a  b";'), syntax('const x = "a b";'));
assert.notDeepEqual(syntax('const x = 1;'), syntax('let x = 1;'));
assert.notDeepEqual(syntax('a?.b();'), syntax('(a?.b)();'));
assert.notDeepEqual(
  syntax('function f(){ "use strict"; return this; }'),
  syntax('function f(){ ("use strict"); return this; }'),
);
assert.notDeepEqual(syntax('a + (b + c);'), syntax('(a + b) + c;'));
assert.deepEqual(syntax('a || (b || c);'), syntax('(a || b) || c;'));
assert.notDeepEqual(css('a b { content: "a  b"; }'), css('ab { content: "a b"; }'));
assert.notDeepEqual(svelte('<p>a  b</p>', 'probe.svelte'), svelte('<p>a c</p>', 'probe.svelte'));
for (const file of files) {
  const before = readFileSync(file);
  const committed = execFileSync('git', ['show', `${baseline}:${file}`], {
    maxBuffer: 16 * 1024 * 1024,
  });
  assert.deepEqual(before, committed, `${file}: preimage must equal the recorded baseline commit`);
  const info = await prettier.getFileInfo(file, { ignorePath: '.prettierignore' });
  if (info.ignored || !info.inferredParser) {
    records.push({ file, before: hash(before), after: hash(before), mode: 'excluded-identity' });
    continue;
  }
  const original = before.toString('utf8');
  const options = await prettier.resolveConfig(file);
  const formatted = await prettier.format(original, { ...options, filepath: file });
  let mode = 'non-code-formatting-review';
  if (original !== formatted) {
    try {
      if (['typescript', 'babel'].includes(info.inferredParser)) {
        assert.deepEqual(syntax(original, file), syntax(formatted, file));
        mode = 'typescript-ast-literals-directives';
      } else if (info.inferredParser === 'svelte') {
        assert.deepEqual(svelte(original, file), svelte(formatted, file));
        mode = 'svelte-client-server-ast-css';
      } else if (info.inferredParser === 'css') {
        assert.deepEqual(css(original), css(formatted));
        mode = 'css-parsed-values-selectors';
      } else if (['json', 'json-stringify'].includes(info.inferredParser)) {
        assert.equal(JSON.stringify(JSON.parse(original)), JSON.stringify(JSON.parse(formatted)));
        mode = 'json-values-and-key-order';
      }
    } catch (error) {
      mkdirSync('.checks/format-mismatches', { recursive: true });
      const target = `.checks/format-mismatches/${file.replaceAll('/', '__')}`;
      writeFileSync(`${target}.before`, original);
      writeFileSync(`${target}.after`, formatted);
      writeFileSync(`${target}.error`, String(error.stack));
      console.error(`UNPROVEN ${file}: ${target}.error`);
      process.exitCode = 1;
      break;
    }
    candidates.push({ file, formatted });
  } else mode = 'unchanged-identity';
  records.push({ file, before: hash(before), after: hash(formatted), mode });
  if (records.length % 100 === 0)
    console.log(
      `Checked ${records.length}/${files.length} tracked files, ${candidates.length} formatting changes`,
    );
}
if (process.exitCode) process.exit();
mkdirSync('.checks/format-snapshot', { recursive: true });
for (const { file, formatted } of candidates) {
  const target = resolve('.checks/format-snapshot', file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, readFileSync(file));
  if (process.argv.includes('--write')) writeFileSync(file, formatted);
}
writeFileSync(
  '.checks/formatting-successor.json',
  JSON.stringify(
    {
      baseline,
      ordinaryDeclarationCredit: 0,
      method:
        'Mechanical Prettier formatting; TypeScript AST retains evaluated literals, all template raw tokens, declaration flags and compiler directives. Svelte compares client and server emitted AST with stable CSS scope and parsed CSS values/selectors; text literals remain observable. Source positions and CSS spacing metadata are excluded; historical files remain byte-identical. Documentation/YAML/HTML changes require human review.',
      files: records,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `PASS: ${records.length} files recorded, ${candidates.length} formatting changes ${process.argv.includes('--write') ? 'written' : 'proved before writing'}`,
);
