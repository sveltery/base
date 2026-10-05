// ATTW's CLI profiles require Node16 .svelte resolution, which Svelte libraries do not provide.
// Use the public API's supported-mode filter; retain the complete, unmodified analysis.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { checkPackage, createPackageFromTarballData } from '@arethetypeswrong/core';
import { allProblemKinds, filterProblems } from '@arethetypeswrong/core/problems';

const [tarball, report] = process.argv.slice(2);
assert(tarball && report, 'Usage: check-package-types.mjs <actual.tgz> <analysis.json>');
const packageData = createPackageFromTarballData(new Uint8Array(readFileSync(tarball)));
const analysis = await checkPackage(packageData);
writeFileSync(report, JSON.stringify(analysis, null, 2) + '\n');
assert.equal(analysis.packageName, '@sveltery/base');
assert.equal(analysis.types?.kind, 'included', 'published declarations required');
assert(Array.isArray(analysis.problems), 'complete ATTW problem data required');
for (const problem of analysis.problems) assert(allProblemKinds.includes(problem.kind), `unknown ATTW problem: ${problem.kind}`);
const entries = Object.keys(analysis.entrypoints);
const metadata = JSON.parse(packageData.readFile(`/node_modules/${analysis.packageName}/package.json`));
assert.deepEqual(entries.sort(), Object.keys(metadata.exports).sort(), 'every actual public export must be analyzed');
assert(entries.includes('.') && entries.includes('./merge-props'), 'root and plain-JS entry required');
for (const entry of entries) assert(analysis.entrypoints[entry].resolutions.bundler, `${entry}: Bundler analysis required`);
const bundlerProblems = filterProblems(analysis, { resolutionKind: 'bundler' });
assert.deepEqual(bundlerProblems, [], 'ATTW problems in supported Bundler resolution');
const plainESMProblems = filterProblems(analysis, { entrypoint: './merge-props', resolutionKind: 'node16-esm' });
assert(analysis.entrypoints['./merge-props'].resolutions['node16-esm'], 'plain-JS ESM analysis required');
assert.deepEqual(plainESMProblems, [], 'ATTW problems in plain-JS Node16 ESM resolution');
console.log(`ATTW: all ${entries.length} public entries pass Bundler; merge-props passes Node16 ESM. Complete analysis: ${report}`);
console.log('Svelte component entries require Svelte-aware tooling; Node16 .svelte declaration resolution is unsupported.');
