// Proves the forms API turns mistakes into type errors. svelte-check ignores `@ts-expect-error`
// in templates, so each probe in type-probes/form names the error it must produce in a leading
// `<!-- expect-error: ... -->` comment. A probe without that comment must have no errors.
// The probes sit outside `src`, so `pnpm check` on the main tsconfig never sees them.
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const probeDir = path.join(root, 'type-probes', 'form');
const EXPECT = /^<!-- expect-error: (.+?) -->/;

const require = createRequire(import.meta.url);
const svelteCheck = path.join(
	path.dirname(require.resolve('svelte-check/package.json')),
	'bin',
	'svelte-check'
);

/** @type {Map<string, string | null>} probe path relative to the root -> expected message */
const probes = new Map();
for (const name of readdirSync(probeDir).filter((file) => file.endsWith('.svelte'))) {
	const source = readFileSync(path.join(probeDir, name), 'utf8');
	probes.set(path.posix.join('type-probes', 'form', name), EXPECT.exec(source)?.[1] ?? null);
}

const run = spawnSync(
	process.execPath,
	[svelteCheck, '--tsconfig', 'type-probes/tsconfig.json', '--output', 'machine'],
	{ cwd: root, encoding: 'utf8' }
);
if (run.error) throw run.error;

/** @type {Map<string, string[]>} */
const errors = new Map();
for (const line of run.stdout.split('\n')) {
	const match = /^\d+ ERROR "([^"]+)" \d+:\d+ "(.*)"$/.exec(line);
	if (!match) continue;
	const [, file, message] = match;
	errors.set(file, [...(errors.get(file) ?? []), JSON.parse(`"${message}"`)]);
}

const failures = [];
for (const [file, messages] of errors) {
	if (!probes.has(file)) failures.push(`${file} is not a probe but has errors: ${messages[0]}`);
}
for (const [file, expected] of probes) {
	const messages = errors.get(file) ?? [];
	if (expected === null) {
		if (messages.length > 0) failures.push(`${file} must pass, got: ${messages.join(' | ')}`);
		console.log(`ok   ${file} passes`);
	} else if (messages.length !== 1 || !messages[0].includes(expected)) {
		failures.push(
			`${file} must fail once with "${expected}", got: ${messages.join(' | ') || 'no error'}`
		);
	} else {
		console.log(`ok   ${file} fails with "${expected}"`);
	}
}
if (probes.size === 0) failures.push(`no probes in ${probeDir}`);

if (failures.length > 0) {
	for (const failure of failures) console.error(`FAIL ${failure}`);
	process.exit(1);
}
console.log(`${probes.size} form type probes behave as expected`);
