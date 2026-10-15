// Copies the built workspace packages into dist/_packages and points the
// base dist at them. A git install of @sveltery/base then needs no other
// git dependency, which pnpm blocks by default.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const bundled = path.join(dist, '_packages');
const packages = {
	'@sveltery/utils': 'utils',
	'@sveltery/floating-ui-svelte': 'floating-ui-svelte'
};
const IMPORT = /(['"])(@sveltery\/(?:utils|floating-ui-svelte))\1/g;

fs.rmSync(bundled, { recursive: true, force: true });
for (const folder of Object.values(packages)) {
	const source = path.join(root, 'packages', folder, 'dist');
	if (!fs.existsSync(source)) throw new Error(`Build packages/${folder} before bundling it.`);
	fs.cpSync(source, path.join(bundled, folder), {
		recursive: true,
		filter: (file) => !/\.spec\.[^/]*$|[/\\]__tests__$/.test(file)
	});
}

/** @param {string} directory */
function* files(directory) {
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const file = path.join(directory, entry.name);
		if (entry.isDirectory()) yield* files(file);
		else if (/\.(js|svelte|d\.ts)$/.test(entry.name)) yield file;
	}
}

for (const file of files(dist)) {
	const source = fs.readFileSync(file, 'utf8');
	const next = source.replace(IMPORT, (_match, quote, name) => {
		const target = path.join(bundled, packages[name], 'index.js');
		let relative = path.relative(path.dirname(file), target).split(path.sep).join('/');
		if (!relative.startsWith('.')) relative = `./${relative}`;
		return `${quote}${relative}${quote}`;
	});
	if (next !== source) fs.writeFileSync(file, next);
}
