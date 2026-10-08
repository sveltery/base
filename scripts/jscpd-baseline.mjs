import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** Live clone ceiling. Hoisting may stay under it. Growing past it fails CI. */
export const CEILING = 69;

const SCAN_ROOTS = ['src', 'eslint'];
const JSCPD = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'../node_modules/.bin/jscpd'
);
const JSCPD_ARGS = [
	...SCAN_ROOTS,
	'--min-lines',
	'8',
	'--min-tokens',
	'60',
	'--reporters',
	'json,silent',
	'--ignore',
	'**/*.spec.ts,**/*.svelte.spec.ts,eslint/fixtures/history/**'
];

/**
 * Pairs whose count grew. A lower count is a removal and is allowed.
 * Identity is the file pair and format, not jscpd's content hash, so editing
 * the text of a pair that is already allowed does not count as a new clone.
 *
 * @param {Record<string, number> | undefined} allowed
 * @param {Record<string, number> | undefined} next
 * @returns {string[]}
 */
export function addedPairs(allowed, next) {
	const added = [];
	for (const [key, count] of Object.entries(next ?? {})) {
		if (count > (allowed?.[key] ?? 0)) added.push(key);
	}
	return added.sort();
}

/**
 * @param {Record<string, number> | undefined} counts
 */
export function pairTotal(counts) {
	return Object.values(counts ?? {}).reduce((sum, count) => sum + count, 0);
}

/**
 * jscpd appends `:<format>` to a Svelte file name. The path on disk does not.
 *
 * @param {string} format
 * @param {string} name
 */
export function stripFormatSuffix(format, name) {
	const clean = name.replaceAll('\\', '/');
	const suffix = `:${format}`;
	return clean.endsWith(suffix) ? clean.slice(0, -suffix.length) : clean;
}

/**
 * jscpd reports paths relative to each scan root (`lib/...`, `effects.js`).
 * Put the root back so the key is repo-relative and stable across worktrees.
 *
 * @param {string} name
 * @param {string} repoRoot
 */
export function resolveClonePath(name, repoRoot) {
	const clean = name.replaceAll('\\', '/');
	for (const root of SCAN_ROOTS) {
		const rel = `${root}/${clean}`;
		if (fs.existsSync(path.join(repoRoot, rel))) return rel;
	}
	throw new Error(`jscpd clone path is outside the scan roots: ${name}`);
}

/**
 * @param {string} format
 * @param {string} firstName
 * @param {string} secondName
 * @param {(name: string) => string} resolve
 */
export function clonePairKey(format, firstName, secondName, resolve) {
	const left = resolve(stripFormatSuffix(format, firstName));
	const right = resolve(stripFormatSuffix(format, secondName));
	const [first, second] = left < right ? [left, right] : [right, left];
	return `${format}:${first}|${second}`;
}

/**
 * @param {Array<{ format: string, firstFile: { name: string }, secondFile: { name: string } }>} clones
 * @param {(name: string) => string} resolve
 * @returns {Record<string, number>}
 */
export function pairCountsFromClones(clones, resolve) {
	/** @type {Record<string, number>} */
	const counts = {};
	for (const clone of clones) {
		const key = clonePairKey(clone.format, clone.firstFile.name, clone.secondFile.name, resolve);
		counts[key] = (counts[key] ?? 0) + 1;
	}
	return counts;
}

/**
 * The comparison revision. An unset, empty, or all-zero `JSCPD_BASE_SHA`
 * is missing. Callers that want `origin/main` pass that revision explicitly.
 *
 * @param {{ JSCPD_BASE_SHA?: string }} [env]
 * @returns {string | null}
 */
export function baseRevision(env = process.env) {
	if (!Object.prototype.hasOwnProperty.call(env, 'JSCPD_BASE_SHA')) return null;
	const fromEnv = env.JSCPD_BASE_SHA ?? '';
	if (fromEnv.trim() === '' || /^0+$/.test(fromEnv)) return null;
	return fromEnv;
}

/**
 * @param {string} repoRoot
 * @returns {Record<string, number>}
 */
export function scanRepo(repoRoot) {
	const out = fs.mkdtempSync(path.join(os.tmpdir(), 'jscpd-scan-'));
	try {
		execFileSync(JSCPD, [...JSCPD_ARGS, '--output', out], {
			cwd: repoRoot,
			stdio: ['ignore', 'pipe', 'pipe']
		});
		const report = JSON.parse(fs.readFileSync(path.join(out, 'jscpd-report.json'), 'utf8'));
		const resolve = (name) => resolveClonePath(name, repoRoot);
		return pairCountsFromClones(report.duplicates ?? [], resolve);
	} finally {
		fs.rmSync(out, { recursive: true, force: true });
	}
}

/**
 * @param {string} rev
 */
function readBaseline(rev) {
	return execFileSync('git', ['show', `${rev}:.jscpd-baseline.json`], { encoding: 'utf8' });
}

/**
 * Version 1 baselines key clones by content hash. Those hashes change when the
 * shared text changes, so the allowance for a v1 ancestor is the file pairs
 * actually present on that revision.
 *
 * @param {{ version?: number, pairs?: Record<string, number>, fingerprints?: Record<string, unknown> }} ancestor
 * @param {string} rev
 */
function allowances(ancestor, rev) {
	if (ancestor.version === 2) return ancestor.pairs ?? {};
	if (ancestor.version === 1 && ancestor.fingerprints) return scanRevision(rev);
	throw new Error('jscpd baseline version is not 1 or 2');
}

/**
 * @param {string} rev
 */
function scanRevision(rev) {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jscpd-base-'));
	try {
		execFileSync('git', ['worktree', 'add', '--detach', '--quiet', dir, rev], {
			stdio: ['ignore', 'pipe', 'pipe']
		});
		return scanRepo(dir);
	} finally {
		try {
			execFileSync('git', ['worktree', 'remove', '--force', dir], {
				stdio: ['ignore', 'pipe', 'pipe']
			});
		} catch {
			fs.rmSync(dir, { recursive: true, force: true });
		}
	}
}

const isCli = process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
	const current = JSON.parse(fs.readFileSync('.jscpd-baseline.json', 'utf8'));
	if (current.version !== 2 || current.pairs == null) {
		console.error('jscpd baseline must be version 2 with file-pair counts');
		process.exit(1);
	}
	const total = pairTotal(current.pairs);
	if (total > CEILING) {
		console.error(`jscpd baseline has ${total} clones; ceiling is ${CEILING}`);
		process.exit(1);
	}
	const rev = baseRevision();
	if (rev == null) {
		console.error('jscpd baseline base revision is missing');
		process.exit(1);
	}
	let ancestorText;
	try {
		ancestorText = readBaseline(rev);
	} catch {
		console.error(`jscpd baseline base ${rev} is not available; fetch that commit before lint`);
		process.exit(1);
	}
	const found = scanRepo(process.cwd());
	const fresh = addedPairs(current.pairs, found);
	if (fresh.length > 0) {
		console.error(`jscpd found ${fresh.length} new clone pair(s)`);
		for (const key of fresh) console.error(key);
		process.exit(1);
	}
	let allowed;
	try {
		allowed = allowances(JSON.parse(ancestorText), rev);
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	}
	const granted = addedPairs(allowed, current.pairs);
	if (granted.length > 0) {
		console.error(
			`jscpd baseline added ${granted.length} clone pair(s); baseline changes are remove-only`
		);
		for (const key of granted) console.error(key);
		process.exit(1);
	}
	console.log(`jscpd baseline compared with ${rev}: ${total} clones, ceiling ${CEILING}`);
}
