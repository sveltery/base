// `pnpm docs:validate [route...]`, upstream's `docs-infra validate`. Regenerates each page's
// `types.md` from its `types.ts`, and each section index from its child pages. Under CI it exits 1
// when it wrote anything, so a stale file fails the build. A route such as `"(docs)/components"`
// limits it to the files under that route.
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { indexFiles, syncPageIndex } from './page-index.ts';
import { readStub, syncTypes } from './types.ts';

const path = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url));
const docs = path('..');
const routes = path('../src/routes/(docs)');
const lib = path('../../../src/lib');

const filters = process.argv.slice(2);
const selected = (file: string) => {
	const route = relative(path('../src/routes'), dirname(file));
	return !filters.length || filters.some((filter) => route.startsWith(filter));
};
const updated: string[] = [];

const stubs = (dir: string): string[] =>
	readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
		entry.isDirectory()
			? stubs(join(dir, entry.name))
			: entry.name === 'types.ts'
				? [join(dir, entry.name)]
				: []
	);
for (const file of stubs(routes).filter(selected)) {
	if (await syncTypes(file, readStub(file, lib), routes)) {
		updated.push(relative(docs, join(dirname(file), 'types.md')));
	}
}

for (const { file } of indexFiles(routes).filter(({ file }) => selected(file))) {
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
