import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { scanRepo } from '../../../scripts/jscpd-baseline.mjs';

const script = path.resolve('scripts/jscpd-baseline.mjs');
const missingSha = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

function git(cwd: string, args: string[]) {
	execFileSync(
		'git',
		['-c', 'user.name=Clone Gate', '-c', 'user.email=gate@example.com', ...args],
		{
			cwd,
			stdio: ['ignore', 'pipe', 'pipe']
		}
	);
}

function statements(prefix: string, count: number) {
	return Array.from({ length: count }, (_, index) => `const ${prefix}${index} = ${index} + 1;`);
}

function statementsFrom(prefix: string, start: number, count: number) {
	return Array.from(
		{ length: count },
		(_, index) => `const ${prefix}${start + index} = ${start + index} + 1;`
	);
}

function walkOwnSource(beforePrefix: string, keptName: string) {
	const before = statements(beforePrefix, 14)
		.map((line) => `\t${line}`)
		.join('\n');
	const kept = statements('kept', 12)
		.map((line) => `\t${line.replace('const kept0', `const ${keptName}`)}`)
		.join('\n');
	return `export function beforeHook() {\n${before}\n}\nexport function walkOwn() {\n${kept}\n}\n`;
}

function source(functionName: string, body: string[]) {
	return `export function ${functionName}() {\n${body.map((line) => `\t${line}`).join('\n')}\n\treturn 0;\n}\n`;
}

function writeSources(dir: string, left: string, right: string) {
	mkdirSync(path.join(dir, 'src'), { recursive: true });
	mkdirSync(path.join(dir, 'eslint'), { recursive: true });
	writeFileSync(path.join(dir, 'src/left.ts'), left);
	writeFileSync(path.join(dir, 'src/right.ts'), right);
}

function baselineText(pairs: Record<string, { count: number; lines: number }>) {
	const slim = Object.fromEntries(
		Object.entries(pairs)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([key, stat]) => [key, { count: stat.count, lines: stat.lines }])
	);
	return `${JSON.stringify({ version: 3, pairs: slim }, null, '\t')}\n`;
}

function commitRepo(dir: string, pairs: Record<string, { count: number; lines: number }>) {
	writeFileSync(path.join(dir, '.jscpd-baseline.json'), baselineText(pairs));
	git(dir, ['add', '.']);
	git(dir, ['commit', '-m', 'base']);
	return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();
}

function makeRepo(left: string, right: string) {
	const dir = mkdtempSync(path.join(tmpdir(), 'jscpd-gate-'));
	git(dir, ['init', '-b', 'main']);
	writeSources(dir, left, right);
	git(dir, ['add', '.']);
	const pairs = scanRepo(dir);
	const sha = commitRepo(dir, pairs);
	return { dir, sha };
}

function renamePadded(text: string, count: number) {
	let live = text;
	for (let index = count - 1; index >= 0; index -= 1) {
		const from = `name${String(index).padStart(2, '0')}`;
		live = live.replaceAll(from, `swap${String(index).padStart(2, '0')}`);
	}
	return live;
}

function renameWords(text: string, from: string, to: string, count: number) {
	let live = text;
	for (let index = count - 1; index >= 0; index -= 1) {
		live = live.replace(new RegExp(`\\b${from}${index}\\b`, 'g'), `${to}${index}`);
	}
	return live;
}

function runGate(
	cwd: string,
	sha: string | null,
	tempDir?: string,
	extraEnv: Record<string, string> = {},
	args: string[] = []
) {
	const launch = [
		...(tempDir == null ? [] : [`TMPDIR=${tempDir}`]),
		...(sha == null ? ['-u', 'JSCPD_BASE_SHA'] : [`JSCPD_BASE_SHA=${sha}`]),
		...Object.entries(extraEnv).map(([key, value]) => `${key}=${value}`),
		process.execPath,
		script,
		...args
	];
	try {
		const stdout = execFileSync('env', launch, {
			cwd,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'pipe']
		});
		return { code: 0, stdout, stderr: '' };
	} catch (error) {
		const failed = error as { status?: number; stdout?: string; stderr?: string };
		return {
			code: failed.status ?? 1,
			stdout: failed.stdout ?? '',
			stderr: failed.stderr ?? ''
		};
	}
}

