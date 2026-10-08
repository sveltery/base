import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	addedPairs,
	baseRevision,
	CEILING,
	clonePairKey,
	pairTotal
} from '../../../scripts/jscpd-baseline.mjs';

describe('jscpd baseline', () => {
	it('stays at or under the duplicate-check ceiling', () => {
		const baseline = JSON.parse(
			readFileSync(new URL('../../../.jscpd-baseline.json', import.meta.url), 'utf8')
		) as { version: number; pairs: Record<string, number> };

		expect(baseline.version).toBe(2);
		expect(pairTotal(baseline.pairs)).toBeLessThanOrEqual(CEILING);
	});

	it('treats an unset, empty, or all-zero base as missing', () => {
		expect(baseRevision({})).toBeNull();
		expect(baseRevision({ JSCPD_BASE_SHA: '' })).toBeNull();
		expect(baseRevision({ JSCPD_BASE_SHA: '   ' })).toBeNull();
		expect(baseRevision({ JSCPD_BASE_SHA: '0000000' })).toBeNull();
		expect(baseRevision({ JSCPD_BASE_SHA: 'origin/main' })).toBe('origin/main');
	});

	it('allows a lower count and rejects a new or larger pair', () => {
		const allowed = { 'html:src/a.svelte|src/b.svelte': 1, 'typescript:src/a.ts|src/b.ts': 2 };
		expect(addedPairs(allowed, { 'html:src/a.svelte|src/b.svelte': 1 })).toEqual([]);
		expect(addedPairs(allowed, {})).toEqual([]);
		expect(addedPairs(allowed, { 'typescript:src/a.ts|src/b.ts': 1 })).toEqual([]);
		expect(addedPairs(allowed, { 'html:src/a.svelte|src/b.svelte': 2 })).toEqual([
			'html:src/a.svelte|src/b.svelte'
		]);
		expect(addedPairs(allowed, { 'html:src/a.svelte|src/c.svelte': 1 })).toEqual([
			'html:src/a.svelte|src/c.svelte'
		]);
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
});
