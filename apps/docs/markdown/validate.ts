// `pnpm docs:validate [route...]`, upstream's `docs-infra validate` for the section index pages.
// Regenerates each index from its child pages. Under CI it exits 1 when it wrote anything, so a
// stale index fails the build. A route such as `"(docs)/components"` limits it to that index.
import { execFileSync } from 'node:child_process';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { indexFiles, syncPageIndex } from './page-index.ts';

const path = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url));
const docs = path('..');
const routes = path('../src/routes/(docs)');
const lib = path('../../../src/lib');

const filters = process.argv.slice(2);
const updated: string[] = [];
for (const { file } of indexFiles(routes)) {
	const route = relative(path('../src/routes'), file).replace(/\/\+page\.md$/, '');
	if (filters.length && !filters.some((filter) => route.startsWith(filter))) continue;
	if (await syncPageIndex(file, { routes, lib })) updated.push(relative(docs, file));
}

if (!updated.length) {
	console.log('No files needed updating');
	process.exit(0);
}
console.log(`${updated.length} files updated:\n${updated.map((file) => `  ${file}`).join('\n')}`);
if (process.env.CI) {
	console.error(execFileSync('git', ['diff', '--', ...updated], { cwd: docs, encoding: 'utf8' }));
	console.error(
		'Generated files are out of date. Run `pnpm docs:validate` locally, then commit the results.'
	);
	process.exit(1);
}
