// svelte-package only warns when it cannot emit a declaration, so a module can ship without types.
// Fails when a published `dist` module has no `.d.ts` beside it.
import { readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;

function* modules(dir) {
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) yield* modules(path);
		else if (/\.js$/.test(name) && !/\.(spec|test)\.js$/.test(name)) yield path;
	}
}

const missing = [...modules(dist)].filter((path) => !existsSync(path.replace(/\.js$/, '.d.ts')));
for (const path of missing) console.error(`missing types: ${relative(dist, path)}`);
if (missing.length) {
	console.error('Export the types each declaration names, so svelte-package can emit it.');
	process.exit(1);
}
console.log('every dist module has a .d.ts');
