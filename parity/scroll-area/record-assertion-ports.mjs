// Original declaration provenance stays immutable; these are candidate ports,
// never inferred passed/unchanged counts. MIT: UPSTREAM_LICENSE.
import ts from '../../packages/base/node_modules/typescript/lib/typescript.js';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const directory = import.meta.dirname;
const original = JSON.parse(
  readFileSync(`${directory}/original-assertions.json`, 'utf8'),
);
const testFiles = [
  'tests/browser/scroll-area.spec.ts',
  'packages/base/tests/dom/scroll-area.test.ts',
];
const candidates = [];
for (const path of testFiles) {
  const body = readFileSync(`${directory}/../../${path}`, 'utf8');
  const ast = ts.createSourceFile(path, body, ts.ScriptTarget.Latest, true);
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ['it', 'test'].includes(node.expression.getText(ast))
    ) {
      const title = node.arguments[0];
      if (
        title &&
        (ts.isStringLiteralLike(title) || ts.isTemplateExpression(title))
      ) {
        const text = title.getText(ast);
        const references = [
          ...text.matchAll(/\b(R|V|S|T|Cn|C):(\d+(?:\/\d+)*)/g),
        ].flatMap((match) =>
          match[2].split('/').map((line) => `${match[1]}:${line}`),
        );
        candidates.push({
          path,
          line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
          title: text,
          references,
          bodySha256: createHash('sha256')
            .update(node.getText(ast))
            .digest('hex'),
          status: path.includes('/browser/')
            ? 'pending-final-head-secured-paired-execution'
            : 'native-dom-body-executed-12-tests-final-verification-pending',
        });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
}
const prefixes = {
  root: 'R',
  viewport: 'V',
  scrollbar: 'S',
  thumb: 'T',
  corner: 'C',
  content: 'Cn',
};
const assertions = original.assertions.map((assertion) => {
  const part = assertion.source.split('/').at(-2);
  const reference = `${prefixes[part]}:${assertion.line}`;
  const ports = candidates.filter((candidate) =>
    candidate.references.includes(reference),
  );
  return {
    originalId: assertion.id,
    originalKind: assertion.kind,
    originalTitle: assertion.title,
    originalBodySha256: assertion.sha256,
    originalFileSha256: assertion.fileSha256,
    parameterizedVariants:
      assertion.kind === 'parameterized-declaration' ? [0, 1, 2] : undefined,
    status:
      assertion.kind === 'conformance-call'
        ? 'native-conformance-subset-mapped-full-helper-unchanged-credit-zero'
        : assertion.line === 951 && part === 'root'
          ? 'native-context-effect-identity-observation-react-committed-render-count-not-ported'
          : ports.length
            ? 'candidate-business-body-ports-expectations-retained-final-head-execution-and-whole-review-pending'
            : 'missing-port-explicit',
    candidatePorts: ports.map(({ references, ...port }) => port),
    unchangedCredit: 0,
    limitation:
      assertion.kind === 'conformance-call'
        ? 'Original15 helper declarations per call expanded separately; public refs/props/styles/classes/default/custom native host probes are subsets, JSX element clone/render-specific assertions have native snippet correspondence and zero unchanged credit.'
        : assertion.line === 951 && part === 'root'
          ? 'Native12th DOM body verifies source corner pickState identity. Native context setup/effect semantics differ from React committed ContextProbe render accounting; no generic business waiver.'
          : 'Combined behavior ports preserve source identifiers and full archived bodies but do not count as one-to-one unchanged declarations. Scope/expectations need independent whole-source review.',
  };
});
const output = {
  pin: original.pin,
  immutableOriginalInventory: 'original-assertions.json',
  categories: {
    ordinaryDeclarations: 95,
    parameterizedDeclarations: 1,
    parameterizedVariants: 3,
    conformanceCalls: 6,
    unchangedOriginalCredit: 0,
  },
  assertions,
  nativeSupplements: candidates.filter(
    (candidate) => candidate.references.length === 0,
  ),
  typeAndInstalledPublicEvidence: {
    script: 'scripts/check-scroll-area-package.sh',
    positive:
      'root/subpath namespace, six aliases, twelve Props/State equalities, native snippets and all undefined/default signatures; exactOptional/noUnchecked/skipLibCheck:false',
    negative:
      'six intended TS expect-error signatures plus four unsuppressed Svelte diagnostics',
    ssr: 'three repeated native Root constant CSS styles with nonce, public aliases/composition and descriptive provider error',
    dom: 'actual installed consumer compilation/mount/unmount, six-part composition and ref/style cleanup',
  },
  conformanceDetails: 'test-helper-graph.json and conformance-accounting.json',
  note: '123 collected final paired/native probes are distinct from95 original ordinary declarations, three parameterized variants and90 helper instances. No failed/cancelled/unexecuted gate is waived; final exact-head evidence remains required.',
};
writeFileSync(
  `${directory}/assertion-ports.json`,
  JSON.stringify(output, null, 2) + '\n',
);
console.log(
  JSON.stringify({
    ordinary: 95,
    parameterized: 1,
    variants: 3,
    conformance: 6,
    missing: assertions
      .filter((row) => row.status === 'missing-port-explicit')
      .map((row) => row.originalId),
    unchangedCredit: 0,
  }),
);
