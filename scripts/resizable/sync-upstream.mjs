// Copies react-resizable-panels' framework-free source into src/lib/resizable/engine, applies
// patches/*.patch, then formats the copies with the repository's Prettier config.
// Usage: node scripts/resizable/sync-upstream.mjs <react-resizable-panels checkout at the pinned tag>
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';

const VERSION = '4.5.8';
const COPIED = [
	'constants.ts',
	'types.ts',
	'global',
	'utils',
	'vendor',
	'components/group/sortByElementOffset.ts',
	'components/group/sortByElementOffset.test.ts',
	'components/group/auto-save'
];
const SKIPPED = [
	'utils/parseNumericStyleValue.ts',
	'utils/parseNumericStyleValue.test.ts',
	'global/test/moveSeparator.ts'
];

const checkout = process.argv[2];
if (!checkout) throw new Error('Pass the path of a react-resizable-panels checkout.');
const version = JSON.parse(readFileSync(join(checkout, 'package.json'), 'utf8')).version;
if (version !== VERSION)
	throw new Error(`Expected react-resizable-panels ${VERSION}, found ${version}.`);

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const source = join(checkout, 'lib');
const target = join(root, 'src/lib/resizable/engine');

for (const path of COPIED) {
	rmSync(join(target, path), { recursive: true, force: true });
	cpSync(join(source, path), join(target, path), { recursive: true });
}
for (const path of SKIPPED) rmSync(join(target, path));

function* files(path) {
	if (!existsSync(path)) return;
	if (!path.endsWith('.ts')) {
		for (const entry of readdirSync(path)) yield* files(join(path, entry));
		return;
	}
	yield path;
}

const copies = COPIED.flatMap((entry) => [...files(join(target, entry))]);
for (const path of copies) {
	const text = readFileSync(path, 'utf8');
	writeFileSync(
		path,
		text.replace(/((?:from|import)\s+")(\.{1,2}\/[^"]+?)(?<!\.js)"/g, '$1$2.js"')
	);
}

const patches = join(here, 'patches');
for (const patch of readdirSync(patches)
	.filter((name) => name.endsWith('.patch'))
	.sort()) {
	execFileSync('git', ['apply', `--directory=${relative(root, target)}`, join(patches, patch)], {
		cwd: root,
		stdio: 'inherit'
	});
}

for (const path of copies.filter(existsSync)) {
	const options = await prettier.resolveConfig(path);
	writeFileSync(
		path,
		await prettier.format(readFileSync(path, 'utf8'), { ...options, filepath: path })
	);
}
