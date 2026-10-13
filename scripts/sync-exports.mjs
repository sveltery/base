// Writes package.json `exports` from the entry folders in src/lib: every folder with an
// index.ts, nested ones included (`./form/kit`), except `internal`.
// `--check` fails instead of writing when the map is out of date.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

const pkgUrl = new URL('../package.json', import.meta.url);
const lib = new URL('../src/lib/', import.meta.url);

const entry = (dir) => ({
	types: `./dist/${dir}index.d.ts`,
	svelte: `./dist/${dir}index.js`,
	default: `./dist/${dir}index.js`
});

/** @param {string} dir a folder under src/lib, `''` or ending in `/` */
function entryFolders(dir) {
	return readdirSync(new URL(dir, lib), { withFileTypes: true })
		.filter((d) => d.isDirectory() && !(dir === '' && d.name === 'internal'))
		.flatMap((d) => {
			const folder = `${dir}${d.name}/`;
			const own = existsSync(new URL(`${folder}index.ts`, lib)) ? [folder] : [];
			return [...own, ...entryFolders(folder)];
		});
}

const exports = { '.': entry('') };
for (const folder of entryFolders('').sort((a, b) => (a.slice(0, -1) < b.slice(0, -1) ? -1 : 1))) {
	exports[`./${folder.slice(0, -1)}`] = entry(folder);
}

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
