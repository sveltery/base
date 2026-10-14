// Assertions follow Base UI v1.9.0 packages/react/src/autocomplete/root/AutocompleteRoot.test.tsx
// (the renderToString cases of "Form") and combobox/store.test.tsx ("keeps form value ownership
// across hydration") (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see
// THIRD_PARTY_NOTICES.md.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import AutocompleteHarness from '../../tests/AutocompleteHarness.svelte';

/** Every opening tag that carries `name="<name>"`. */
function named(body: string, name: string) {
	return [...body.matchAll(/<[a-z]+ [^>]*>/g)]
		.map(([tag]) => tag)
		.filter((tag) => tag.includes(` name="${name}"`));
}

describe('Autocomplete server render', () => {
	it('names only the input of an inline list', () => {
		const { body } = render(AutocompleteHarness, {
			props: { form: {}, field: { name: 'search' }, items: ['alpha', 'alpine'], inline: true }
		});

		const tags = named(body, 'search');
		expect(tags).toHaveLength(1);
		expect(tags[0]).toContain('data-testid="input"');
	});

	it('names only the input outside the popup', () => {
		const { body } = render(AutocompleteHarness, {
			props: {
				form: {},
				field: { name: 'search' },
				items: ['alpha', 'alpine'],
				inputGroup: true,
				trigger: true
			}
		});

		const tags = named(body, 'search');
		expect(tags).toHaveLength(1);
		expect(tags[0]).toContain('data-testid="input"');
		expect(tags[0]).toContain('role="combobox"');
	});

	it('renders no named input for a closed popup input before hydration', () => {
		const { body } = render(AutocompleteHarness, {
			props: {
				form: {},
				field: { name: 'search' },
				items: ['alpha', 'alpine'],
				inputInside: true,
				fieldAwareInput: true,
				root: { defaultValue: 'alpha' }
			}
		});

		expect(named(body, 'search')).toHaveLength(0);
		expect(body).not.toContain('data-testid="input"');
	});

	it('sets combobox attributes on the input and the mode on aria-autocomplete', () => {
		const { body } = render(AutocompleteHarness, { props: { root: { mode: 'both' } } });
		const input = body.match(/<input [^>]*data-testid="input"[^>]*>/)?.[0] ?? '';

		expect(input).toContain('role="combobox"');
		expect(input).toContain('aria-expanded="false"');
		expect(input).toContain('aria-autocomplete="both"');
	});
});
