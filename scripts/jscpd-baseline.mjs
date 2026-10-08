import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCAN_ROOTS = ['src', 'eslint'];
const JSCPD = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'../node_modules/.bin/jscpd'
);
const JSCPD_ARGS = [
	...SCAN_ROOTS,
	'--absolute',
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
 * @typedef {{ count: number, lines: number }} PairStat
 */

/**
 * Pairs whose clone count or duplicated line total grew. A lower count or a
 * shorter clone is a removal and is allowed. Identity is the file pair and
 * format, not jscpd's content hash, so editing the text of a pair that is
 * already allowed does not count as a new clone. Replacing that clone with
 * a longer one does.
 *
 * @param {Record<string, PairStat> | undefined} allowed
 * @param {Record<string, PairStat> | undefined} next
 * @returns {string[]}
 */
export function addedPairs(allowed, next) {
	const added = [];
	for (const [key, stat] of Object.entries(next ?? {})) {
		const previous = allowed?.[key];
		if (stat.count > (previous?.count ?? 0) || stat.lines > (previous?.lines ?? 0)) {
			added.push(key);
		}
	}
	return added.sort();
}

/**
 * @param {Record<string, PairStat> | undefined} pairs
 */
export function pairTotal(pairs) {
	return Object.values(pairs ?? {}).reduce((sum, stat) => sum + stat.count, 0);
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
 * `--absolute` reports a full path. Key the pair by the repo-relative path so
 * `eslint/lib/radio/attributes.ts` cannot collapse onto `src/lib/radio/attributes.ts`.
 *
 * @param {string} name
 * @param {string} repoRoot
 */
export function toRepoPath(name, repoRoot) {
	const clean = path.resolve(name).replaceAll('\\', '/');
	const root = path.resolve(repoRoot).replaceAll('\\', '/');
	const rel = path.relative(root, clean).replaceAll('\\', '/');
	if (rel === '' || rel.startsWith('..') || path.isAbsolute(rel)) {
		throw new Error(`jscpd clone path is outside the repo: ${name}`);
	}
	return rel;
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
 * @param {Array<{ format: string, lines: number, firstFile: { name: string }, secondFile: { name: string } }>} clones
 * @param {(name: string) => string} resolve
 * @returns {Record<string, PairStat>}
 */
export function pairStatsFromClones(clones, resolve) {
	/** @type {Record<string, PairStat>} */
	const stats = {};
	for (const clone of clones) {
		const key = clonePairKey(clone.format, clone.firstFile.name, clone.secondFile.name, resolve);
		const lines = clone.lines;
		if (!Number.isInteger(lines) || lines < 1) {
			throw new Error(`jscpd clone is missing a line count: ${key}`);
		}
		const stat = stats[key] ?? { count: 0, lines: 0 };
		stat.count += 1;
		stat.lines += lines;
		stats[key] = stat;
	}
	return stats;
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
 * @returns {Record<string, PairStat>}
 */
export function scanRepo(repoRoot) {
	const out = fs.mkdtempSync(path.join(os.tmpdir(), 'jscpd-scan-'));
	try {
		execFileSync(JSCPD, [...JSCPD_ARGS, '--output', out], {
			cwd: repoRoot,
			stdio: ['ignore', 'pipe', 'pipe']
		});
		const report = JSON.parse(fs.readFileSync(path.join(out, 'jscpd-report.json'), 'utf8'));
		/** @type {(name: string) => string} */
		const resolve = (name) => toRepoPath(name, repoRoot);
		return pairStatsFromClones(report.duplicates ?? [], resolve);
	} finally {
		fs.rmSync(out, { recursive: true, force: true });
	}
}

/**
 * @param {string} rev
 */
function readBaseline(rev) {
	return execFileSync('git', ['show', `${rev}:.jscpd-baseline.json`], {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe']
	});
}

/**
 * Older baselines cannot express a line allowance. Version 1 keys by content
 * hash and version 2 stores a count only, so both are replaced by a scan of
 * that revision.
 *
 * @param {{ version?: number, pairs?: Record<string, PairStat>, fingerprints?: Record<string, unknown> }} ancestor
 * @param {string} rev
 * @returns {Record<string, PairStat>}
 */
function allowances(ancestor, rev) {
	if (ancestor.version === 3) return ancestor.pairs ?? {};
	if (
		(ancestor.version === 1 && ancestor.fingerprints) ||
		(ancestor.version === 2 && ancestor.pairs)
	) {
		return scanRevision(rev);
	}
	throw new Error('jscpd baseline version is not 1, 2, or 3');
}

/**
 * @param {string} rev
 * @returns {Record<string, PairStat>}
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

/**
 * @param {unknown} value
 * @returns {value is PairStat}
 */
function isPairStat(value) {
	if (value == null || typeof value !== 'object') return false;
	const stat = /** @type {{ count?: unknown, lines?: unknown }} */ (value);
	return (
		typeof stat.count === 'number' &&
		Number.isInteger(stat.count) &&
		stat.count > 0 &&
		typeof stat.lines === 'number' &&
		Number.isInteger(stat.lines) &&
		stat.lines > 0
	);
}

/**
 * @param {unknown} pairs
 * @returns {pairs is Record<string, PairStat>}
 */
function isPairMap(pairs) {
	if (pairs == null || typeof pairs !== 'object' || Array.isArray(pairs)) return false;
	return Object.values(/** @type {Record<string, unknown>} */ (pairs)).every(isPairStat);
}

const isCli = process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
	const current = JSON.parse(fs.readFileSync('.jscpd-baseline.json', 'utf8'));
	if (current.version !== 3 || !isPairMap(current.pairs)) {
		console.error('jscpd baseline must be version 3 with count and lines per file pair');
		process.exit(1);
	}
	const total = pairTotal(current.pairs);
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
	console.log(`jscpd baseline compared with ${rev}: ${total} clones`);
}
