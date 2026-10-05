import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { extractCurrentFamilyProjection } from '../native-family-projection.mjs';
const root = new URL('../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const sha = (body) => createHash('sha256').update(body).digest('hex');
const ts = createRequire(
  new URL('../../packages/base/package.json', import.meta.url),
)('typescript');
const parse = (path) => {
  const body = read(path);
  const source = path.endsWith('.svelte')
    ? [
        ...body.matchAll(
          /<script\b(?:[^>"']|"[^"]*"|'[^']*')*>([\s\S]*?)<\/script>/g,
        ),
      ]
        .map((match) => match[1])
        .join('\n')
    : body;
  return ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
};
const nodes = (root, predicate) => {
  const found = [];
  const visit = (node) => {
    if (predicate(node)) found.push(node);
    ts.forEachChild(node, visit);
  };
  visit(root);
  return found;
};
const expression = (node) => node.getText().replace(/\s+/g, '');
const variable = (root, name) => {
  const matches = nodes(
    root,
    (node) => ts.isVariableDeclaration(node) && node.name.getText() === name,
  );
  assert.equal(matches.length, 1, name);
  return matches[0].initializer;
};
const bodyOf = (root, name) => {
  const matches = nodes(
    root,
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === name,
  );
  assert.equal(matches.length, 1, name);
  return matches[0].body;
};
test('private anchor foundation keeps immutable source/assertions and zero deferred ordinary credit', () => {
  const ledger = JSON.parse(read('parity/anchor-positioning/ledger.json'));
  assert.equal(
    ledger.upstream.commit,
    '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c',
  );
  for (const source of ledger.sources)
    assert.equal(sha(read(source.snapshot)), source.sha256, source.source);
  assert.deepEqual(ledger.counts, {
    anchorWiringSites: 2,
    anchorWiringVariants: 3,
    hideSites: 2,
    hideVariants: 6,
    floatingLifecycleSites: 2,
    creditedOrdinarySites: 0,
    creditedOrdinaryVariants: 0,
  });
  for (const port of ledger.assertionPorts) {
    const source = ledger.sources.find((item) => item.source === port.source);
    const lines = read(source.snapshot).split('\n');
    const assertions = [];
    for (const declaration of port.declarations) {
      const end = lines.findIndex(
        (line, i) =>
          i >= declaration.line && (line === '  });' || line === '  );'),
      );
      const body = lines.slice(declaration.line - 1, end + 1).join('\n') + '\n';
      assert.equal(sha(body), declaration.bodySha256);
      assert.deepEqual(
        body.match(/expect\([\s\S]*?;/g),
        declaration.assertions,
      );
      assertions.push(...declaration.assertions);
    }
    const normalize = (text) => text.replace(/\s+/g, '');
    assert.deepEqual(
      read(port.local)
        .match(/expect\([\s\S]*?;/g)
        .map(normalize),
      assertions.map(normalize),
    );
    assert.equal(port.status, 'deferred-browser-gate');
  }
  assert.deepEqual(ledger.familyCredit, {
    menu: 0,
    popover: 0,
    tooltip: 0,
    select: 0,
  });
  for (const license of ['UPSTREAM_LICENSE', 'FLOATING_UI_LICENSE'])
    assert.match(
      read(`parity/anchor-positioning/${license}`),
      /Permission is hereby granted/,
    );
  for (const path of [
    'packages/base/tests/dom/anchor-positioning-lifecycle.test.ts',
    'tests/browser/anchor-positioning.spec.ts',
    'scripts/check-anchor-positioning-package.sh',
  ])
    assert.ok(existsSync(new URL(path, root)));
  const browser = read('tests/browser/anchor-positioning.spec.ts');
  assert.doesNotMatch(browser, /(?:test|describe)\.(?:skip|fixme|only)\s*\(/);
  const controller = read(
    'packages/base/src/lib/internals/anchor-positioning/useFloating.svelte.ts',
  );
  assert.doesNotMatch(controller.replace(/\/\/[^\n]*/g, ''), /platform\s*:/);
  assert.match(
    controller,
    /await computePosition\(currentReference, currentFloating, config\)/,
  );
  const anchor = read(
    'packages/base/src/lib/internals/anchor-positioning/useAnchorPositioning.svelte.ts',
  );
  // Authored structure check: geometry-only users retain the raw hook; actual
  // popup consumers now use the selected Original root/store/tree bridge.
  assert.match(
    anchor,
    /const position = rootContext[\s\S]*useBaseUIFloating\([\s\S]*: useFloating\(getFloatingOptions\)/,
  );
  const bridge = read(
    'packages/base/src/lib/floating-ui/hooks/useFloating.svelte.ts',
  );
  assert.match(
    bridge,
    /useFloating as usePosition[\s\S]*anchor-positioning\/useFloating\.svelte\.js/,
  );
  assert.doesNotMatch(
    bridge.replace(/\/\/[^\n]*/g, ''),
    /\bcomputePosition\s*\(/,
  );
  assert.match(
    anchor,
    /createPositioningPolicy\(currentOptions, \(\) => currentArrow, isCurrent, currentMountSide\)/,
  );
  const pkg = JSON.parse(read('packages/base/package.json'));
  assert.equal(pkg.exports['./anchor-positioning'], undefined);
  assert.equal(pkg.dependencies['@floating-ui/dom'], '1.8.0');
  assert.equal(pkg.dependencies['@floating-ui/utils'], '0.2.12');
});

test('selected root-store bridge preserves reference ownership and delegates one DOM driver', () => {
  const anchor = parse(
    'packages/base/src/lib/internals/anchor-positioning/useAnchorPositioning.svelte.ts',
  );
  assert.equal(
    expression(variable(anchor, 'rootContext')),
    'untrack(()=>options.floatingRootContext)',
  );
  const selected = variable(anchor, 'position');
  assert(ts.isConditionalExpression(selected));
  assert.equal(expression(selected.condition), 'rootContext');
  assert.equal(
    expression(selected.whenTrue),
    'useBaseUIFloating(()=>({...getFloatingOptions(),rootContext,nodeId:options.nodeId,externalTree:options.externalTree}))',
  );
  assert.equal(
    expression(selected.whenFalse),
    'useFloating(getFloatingOptions)',
  );

  const bridgePath =
    'packages/base/src/lib/floating-ui/hooks/useFloating.svelte.ts';
  const bridge = parse(bridgePath);
  const forwarding = nodes(
    bodyOf(bridge, 'useBaseUIFloating'),
    ts.isReturnStatement,
  );
  assert.equal(forwarding.length, 1);
  assert.equal(
    expression(forwarding[0].expression),
    'useFloatingWithStore(getOptions)',
  );
  const business = bodyOf(bridge, 'useFloatingWithStore');
  assert.equal(
    expression(variable(business, 'store')),
    '$derived(options.rootContext)',
  );
  for (const name of [
    'referenceElement',
    'floatingElement',
    'domReferenceElement',
    'open',
    'floatingId',
  ]) {
    assert.equal(
      expression(variable(business, name)),
      `$derived(store.useState('${name}'))`,
    );
  }
  assert.equal(
    expression(variable(business, 'position')),
    'usePosition(()=>({...options,elements:{reference:positionReference||referenceElement,floating:floatingElement,},}))',
  );
  assert.equal(
    expression(variable(business, 'tree')),
    '$derived(options.externalTree??contextTree)',
  );
  assert.equal(
    expression(variable(business, 'syncedFloatingElement')),
    '$derived(localFloatingElement===undefined?floatingElement:localFloatingElement)',
  );
  const updates = nodes(
    business,
    (node) =>
      ts.isCallExpression(node) &&
      expression(node.expression) === 'store.update',
  );
  assert.equal(updates.length, 1);
  assert.equal(
    expression(updates[0].arguments[0]),
    '{referenceElement:localDomReference??null,domReferenceElement:localDomReference===undefined?domReferenceElement:localDomReferenceElement,floatingElement:syncedFloatingElement,}',
  );

  const setPosition = bodyOf(business, 'setPositionReference');
  assert.equal(
    expression(variable(setPosition, 'computedPositionReference')),
    'isElement(node)?{getBoundingClientRect:()=>node.getBoundingClientRect(),getClientRects:()=>node.getClientRects(),contextElement:node}:node',
  );
  assert.deepEqual(setPosition.statements.slice(1).map(expression), [
    'positionReference=computedPositionReference;',
    'position.refs.setReference(computedPositionReference);',
  ]);
  const setReference = bodyOf(business, 'setReference');
  assert.equal(setReference.statements.length, 2);
  assert(setReference.statements.every(ts.isIfStatement));
  assert.equal(
    expression(setReference.statements[0].expression),
    'isElement(node)||node===null',
  );
  assert.equal(
    expression(setReference.statements[0].thenStatement),
    '{domReferenceRef.current=node;localDomReference=node;}',
  );
  assert.equal(
    expression(setReference.statements[1].expression),
    'isElement(position.refs.reference.current)||position.refs.reference.current===null||(node!==null&&!isElement(node))',
  );
  assert.equal(
    expression(setReference.statements[1].thenStatement),
    '{position.refs.setReference(node);}',
  );
  const context = variable(business, 'context');
  assert(ts.isObjectLiteralExpression(context));
  assert.equal(
    expression(
      context.properties.find((node) => node.name?.getText() === 'rootStore'),
    ),
    'getrootStore(){returnstore;}',
  );
  assert.equal(
    expression(
      context.properties.find(
        (node) => node.name?.getText() === 'onOpenChange',
      ),
    ),
    'onOpenChange(nextOpen,details){store.setOpen(nextOpen,details);}',
  );
  const assignments = nodes(
    business,
    (node) =>
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken,
  );
  assert.equal(
    expression(variable(business, 'dataRef')),
    'store.context.dataRef',
  );
  assert(
    assignments.some(
      (node) => expression(node) === 'dataRef.current.floatingContext=context',
    ),
  );
  assert(
    assignments.some((node) => expression(node) === 'node.context=context'),
  );
  const publicationCleanup = nodes(
    business,
    (node) =>
      ts.isIfStatement(node) &&
      expression(node.expression) ===
        'dataRef.current.floatingContext===context',
  );
  assert.equal(publicationCleanup.length, 1);
  assert.equal(
    expression(publicationCleanup[0].thenStatement),
    'deletedataRef.current.floatingContext;',
  );
  const nodeCleanup = nodes(
    business,
    (node) =>
      ts.isIfStatement(node) &&
      expression(node.expression) === 'node?.context===context',
  );
  assert.equal(nodeCleanup.length, 1);
  assert.equal(
    expression(nodeCleanup[0].thenStatement),
    'node.context=undefined;',
  );

  // Every used module is inspected for a positioning call: the bridge selects
  // real store elements, while the existing DOM driver owns async geometry.
  const closure = extractCurrentFamilyProjection('menu-family');
  const calls = closure.modules.flatMap((module) =>
    nodes(
      parse(module.source),
      (node) =>
        ts.isCallExpression(node) &&
        expression(node.expression) === 'computePosition',
    ).map((node) => ({ source: module.source, call: expression(node) })),
  );
  assert.deepEqual(calls, [
    {
      source:
        'packages/base/src/lib/internals/anchor-positioning/useFloating.svelte.ts',
      call: 'computePosition(currentReference,currentFloating,config)',
    },
  ]);
  const driver = parse(calls[0].source);
  assert.equal(
    expression(variable(driver, 'reference')),
    '$derived(options.elements?options.elements.reference||localReference:positionReference??domReference)',
  );
  const current = variable(driver, 'isCurrent');
  assert.equal(
    expression(current),
    '(node:HTMLElement)=>lifetime===generation&&revision===request&&node===currentFloating&&node.isConnected',
  );
  const afterCompute = nodes(
    driver,
    (node) =>
      ts.isIfStatement(node) &&
      expression(node.expression) === '!isCurrent(currentFloating)',
  );
  assert.equal(afterCompute.length, 1);
  assert.equal(expression(afterCompute[0].thenStatement), 'return;');
});
