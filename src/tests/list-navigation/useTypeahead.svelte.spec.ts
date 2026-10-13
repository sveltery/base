// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/hooks/useTypeahead.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import TypeaheadHarness from './TypeaheadHarness.svelte';

beforeEach(() => {
	vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

const combobox = () => page.getByRole('combobox');
const matches = (spy: ReturnType<typeof vi.fn>) => spy.mock.calls.map(([index]) => index);

describe('Typeahead', () => {
	it('passes the matching keydown event to onMatch', async () => {
		const onMatch = vi.fn();
		render(TypeaheadHarness, { onMatch });

		await userEvent.click(combobox());
		await userEvent.keyboard('t');

		expect(onMatch).toHaveBeenCalledTimes(1);
		const [index, event] = onMatch.mock.lastCall as [number, KeyboardEvent];
		expect(index).toBe(1);
		expect(event.type).toBe('keydown');
		expect(event.key).toBe('t');
	});

	it('rapidly focuses list items when they start with the same letter', async () => {
		const onMatch = vi.fn();
		render(TypeaheadHarness, { onMatch });

		await userEvent.click(combobox());

		await userEvent.keyboard('t');
		await userEvent.keyboard('t');
		await userEvent.keyboard('t');
		expect(matches(onMatch)).toEqual([1, 2, 1]);
	});

	it('bails out of rapid focus of first letter if the list contains a string that starts with two of the same letter', async () => {
		const onMatch = vi.fn();
		render(TypeaheadHarness, { onMatch, list: ['apple', 'aaron', 'apricot'] });

		await userEvent.click(combobox());

		await userEvent.keyboard('a');
		await userEvent.keyboard('a');
		// "aaron" blocks first-letter cycling, so the second key extends the string to "aa".
		expect(matches(onMatch)).toEqual([0, 1]);
	});

	it('starts from the current activeIndex and correctly loops', async () => {
		const onMatch = vi.fn();
		render(TypeaheadHarness, { onMatch, list: ['Toy Story 2', 'Toy Story 3', 'Toy Story 4'] });

		await userEvent.click(combobox());

		await userEvent.keyboard('toy');
		expect(matches(onMatch)).toEqual([0, 0, 0]);

		onMatch.mockReset();
		await userEvent.keyboard('toy');
		expect(matches(onMatch)).toEqual([]);

		vi.advanceTimersByTime(750);
		await userEvent.keyboard('toy');
		expect(matches(onMatch)).toEqual([1, 1, 1]);

		onMatch.mockReset();
		vi.advanceTimersByTime(750);
		await userEvent.keyboard('toy');
		expect(matches(onMatch)).toEqual([2, 2, 2]);

		onMatch.mockReset();
		vi.advanceTimersByTime(750);
		await userEvent.keyboard('toy');
		expect(matches(onMatch)).toEqual([0, 0, 0]);
	});

	it('capslock characters continue to match', async () => {
		const onMatch = vi.fn();
		render(TypeaheadHarness, { onMatch });

		await userEvent.click(combobox());
		await userEvent.keyboard('T');
		expect(matches(onMatch)).toEqual([1]);
	});

	it('does not depend on locale-sensitive lowercasing', async () => {
		const toLocaleLowerCase = String.prototype.toLocaleLowerCase;
		vi.spyOn(String.prototype, 'toLocaleLowerCase').mockImplementation(
			function lowerWithTurkishLocale(this: string) {
				return toLocaleLowerCase.call(this, 'tr');
			}
		);

		const onMatch = vi.fn();
		render(TypeaheadHarness, { onMatch, list: ['Istanbul'] });

		await userEvent.click(combobox());
		await userEvent.keyboard('i');
		expect(matches(onMatch)).toEqual([0]);
	});

	it('matches when focus is within reference', async () => {
		const onMatch = vi.fn();
		render(TypeaheadHarness, { onMatch, variant: 'within' });

		await userEvent.click(combobox());
		expect(document.activeElement?.tagName).toBe('INPUT');

		await userEvent.keyboard('t');
		expect(matches(onMatch)).toEqual([1]);
	});

	it('matches when focus is within floating', async () => {
		const onMatch = vi.fn();
		render(TypeaheadHarness, { onMatch, variant: 'within' });

		await userEvent.click(combobox());

		await userEvent.keyboard('t');
		const option = page.getByRole('option', { selected: true });
		await expect.element(option).toHaveTextContent('two');
		(option.element() as HTMLElement).focus();
		await expect.element(option).toHaveFocus();

		await userEvent.keyboard('h');
		await expect.element(page.getByRole('option', { selected: true })).toHaveTextContent('three');
	});

	it('onTyping is called with typing activity', async () => {
		const onTyping = vi.fn();
		render(TypeaheadHarness, { onTyping });

		(combobox().element() as HTMLElement).focus();

		await userEvent.keyboard('t');
		expect(onTyping.mock.calls).toEqual([[true]]);

		vi.advanceTimersByTime(750);
		expect(onTyping.mock.calls).toEqual([[true], [false]]);
	});

	it('onTyping is called when the popup closes without moving focus', async () => {
		const onTyping = vi.fn();
		const { rerender } = render(TypeaheadHarness, { open: true, onTyping });

		expect(onTyping.mock.calls).toEqual([]);

		(combobox().element() as HTMLElement).focus();
		await userEvent.keyboard('t');
		expect(onTyping.mock.calls).toEqual([[true]]);

		await rerender({ open: false, onTyping });
		flushSync();
		expect(onTyping.mock.calls).toEqual([[true], [false]]);

		vi.advanceTimersByTime(750);
		expect(onTyping.mock.calls).toEqual([[true], [false]]);

		await rerender({ open: true, onTyping });
		flushSync();
		expect(onTyping.mock.calls).toEqual([[true], [false]]);
	});

	it('skips hidden items when matching with elements', async () => {
		const onMatch = vi.fn();
		render(TypeaheadHarness, {
			onMatch,
			variant: 'elements',
			list: ['apple', 'apricot', 'banana'],
			hiddenIndices: [0]
		});

		await userEvent.click(combobox());
		await userEvent.keyboard('a');
		expect(matches(onMatch)).toEqual([1]);
	});

	it('does not let hidden double-letter items block rapid cycling with elements', async () => {
		const onMatch = vi.fn();
		render(TypeaheadHarness, {
			onMatch,
			variant: 'elements',
			list: ['aaron', 'apple', 'avocado'],
			hiddenIndices: [0]
		});

		await userEvent.click(combobox());
		await userEvent.keyboard('a');
		await userEvent.keyboard('a');
		expect(matches(onMatch)).toEqual([1, 2]);
	});

	it('skips visibility:hidden items when matching with elements', async () => {
		const onMatch = vi.fn();
		render(TypeaheadHarness, {
			onMatch,
			variant: 'elements',
			list: ['apple', 'apricot', 'banana']
		});

		(page.getByRole('option', { name: 'apple' }).element() as HTMLElement).style.visibility =
			'hidden';

		await userEvent.click(combobox());
		await userEvent.keyboard('a');
		expect(matches(onMatch)).toEqual([1]);
	});

	it('skips disabledIndices without elements', async () => {
		const onMatch = vi.fn();
		render(TypeaheadHarness, { onMatch, disabledIndices: [1] });

		await userEvent.click(combobox());
		await userEvent.keyboard('t');
		expect(matches(onMatch)).toEqual([2]);
	});
});
