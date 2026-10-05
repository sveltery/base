// ATTW's CLI profiles require Node16 .svelte resolution, which Svelte libraries do not provide.
// Use the public API's supported-mode filter; retain the complete, unmodified analysis.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  checkPackage,
  createPackageFromTarballData,
} from '@arethetypeswrong/core';
import {
  allProblemKinds,
  filterProblems,
} from '@arethetypeswrong/core/problems';

const [tarball, report, packageDirectory = 'packages/base'] =
  process.argv.slice(2);
const sourceMetadata = JSON.parse(
  readFileSync(join(packageDirectory, 'package.json'), 'utf8'),
);
const nodeESMEntries = {
  '@sveltery/base': ['./merge-props'],
  '@sveltery/utils': Object.keys(sourceMetadata.exports),
}[sourceMetadata.name];
assert(
  nodeESMEntries,
  `${sourceMetadata.name}: reviewed consumer resolution profile required`,
);
assert(
  tarball && report,
  'Usage: check-package-types.mjs <actual.tgz> <analysis.json>',
);
const packageData = createPackageFromTarballData(
  new Uint8Array(readFileSync(tarball)),
);
const analysis = await checkPackage(packageData);
writeFileSync(report, JSON.stringify(analysis, null, 2) + '\n');
assert.equal(analysis.packageName, sourceMetadata.name);
assert.equal(
  analysis.types?.kind,
  'included',
  'published declarations required',
);
assert(Array.isArray(analysis.problems), 'complete ATTW problem data required');
for (const problem of analysis.problems)
  assert(
    allProblemKinds.includes(problem.kind),
    `unknown ATTW problem: ${problem.kind}`,
  );
const entries = Object.keys(analysis.entrypoints);
const metadata = JSON.parse(
  packageData.readFile(`/node_modules/${analysis.packageName}/package.json`),
);
assert.deepEqual(
  entries.sort(),
  Object.keys(metadata.exports).sort(),
  'every actual public export must be analyzed',
);
assert(entries.length > 0, 'actual public entrypoints required');
for (const entry of entries)
  assert(
    analysis.entrypoints[entry].resolutions.bundler,
    `${entry}: Bundler analysis required`,
  );
const bundlerProblems = filterProblems(analysis, { resolutionKind: 'bundler' });
assert.deepEqual(
  bundlerProblems,
  [],
  'ATTW problems in supported Bundler resolution',
);
for (const entry of nodeESMEntries) {
  assert(
    analysis.entrypoints[entry]?.resolutions['node16-esm'],
    `${entry}: plain-JS ESM analysis required`,
  );
  assert.deepEqual(
    filterProblems(analysis, {
      entrypoint: entry,
      resolutionKind: 'node16-esm',
    }),
    [],
    `${entry}: ATTW problems in plain-JS Node16 ESM resolution`,
  );
}
console.log(
  `${analysis.packageName} ATTW: all ${entries.length} public entries pass Bundler; ${nodeESMEntries.join(', ')} pass Node16 ESM. Complete analysis: ${report}`,
);
console.log(
  'Type resolution does not establish plain-Node execution of Svelte components or rune modules; installed compiler-backed consumers remain required.',
);
if (analysis.packageName === '@sveltery/base') {
  console.log(
    'Base component entries require Svelte-aware tooling; Node16 .svelte declaration resolution is unsupported.',
  );
}
