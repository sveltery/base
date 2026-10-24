// Fails when src/lib/index.ts re-exports a folder that imports an optional peer dependency.
// Every `@sveltery/base` import loads the root barrel, so an optional peer stays behind its subpath.
import { readdirSync, readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const lib = new URL('../src/lib/', import.meta.url);
const optional = Object.entries(pkg.peerDependenciesMeta ?? {})
	.filter(([, meta]) => meta.optional)
	.map(([name]) => name);

const importsOptional = (source) =>
	[...source.matchAll(/\bfrom\s+['"]([^'"]+)['"]|\bimport\s*\(?\s*['"]([^'"]+)['"]/g)].some(
		([, a, b]) => optional.some((name) => (a ?? b) === name || (a ?? b).startsWith(`${name}/`))
	);

const barrel = readFileSync(new URL('index.ts', lib), 'utf8');
const exported = new Set([...barrel.matchAll(/from\s+['"]\.\/([^/'"]+)\//g)].map(([, f]) => f));

const failures = readdirSync(lib, { recursive: true, withFileTypes: true })
	.filter((entry) => entry.isFile() && /\.(ts|js|svelte)$/.test(entry.name))
	.map((entry) => `${entry.parentPath}/${entry.name}`.slice(lib.pathname.length))
	.filter((file) => exported.has(file.split('/')[0]))
	.filter((file) => importsOptional(readFileSync(new URL(file, lib), 'utf8')));

if (failures.length) {
	console.error(
		`src/lib/index.ts must not export a folder that imports an optional peer (${optional.join(', ')}):`
	);
	for (const file of failures) console.error(`  src/lib/${file}`);
	process.exit(1);
}
