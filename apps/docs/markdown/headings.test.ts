import { describe, it, expect } from 'vitest';
import { excludeHeading } from './exclude-heading.ts';
import { headingTags } from './heading-tags.ts';
import { elements, headings } from './headings.ts';
import { slug } from './slug.ts';
import { render } from './testing.ts';

const page = (markdown: string) =>
	render(markdown, { remark: [headingTags, excludeHeading, elements], rehype: [slug, headings] });

describe('headings', () => {
	it('links h2 and h3 to themselves and renders the badge inside the link', async () => {
		const { html } = await page(
			'# Menu\n\n## Examples\n\n### Filtering [Preview]\n\n#### Matching\n'
		);
		expect(html).toBe(
			[
				'<h1 class="MdH1" id="menu">Menu</h1>',
				'<h2 class="MdH2" id="examples"><a href="#examples" class="HeadingLink">Examples</a></h2>',
				'<h3 class="MdH3" id="filtering"><a href="#filtering" class="HeadingLink">Filtering<span class="MdHeadingBadge">Preview</span></a></h3>',
				'<h4 class="MdH4" id="matching">Matching</h4>'
			].join('\n')
		);
	});

	it('lists the h2 and h3 in the toc, without the badge', async () => {
		const { data } = await page(
			'# Menu\n\n## Examples\n\n### Filtering [Preview]\n\n#### Matching\n'
		);
		expect((data.fm as { toc: unknown }).toc).toEqual([
			{ title: 'Examples', url: '#examples', depth: 2 },
			{ title: 'Filtering', url: '#filtering', depth: 3 }
		]);
	});

	it('keeps an excluded heading and its subheadings out of the toc', async () => {
		const { data } = await page(
			"# Dialog\n\n## API\n\n[//]: # '@exclude-table-of-contents'\n\n## Handle\n\n### open\n\n## Close\n"
		);
		expect((data.fm as { toc: unknown }).toc).toEqual([
			{ title: 'API', url: '#api', depth: 2 },
			{ title: 'Close', url: '#close', depth: 2 }
		]);
	});

	it('does not nest a link in a heading that has one', async () => {
		const { html } = await page('# T\n\n## See [Field](/field)\n');
		expect(html).toMatch(
			/<h2 class="MdH2" id="see-field">See <a href="\/field" class="Link">Field<\/a><\/h2>/
		);
	});
});
