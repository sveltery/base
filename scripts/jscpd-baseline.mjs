/**
 * Known dodges. These still pass. They are listed here and not rejected.
 *
 * - An in-place edit that keeps the identifier sequence (`+ 1` to `+ 1 + 0`).
 *   Accepted as a documented residual.
 * - A subsequence swap (`price * qty + tax` to `-tax ?? 7`). The live
 *   identifiers are a subsequence of the ancestor, so the overlap ratio is 1.
 * - A copy across formats, such as the same text in a `.ts` file and a `.js`
 *   file. Pair identity includes the format.
 * - One unique statement every fewer than 8 lines. That stays under `--min-lines`.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCAN_ROOTS = ['src', 'eslint'];
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const JSCPD = path.resolve(SCRIPT_DIR, '../node_modules/.bin/jscpd');
const EMPTY_CONFIG = path.join(SCRIPT_DIR, 'jscpd-empty.json');
const HTML_COMMENT_PATTERN = '<!--.*?-->';
const OVERLAP_CUTOFF = 0.8;

/**
 * @param {string} verifySource
 */
export function pinnedThresholds(verifySource) {
	const lines = /--min-lines\s+(\d+)/.exec(verifySource);
	const tokens = /--min-tokens\s+(\d+)/.exec(verifySource);
	if (!lines || !tokens) {
		throw new Error('verify.sh must pin --min-lines and --min-tokens');
	}
	return { minLines: lines[1], minTokens: tokens[1] };
}

/**
 * @param {string} scriptDir
 */
function readPinnedThresholds(scriptDir) {
	const verifyPath = path.join(scriptDir, 'verify.sh');
	return pinnedThresholds(fs.readFileSync(verifyPath, 'utf8'));
}

/**
 * @param {string[]} argv
 * @param {NodeJS.ProcessEnv} env
 * @param {{ minLines: string, minTokens: string }} pin
 */
export function thresholdMismatch(argv, env, pin) {
	const checks = [
		['--min-lines', flagValue(argv, '--min-lines'), env.JSCPD_MIN_LINES, pin.minLines],
		['--min-tokens', flagValue(argv, '--min-tokens'), env.JSCPD_MIN_TOKENS, pin.minTokens]
	];
	for (const [flag, fromArg, fromEnv, expected] of checks) {
		if (fromArg != null && fromArg !== expected) return `${flag} is pinned to ${expected}`;
		if (fromEnv != null && fromEnv !== expected) return `${flag} is pinned to ${expected}`;
	}
	return null;
}

/**
 * @param {string[]} argv
 * @param {string} flag
 */
function flagValue(argv, flag) {
	const index = argv.indexOf(flag);
	if (index < 0) return null;
	return argv[index + 1] ?? '';
}

/**
 * @param {string} repoRoot
 */
function presentRoots(repoRoot) {
	return SCAN_ROOTS.filter((root) => fs.existsSync(path.join(repoRoot, root)));
}

/**
 * `--config` points at an empty file this script owns, so a committed
 * `.jscpd.json` cannot set `skipLocal`. `--no-gitignore` keeps a force-added
 * file that `.gitignore` lists in the scan.
 *
 * @param {{ minLines: string, minTokens: string }} pin
 * @param {string} repoRoot
 */
function scanArgs(pin, repoRoot) {
	return [
		...presentRoots(repoRoot),
		'--absolute',
		'--min-lines',
		pin.minLines,
		'--min-tokens',
		pin.minTokens,
		'--ignore-pattern',
		HTML_COMMENT_PATTERN,
		'--config',
		EMPTY_CONFIG,
		'--no-gitignore',
		'--reporters',
		'json,silent',
		'--ignore',
		'**/*.spec.ts,**/*.svelte.spec.ts,eslint/fixtures/history/**'
	];
}

/**
 * @typedef {{ count: number, lines: number, fragments?: string[] }} PairStat
 */

/**
 * Pairs in `next` whose clone count or duplicated line total is above
 * `allowed`. A missing pair counts as zero. Identity is the file pair and
 * format. The remove-only gate does not use the line total. See `grantedPairs`.
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
 * Identifier sequence of a clone fragment. An in-place edit that only
 * changes operators or literals keeps this sequence.
 *
 * @param {string} fragment
 */
export function fragmentId(fragment) {
	return (fragment.match(/[A-Za-z_$][\w$]*/g) ?? []).join(' ');
}

