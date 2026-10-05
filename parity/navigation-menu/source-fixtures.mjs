// Verify unchanged selected Original fixture bodies used by real React runtime probes.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { createRequire } from 'node:module';
const directory = import.meta.dirname;
const root = path.resolve(directory, '../..');
const ts = createRequire(path.join(root, 'packages/base/package.json'))('typescript');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const source = 'packages/react/src/navigation-menu/root/NavigationMenuRoot.test.tsx';
const original = JSON.parse(fs.readFileSync(path.join(directory, 'original-assertions.json'), 'utf8'));
const archive = gunzipSync(fs.readFileSync(path.join(directory, 'original-source.tar.gz')));
let body;
for (let offset = 0; offset < archive.length;) {
  const name = archive.subarray(offset, offset + 100).toString().replace(/\0.*$/, '');
  const size = parseInt(archive.subarray(offset + 124, offset + 136).toString().replace(/\0.*$/, '').trim(), 8) || 0;
  if (name === `./${source}`) { body = archive.subarray(offset + 512, offset + 512 + size).toString(); break; }
  offset += 512 + Math.ceil(size / 512) * 512;
}
if (!body || hash(body) !== original.files.find(file => file.source === source).sha256) throw new Error('Immutable Source fixture authority mismatch');
const reference = 'apps/fixtures/src/lib/navigation-menu-source-original.tsx';
const native = 'apps/fixtures/src/lib/NavigationMenuSourceFixture.svelte';
const referenceBody = fs.readFileSync(path.join(root, reference), 'utf8');
const selected = ['TestNavigationMenu', 'TestNavigationMenuWithTopLevelLink', 'TestNavigationMenuWithDisabledTrigger', 'TestNestedNavigationMenu', 'TestNavigationMenuOrientationAttributes', 'TestInlineNestedNavigationMenu', 'TestInlineNestedNavigationMenuWithDynamicContent'];
const sourceAst = ts.createSourceFile(source, body, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const referenceAst = ts.createSourceFile(reference, referenceBody, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const functions = selected.map(name => {
  const originalBody = sourceAst.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
  const referenceBody = referenceAst.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
  if (!originalBody || !referenceBody || originalBody.getText(sourceAst) !== referenceBody.getText(referenceAst)) throw new Error(`Changed actual Original fixture body: ${name}`);
  return { name, sourceLine: sourceAst.getLineAndCharacterOfPosition(originalBody.getStart(sourceAst)).line + 1, referenceLine: referenceAst.getLineAndCharacterOfPosition(referenceBody.getStart(referenceAst)).line + 1, sha256: hash(originalBody.getText(sourceAst)), exactCompleteOriginalBody: true };
});
const record = { pin: original.pin, source, sourceSha256: hash(body), reference, referenceSha256: hash(referenceBody), native, nativeSha256: hash(fs.readFileSync(path.join(root, native))), functions, transport: 'Original React createRoot client mount; actual native Svelte mount. Dedicated SSR/hydration probes remain separate. Root callbacks and owner controls only observe public behavior.', ordinaryCredit: 0, status: 'Exact Original fixture bodies verified; native full sequence execution/correspondence review pending' };
fs.writeFileSync(path.join(directory, 'source-fixture-correspondence.json'), JSON.stringify(record, null, 2) + '\n');
console.log(`${functions.length} complete Original fixture bodies verified; ordinary credit remains zero`);
