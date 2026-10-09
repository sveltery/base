import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	baseRevision,
	clonePairKey,
	pairTotal,
	toRepoPath
} from '../../../scripts/jscpd-baseline.mjs';

describe('jscpd baseline', () => {
	it('records a count and a line total for every allowed pair', () => {
		const baseline = JSON.parse(
			readFileSync(new URL('../../../.jscpd-baseline.json', import.meta.url), 'utf8')
		) as { version: number; pairs: Record<string, { count: number; lines: number }> };

		expect(baseline.version).toBe(3);
		expect(pairTotal(baseline.pairs)).toBeGreaterThan(0);
		for (const stat of Object.values(baseline.pairs)) {
			expect(stat.count).toBeGreaterThan(0);
			expect(stat.lines).toBeGreaterThanOrEqual(8);
		}
	});

	it('treats an unset, empty, or all-zero base as missing', () => {
		expect(baseRevision({})).toBeNull();
		expect(baseRevision({ JSCPD_BASE_SHA: '' })).toBeNull();
		expect(baseRevision({ JSCPD_BASE_SHA: '   ' })).toBeNull();
		expect(baseRevision({ JSCPD_BASE_SHA: '0000000' })).toBeNull();
		expect(baseRevision({ JSCPD_BASE_SHA: 'origin/main' })).toBe('origin/main');
	});

	it('keys a clone by format and file pair, independent of side order', () => {
		const resolve = (name: string) => name;
		expect(clonePairKey('html', 'src/b.svelte', 'src/a.svelte', resolve)).toBe(
			'html:src/a.svelte|src/b.svelte'
		);
		expect(clonePairKey('html', 'src/a.svelte:html', 'src/b.svelte:html', resolve)).toBe(
			'html:src/a.svelte|src/b.svelte'
		);
	});

	it('keeps eslint and src paths distinct', () => {
		expect(toRepoPath('/repo/eslint/lib/radio/attributes.ts', '/repo')).toBe(
			'eslint/lib/radio/attributes.ts'
		);
		expect(toRepoPath('/repo/src/lib/radio/attributes.ts', '/repo')).toBe(
			'src/lib/radio/attributes.ts'
		);
	});
});
