import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { excludeHeading } from './exclude-heading.ts';
import { render } from './testing.ts';

const html = async (markdown: string) =>
	(await render(markdown, { remark: [excludeHeading] })).html;

describe('excludeHeading', () => {
	it('marks the heading right after the marker', async () => {
		assert.equal(
			await html("## API\n\n[//]: # '@exclude-table-of-contents'\n\n### Handle\n\n### Close\n"),
			'<h2>API</h2>\n<h3 data-exclude-toc>Handle</h3>\n<h3>Close</h3>'
		);
	});

	it('ignores another comment and a marker before a paragraph', async () => {
		assert.equal(
			await html("[//]: # 'A note'\n\n## API\n\n[//]: # '@exclude-table-of-contents'\n\nText\n"),
			'<h2>API</h2>\n<p>Text</p>'
		);
	});
});
