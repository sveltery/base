import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { headingTags } from './heading-tags.ts';
import { render } from './testing.ts';

const html = async (markdown: string) => (await render(markdown, { remark: [headingTags] })).html;

describe('headingTags', () => {
	it('moves a trailing Preview tag onto a data attribute', async () => {
		assert.equal(
			await html('### FilterProvider [Preview]\n'),
			'<h3 data-heading-badge="Preview">FilterProvider</h3>'
		);
	});

	it('lifts only the last trailing tag', async () => {
		assert.equal(
			await html('### Chip [New] [Preview]\n'),
			'<h3 data-heading-badge="Preview">Chip [New]</h3>'
		);
	});

	it('leaves brackets that are not a trailing tag in the heading text', async () => {
		assert.equal(
			await html('### Use [value]\n\n### Already [Preview] inside\n'),
			'<h3>Use [value]</h3>\n<h3>Already [Preview] inside</h3>'
		);
	});

	it('strips a tag that follows other inline content', async () => {
		assert.equal(
			await html('### **FilterProvider** [Preview]\n'),
			'<h3 data-heading-badge="Preview"><strong>FilterProvider</strong></h3>'
		);
	});

	it('does not strip a heading that is only a tag', async () => {
		assert.equal(await html('### [Preview]\n'), '<h3>[Preview]</h3>');
	});

	it('keeps a tag that is a link to a definition', async () => {
		assert.equal(
			await html('### Read [New]\n\n[New]: /new\n'),
			'<h3>Read <a href="/new">New</a></h3>'
		);
	});
});
