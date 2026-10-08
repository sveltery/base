import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { addedFingerprints, CEILING } from '../../../scripts/jscpd-baseline.mjs';

describe('jscpd baseline', () => {
	it('stays at or under the duplicate-check ceiling', () => {
		const baseline = JSON.parse(
			readFileSync(new URL('../../../.jscpd-baseline.json', import.meta.url), 'utf8')
		) as { fingerprints: Record<string, number> };

		expect(Object.keys(baseline.fingerprints).length).toBeLessThanOrEqual(CEILING);
	});

	it('allows removals and rejects an added fingerprint', () => {
		const base = { fingerprints: { kept: 1, dropped: 1 } };
		expect(addedFingerprints(base, { fingerprints: { kept: 1 } })).toEqual([]);
		expect(addedFingerprints(base, { fingerprints: { kept: 1, added: 1 } })).toEqual(['added']);
	});
});
