#!/usr/bin/env node
// Moves "Derived from Base UI vX" provenance headers to a new pin, file by file.
//
// node scripts/provenance-bump.mjs --upstream <base-ui clone> --from v1.8.0 --to v1.9.0 \
//   --ported <sha,sha,...> [--noop <sha,...>] [--branch-base <git rev>] [--skip <regex>] [--write]
//
// A header names the upstream files it follows. A file moves to `--to` when none of those
// files changed between the tags, or when this branch changed the file (it differs from
// `--branch-base`, the merged-in main) and every upstream commit that touched them is listed in `--ported` or `--noop`. Every other
// file keeps its pin and is reported with the commits that block it. Without `--write` the
// script only reports.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
	options: {
		upstream: { type: 'string' },
		from: { type: 'string' },
		to: { type: 'string' },
		ported: { type: 'string', default: '' },
		noop: { type: 'string', default: '' },
		'branch-base': { type: 'string' },
		skip: { type: 'string' },
		write: { type: 'boolean', default: false }
	}
});
if (!args.upstream || !args.from || !args.to) {
	console.error('--upstream, --from and --to are required');
	process.exit(2);
}

const git = (cwd, ...argv) =>
	execFileSync('git', argv, { cwd, encoding: 'utf8', maxBuffer: 1 << 28 }).trim();
const lines = (text) => (text ? text.split('\n') : []);
const shortList = (text) =>
	new Set(
		text
			.split(',')
			.filter(Boolean)
			.map((sha) => sha.slice(0, 7))
	);

const fromSha = git(args.upstream, 'rev-parse', `${args.from}^{commit}`);
const toSha = git(args.upstream, 'rev-parse', `${args.to}^{commit}`);
const accepted = new Set([...shortList(args.ported), ...shortList(args.noop)]);
const skip = args.skip ? new RegExp(args.skip) : null;
const changedHere = new Set(
	args['branch-base'] ? lines(git('.', 'diff', '--name-only', args['branch-base'], 'HEAD')) : []
);

const fromVersion = args.from.replace(/^v/, '');
const pinPattern = new RegExp(`v${fromVersion.replaceAll('.', '\\.')}|${fromSha}`);

// A shallow clone can cut the history at a commit whose real change is small. Diffing each
// commit against its recorded parent keeps such a boundary from claiming every file.
const touchCache = new Map();
function commitsTouching(path) {
	if (touchCache.has(path)) return touchCache.get(path);
	const commits = lines(
		git(args.upstream, 'log', '--format=%H', `${fromSha}..${toSha}`, '--', `:(glob)${path}`)
	)
		.filter((sha) => {
			const parent = git(args.upstream, 'cat-file', '-p', sha).match(/^parent (\w+)/m)?.[1];
			if (!parent) return true;
			return git(args.upstream, 'diff', '--name-only', parent, sha, '--', `:(glob)${path}`) !== '';
		})
		.map((sha) => sha.slice(0, 7));
	touchCache.set(path, commits);
	return commits;
}

const fromFiles = lines(git(args.upstream, 'ls-tree', '-r', '--name-only', fromSha));
function globToRegExp(glob) {
	const source = glob
		.replace(/[.+^${}()|[\]\\]/g, '\\$&')
		.replaceAll('**/', '\u0000')
		.replaceAll('*', '[^/]*')
		.replaceAll('\u0000', '(?:.*/)?');
	return new RegExp(`^${source}$`);
}
const existsAtFrom = (glob) => fromFiles.some((name) => globToRegExp(glob).test(name));

/**
 * The upstream globs a header names. A relative path resolves against the package source
 * root or the folder of the last full path, whichever names a file. A folder means every
 * file in it. Paths into this repository (`src/...`) are skipped. `null` marks a path that
 * resolves nowhere.
 */
function upstreamPaths(header) {
	const found = new Set();
	const text = header.replace(/\s*\n\s*(?:\/\/|\*|<!--)?\s*/g, ' ');
	let bases = ['packages/react/src/'];
	for (const match of text.matchAll(/(packages\/[\w.*/-]+|[\w-]+(?:\/[\w.*-]+)+\.[jt]sx?)/g)) {
		const raw = match[1].replace(/[.,;:)]+$/, '');
		if (raw.startsWith('src/')) continue;
		const candidates = raw.startsWith('packages/') ? [raw] : bases.map((base) => base + raw);
		const resolved = candidates
			.flatMap((path) => (/\.[jt]sx?$/.test(path) ? [path] : [path, `${path}/**/*`]))
			.find(existsAtFrom);
		found.add(resolved ?? null);
		if (raw.startsWith('packages/')) {
			const parts = raw.split('/');
			bases = [parts.slice(0, 3).join('/') + '/', parts.slice(0, 4).join('/') + '/'];
		}
	}
	return [...found];
}

const files = lines(
	git('.', 'grep', '-l', '-E', `v${fromVersion}|${fromSha}`, '--', 'src', 'packages')
);
const report = { bumped: [], kept: [], manual: [] };

for (const file of files) {
	if (skip?.test(file)) continue;
	const source = readFileSync(file, 'utf8');
	const headerEnd = source.search(/\n\s*\n|-->|\n\s*(?:import|export|<script)\b/);
	const header = source.slice(0, headerEnd === -1 ? 600 : headerEnd);
	if (!pinPattern.test(header)) continue;

	const paths = upstreamPaths(header);
	if (paths.length === 0) {
		report.manual.push(`${file}: names no upstream path`);
		continue;
	}
	if (paths.includes(null)) {
		report.manual.push(`${file}: names a path that is not in ${args.from}`);
		continue;
	}

	const blocking = [...new Set(paths.flatMap(commitsTouching))];
	const unported = blocking.filter((sha) => !accepted.has(sha));
	const canBump = blocking.length === 0 || (changedHere.has(file) && unported.length === 0);
	if (!canBump) {
		report.kept.push(`${file}: ${(changedHere.has(file) ? unported : blocking).join(' ')}`);
		continue;
	}

	report.bumped.push(file);
	if (args.write) {
		const bumped = header.replaceAll(`v${fromVersion}`, args.to).replaceAll(fromSha, toSha);
		writeFileSync(file, bumped + source.slice(header.length));
	}
}

for (const [label, entries] of Object.entries(report)) {
	console.log(`\n${label} (${entries.length})`);
	for (const entry of entries) console.log(`  ${entry}`);
}
