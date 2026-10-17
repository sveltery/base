import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { HastNode } from './headings.ts';
import { slug, stringToUrl } from './slug.ts';

const heading = (depth: number, text: string): HastNode => ({
	type: 'element',
	tagName: `h${depth}`,
	properties: {},
	children: [{ type: 'text', value: text }]
});

function slugIds(children: HastNode[], options?: { prefix?: string }) {
	const tree = { type: 'root', children };
	slug(options)(tree);
	return tree.children.map((node) => node.properties!.id);
}

describe('slug', () => {
	it('adds a slug id to a heading', () => {
		assert.deepEqual(slugIds([heading(2, 'Getting started')]), ['getting-started']);
	});

	it('suffixes repeated heading text so ids stay unique', () => {
		assert.deepEqual(slugIds([heading(2, 'Props'), heading(3, 'Props'), heading(3, 'Props')]), [
			'props',
			'props-1',
			'props-2'
		]);
	});

	it('does not collide when later heading text matches an already-suffixed slug', () => {
		assert.deepEqual(slugIds([heading(2, 'Props'), heading(2, 'Props'), heading(2, 'Props 1')]), [
			'props',
			'props-1',
			'props-1-1'
		]);
	});

	it('applies the prefix before deduplicating', () => {
		assert.deepEqual(slugIds([heading(2, 'Props'), heading(2, 'Props')], { prefix: 'api-' }), [
			'api-props',
			'api-props-1'
		]);
	});

	it('leaves a heading that already has an id untouched', () => {
		const custom = heading(2, 'Props');
		custom.properties!.id = 'custom-id';
		assert.deepEqual(slugIds([custom]), ['custom-id']);
	});

	it('suffixes a later heading that collides with a pre-existing id', () => {
		const explicit = heading(2, 'Something');
		explicit.properties!.id = 'props';
		assert.deepEqual(slugIds([explicit, heading(2, 'Props')]), ['props', 'props-1']);
	});

	it('ignores non-heading elements', () => {
		const paragraph: HastNode = { type: 'element', tagName: 'p', properties: {}, children: [] };
		slug()({ type: 'root', children: [paragraph] });
		assert.equal(paragraph.properties!.id, undefined);
	});

	it('reads the text mdsvex escaped', () => {
		assert.deepEqual(slugIds([heading(2, '&lt;Field.Root&gt; and &#123;value&#125;')]), [
			'field-root-and-value'
		]);
	});
});

describe('stringToUrl', () => {
	it('kebab-cases and strips punctuation', () => {
		assert.equal(
			stringToUrl('1. Here’s a wicked example & more.'),
			'1-here-is-a-wicked-example-and-more'
		);
	});

	it('expands common contractions', () => {
		assert.equal(stringToUrl("you'll won't stop"), 'you-will-will-not-stop');
	});
});