/**
 * Longest common subsequence of two identifier lists.
 *
 * @param {string[]} left
 * @param {string[]} right
 */
function lcsLength(left, right) {
	const width = right.length + 1;
	/** @type {number[]} */
	let previous = Array(width).fill(0);
	/** @type {number[]} */
	let current = Array(width).fill(0);
	for (const word of left) {
		for (let column = 1; column < width; column += 1) {
			current[column] =
				word === right[column - 1]
					? previous[column - 1] + 1
					: Math.max(previous[column], current[column - 1]);
		}
		const swap = previous;
		previous = current;
		current = swap;
		current.fill(0);
	}
	return previous[right.length];
}

/**
 * `LCS(live, ancestor) / |live|`. A missing live fragment overlaps fully.
 *
 * @param {string} live
 * @param {string} ancestor
 */
export function overlapRatio(live, ancestor) {
	const left = live.split(' ').filter((word) => word !== '');
	const right = ancestor.split(' ').filter((word) => word !== '');
	if (left.length === 0) return 1;
	return lcsLength(left, right) / left.length;
}

/**
 * Worst live fragment against its best ancestor fragment.
 *
 * @param {string[] | undefined} ancestor
 * @param {string[] | undefined} live
 */
export function fragmentOverlap(ancestor, live) {
	if (!live || live.length === 0) return 1;
	if (!ancestor || ancestor.length === 0) return 0;
	let worst = 1;
	for (const fragment of live) {
		let best = 0;
		for (const candidate of ancestor) best = Math.max(best, overlapRatio(fragment, candidate));
		worst = Math.min(worst, best);
	}
	return worst;
}

/**
 * A pair that disappeared, or lost a clone, is stale. Fewer lines in a
 * clone that is still there is a pure shrink and is not stale.
 *
 * @param {Record<string, PairStat> | undefined} live
 * @param {Record<string, PairStat> | undefined} baseline
 */
export function stalePairs(live, baseline) {
	const stale = [];
	for (const [key, stat] of Object.entries(baseline ?? {})) {
		const found = live?.[key];
		if (!found || found.count < stat.count) stale.push(key);
	}
	return stale.sort();
}

/**
 * @param {string} diffText
 */
export function renameMaps(diffText) {
	/** @type {Map<string, string>} */
	const newToOld = new Map();
	/** @type {Map<string, string>} */
	const oldToNew = new Map();
	for (const line of diffText.split('\n')) {
		if (line === '') continue;
		const parts = line.split('\t');
		if (!parts[0]?.startsWith('R') || parts.length < 3) continue;
		const oldPath = parts[1];
		const newPath = parts[2];
		if (!oldPath || !newPath) continue;
		newToOld.set(newPath, oldPath);
		oldToNew.set(oldPath, newPath);
	}
	return { newToOld, oldToNew };
}

/**
 * @param {string} filePath
 * @param {Map<string, string>} map
 */
function chase(filePath, map) {
	const seen = new Set();
	let current = filePath;
	while (map.has(current) && !seen.has(current)) {
		seen.add(current);
		const next = map.get(current);
		if (next == null) break;
		current = next;
	}
	return current;
}

/**
 * @param {string} key
 * @param {(filePath: string) => string} mapPath
 */
function mapPairKey(key, mapPath) {
	const colon = key.indexOf(':');
	const format = key.slice(0, colon);
	const [left, right] = key.slice(colon + 1).split('|');
	const firstPath = mapPath(left);
	const secondPath = mapPath(right);
	const [first, second] =
		firstPath < secondPath ? [firstPath, secondPath] : [secondPath, firstPath];
	return `${format}:${first}|${second}`;
}

/**
 * @param {Record<string, PairStat> | undefined} pairs
 * @param {(filePath: string) => string} mapPath
 */