describe('jscpd baseline CLI', () => {
	it('rejects a clone that grows from 10 lines to 64', () => {
		const original = source('shared', statements('value', 10));
		const { dir, sha } = makeRepo(original, original);
		try {
			const recorded = JSON.parse(readFileSync(path.join(dir, '.jscpd-baseline.json'), 'utf8')) as {
				pairs: Record<string, { count: number; lines: number }>;
			};
			expect(recorded.pairs['typescript:src/left.ts|src/right.ts']).toEqual({
				count: 1,
				lines: 13
			});
			const grown = source('shared', statements('value', 64));
			writeSources(dir, grown, grown);
			const result = runGate(dir, sha);
			expect(result.code).toBe(1);
			expect(result.stderr).toContain('new clone pair');
			expect(result.stderr).toContain('typescript:src/left.ts|src/right.ts');
			expect(result.stderr).not.toContain('fatal:');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('rejects a swapped clone that replaces the allowed copy with different code', () => {
		const original = source('shared', statements('value', 10));
		const { dir, sha } = makeRepo(original, original);
		try {
			const recorded = JSON.parse(readFileSync(path.join(dir, '.jscpd-baseline.json'), 'utf8')) as {
				pairs: Record<string, { count: number; lines: number }>;
			};
			expect(recorded.pairs['typescript:src/left.ts|src/right.ts'].lines).toBe(13);
			const swapped = source('replacement', statements('other', 40));
			writeSources(dir, swapped, swapped);
			const result = runGate(dir, sha);
			expect(result.code).toBe(1);
			expect(result.stderr).toContain('new clone pair');
			expect(result.stderr).toContain('typescript:src/left.ts|src/right.ts');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('allows a remove-only baseline and rejects a baseline that grants a new pair', () => {
		const original = source('shared', statements('value', 12));
		const { dir, sha } = makeRepo(original, original);
		try {
			writeSources(dir, 'export const left = 1;\n', 'export const right = 2;\n');
			writeFileSync(path.join(dir, '.jscpd-baseline.json'), baselineText({}));
			expect(runGate(dir, sha).code).toBe(0);

			const grown = source('shared', statements('value', 40));
			writeSources(dir, grown, grown);
			writeFileSync(path.join(dir, '.jscpd-baseline.json'), baselineText(scanRepo(dir)));
			const granted = runGate(dir, sha);
			expect(granted.code).toBe(1);
			expect(granted.stderr).toContain('new clone pair');

			writeSources(dir, original, original);
			const extra = source('otherfn', statements('extra', 12));
			writeFileSync(path.join(dir, 'src/extra-a.ts'), extra);
			writeFileSync(path.join(dir, 'src/extra-b.ts'), extra);
			git(dir, ['add', 'src/extra-a.ts', 'src/extra-b.ts']);
			writeFileSync(path.join(dir, '.jscpd-baseline.json'), baselineText(scanRepo(dir)));
			const added = runGate(dir, sha);
			expect(added.code).toBe(1);
			expect(added.stderr).toContain('remove-only');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('allows an in-place edit of an allowed clone', () => {
		const original = source('shared', statements('value', 12));
		const { dir, sha } = makeRepo(original, original);
		try {
			const edited = original.replaceAll('+ 1;', '+ 1 + 0;');
			writeSources(dir, edited, edited);
			const result = runGate(dir, sha);
			expect(result.code).toBe(0);
			expect(result.stdout).toContain('jscpd baseline compared with');
			expect(result.stdout).toContain('1 clones');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('fails a missing base without printing git fatal', () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'jscpd-gate-'));
		try {
			git(dir, ['init', '-b', 'main']);
			mkdirSync(path.join(dir, 'src'), { recursive: true });
			mkdirSync(path.join(dir, 'eslint'), { recursive: true });
			writeFileSync(path.join(dir, '.jscpd-baseline.json'), baselineText({}));
			git(dir, ['add', '.']);
			git(dir, ['commit', '-m', 'base']);

			const unset = runGate(dir, null);
			expect(unset.code).toBe(1);
			expect(unset.stderr).toContain('base revision is missing');
			expect(unset.stderr).not.toContain('fatal:');

			const unavailable = runGate(dir, missingSha);
			expect(unavailable.code).toBe(1);
			expect(unavailable.stderr).toContain(`base ${missingSha} is not available`);
			expect(unavailable.stderr).not.toContain('fatal:');
			expect(unavailable.stdout).not.toContain('fatal:');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 30_000);

	it('keys an eslint clone by its own path when the same relative path exists under src', () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'jscpd-gate-'));
		try {
			git(dir, ['init', '-b', 'main']);
			const clone = source('shared', statements('value', 16));
			mkdirSync(path.join(dir, 'src/lib/checkbox'), { recursive: true });
			mkdirSync(path.join(dir, 'src/lib/radio'), { recursive: true });
			mkdirSync(path.join(dir, 'eslint/lib/checkbox'), { recursive: true });
			mkdirSync(path.join(dir, 'eslint/lib/radio'), { recursive: true });
			writeFileSync(
				path.join(dir, 'src/lib/checkbox/attributes.ts'),
				'export const checkbox = 1;\n'
			);
			writeFileSync(path.join(dir, 'src/lib/radio/attributes.ts'), 'export const radio = 2;\n');
			writeFileSync(path.join(dir, 'eslint/lib/checkbox/attributes.ts'), clone);
			writeFileSync(path.join(dir, 'eslint/lib/radio/attributes.ts'), clone);
			writeFileSync(
				path.join(dir, '.jscpd-baseline.json'),
				baselineText({
					'typescript:src/lib/checkbox/attributes.ts|src/lib/radio/attributes.ts': {
						count: 1,
						lines: 80
					}
				})
			);
			git(dir, ['add', '.']);
			git(dir, ['commit', '-m', 'base']);
			const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();

			const result = runGate(dir, sha);
			expect(result.code).toBe(1);
			expect(result.stderr).toContain(
				'typescript:eslint/lib/checkbox/attributes.ts|eslint/lib/radio/attributes.ts'
			);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('rejects a stale pair and spare lines', () => {
		const original = source('shared', statements('value', 16));
		const { dir, sha } = makeRepo(original, original);
		try {
			writeSources(dir, 'export const left = 1;\n', 'export const right = 2;\n');
			const stale = runGate(dir, sha);
			expect(stale.code).toBe(1);
			expect(stale.stderr).toContain('node scripts/jscpd-baseline.mjs --write');
			expect(stale.stderr).toContain('typescript:src/left.ts|src/right.ts');

			const shorter = source('shared', statements('value', 10));
			writeSources(dir, shorter, shorter);
			const spare = runGate(dir, sha);
			expect(spare.code).toBe(0);
			expect(spare.stdout).toContain('1 clones');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('scans a version 1 ancestor instead of trusting its hashes', () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'jscpd-gate-'));
		try {
			git(dir, ['init', '-b', 'main']);
			const original = source('shared', statements('value', 10));
			writeSources(dir, original, original);
			writeFileSync(path.join(dir, 'eslint/keep.js'), 'export const keep = 1;\n');
			writeFileSync(
				path.join(dir, '.jscpd-baseline.json'),
				`${JSON.stringify({ version: 1, fingerprints: { deadbeef: 1 } }, null, '\t')}\n`
			);
			git(dir, ['add', '.']);
			git(dir, ['commit', '-m', 'base']);
			const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();
			writeFileSync(path.join(dir, '.jscpd-baseline.json'), baselineText(scanRepo(dir)));

			const matched = runGate(dir, sha);
			expect(matched.code).toBe(0);
			expect(matched.stdout).toContain('1 clones');

			const grown = source('shared', statements('value', 40));
			writeSources(dir, grown, grown);
			writeFileSync(path.join(dir, '.jscpd-baseline.json'), baselineText(scanRepo(dir)));
			const granted = runGate(dir, sha);
			expect(granted.code).toBe(1);
			expect(granted.stderr).toContain('new clone pair');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('scans a version 2 ancestor when TMPDIR is a symlink', () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'jscpd-gate-'));
		const realTemp = mkdtempSync(path.join(tmpdir(), 'jscpd-real-'));
		const linkParent = mkdtempSync(path.join(tmpdir(), 'jscpd-link-'));
		const linkTemp = path.join(linkParent, 'tmp');
		symlinkSync(realTemp, linkTemp);
		try {
			git(dir, ['init', '-b', 'main']);
			const original = source('shared', statements('value', 10));
			writeSources(dir, original, original);
			writeFileSync(path.join(dir, 'eslint/keep.js'), 'export const keep = 1;\n');
			writeFileSync(
				path.join(dir, '.jscpd-baseline.json'),
				`${JSON.stringify({ version: 2, pairs: { 'typescript:src/left.ts|src/right.ts': 99 } }, null, '\t')}\n`
			);
			git(dir, ['add', '.']);
			git(dir, ['commit', '-m', 'base']);
			const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();
			writeFileSync(path.join(dir, '.jscpd-baseline.json'), baselineText(scanRepo(dir)));

			const result = runGate(dir, sha, linkTemp);
			expect(result.code).toBe(0);
			expect(result.stderr).not.toContain('outside the repo');
			expect(result.stdout).toContain('1 clones');
		} finally {
			rmSync(dir, { recursive: true, force: true });
			rmSync(realTemp, { recursive: true, force: true });
			rmSync(linkParent, { recursive: true, force: true });
		}
	}, 60_000);

	it('rejects a same-length swap, including after --write', () => {
		const original = source('shared', statements('value', 10));
		const { dir, sha } = makeRepo(original, original);
		try {
			const swapped = source('replacement', statements('other', 10));
			writeSources(dir, swapped, swapped);
			const live = runGate(dir, sha);
			expect(live.code).toBe(1);
			expect(live.stderr).toContain('new clone pair');
			expect(live.stderr).toContain('will not clear this');

			execFileSync(process.execPath, [script, '--write'], {
				cwd: dir,
				stdio: ['ignore', 'pipe', 'pipe']
			});
			const rewritten = runGate(dir, sha);
			expect(rewritten.code).toBe(1);
			expect(rewritten.stderr).toContain('new clone pair');
			expect(rewritten.stderr).toContain('will not clear this');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('allows a pure shrink without a baseline commit and rejects a shorter swap', () => {
		const original = source('shared', statements('value', 12));
		const { dir, sha } = makeRepo(original, original);
		try {
			const shorter = source('shared', statements('value', 8));
			writeSources(dir, shorter, shorter);
			const shrink = runGate(dir, sha);
			expect(shrink.code).toBe(0);
			expect(shrink.stdout).toContain('1 clones');

			const swapped = source('replacement', statements('other', 8));
			writeSources(dir, swapped, swapped);
			execFileSync(process.execPath, [script, '--write'], {
				cwd: dir,
				stdio: ['ignore', 'pipe', 'pipe']
			});
			const laundered = runGate(dir, sha);
			expect(laundered.code).toBe(1);
			expect(laundered.stderr).toContain('new clone pair');
			expect(laundered.stderr).toContain('will not clear this');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('maps a pure rename and rejects a clone reused on the old path', () => {
		const original = source('shared', statements('value', 10));
		const { dir, sha } = makeRepo(original, original);
		try {
			git(dir, ['mv', 'src/left.ts', 'src/moved.ts']);
			const renamed = runGate(dir, sha);
			expect(renamed.code).toBe(0);
			expect(renamed.stdout).toContain('1 clones');

			const swapped = source('replacement', statements('other', 10));
			writeFileSync(path.join(dir, 'src/left.ts'), swapped);
			writeFileSync(path.join(dir, 'src/right.ts'), swapped);
			git(dir, ['add', 'src/left.ts', 'src/right.ts']);
			const reused = runGate(dir, sha);
			expect(reused.code).toBe(1);
			expect(reused.stderr).toContain('new clone pair');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('rejects a threshold other than the verify.sh pin', () => {
		const original = source('shared', statements('value', 10));
		const { dir, sha } = makeRepo(original, original);
		try {
			const env = runGate(dir, sha, undefined, { JSCPD_MIN_LINES: '100' });
			expect(env.code).toBe(1);
			expect(env.stderr).toContain('--min-lines is pinned to 8');

			const argv = runGate(dir, sha, undefined, {}, ['--min-tokens', '99999']);
			expect(argv.code).toBe(1);
			expect(argv.stderr).toContain('--min-tokens is pinned to 60');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('rejects an HTML-comment clone once comments are ignored', () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'jscpd-gate-'));
		try {
			git(dir, ['init', '-b', 'main']);
			mkdirSync(path.join(dir, 'src'), { recursive: true });
			mkdirSync(path.join(dir, 'eslint'), { recursive: true });
			const rows = Array.from({ length: 7 }, (_, index) => `<span>row ${index}</span>`).join('\n');
			const comment = `<!-- header > kept -->\n${rows}\n`;
			writeFileSync(path.join(dir, 'src/a.html'), `${comment}<footer>left</footer>\n`);
			writeFileSync(path.join(dir, 'src/b.html'), `${comment}<footer>right</footer>\n`);
			writeFileSync(
				path.join(dir, '.jscpd-baseline.json'),
				baselineText({
					'markup:src/a.html|src/b.html': { count: 1, lines: 9 }
				})
			);
			git(dir, ['add', '.']);
			git(dir, ['commit', '-m', 'base']);
			const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();
			const result = runGate(dir, sha);
			expect(result.code).toBe(1);
			expect(result.stderr).toContain('node scripts/jscpd-baseline.mjs --write');
			expect(result.stderr).toContain('markup:src/a.html|src/b.html');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('rejects a jscpd:ignore marker', () => {
		const original = source('shared', statements('value', 10));
		const { dir, sha } = makeRepo(original, original);
		try {
			const marked = `/* jscpd:ignore-start */\n${original}/* jscpd:ignore-end */\n`;
			writeSources(dir, marked, marked);
			writeFileSync(path.join(dir, '.jscpd-baseline.json'), baselineText({}));
			const result = runGate(dir, sha);
			expect(result.code).toBe(1);
			expect(result.stderr).toContain('jscpd:ignore is banned');
			expect(result.stderr).toContain('src/left.ts');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('allows a shifted clone and a shrink that starts at walkOwn', () => {
		const original = source('shared', statementsFrom('value', 0, 20));
		const { dir, sha } = makeRepo(original, original);
		try {
			const shifted = source('shared', statementsFrom('value', 4, 20));
			writeSources(dir, shifted, shifted);
			const shift = runGate(dir, sha);
			expect(shift.code).toBe(0);
			expect(shift.stdout).toContain('1 clones');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}

		const ancestor = walkOwnSource('value', 'kept0');
		const moved = makeRepo(ancestor, ancestor);
		try {
			writeSources(
				moved.dir,
				walkOwnSource('leftOnly', 'moved0'),
				walkOwnSource('rightOnly', 'moved0')
			);
			const deduped = runGate(moved.dir, moved.sha);
			expect(deduped.code).toBe(0);
			expect(deduped.stdout).toContain('1 clones');
		} finally {
			rmSync(moved.dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('allows the next commit after a shrink that did not rewrite the baseline', () => {
		const original = source('shared', statements('value', 12));
		const { dir, sha } = makeRepo(original, original);
		try {
			const shorter = source('shared', statements('value', 8));
			writeSources(dir, shorter, shorter);
			git(dir, ['add', '.']);
			git(dir, ['commit', '-m', 'shrink']);
			const sha2 = execFileSync('git', ['rev-parse', 'HEAD'], {
				cwd: dir,
				encoding: 'utf8'
			}).trim();
			expect(sha2).not.toBe(sha);
			const next = runGate(dir, sha2);
			expect(next.code).toBe(0);
			expect(next.stdout).toContain('1 clones');

			const regrown = source('shared', statements('value', 9));
			writeSources(dir, regrown, regrown);
			const grown = runGate(dir, sha2);
			expect(grown.code).toBe(1);
			expect(grown.stderr).toContain('new clone pair');
			expect(grown.stderr).toContain('typescript:src/left.ts|src/right.ts');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('rejects a committed markdown format config', () => {
		const original = source('shared', statements('value', 10));
		const { dir, sha } = makeRepo(original, original);
		try {
			writeFileSync(path.join(dir, '.jscpd.json'), '{"format":["markdown"]}\n');
			git(dir, ['add', '.jscpd.json']);
			git(dir, ['commit', '-m', 'format']);
			const written = runGate(dir, sha, undefined, {}, ['--write']);
			expect(written.code).toBe(1);
			expect(written.stderr).toContain('.jscpd.json hides clones');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('reports a sparse checkout without a stack trace', () => {
		const original = source('shared', statements('value', 10));
		const { dir, sha } = makeRepo(original, original);
		try {
			rmSync(path.join(dir, 'src/left.ts'));
			const result = runGate(dir, sha);
			expect(result.code).toBe(1);
			expect(result.stderr).toContain('not in the checkout');
			expect(result.stderr).toContain('src/left.ts');
			expect(result.stderr).not.toContain('spawnSync');
			expect(result.stderr).not.toContain('at scanRepo');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('scans an untracked file that gitignore does not list', () => {
		const original = source('shared', statements('value', 10));
		const { dir, sha } = makeRepo('export const left = 1;\n', 'export const right = 2;\n');
		try {
			writeFileSync(path.join(dir, 'src/extra-a.ts'), original);
			writeFileSync(path.join(dir, 'src/extra-b.ts'), original);
			writeFileSync(path.join(dir, 'src/secret.ts'), original);
			writeFileSync(path.join(dir, '.gitignore'), 'src/secret.ts\n');
			const result = runGate(dir, sha);
			expect(result.code).toBe(1);
			expect(result.stderr).toContain('src/extra-a.ts');
			expect(result.stderr).not.toContain('src/secret.ts');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('scans a force-added file that gitignore lists', () => {
		const original = source('shared', statements('value', 10));
		const { dir, sha } = makeRepo(original, original);
		try {
			writeFileSync(path.join(dir, '.gitignore'), 'src/hidden.ts\n');
			writeFileSync(path.join(dir, 'src/hidden.ts'), original);
			git(dir, ['add', '-f', '.gitignore', 'src/hidden.ts']);
			git(dir, ['commit', '-m', 'track hidden']);
			const result = runGate(dir, sha);
			expect(result.code).toBe(1);
			expect(result.stderr).toContain('src/hidden.ts');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('rejects a multiline HTML comment that hides a clone every 7 lines', () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'jscpd-gate-'));
		try {
			git(dir, ['init', '-b', 'main']);
			mkdirSync(path.join(dir, 'src'), { recursive: true });
			mkdirSync(path.join(dir, 'eslint'), { recursive: true });
			const page = (side: string) => {
				const lines: string[] = [];
				for (let block = 0; block < 4; block += 1) {
					lines.push(
						`<span class="row">shared token ${block}-0</span> <!-- ${side}only${block}aaa`
					);
					lines.push(`${side}only${block}bbb`);
					lines.push(`${side}only${block}ccc --> <span class="row">shared token ${block}-1</span>`);
					for (let row = 2; row < 7; row += 1) {
						lines.push(`<span class="row">shared token ${block}-${row}</span>`);
					}
				}
				return `${lines.join('\n')}\n`;
			};
			writeFileSync(path.join(dir, 'src/a.html'), page('left'));
			writeFileSync(path.join(dir, 'src/b.html'), page('right'));
			writeFileSync(path.join(dir, '.jscpd-baseline.json'), baselineText({}));
			git(dir, ['add', '.']);
			git(dir, ['commit', '-m', 'base']);
			const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();
			const hidden = runGate(dir, sha);
			expect(hidden.code).toBe(1);
			expect(hidden.stderr).toContain('new clone pair');
			expect(hidden.stderr).toContain('markup:src/a.html|src/b.html');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('rejects a clone that a root and a src .ignore file would hide', () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'jscpd-gate-'));
		try {
			git(dir, ['init', '-b', 'main']);
			mkdirSync(path.join(dir, 'src'), { recursive: true });
			mkdirSync(path.join(dir, 'eslint'), { recursive: true });
			writeFileSync(path.join(dir, 'src/keep.ts'), 'export const keep = 1;\n');
			writeFileSync(path.join(dir, '.jscpd-baseline.json'), baselineText({}));
			git(dir, ['add', '.']);
			git(dir, ['commit', '-m', 'base']);
			const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();
			const clone = source('shared', statements('value', 12));
			writeFileSync(path.join(dir, 'src/left.ts'), clone);
			writeFileSync(path.join(dir, 'src/right.ts'), clone);
			writeFileSync(path.join(dir, '.ignore'), 'src/right.ts\n');
			writeFileSync(path.join(dir, 'src/.ignore'), 'left.ts\n');
			git(dir, ['add', '.']);
			const hidden = runGate(dir, sha);
			expect(hidden.code).toBe(1);
			expect(hidden.stderr).toContain('new clone pair');
			expect(hidden.stderr).toContain('typescript:src/left.ts|src/right.ts');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('rejects about a 0.75 overlap and allows about 0.85', () => {
		const lines = Array.from(
			{ length: 20 },
			(_, index) => `const name${String(index).padStart(2, '0')} = ${index} + 1;`
		);
		const original = source('shared', lines);
		const { dir, sha } = makeRepo(original, original);
		try {
			const weak = renamePadded(original, 11);
			writeSources(dir, weak, weak);
			const low = runGate(dir, sha);
			expect(low.code).toBe(1);
			expect(low.stderr).toContain('0.8');
			expect(low.stderr).toContain('will not clear this');

			const close = renamePadded(original, 6);
			writeSources(dir, close, close);
			const high = runGate(dir, sha);
			expect(high.code).toBe(0);
			expect(high.stdout).toContain('1 clones');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('rejects a pair when only one of two clones is swapped', () => {
		const block = (name: string) => source(name, statements(name, 12));
		const separated = (side: string, second: string) =>
			`${block('alpha')}\n${statements(`${side}Gap`, 12).join('\n')}\n${block(second)}`;
		const { dir, sha } = makeRepo(separated('left', 'beta'), separated('right', 'beta'));
		try {
			const swapped = renameWords(separated('left', 'beta'), 'beta', 'gamma', 7);
			const swappedRight = renameWords(separated('right', 'beta'), 'beta', 'gamma', 7);
			writeSources(dir, swapped, swappedRight);
			const result = runGate(dir, sha);
			expect(result.code).toBe(1);
			expect(result.stderr).toContain('0.8');
			expect(result.stderr).toContain('will not clear this');
			expect(result.stderr).toContain('typescript:src/left.ts|src/right.ts');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('rejects a clone padded past the 1 MB default file limit', () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'jscpd-gate-'));
		try {
			git(dir, ['init', '-b', 'main']);
			mkdirSync(path.join(dir, 'src'), { recursive: true });
			mkdirSync(path.join(dir, 'eslint'), { recursive: true });
			writeFileSync(path.join(dir, 'src/keep.ts'), 'export const keep = 1;\n');
			writeFileSync(path.join(dir, '.jscpd-baseline.json'), baselineText({}));
			git(dir, ['add', '.']);
			git(dir, ['commit', '-m', 'base']);
			const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();
			const clone = source('shared', statements('value', 12));
			const pad = 'x'.repeat(1_200_000);
			writeFileSync(path.join(dir, 'src/left.ts'), `${clone}\nconst leftPad = "${pad}";\n`);
			writeFileSync(path.join(dir, 'src/right.ts'), `${clone}\nconst rightPad = "${pad}";\n`);
			git(dir, ['add', 'src/left.ts', 'src/right.ts']);
			const result = runGate(dir, sha);
			expect(result.code).toBe(1);
			expect(result.stderr).toContain('new clone pair');
			expect(result.stderr).toContain('typescript:src/left.ts|src/right.ts');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('regenerates the baseline from the live scan', () => {
		const original = source('shared', statements('value', 10));
		const { dir, sha } = makeRepo(original, original);
		try {
			writeFileSync(path.join(dir, '.jscpd-baseline.json'), baselineText({}));
			execFileSync(process.execPath, [script, '--write'], {
				cwd: dir,
				stdio: ['ignore', 'pipe', 'pipe']
			});
			expect(JSON.parse(readFileSync(path.join(dir, '.jscpd-baseline.json'), 'utf8'))).toEqual(
				JSON.parse(baselineText(scanRepo(dir)))
			);
			expect(runGate(dir, sha).code).toBe(0);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 60_000);

	it('rethrows jscpd stderr as the error message', () => {
		const configPath = path.resolve('scripts/jscpd-empty.json');
		const original = readFileSync(configPath, 'utf8');
		const dir = mkdtempSync(path.join(tmpdir(), 'jscpd-stderr-'));
		git(dir, ['init', '-b', 'main']);
		mkdirSync(path.join(dir, 'src'));
		writeFileSync(path.join(dir, 'src/a.ts'), 'export const value = 1;\n');
		git(dir, ['add', '.']);
		writeFileSync(configPath, '{ not json\n');
		const clean = [
			`Using config from ${configPath}`,
			`config file ${configPath} line 1: key must be a string at line 1 column 3`
		].join('\n');
		try {
			let thrown: unknown;
			try {
				scanRepo(dir);
			} catch (error) {
				thrown = error;
			}
			expect(thrown).toBeInstanceOf(Error);
			const error = thrown as Error;
			expect(error.message).toBe(clean);
			expect(error.message).not.toContain('Command failed:');
			expect(error.stack ?? '').not.toContain('node:child_process');
		} finally {
			writeFileSync(configPath, original);
			rmSync(dir, { recursive: true, force: true });
		}
	});
});
