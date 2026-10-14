import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { matchesFocusVisible } from './focus-visible.js';

describe('matchesFocusVisible', () => {
	it('counts a missing element as visible', () => {
		expect(matchesFocusVisible(null)).toBe(true);
	});

	it('matches a control focused from the keyboard and not an unfocused one', async () => {
		const first = document.body.appendChild(document.createElement('button'));
		const second = document.body.appendChild(document.createElement('button'));
		first.focus();
		await userEvent.keyboard('{Tab}');
		expect([document.activeElement === second, matchesFocusVisible(second)]).toEqual([true, true]);
		expect(matchesFocusVisible(first)).toBe(false);
		first.remove();
		second.remove();
	});
});
