// Immutable declaration/complete native-body port mapping. MIT: UPSTREAM_LICENSE.
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url)), ts = require('typescript');
const inventory = JSON.parse(readFileSync(new URL('./upstream-inventory.json', import.meta.url), 'utf8'));
const port = 'packages/base/tests/dom/fieldset-source.test.ts';
const text = readFileSync(new URL(`../../${port}`, import.meta.url), 'utf8'), tree = ts.createSourceFile(port, text, ts.ScriptTarget.Latest, true);
const ports = [];
function visit(node) {
  if (ts.isCallExpression(node) && node.expression.getText(tree) === 'it' && ts.isStringLiteral(node.arguments[0])) {
    const title = node.arguments[0].text, body = node.arguments[1].body;
    const source = inventory.declarations.find(site => site.source.includes('/fieldset/') && site.title === title);
    if (!source) throw new Error(`No immutable Fieldset source declaration for ${title}`);
    const assertionLines = [];
    function assertions(n) { if (ts.isCallExpression(n) && n.expression.getText(tree) === 'expect') assertionLines.push(tree.getLineAndCharacterOfPosition(n.getStart(tree)).line + 1); ts.forEachChild(n, assertions); }
    assertions(body);
    if (assertionLines.length !== source.assertions.length) throw new Error(`Incomplete assertion mapping for ${source.id}`);
    ports.push({ id: source.id, title, bodySha256: source.bodySha256, sourceAssertionLines: source.assertions.map(assertion => assertion.line), port, portDeclarationLine: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1,
      portBodySha256: createHash('sha256').update(body.getText(tree)).digest('hex'), portAssertionLines: assertionLines,
      adaptation: 'React renderer/state/JSX are replaced by the corresponding native Svelte fixture and flushSync. Attribute matchers use native presence/value; disabled matcher uses native :disabled. Every source assertion and ordered interaction is retained.',
      status: 'native-dom-port-passing-local-pending-final-gates', ordinaryDeclarationCredit: 0 });
  }
  ts.forEachChild(node, visit);
}
visit(tree);
if (ports.length !== 7) throw new Error(`Expected seven complete native Fieldset declarations, found ${ports.length}`);
const output = JSON.stringify({ upstream: inventory.upstream, fixture: 'packages/base/tests/dom/FieldsetSourceFixture.svelte', scope: 'Three native Root and four native Legend complete ordinary declaration adaptations. Consumer-dependent Root and two Legend SSR/hydration declarations are separate and unported; no grouped supplement or skipped assertion earns ordinary credit.', ordinaryDeclarationCredit: 0, ports }, null, 2) + '\n';
const destination = new URL('./fieldset-ports.json', import.meta.url);
if (process.argv.includes('--check')) { if (readFileSync(destination, 'utf8') !== output) throw new Error('Fieldset complete-body mapping differs'); }
else writeFileSync(destination, output);
console.log(`Fieldset native complete bodies: ${ports.length}; zero ordinary credit pending final gates`);
