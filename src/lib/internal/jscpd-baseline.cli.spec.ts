import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
	const sorted = Object.fromEntries(Object.entries(pairs).sort(([a], [b]) => a.localeCompare(b)));
	return `${JSON.stringify({ version: 3, pairs: sorted }, null, '\t')}\n`;
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

function runGate(cwd: string, sha: string | null) {
	const launch =
		sha == null
			? ['-u', 'JSCPD_BASE_SHA', process.execPath, script]
			: [`JSCPD_BASE_SHA=${sha}`, process.execPath, script];
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
});
