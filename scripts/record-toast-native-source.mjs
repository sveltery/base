// Record actual Source/native bodies; this is not execution or equivalence acceptance.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const root = new URL('../', import.meta.url);
const upstreamDirectory = process.argv[2];
if (!upstreamDirectory)
  throw new Error('Usage: node scripts/record-toast-native-source.mjs PINNED_UPSTREAM_CHECKOUT');
const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const original = (path) =>
  execFileSync('git', ['show', `${pin}:${path}`], { cwd: upstreamDirectory, encoding: 'utf8' });
const native = (path) => readFileSync(new URL(path, root), 'utf8');
const hash = (value) => createHash('sha256').update(value).digest('hex');
function tokens(text) {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, text);
  const result = [];
  let kind;
  while ((kind = scanner.scan()) !== ts.SyntaxKind.EndOfFileToken)
    result.push([kind, scanner.getTokenText()]);
  return JSON.stringify(result);
}
function bodies(path, text) {
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const result = new Map();
  for (const statement of source.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.body)
      result.set(statement.name.text, statement.body.getText(source));
    if (ts.isClassDeclaration(statement))
      for (const member of statement.members) {
        const body =
          member.body ??
          (ts.isPropertyDeclaration(member) &&
          member.initializer &&
          ts.isArrowFunction(member.initializer)
            ? member.initializer.body
            : undefined);
        if (body)
          result.set(
            ts.isConstructorDeclaration(member) ? 'constructor' : member.name.getText(source),
            body.getText(source),
          );
      }
  }
  return result;
}
const sourcePath = 'packages/react/src/toast/store.ts';
const nativePath = 'packages/base/src/lib/toast/store.ts';
const sourceText = original(sourcePath);
const nativeText = native(nativePath);
const sourceBodies = bodies(sourcePath, sourceText);
const nativeBodies = bodies(nativePath, nativeText);
const business = [
  'createToastMetadata',
  'applyLimited',
  'setViewport',
  'syncProviderProps',
  'removeToast',
  'addToast',
  'updateToast',
  'updateToastInternal',
  'closeToast',
  'promiseToast',
  'pauseTimers',
  'resumeTimers',
  'restoreFocusToPrevElement',
  'handleDocumentPointerDown',
  'scheduleTimer',
  'clearTimers',
  'clearTimer',
  'handleTimerFired',
  'resetPausedStateIfNoTimersRemain',
  'setToasts',
];
const declarations = business.map((name) => ({
  name,
  originalBodySha256: hash(sourceBodies.get(name)),
  nativeBodySha256: hash(nativeBodies.get(name)),
  significantTokensEqual: tokens(sourceBodies.get(name)) === tokens(nativeBodies.get(name)),
}));
const changed = declarations.filter((row) => !row.significantTokensEqual);
if (changed.length)
  throw new Error(`Changed Source business tokens: ${changed.map((row) => row.name).join(', ')}`);
const generatorSource = 'packages/utils/src/generateId.ts';
const generatorNative = 'packages/utils/src/lib/generateId.ts';
const recordPath = new URL('parity/toast/native-source-contracts.json', root);
const prior = JSON.parse(readFileSync(recordPath, 'utf8'));
const record = {
  ...prior,
  sourceStore: { path: sourcePath, fileSha256: hash(sourceText) },
  nativeStore: { path: nativePath, fileSha256: hash(nativeText) },
  declarations,
  generator: {
    sourcePath: generatorSource,
    sourceSha256: hash(original(generatorSource)),
    nativePath: generatorNative,
    nativeSha256: hash(native(generatorNative)),
    significantTokensEqual: tokens(original(generatorSource)) === tokens(native(generatorNative)),
  },
  readOriginalBodies: prior.readOriginalBodies.map(({ path }) => ({
    path,
    sha256: hash(original(path)),
  })),
};
writeFileSync(recordPath, JSON.stringify(record, null, 2) + '\n');
process.stdout.write(
  `Recorded ${declarations.length} Source business token comparisons and actual independent body/file hashes at ${fileURLToPath(recordPath)}. No execution acceptance.\n`,
);
