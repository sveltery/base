import { describe, it, expect } from 'vitest';
import { concatHeadings } from './concat-headings.ts';
import { render } from './testing.ts';
import { slug } from './slug.ts';

const ids = async (markdown: string) =>
	[
		...(await render(markdown, { rehype: [slug, concatHeadings] })).html.matchAll(/id="([^"]+)"/g)
	].map((match) => match[1]);

describe('concatHeadings', () => {
	it('prefixes the h3 ids under a library on the Forms page', async () => {
		expect(
			await ids(
				'# Forms\n\n## Submitting data\n\n## TanStack Form\n\n### Submitting data\n\n## Superforms\n\n### Field validation\n'
			)
		).toEqual([
			'forms',
			'submitting-data',
			'tanstack-form',
			'tanstack-form-submitting-data',
			'superforms',
			'superforms-field-validation'
		]);
	});

	it('leaves other pages alone', async () => {
		expect(await ids('# Field\n\n## TanStack Form\n\n### Submitting data\n')).toEqual([
			'field',
			'tanstack-form',
			'submitting-data'
		]);
	});

	it('stops prefixing at the next h2', async () => {
		expect(await ids('# Forms\n\n## TanStack Form\n\n## Errors\n\n### Display\n')).toEqual([
			'forms',
			'tanstack-form',
			'errors',
			'display'
		]);
	});
});