export function applyPairRenames(pairs, mapPath) {
	/** @type {Record<string, PairStat>} */
	const next = {};
	for (const [key, stat] of Object.entries(pairs ?? {})) {
		const mapped = mapPairKey(key, mapPath);
		const previous = next[mapped];
		if (!previous) {
			next[mapped] = {
				count: stat.count,
				lines: stat.lines,
				fragments: [...(stat.fragments ?? [])]
			};
			continue;
		}
		previous.count += stat.count;
		previous.lines += stat.lines;
		previous.fragments = [...(previous.fragments ?? []), ...(stat.fragments ?? [])];
	}
	return next;
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
 * @param {Array<{ format: string, lines: number, fragment?: string, firstFile: { name: string }, secondFile: { name: string } }>} clones
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
		const stat = stats[key] ?? { count: 0, lines: 0, fragments: [] };
		stat.count += 1;
		stat.lines += lines;
		stat.fragments = [...(stat.fragments ?? []), fragmentId(clone.fragment ?? '')];
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
	const root = fs.realpathSync(repoRoot);
	const pin = readPinnedThresholds(SCRIPT_DIR);
	const args = scanArgs(pin, root);
	if (args[0]?.startsWith('--')) return {};
	const out = fs.mkdtempSync(path.join(os.tmpdir(), 'jscpd-scan-'));
	try {
		execFileSync(JSCPD, [...args, '--output', out], {
			cwd: root,
			stdio: ['ignore', 'pipe', 'pipe']
		});
		const report = JSON.parse(fs.readFileSync(path.join(out, 'jscpd-report.json'), 'utf8'));
		/** @type {(name: string) => string} */
		const resolve = (name) => toRepoPath(name, root);
		return pairStatsFromClones(report.duplicates ?? [], resolve);
	} finally {
		fs.rmSync(out, { recursive: true, force: true });
	}
}

/**
 * Allowance comes from a scan of the base revision with the current detector.
 * A version 1 hash list or a version 2 count cannot express fragments, and a
 * version 3 file was written before HTML comments were ignored.
 *
 * @param {string} rev
 * @returns {Record<string, PairStat>}
 */
function scanRevision(rev) {
	// jscpd --absolute prints the real path. A symlinked TMPDIR (macOS /tmp)
	// would otherwise make that path look outside the worktree.
	const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'jscpd-base-')));
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

/**
 * @param {Record<string, PairStat>} pairs
 */
function baselineDocument(pairs) {
	const sorted = Object.fromEntries(
		Object.entries(pairs)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([key, stat]) => [key, { count: stat.count, lines: stat.lines }])
	);
	return `${JSON.stringify({ version: 3, pairs: sorted }, null, '\t')}\n`;
}

/**
 * @param {string} repoRoot
 * @param {string} rev
 */
function renameDiff(repoRoot, rev) {
	return execFileSync('git', ['diff', '-M', '--name-status', rev], {
		cwd: repoRoot,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe']
	});
}

/**
 * @param {string} filePath
 * @param {{ newToOld: Map<string, string>, oldToNew: Map<string, string> }} maps
 * @param {'live' | 'baseline'} side
 */
function pathToAncestor(filePath, maps, side) {
	if (maps.newToOld.has(filePath)) return chase(filePath, maps.newToOld);
	if (side === 'live' && maps.oldToNew.has(filePath)) return `${filePath}#replaced`;
	return filePath;
}

/**
 * @param {string} repoRoot
 */
function ignoreMarkerHits(repoRoot) {
	/** @type {string[]} */
	const hits = [];
	for (const root of SCAN_ROOTS) {
		const abs = path.join(repoRoot, root);
		if (!fs.existsSync(abs)) continue;
		walkFiles(abs, (file) => {
			const rel = path.relative(repoRoot, file).replaceAll('\\', '/');
			if (rel.endsWith('.spec.ts') || rel.endsWith('.svelte.spec.ts')) return;
			if (rel.startsWith('eslint/fixtures/history/')) return;
			let text;
			try {
				text = fs.readFileSync(file, 'utf8');
			} catch {
				return;
			}
			if (text.includes('jscpd:ignore')) hits.push(rel);
		});
	}
	return hits.sort();
}

/**
 * @param {string} dir
 * @param {(file: string) => void} visit
 */
function walkFiles(dir, visit) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) walkFiles(full, visit);
		else if (entry.isFile()) visit(full);
	}
}

/**
 * Baseline keys whose clone count is above the ancestor. Line totals are not
 * compared, so a shrink of an existing pair is not a grant.
 *
 * @param {Record<string, PairStat> | undefined} ancestor
 * @param {Record<string, PairStat> | undefined} baseline
 */
function grantedPairs(ancestor, baseline) {
	const granted = [];
	for (const [key, stat] of Object.entries(baseline ?? {})) {
		const previous = ancestor?.[key];
		if (!previous || stat.count > previous.count) granted.push(key);
	}
	return granted.sort();
}

