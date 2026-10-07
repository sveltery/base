import { describe, expect, it } from 'vitest';
import { createChangeEventDetails, REASONS } from './event-details.js';

describe('createChangeEventDetails', () => {
	it('starts uncanceled and records cancel()', () => {
		const event = new Event('click');
		const details = createChangeEventDetails(REASONS.none, event);

		expect(details.reason).toBe('none');
		expect(details.event).toBe(event);
		expect(details.isCanceled).toBe(false);
		details.cancel();
		expect(details.isCanceled).toBe(true);
	});

	it('records allowPropagation() separately from cancel()', () => {
		const details = createChangeEventDetails(REASONS.none);

		details.allowPropagation();
		expect(details.isPropagationAllowed).toBe(true);
		expect(details.isCanceled).toBe(false);
	});

	it('creates a placeholder event when none is given', () => {
		expect(createChangeEventDetails(REASONS.none).event.type).toBe('base-ui');
	});
});
