// Ported from Sveltery UI tests/dom/command-ssr.test.ts (main d3a0bd0), which tests cmdk 1.1.1 behavior.
// MIT, see THIRD_PARTY_NOTICES.md.
import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { render } from 'svelte/server';
import CommandHarness from '../../tests/CommandHarness.svelte';

function serverRender(props: Record<string, unknown> = {}) {
	const { body } = render(CommandHarness, { props });
	return new JSDOM(body).window.document;
}

describe('Command server rendering', () => {
	it('renders every option unfiltered and unselected, with the ARIA wiring', () => {
		const document = serverRender({ search: 'c', value: 'Carrot' });
		const options = [...document.querySelectorAll<HTMLElement>('[cmdk-item]')];
		const input = document.querySelector<HTMLInputElement>('[cmdk-input]')!;
		const list = document.querySelector('[cmdk-list]')!;
		const label = document.querySelector('[cmdk-label]')!;

		expect(options.map((option) => option.dataset.testid)).toEqual([
			'apple',
			'banana',
			'pineapple',
			'carrot',
			'cabbage',
			'asparagus',
			'settings'
		]);
		expect(options.map((option) => option.getAttribute('role'))).toEqual(Array(7).fill('option'));
		expect(options.map((option) => option.hidden)).toEqual(Array(7).fill(false));
		expect(options.map((option) => option.getAttribute('style'))).toEqual(Array(7).fill(null));
		expect(options.map((option) => option.getAttribute('aria-selected'))).toEqual(
			Array(7).fill('false')
		);
		expect(options.map((option) => option.dataset.value)).toEqual([
			undefined,
			undefined,
			'pineapple',
			undefined,
			undefined,
			undefined,
			undefined
		]);
		expect(document.querySelector('[data-testid="cabbage"]')!.getAttribute('aria-disabled')).toBe(
			'true'
		);
		expect(input.value).toBe('c');
		expect(input.getAttribute('role')).toBe('combobox');
		expect(input.getAttribute('aria-controls')).toBe(list.id);
		expect(input.getAttribute('aria-labelledby')).toBe(label.id);
		expect(input.hasAttribute('aria-activedescendant')).toBe(false);
		expect(label.textContent).toBe('Command menu');
		expect(list.getAttribute('role')).toBe('listbox');
		expect(document.querySelector('[cmdk-group-items]')!.getAttribute('aria-labelledby')).toBe(
			document.querySelector('[cmdk-group-heading]')!.id
		);
		expect(document.querySelector('[cmdk-empty]')).toBe(null);
		expect(document.querySelector('[cmdk-separator]')).toBe(null);
		expect(document.querySelector('[data-testid="state"]')!.textContent).toBe('c|Carrot|0|');
	});

	it('renders the separator without a search', () => {
		const document = serverRender();
		expect(document.querySelector('[cmdk-separator]')!.getAttribute('role')).toBe('separator');
	});
});
