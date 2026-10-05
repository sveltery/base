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
const sourceFiles = new Map();
for (let offset = 0; offset < archive.length;) {
  const name = archive.subarray(offset, offset + 100).toString().replace(/\0.*$/, '');
  const size = parseInt(archive.subarray(offset + 124, offset + 136).toString().replace(/\0.*$/, '').trim(), 8) || 0;
  if ([`./${source}`, './packages/react/src/navigation-menu/trigger/NavigationMenuTrigger.test.tsx'].includes(name)) sourceFiles.set(name.replace(/^\.\//, ''), archive.subarray(offset + 512, offset + 512 + size).toString());
  offset += 512 + Math.ceil(size / 512) * 512;
}
body = sourceFiles.get(source);
if (!body || hash(body) !== original.files.find(file => file.source === source).sha256) throw new Error('Immutable Source fixture authority mismatch');
const reference = 'apps/fixtures/src/lib/navigation-menu-source-original.tsx';
const native = 'apps/fixtures/src/lib/NavigationMenuSourceFixture.svelte';
const referenceBody = fs.readFileSync(path.join(root, reference), 'utf8');
const selected = ['TestNavigationMenu', 'TestNavigationMenuWithTopLevelLink', 'TestNavigationMenuWithDisabledTrigger', 'TestNestedNavigationMenu', 'TestNavigationMenuOrientationAttributes', 'TestInlineNestedNavigationMenu', 'TestInlineNestedNavigationMenuWithDynamicContent', 'TestNestedNavigationMenuWithCloseOnClick', 'TestDeeplyNestedNavigationMenu', 'TestDeeplyNestedNavigationMenuWithCloseOnClick', 'TestInlineNestedNavigationMenuTabForwardBoundary', 'TestInlineNestedNavigationMenuTabFlow', 'TestNavigationMenuWithKeepMountedContent', 'TestNavigationMenuWithKeepMountedContentClosed', 'TestNavigationMenuWithScopedPopupExitAnimation', 'TestNavigationMenuWithTopLevelLinkScopedPopupAnimation', 'TestNavigationMenuWithNestedPopup', 'TestNavigationMenuWithDialog'];
const sourceAst = ts.createSourceFile(source, body, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const referenceAst = ts.createSourceFile(reference, referenceBody, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const functions = selected.map(name => {
  const originalBody = sourceAst.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
  const referenceBody = referenceAst.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
  if (!originalBody || !referenceBody || originalBody.getText(sourceAst) !== referenceBody.getText(referenceAst)) throw new Error(`Changed actual Original fixture body: ${name}`);
  return { name, sourceLine: sourceAst.getLineAndCharacterOfPosition(originalBody.getStart(sourceAst)).line + 1, referenceLine: referenceAst.getLineAndCharacterOfPosition(referenceBody.getStart(referenceAst)).line + 1, sha256: hash(originalBody.getText(sourceAst)), exactCompleteOriginalBody: true };
});
const triggerSource = 'packages/react/src/navigation-menu/trigger/NavigationMenuTrigger.test.tsx';
const triggerBody = sourceFiles.get(triggerSource);
if (!triggerBody || hash(triggerBody) !== original.files.find(file => file.source === triggerSource)?.sha256) throw new Error('Immutable Trigger fixture authority mismatch');
const triggerAst = ts.createSourceFile(triggerSource, triggerBody, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const additionalFixtures = [];
for (const [name, local] of [
  ['TestNavigationMenuRapidHoverSizing', reference],
  ['getPopupWidthCalls', 'apps/fixtures/src/lib/navigation-menu-source-mocks.ts'],
  ['getPositionerWidthCalls', 'apps/fixtures/src/lib/navigation-menu-source-mocks.ts'],
]) {
  const originalFunction = triggerAst.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
  const localBody = fs.readFileSync(path.join(root, local), 'utf8');
  const localAst = ts.createSourceFile(local, localBody, ts.ScriptTarget.Latest, true, local.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const localFunction = localAst.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
  if (!originalFunction || !localFunction || originalFunction.getText(triggerAst) !== localFunction.getText(localAst)) throw new Error(`Changed complete Original Trigger fixture ${name}`);
  additionalFixtures.push({ source: triggerSource, sourceSha256: hash(triggerBody), name, sourceLine: triggerAst.getLineAndCharacterOfPosition(originalFunction.getStart(triggerAst)).line + 1, local, localLine: localAst.getLineAndCharacterOfPosition(localFunction.getStart(localAst)).line + 1, sha256: hash(originalFunction.getText(triggerAst)), exactCompleteOriginalBody: true });
}
const styleName = 'rapidHoverAnimationStyles';
const styleDeclaration = triggerAst.statements.flatMap(node => ts.isVariableStatement(node) ? [...node.declarationList.declarations] : []).find(node => node.name.getText(triggerAst) === styleName);
for (const local of [reference, 'apps/fixtures/src/lib/navigation-menu-source-styles.ts']) {
  const localBody = fs.readFileSync(path.join(root, local), 'utf8');
  const localAst = ts.createSourceFile(local, localBody, ts.ScriptTarget.Latest, true, local.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const localDeclaration = localAst.statements.flatMap(node => ts.isVariableStatement(node) ? [...node.declarationList.declarations] : []).find(node => node.name.getText(localAst) === styleName);
  if (!styleDeclaration || !localDeclaration || styleDeclaration.getText(triggerAst) !== localDeclaration.getText(localAst)) throw new Error(`Changed complete Source Trigger CSS ${local}`);
  additionalFixtures.push({ source: triggerSource, sourceSha256: hash(triggerBody), name: styleName, sourceLine: triggerAst.getLineAndCharacterOfPosition(styleDeclaration.getStart(triggerAst)).line + 1, local, sha256: hash(styleDeclaration.getText(triggerAst)), exactCompleteOriginalBody: true });
}
const mockRecordPath = path.join(directory, 'source-mock-correspondence.json');
if (fs.existsSync(mockRecordPath)) {
  const mockRecord = JSON.parse(fs.readFileSync(mockRecordPath, 'utf8'));
  if (mockRecord.pin !== original.pin || mockRecord.sourceSha256 !== hash(body)) throw new Error('Original mock Source authority mismatch');
  const mockBody = fs.readFileSync(path.join(root, mockRecord.native), 'utf8');
  const mockAst = ts.createSourceFile(mockRecord.native, mockBody, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  for (const selected of mockRecord.functions) {
    const source = sourceAst.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === selected.name);
    const native = mockAst.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === selected.name);
    if (!source || !native || hash(source.getText(sourceAst)) !== selected.sha256 || source.getText(sourceAst) !== native.getText(mockAst)) throw new Error(`Changed complete Original test helper ${selected.name}`);
  }
  mockRecord.nativeSha256 = hash(mockBody);
  fs.writeFileSync(mockRecordPath, JSON.stringify(mockRecord, null, 2) + '\n');
}
const record = { pin: original.pin, source, sourceSha256: hash(body), reference, referenceSha256: hash(referenceBody), native, nativeSha256: hash(fs.readFileSync(path.join(root, native))), functions, additionalFixtures, transport: 'Actual pinned Testing Library React render with Original strict true, real fireEvent/act and document-owned userEvent.setup; native Svelte mount/DOM fireEvent/tick with the same literal input operations. Playwright owns each page clock; real React async act surrounds explicit advancement. Dedicated actual SSR/hydration remains separate. Whole assertion correspondence and execution-domain review pending.', ordinaryCredit: 0, status: 'Exact Original fixture bodies verified; native full sequence execution/correspondence review pending' };
fs.writeFileSync(path.join(directory, 'source-fixture-correspondence.json'), JSON.stringify(record, null, 2) + '\n');
console.log(`${functions.length} Root fixture bodies and ${additionalFixtures.length} complete Trigger fixture/CSS uses verified; ordinary credit remains zero`);
