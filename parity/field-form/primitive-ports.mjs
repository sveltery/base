// Immutable declaration/complete native-body port mapping. MIT: UPSTREAM_LICENSE.
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url)), ts = require('typescript');
const inventory = JSON.parse(readFileSync(new URL('./upstream-inventory.json', import.meta.url), 'utf8'));
const port = 'packages/base/tests/dom/field-primitives-source.test.ts';
const text = readFileSync(new URL(`../../${port}`, import.meta.url), 'utf8'), tree = ts.createSourceFile(port, text, ts.ScriptTarget.Latest, true);
const ports = [];
function visit(node) {
  if (ts.isCallExpression(node) && node.expression.getText(tree) === 'it' && ts.isStringLiteral(node.arguments[0])) {
    const title = node.arguments[0].text, body = node.arguments[1].body;
    let owner = node.parent;
    while (owner && !(ts.isCallExpression(owner) && owner.expression.getText(tree) === 'describe')) owner = owner.parent;
    const family = owner.arguments[0].text.includes('Description') ? '/field/description/' : '/field/label/';
    const source = inventory.declarations.find(site => site.source.includes(family) && site.title === title);
    if (!source) throw new Error(`No immutable Field primitive source declaration for ${title}`);
    const assertionLines = [];
    function assertions(n) { if (ts.isCallExpression(n) && n.expression.getText(tree) === 'expect') assertionLines.push(tree.getLineAndCharacterOfPosition(n.getStart(tree)).line + 1); ts.forEachChild(n, assertions); }
    assertions(body);
    if (assertionLines.length !== source.assertions.length) throw new Error(`Incomplete assertion mapping for ${source.id}`);
    ports.push({ id: source.id, title, bodySha256: source.bodySha256, sourceAssertionLines: source.assertions.map(assertion => assertion.line), port, portDeclarationLine: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1,
      portBodySha256: createHash('sha256').update(body.getText(tree)).digest('hex'), portAssertionLines: assertionLines,
      adaptation: 'React renderer/state/JSX/ref helpers are replaced by the corresponding native Svelte fixture and flushSync. Native attributes/focus implement DOM matchers. Non-native label click uses native pointerdown plus click. Warning-count/substrings and all ordered source interactions/assertions are retained.',
      status: 'native-dom-port-passing-local-pending-final-gates', ordinaryDeclarationCredit: 0 });
  }
  ts.forEachChild(node, visit);
}
visit(tree);
if (ports.length !== 13) throw new Error(`Expected thirteen complete native Field primitive declarations, found ${ports.length}`);
const output = JSON.stringify({ upstream: inventory.upstream, fixture: 'packages/base/tests/dom/FieldPrimitiveSourceFixture.svelte', scope: 'Four Description and nine Label complete ordinary native declaration adaptations. React renderer/state/JSX/ref machinery becomes native Svelte ownership; source warning substrings and every source assertion remain unchanged. Framework helper substitutions remain subject to final review; no grouped supplement or skipped assertion earns ordinary credit.', ordinaryDeclarationCredit: 0, ports }, null, 2) + '\n';
const destination = new URL('./primitive-ports.json', import.meta.url);
if (process.argv.includes('--check')) { if (readFileSync(destination, 'utf8') !== output) throw new Error('Field primitive complete-body mapping differs'); }
else writeFileSync(destination, output);
console.log(`Field primitive native complete bodies: ${ports.length}; zero ordinary credit pending final gates`);
