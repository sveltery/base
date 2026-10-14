// Assertions follow Base UI v1.9.0 packages/react/src/combobox/root/ComboboxRoot.test.tsx
// ("server-side rendering") and items/createItems.test.tsx ("resolves a server-rendered
// defaultValue label from the external window") (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { Combobox } from '#lib';
import ComboboxHarness from '../../tests/ComboboxHarness.svelte';
import ComboboxItemsHarness from '../../tests/ComboboxItemsHarness.svelte';

/** The attributes of the element with this test id. */
function attributes(body: string, testId: string): Record<string, string> {
	const tag = body.match(new RegExp(`<[a-z]+ [^>]*data-testid="${testId}"[^>]*>`))?.[0] ?? '';
	return Object.fromEntries(
		[...tag.matchAll(/([\w-]+)(?:="([^"]*)")?/g)]
			.slice(1)
			.map(([, name, value]) => [name, value ?? ''])
	);
}

describe('Combobox server render', () => {
	it('sets combobox aria attributes on the input', () => {
		const { body } = render(ComboboxHarness, { props: {} });
		const input = attributes(body, 'input');

		expect(input.role).toBe('combobox');
		expect(input['aria-expanded']).toBe('false');
		expect(input['aria-autocomplete']).toBe('list');
		expect(input['aria-haspopup']).toBe('listbox');
	});

	it('sets combobox aria attributes on the trigger when the input is inside the popup', () => {
		const { body } = render(ComboboxHarness, { props: { noInput: true, trigger: true } });
		const trigger = attributes(body, 'trigger');

		expect(trigger.role).toBe('combobox');
		expect(trigger['aria-expanded']).toBe('false');
		expect(trigger['aria-haspopup']).toBe('dialog');
	});

	it('does not link Combobox.Label to the trigger before hydration', () => {
		const { body } = render(ComboboxHarness, {
			props: { inline: true, label: 'Food', trigger: true }
		});

		expect(attributes(body, 'label').id).toBeTruthy();
		expect(attributes(body, 'trigger').id).toBeTruthy();
		expect(attributes(body, 'trigger')).not.toHaveProperty('aria-labelledby');
	});

	it('resolves a server-rendered defaultValue label from the external window', () => {
		const people = Combobox.createItems([] as { id: string; name: string }[], {
			getValue: (person) => person.id,
			getLabel: (person) => person.name
		});
		const { body } = render(ComboboxItemsHarness, {
			props: {
				collection: people,
				list: 'none',
				root: { filteredItems: [{ id: 'user-1', name: 'Alice' }], defaultValue: 'user-1' }
			}
		});

		expect(attributes(body, 'input').value).toBe('Alice');
	});
});