/**
 * @param {Record<string, PairStat>} found
 * @param {Record<string, PairStat>} baseline
 * @param {Record<string, PairStat>} ancestor
 */
function freshPairs(found, baseline, ancestor) {
	/** @type {string[]} */
	const fresh = [];
	/** @type {string[]} */
	const overlapped = [];
	for (const [key, stat] of Object.entries(found)) {
		const base = baseline[key];
		const anc = ancestor[key];
		// A pair the baseline added and the ancestor does not have is a grant,
		// reported by grantedPairs. It is not a new live clone.
		if (base && !anc) continue;
		const ceilingCount = Math.min(base?.count ?? 0, anc?.count ?? 0);
		const ceilingLines = Math.min(base?.lines ?? 0, anc?.lines ?? 0);
		if (stat.count > ceilingCount || stat.lines > ceilingLines) {
			fresh.push(key);
			continue;
		}
		if (anc && fragmentOverlap(anc.fragments, stat.fragments) < OVERLAP_CUTOFF) {
			overlapped.push(key);
		}
	}
	return { fresh: fresh.sort(), overlapped: overlapped.sort() };
}

const isCli = process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
	const pin = readPinnedThresholds(path.dirname(fileURLToPath(import.meta.url)));
	const mismatch = thresholdMismatch(process.argv, process.env, pin);
	if (mismatch) {
		console.error(`jscpd ${mismatch}`);
		process.exit(1);
	}
	if (process.argv.includes('--write')) {
		const found = scanRepo(process.cwd());
		fs.writeFileSync('.jscpd-baseline.json', baselineDocument(found));
		console.log(`jscpd baseline wrote ${pairTotal(found)} clones`);
		process.exit(0);
	}
	const current = JSON.parse(fs.readFileSync('.jscpd-baseline.json', 'utf8'));
	if (current.version !== 3 || !isPairMap(current.pairs)) {
		console.error('jscpd baseline must be version 3 with count and lines per file pair');
		process.exit(1);
	}
	const rev = baseRevision();
	if (rev == null) {
		console.error('jscpd baseline base revision is missing');
		process.exit(1);
	}
	try {
		execFileSync('git', ['cat-file', '-e', `${rev}^{commit}`], { stdio: 'ignore' });
	} catch {
		console.error(`jscpd baseline base ${rev} is not available; fetch that commit before lint`);
		process.exit(1);
	}
	const markers = ignoreMarkerHits(process.cwd());
	if (markers.length > 0) {
		console.error(`jscpd:ignore is banned (${markers.length} file(s))`);
		for (const file of markers) console.error(file);
		process.exit(1);
	}
	const found = scanRepo(process.cwd());
	let ancestor;
	try {
		ancestor = scanRevision(rev);
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	}
	const maps = renameMaps(renameDiff(process.cwd(), rev));
	const foundMapped = applyPairRenames(found, (filePath) => pathToAncestor(filePath, maps, 'live'));
	const baselineMapped = applyPairRenames(current.pairs, (filePath) =>
		pathToAncestor(filePath, maps, 'baseline')
	);
	const { fresh, overlapped } = freshPairs(foundMapped, baselineMapped, ancestor);
	if (overlapped.length > 0) {
		console.error(
			`jscpd found ${overlapped.length} new clone pair(s) below the ${OVERLAP_CUTOFF} identifier overlap with ${rev}. \`node scripts/jscpd-baseline.mjs --write\` will not clear this.`
		);
		for (const key of overlapped) console.error(key);
		process.exit(1);
	}
	if (fresh.length > 0) {
		console.error(`jscpd found ${fresh.length} new clone pair(s)`);
		for (const key of fresh) console.error(key);
		process.exit(1);
	}
	const stale = stalePairs(foundMapped, baselineMapped);
	if (stale.length > 0) {
		console.error(
			`jscpd baseline is larger than the live scan (${stale.length} pair(s)); regenerate the baseline with \`node scripts/jscpd-baseline.mjs --write\``
		);
		for (const key of stale) console.error(key);
		process.exit(1);
	}
	const granted = grantedPairs(ancestor, baselineMapped);
	if (granted.length > 0) {
		console.error(
			`jscpd baseline added ${granted.length} clone pair(s); baseline changes are remove-only`
		);
		for (const key of granted) console.error(key);
		process.exit(1);
	}
	console.log(`jscpd baseline compared with ${rev}: ${pairTotal(found)} clones`);
}
