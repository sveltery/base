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
	const pairs = scanRepo(dir);
	const sha = commitRepo(dir, pairs);
	return { dir, sha };
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

	it('allows a remove-only baseline and rejects a baseline that grants more lines', () => {
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
			expect(granted.stderr).toContain('remove-only');
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
			expect(granted.stderr).toContain('remove-only');
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

			execFileSync(process.execPath, [script, '--write'], {
				cwd: dir,
				stdio: ['ignore', 'pipe', 'pipe']
			});
			const rewritten = runGate(dir, sha);
			expect(rewritten.code).toBe(1);
			expect(rewritten.stderr).toContain('new clone pair');
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
			const comment = ['<!--', ...statements('note', 12), '-->'].join('\n');
			writeFileSync(path.join(dir, 'src/a.html'), `${comment}\n<div>left</div>\n`);
			writeFileSync(path.join(dir, 'src/b.html'), `${comment}\n<div>right</div>\n`);
			writeFileSync(
				path.join(dir, '.jscpd-baseline.json'),
				baselineText({
					'markup:src/a.html|src/b.html': { count: 1, lines: 15 }
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
});
