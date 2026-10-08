import { describe, expect, it } from 'vitest';
import { anchorAutoUpdateOptions } from './useAnchorPositioning.svelte.js';

describe('anchor tracking', () => {
	it('leaves ancestorResize on when tracking is disabled', () => {
		const tracking = anchorAutoUpdateOptions(true);
		expect(tracking.ancestorScroll).toBe(false);
		expect(tracking.elementResize).toBe(false);
		expect(tracking.layoutShift).toBe(false);
		expect(tracking.ancestorResize).toBeUndefined();
		expect({ ancestorResize: true, ...tracking }.ancestorResize).toBe(true);
	});

	it('tracks anchor movement when tracking is enabled', () => {
		const tracking = anchorAutoUpdateOptions(false);
		expect(tracking.ancestorScroll).toBe(true);
		expect(tracking.ancestorResize).toBeUndefined();
	});
});
