import { describe, it, expect } from 'vitest';
import { excludeHeading } from './exclude-heading.ts';
import { render } from './testing.ts';

const html = async (markdown: string) =>
	(await render(markdown, { remark: [excludeHeading] })).html;

describe('excludeHeading', () => {
	it('marks the heading right after the marker', async () => {
		expect(
			await html("## API\n\n[//]: # '@exclude-table-of-contents'\n\n### Handle\n\n### Close\n")
		).toBe('<h2>API</h2>\n<h3 data-exclude-toc>Handle</h3>\n<h3>Close</h3>');
	});

	it('ignores another comment and a marker before a paragraph', async () => {
		expect(
			await html("[//]: # 'A note'\n\n## API\n\n[//]: # '@exclude-table-of-contents'\n\nText\n")
		).toBe('<h2>API</h2>\n<p>Text</p>');
	});
});
