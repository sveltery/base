// Writes package.json `exports` from the component folders in src/lib.
// `--check` fails instead of writing when the map is out of date.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

const pkgUrl = new URL('../package.json', import.meta.url);
const lib = new URL('../src/lib/', import.meta.url);

const entry = (dir) => ({
	types: `./dist/${dir}index.d.ts`,
	svelte: `./dist/${dir}index.js`,
	default: `./dist/${dir}index.js`
});

const folders = readdirSync(lib, { withFileTypes: true })
	.filter((d) => d.isDirectory() && d.name !== 'internal')
	.filter((d) => existsSync(new URL(`${d.name}/index.ts`, lib)))
	.map((d) => d.name)
	.sort();

const exports = { '.': entry('') };
for (const name of folders) exports[`./${name}`] = entry(`${name}/`);

const source = readFileSync(pkgUrl, 'utf8');
const pkg = JSON.parse(source);
pkg.exports = exports;
const next = `${JSON.stringify(pkg, null, '\t')}\n`;

if (process.argv.includes('--check')) {
	if (next !== source) {
		console.error('package.json exports are out of date. Run `node scripts/sync-exports.mjs`.');
		process.exit(1);
	}
} else {
	writeFileSync(pkgUrl, next);
}
