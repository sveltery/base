import { describe, it, expect } from 'vitest';
import { referencePart } from './reference.ts';

const part = (description: string) =>
	referencePart({
		name: 'Popover.Root',
		description,
		props: [{ name: 'open', type: 'boolean', description, bindable: false, required: false }],
		state: [],
		dataAttributes: [{ key: 'open', name: 'data-open', description }],
		cssVariables: [],
		files: []
	});

describe('referencePart', () => {
	it('highlights the code spans in descriptions as page prose does', async () => {
		const reference = await part('Whether the popup is `null` or a `<button>`.');
		const code =
			'<code class="Code MdCode language-tsx" data-inline><span style="color:var(--color-docs-infra-syntax-nullish)">null</span></code> or a <code class="Code MdCode language-tsx" data-inline><span class="di-ht">&lt;<span style="color:var(--color-prettylights-syntax-entity-tag)">button</span>&gt;</span></code>';
		expect(reference.description).toBe(`<p class="MdP">Whether the popup is ${code}.</p>`);
		expect(reference.props[0].description).toBe(reference.description);
		expect(reference.dataAttributes[0].description).toBe(`Whether the popup is ${code}.`);
	});

	it('takes the language from a {:lang} suffix', async () => {
		const reference = await part('Set `color: red{:css}`.');
		expect(reference.description).toMatch(/<code class="Code MdCode language-css" data-inline>/);
	});
});
