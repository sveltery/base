// Complete immutable Error/Validity/Item declaration bodies. MIT: UPSTREAM_LICENSE.
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url)), ts = require('typescript');
const inventory = JSON.parse(readFileSync(new URL('./upstream-inventory.json', import.meta.url), 'utf8'));
const port = 'packages/base/tests/dom/field-validation-source.test.ts', fixture = 'packages/base/tests/dom/FieldValidationSourceFixture.svelte';
const text = readFileSync(new URL(`../../${port}`, import.meta.url), 'utf8'), tree = ts.createSourceFile(port, text, ts.ScriptTarget.Latest, true);
const ports = [];
function visit(node) {
  if (ts.isCallExpression(node) && node.expression.getText(tree) === 'it') {
    const title = ts.isStringLiteral(node.arguments[0]) ? node.arguments[0].text : node.arguments[0].getText(tree), body = node.arguments[1].body;
    const owners = [];
    for (let owner = node.parent; owner; owner = owner.parent) {
      if (ts.isCallExpression(owner) && owner.expression.getText(tree) === 'describe') owners.push(owner.arguments[0].text);
    }
    const family = owners.some(owner => owner.includes('Field.Error')) ? '/field/error/' : owners.some(owner => owner.includes('Field.Item')) ? '/field/item/' : '/field/validity/';
    const candidates = inventory.declarations.filter(site => site.source.includes(family) && site.title === title);
    const source = candidates.length === 1 ? candidates[0] : candidates.find(site => site.line === (owners.includes('validationMode=onSubmit') ? 103 : 136));
    if (!source) throw new Error(`No exact immutable Field validation declaration for ${title}`);
    const assertionLines = [];
    function assertions(n) { if (ts.isCallExpression(n) && n.expression.getText(tree) === 'expect') assertionLines.push(tree.getLineAndCharacterOfPosition(n.getStart(tree)).line + 1); ts.forEachChild(n, assertions); }
    assertions(body);
    if (assertionLines.length !== source.assertions.length) throw new Error(`Incomplete assertion mapping for ${source.id}`);
    ports.push({ id: source.id, title, bodySha256: source.bodySha256, sourceAssertionLines: source.assertions.map(assertion => assertion.line),
      port, portDeclarationLine: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1, portBodySha256: createHash('sha256').update(body.getText(tree)).digest('hex'), portAssertionLines: assertionLines,
      fixture, fixtureScenario: /render\('([^']+)'/.exec(body.getText(tree))?.[1],
      executions: ts.isTemplateExpression(node.arguments[0]) ? ['onBlur', 'onSubmit'] : ['native'],
      adaptation: 'JSX/React renderer/state become native Svelte fixtures and flushSync. React change events become native input events; focus/blur and submit click use actual DOM methods. Native attributes/text/list state implement DOM matchers; visible assertions retain ancestor style/hidden checks. Validity render callback and Item render state are observed through native snippets. Every source assertion and ordered interaction remains mapped.',
      status: 'native-dom-port-passing-local-pending-final-gates', ordinaryDeclarationCredit: 0 });
  }
  ts.forEachChild(node, visit);
}
visit(tree);
if (ports.length !== 22 || new Set(ports.map(port => port.id)).size !== 22) throw new Error('Expected 22 unique complete Error/Validity/Item declarations');
const output = JSON.stringify({ upstream: inventory.upstream, fixture, fixtureSha256: createHash('sha256').update(readFileSync(new URL(`../../${fixture}`, import.meta.url))).digest('hex'),
  scope: 'Sixteen Error, five Validity and one Item complete ordinary native declaration adaptations. The stale-custom-error template remains one declaration with both onBlur/onSubmit executions (23 total). Native badInput and two Error animation declarations remain separately unported. No grouped supplement or skipped assertion earns ordinary credit.',
  ordinaryDeclarationSites: ports.length, nativeExecutions: ports.reduce((count, port) => count + port.executions.length, 0), ordinaryDeclarationCredit: 0, ports }, null, 2) + '\n';
const destination = new URL('./validation-ports.json', import.meta.url);
if (process.argv.includes('--check')) { if (readFileSync(destination, 'utf8') !== output) throw new Error('Field validation complete-body mapping differs'); }
else writeFileSync(destination, output);
console.log(`Field validation native complete bodies: ${ports.length}, 23 executions; zero ordinary credit pending final gates`);
